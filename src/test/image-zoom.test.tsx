import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProductImageZoomModal } from "@/components/site/ProductImageZoomModal";
import {
  MAX_ZOOM_SCALE,
  MIN_ZOOM_SCALE,
  clampPanOffset,
  clampZoomScale,
  computeHoverOriginPercent,
  computeZoomAroundPoint,
  normalizeProductGalleryImages,
} from "@/lib/image-zoom";

afterEach(() => {
  cleanup();
});

describe("Product image zoom math helpers", () => {
  it("normalizes and deduplicates product gallery images cleanly", () => {
    const single = normalizeProductGalleryImages({ image: "/lift.jpg" });
    expect(single).toEqual([{ id: "view-0", label: "Primary View", img: "/lift.jpg" }]);

    const multi = normalizeProductGalleryImages({
      image: "/lift.jpg",
      images: ["/lift.jpg", " ", "/lift-detail.jpg", "/lift.jpg", "/lift-panel.jpg"],
    });
    expect(multi).toEqual([
      { id: "view-0", label: "Primary View", img: "/lift.jpg" },
      { id: "view-1", label: "Detail View 2", img: "/lift-detail.jpg" },
      { id: "view-2", label: "Detail View 3", img: "/lift-panel.jpg" },
    ]);
  });

  it("clamps zoom scales safely within [MIN_ZOOM_SCALE, MAX_ZOOM_SCALE]", () => {
    expect(clampZoomScale(0.25)).toBe(MIN_ZOOM_SCALE);
    expect(clampZoomScale(10)).toBe(MAX_ZOOM_SCALE);
    expect(clampZoomScale(Number.NaN)).toBe(MIN_ZOOM_SCALE);
    expect(clampZoomScale(2.5)).toBe(2.5);
  });

  it("clamps pan offset to zero at 1x and enforces media overhang boundaries when zoomed", () => {
    expect(
      clampPanOffset({
        offset: { x: 120, y: -90 },
        scale: 1,
        stage: { width: 800, height: 500 },
      }),
    ).toEqual({ x: 0, y: 0 });

    // Square 400x400 image inside an 800x500 stage zoomed to 2x => 800x800 scaled
    // Horizontal overhang is 0 (maxPanX = 0); vertical overhang is (800 - 500)/2 = 150
    expect(
      clampPanOffset({
        offset: { x: 250, y: 400 },
        scale: 2,
        stage: { width: 800, height: 500 },
        media: { width: 400, height: 400 },
      }),
    ).toEqual({ x: 0, y: 150 });
  });

  it("computes cursor-anchored zoom pan offsets accurately", () => {
    const anchored = computeZoomAroundPoint({
      pointerOffsetFromCenter: { x: 100, y: -50 },
      currentScale: 1,
      targetScale: 2,
      currentPan: { x: 0, y: 0 },
      stage: { width: 800, height: 600 },
    });

    expect(anchored.scale).toBe(2);
    expect(anchored.pan).toEqual({ x: -100, y: 50 });

    const reset = computeZoomAroundPoint({
      pointerOffsetFromCenter: { x: 100, y: -50 },
      currentScale: 2,
      targetScale: 1,
      currentPan: { x: -100, y: 50 },
      stage: { width: 800, height: 600 },
    });
    expect(reset).toEqual({ scale: 1, pan: { x: 0, y: 0 } });
  });

  it("calculates clamped hover transform-origin percentages inside the image stage", () => {
    expect(
      computeHoverOriginPercent({
        clientX: 150,
        clientY: 200,
        rect: { left: 100, top: 100, width: 200, height: 200 },
      }),
    ).toEqual({ x: 25, y: 50 });

    expect(
      computeHoverOriginPercent({
        clientX: 500,
        clientY: -10,
        rect: { left: 100, top: 100, width: 200, height: 200 },
      }),
    ).toEqual({ x: 100, y: 0 });
  });
});

describe("ProductImageZoomModal interactive UI", () => {
  const sampleImages = [
    { id: "view-0", label: "Primary View", img: "/img-1.jpg" },
    { id: "view-1", label: "Detail View 2", img: "/img-2.jpg" },
  ];

  it("supports zoom in, zoom out, preset cycle, reset, slide switch, and Escape close", () => {
    const onOpenChange = vi.fn();

    render(
      <ProductImageZoomModal
        open={true}
        onOpenChange={onOpenChange}
        productName="Heavy-Duty 2-Post Electro-Hydraulic Lift 4.0T"
        brand="Torq"
        sku="TQ-LIFT-4000"
        images={sampleImages}
      />,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    const img = screen.getByTestId("zoom-stage-image");
    expect(img).toHaveAttribute("src", "/img-1.jpg");
    expect(img).toHaveAttribute("data-zoom-scale", "1");

    const zoomInBtn = screen.getByRole("button", { name: "Zoom in" });
    const zoomOutBtn = screen.getByRole("button", { name: "Zoom out" });
    const resetBtn = screen.getByRole("button", { name: "Reset zoom" });
    const pctBtn = screen.getByRole("button", { name: /Zoom level 100%/i });

    expect(zoomOutBtn).toBeDisabled();
    expect(resetBtn).toBeDisabled();

    // Zoom in twice (100% -> 150% -> 200%)
    fireEvent.click(zoomInBtn);
    expect(screen.getByTestId("zoom-stage-image")).toHaveAttribute("data-zoom-scale", "1.5");
    expect(zoomOutBtn).not.toBeDisabled();
    expect(resetBtn).not.toBeDisabled();

    fireEvent.click(zoomInBtn);
    expect(screen.getByTestId("zoom-stage-image")).toHaveAttribute("data-zoom-scale", "2");

    // Switching slide resets zoom back to 100%
    fireEvent.click(screen.getByRole("button", { name: "Next image" }));
    expect(screen.getByTestId("zoom-stage-image")).toHaveAttribute("src", "/img-2.jpg");
    expect(screen.getByTestId("zoom-stage-image")).toHaveAttribute("data-zoom-scale", "1");

    // Preset pill cycles 100% -> 200% -> 300% -> 100%
    fireEvent.click(pctBtn);
    expect(screen.getByTestId("zoom-stage-image")).toHaveAttribute("data-zoom-scale", "2");
    fireEvent.click(screen.getByRole("button", { name: /Zoom level 200%/i }));
    expect(screen.getByTestId("zoom-stage-image")).toHaveAttribute("data-zoom-scale", "3");
    fireEvent.click(screen.getByRole("button", { name: /Zoom level 300%/i }));
    expect(screen.getByTestId("zoom-stage-image")).toHaveAttribute("data-zoom-scale", "1");

    // Keyboard shortcuts (+ zooms in, 0 resets, Escape closes)
    fireEvent.keyDown(window, { key: "+" });
    expect(screen.getByTestId("zoom-stage-image")).toHaveAttribute("data-zoom-scale", "1.5");

    fireEvent.keyDown(window, { key: "0" });
    expect(screen.getByTestId("zoom-stage-image")).toHaveAttribute("data-zoom-scale", "1");

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes when clicking the modal backdrop", () => {
    const onOpenChange = vi.fn();

    const firstImage = sampleImages[0];
    expect(firstImage).toBeDefined();
    render(
      <ProductImageZoomModal
        open={true}
        onOpenChange={onOpenChange}
        productName="Heavy-Duty Lift"
        images={firstImage ? [firstImage] : []}
      />,
    );

    const dialogBackdrop = screen.getByRole("dialog");
    fireEvent.click(dialogBackdrop);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
