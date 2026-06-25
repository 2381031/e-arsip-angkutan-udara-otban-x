import React, { useState, useEffect } from "react";
import { Activity, Search, RefreshCw, Clock, User, MessageSquare } from "lucide-react";
import { LogAktivitas } from "../types.js";

interface ActivityLogsProps {
  token: string;
  addToast: (msg: string, type: "success" | "warning" | "error" | "info") => void;
}

export const ActivityLogs: React.FC<ActivityLogsProps> = ({
  token,
  addToast,
}) => {
  const [logs, setLogs] = useState<LogAktivitas[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = `?page=${page}&limit=15`;
      const res = await fetch(`/api/logs${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memuat log");

      setLogs(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalLogs(data.pagination.total);
    } catch (err: any) {
      addToast(err.message || "Gagal memuat log aktivitas", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token, page]);

  // Color coordinate badges based on actions
  const getActivityBadge = (activity: string) => {
    const act = activity.toLowerCase();
    if (act.includes("upload") || act.includes("tambah")) {
      return (
        <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 text-xs font-bold rounded-full">
          {activity}
        </span>
      );
    } else if (act.includes("login") && !act.includes("gagal")) {
      return (
        <span className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-900/30 text-xs font-bold rounded-full">
          {activity}
        </span>
      );
    } else if (act.includes("edit") || act.includes("ubah")) {
      return (
        <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 text-xs font-bold rounded-full">
          {activity}
        </span>
      );
    } else if (act.includes("download") || act.includes("unduh")) {
      return (
        <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 text-xs font-bold rounded-full">
          {activity}
        </span>
      );
    } else {
      // Deletions / Logouts / Failed Attempts
      return (
        <span className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 text-xs font-bold rounded-full">
          {activity}
        </span>
      );
    }
  };

  const filteredLogs = logs.filter(l => {
    const s = search.toLowerCase();
    return (
      l.admin_username.toLowerCase().includes(s) ||
      l.aktivitas.toLowerCase().includes(s) ||
      (l.detail && l.detail.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
            Log Audit Aktivitas Sistem
          </h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            Riwayat log terperinci dari semua operasi administratif yang dilakukan oleh petugas OTBAN Wilayah X.
          </p>
        </div>

        <button
          onClick={() => {
            setPage(1);
            fetchLogs();
          }}
          className="px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer self-start md:self-auto border border-slate-200 dark:border-slate-700"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Muat Ulang Riwayat</span>
        </button>
      </div>

      {/* Audit Trails Table Block */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Search header bar */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Cari log berdasarkan operator, aktivitas, detail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-sm shadow-sm"
            />
          </div>

          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
            Total Log Terdaftar: <span className="text-emerald-600 dark:text-emerald-400 font-mono">{totalLogs} baris</span>
          </div>
        </div>

        {/* Content table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-4 px-4 md:px-6 w-12 text-center hidden sm:table-cell">No</th>
                <th className="py-4 px-4 md:px-6">Waktu & Tanggal</th>
                <th className="py-4 px-6 hidden sm:table-cell">Operator</th>
                <th className="py-4 px-4 md:px-6">Aktivitas</th>
                <th className="py-4 px-6 hidden md:table-cell">Detail Riwayat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <span className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => {
                  const itemIndex = (page - 1) * 15 + index + 1;
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition text-slate-700 dark:text-slate-300"
                    >
                      <td className="py-4 px-6 text-center font-mono font-bold text-slate-400 hidden sm:table-cell">
                        {itemIndex}
                      </td>
                      <td className="py-4 px-4 md:px-6 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {new Date(log.tanggal).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit"
                              })}
                            </span>
                          </div>
                          {/* Inline Mobile Operator Badge */}
                          <span className="sm:hidden text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                            Operator: @{log.admin_username}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4 text-emerald-600/70" />
                          <span>@{log.admin_username}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 md:px-6">
                        <div className="flex flex-col gap-1.5">
                          <div>{getActivityBadge(log.aktivitas)}</div>
                          {/* Inline Mobile Detail */}
                          <div className="md:hidden flex items-start gap-1 text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                            <span>{log.detail || "-"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-lg leading-relaxed text-slate-600 dark:text-slate-400 hidden md:table-cell">
                        <div className="flex items-start gap-1.5">
                          <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span>{log.detail || "-"}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    Tidak ada riwayat aktivitas yang terekam.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination block */}
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

    </div>
  );
};
