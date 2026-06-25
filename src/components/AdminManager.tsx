import React, { useState, useEffect } from "react";
import { User, UserPlus, Trash2, Edit2, ShieldAlert, X, Eye, EyeOff } from "lucide-react";
import { Admin } from "../types.js";

interface AdminManagerProps {
  token: string;
  currentUserUsername: string;
  addToast: (msg: string, type: "success" | "warning" | "error" | "info") => void;
}

export const AdminManager: React.FC<AdminManagerProps> = ({
  token,
  currentUserUsername,
  addToast,
}) => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form Field state
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [formNama, setFormNama] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Fetch admin accounts
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admins", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load admins");
      setAdmins(data);
    } catch (err: any) {
      addToast(err.message || "Gagal memuat daftar admin", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [token]);

  // Handle Add Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama || !formUsername || !formPassword) {
      addToast("Semua kolom wajib diisi!", "warning");
      return;
    }

    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: formNama,
          username: formUsername,
          password: formPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menambahkan admin");

      addToast("Akun admin baru berhasil dibuat!", "success");
      setIsAddModalOpen(false);
      fetchAdmins();
    } catch (err: any) {
      addToast(err.message || "Gagal membuat akun", "error");
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    if (!formNama || !formUsername) {
      addToast("Nama dan username wajib diisi!", "warning");
      return;
    }

    try {
      const res = await fetch(`/api/admins/${selectedAdmin.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: formNama,
          username: formUsername,
          password: formPassword || undefined, // Send if updated
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengupdate admin");

      addToast("Profil admin berhasil diperbarui!", "success");
      setIsEditModalOpen(false);
      fetchAdmins();
    } catch (err: any) {
      addToast(err.message || "Gagal memperbarui profil", "error");
    }
  };

  // Handle Delete Admin
  const handleDeleteConfirm = async () => {
    if (!selectedAdmin) return;

    try {
      const res = await fetch(`/api/admins/${selectedAdmin.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menghapus admin");

      addToast(`Akun admin @${selectedAdmin.username} telah dihapus.`, "success");
      setIsDeleteModalOpen(false);
      fetchAdmins();
    } catch (err: any) {
      addToast(err.message || "Gagal menghapus akun", "error");
    }
  };

  const openAddModal = () => {
    setFormNama("");
    setFormUsername("");
    setFormPassword("");
    setShowPassword(false);
    setIsAddModalOpen(true);
  };

  const openEditModal = (admin: Admin) => {
    setSelectedAdmin(admin);
    setFormNama(admin.nama);
    setFormUsername(admin.username);
    setFormPassword(""); // Don't show password
    setShowPassword(false);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Scope Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
            Pengaturan Akun Administrator
          </h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            Gunakan panel ini untuk mengelola hak akses akun pegawai Kantor Otoritas Bandar Udara Wilayah X.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-700/30 flex items-center justify-center gap-2 transition duration-150 cursor-pointer self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Admin</span>
        </button>
      </div>

      {/* Main Admin List Display */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-4 px-6 w-12 text-center">No</th>
                <th className="py-4 px-6">Nama Pegawai</th>
                <th className="py-4 px-6">Username</th>
                <th className="py-4 px-6">Tanggal Registrasi</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <span className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
                  </td>
                </tr>
              ) : admins.length > 0 ? (
                admins.map((admin, index) => (
                  <tr
                    key={admin.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition text-slate-700 dark:text-slate-300"
                  >
                    <td className="py-4 px-6 text-center font-mono font-bold text-slate-400">
                      {index + 1}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-emerald-100/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-lg shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <span>{admin.nama}</span>
                        {admin.username === currentUserUsername && (
                          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold rounded font-mono uppercase tracking-wider">
                            Saya
                          </span>
                        )}
                        {admin.username === "angud2026" && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[10px] font-extrabold rounded font-mono uppercase tracking-wider">
                            Super
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono font-semibold text-slate-600 dark:text-slate-400">
                      @{admin.username}
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-mono text-xs">
                      {new Date(admin.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(admin)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg transition"
                          title="Edit Akun"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          disabled={admin.username === currentUserUsername || admin.username === "angud2026"}
                          onClick={() => {
                            setSelectedAdmin(admin);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition disabled:opacity-30 disabled:pointer-events-none"
                          title="Hapus Akun"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    Tidak ada admin terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================
          MODAL: ADD ADMIN
          ========================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                Daftarkan Admin Baru
              </h3>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Nama Lengkap Pegawai
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Username Akun
                </label>
                <input
                  type="text"
                  placeholder="Contoh: budi2026"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-sm font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password kuat"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Buat Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: EDIT ADMIN
          ========================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <Edit2 className="w-5 h-5 text-amber-500" />
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                Edit Profil Administrator
              </h3>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Nama Lengkap Pegawai
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
                  Username Akun
                </label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition text-sm font-mono"
                  required
                  disabled={selectedAdmin?.username === "angud2026"} // Prevent renaming super user username
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Password Baru (Kosongkan jika tidak diubah)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password baru untuk mengganti"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
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
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Simpan Profil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: CONFIRM DELETE ADMIN
          ========================================== */}
      {isDeleteModalOpen && selectedAdmin && (
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
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white mb-2">
                Hapus Akun Administrator
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                Apakah Anda yakin ingin menghapus akun admin milik <strong className="text-slate-800 dark:text-slate-200">"{selectedAdmin.nama}" (@{selectedAdmin.username})</strong>? Tindakan ini tidak dapat dibatalkan.
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
                  Hapus Akun
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
