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
  ChevronDown,
  Mail,
  FilePenLine,
  FileCheck,
  Headphones,
  BadgeDollarSign,
  Navigation,
  Clock,
  Building2,
  GraduationCap,
} from "lucide-react";
import { OtbanLogo } from "./OtbanLogo.js";
import { ActiveMenu } from "../types.js";
import { APP_SUBTITLE, APP_TITLE } from "../constants/branding.js";

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

const standaloneMenuItems: {
  id: ActiveMenu;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "rapat", label: "Rapat", icon: <Users className="w-5 h-5" /> },
  { id: "surat", label: "Surat", icon: <Mail className="w-5 h-5" /> },
  { id: "nota_dinas", label: "Nota dinas", icon: <FilePenLine className="w-5 h-5" /> },
];

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
  const adminMenu = [
    { id: "airports" as ActiveMenu, label: "Daftar Bandara", icon: <MapPin className="w-5 h-5" /> },
    { id: "admins" as ActiveMenu, label: "Kelola Admin", icon: <UserCog className="w-5 h-5" /> },
    { id: "logs" as ActiveMenu, label: "Log Aktivitas", icon: <Activity className="w-5 h-5" /> },
  ];

  const [openPengawasan, setOpenPengawasan] = useState(true);
  const [openPPRP, setOpenPPRP] = useState(true);
  const [openPengendalian, setOpenPengendalian] = useState(true);

  const handleMenuClick = (menu: ActiveMenu) => {
    onMenuChange(menu);
    if (onCloseMobile) onCloseMobile();
  };

  const menuButtonClass = (isActive: boolean) =>
    `w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg font-semibold text-sm transition-all cursor-pointer ${
      isActive
        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 shadow-sm"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent"
    }`;

  const subMenuButtonClass = (isActive: boolean) =>
    `w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-all cursor-pointer ${
      isActive
        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
    }`;

  const nestedMenuButtonClass = (isActive: boolean) =>
    `w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer ${
      isActive
        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
        : "text-slate-500 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-700 dark:hover:text-slate-300"
    }`;

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/50 dark:bg-slate-950/75 z-40 md:hidden backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 z-50 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 transition-transform md:transition-all duration-300 ${
          collapsed ? "md:w-20" : "md:w-64"
        } ${mobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex flex-col items-center py-6 border-b border-slate-100 dark:border-slate-800 relative">
          <div className="transform hover:rotate-6 transition duration-300">
            <OtbanLogo className={collapsed ? "w-10 h-10" : "w-16 h-16"} />
          </div>

          {!collapsed && (
            <div className="text-center mt-3 px-4">
              <h1 className="font-display font-extrabold text-sm tracking-wide text-emerald-700 dark:text-emerald-400">
                {APP_TITLE}
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 tracking-wider uppercase leading-relaxed">
                {APP_SUBTITLE}
              </p>
            </div>
          )}

          <button
            id="sidebar-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            className="absolute top-1/2 -right-3 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full p-1 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer transition hidden md:block"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-7">
          <div>
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 font-mono">
                Menu Utama
              </p>
            )}
            <nav className="space-y-1">
              <button
                id="sidebar-menu-dashboard"
                onClick={() => handleMenuClick("dashboard")}
                className={menuButtonClass(activeMenu === "dashboard")}
                title={collapsed ? "Dashboard" : ""}
              >
                <span className={activeMenu === "dashboard" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}>
                  <LayoutDashboard className="w-5 h-5" />
                </span>
                {!collapsed && <span>Dashboard</span>}
              </button>

              {!collapsed ? (
                <>
                  {/* PENGAWASAN - Collapsible */}
                  <button
                    onClick={() => setOpenPengawasan(!openPengawasan)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg font-semibold text-sm transition-all cursor-pointer border border-transparent hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    <div className="flex items-center gap-3.5">
                      <ShieldCheck className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      <span>Pengawasan</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${openPengawasan ? "rotate-180" : ""}`} />
                  </button>

                  {openPengawasan && (
                    <div className="pl-6 space-y-1 mt-1">
                      {/* PPRP - Nested collapsible */}
                      <button
                        onClick={() => setOpenPPRP(!openPPRP)}
                        className="w-full flex items-center justify-between px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg font-medium text-sm transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Compass className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          <span>PPRP</span>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openPPRP ? "rotate-180" : ""}`} />
                      </button>

                      {openPPRP && (
                        <div className="pl-5 space-y-0.5 mt-0.5">
                          <button
                            id="sidebar-menu-pprp_14_hari"
                            onClick={() => handleMenuClick("pprp_14_hari")}
                            className={nestedMenuButtonClass(activeMenu === "pprp_14_hari")}
                          >
                            PPRP 14 Hari
                          </button>
                          <button
                            id="sidebar-menu-pengawasan_pprp"
                            onClick={() => handleMenuClick("pengawasan_pprp")}
                            className={nestedMenuButtonClass(activeMenu === "pengawasan_pprp")}
                          >
                            Pengawasan PPRP
                          </button>
                        </div>
                      )}

                      <button
                        id="sidebar-menu-lalu_lintas"
                        onClick={() => handleMenuClick("lalu_lintas")}
                        className={subMenuButtonClass(activeMenu === "lalu_lintas")}
                      >
                        Lalu Lintas Angkutan Udara
                      </button>
                      <button
                        id="sidebar-menu-flight_approval"
                        onClick={() => handleMenuClick("flight_approval")}
                        className={subMenuButtonClass(activeMenu === "flight_approval")}
                      >
                        Flight Approval
                      </button>
                      <button
                        id="sidebar-menu-pelayanan"
                        onClick={() => handleMenuClick("pelayanan")}
                        className={subMenuButtonClass(activeMenu === "pelayanan")}
                      >
                        Pelayanan
                      </button>
                      <button
                        id="sidebar-menu-tarif"
                        onClick={() => handleMenuClick("tarif")}
                        className={subMenuButtonClass(activeMenu === "tarif")}
                      >
                        Tarif
                      </button>
                      <button
                        id="sidebar-menu-perintis"
                        onClick={() => handleMenuClick("perintis")}
                        className={subMenuButtonClass(activeMenu === "perintis")}
                      >
                        Perintis
                      </button>
                      <button
                        id="sidebar-menu-delay_management"
                        onClick={() => handleMenuClick("delay_management")}
                        className={subMenuButtonClass(activeMenu === "delay_management")}
                      >
                        Delay Management
                      </button>
                      <button
                        id="sidebar-menu-haji"
                        onClick={() => handleMenuClick("haji")}
                        className={subMenuButtonClass(activeMenu === "haji")}
                      >
                        Haji
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleMenuClick("pprp_14_hari")}
                    className={menuButtonClass(activeMenu === "pprp_14_hari")}
                    title="PPRP 14 Hari"
                  >
                    <Compass className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleMenuClick("pengawasan_pprp")}
                    className={menuButtonClass(activeMenu === "pengawasan_pprp")}
                    title="Pengawasan PPRP"
                  >
                    <Compass className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleMenuClick("lalu_lintas")}
                    className={menuButtonClass(activeMenu === "lalu_lintas")}
                    title="Lalu Lintas"
                  >
                    <Plane className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleMenuClick("flight_approval")}
                    className={menuButtonClass(activeMenu === "flight_approval")}
                    title="Flight Approval"
                  >
                    <FileCheck className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleMenuClick("pelayanan")}
                    className={menuButtonClass(activeMenu === "pelayanan")}
                    title="Pelayanan"
                  >
                    <Headphones className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleMenuClick("tarif")}
                    className={menuButtonClass(activeMenu === "tarif")}
                    title="Tarif"
                  >
                    <BadgeDollarSign className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleMenuClick("perintis")}
                    className={menuButtonClass(activeMenu === "perintis")}
                    title="Perintis"
                  >
                    <Navigation className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleMenuClick("delay_management")}
                    className={menuButtonClass(activeMenu === "delay_management")}
                    title="Delay Management"
                  >
                    <Clock className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleMenuClick("haji")}
                    className={menuButtonClass(activeMenu === "haji")}
                    title="Haji"
                  >
                    <Building2 className="w-5 h-5" />
                  </button>
                </>
              )}

              {standaloneMenuItems.map((item) => (
                <button
                  key={item.id}
                  id={`sidebar-menu-${item.id}`}
                  onClick={() => handleMenuClick(item.id)}
                  className={menuButtonClass(activeMenu === item.id)}
                  title={collapsed ? item.label : ""}
                >
                  <span className={activeMenu === item.id ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}>
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                </button>
              ))}

              {/* PENGENDALIAN - Collapsible */}
              {!collapsed ? (
                <>
                  <button
                    onClick={() => setOpenPengendalian(!openPengendalian)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg font-semibold text-sm transition-all cursor-pointer border border-transparent hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    <div className="flex items-center gap-3.5">
                      <Scale className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      <span>Pengendalian</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${openPengendalian ? "rotate-180" : ""}`} />
                  </button>

                  {openPengendalian && (
                    <div className="pl-6 space-y-1 mt-1">
                      <button
                        id="sidebar-menu-peraturan"
                        onClick={() => handleMenuClick("peraturan")}
                        className={subMenuButtonClass(activeMenu === "peraturan")}
                      >
                        Peraturan
                      </button>
                      <button
                        id="sidebar-menu-rekonsiliasi"
                        onClick={() => handleMenuClick("rekonsiliasi")}
                        className={subMenuButtonClass(activeMenu === "rekonsiliasi")}
                      >
                        Rekonsiliasi
                      </button>
                      <button
                        id="sidebar-menu-bimtek"
                        onClick={() => handleMenuClick("bimtek")}
                        className={subMenuButtonClass(activeMenu === "bimtek")}
                      >
                        Bimbingan Teknis
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleMenuClick("peraturan")}
                    className={menuButtonClass(activeMenu === "peraturan")}
                    title="Peraturan"
                  >
                    <FolderArchive className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleMenuClick("rekonsiliasi")}
                    className={menuButtonClass(activeMenu === "rekonsiliasi")}
                    title="Rekonsiliasi"
                  >
                    <Scale className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleMenuClick("bimtek")}
                    className={menuButtonClass(activeMenu === "bimtek")}
                    title="Bimbingan Teknis"
                  >
                    <GraduationCap className="w-5 h-5" />
                  </button>
                </>
              )}
            </nav>
          </div>

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
                    onClick={() => handleMenuClick(item.id)}
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
