import React, { useState, useEffect } from "react";
import { Plane, Calendar, ChevronRight, Folder, MapPin, ArrowLeft, Plus, X, Upload } from "lucide-react";
import { BandarUdara, Tahun, ActiveMenu, JenisArsip } from "../types.js";

interface AirportSelectorProps {
  token: string;
  activeCategory: ActiveMenu;
  onSelectScope: (airport: BandarUdara, year: Tahun) => void;
  addToast: (msg: string, type: "success" | "warning" | "error" | "info") => void;
  updateBreadcrumb: (path: string[]) => void;
}

export const AirportSelector: React.FC<AirportSelectorProps> = ({
  token,
  activeCategory,
  onSelectScope,
  addToast,
  updateBreadcrumb,
}) => {
  const [airports, setAirports] = useState<BandarUdara[]>([]);
  const [years, setYears] = useState<Tahun[]>([]);
  const [categories, setCategories] = useState<JenisArsip[]>([]);
  const [selectedAirport, setSelectedAirport] = useState<BandarUdara | null>(null);
  const [loading, setLoading] = useState(true);

  // Upload Form State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [formNama, setFormNama] = useState("");
  const [formNomor, setFormNomor] = useState("");
  const [formKeterangan, setFormKeterangan] = useState("");
  const [formKategoriId, setFormKategoriId] = useState("");
  const [formTanggal, setFormTanggal] = useState("");
  const [formFile, setFormFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Fetch initial airport, year, and category listings
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resB, resY, resC] = await Promise.all([
        fetch("/api/bandara", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/tahun", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/jenis-arsip", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const dataB = await resB.json();
      const dataY = await resY.json();
      const dataC = await resC.json();

      if (!resB.ok) throw new Error(dataB.message || "Failed to load airports");
      if (!resY.ok) throw new Error(dataY.message || "Failed to load years");
      if (!resC.ok) throw new Error(dataC.message || "Failed to load categories");

      setAirports(dataB);
      setYears(dataY);
      setCategories(dataC);
    } catch (err: any) {
      addToast(err.message || "Gagal memuat data dari database", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Reset selected airport when sidebar category switches
    setSelectedAirport(null);
  }, [token, activeCategory]);

  // Handle breadcrumbs representation
  useEffect(() => {
    const categoryLabel = activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1).replace("_", " ");
    if (selectedAirport) {
      updateBreadcrumb([categoryLabel, selectedAirport.nama_bandara]);
    } else {
      updateBreadcrumb([categoryLabel]);
    }
  }, [activeCategory, selectedAirport]);

  // Open upload modal with smart defaults
  const openUploadModal = () => {
    setFormNama("");
    setFormNomor("");
    setFormKeterangan("");
    setFormFile(null);
    setFormTanggal(new Date().toISOString().split("T")[0]);

    // Auto-populate Category matching selected tab
    const catObj = categories.find(c => c.nama_jenis.toLowerCase().replace(" ", "_") === activeCategory);
    setFormKategoriId(catObj ? catObj.id : categories[0]?.id || "");

    setIsUploadModalOpen(true);
  };

  // Submit Upload logic
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAirport) return;

    if (!formNama || !formNomor || !formKategoriId || !formTanggal || !formFile) {
      addToast("Semua kolom dan file wajib diisi!", "warning");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("nama_dokumen", formNama);
    formData.append("nomor_dokumen", formNomor);
    formData.append("keterangan", formKeterangan);
    formData.append("jenis_arsip_id", formKategoriId);
    formData.append("bandara_id", selectedAirport.id);
    
    // Automatically extract year from tanggal_dokumen to populate year grouping
    const extractedYear = formTanggal.split("-")[0] || new Date().getFullYear().toString();
    formData.append("tahun_id", extractedYear);
    formData.append("tanggal_dokumen", formTanggal);
    formData.append("file", formFile);

    try {
      const res = await fetch("/api/dokumen", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to upload document");

      addToast("Dokumen berhasil diunggah, direktori tahun otomatis dibuat!", "success");
      setIsUploadModalOpen(false);
      // Refresh to pull new years and dynamically render folders
      await fetchData();
    } catch (err: any) {
      addToast(err.message || "Gagal mengunggah file", "error");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <span className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
        <span className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
          Memuat daftar wilayah...
        </span>
      </div>
    );
  }

  const categoryTitle = activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1).replace("_", " ");

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Scope Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
            {selectedAirport 
              ? `${categoryTitle} > ${selectedAirport.nama_bandara}` 
              : `Arsip Bidang ${categoryTitle}`}
          </h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            {selectedAirport 
              ? "Silakan pilih salah satu Tahun Arsip di bawah untuk mengelola berkas." 
              : "Silakan pilih salah satu Bandar Udara di bawah untuk meninjau direktori berkas."}
          </p>
        </div>
        
        {selectedAirport && (
          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={openUploadModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Unggah Dokumen Baru</span>
            </button>
            <button
              onClick={() => setSelectedAirport(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali Ke Daftar Bandara</span>
            </button>
          </div>
        )}
      </div>

      {/* STAGE 1: AIRPORT SELECTOR */}
      {!selectedAirport ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {airports.map((airport) => (
            <div
              key={airport.id}
              onClick={() => setSelectedAirport(airport)}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 p-6 rounded-2xl shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0 group-hover:scale-110 transition">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                    {airport.nama_bandara}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-semibold uppercase tracking-wider">
                    KANTOR OTORITAS BANDARA WIL. X
                  </p>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <span>Lihat Direktori Arsip</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}

          {airports.length === 0 && (
            <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center rounded-2xl">
              <Folder className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-semibold">
                Belum ada Bandar Udara terdaftar di database.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* STAGE 2: YEAR SELECTOR FOR THE SELECTED AIRPORT */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {years.map((y) => (
            <div
              key={y.id}
              onClick={() => onSelectScope(selectedAirport, y)}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 p-6 rounded-2xl shadow-sm hover:shadow-md transition duration-300 cursor-pointer text-center relative overflow-hidden"
            >
              {/* Subtle top decoration */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition duration-300"></div>
              
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl inline-flex mb-4 group-hover:scale-110 transition">
                <Calendar className="w-8 h-8" />
              </div>
              
              <h3 className="font-display font-extrabold text-2xl text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition font-mono">
                Tahun {y.tahun}
              </h3>
              
              <p className="text-xs text-slate-400 mt-1 font-semibold">
                Direktori Berkas {categoryTitle}
              </p>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                <span>Buka Berkas</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}

          {years.length === 0 && (
            <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center rounded-2xl">
              <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4 animate-bounce" />
              <p className="text-slate-500 dark:text-slate-400 font-semibold mb-4">
                Belum ada Tahun Arsip terdaftar di database untuk bandar udara ini.
              </p>
              <button
                onClick={openUploadModal}
                className="mx-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-500/15"
              >
                <Plus className="w-4 h-4" />
                <span>Unggah Dokumen Pertama</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Upload Modal inside AirportSelector */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                Upload Dokumen Baru ({selectedAirport?.nama_bandara})
              </h3>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Nama Dokumen
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Laporan Pengawasan Sentani 2027"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Nomor Dokumen
                </label>
                <input
                  type="text"
                  placeholder="Contoh: KU.201/ANGUD/OTBAN/2027"
                  value={formNomor}
                  onChange={(e) => setFormNomor(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Bandar Udara
                  </label>
                  <input
                    type="text"
                    value={selectedAirport?.nama_bandara || ""}
                    disabled
                    className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 text-sm font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Tanggal Dokumen
                  </label>
                  <input
                    type="date"
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-sm cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Kategori / Jenis Arsip
                  </label>
                  <select
                    value={formKategoriId}
                    onChange={(e) => setFormKategoriId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-sm"
                    required
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.nama_jenis}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Keterangan Dokumen (Opsional)
                </label>
                <textarea
                  placeholder="Tambahkan keterangan rincian berkas jika perlu..."
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Pilih File Dokumen
                </label>
                <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-950 text-center hover:bg-slate-100/50 transition">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => setFormFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="selector-file-upload"
                    required
                  />
                  <label htmlFor="selector-file-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {formFile ? formFile.name : "Klik di sini untuk mencari berkas"}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 font-semibold">
                      Maks. 10MB | PDF, DOC, DOCX, XLS, XLSX
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {uploading ? "Sedang Mengunggah..." : "Mulai Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
