import { describe, it, expect } from "vitest";

function validateMagicBytes(buffer: Buffer): string {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  if (buffer.length >= 4 && buffer.toString("ascii", 0, 4) === "%PDF") {
    return "application/pdf";
  }
  throw new Error(
    "Invalid file content. Only authentic JPEG, PNG, WEBP, and PDF files are accepted.",
  );
}

describe("Media Storage Magic Bytes Security Verification", () => {
  it("authenticates valid JPEG magic bytes", () => {
    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
    expect(validateMagicBytes(jpegBuffer)).toBe("image/jpeg");
  });

  it("authenticates valid PNG magic bytes", () => {
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(validateMagicBytes(pngBuffer)).toBe("image/png");
  });

  it("authenticates valid PDF magic bytes", () => {
    const pdfBuffer = Buffer.from("%PDF-1.4\n%âãÏÓ");
    expect(validateMagicBytes(pdfBuffer)).toBe("application/pdf");
  });

  it("rejects malicious executable masked as image", () => {
    // PHP script disguised with a PNG name
    const spoofedBuffer = Buffer.from("<?php system($_GET['cmd']); ?>");
    expect(() => validateMagicBytes(spoofedBuffer)).toThrow("Invalid file content");
  });
});
