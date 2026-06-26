import { ActiveMenu, JenisArsip } from "../types.js";

export function categoryNameToSlug(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "_");
}

export function findCategoryForMenu(
  categories: JenisArsip[],
  menu: ActiveMenu
): JenisArsip | undefined {
  return categories.find((c) => categoryNameToSlug(c.nama_jenis) === menu);
}

export const CATEGORY_MENU_MAP: Record<string, ActiveMenu> = {
  pengawasan: "pengawasan",
  peraturan: "peraturan",
  rapat: "rapat",
  pprp: "pprp",
  lalu_lintas: "lalu_lintas",
  rekonsiliasi: "rekonsiliasi",
  surat: "surat",
  nota_dinas: "nota_dinas",
};

export function categoryNameToMenu(namaKategori: string): ActiveMenu {
  const slug = categoryNameToSlug(namaKategori);
  return CATEGORY_MENU_MAP[slug] || "pengawasan";
}
