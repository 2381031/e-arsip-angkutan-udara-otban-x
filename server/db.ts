import { PrismaClient } from "@prisma/client";

// Define TypeScript interfaces for our local database
export interface Admin {
  id: string;
  nama: string;
  username: string;
  password:  string;
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
  jenis_arsip_id: string; // references JenisArsip.id
  bandara_id: string;     // references BandarUdara.id
  tahun_id: string;       // references Tahun.id
  file_url: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  tanggal_dokumen?: string;
}

export interface LogAktivitas {
  id: string;
  admin_username: string;
  aktivitas: string;
  detail: string;
  tanggal: string;
}

// Global cache for PrismaClient in serverless (e.g. Vercel)
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Mapping functions to keep exact backward-compatibility with front-end property names
function mapAdmin(a: any): Admin {
  return {
    id: a.id,
    nama: a.nama,
    username: a.username,
    password: a.password,
    createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
  };
}

function mapJenisArsip(j: any): JenisArsip {
  return {
    id: j.id,
    nama_jenis: j.namaJenis,
  };
}

function mapBandarUdara(b: any): BandarUdara {
  return {
    id: b.id,
    nama_bandara: b.namaBandara,
  };
}

function mapTahun(t: any): Tahun {
  return {
    id: t.id,
    tahun: t.tahun,
  };
}

function mapDokumen(d: any): Dokumen {
  return {
    id: d.id,
    nama_dokumen: d.namaDokumen,
    nomor_dokumen: d.nomorDokumen,
    keterangan: d.keterangan || "",
    jenis_arsip_id: d.jenisArsipId,
    bandara_id: d.bandaraId,
    tahun_id: d.tahunId,
    file_url: d.fileUrl,
    uploaded_by: d.uploadedBy,
    created_at: d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt,
    updated_at: d.updatedAt instanceof Date ? d.updatedAt.toISOString() : d.updatedAt,
    tanggal_dokumen: d.tanggalDokumen || undefined,
  };
}

function mapLogAktivitas(l: any): LogAktivitas {
  return {
    id: l.id,
    admin_username: l.adminUsername,
    aktivitas: l.aktivitas,
    detail: l.detail || "",
    tanggal: l.tanggal instanceof Date ? l.tanggal.toISOString() : l.tanggal,
  };
}

export const dbService = {
  // Admins
  async getAdmins(): Promise<Admin[]> {
    const list = await prisma.admin.findMany({
      orderBy: { createdAt: "desc" },
    });
    return list.map(mapAdmin);
  },

  async getAdminById(id: string): Promise<Admin | undefined> {
    const item = await prisma.admin.findUnique({
      where: { id },
    });
    return item ? mapAdmin(item) : undefined;
  },

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const item = await prisma.admin.findUnique({
      where: { username: username.toLowerCase().trim() },
    });
    return item ? mapAdmin(item) : undefined;
  },

  async addAdmin(nama: string, username: string, password:  string): Promise<Admin> {
    const item = await prisma.admin.create({
      data: {
        nama,
        username: username.toLowerCase().trim(),
        password,
      },
    });
    return mapAdmin(item);
  },

  async updateAdmin(id: string, nama: string, username: string, password?: string): Promise<Admin | null> {
    const data: any = {
      nama,
      username: username.toLowerCase().trim(),
    };
    if (password) {
      data.password = password;
    }
    const item = await prisma.admin.update({
      where: { id },
      data,
    });
    return item ? mapAdmin(item) : null;
  },

  async deleteAdmin(id: string): Promise<boolean> {
    try {
      await prisma.admin.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  },

  // Bandar Udara
  async getBandarUdara(): Promise<BandarUdara[]> {
    const list = await prisma.bandarUdara.findMany({
      orderBy: { namaBandara: "asc" },
    });
    return list.map(mapBandarUdara);
  },

  async addBandarUdara(namaBandara: string): Promise<BandarUdara> {
    const item = await prisma.bandarUdara.create({
      data: {
        namaBandara: namaBandara.trim(),
      },
    });
    return mapBandarUdara(item);
  },

  async updateBandarUdara(id: string, namaBandara: string): Promise<BandarUdara | null> {
    const item = await prisma.bandarUdara.update({
      where: { id },
      data: {
        namaBandara: namaBandara.trim(),
      },
    });
    return item ? mapBandarUdara(item) : null;
  },

  async deleteBandarUdara(id: string): Promise<boolean> {
    try {
      // Check if airport has documents
      const count = await prisma.dokumen.count({
        where: { bandaraId: id },
      });
      if (count > 0) return false;

      await prisma.bandarUdara.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  },

  // Tahun
  async getTahun(): Promise<Tahun[]> {
    const list = await prisma.tahun.findMany({
      orderBy: { tahun: "asc" },
    });
    return list.map(mapTahun);
  },

  async addTahun(tahunVal: string): Promise<Tahun> {
    const item = await prisma.tahun.create({
      data: {
        tahun: tahunVal.trim(),
      },
    });
    return mapTahun(item);
  },

  // Jenis Arsip (Kategori)
  async getJenisArsip(): Promise<JenisArsip[]> {
    const list = await prisma.jenisArsip.findMany({
      orderBy: { namaJenis: "asc" },
    });
    return list.map(mapJenisArsip);
  },

  // Dokumen
  async getDokumen(): Promise<Dokumen[]> {
    const list = await prisma.dokumen.findMany({
      orderBy: { createdAt: "desc" },
    });
    return list.map(mapDokumen);
  },

  async addDokumen(data: Omit<Dokumen, "id" | "created_at" | "updated_at">): Promise<Dokumen> {
    const item = await prisma.dokumen.create({
      data: {
        namaDokumen: data.nama_dokumen,
        nomorDokumen: data.nomor_dokumen,
        keterangan: data.keterangan || null,
        jenisArsipId: data.jenis_arsip_id,
        bandaraId: data.bandara_id,
        tahunId: data.tahun_id,
        fileUrl: data.file_url,
        uploadedBy: data.uploaded_by,
        tanggalDokumen: data.tanggal_dokumen || null,
      },
    });
    return mapDokumen(item);
  },

  async updateDokumen(id: string, data: Partial<Omit<Dokumen, "id" | "created_at" | "updated_at">>): Promise<Dokumen | null> {
    const updateData: any = {};
    if (data.nama_dokumen !== undefined) updateData.namaDokumen = data.nama_dokumen;
    if (data.nomor_dokumen !== undefined) updateData.nomorDokumen = data.nomor_dokumen;
    if (data.keterangan !== undefined) updateData.keterangan = data.keterangan || null;
    if (data.jenis_arsip_id !== undefined) updateData.jenisArsipId = data.jenis_arsip_id;
    if (data.bandara_id !== undefined) updateData.bandaraId = data.bandara_id;
    if (data.tahun_id !== undefined) updateData.tahunId = data.tahun_id;
    if (data.tanggal_dokumen !== undefined) updateData.tanggalDokumen = data.tanggal_dokumen || null;

    const item = await prisma.dokumen.update({
      where: { id },
      data: updateData,
    });
    return item ? mapDokumen(item) : null;
  },

  async deleteDokumen(id: string): Promise<boolean> {
    try {
      await prisma.dokumen.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  },

  // Activity Logs
  async getLogs(): Promise<LogAktivitas[]> {
    const list = await prisma.logAktivitas.findMany({
      orderBy: { tanggal: "desc" },
      take: 1000,
    });
    return list.map(mapLogAktivitas);
  },

  async addLog(username: string, aktivitas: string, detail: string): Promise<LogAktivitas> {
    const item = await prisma.logAktivitas.create({
      data: {
        adminUsername: username,
        aktivitas,
        detail,
      },
    });
    return mapLogAktivitas(item);
  }
};
