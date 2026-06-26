import React, { useEffect, useState } from "react";
import {
  FileText,
  Upload,
  Layers,
  ChevronRight,
  TrendingUp,
  Download,
  Eye,
  FileSpreadsheet,
  FileIcon,
  ExternalLink
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { DashboardMetrics, Dokumen } from "../types.js";
import {
  downloadDocument,
  getFileExtension,
  logDocumentDownload,
} from "../utils/documentFile.js";

interface DashboardViewProps {
  token: string;
  onNavigateToSection: (section: string, arg?: any) => void;
  addToast: (msg: string, type: "success" | "warning" | "error" | "info") => void;
  onPreviewDocument: (doc: Dokumen) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  token,
  onNavigateToSection,
  addToast,
  onPreviewDocument,
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/dashboard/metrics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load dashboard metrics");
      setMetrics(data);
    } catch (err: any) {
      addToast(err.message || "Gagal memuat metrik dashboard", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [token]);

  // Color constants for Recharts Pie Chart
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#6366f1"];

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

  const handleDownloadDocument = async (doc: Dokumen) => {
    try {
      await downloadDocument(token, doc);
      await logDocumentDownload(token, doc.id);
      addToast(`Berhasil mengunduh "${doc.nama_dokumen}"`, "success");
    } catch (err: any) {
      addToast(err.message || "Gagal mengunduh dokumen", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <span className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
        <span className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
          Memuat analisa data e-Arsip...
        </span>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Dokumen Arsip",
      value: metrics?.totalDokumen || 0,
      desc: "Seluruh berkas terarsip di sistem",
      icon: <FileText className="w-6 h-6" />,
      iconBg: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Arsip Tahun Ini",
      value: metrics?.totalUploadTahunIni || 0,
      desc: `Unggahan terdaftar untuk tahun ${new Date().getFullYear()}`,
      icon: <Upload className="w-6 h-6" />,
      iconBg: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Total Kategori Dokumen",
      value: metrics?.totalKategori || 0,
      desc: "Pembagian jenis administrasi",
      icon: <Layers className="w-6 h-6" />,
      iconBg: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Intro Box */}
      <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-6 md:p-8 text-white shadow-sm border border-slate-800 relative overflow-hidden">
        {/* Decorative background grid elements */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative z-10">
          <h2 className="font-display font-extrabold text-2xl md:text-3xl leading-tight text-white">
            Sistem e-Arsip Angkutan Udara OTBAN X
          </h2>
          <p className="text-slate-300 text-sm md:text-base mt-2 max-w-2xl font-light">
            Selamat datang kembali. Melalui dasbor ini, Anda dapat mengelola arsip digital hasil pengawasan, rapat koordinasi, PPRP, laporan lalu lintas, dan berita acara rekonsiliasi.
          </p>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition duration-300"
          >
            <div className={`p-3 rounded-xl shrink-0 ${card.iconBg}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                {card.title}
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5 font-display tracking-tight">
                {card.value}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {card.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Graphical Analyses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Bar Chart - Documents per Year */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h4 className="font-display font-bold text-base text-slate-800 dark:text-white">
              Arsip Dokumen Per Tahun
            </h4>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.docsByYear || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(16, 185, 129, 0.05)" }}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Documents per Category */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Layers className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h4 className="font-display font-bold text-base text-slate-800 dark:text-white">
              Penyebaran Arsip Per Kategori
            </h4>
          </div>
          <div className="h-64 flex flex-col md:flex-row items-center justify-center">
            <div className="w-full md:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics?.docsByCategory || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(metrics?.docsByCategory || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legend for Categories */}
            <div className="w-full md:w-1/2 flex flex-col gap-2.5 mt-4 md:mt-0 px-4">
              {(metrics?.docsByCategory || []).map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></span>
                    <span className="text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                      {entry.name}
                    </span>
                  </div>
                  <span className="font-mono text-slate-800 dark:text-white">
                    {entry.value} file
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Recent Uploads Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h4 className="font-display font-bold text-base text-slate-800 dark:text-white">
              Arsip Dokumen Terbaru
            </h4>
          </div>
          <button
            onClick={() => onNavigateToSection("pengawasan")}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>Selengkapnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-4 px-4 md:px-6">Nama Dokumen</th>
                <th className="py-4 px-6 hidden md:table-cell">Kategori</th>
                <th className="py-4 px-6 hidden lg:table-cell">Bandar Udara</th>
                <th className="py-4 px-6 text-center hidden sm:table-cell">Tahun</th>
                <th className="py-4 px-4 md:px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {metrics?.recentDocs && metrics.recentDocs.length > 0 ? (
                metrics.recentDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition text-slate-700 dark:text-slate-300"
                  >
                    <td className="py-4 px-4 md:px-6 max-w-xs md:max-w-md">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0 mt-0.5">
                          {getFileIcon(doc.file_url)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-100 truncate">
                            {doc.nama_dokumen}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">
                            No: {doc.nomor_dokumen}
                          </p>
                          {/* Sub-info badge wrapper only visible on mobile/tablet */}
                          <div className="flex flex-wrap gap-1.5 mt-1.5 lg:hidden">
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-semibold md:hidden">
                              {doc.nama_kategori}
                            </span>
                            <span className="px-2 py-0.5 bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 rounded text-[10px] font-semibold">
                              {doc.nama_bandara}
                            </span>
                            <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded text-[10px] font-bold font-mono sm:hidden">
                              {doc.tahun}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 hidden md:table-cell">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-semibold">
                        {doc.nama_kategori}
                      </span>
                    </td>
                    <td className="py-4 px-6 hidden lg:table-cell font-semibold text-slate-600 dark:text-slate-400">
                      {doc.nama_bandara}
                    </td>
                    <td className="py-4 px-6 text-center hidden sm:table-cell font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {doc.tahun}
                    </td>
                    <td className="py-4 px-4 md:px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onPreviewDocument(doc)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition"
                          title="Pratinjau File"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(doc)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition inline-flex items-center justify-center"
                          title="Unduh File"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    Belum ada berkas terunggah di sistem.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
