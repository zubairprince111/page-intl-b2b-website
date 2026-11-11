export const MIN_ZOOM_SCALE = 1;
export const MAX_ZOOM_SCALE = 4;
export const ZOOM_STEP = 0.5;
export const CLICK_TOGGLE_ZOOM_SCALE = 2;

export interface GalleryImageItem {
  id: string;
  label: string;
  img: string;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface Size2D {
  width: number;
  height: number;
}

/**
 * Deduplicates product gallery images (with fallback to primary `product.image`)
 * into consistent labeled slides for card and detail zoom viewers.
 */
export function normalizeProductGalleryImages(product: {
  image: string;
  images?: readonly string[] | undefined;
}): GalleryImageItem[] {
  const rawList = product.images && product.images.length > 0 ? product.images : [product.image];
  const unique = Array.from(new Set(rawList.map((src) => src.trim()).filter(Boolean)));
  const sourceImages = unique.length > 0 ? unique : product.image ? [product.image] : [];

  return sourceImages.map((img, idx) => ({
    id: `view-${idx}`,
    label: idx === 0 ? "Primary View" : `Detail View ${idx + 1}`,
    img,
  }));
}

export function clampZoomScale(scale: number): number {
  if (!Number.isFinite(scale)) return MIN_ZOOM_SCALE;
  const clamped = Math.min(MAX_ZOOM_SCALE, Math.max(MIN_ZOOM_SCALE, scale));
  return Math.round(clamped * 100) / 100;
}

function normalizeZero(n: number): number {
  return Object.is(n, -0) || Math.abs(n) < 0.001 ? 0 : n;
}

/**
 * Clamps pan offset so zoomed imagery stays inspectable across all edges
 * without revealing empty dead margin outside the viewport stage.
 */
export function clampPanOffset(params: {
  offset: Point2D;
  scale: number;
  stage: Size2D;
  media?: Size2D | undefined;
}): Point2D {
  const safeScale = clampZoomScale(params.scale);
  if (safeScale <= MIN_ZOOM_SCALE) {
    return { x: 0, y: 0 };
  }

  const stageWidth = Math.max(0, params.stage.width);
  const stageHeight = Math.max(0, params.stage.height);
  if (stageWidth === 0 || stageHeight === 0) {
    return { x: 0, y: 0 };
  }

  const baseWidth = params.media && params.media.width > 0 ? params.media.width : stageWidth;
  const baseHeight = params.media && params.media.height > 0 ? params.media.height : stageHeight;

  const maxPanX = Math.max(0, (baseWidth * safeScale - stageWidth) / 2);
  const maxPanY = Math.max(0, (baseHeight * safeScale - stageHeight) / 2);

  return {
    x: normalizeZero(Math.min(maxPanX, Math.max(-maxPanX, params.offset.x))),
    y: normalizeZero(Math.min(maxPanY, Math.max(-maxPanY, params.offset.y))),
  };
}

/**
 * Adjusts scale around a pointer offset from the stage center so the pixel
 * beneath the cursor/tap stays visually anchored during zoom transitions.
 */
export function computeZoomAroundPoint(params: {
  pointerOffsetFromCenter: Point2D;
  currentScale: number;
  targetScale: number;
  currentPan: Point2D;
  stage: Size2D;
  media?: Size2D | undefined;
}): { scale: number; pan: Point2D } {
  const nextScale = clampZoomScale(params.targetScale);
  if (nextScale <= MIN_ZOOM_SCALE) {
    return { scale: MIN_ZOOM_SCALE, pan: { x: 0, y: 0 } };
  }

  const prevScale = Math.max(MIN_ZOOM_SCALE, clampZoomScale(params.currentScale));
  const ratio = nextScale / prevScale;

  const rawPan = {
    x: params.pointerOffsetFromCenter.x * (1 - ratio) + params.currentPan.x * ratio,
    y: params.pointerOffsetFromCenter.y * (1 - ratio) + params.currentPan.y * ratio,
  };

  return {
    scale: nextScale,
    pan: clampPanOffset({
      offset: rawPan,
      scale: nextScale,
      stage: params.stage,
      media: params.media,
    }),
  };
}

/**
 * Computes clamped 0..100 transform-origin percentages inside an element rect
 * for smooth desktop cursor-follow inline image inspection.
 */
export function computeHoverOriginPercent(params: {
  clientX: number;
  clientY: number;
  rect: { left: number; top: number; width: number; height: number };
}): Point2D {
  if (params.rect.width <= 0 || params.rect.height <= 0) {
    return { x: 50, y: 50 };
  }
  const rawX = ((params.clientX - params.rect.left) / params.rect.width) * 100;
  const rawY = ((params.clientY - params.rect.top) / params.rect.height) * 100;
  return {
    x: Math.round(Math.min(100, Math.max(0, rawX)) * 100) / 100,
    y: Math.round(Math.min(100, Math.max(0, rawY)) * 100) / 100,
  };
}
