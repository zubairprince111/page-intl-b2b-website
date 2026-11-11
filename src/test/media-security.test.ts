import { afterAll, beforeAll, describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { serveUploadedFile } from "@/lib/uploads.server";
import { validateMediaMagicBytes } from "@/lib/media-magic";

describe("Media Storage Magic Bytes Security Verification", () => {
  it("authenticates valid JPEG magic bytes", () => {
    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
    expect(validateMediaMagicBytes(jpegBuffer)).toBe("image/jpeg");
  });

  it("authenticates valid PNG magic bytes", () => {
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(validateMediaMagicBytes(pngBuffer)).toBe("image/png");
  });

  it("authenticates valid GIF magic bytes", () => {
    const gifBuffer = Buffer.from("GIF89a\x01\x00\x01\x00");
    expect(validateMediaMagicBytes(gifBuffer)).toBe("image/gif");
  });

  it("authenticates valid PDF magic bytes", () => {
    const pdfBuffer = Buffer.from("%PDF-1.4\n%âãÏÓ");
    expect(validateMediaMagicBytes(pdfBuffer)).toBe("application/pdf");
  });

  it("authenticates valid MP4 and WebM magic bytes", () => {
    const mp4Buffer = Buffer.from([
      0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d,
    ]);
    expect(validateMediaMagicBytes(mp4Buffer)).toBe("video/mp4");

    const webmHeader = Buffer.concat([
      Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42, 0x82, 0x84]),
      Buffer.from("webm\x42\x87\x81\x02"),
    ]);
    expect(validateMediaMagicBytes(webmHeader)).toBe("video/webm");
  });

  it("rejects malicious executable masked as image or video", () => {
    // PHP script disguised with a PNG/MP4 name
    const spoofedBuffer = Buffer.from("<?php system($_GET['cmd']); ?>");
    expect(() => validateMediaMagicBytes(spoofedBuffer)).toThrow("Invalid file content");
  });
});

describe("Dynamic /uploads/* Media Serving & Byte-Range Video Streaming", () => {
  let tmpRoot: string;
  let uploadsDir: string;
  const samplePng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x01]);
  const sampleMp4 = Buffer.from([
    0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x02, 0x00,
  ]);

  beforeAll(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "page-uploads-test-"));
    uploadsDir = path.join(tmpRoot, "uploads");
    fs.mkdirSync(path.join(uploadsDir, "products"), { recursive: true });
    fs.mkdirSync(path.join(uploadsDir, "banners"), { recursive: true });
    fs.writeFileSync(path.join(uploadsDir, "products", "test-item.png"), samplePng);
    fs.writeFileSync(path.join(uploadsDir, "products", "bad-script.svg"), "<svg/>");
    fs.writeFileSync(path.join(uploadsDir, "banners", "shop-banner.mp4"), sampleMp4);
    fs.writeFileSync(path.join(tmpRoot, "secret.png"), samplePng);
  });

  afterAll(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it("returns null for non-upload paths or non-GET/HEAD methods", async () => {
    const shopReq = new Request("http://localhost:8080/shop");
    expect(await serveUploadedFile(shopReq, new URL(shopReq.url), uploadsDir)).toBeNull();

    const postReq = new Request("http://localhost:8080/uploads/products/test-item.png", {
      method: "POST",
    });
    expect(await serveUploadedFile(postReq, new URL(postReq.url), uploadsDir)).toBeNull();
  });

  it("serves newly written PNG images dynamically with image/png headers and ETag 304 support", async () => {
    const url = new URL("http://localhost:8080/uploads/products/test-item.png");
    const getRes = await serveUploadedFile(new Request(url), url, uploadsDir);
    expect(getRes).not.toBeNull();
    expect(getRes!.status).toBe(200);
    expect(getRes!.headers.get("content-type")).toBe("image/png");
    expect(getRes!.headers.get("accept-ranges")).toBe("bytes");
    expect(getRes!.headers.get("x-content-type-options")).toBe("nosniff");
    expect(Number(getRes!.headers.get("content-length"))).toBe(samplePng.length);
    const body = Buffer.from(await getRes!.arrayBuffer());
    expect(body.equals(samplePng)).toBe(true);

    const headRes = await serveUploadedFile(new Request(url, { method: "HEAD" }), url, uploadsDir);
    expect(headRes!.status).toBe(200);
    expect((await headRes!.arrayBuffer()).byteLength).toBe(0);

    const etag = getRes!.headers.get("etag")!;
    const notModRes = await serveUploadedFile(
      new Request(url, { headers: { "if-none-match": etag } }),
      url,
      uploadsDir,
    );
    expect(notModRes!.status).toBe(304);
  });

  it("serves uploaded MP4 videos with 206 Partial Content byte-range support", async () => {
    const url = new URL("http://localhost:8080/uploads/banners/shop-banner.mp4");

    const rangeRes = await serveUploadedFile(
      new Request(url, { headers: { range: "bytes=0-7" } }),
      url,
      uploadsDir,
    );
    expect(rangeRes).not.toBeNull();
    expect(rangeRes!.status).toBe(206);
    expect(rangeRes!.headers.get("content-type")).toBe("video/mp4");
    expect(rangeRes!.headers.get("accept-ranges")).toBe("bytes");
    expect(rangeRes!.headers.get("content-range")).toBe(`bytes 0-7/${sampleMp4.length}`);
    expect(Number(rangeRes!.headers.get("content-length"))).toBe(8);
    const slice = Buffer.from(await rangeRes!.arrayBuffer());
    expect(slice.equals(sampleMp4.subarray(0, 8))).toBe(true);

    const openRangeRes = await serveUploadedFile(
      new Request(url, { headers: { range: "bytes=8-" } }),
      url,
      uploadsDir,
    );
    expect(openRangeRes!.status).toBe(206);
    expect(openRangeRes!.headers.get("content-range")).toBe(
      `bytes 8-${sampleMp4.length - 1}/${sampleMp4.length}`,
    );
    const tailSlice = Buffer.from(await openRangeRes!.arrayBuffer());
    expect(tailSlice.equals(sampleMp4.subarray(8))).toBe(true);

    const unsatisfiableRes = await serveUploadedFile(
      new Request(url, { headers: { range: "bytes=999-" } }),
      url,
      uploadsDir,
    );
    expect(unsatisfiableRes!.status).toBe(416);
    expect(unsatisfiableRes!.headers.get("content-range")).toBe(`bytes */${sampleMp4.length}`);
  });

  it("blocks path traversal and unsafe extensions while returning 404 for missing files", async () => {
    // WHATWG URL resolves dot-segments away from /uploads/, so serveUploadedFile declines handling it
    const normalizedUrl = new URL(
      "http://localhost:8080/uploads/products/%2e%2e/%2e%2e/secret.png",
    );
    expect(
      await serveUploadedFile(new Request(normalizedUrl), normalizedUrl, uploadsDir),
    ).toBeNull();

    // Even if a proxy/client supplies an un-normalized pathname, serveUploadedFile must reject with 403
    const rawTraversalRes = await serveUploadedFile(
      new Request("http://localhost:8080/uploads/"),
      { pathname: "/uploads/products/%2e%2e/%2e%2e/secret.png" } as URL,
      uploadsDir,
    );
    expect(rawTraversalRes!.status).toBe(403);

    const backslashTraversalRes = await serveUploadedFile(
      new Request("http://localhost:8080/uploads/"),
      { pathname: "/uploads/products/..%5c..%5csecret.png" } as URL,
      uploadsDir,
    );
    expect(backslashTraversalRes!.status).toBe(403);

    const svgUrl = new URL("http://localhost:8080/uploads/products/bad-script.svg");
    const svgRes = await serveUploadedFile(new Request(svgUrl), svgUrl, uploadsDir);
    expect(svgRes!.status).toBe(403);

    const missingUrl = new URL("http://localhost:8080/uploads/products/does-not-exist.png");
    const missingRes = await serveUploadedFile(new Request(missingUrl), missingUrl, uploadsDir);
    expect(missingRes!.status).toBe(404);
  });
});
