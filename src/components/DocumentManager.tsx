import React, { useState, useEffect } from "react";
import {
  FileText,
  Upload,
  Search,
  Plus,
  Trash2,
  Edit2,
  Download,
  Eye,
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  X,
  FileSpreadsheet,
  FileIcon,
  HelpCircle,
  AlertCircle,
  Folder
} from "lucide-react";
import { BandarUdara, Tahun, ActiveMenu, Dokumen, JenisArsip } from "../types.js";
import {
  downloadDocument,
  fetchDocumentBlob,
  getFileExtension,
  isPdfFile,
  logDocumentDownload,
} from "../utils/documentFile.js";
import { findCategoryForMenu } from "../utils/archiveCategories.js";

interface DocumentManagerProps {
  token: string;
  activeCategory: ActiveMenu;
  selectedYear: Tahun | null;
  onSelectYear: (year: Tahun | null) => void;
  addToast: (msg: string, type: "success" | "warning" | "error" | "info") => void;
  updateBreadcrumb: (path: string[]) => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  token,
  activeCategory,
  selectedYear,
  onSelectYear,
  addToast,
  updateBreadcrumb,
}) => {
  const [documents, setDocuments] = useState<Dokumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);

  // Lists for dropdown options
  const [airports, setAirports] = useState<BandarUdara[]>([]);
  const [years, setYears] = useState<Tahun[]>([]);
  const [categories, setCategories] = useState<JenisArsip[]>([]);

  // Year counts mapping for folders
  const [yearCounts, setYearCounts] = useState<Record<string, number>>({});

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Selected document state for action modals
  const [selectedDoc, setSelectedDoc] = useState<Dokumen | null>(null);

  // Form Fields State (Upload/Edit)
  const [formNama, setFormNama] = useState("");
  const [formNomor, setFormNomor] = useState("");
  const [formKeterangan, setFormKeterangan] = useState("");
  const [formKategoriId, setFormKategoriId] = useState("");
  const [formBandaraId, setFormBandaraId] = useState("");
  const [formTanggal, setFormTanggal] = useState("");
  const [formFile, setFormFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Fetch helper lists (Airports, Years, Categories)
  const fetchHelpers = async () => {
    try {
      const [resB, resY, resC] = await Promise.all([
        fetch("/api/bandara", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/tahun", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/jenis-arsip", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setAirports(await resB.json());
      setYears(await resY.json());
      setCategories(await resC.json());
    } catch (err) {
      console.error("Failed to load options", err);
    }
  };

  // Compute Year Counts for Folders dynamically based on category
  const fetchYearCounts = async () => {
    if (categories.length === 0) return;
    try {
      const activeCatObj = findCategoryForMenu(categories, activeCategory);
      if (!activeCatObj) return;

      const res = await fetch(`/api/dokumen?limit=100000&jenis_arsip_id=${activeCatObj.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.data) {
        const counts: Record<string, number> = {};
        data.data.forEach((doc: any) => {
          counts[doc.tahun_id] = (counts[doc.tahun_id] || 0) + 1;
        });
        setYearCounts(counts);
      }
    } catch (err) {
      console.error("Failed to compute year folder counts", err);
    }
  };

  // Main documents fetch
  const fetchDocuments = async () => {
    if (!selectedYear) return;
    setLoading(true);
    try {
      let query = `?page=${page}&limit=8`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      query += `&tahun_id=${selectedYear.id}`;
      
      // Scoped by category
      const activeCatObj = findCategoryForMenu(categories, activeCategory);
      if (activeCatObj) {
        query += `&jenis_arsip_id=${activeCatObj.id}`;
      }

      const res = await fetch(`/api/dokumen${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load documents");

      setDocuments(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalDocs(data.pagination.total);
    } catch (err: any) {
      addToast(err.message || "Gagal memuat dokumen", "error");
    } finally {
      setLoading(false);
    }
  };

  // Trigger search with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      if (categories.length > 0 && selectedYear) {
        fetchDocuments();
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  // Initial trigger
  useEffect(() => {
    fetchHelpers();
  }, [token]);

  // Refetch when helper lists, scoped details, activeCategory, or page switches
  useEffect(() => {
    if (categories.length > 0) {
      fetchYearCounts();
      if (selectedYear) {
        fetchDocuments();
      }
    }
  }, [categories, activeCategory, selectedYear, page]);

  // Sync breadcrumbs with parents
  useEffect(() => {
    const categoryTitle = activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1).replace("_", " ");
    if (selectedYear) {
      updateBreadcrumb([categoryTitle, `Tahun ${selectedYear.tahun}`]);
    } else {
      updateBreadcrumb([categoryTitle]);
    }
  }, [activeCategory, selectedYear]);

  useEffect(() => {
    if (!isPreviewModalOpen || !selectedDoc) {
      setPreviewBlobUrl(null);
      setPreviewLoading(false);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    const loadPreview = async () => {
      setPreviewLoading(true);
      setPreviewBlobUrl(null);

      try {
        const blob = await fetchDocumentBlob(token, selectedDoc.id);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPreviewBlobUrl(objectUrl);
      } catch (err: any) {
        if (!cancelled) {
          addToast(err.message || "Gagal memuat pratinjau dokumen", "error");
        }
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [isPreviewModalOpen, selectedDoc?.id, token]);

  const handleDownloadDocument = async (doc: Dokumen) => {
    try {
      await downloadDocument(token, doc);
      await logDocumentDownload(token, doc.id);
      addToast(`Berhasil mengunduh "${doc.nama_dokumen}"`, "success");
    } catch (err: any) {
      addToast(err.message || "Gagal mengunduh dokumen", "error");
    }
  };

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
    }
    setPreviewBlobUrl(null);
    setPreviewLoading(false);
  };

  // Pre-populate Form for Upload matching the active scope
  const openUploadModal = () => {
    setFormNama("");
    setFormNomor("");
    setFormKeterangan("");
    setFormFile(null);

    // Auto-populate Category matching selected tab
    const catObj = findCategoryForMenu(categories, activeCategory);
    setFormKategoriId(catObj ? catObj.id : categories[0]?.id || "");

    // Default to first airport and selected year date or today's date
    setFormBandaraId(airports[0]?.id || "");
    setFormTanggal(selectedYear ? `${selectedYear.tahun}-01-01` : new Date().toISOString().split("T")[0]);

    setIsUploadModalOpen(true);
  };

  // Pre-populate Form for Edit
  const openEditModal = (doc: Dokumen) => {
    setSelectedDoc(doc);
    setFormNama(doc.nama_dokumen);
    setFormNomor(doc.nomor_dokumen);
    setFormKeterangan(doc.keterangan || "");
    setFormKategoriId(doc.jenis_arsip_id);
    setFormBandaraId(doc.bandara_id);
    setFormTanggal(doc.tanggal_dokumen || doc.created_at.split("T")[0] || new Date().toISOString().split("T")[0]);
    setIsEditModalOpen(true);
  };

  // Handle document submission (UPLOAD)
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama || !formNomor || !formKategoriId || !formBandaraId || !formTanggal || !formFile) {
      addToast("Semua kolom dan file wajib diisi!", "warning");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("nama_dokumen", formNama);
    formData.append("nomor_dokumen", formNomor);
    formData.append("keterangan", formKeterangan);
    formData.append("jenis_arsip_id", formKategoriId);
    formData.append("bandara_id", formBandaraId);
    
    // Extracted year
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

      addToast("Dokumen berhasil diunggah dan terarsip!", "success");
      setIsUploadModalOpen(false);
      
      // Reload years helper and year counts to reflect dynamic folder creation
      await fetchHelpers();
      
      // If we are currently in the folder view, just refresh counts
      if (!selectedYear) {
        await fetchYearCounts();
      } else {
        // If uploaded file belongs to current selectedYear, refresh document lists
        const fileYear = formTanggal.split("-")[0];
        if (fileYear === selectedYear.tahun) {
          fetchDocuments();
        } else {
          // If uploaded file belongs to a different year, optionally switch folder or stay
          addToast(`File masuk otomatis ke folder tahun ${fileYear}`, "info");
          fetchYearCounts();
        }
      }
    } catch (err: any) {
      addToast(err.message || "Gagal mengunggah file", "error");
    } finally {
      setUploading(false);
    }
  };

  // Handle Metadata updates (EDIT)
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    if (!formNama || !formNomor || !formKategoriId || !formBandaraId || !formTanggal) {
      addToast("Kolom wajib diisi!", "warning");
      return;
    }

    try {
      const res = await fetch(`/api/dokumen/${selectedDoc.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama_dokumen: formNama,
          nomor_dokumen: formNomor,
          keterangan: formKeterangan,
          jenis_arsip_id: formKategoriId,
          bandara_id: formBandaraId,
          tanggal_dokumen: formTanggal,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update document");

      addToast("Metadata dokumen berhasil diperbarui!", "success");
      setIsEditModalOpen(false);
      await fetchHelpers();
      fetchYearCounts();
      if (selectedYear) {
        fetchDocuments();
      }
    } catch (err: any) {
      addToast(err.message || "Gagal memperbarui dokumen", "error");
    }
  };

  // Handle document deletion (DELETE)
  const handleDeleteConfirm = async () => {
    if (!selectedDoc) return;

    try {
      const res = await fetch(`/api/dokumen/${selectedDoc.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete document");

      addToast("Dokumen berhasil dihapus dari sistem.", "success");
      setIsDeleteModalOpen(false);
      await fetchHelpers();
      fetchYearCounts();
      if (selectedYear) {
        fetchDocuments();
      }
    } catch (err: any) {
      addToast(err.message || "Gagal menghapus dokumen", "error");
    }
  };

  const getFileIcon = (url: string) => {
    const ext = getFileExtension(url);
    if (ext === "pdf") {
      return <FileText className="w-5 h-5 text-rose-500" />;
    } else if (["xls", "xlsx"].includes(ext)) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    } else {
      return <FileIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDocumentDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {!selectedYear ? (
        /* FOLDER LIST VIEW (DYNAMIC FOLDERS CREATED BY SYSTEM) */
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
            <div>
              <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white capitalize">
                Arsip {activeCategory.replace("_", " ")}
              </h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                Seluruh berkas dikelompokkan otomatis ke dalam folder tahun di bawah berdasarkan tanggal berkas.
              </p>
            </div>

            <button
              onClick={openUploadModal}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-700/30 flex items-center justify-center gap-2 transition duration-150 cursor-pointer self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Dokumen</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {years.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
                <p className="text-xs font-semibold text-slate-400 mt-2 font-mono">Memuat direktori berkas...</p>
              </div>
            ) : (
              years
                .slice()
                .sort((a, b) => b.tahun.localeCompare(a.tahun))
                .map((y) => {
                  const count = yearCounts[y.id] || 0;
                  return (
                    <button
                      key={y.id}
                      id={`year-folder-${y.tahun}`}
                      onClick={() => onSelectYear(y)}
                      className="flex flex-col items-start p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-md rounded-2xl transition duration-300 group text-left w-full cursor-pointer relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition duration-300"></div>
                      
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400 rounded-xl group-hover:scale-110 transition duration-300 mb-4 shadow-xs">
                        <Folder className="w-8 h-8 fill-amber-400/20" />
                      </div>
                      
                      <h3 className="font-display font-bold text-lg text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                        Tahun {y.tahun}
                      </h3>
                      
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2 font-mono">
                        {count} berkas terarsip
                      </p>
                    </button>
                  );
                })
            )}
          </div>
        </>
      ) : (
        /* DOCUMENT TABLE LIST VIEW INSIDE SPECIFIC FOLDER */
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
            <div className="flex items-start gap-4">
              <button
                onClick={() => onSelectYear(null)}
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
                title="Kembali ke Pilihan Folder Tahun"
              >
                <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              </button>
              <div>
                <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white capitalize">
                  Folder Tahun: {selectedYear.tahun} ({activeCategory.replace("_", " ")})
                </h2>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  Berisi dokumen angkutan udara yang terdaftar pada tahun {selectedYear.tahun}
                </p>
              </div>
            </div>

            <button
              onClick={openUploadModal}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-700/30 flex items-center justify-center gap-2 transition duration-150 cursor-pointer self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Dokumen</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:max-w-md">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Search className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  placeholder="Cari nama, nomor, atau keterangan dokumen..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-sm shadow-sm"
                />
              </div>

              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                Total Dokumen: <span className="text-emerald-600 dark:text-emerald-400 font-mono">{totalDocs} berkas</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                    <th className="py-4 px-4 md:px-6 w-12 text-center hidden sm:table-cell">No</th>
                    <th className="py-4 px-4 md:px-6">Nama & Nomor Dokumen</th>
                    <th className="py-4 px-6 hidden lg:table-cell">Bandara</th>
                    <th className="py-4 px-6 hidden md:table-cell">Penyusun</th>
                    <th className="py-4 px-6 hidden sm:table-cell">Tanggal Berkas</th>
                    <th className="py-4 px-4 md:px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <span className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
                        <p className="text-xs font-semibold text-slate-400 mt-2 font-mono">Membaca arsip database...</p>
                      </td>
                    </tr>
                  ) : documents.length > 0 ? (
                    documents.map((doc, index) => {
                      const itemIndex = (page - 1) * 8 + index + 1;
                      return (
                        <tr
                          key={doc.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition text-slate-700 dark:text-slate-300"
                        >
                          <td className="py-4 px-6 text-center font-mono font-bold text-slate-400 hidden sm:table-cell">
                            {itemIndex}
                          </td>
                          <td className="py-4 px-4 md:px-6 max-w-xs md:max-w-sm">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0 mt-0.5">
                                {getFileIcon(doc.file_url)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800 dark:text-slate-100 leading-snug">
                                  {doc.nama_dokumen}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1 font-semibold truncate">
                                  No: {doc.nomor_dokumen}
                                </p>
                                <div className="flex flex-col gap-1 mt-1.5 lg:hidden">
                                  {doc.keterangan && (
                                    <p className="text-[11px] text-slate-400 italic truncate" title={doc.keterangan}>
                                      Ket: {doc.keterangan}
                                    </p>
                                  )}
                                  <div className="flex flex-wrap gap-1.5 items-center mt-0.5">
                                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[9px] font-semibold md:hidden">
                                      @{doc.uploaded_by}
                                    </span>
                                    <span className="px-1.5 py-0.5 bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 rounded text-[9px] font-mono sm:hidden">
                                      {formatDocumentDate(doc.tanggal_dokumen || doc.created_at)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 max-w-xs hidden lg:table-cell">
                            <p className="truncate font-semibold text-slate-600 dark:text-slate-400 leading-relaxed" title={doc.nama_bandara}>
                              {doc.nama_bandara || "-"}
                            </p>
                          </td>
                          <td className="py-4 px-6 font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell">
                            @{doc.uploaded_by}
                          </td>
                          <td className="py-4 px-6 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:table-cell">
                            {formatDocumentDate(doc.tanggal_dokumen || doc.created_at)}
                          </td>
                          <td className="py-4 px-4 md:px-6 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedDoc(doc);
                                  setIsPreviewModalOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition"
                                title="Pratinjau Arsip"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => handleDownloadDocument(doc)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition inline-flex items-center justify-center"
                                title="Unduh Berkas"
                              >
                                <Download className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => openEditModal(doc)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg transition"
                                title="Ubah Metadata"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedDoc(doc);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition"
                                title="Hapus Dokumen"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                        Belum ada dokumen yang diunggah untuk folder tahun ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/10">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-semibold">
                  Halaman {page} dari {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-xs disabled:opacity-50 transition cursor-pointer"
                  >
                    Sebelumnya
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-xs disabled:opacity-50 transition cursor-pointer"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ==========================================
          MODAL 1: UPLOAD DOKUMEN MODAL
          ========================================== */}
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
                Upload Dokumen Baru
              </h3>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Nama Dokumen
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Laporan Pengawasan Sentani 2025"
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
                  placeholder="Contoh: KU.201/ANGUD/OTBAN/2025"
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
                  <select
                    value={formBandaraId}
                    onChange={(e) => setFormBandaraId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-sm"
                    required
                  >
                    {airports.map(b => (
                      <option key={b.id} value={b.id}>{b.nama_bandara}</option>
                    ))}
                  </select>
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
                    id="file-upload"
                    required
                  />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
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

      {/* ==========================================
          MODAL 2: EDIT METADATA MODAL
          ========================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <Edit2 className="w-5 h-5 text-amber-500" />
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                Edit Metadata Dokumen
              </h3>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Nama Dokumen
                </label>
                <input
                  type="text"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Nomor Dokumen
                </label>
                <input
                  type="text"
                  value={formNomor}
                  onChange={(e) => setFormNomor(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Bandar Udara
                  </label>
                  <select
                    value={formBandaraId}
                    onChange={(e) => setFormBandaraId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition text-sm"
                    required
                  >
                    {airports.map(b => (
                      <option key={b.id} value={b.id}>{b.nama_bandara}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Tanggal Dokumen
                  </label>
                  <input
                    type="date"
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition text-sm cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Kategori
                </label>
                <select
                  value={formKategoriId}
                  onChange={(e) => setFormKategoriId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition text-sm"
                  required
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.nama_jenis}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Keterangan (Opsional)
                </label>
                <textarea
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition text-sm"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 3: CONFIRM DELETE MODAL
          ========================================== */}
      {isDeleteModalOpen && selectedDoc && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center p-4">
              <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-full mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white mb-2">
                Konfirmasi Hapus Arsip
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                Apakah Anda benar-benar yakin ingin menghapus berkas <strong className="text-slate-800 dark:text-slate-200">"{selectedDoc.nama_dokumen}"</strong>? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Hapus Permanen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 4: PREVIEW DOKUMEN MODAL
          ========================================== */}
      {isPreviewModalOpen && selectedDoc && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl p-6 relative max-h-[90vh] flex flex-col">
            <button
              onClick={closePreviewModal}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3.5 mb-5 border-b border-slate-100 dark:border-slate-800 pb-4 pr-10">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
                {getFileIcon(selectedDoc.file_url)}
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                  {selectedDoc.nama_dokumen}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 font-semibold">
                  Nomor: {selectedDoc.nomor_dokumen}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 p-2 pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Bandar Udara:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 ml-auto">{selectedDoc.nama_bandara || "Internal database"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Tahun Arsip:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 ml-auto">{selectedDoc.tahun || "2025"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Waktu Unggah:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 ml-auto">{formatDate(selectedDoc.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Penyusun:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 ml-auto">@{selectedDoc.uploaded_by}</span>
                </div>
              </div>

              {selectedDoc.keterangan && (
                <div className="p-4 bg-emerald-50/20 dark:bg-emerald-950/5 border border-emerald-100/30 dark:border-emerald-900/10 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 font-mono">
                    Keterangan
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedDoc.keterangan}
                  </p>
                </div>
              )}

              {isPdfFile(selectedDoc.file_url) ? (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden h-96 shadow-sm bg-slate-100 dark:bg-slate-950/40">
                  {previewLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <span className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
                    </div>
                  ) : previewBlobUrl ? (
                    <iframe
                      src={previewBlobUrl}
                      className="w-full h-full border-none"
                      title={selectedDoc.nama_dokumen}
                    ></iframe>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-slate-500 dark:text-slate-400 px-6 text-center">
                      Pratinjau PDF tidak dapat dimuat. Silakan unduh file terlebih dahulu.
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-950/20 flex flex-col items-center">
                  <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Pratinjau tidak tersedia untuk format ini
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-medium max-w-sm">
                    Dokumen berekstensi non-PDF (Word/Excel) harus diunduh terlebih dahulu untuk meninjau seluruh konten.
                  </p>
                  <button
                    onClick={() => handleDownloadDocument(selectedDoc)}
                    className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/10 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File Sekarang</span>
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 mt-4">
              <button
                onClick={closePreviewModal}
                className="px-4.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
