import React, { useState } from "react";
import {
  LayoutDashboard,
  FolderArchive,
  ShieldCheck,
  Users,
  Compass,
  Plane,
  Scale,
  UserCog,
  Activity,
  MapPin,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ChevronDown
} from "lucide-react";
import { OtbanLogo } from "./OtbanLogo.js";
import { ActiveMenu } from "../types.js";

interface SidebarProps {
  activeMenu: ActiveMenu;
  onMenuChange: (menu: ActiveMenu) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  adminName: string;
  onLogout: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeMenu,
  onMenuChange,
  collapsed,
  setCollapsed,
  adminName,
  onLogout,
  mobileOpen = false,
  onCloseMobile,
}) => {
 const mainMenu = [
  { id: "dashboard" as ActiveMenu, label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },

  { id: "pengawasan" as ActiveMenu, label: "Arsip Pengawasan", icon: <ShieldCheck className="w-5 h-5" /> },

  { id: "peraturan" as ActiveMenu, label: "Arsip Peraturan", icon: <FolderArchive className="w-5 h-5" /> },

  { id: "rapat" as ActiveMenu, label: "Rapat", icon: <Users className="w-5 h-5" /> },

  { id: "pprp" as ActiveMenu, label: "PPRP", icon: <Compass className="w-5 h-5" /> },

  { id: "lalu_lintas" as ActiveMenu, label: "Lalu Lintas", icon: <Plane className="w-5 h-5" /> },

  { id: "rekonsiliasi" as ActiveMenu, label: "Rekonsiliasi", icon: <Scale className="w-5 h-5" /> },
];
  const adminMenu = [
    { id: "airports" as ActiveMenu, label: "Daftar Bandara", icon: <MapPin className="w-5 h-5" /> },
    { id: "admins" as ActiveMenu, label: "Kelola Admin", icon: <UserCog className="w-5 h-5" /> },
    { id: "logs" as ActiveMenu, label: "Log Aktivitas", icon: <Activity className="w-5 h-5" /> },
  ];

  const [openPengawasan, setOpenPengawasan] = useState(true);
  const [openPengendalian, setOpenPengendalian] = useState(true);

  return (
    <>
      {/* Mobile Sidebar Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/50 dark:bg-slate-950/75 z-40 md:hidden backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 z-50 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 transition-transform md:transition-all duration-300 ${
          collapsed ? "md:w-20" : "md:w-64"
        } ${
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
        }`}
      >
      {/* Top Branding Section */}
      <div className="flex flex-col items-center py-6 border-b border-slate-100 dark:border-slate-800 relative">
        <div className="transform hover:rotate-6 transition duration-300">
          <OtbanLogo className={collapsed ? "w-10 h-10" : "w-16 h-16"} />
        </div>
        
        {!collapsed && (
          <div className="text-center mt-3 px-4">
            <h1 className="font-display font-extrabold text-sm tracking-wide text-emerald-700 dark:text-emerald-400">
              SIGAP-UD 
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 tracking-wider uppercase">
              ANGUD - OTBAN X MERAUKE
            </p>
          </div>
        )}

        {/* Collapse Button */}
        <button
          id="sidebar-collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-1/2 -right-3 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full p-1 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer transition hidden md:block"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation Menus */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-7">
        
        {/* Main Section */}
        <div>
          {!collapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 font-mono">
              Menu Utama
            </p>
          )}
          <nav className="space-y-1">
            {/* Dashboard */}
            <button
              id="sidebar-menu-dashboard"
              onClick={() => {
                onMenuChange("dashboard");
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg font-semibold text-sm transition-all cursor-pointer ${
                activeMenu === "dashboard"
                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent"
              }`}
              title={collapsed ? "Dashboard" : ""}
            >
              <span className={activeMenu === "dashboard" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}>
                <LayoutDashboard className="w-5 h-5" />
              </span>
              {!collapsed && <span>Dashboard</span>}
            </button>

            {/* Pengawasan Group */}
            {!collapsed && (
              <>
                <button
                  onClick={() => setOpenPengawasan(!openPengawasan)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg font-semibold text-sm transition-all cursor-pointer border border-transparent hover:text-slate-900 dark:hover:text-slate-100"
                >
                  <div className="flex items-center gap-3.5">
                    <ShieldCheck className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <span>Pengawasan</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openPengawasan ? 'rotate-180' : ''}`} />
                </button>

                {openPengawasan && (
                  <div className="pl-6 space-y-1 mt-1">
                    {/* Pengawasan */}
                    <button
                      id="sidebar-menu-pengawasan"
                      onClick={() => {
                        onMenuChange("pengawasan");
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                        activeMenu === "pengawasan"
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                      }`}
                    >
                      Pengawasan
                    </button>

                    {/* PPRP */}
                    <button
                      id="sidebar-menu-pprp"
                      onClick={() => {
                        onMenuChange("pprp");
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                        activeMenu === "pprp"
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                      }`}
                    >
                      PPRP
                    </button>

                    {/* Lalu Lintas */}
                    <button
                      id="sidebar-menu-lalu_lintas"
                      onClick={() => {
                        onMenuChange("lalu_lintas");
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                        activeMenu === "lalu_lintas"
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                      }`}
                    >
                      Lalu Lintas
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Pengendalian Group */}
            {!collapsed && (
              <>
                <button
                  onClick={() => setOpenPengendalian(!openPengendalian)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg font-semibold text-sm transition-all cursor-pointer border border-transparent hover:text-slate-900 dark:hover:text-slate-100"
                >
                  <div className="flex items-center gap-3.5">
                    <Scale className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <span>Pengendalian</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openPengendalian ? 'rotate-180' : ''}`} />
                </button>

                {openPengendalian && (
                  <div className="pl-6 space-y-1 mt-1">
                    {/* Rekonsiliasi */}
                    <button
                      id="sidebar-menu-rekonsiliasi"
                      onClick={() => {
                        onMenuChange("rekonsiliasi");
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                        activeMenu === "rekonsiliasi"
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                      }`}
                    >
                      Rekonsiliasi
                    </button>

                    {/* Peraturan */}
                    <button
                      id="sidebar-menu-peraturan"
                      onClick={() => {
                        onMenuChange("peraturan");
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                        activeMenu === "peraturan"
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                      }`}
                    >
                      Peraturan
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Rapat */}
            <button
              id="sidebar-menu-rapat"
              onClick={() => {
                onMenuChange("rapat");
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg font-semibold text-sm transition-all cursor-pointer ${
                activeMenu === "rapat"
                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent"
              }`}
              title={collapsed ? "Rapat" : ""}
            >
              <span className={activeMenu === "rapat" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}>
                <Users className="w-5 h-5" />
              </span>
              {!collapsed && <span>Rapat</span>}
            </button>
          </nav>
        </div>

        {/* Administration Section */}
        <div>
          {!collapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 font-mono">
              Pengaturan & Audit
            </p>
          )}
          <nav className="space-y-1">
            {adminMenu.map((item) => {
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-menu-${item.id}`}
                  onClick={() => {
                    onMenuChange(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg font-semibold text-sm transition-all cursor-pointer ${
                    isActive
                      ? "bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-900/30 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent"
                  }`}
                  title={collapsed ? item.label : ""}
                >
                  <span className={isActive ? "text-sky-600 dark:text-sky-400" : "text-slate-400 dark:text-slate-500"}>
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

      </div>

      {/* Footer Profile Box */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate font-mono">
                {adminName}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
                Online
              </span>
            </div>
          )}
          <button
            id="sidebar-logout-btn"
            onClick={onLogout}
            className={`text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-2 rounded-lg transition cursor-pointer ${
              collapsed ? "w-full flex justify-center" : ""
            }`}
            title="Keluar Sesi"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
      </div>
    </>
  );
};