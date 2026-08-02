import { BandarUdara, JenisArsip, Tahun } from "../types.js";

export interface OptionsData {
  bandara: BandarUdara[];
  tahun: Tahun[];
  jenis_arsip: JenisArsip[];
}

interface CacheEntry {
  data: unknown;
  fetchedAt: number;
}

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<any>>();

const TTL_HELPERS = 120_000; // data referensi (bandara/tahun/jenis arsip) jarang berubah
const TTL_COUNTS = 30_000;   // jumlah dokumen per tahun
const TTL_DEFAULT = 60_000;

async function cached<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.fetchedAt < ttl) {
    return entry.data as T;
  }
  const running = inflight.get(key);
  if (running) return running;
  const promise = fetcher()
    .then((data) => {
      cache.set(key, { data, fetchedAt: Date.now() });
      return data;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, promise);
  return promise;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

// Bandara + Tahun + Jenis Arsip dalam satu panggilan, di-cache agar tidak
// fetch ulang setiap pindah menu.
export function getOptions(token: string): Promise<OptionsData> {
  return cached("options", TTL_HELPERS, async () => {
    const res = await fetch("/api/options", { headers: authHeaders(token) });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Gagal memuat data referensi");
    }
    return res.json();
  });
}

// Jumlah dokumen per tahun untuk sebuah kategori (folder Tahun).
export function getYearCounts(token: string, jenisArsipId: string): Promise<Record<string, number>> {
  return cached(`year-counts:${jenisArsipId}`, TTL_COUNTS, async () => {
    const res = await fetch(`/api/dokumen/year-counts?jenis_arsip_id=${encodeURIComponent(jenisArsipId)}`, {
      headers: authHeaders(token),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Gagal memuat jumlah dokumen");
    }
    return res.json();
  });
}

// Generic cache helper untuk data lain (mis. daftar dokumen) dengan TTL default.
export function cachedGet<T>(key: string, token: string, url: string, ttl?: number): Promise<T> {
  return cached(key, ttl || TTL_DEFAULT, async () => {
    const res = await fetch(url, { headers: authHeaders(token) });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Gagal memuat data");
    }
    return res.json();
  });
}

// Bersihkan cache setelah operasi mutasi (upload/edit/hapus) agar data tetap segar.
export function invalidateDataCache() {
  cache.clear();
}
