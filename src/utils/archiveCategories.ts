import { ActiveMenu, JenisArsip } from "../types.js";

export interface ArchiveCategoryDef {
  menu: ActiveMenu;
  nama: string;
}

// Single source of truth: every archive menu in the sidebar has exactly one
// JenisArsip row. Adding/removing a menu here keeps the jenis arsip list in sync.
export const ARCHIVE_CATEGORIES: ArchiveCategoryDef[] = [
  { menu: "pprp_14_hari", nama: "PPRP 14 Hari" },
  { menu: "pengawasan_pprp", nama: "Pengawasan PPRP" },
  { menu: "lalu_lintas", nama: "Lalu Lintas" },
  { menu: "flight_approval", nama: "Flight Approval" },
  { menu: "pelayanan", nama: "Pelayanan" },
  { menu: "tarif", nama: "Tarif" },
  { menu: "perintis", nama: "Perintis" },
  { menu: "delay_management", nama: "Delay Management" },
  { menu: "haji", nama: "Haji" },
  { menu: "rekonsiliasi", nama: "Rekonsiliasi" },
  { menu: "bimtek", nama: "Bimbingan Teknis" },
  { menu: "peraturan", nama: "Peraturan" },
  { menu: "rapat", nama: "Rapat" },
  { menu: "surat", nama: "Surat" },
  { menu: "nota_dinas", nama: "Nota Dinas" },
];

export function categoryNameToSlug(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "_");
}

const menuIndexBySlug: Map<string, number> = new Map(
  ARCHIVE_CATEGORIES.map((c, i) => [categoryNameToSlug(c.nama), i])
);

// Sort a kategori list to follow the sidebar menu order (atas ke bawah).
export function sortCategoriesByMenu(categories: JenisArsip[]): JenisArsip[] {
  return [...categories].sort((a, b) => {
    const ia = menuIndexBySlug.get(categoryNameToSlug(a.nama_jenis));
    const ib = menuIndexBySlug.get(categoryNameToSlug(b.nama_jenis));
    if (ia === undefined && ib === undefined) return a.nama_jenis.localeCompare(b.nama_jenis);
    if (ia === undefined) return 1;
    if (ib === undefined) return -1;
    return ia - ib;
  });
}

// Sort items keyed by a category name (e.g. dashboard { name, value }) into menu order.
export function sortCategoryItemsByMenu<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ia = menuIndexBySlug.get(categoryNameToSlug(a.name));
    const ib = menuIndexBySlug.get(categoryNameToSlug(b.name));
    if (ia === undefined && ib === undefined) return a.name.localeCompare(b.name);
    if (ia === undefined) return 1;
    if (ib === undefined) return -1;
    return ia - ib;
  });
}

export function findCategoryForMenu(
  categories: JenisArsip[],
  menu: ActiveMenu
): JenisArsip | undefined {
  const def = ARCHIVE_CATEGORIES.find((c) => c.menu === menu);
  if (!def) return undefined;
  const slug = categoryNameToSlug(def.nama);
  return categories.find((c) => categoryNameToSlug(c.nama_jenis) === slug);
}

const CATEGORY_SLUG_TO_MENU: Record<string, ActiveMenu> = {};
for (const c of ARCHIVE_CATEGORIES) {
  CATEGORY_SLUG_TO_MENU[categoryNameToSlug(c.nama)] = c.menu;
}

export function categoryNameToMenu(namaKategori: string): ActiveMenu {
  const slug = categoryNameToSlug(namaKategori);
  return CATEGORY_SLUG_TO_MENU[slug] || "lalu_lintas";
}
