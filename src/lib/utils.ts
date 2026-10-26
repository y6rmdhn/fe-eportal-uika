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
  // Jika URL dari server masih menggunakan /storage/... tanpa /eportal-api/,
  // sisipkan /eportal-api/ agar file tidak jatuh ke fallback SPA frontend.
  if (url.includes("/storage/") && !url.includes("/eportal-api/storage/")) {
    return url.replace("/storage/", "/eportal-api/storage/");
  }
  return url;
}

