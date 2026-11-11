import {
  CANVAS_BASE_SIZE,
  CANVAS_IMAGE_PADDING,
  CANVAS_SCALE_FACTOR,
} from "./constants";

/** Decode into a canvas owned by this export, so concurrent exports stay isolated. */
export async function rasterizeSvg(
  svg: string,
  format: "png" | "jpg" = "png"
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");
  const image = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not decode SVG"));
      image.src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    });
  } finally {
    image.onload = null;
    image.onerror = null;
  }
  canvas.width = CANVAS_BASE_SIZE * CANVAS_SCALE_FACTOR + CANVAS_IMAGE_PADDING;
  canvas.height = canvas.width;
  if (format === "jpg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.scale(CANVAS_SCALE_FACTOR, CANVAS_SCALE_FACTOR);
  const inset = CANVAS_IMAGE_PADDING / CANVAS_SCALE_FACTOR / 2;
  context.drawImage(image, inset, inset, CANVAS_BASE_SIZE, CANVAS_BASE_SIZE);
  return canvas;
}

export function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not encode PNG"));
    }, "image/png");
  });
}
