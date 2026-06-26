import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs/promises";
import multer from "multer";
import { put, del } from "@vercel/blob";
import { dbService } from "./server/db.js";

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "otban-x-super-secret-key-2026";



// Support JSON and urlencoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 10 * 1024 * 1024,
    },

    fileFilter: (req, file, cb) => {

        const allowed = [
            ".pdf",
            ".doc",
            ".docx",
            ".xls",
            ".xlsx"
        ];

        const ext = file.originalname
            .substring(file.originalname.lastIndexOf("."))
            .toLowerCase();

        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Format file tidak didukung."
                )
            );
        }
    },
});


// Authentication Middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Sesi habis atau tidak sah. Silakan login kembali." });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Token tidak valid atau kedaluwarsa." });
    }
    req.user = user;
    next();
  });
}

// ==========================================
// API ROUTES
// ==========================================

// 1. AUTHENTICATION
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username dan password wajib diisi." });
    }

    const admin = await dbService.getAdminByUsername(username);

    if (!admin || admin.password !== password) {
      try {
        await dbService.addLog(username || "Unknown", "Gagal Login", "Percobaan masuk dengan kredensial salah.");
      } catch (logErr) {
        console.error("Failed to add failed login log:", logErr);
      }
      return res.status(401).json({ message: "Username atau password salah." });
    }

    // Sign JWT Token
    const token = jwt.sign(
      { id: admin.id, username: admin.username, nama: admin.nama },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    try {
      await dbService.addLog(admin.username, "Login", "Berhasil masuk ke dalam sistem e-Arsip.");
    } catch (logErr) {
      console.error("Failed to add login log:", logErr);
    }

    res.json({
      token,
      user: {
        id: admin.id,
        nama: admin.nama,
        username: admin.username,
        createdAt: admin.createdAt,
      },
    });
  } catch (err: any) {
    console.error("Login route error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server: " + (err.message || String(err)) });
  }
});

app.post("/api/auth/logout", authenticateToken, async (req: any, res) => {
  await dbService.addLog(req.user.username, "Logout", "Berhasil keluar dari sistem e-Arsip.");
  res.json({ message: "Logout berhasil" });
});

app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
  const admin = await dbService.getAdminById(req.user.id);
  if (!admin) {
    return res.status(404).json({ message: "User tidak ditemukan" });
  }
  res.json({
    user: {
      id: admin.id,
      nama: admin.nama,
      username: admin.username,
      createdAt: admin.createdAt,
    },
  });
});

// 2. ADMIN MANAGEMENT (CRUD)
app.get("/api/admins", authenticateToken, async (req, res) => {
  const list = await dbService.getAdmins();
  const admins = list.map(a => ({
    id: a.id,
    nama: a.nama,
    username: a.username,
    createdAt: a.createdAt,
  }));
  res.json(admins);
});

app.post("/api/admins", authenticateToken, async (req: any, res) => {
  const { nama, username, password } = req.body;

  if (!nama || !username || !password) {
    return res.status(400).json({ message: "Semua kolom wajib diisi." });
  }

  const exists = await dbService.getAdminByUsername(username);
  if (exists) {
    return res.status(400).json({ message: "Username sudah digunakan admin lain." });
  }

  const newAdmin = await dbService.addAdmin(nama, username, password);
  await dbService.addLog(req.user.username, "Tambah Admin", `Membuat admin baru bernama "${nama}" (@${username}).`);

  res.status(201).json({
    id: newAdmin.id,
    nama: newAdmin.nama,
    username: newAdmin.username,
    createdAt: newAdmin.createdAt,
  });
});

app.put("/api/admins/:id", authenticateToken, async (req: any, res) => {
  const { nama, username, password } = req.body;
  const { id } = req.params;

  if (!nama || !username) {
    return res.status(400).json({ message: "Nama dan username wajib diisi." });
  }

  // Check username conflict
  const existing = await dbService.getAdminByUsername(username);
  if (existing && existing.id !== id) {
    return res.status(400).json({ message: "Username sudah digunakan admin lain." });
  }

  const updated = await dbService.updateAdmin(id, nama, username, password);
  if (!updated) {
    return res.status(404).json({ message: "Admin tidak ditemukan." });
  }

  await dbService.addLog(req.user.username, "Edit Admin", `Mengubah profil admin "${nama}" (@${username}).`);

  res.json({
    id: updated.id,
    nama: updated.nama,
    username: updated.username,
    createdAt: updated.createdAt,
  });
});

app.delete("/api/admins/:id", authenticateToken, async (req: any, res) => {
  const { id } = req.params;

  const targetAdmin = await dbService.getAdminById(id);
  if (!targetAdmin) {
    return res.status(404).json({ message: "Admin tidak ditemukan." });
  }

  // Prevent deleting oneself
  if (targetAdmin.username === req.user.username) {
    return res.status(400).json({ message: "Anda tidak dapat menghapus akun Anda sendiri." });
  }

  // Prevent deleting the primary admin
  if (targetAdmin.username === "angud2026") {
    return res.status(400).json({ message: "Akun admin utama angud2026 tidak dapat dihapus." });
  }

  await dbService.deleteAdmin(id);
  await dbService.addLog(req.user.username, "Hapus Admin", `Menghapus akun admin "${targetAdmin.nama}" (@${targetAdmin.username}).`);

  res.json({ message: "Admin berhasil dihapus." });
});

// 3. BANDAR UDARA (Airports)
app.get("/api/bandara", authenticateToken, async (req, res) => {
  res.json(await dbService.getBandarUdara());
});

app.post("/api/bandara", authenticateToken, async (req: any, res) => {
  const { nama_bandara } = req.body;
  if (!nama_bandara) {
    return res.status(400).json({ message: "Nama Bandar Udara wajib diisi." });
  }

  const list = await dbService.getBandarUdara();
  const exist = list.find(
    b => b.nama_bandara.toLowerCase() === nama_bandara.trim().toLowerCase()
  );
  if (exist) {
    return res.status(400).json({ message: "Bandar Udara sudah terdaftar." });
  }

  const newBandara = await dbService.addBandarUdara(nama_bandara);
  await dbService.addLog(req.user.username, "Tambah Bandara", `Menambahkan bandar udara baru: "${nama_bandara}".`);

  res.status(201).json(newBandara);
});

app.put("/api/bandara/:id", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { nama_bandara } = req.body;
  if (!nama_bandara) {
    return res.status(400).json({ message: "Nama Bandar Udara wajib diisi." });
  }

  const list = await dbService.getBandarUdara();
  const exist = list.find(
    b => b.nama_bandara.toLowerCase() === nama_bandara.trim().toLowerCase() && b.id !== id
  );
  if (exist) {
    return res.status(400).json({ message: "Nama Bandar Udara sudah digunakan." });
  }

  const updated = await dbService.updateBandarUdara(id, nama_bandara);
  if (!updated) {
    return res.status(404).json({ message: "Bandar Udara tidak ditemukan." });
  }

  await dbService.addLog(req.user.username, "Edit Bandara", `Mengubah nama bandar udara menjadi: "${nama_bandara}".`);
  res.json(updated);
});

app.delete("/api/bandara/:id", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const list = await dbService.getBandarUdara();
  const bandara = list.find(b => b.id === id);
  if (!bandara) {
    return res.status(404).json({ message: "Bandar Udara tidak ditemukan." });
  }

  const success = await dbService.deleteBandarUdara(id);
  if (!success) {
    return res.status(400).json({ message: "Tidak dapat menghapus. Bandar Udara ini masih memiliki arsip dokumen." });
  }

  await dbService.addLog(req.user.username, "Hapus Bandara", `Menghapus bandar udara: "${bandara.nama_bandara}".`);
  res.json({ message: "Bandar Udara berhasil dihapus." });
});

// 4. TAHUN
app.get("/api/tahun", authenticateToken, async (req, res) => {
  res.json(await dbService.getTahun());
});

app.post("/api/tahun", authenticateToken, async (req: any, res) => {
  const { tahun } = req.body;
  if (!tahun || isNaN(Number(tahun))) {
    return res.status(400).json({ message: "Tahun harus berupa angka valid." });
  }

  const list = await dbService.getTahun();
  const exist = list.find(t => t.tahun === tahun.trim());
  if (exist) {
    return res.status(400).json({ message: "Tahun sudah terdaftar." });
  }

  const newTahun = await dbService.addTahun(tahun);
  await dbService.addLog(req.user.username, "Tambah Tahun", `Menambahkan tahun arsip baru: "${tahun}".`);
  res.status(201).json(newTahun);
});

// 5. JENIS ARSIP (CATEGORIES)
app.get("/api/jenis-arsip", authenticateToken, async (req, res) => {
  res.json(await dbService.getJenisArsip());
});

// 6. DOKUMEN (GET with filtering, search, pagination)
app.get("/api/dokumen", authenticateToken, async (req, res) => {
  const { search, jenis_arsip_id, bandara_id, tahun_id, page, limit } = req.query;

  let list = await dbService.getDokumen();

  // Apply search filtering
  if (search) {
    const s = String(search).toLowerCase();
    list = list.filter(
      d =>
        d.nama_dokumen.toLowerCase().includes(s) ||
        d.nomor_dokumen.toLowerCase().includes(s) ||
        (d.keterangan && d.keterangan.toLowerCase().includes(s))
    );
  }

  // Apply categorical filtering
  if (jenis_arsip_id) {
    list = list.filter(d => d.jenis_arsip_id === jenis_arsip_id);
  }
  if (bandara_id) {
    list = list.filter(d => d.bandara_id === bandara_id);
  }
  if (tahun_id) {
    list = list.filter(d => d.tahun_id === tahun_id);
  }

  // Join collections data
  const airports = await dbService.getBandarUdara();
  const years = await dbService.getTahun();
  const categories = await dbService.getJenisArsip();

  const joinedList = list.map(doc => {
    const bandara = airports.find(b => b.id === doc.bandara_id)?.nama_bandara || "Unknown Airport";
    const tahun = years.find(y => y.id === doc.tahun_id)?.tahun || "Unknown Year";
    const kategori = categories.find(c => c.id === doc.jenis_arsip_id)?.nama_jenis || "Unknown Category";

    return {
      ...doc,
      nama_bandara: bandara,
      tahun: tahun,
      nama_kategori: kategori,
    };
  });

  // Pagination
  const pageNum = parseInt(String(page || "1"), 10);
  const limitNum = parseInt(String(limit || "10"), 10);
  const total = joinedList.length;
  const totalPages = Math.ceil(total / limitNum);
  const offset = (pageNum - 1) * limitNum;
  const paginatedList = joinedList.slice(offset, offset + limitNum);

  res.json({
    data: paginatedList,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    },
  });
});

// Document Upload endpoint
app.post("/api/dokumen", authenticateToken, upload.single("file"), async (req: any, res) => {
  try {
    const { nama_dokumen, nomor_dokumen, keterangan, jenis_arsip_id, bandara_id, tahun_id, tanggal_dokumen } = req.body;

    if (!nama_dokumen || !nomor_dokumen || !jenis_arsip_id || !bandara_id) {
      return res.status(400).json({ message: "Semua parameter wajib (kecuali keterangan) harus diisi." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "File dokumen wajib diunggah." });
    }

    // Default to today if not provided
    const docTanggal = tanggal_dokumen || new Date().toISOString().split("T")[0];

    // Automatically extract Year from document date
    let yearFromDate = docTanggal.split("-")[0];
    if (!yearFromDate || yearFromDate.length !== 4) {
      yearFromDate = new Date().getFullYear().toString();
    }

    // Resolve or auto-create Year record
    let finalTahunId = "";
    const existingYears = await dbService.getTahun();
    const foundByYearName = existingYears.find(y => y.tahun === yearFromDate);

    if (foundByYearName) {
      finalTahunId = foundByYearName.id;
    } else {
      const newTahunObj = await dbService.addTahun(yearFromDate);
      finalTahunId = newTahunObj.id;
    }

const blob = await put(
    `${Date.now()}-${req.file.originalname}`,
    req.file.buffer,
    {
        access: "public",
    }
);

const fileUrl = blob.url;

    const newDoc = await dbService.addDokumen({
      nama_dokumen,
      nomor_dokumen,
      keterangan: keterangan || "",
      jenis_arsip_id,
      bandara_id,
      tahun_id: finalTahunId,
      tanggal_dokumen: docTanggal,
      file_url: fileUrl,
      uploaded_by: req.user.username,
    });

    await dbService.addLog(
      req.user.username,
      "Upload Dokumen",
      `Mengunggah dokumen "${nama_dokumen}" (${nomor_dokumen}) untuk Bandar Udara ID: ${bandara_id}.`
    );

    res.status(201).json(newDoc);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Gagal mengunggah dokumen." });
  }
});

// Update Document Metadata
app.put("/api/dokumen/:id", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { nama_dokumen, nomor_dokumen, keterangan, jenis_arsip_id, bandara_id, tahun_id, tanggal_dokumen } = req.body;

  if (!nama_dokumen || !nomor_dokumen || !jenis_arsip_id || !bandara_id) {
    return res.status(400).json({ message: "Semua kolom wajib diisi." });
  }

  // Default to today if not provided
  const docTanggal = tanggal_dokumen || new Date().toISOString().split("T")[0];

  // Automatically extract Year from document date
  let yearFromDate = docTanggal.split("-")[0];
  if (!yearFromDate || yearFromDate.length !== 4) {
    yearFromDate = new Date().getFullYear().toString();
  }

  // Resolve or auto-create Year record
  let finalTahunId = "";
  const existingYears = await dbService.getTahun();
  const foundByYearName = existingYears.find(y => y.tahun === yearFromDate);

  if (foundByYearName) {
    finalTahunId = foundByYearName.id;
  } else {
    const newTahunObj = await dbService.addTahun(yearFromDate);
    finalTahunId = newTahunObj.id;
  }

  const updated = await dbService.updateDokumen(id, {
    nama_dokumen,
    nomor_dokumen,
    keterangan: keterangan || "",
    jenis_arsip_id,
    bandara_id,
    tahun_id: finalTahunId,
    tanggal_dokumen: docTanggal,
  });

  if (!updated) {
    return res.status(404).json({ message: "Dokumen tidak ditemukan." });
  }

  await dbService.addLog(
    req.user.username,
    "Edit Dokumen",
    `Mengubah metadata dokumen "${nama_dokumen}" (${nomor_dokumen}).`
  );

  res.json(updated);
});

// Delete Document
app.delete("/api/dokumen/:id", authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const list = await dbService.getDokumen();
    const doc = list.find(d => d.id === id);

    if (!doc) {
      return res.status(404).json({
        message: "Dokumen tidak ditemukan."
      });
    }

    if (doc.file_url?.includes("blob.vercel-storage.com")) {
      try {
        await del(doc.file_url);
      } catch (err) {
        console.error("Gagal menghapus Blob:", err);
      }
    }

    await dbService.deleteDokumen(id);

    await dbService.addLog(
      req.user.username,
      "Hapus Dokumen",
      `Menghapus dokumen "${doc.nama_dokumen}" (${doc.nomor_dokumen}).`
    );

    res.json({ message: "Dokumen berhasil dihapus." });
  } catch (error: any) {
    console.error("Delete document route error:", error);
    res.status(500).json({ message: error.message || "Gagal menghapus dokumen." });
  }
});

// Trigger download logger
app.post("/api/dokumen/:id/download-log", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const list = await dbService.getDokumen();
  const doc = list.find(d => d.id === id);
  if (doc) {
    await dbService.addLog(
      req.user.username,
      "Download Dokumen",
      `Mengunduh dokumen "${doc.nama_dokumen}" (${doc.nomor_dokumen}).`
    );
  }
  res.json({ status: "success" });
});

function getFileExtensionFromUrl(fileUrl: string): string {
  if (!fileUrl) return "";
  const clean = fileUrl.split("?")[0].split("#")[0];
  const match = clean.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : "";
}

function getContentType(ext: string): string {
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "doc":
      return "application/msword";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "xls":
      return "application/vnd.ms-excel";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    default:
      return "application/octet-stream";
  }
}

function buildDownloadFilename(doc: { nama_dokumen: string; nomor_dokumen: string; file_url: string }): string {
  const ext = getFileExtensionFromUrl(doc.file_url) || "pdf";
  const baseName = (doc.nama_dokumen || doc.nomor_dokumen || "dokumen")
    .replace(/[^\w\s\-().]/g, "_")
    .trim()
    .slice(0, 120);
  return `${baseName}.${ext}`;
}

async function loadDocumentFile(fileUrl: string): Promise<{ buffer: Buffer; contentType: string }> {
  if (!fileUrl) {
    throw new Error("File dokumen tidak tersedia.");
  }

  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error("File dokumen tidak ditemukan di penyimpanan.");
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const ext = getFileExtensionFromUrl(fileUrl);
    const contentType = response.headers.get("content-type") || getContentType(ext);
    return { buffer, contentType };
  }

  const localPath = path.join(process.cwd(), fileUrl.replace(/^\//, ""));
  const buffer = await fs.readFile(localPath);
  const ext = getFileExtensionFromUrl(fileUrl);
  return { buffer, contentType: getContentType(ext) };
}

// Proxy file download / preview (menghindari masalah CORS Vercel Blob)
app.get("/api/dokumen/:id/file", authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const list = await dbService.getDokumen();
    const doc = list.find(d => d.id === id);

    if (!doc) {
      return res.status(404).json({ message: "Dokumen tidak ditemukan." });
    }

    const { buffer, contentType } = await loadDocumentFile(doc.file_url);
    const filename = buildDownloadFilename(doc);
    const inline = req.query.inline === "1";
    const disposition = inline ? "inline" : "attachment";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `${disposition}; filename="${encodeURIComponent(filename)}"`);
    res.setHeader("Cache-Control", "private, max-age=3600");
    res.send(buffer);
  } catch (error: any) {
    console.error("Document file route error:", error);
    res.status(500).json({ message: error.message || "Gagal memuat file dokumen." });
  }
});

// 7. DASHBOARD METRICS
app.get("/api/dashboard/metrics", authenticateToken, async (req, res) => {
  const docs = await dbService.getDokumen();
  const airports = await dbService.getBandarUdara();
  const categories = await dbService.getJenisArsip();
  const years = await dbService.getTahun();

  const currentYear = new Date().getFullYear().toString();
  const uploadThisYearCount = docs.filter(d => {
    // Check if document was uploaded in current calendar year or belongs to current year
    const docYearRelation = years.find(y => y.id === d.tahun_id);
    return docYearRelation && docYearRelation.tahun === currentYear;
  }).length;

  // Documents per Category
  const docsByCategory = categories.map(c => {
    const count = docs.filter(d => d.jenis_arsip_id === c.id).length;
    return { name: c.nama_jenis, value: count };
  });

  // Documents per Year
  const docsByYear = years.map(y => {
    const count = docs.filter(d => d.tahun_id === y.id).length;
    return { name: y.tahun, value: count };
  });

  // Recent 5 documents
  const joinedDocs = docs.slice(0, 5).map(doc => {
    const bandara = airports.find(b => b.id === doc.bandara_id)?.nama_bandara || "Unknown Airport";
    const tahun = years.find(y => y.id === doc.tahun_id)?.tahun || "Unknown Year";
    const kategori = categories.find(c => c.id === doc.jenis_arsip_id)?.nama_jenis || "Unknown Category";
    return {
      ...doc,
      nama_bandara: bandara,
      tahun: tahun,
      nama_kategori: kategori,
    };
  });

  res.json({
    totalDokumen: docs.length,
    totalUploadTahunIni: uploadThisYearCount,
    totalKategori: categories.length,
    docsByCategory,
    docsByYear,
    recentDocs: joinedDocs,
  });
});

// 8. LOGS LIST WITH PAGINATION
app.get("/api/logs", authenticateToken, async (req, res) => {
  const { page, limit } = req.query;
  const list = await dbService.getLogs();

  const pageNum = parseInt(String(page || "1"), 10);
  const limitNum = parseInt(String(limit || "15"), 10);
  const total = list.length;
  const totalPages = Math.ceil(total / limitNum);
  const offset = (pageNum - 1) * limitNum;
  const paginatedLogs = list.slice(offset, offset + limitNum);

  res.json({
    data: paginatedLogs,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    },
  });
});

// ==========================================
// VITE OR STATIC FRONTEND MIDDLEWARE & START
// ==========================================
async function start() {
  const distPath = path.join(process.cwd(), "dist");
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Start full-stack server
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

start();

export default app;