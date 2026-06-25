import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar.js";
import { Navbar } from "./components/Navbar.js";
import { LoginScreen } from "./components/LoginScreen.js";
import { DashboardView } from "./components/DashboardView.js";
import { DocumentManager } from "./components/DocumentManager.js";
import { AdminManager } from "./components/AdminManager.js";
import { AirportManager } from "./components/AirportManager.js";
import { ActivityLogs } from "./components/ActivityLogs.js";
import { ToastContainer, ToastMessage, ToastType } from "./components/Toast.js";
import { ActiveMenu, Tahun, Dokumen } from "./types.js";

export default function App() {
  // Authentication & Session management
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Layout & Styling preferences
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>("dashboard");

  // Multi-level scoped selection folders
  const [selectedYear, setSelectedYear] = useState<Tahun | null>(null);

  // Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [breadcrumbPath, setBreadcrumbPath] = useState<string[]>([]);

  // 1. Core State Restorations
  useEffect(() => {
    // Auth Restoration (Supports Session Login & Remember Me)
    const savedToken = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    const savedUserJson = localStorage.getItem("auth_user") || sessionStorage.getItem("auth_user");

    if (savedToken && savedUserJson) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUserJson));
      } catch (e) {
        console.error("Failed to restore session credentials", e);
      }
    }
    setAuthChecking(false);

    // Theme Restoration
    const savedTheme = localStorage.getItem("app_theme") as "light" | "dark";
    if (savedTheme) {
      setTheme(savedTheme);
      updateHTMLThemeClass(savedTheme);
    } else {
      // Default to light as requested, but support dark
      setTheme("light");
      updateHTMLThemeClass("light");
    }

    // Sidebar collapse state
    const savedCollapsed = localStorage.getItem("sidebar_collapsed");
    if (savedCollapsed) {
      setSidebarCollapsed(savedCollapsed === "true");
    }
  }, []);

  // Update theme helper
  const updateHTMLThemeClass = (newTheme: "light" | "dark") => {
    const root = window.document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const handleThemeToggle = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("app_theme", nextTheme);
    updateHTMLThemeClass(nextTheme);
    addToast(`Mode ${nextTheme === "dark" ? "Gelap" : "Terang"} diaktifkan.`, "info");
  };

  const handleSidebarCollapseToggle = (val: boolean) => {
    setSidebarCollapsed(val);
    localStorage.setItem("sidebar_collapsed", String(val));
  };

  // Toast helper
  const addToast = (message: string, type: ToastType = "success") => {
    const newToast: ToastMessage = {
      id: "toast-" + Math.random().toString(36).substr(2, 9),
      message,
      type,
    };
    setToasts(prev => [...prev, newToast]);
  };

  const handleCloseToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 2. Authentication triggers
  const handleLoginSuccess = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);

    // If remember me is handled inside LoginScreen, we will store credentials in localStorage
    const savedRemember = localStorage.getItem("remembered_username");
    if (savedRemember) {
      localStorage.setItem("auth_token", newToken);
      localStorage.setItem("auth_user", JSON.stringify(newUser));
    } else {
      sessionStorage.setItem("auth_token", newToken);
      sessionStorage.setItem("auth_user", JSON.stringify(newUser));
    }
    setActiveMenu("dashboard");
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("Failed server-side logout trail", err);
      }
    }

    // Purge credentials
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_user");

    setToken(null);
    setUser(null);
    setSelectedYear(null);
    setActiveMenu("dashboard");

    addToast("Berhasil keluar dari sesi aplikasi.", "info");
  };

  // Shortcut navigation from Dashboard recent rows to documents manager
  const handlePreviewDocumentShortcut = (doc: Dokumen) => {
    addToast(`Membuka berkas: "${doc.nama_dokumen}"`, "info");
    
    // Auto translate menu tab
    const catMenuMap: Record<string, ActiveMenu> = {
      "pengawasan": "pengawasan",
      "rapat": "rapat",
      "pprp": "pprp",
      "lalu lintas": "lalu_lintas",
      "rekonsiliasi": "rekonsiliasi"
    };
    
    const matchedMenu = catMenuMap[doc.nama_kategori?.toLowerCase() || ""] || "pengawasan";
    setActiveMenu(matchedMenu);
    
    setSelectedYear({ id: doc.tahun_id, tahun: doc.tahun || "" });
  };

  // Render view router based on state
  const renderContentView = () => {
    if (!token) return null;

    switch (activeMenu) {
      case "dashboard":
        return (
          <DashboardView
            token={token}
            onNavigateToSection={(section, arg) => {
              if (section === "pengawasan") {
                setActiveMenu("pengawasan");
              }
            }}
            addToast={addToast}
            onPreviewDocument={handlePreviewDocumentShortcut}
          />
        );

      case "pengawasan":
      case "rapat":
      case "pprp":
      case "lalu_lintas":
      case "rekonsiliasi":
        return (
          <DocumentManager
            token={token}
            activeCategory={activeMenu}
            selectedYear={selectedYear}
            onSelectYear={setSelectedYear}
            addToast={addToast}
            updateBreadcrumb={setBreadcrumbPath}
          />
        );

      case "airports":
        return <AirportManager token={token} addToast={addToast} />;

      case "admins":
        return (
          <AdminManager
            token={token}
            currentUserUsername={user?.username || ""}
            addToast={addToast}
          />
        );

      case "logs":
        return <ActivityLogs token={token} addToast={addToast} />;

      default:
        return (
          <div className="py-12 text-center text-slate-500">
            Halaman sedang dalam pengembangan.
          </div>
        );
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <span className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  // Not Authenticated -> Show Login screen
  if (!token) {
    return (
      <>
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          addToast={addToast}
          theme={theme}
          onThemeToggle={handleThemeToggle}
        />
        <ToastContainer toasts={toasts} onClose={handleCloseToast} />
      </>
    );
  }

  // Authenticated -> Full layout
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Sidebar (Responsive Layout) */}
      <Sidebar
        activeMenu={activeMenu}
        onMenuChange={(menu) => {
          setActiveMenu(menu);
          // Reset scope when switching major side tabs
          setSelectedYear(null);
          setBreadcrumbPath([]);
        }}
        collapsed={sidebarCollapsed}
        setCollapsed={handleSidebarCollapseToggle}
        adminName={user?.nama || "Administrator"}
        onLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Panel wrapper */}
      <div
        className={`min-h-screen flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "md:pl-20" : "md:pl-64"
        } pl-0`}
      >
        <Navbar
          activeMenu={activeMenu}
          adminName={user?.nama || "Admin"}
          theme={theme}
          onThemeToggle={handleThemeToggle}
          breadcrumbPath={breadcrumbPath}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto pb-16">
          {renderContentView()}
        </main>
      </div>

      {/* Toast notifications layer */}
      <ToastContainer toasts={toasts} onClose={handleCloseToast} />
    </div>
  );
}
