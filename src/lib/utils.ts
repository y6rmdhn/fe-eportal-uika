import { clsx, type ClassValue } from "clsx";
import type { ChangeEvent } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageData(event: ChangeEvent<HTMLInputElement>) {
  const file = event.target.files![0];
  const displayUrl = URL.createObjectURL(file);

  return { file, displayUrl };
}

/**
 * Normalisasi URL asset storage agar selalu lewat prefix /eportal-api/
 * yang diteruskan oleh konfigurasi reverse proxy Nginx di server produksi.
 */
export function getAppModuleIconUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.includes("/storage/") && !url.includes("/eportal-api/storage/")) {
    return url.replace("/storage/", "/eportal-api/storage/");
  }
  return url;
}

/**
 * Kompres gambar di sisi browser sebelum diupload.
 * Mengubah foto resolusi tinggi menjadi resolusi proporsional (default max 512x512 untuk icon modul)
 * dan format webp/png ringan (biasanya berkurang dari 2MB menjadi ~30KB).
 */
export async function compressImageFile(
  file: File,
  maxWidth = 512,
  maxHeight = 512,
  quality = 0.85
): Promise<File> {
  // File SVG tidak perlu di-resize canvas karena berbasis vektor
  if (file.type === "image/svg+xml") {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Hitung skala rasio gambar
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === "image/png" ? "image/png" : "image/webp";

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              resolve(file);
              return;
            }

            const ext = mimeType === "image/webp" ? "webp" : "png";
            const newName = file.name.replace(/\.[^/.]+$/, "") + `.${ext}`;
            const compressedFile = new File([blob], newName, { type: mimeType });
            resolve(compressedFile);
          },
          mimeType,
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}


