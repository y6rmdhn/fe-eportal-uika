import { AxiosError } from "axios";

/**
 * Ubah error apa pun dari axios menjadi pesan yang bisa dibaca pengguna.
 *
 * Pola lama `error.response?.data?.message || "Terjadi kesalahan server"`
 * menyembunyikan penyebab asli ketika respons tidak membawa JSON — misalnya
 * halaman 403 dari nginx/WAF, atau 502 dari reverse proxy. Helper ini
 * membedakan kasus-kasus itu supaya penyebabnya langsung kelihatan.
 */
export function getApiErrorMessage(error: unknown, fallback?: string): string {
  if (!(error instanceof AxiosError)) {
    return error instanceof Error ? error.message : "Terjadi kesalahan tidak dikenal.";
  }

  // Tidak ada respons sama sekali: jaringan putus, CORS, atau preflight ditolak
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return "Permintaan melebihi batas waktu. Coba lagi.";
    }
    return "Tidak dapat terhubung ke server. Periksa koneksi atau konfigurasi CORS.";
  }

  const { status, data } = error.response;

  // Backend membalas JSON dengan pesan — ini jalur normal
  const apiMessage =
    typeof data === "object" && data !== null
      ? (data as { message?: unknown }).message
      : undefined;

  if (typeof apiMessage === "string" && apiMessage.trim() !== "") {
    return apiMessage;
  }

  // Respons bukan JSON aplikasi (HTML dari nginx, body kosong, dll).
  // Sebut status-nya supaya jelas ini bukan validasi biasa.
  switch (status) {
    case 401:
      return "Sesi kamu sudah habis. Silakan login ulang.";
    case 403:
      return `Ditolak oleh server (403). Permintaan kemungkinan diblokir sebelum mencapai aplikasi — periksa konfigurasi WAF atau proxy.`;
    case 404:
      return "Endpoint tidak ditemukan (404).";
    case 405:
      return "Method tidak diizinkan untuk endpoint ini (405).";
    case 413:
      return "Data yang dikirim terlalu besar (413).";
    case 419:
      return "Sesi kedaluwarsa (419). Muat ulang halaman.";
    case 422:
      return "Data yang dikirim tidak valid.";
    case 429:
      return "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.";
    case 502:
    case 503:
    case 504:
      return `Server sedang tidak dapat diakses (${status}). Coba beberapa saat lagi.`;
    default:
      if (status >= 500) {
        return `Terjadi kesalahan di server (${status}).`;
      }
      return fallback ?? `Permintaan gagal (${status}).`;
  }
}
