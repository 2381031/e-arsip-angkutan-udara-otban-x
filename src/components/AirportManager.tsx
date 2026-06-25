import React, { useState, useEffect } from "react";
import { MapPin, Plus, Trash2, Edit2, X, Info } from "lucide-react";
import { BandarUdara } from "../types.js";

interface AirportManagerProps {
  token: string;
  addToast: (msg: string, type: "success" | "warning" | "error" | "info") => void;
}

export const AirportManager: React.FC<AirportManagerProps> = ({
  token,
  addToast,
}) => {
  const [airports, setAirports] = useState<BandarUdara[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState<BandarUdara | null>(null);
  const [formNama, setFormNama] = useState("");

  const fetchAirports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bandara", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memuat bandara");
      setAirports(data);
    } catch (err: any) {
      addToast(err.message || "Gagal memuat daftar bandara", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAirports();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama) {
      addToast("Nama bandara wajib diisi!", "warning");
      return;
    }

    try {
      let url = "/api/bandara";
      let method = "POST";
      
      if (selectedAirport) {
        url = `/api/bandara/${selectedAirport.id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nama_bandara: formNama }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan bandar udara");

      addToast(
        selectedAirport
          ? "Nama Bandar Udara berhasil diperbarui!"
          : "Bandar Udara baru berhasil ditambahkan!",
        "success"
      );
      setIsModalOpen(false);
      fetchAirports();
    } catch (err: any) {
      addToast(err.message || "Gagal menyimpan data", "error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAirport) return;

    try {
      const res = await fetch(`/api/bandara/${selectedAirport.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal menghapus");
      }

      addToast("Bandar Udara berhasil dihapus dari database.", "success");
      setIsDeleteModalOpen(false);
      fetchAirports();
    } catch (err: any) {
      addToast(err.message || "Gagal menghapus bandar udara", "error");
    }
  };

  const openAddModal = () => {
    setSelectedAirport(null);
    setFormNama("");
    setIsModalOpen(true);
  };

  const openEditModal = (airport: BandarUdara) => {
    setSelectedAirport(airport);
    setFormNama(airport.nama_bandara);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
            Kelola Database Bandar Udara
          </h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            Tambah, edit, dan hapus daftar bandar udara rujukan di lingkungan Otoritas Bandar Udara Wilayah X.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-700/30 flex items-center justify-center gap-2 transition duration-150 cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Bandara</span>
        </button>
      </div>

      {/* Info Alert */}
      <div className="p-4 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/10 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800 dark:text-blue-300 font-semibold leading-relaxed">
          Sesuai integritas data, Anda tidak diperkenankan menghapus bandar udara yang masih memiliki arsip dokumen terikat. Hapus terlebih dahulu seluruh berkas dokumen terkait bandara tersebut sebelum menghapus entitas bandara.
        </p>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center">
            <span className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
          </div>
        ) : airports.length > 0 ? (
          airports.map((airport) => (
            <div
              key={airport.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition duration-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-display font-bold text-sm text-slate-800 dark:text-white truncate">
                    {airport.nama_bandara}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5 font-mono uppercase tracking-wider">
                    OTBAN WILAYAH X
                  </p>
                </div>
              </div>

              <div className="flex gap-1 pl-2 shrink-0">
                <button
                  onClick={() => openEditModal(airport)}
                  className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg transition"
                  title="Edit Nama"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedAirport(airport);
                    setIsDeleteModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-slate-400">
            Belum ada bandar udara terdaftar.
          </div>
        )}
      </div>

      {/* ==========================================
          MODAL: ADD/EDIT AIRPORT
          ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                {selectedAirport ? "Ubah Nama Bandar Udara" : "Tambah Bandar Udara Baru"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Nama Bandar Udara
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bandar Udara Rendani"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-sm"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  {selectedAirport ? "Simpan Perubahan" : "Simpan Bandara"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: DELETE CONFIRM
          ========================================== */}
      {isDeleteModalOpen && selectedAirport && (
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
                Hapus Bandar Udara
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                Apakah Anda yakin ingin menghapus <strong className="text-slate-800 dark:text-slate-200">"{selectedAirport.nama_bandara}"</strong> dari database? Tindakan ini tidak dapat dibatalkan.
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
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Hapus Bandara
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
