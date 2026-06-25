import React, { useState } from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

// ============================================================================
// KONFIGURASI LOGO CUSTOM
// ============================================================================
// Anda dapat mengganti gambar logo secara global dengan mengubah URL di bawah ini.
// - Jika Anda menggunakan file lokal, letakkan di folder 'uploads/' dan isi dengan '/uploads/nama_file.png'
// - Atau Anda bisa menggunakan URL eksternal langsung (misal: 'https://example.com/logo.png')
// Jika gambar tidak ditemukan atau gagal dimuat, aplikasi akan otomatis memunculkan logo SVG OTBAN default yang sangat elegan.
const CUSTOM_LOGO_URL = "/uploads/logo.png"; 

export const OtbanLogo: React.FC<LogoProps> = ({ className = "w-16 h-16", showText = false }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center">
      {!imageError && CUSTOM_LOGO_URL ? (
        <img
          src={CUSTOM_LOGO_URL}
          alt="Logo OTBAN X"
          className={`${className} object-contain transition-all duration-300`}
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        // Elegant Default Vector SVG Logo
        <svg
          viewBox="0 0 500 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          {/* External green circle */}
          <circle cx="250" cy="250" r="230" stroke="#4a7c59" strokeWidth="20" fill="transparent" />
          <circle cx="250" cy="250" r="210" stroke="#a3c9a8" strokeWidth="3" fill="transparent" />
          
          {/* SVG Text on Path for the Circular text */}
          <path
            id="textPath"
            d="M 250,250 m -175,0 a 175,175 0 1,1 350,0 a 175,175 0 1,1 -350,0"
            fill="none"
          />
          
          {/* Green/Teal Left Horn */}
          <path
            d="M 120,90 Q 150,150 250,180 Q 160,110 120,90 Z"
            fill="url(#tealGradient)"
          />
          
          {/* Yellow/Orange Right Horn */}
          <path
            d="M 380,90 Q 350,150 250,180 Q 340,110 380,90 Z"
            fill="url(#yellowGradient)"
          />

          {/* Purple/Indigo Center Face Details */}
          <path
            d="M 170,180 Q 210,190 250,230 Q 250,300 250,400 Q 210,340 190,260 Z"
            fill="#3f37c9"
          />
          <path
            d="M 330,180 Q 290,190 250,230 Q 250,300 250,400 Q 290,340 310,260 Z"
            fill="#4895ef"
          />

          {/* Left ear */}
          <path d="M 120,180 L 160,200 L 150,225 Z" fill="#3f37c9" />
          {/* Right ear */}
          <path d="M 380,180 L 340,200 L 350,225 Z" fill="#4895ef" />

          {/* Left Swirl eye detail */}
          <path
            d="M 215,220 C 205,200 225,190 230,205 C 232,215 220,225 210,220"
            stroke="#000814"
            strokeWidth="4"
            fill="none"
          />
          {/* Right Swirl eye detail */}
          <path
            d="M 285,220 C 295,200 275,190 270,205 C 268,215 280,225 290,220"
            stroke="#000814"
            strokeWidth="4"
            fill="none"
          />

          {/* Airplane Silhouette in Center (Main symbol) */}
          <g id="airplane" transform="translate(250, 270) scale(1.15)">
            {/* Main Fuselage */}
            <path
              d="M -5,-50 L 5,-50 L 5,30 L -5,30 Z"
              fill="#03045e"
            />
            {/* Cockpit & Nose */}
            <path
              d="M -5,-50 Q 0,-65 5,-50 Z"
              fill="#03045e"
            />
            {/* Main Wings */}
            <path
              d="M 0,-15 L 65,10 L 65,18 L 0,3 Z"
              fill="#023e8a"
            />
            <path
              d="M 0,-15 L -65,10 L -65,18 L 0,3 Z"
              fill="#023e8a"
            />
            {/* Tail Wings */}
            <path
              d="M 0,20 L 22,28 L 22,32 L 0,26 Z"
              fill="#03045e"
            />
            <path
              d="M 0,20 L -22,28 L -22,32 L 0,26 Z"
              fill="#03045e"
            />
          </g>

          {/* Outer Text Elements */}
          <text fontFamily="'Space Grotesk', sans-serif" fontSize="23" fontWeight="bold" fill="#4a7c59">
            <textPath href="#textPath" startOffset="50%" textAnchor="middle">
              • OTORITAS BANDAR UDARA WILAYAH X •
            </textPath>
          </text>

          {/* Inner lower Text on Path */}
          <path
            id="lowerTextPath"
            d="M 85,250 A 165,165 0 0,0 415,250"
            fill="none"
          />
          <text fontFamily="'Space Grotesk', sans-serif" fontSize="22" fontWeight="900" fill="#ffffff">
            <textPath href="#lowerTextPath" startOffset="50%" textAnchor="middle">
              E - ARSIP
            </textPath>
          </text>

          {/* Gradients */}
          <defs>
            <linearGradient id="tealGradient" x1="120" y1="90" x2="250" y2="180">
              <stop offset="0%" stopColor="#2ec4b6" />
              <stop offset="100%" stopColor="#4a7c59" />
            </linearGradient>
            <linearGradient id="yellowGradient" x1="380" y1="90" x2="250" y2="180">
              <stop offset="0%" stopColor="#ffb703" />
              <stop offset="100%" stopColor="#fb8500" />
            </linearGradient>
          </defs>
        </svg>
      )}
      {showText && (
        <div className="mt-3 text-center">
          <h1 className="font-display font-bold text-lg tracking-wide text-slate-800 dark:text-slate-100 uppercase">
            E-Arsip Angkutan Udara
          </h1>
          <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400">
            OTORITAS BANDAR UDARA WILAYAH X
          </p>
        </div>
      )}
    </div>
  );
};

