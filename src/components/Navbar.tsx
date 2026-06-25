import React, { useState, useEffect } from "react";
import { Sun, Moon, Clock, User, ChevronRight, Menu } from "lucide-react";
import { ActiveMenu } from "../types.js";

interface NavbarProps {
  activeMenu: ActiveMenu;
  adminName: string;
  theme: "light" | "dark";
  onThemeToggle: () => void;
  breadcrumbPath: string[];
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeMenu,
  adminName,
  theme,
  onThemeToggle,
  breadcrumbPath,
  onToggleMobileSidebar,
}) => {
  const [time, setTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Convert local time to WIT (Eastern Indonesia Time - Merauke) which is UTC +9
  const getWITTimeString = (date: Date) => {
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const witDate = new Date(utc + 3600000 * 9);
    return witDate.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) + " WIT";
  };

  const getMenuDisplayName = (menu: ActiveMenu): string => {
    switch (menu) {
      case "dashboard":
        return "Dashboard";
      case "pengawasan":
        return "Pengawasan Dokumen";
      case "rapat":
        return "Notulen Rapat";
      case "pprp":
        return "Program PPRP";
      case "lalu_lintas":
        return "Lalu Lintas Udara";
      case "rekonsiliasi":
        return "Rekonsiliasi Angkutan";
      case "airports":
        return "Manajemen Bandar Udara";
      case "admins":
        return "Manajemen Admin";
      case "logs":
        return "Log Aktivitas Admin";
      default:
        return "E-Arsip";
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 transition-colors duration-300">
      
      {/* Left side: Mobile Hamburguer & Breadcrumb / Page context */}
      <div className="flex items-center gap-1.5 md:gap-2 min-w-0 flex-1">
        <button
          onClick={onToggleMobileSidebar}
          className="p-1.5 -ml-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition md:hidden cursor-pointer shrink-0"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Breadcrumbs: Full path */}
        <div className="hidden sm:flex items-center gap-1.5 md:gap-2 min-w-0">
          <span className="font-display font-semibold text-xs md:text-sm text-slate-500 dark:text-slate-400 shrink-0">
            {getMenuDisplayName(activeMenu)}
          </span>
          {breadcrumbPath.map((path, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-slate-300 dark:text-slate-600 shrink-0" />
              <span className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-100 max-w-[120px] md:max-w-none truncate">
                {path}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* Mobile Breadcrumbs: Compact path (Only the active screen / last item) */}
        <div className="flex sm:hidden items-center min-w-0">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
            {breadcrumbPath.length > 0 
              ? breadcrumbPath[breadcrumbPath.length - 1] 
              : getMenuDisplayName(activeMenu)}
          </span>
        </div>
      </div>

      {/* Right side: Clock, Theme toggle, Profile */}
      <div className="flex items-center gap-2 md:gap-6 shrink-0">
        
        {/* Dynamic Clocks */}
        <div className="hidden min-[480px]:flex items-center gap-2 md:gap-4 border-r border-slate-200 dark:border-slate-800 pr-3 md:pr-5">
          <div className="hidden lg:flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-mono text-xs font-semibold shrink-0">
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{formatDate(time)}</span>
          </div>
          <div className="flex flex-col text-right font-mono text-[9px] md:text-[10px] leading-tight text-slate-500 dark:text-slate-400 shrink-0">
            <span className="whitespace-nowrap">Lokal: <strong className="text-[10px] md:text-xs text-slate-700 dark:text-slate-300">{formatTime(time)}</strong></span>
            <span className="whitespace-nowrap">Merauke: <strong className="text-[10px] md:text-xs text-emerald-600 dark:text-emerald-400">{getWITTimeString(time)}</strong></span>
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          className="p-1.5 md:p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer shrink-0"
          title={theme === "light" ? "Ganti ke Dark Mode" : "Ganti ke Light Mode"}
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
        </button>

        {/* Profile badge */}
        <div className="flex items-center gap-1.5 md:gap-2.5 pl-1.5 md:pl-2 border-l border-slate-200 dark:border-slate-800 shrink-0">
          <div className="p-1.5 md:p-2 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-xl shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:flex flex-col text-left shrink-0">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[80px] md:max-w-[120px] truncate">
              {adminName}
            </span>
            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider leading-none mt-0.5">
              Admin
            </span>
          </div>
        </div>

      </div>
    </header>
  );
};
