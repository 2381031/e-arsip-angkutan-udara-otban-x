import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { JenisArsip } from "../types.js";
import {
  ARCHIVE_CATEGORIES,
  ARCHIVE_GROUP_ORDER,
  categoryNameToSlug,
} from "../utils/archiveCategories.js";

interface CategorySelectProps {
  value: string;
  onChange: (id: string) => void;
  categories: JenisArsip[];
  className?: string;
  disabled?: boolean;
}

// Group kategori mengikuti struktur menu sidebar (Pengawasan, Pengendalian, lainnya).
// Hanya kategori yang ada di daftar menu yang ditampilkan (kategori lama diabaikan).
export const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  onChange,
  categories,
  className = "",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = categories.find((c) => c.id === value);

  const groups = ARCHIVE_GROUP_ORDER.map((group) => ({
    group,
    items: ARCHIVE_CATEGORIES.filter((d) => d.group === group)
      .map((d) => categories.find((c) => categoryNameToSlug(c.nama_jenis) === categoryNameToSlug(d.nama)))
      .filter((c): c is JenisArsip => !!c),
  }));

  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  const selectOption = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={`w-full px-3 py-2.5 flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-left transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <span className={`truncate ${selected ? "text-slate-800 dark:text-slate-100" : "text-slate-400"}`}>
          {selected ? selected.nama_jenis : "Pilih Jenis Arsip..."}
        </span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-56 overflow-y-auto">
          {groups.map(({ group, items }) => (
            <div key={group}>
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40">
                {group === "Lainnya" ? "Menu Lainnya" : group}
              </div>
              {items.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectOption(c.id)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left transition cursor-pointer ${
                    c.id === value
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <span className="truncate">{c.nama_jenis}</span>
                  {c.id === value && <Check className="w-4 h-4 shrink-0" />}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
