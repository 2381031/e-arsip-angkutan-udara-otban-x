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
  pprp_14_hari: "pprp_14_hari",
  pengawasan_pprp: "pengawasan_pprp",
  lalu_lintas: "lalu_lintas",
  flight_approval: "flight_approval",
  pelayanan: "pelayanan",
  tarif: "tarif",
  perintis: "perintis",
  delay_management: "delay_management",
  haji: "haji",
  peraturan: "peraturan",
  rekonsiliasi: "rekonsiliasi",
  bimtek: "bimtek",
  rapat: "rapat",
  surat: "surat",
  nota_dinas: "nota_dinas",
};

export function categoryNameToMenu(namaKategori: string): ActiveMenu {
  const slug = categoryNameToSlug(namaKategori);
  return CATEGORY_MENU_MAP[slug] || "lalu_lintas";
}
