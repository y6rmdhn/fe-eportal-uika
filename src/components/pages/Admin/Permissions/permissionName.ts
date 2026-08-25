/**
 * Helper penamaan permission, dipakai bersama oleh dialog edit satuan
 * dan dialog edit massal. Sengaja dipisah agar aturannya tidak
 * terduplikasi lalu menyimpang antar dialog.
 *
 * Konvensi nama: "<prefix>.<action>", contoh "users.create".
 */

/**
 * Pecah nama permission menjadi { prefix, action }.
 * Pemisahnya titik TERAKHIR, sehingga prefix bertitik tetap utuh:
 *   "cbt.soal.create" → { prefix: "cbt.soal", action: "create" }
 * Tanpa titik, seluruhnya dianggap prefix dan action kosong.
 */
export function parseName(name: string): { prefix: string; action: string } {
  const dotIdx = name.lastIndexOf(".");
  if (dotIdx === -1) return { prefix: name, action: "" };
  return {
    prefix: name.slice(0, dotIdx),
    action: name.slice(dotIdx + 1),
  };
}

/** Normalisasi prefix: huruf kecil, spasi jadi strip, buang karakter aneh. */
export function normalizePrefix(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-_.]/g, "");
}

/** Susun kembali nama dari prefix + action. Action kosong → prefix saja. */
export function buildName(prefix: string, action: string): string {
  const base = normalizePrefix(prefix);
  return action ? `${base}.${action}` : base;
}
