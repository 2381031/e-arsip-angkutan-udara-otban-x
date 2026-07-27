import React, { useState, useEffect } from "react";
import { Lock, User, Eye, EyeOff, LogIn, Sun, Moon, CheckCircle, AlertCircle } from "lucide-react";
import { OtbanLogo } from "./OtbanLogo.js";
import { APP_SUBTITLE, APP_TITLE } from "../constants/branding.js";

interface LoginScreenProps {
  onLoginSuccess: (token: string, user: any) => void;
  addToast: (message: string, type: "success" | "warning" | "error" | "info") => void;
  theme: "light" | "dark";
  onThemeToggle: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  addToast,
  theme,
  onThemeToggle,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginStep, setLoginStep] = useState<"idle" | "connecting" | "authenticating" | "loading_session" | "success" | "error">("idle");

  // Auto-populate if remember me was saved previously
  useEffect(() => {
    const savedUser = localStorage.getItem("remembered_username");
    if (savedUser) {
      setUsername(savedUser);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      addToast("Username dan password wajib diisi!", "warning");
      return;
    }

    setLoading(true);
    setLoginStep("connecting");

    try {
      setLoginStep("authenticating");
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          "API server tidak tersedia. Pastikan vercel.json sudah benar dan environment variables DATABASE_URL serta JWT_SECRET sudah diatur di Vercel."
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login gagal");
      }

      setLoginStep("loading_session");

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("remembered_username", username);
      } else {
        localStorage.removeItem("remembered_username");
      }

      setLoginStep("success");
      addToast(`Berhasil login! Selamat datang di ${APP_TITLE}.`, "success");
      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setLoginStep("error");
      addToast(err.message || "Koneksi ke server gagal", "error");
      setTimeout(() => setLoginStep("idle"), 2000);
    } finally {
      setLoading(false);
    }
  };

  const getStepLabel = () => {
    switch (loginStep) {
      case "connecting": return "Menghubungi server...";
      case "authenticating": return "Memeriksa kredensial...";
      case "loading_session": return "Memuat sesi Anda...";
      case "success": return "Berhasil! Mengarahkan...";
      case "error": return "Gagal. Silakan coba lagi.";
      default: return "Masuk Aplikasi";
    }
  };

  const getStepIcon = () => {
    switch (loginStep) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-emerald-300" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-rose-300" />;
      default:
        return <LogIn className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300 relative">
      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6">
        <button
          onClick={onThemeToggle}
          className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
          title={theme === "light" ? "Ganti ke Dark Mode" : "Ganti ke Light Mode"}
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
        </button>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-8 flex flex-col items-center">
        
        {/* Logo OTBAN X */}
        <div className="mb-6 transform hover:scale-105 transition duration-300">
          <OtbanLogo className="w-28 h-28" />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="font-display font-extrabold text-2xl tracking-tight text-emerald-700 dark:text-emerald-400">
            {APP_TITLE}
          </h2>
          <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 mt-1 uppercase leading-relaxed">
            {APP_SUBTITLE}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <User className="w-5 h-5" />
              </span>
              <input
                id="username"
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-sm disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition text-sm disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 dark:bg-slate-950 dark:border-slate-800 disabled:opacity-50"
              />
              <span>Remember Me</span>
            </label>
          </div>

          {/* Submit Button with Step Feedback */}
          <div className="space-y-3">
            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-700/30 transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span className="text-sm">{getStepLabel()}</span>
                </span>
              ) : (
                <>
                  {getStepIcon()}
                  <span>Masuk Aplikasi</span>
                </>
              )}
            </button>

            {/* Step progress indicators */}
            {loading && (
              <div className="flex items-center justify-center gap-1.5">
                {(["connecting", "authenticating", "loading_session"] as const).map((step) => {
                  const isDone = ["authenticating", "loading_session", "success"].indexOf(loginStep) > ["connecting", "authenticating", "loading_session"].indexOf(step);
                  const isCurrent = loginStep === step;
                  return (
                    <div
                      key={step}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        isDone
                          ? "w-8 bg-emerald-400"
                          : isCurrent
                          ? "w-8 bg-emerald-600 animate-pulse"
                          : "w-4 bg-slate-200 dark:bg-slate-700"
                      }`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
