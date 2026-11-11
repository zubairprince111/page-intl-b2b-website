import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CLICK_TOGGLE_ZOOM_SCALE,
  MAX_ZOOM_SCALE,
  MIN_ZOOM_SCALE,
  ZOOM_STEP,
  clampPanOffset,
  clampZoomScale,
  computeZoomAroundPoint,
  type GalleryImageItem,
  type Point2D,
  type Size2D,
} from "@/lib/image-zoom";
import { cn } from "@/lib/utils";

export interface ProductImageZoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  brand?: string | undefined;
  sku?: string | undefined;
  productSlug?: string | undefined;
  images: GalleryImageItem[];
  activeIndex?: number | undefined;
  onActiveIndexChange?: ((index: number) => void) | undefined;
}

export function ProductImageZoomModal({
  open,
  onOpenChange,
  productName,
  brand,
  sku,
  productSlug,
  images,
  activeIndex: controlledIndex,
  onActiveIndexChange,
}: ProductImageZoomModalProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const isControlledIndex = controlledIndex !== undefined;
  const rawIdx = isControlledIndex ? controlledIndex : internalIndex;
  const safeIndex = images.length > 0 ? Math.min(Math.max(0, rawIdx), images.length - 1) : 0;

  const setSlideIndex = useCallback(
    (nextIdx: number) => {
      if (images.length === 0) return;
      const wrapped = ((nextIdx % images.length) + images.length) % images.length;
      if (!isControlledIndex) {
        setInternalIndex(wrapped);
      }
      onActiveIndexChange?.(wrapped);
    },
    [images.length, isControlledIndex, onActiveIndexChange],
  );

  const [zoom, setZoom] = useState(MIN_ZOOM_SCALE);
  const [pan, setPan] = useState<Point2D>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  zoomRef.current = zoom;
  panRef.current = pan;

  const activePointersRef = useRef(new Map<number, Point2D>());
  const dragStartRef = useRef<{ pointer: Point2D; pan: Point2D; moved: boolean } | null>(null);
  const pinchStartRef = useRef<{ dist: number; scale: number; mid: Point2D } | null>(null);

  const resetZoom = useCallback(() => {
    setZoom(MIN_ZOOM_SCALE);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
    dragStartRef.current = null;
    pinchStartRef.current = null;
  }, []);

  // Reset zoom and transient pointer state on open or slide switch
  useEffect(() => {
    if (open) {
      resetZoom();
      activePointersRef.current.clear();
    } else if (!isControlledIndex) {
      setInternalIndex(0);
    }
  }, [open, safeIndex, isControlledIndex, resetZoom]);

  const measureBoxes = useCallback((): { stage: Size2D; media: Size2D | undefined } => {
    const stageEl = stageRef.current;
    const stageRect = stageEl?.getBoundingClientRect();
    const stage: Size2D = {
      width: stageRect?.width ?? 0,
      height: stageRect?.height ?? 0,
    };
    const imgEl = imgRef.current;
    const media: Size2D | undefined =
      imgEl && imgEl.offsetWidth > 0 && imgEl.offsetHeight > 0
        ? { width: imgEl.offsetWidth, height: imgEl.offsetHeight }
        : undefined;
    return { stage, media };
  }, []);

  const applyZoomAtClientPoint = useCallback(
    (targetScale: number, clientPoint?: Point2D) => {
      const clampedScale = clampZoomScale(targetScale);
      if (clampedScale <= MIN_ZOOM_SCALE) {
        resetZoom();
        return;
      }

      const stageEl = stageRef.current;
      const stageRect = stageEl?.getBoundingClientRect();
      const { stage, media } = measureBoxes();

      if (!clientPoint || !stageRect || stage.width === 0 || stage.height === 0) {
        setZoom(clampedScale);
        setPan((prevPan) =>
          clampPanOffset({
            offset: prevPan,
            scale: clampedScale,
            stage,
            media,
          }),
        );
        return;
      }

      const pointerOffsetFromCenter = {
        x: clientPoint.x - (stageRect.left + stageRect.width / 2),
        y: clientPoint.y - (stageRect.top + stageRect.height / 2),
      };

      const result = computeZoomAroundPoint({
        pointerOffsetFromCenter,
        currentScale: zoomRef.current,
        targetScale: clampedScale,
        currentPan: panRef.current,
        stage,
        media,
      });

      setZoom(result.scale);
      setPan(result.pan);
    },
    [measureBoxes, resetZoom],
  );

  const handleZoomIn = useCallback(() => {
    applyZoomAtClientPoint(zoomRef.current + ZOOM_STEP);
  }, [applyZoomAtClientPoint]);

  const handleZoomOut = useCallback(() => {
    applyZoomAtClientPoint(zoomRef.current - ZOOM_STEP);
  }, [applyZoomAtClientPoint]);

  const handleCyclePresetZoom = useCallback(() => {
    const current = zoomRef.current;
    if (current < 1.9) {
      applyZoomAtClientPoint(2);
    } else if (current < 2.9) {
      applyZoomAtClientPoint(3);
    } else {
      resetZoom();
    }
  }, [applyZoomAtClientPoint, resetZoom]);

  // Body scroll lock & keyboard shortcuts when open
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const focusTimer = window.setTimeout(() => {
      closeBtnRef.current?.focus({ preventScroll: true });
    }, 20);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
        return;
      }
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleZoomIn();
        return;
      }
      if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        handleZoomOut();
        return;
      }
      if (e.key === "0") {
        e.preventDefault();
        resetZoom();
        return;
      }
      if (e.key === "ArrowLeft" && images.length > 1) {
        e.preventDefault();
        setSlideIndex(safeIndex - 1);
        return;
      }
      if (e.key === "ArrowRight" && images.length > 1) {
        e.preventDefault();
        setSlideIndex(safeIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [
    open,
    onOpenChange,
    handleZoomIn,
    handleZoomOut,
    resetZoom,
    images.length,
    safeIndex,
    setSlideIndex,
  ]);

  // Non-passive wheel zoom listener so scrolling zooms cleanly without scrolling the page behind
  useEffect(() => {
    const stageEl = stageRef.current;
    if (!open || !stageEl) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY === 0) return;
      const stepDelta = e.deltaY < 0 ? 0.35 : -0.35;
      applyZoomAtClientPoint(zoomRef.current + stepDelta, {
        x: e.clientX,
        y: e.clientY,
      });
    };

    stageEl.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      stageEl.removeEventListener("wheel", handleWheel);
    };
  }, [open, applyZoomAtClientPoint]);

  const handleStagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button, a")) return;

    e.currentTarget.setPointerCapture?.(e.pointerId);
    const point = { x: e.clientX, y: e.clientY };
    activePointersRef.current.set(e.pointerId, point);

    if (activePointersRef.current.size === 2) {
      const pts = Array.from(activePointersRef.current.values());
      const p0 = pts[0];
      const p1 = pts[1];
      if (!p0 || !p1) return;
      const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      const mid = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
      pinchStartRef.current = { dist: Math.max(dist, 1), scale: zoomRef.current, mid };
      dragStartRef.current = null;
      setIsDragging(true);
      return;
    }

    if (activePointersRef.current.size === 1) {
      dragStartRef.current = {
        pointer: point,
        pan: panRef.current,
        moved: false,
      };
      pinchStartRef.current = null;
    }
  };

  const handleStagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activePointersRef.current.has(e.pointerId)) return;
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 2 && pinchStartRef.current) {
      const pts = Array.from(activePointersRef.current.values());
      const p0 = pts[0];
      const p1 = pts[1];
      if (!p0 || !p1) return;
      const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      const mid = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
      const targetScale = pinchStartRef.current.scale * (dist / pinchStartRef.current.dist);
      applyZoomAtClientPoint(targetScale, mid);
      return;
    }

    if (activePointersRef.current.size === 1 && dragStartRef.current) {
      const dx = e.clientX - dragStartRef.current.pointer.x;
      const dy = e.clientY - dragStartRef.current.pointer.y;
      if (Math.hypot(dx, dy) > 4) {
        dragStartRef.current.moved = true;
        if (zoomRef.current > MIN_ZOOM_SCALE) {
          setIsDragging(true);
          const { stage, media } = measureBoxes();
          setPan(
            clampPanOffset({
              offset: {
                x: dragStartRef.current.pan.x + dx,
                y: dragStartRef.current.pan.y + dy,
              },
              scale: zoomRef.current,
              stage,
              media,
            }),
          );
        }
      }
    }
  };

  const handleStagePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const wasPinch = pinchStartRef.current !== null;
    const singleStart = dragStartRef.current;

    activePointersRef.current.delete(e.pointerId);
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (activePointersRef.current.size < 2) {
      pinchStartRef.current = null;
    }

    if (!wasPinch && singleStart && !singleStart.moved && activePointersRef.current.size === 0) {
      // Single click / tap without dragging toggles 100% <-> 200% at clicked point
      if (zoomRef.current > MIN_ZOOM_SCALE) {
        resetZoom();
      } else {
        applyZoomAtClientPoint(CLICK_TOGGLE_ZOOM_SCALE, {
          x: e.clientX,
          y: e.clientY,
        });
      }
    }

    if (activePointersRef.current.size === 0) {
      dragStartRef.current = null;
      setIsDragging(false);
    }
  };

  const handleStagePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size === 0) {
      dragStartRef.current = null;
      pinchStartRef.current = null;
      setIsDragging(false);
    }
  };

  if (!open || typeof document === "undefined") return null;

  const activeSlide = images[safeIndex] || images[0];
  const zoomPercent = Math.round(zoom * 100);
  const isZoomed = zoom > MIN_ZOOM_SCALE;
  const hasMultiple = images.length > 1;

  const modalMarkup = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${productName} zoom view`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onOpenChange(false);
        }
      }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-2.5 sm:p-5 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="relative flex flex-col w-full max-w-5xl max-h-[94dvh] rounded-2xl sm:rounded-3xl border border-white/10 bg-zinc-950 text-white shadow-2xl overflow-hidden">
        {/* Top Toolbar Header */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-3 sm:px-6 sm:py-4 border-b border-white/10 bg-zinc-950/90 shrink-0">
          <div className="min-w-0 flex-1 pr-2">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="font-display text-sm sm:text-lg font-bold tracking-tight text-white truncate">
                {productName}
              </h3>
              {hasMultiple && (
                <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] sm:text-xs font-mono text-white/80 tabular-nums">
                  {safeIndex + 1} / {images.length}
                </span>
              )}
            </div>
            {(brand || sku || productSlug) && (
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] sm:text-xs text-white/60 mt-0.5">
                {(brand || sku) && (
                  <span>
                    {brand}
                    {brand && sku ? " · " : ""}
                    {sku ? `SKU: ${sku}` : ""}
                  </span>
                )}
                {productSlug && (
                  <Link
                    to="/shop/$slug"
                    params={{ slug: productSlug }}
                    onClick={() => onOpenChange(false)}
                    className="inline-flex items-center gap-1 text-primary hover:text-primary/85 font-semibold"
                  >
                    <span>View Specs</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Zoom Controls & Close */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <div
              className="inline-flex items-center rounded-full border border-white/15 bg-white/5 p-0.5"
              role="group"
              aria-label="Image zoom controls"
            >
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= MIN_ZOOM_SCALE}
                aria-label="Zoom out"
                title="Zoom out (-)"
                className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full text-white/85 hover:bg-white/15 hover:text-white disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ZoomOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>

              <button
                type="button"
                onClick={handleCyclePresetZoom}
                aria-label={`Zoom level ${zoomPercent}%, click to cycle`}
                title="Click to cycle zoom level (100% / 200% / 300%)"
                className="min-w-[3.1rem] h-7 sm:h-8 px-2 rounded-full text-[11px] sm:text-xs font-mono font-bold text-white hover:bg-white/15 transition-colors tabular-nums cursor-pointer"
              >
                {zoomPercent}%
              </button>

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= MAX_ZOOM_SCALE}
                aria-label="Zoom in"
                title="Zoom in (+)"
                className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full text-white/85 hover:bg-white/15 hover:text-white disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={resetZoom}
              disabled={!isZoomed && pan.x === 0 && pan.y === 0}
              aria-label="Reset zoom"
              title="Reset view (0)"
              className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-white/80 hover:bg-white/15 hover:text-white disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>

            <button
              ref={closeBtnRef}
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close zoom view"
              title="Close (Esc)"
              className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full bg-white/10 text-white/85 hover:bg-white/20 hover:text-white transition-colors cursor-pointer ml-0.5"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Interactive Zoom Stage */}
        <div
          ref={stageRef}
          data-testid="zoom-stage"
          onPointerDown={handleStagePointerDown}
          onPointerMove={handleStagePointerMove}
          onPointerUp={handleStagePointerUp}
          onPointerCancel={handleStagePointerCancel}
          className={cn(
            "relative flex-1 min-h-[280px] h-[56vh] sm:h-[64vh] w-full flex items-center justify-center overflow-hidden bg-zinc-900/75 select-none touch-none",
            isZoomed ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in",
          )}
        >
          {activeSlide && (
            <img
              ref={imgRef}
              src={activeSlide.img}
              alt={`${productName} — ${activeSlide.label}`}
              draggable={false}
              data-testid="zoom-stage-image"
              data-zoom-scale={zoom}
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                transition: isDragging ? "none" : "transform 180ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
              className="max-h-[92%] max-w-[92%] object-contain pointer-events-none will-change-transform rounded-xl"
            />
          )}

          {/* Previous / Next Slide Buttons */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSlideIndex(safeIndex - 1);
                }}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full bg-black/55 border border-white/15 text-white/90 hover:bg-black/80 hover:text-white backdrop-blur-sm transition-all cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSlideIndex(safeIndex + 1);
                }}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full bg-black/55 border border-white/15 text-white/90 hover:bg-black/80 hover:text-white backdrop-blur-sm transition-all cursor-pointer"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Bottom Interactive Hint */}
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 border border-white/10 px-3 py-1 text-[10.5px] sm:text-[11px] font-medium text-white/75 backdrop-blur-sm whitespace-nowrap">
            {isZoomed
              ? "Drag to pan · Scroll to adjust zoom · Click to reset"
              : "Click or scroll to zoom · Pinch to inspect"}
          </div>
        </div>

        {/* Multi-Image Thumbnail Bar */}
        {hasMultiple && (
          <div className="flex items-center justify-center gap-2 sm:gap-3 px-4 py-3 border-t border-white/10 bg-zinc-950/95 overflow-x-auto shrink-0">
            {images.map((item, idx) => {
              const active = safeIndex === idx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSlideIndex(idx)}
                  aria-label={item.label}
                  className={cn(
                    "group flex items-center gap-2 rounded-xl border p-1 pr-2.5 text-left transition-all cursor-pointer shrink-0",
                    active
                      ? "border-primary bg-primary/15 text-white ring-1 ring-primary/40"
                      : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <img
                    src={item.img}
                    alt=""
                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg object-cover bg-zinc-900 shrink-0"
                  />
                  <span className="text-[11px] font-medium whitespace-nowrap hidden sm:inline">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalMarkup, document.body);
}
