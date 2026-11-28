// Shrinks phone photos in the browser before they are uploaded.
// A 12 MP phone photo (3–8 MB) becomes ~200–500 KB, which uploads fast,
// loads fast in the shop and is small enough for WhatsApp link previews.

const MAX_SIDE = 1600; // longest side in pixels – sharp on phones and computers
const QUALITY = 0.82;

async function decode(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; done: () => void }> {
  // createImageBitmap applies the phone's rotation (EXIF) so photos are not sideways.
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, done: () => bitmap.close() };
    } catch {
      /* fall back to <img> below */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, done: () => URL.revokeObjectURL(url) };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

/**
 * Returns a smaller JPEG copy of the photo. GIFs (may be animated) and photos
 * that are already small are returned unchanged.
 */
export async function resizeImage(file: File): Promise<File> {
  if (file.type === "image/gif") return file;

  const img = await decode(file); // throws if the browser can't read the file
  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
    if (scale === 1 && file.size <= 600 * 1024 && file.type === "image/jpeg") return file;

    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#ffffff"; // transparent PNG areas become white, not black
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img.source, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
  } finally {
    img.done();
  }
}
