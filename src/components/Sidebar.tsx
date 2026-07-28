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

interface MenuItem {
  id: ActiveMenu;
  label: string;
  icon: React.ReactNode;
}

const standaloneMenuItems: MenuItem[] = [
  { id: "peraturan", label: "Peraturan", icon: <FolderArchive className="w-5 h-5" /> },
  { id: "rapat", label: "Rapat", icon: <Users className="w-5 h-5" /> },
  { id: "surat", label: "Surat", icon: <Mail className="w-5 h-5" /> },
  { id: "nota_dinas", label: "Nota Dinas", icon: <FilePenLine className="w-5 h-5" /> },
];

const pprpSubItems: MenuItem[] = [
  { id: "pprp_14_hari", label: "PPRP 14 Hari", icon: <Compass className="w-3.5 h-3.5" /> },
  { id: "pengawasan_pprp", label: "Pengawasan PPRP", icon: <Compass className="w-3.5 h-3.5" /> },
];

const pengawasanDirectItems: MenuItem[] = [
  { id: "lalu_lintas", label: "Lalu Lintas Angkutan Udara", icon: <Plane className="w-3.5 h-3.5" /> },
  { id: "flight_approval", label: "Flight Approval", icon: <FileCheck className="w-3.5 h-3.5" /> },
  { id: "pelayanan", label: "Pelayanan", icon: <Headphones className="w-3.5 h-3.5" /> },
  { id: "tarif", label: "Tarif", icon: <BadgeDollarSign className="w-3.5 h-3.5" /> },
  { id: "perintis", label: "Perintis", icon: <Navigation className="w-3.5 h-3.5" /> },
  { id: "delay_management", label: "Delay Management", icon: <Clock className="w-3.5 h-3.5" /> },
  { id: "haji", label: "Haji", icon: <Building2 className="w-3.5 h-3.5" /> },
];

const pengendalianSubItems: MenuItem[] = [
  { id: "rekonsiliasi", label: "Rekonsiliasi", icon: <Scale className="w-3.5 h-3.5" /> },
  { id: "bimtek", label: "Bimbingan Teknis", icon: <GraduationCap className="w-3.5 h-3.5" /> },
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
  const adminMenu: MenuItem[] = [
    { id: "airports", label: "Daftar Bandara", icon: <MapPin className="w-5 h-5" /> },
    { id: "admins", label: "Kelola Admin", icon: <UserCog className="w-5 h-5" /> },
    { id: "logs", label: "Log Aktivitas", icon: <Activity className="w-5 h-5" /> },
  ];

  const [openPengawasan, setOpenPengawasan] = useState(true);
  const [openPPRP, setOpenPPRP] = useState(true);
  const [openPengendalian, setOpenPengendalian] = useState(true);

  const handleMenuClick = (menu: ActiveMenu) => {
    onMenuChange(menu);
    if (onCloseMobile) onCloseMobile();
  };

  const isActive = (menu: ActiveMenu) => activeMenu === menu;

  const allPengawasanItems = [...pprpSubItems, ...pengawasanDirectItems];
  const isPengawasanActive = allPengawasanItems.some((i) => isActive(i.id));
  const isPPRPActive = pprpSubItems.some((i) => isActive(i.id));
  const isPengendalianActive = pengendalianSubItems.some((i) => isActive(i.id));

  // ─── Top-level item style ──────────────────────────────────

  const topItemClass = (active: boolean) =>
    `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
      active
        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-100 dark:border-emerald-900/30 shadow-sm"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-medium border border-transparent"
    }`;

  // ─── Sub-item style (inside collapsible group) ─────────────

  const subItemClass = (active: boolean) =>
    `w-full flex items-center gap-2 pl-8 pr-3 py-1.5 rounded-md text-[13px] transition-all cursor-pointer border-l-2 ${
      active
        ? "bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-medium border-l-emerald-500"
        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-700 dark:hover:text-slate-300 border-l-transparent hover:border-l-slate-300 dark:hover:border-l-slate-600"
    }`;

  // ─── Collapsible group header style ────────────────────────

  const collapseBtnClass = (open: boolean, hasActiveChild: boolean) =>
    `w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
      open
        ? hasActiveChild
          ? "text-emerald-700 dark:text-emerald-400"
          : "text-slate-800 dark:text-slate-200"
        : hasActiveChild
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
    } border border-transparent hover:border-slate-200 dark:hover:border-slate-700`;

  // ─── Render sub-items (inside collapsible) ─────────────────

  const renderSubItems = (items: MenuItem[]) => {
    return items.map((item) => (
      <button
        key={item.id}
        id={`sidebar-menu-${item.id}`}
        onClick={() => handleMenuClick(item.id)}
        className={subItemClass(isActive(item.id))}
      >
        <span className={isActive(item.id) ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}>
          {item.icon}
        </span>
        <span className="truncate">{item.label}</span>
      </button>
    ));
  };

  // ─── Render collapsed sub-items ────────────────────────────

  const renderCollapsedSubItems = (items: MenuItem[]) => {
    return items.map((item) => (
      <button
        key={item.id}
        id={`sidebar-menu-${item.id}`}
        onClick={() => handleMenuClick(item.id)}
        className={topItemClass(isActive(item.id))}
        title={item.label}
      >
        {item.icon && <span className={isActive(item.id) ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}>{item.icon}</span>}
      </button>
    ));
  };

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
        {/* Header */}
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

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-2.5 space-y-5">
          <div>
            {!collapsed && (
              <p className="px-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 font-mono">
                Menu Utama
              </p>
            )}
            <nav className="space-y-0.5">
              {/* Dashboard */}
              <button
                id="sidebar-menu-dashboard"
                onClick={() => handleMenuClick("dashboard")}
                className={topItemClass(isActive("dashboard"))}
                title={collapsed ? "Dashboard" : ""}
              >
                <span className={isActive("dashboard") ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}>
                  <LayoutDashboard className="w-5 h-5" />
                </span>
                {!collapsed && <span>Dashboard</span>}
              </button>

              {!collapsed ? (
                <>
                  {/* PENGAWASAN */}
                  <div className="mt-1 bg-slate-50/60 dark:bg-slate-800/20 rounded-lg p-1.5">
                    <button
                      onClick={() => setOpenPengawasan(!openPengawasan)}
                      className={collapseBtnClass(openPengawasan, isPengawasanActive)}
                    >
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
                        <span>Pengawasan</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isPengawasanActive
                            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                        }`}>
                          {allPengawasanItems.length}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openPengawasan ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {openPengawasan && (
                      <div className="space-y-0.5 mt-0.5 border-l-2 border-slate-200 dark:border-slate-700 ml-5">
                        {/* PPRP sub-group (nested collapsible) */}
                        <div className="mt-0.5">
                          <button
                            onClick={() => setOpenPPRP(!openPPRP)}
                            className={`w-full flex items-center gap-2 pl-8 pr-3 py-1.5 rounded-md text-[13px] transition-all cursor-pointer border-l-2 ${
                              isPPRPActive
                                ? "bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-medium border-l-emerald-500"
                                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-700 dark:hover:text-slate-300 border-l-transparent hover:border-l-slate-300 dark:hover:border-l-slate-600"
                            }`}
                          >
                            <span className={isPPRPActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}>
                              <Compass className="w-3.5 h-3.5" />
                            </span>
                            <span className="truncate flex-1 text-left">PPRP</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${openPPRP ? "rotate-180" : ""}`} />
                          </button>

                          {openPPRP && (
                            <div className="space-y-0.5 mt-0.5 border-l-2 border-slate-200 dark:border-slate-700 ml-4">
                              {pprpSubItems.map((item) => (
                                <button
                                  key={item.id}
                                  id={`sidebar-menu-${item.id}`}
                                  onClick={() => handleMenuClick(item.id)}
                                  className={`w-full flex items-center gap-2 pl-6 pr-3 py-1.5 rounded-md text-[12px] transition-all cursor-pointer border-l-2 ${
                                    isActive(item.id)
                                      ? "bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-medium border-l-emerald-500"
                                      : "text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-600 dark:hover:text-slate-300 border-l-transparent hover:border-l-slate-300 dark:hover:border-l-slate-600"
                                  }`}
                                >
                                  <span className={isActive(item.id) ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}>
                                    {item.icon}
                                  </span>
                                  <span className="truncate">{item.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Direct items under Pengawasan */}
                        {pengawasanDirectItems.map((item) => (
                          <button
                            key={item.id}
                            id={`sidebar-menu-${item.id}`}
                            onClick={() => handleMenuClick(item.id)}
                            className={subItemClass(isActive(item.id))}
                          >
                            <span className={isActive(item.id) ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}>
                              {item.icon}
                            </span>
                            <span className="truncate">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* PENGENDALIAN */}
                  <div className="mt-1 bg-slate-50/60 dark:bg-slate-800/20 rounded-lg p-1.5">
                    <button
                      onClick={() => setOpenPengendalian(!openPengendalian)}
                      className={collapseBtnClass(openPengendalian, isPengendalianActive)}
                    >
                      <div className="flex items-center gap-3">
                        <Scale className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
                        <span>Pengendalian</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isPengendalianActive
                            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                        }`}>
                          {pengendalianSubItems.length}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openPengendalian ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {openPengendalian && (
                      <div className="space-y-0.5 mt-0.5 border-l-2 border-slate-200 dark:border-slate-700 ml-5">
                        {renderSubItems(pengendalianSubItems)}
                      </div>
                    )}
                  </div>

                  {/* Standalone items */}
                  <div className="mt-1 space-y-0.5">
                    {standaloneMenuItems.map((item) => (
                      <button
                        key={item.id}
                        id={`sidebar-menu-${item.id}`}
                        onClick={() => handleMenuClick(item.id)}
                        className={topItemClass(isActive(item.id))}
                      >
                        <span className={isActive(item.id) ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {renderCollapsedSubItems([
                    { id: "pprp_14_hari", label: "PPRP 14 Hari", icon: <Compass className="w-5 h-5" /> },
                    { id: "pengawasan_pprp", label: "Pengawasan PPRP", icon: <Compass className="w-5 h-5" /> },
                    { id: "lalu_lintas", label: "Lalu Lintas", icon: <Plane className="w-5 h-5" /> },
                    { id: "flight_approval", label: "Flight Approval", icon: <FileCheck className="w-5 h-5" /> },
                    { id: "pelayanan", label: "Pelayanan", icon: <Headphones className="w-5 h-5" /> },
                    { id: "tarif", label: "Tarif", icon: <BadgeDollarSign className="w-5 h-5" /> },
                    { id: "perintis", label: "Perintis", icon: <Navigation className="w-5 h-5" /> },
                    { id: "delay_management", label: "Delay Management", icon: <Clock className="w-5 h-5" /> },
                    { id: "haji", label: "Haji", icon: <Building2 className="w-5 h-5" /> },
                  ])}
                  <div className="border-t border-slate-200 dark:border-slate-700 my-1 mx-2" />
                  {renderCollapsedSubItems([
                    { id: "rekonsiliasi", label: "Rekonsiliasi", icon: <Scale className="w-5 h-5" /> },
                    { id: "bimtek", label: "Bimbingan Teknis", icon: <GraduationCap className="w-5 h-5" /> },
                  ])}
                  <div className="border-t border-slate-200 dark:border-slate-700 my-1 mx-2" />
                  {renderCollapsedSubItems(standaloneMenuItems)}
                </>
              )}
            </nav>
          </div>

          {/* Pengaturan & Audit */}
          <div>
            {!collapsed && (
              <p className="px-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 font-mono">
                Pengaturan & Audit
              </p>
            )}
            <nav className="space-y-0.5">
              {adminMenu.map((item) => (
                <button
                  key={item.id}
                  id={`sidebar-menu-${item.id}`}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isActive(item.id)
                      ? "bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 font-semibold border border-sky-100 dark:border-sky-900/30 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent"
                  }`}
                  title={collapsed ? item.label : ""}
                >
                  <span className={isActive(item.id) ? "text-sky-600 dark:text-sky-400" : "text-slate-400 dark:text-slate-500"}>
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Footer */}
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
