export interface Admin {
  id: string;
  nama: string;
  username: string;
  password?: string;
  createdAt: string;
}

export interface JenisArsip {
  id: string;
  nama_jenis: string;
}

export interface BandarUdara {
  id: string;
  nama_bandara: string;
}

export interface Tahun {
  id: string;
  tahun: string;
}

export interface Dokumen {
  id: string;
  nama_dokumen: string;
  nomor_dokumen: string;
  keterangan: string;
  jenis_arsip_id: string;
  bandara_id: string;
  tahun_id: string;
  file_url: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  tanggal_dokumen?: string;
  
  // Joined client helpers
  nama_bandara?: string;
  tahun?: string;
  nama_kategori?: string;
}

export interface LogAktivitas {
  id: string;
  admin_username: string;
  aktivitas: string;
  detail: string;
  tanggal: string;
}

export interface DashboardMetrics {
  totalDokumen: number;
  totalUploadTahunIni: number;
  totalKategori: number;
  docsByCategory: { name: string; value: number }[];
  docsByYear: { name: string; value: number }[];
  recentDocs: Dokumen[];
}

export type ActiveMenu = 
  | "dashboard" 
  | "pengawasan" 
  | "rapat" 
  | "pprp" 
  | "lalu_lintas" 
  | "rekonsiliasi"
  | "admins"
  | "logs"
  | "airports";
