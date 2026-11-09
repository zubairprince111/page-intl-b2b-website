import React from "react";

interface BrandPartner {
  name: string;
  category: string;
  country: string;
  logo: React.ReactNode;
}

export function BrandPartners() {
  const partnerBrands: BrandPartner[] = [
    {
      name: "BOSCH",
      category: "Diagnostics & Systems",
      country: "Germany",
      logo: (
        <svg viewBox="0 0 160 40" className="h-7 md:h-8 w-auto fill-current" aria-label="Bosch">
          {/* Bosch iconic Magneto Armature symbol */}
          <g transform="translate(6, 4)">
            <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2.8" />
            <circle cx="16" cy="16" r="9" fill="none" stroke="currentColor" strokeWidth="2.2" />
            <rect x="14" y="0" width="4" height="6.5" fill="currentColor" rx="1" />
            <rect x="14" y="25.5" width="4" height="6.5" fill="currentColor" rx="1" />
            <rect x="13.5" y="8" width="5" height="16" fill="currentColor" rx="1" />
          </g>
          {/* BOSCH bold wordmark */}
          <text
            x="48"
            y="27"
            fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
            fontWeight="900"
            fontSize="24"
            letterSpacing="2.5"
            fill="currentColor"
          >
            BOSCH
          </text>
        </svg>
      ),
    },
    {
      name: "BREMBO",
      category: "High-Performance Braking",
      country: "Italy",
      logo: (
        <svg viewBox="0 0 170 40" className="h-7 md:h-8 w-auto fill-current" aria-label="Brembo">
          {/* Brembo distinct lower-case circular b emblem */}
          <g transform="translate(4, 5)">
            <circle
              cx="15"
              cy="15"
              r="13"
              fill="#E21B24"
              className="group-hover:fill-[#E21B24] transition-colors"
            />
            <circle cx="15" cy="15" r="7.5" fill="white" />
            <circle
              cx="15"
              cy="15"
              r="3.2"
              fill="#E21B24"
              className="group-hover:fill-[#E21B24] transition-colors"
            />
            <rect x="2" y="2" width="6" height="13" fill="white" rx="1" />
          </g>
          {/* brembo iconic lowercase wordmark */}
          <text
            x="44"
            y="27"
            fontFamily="system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"
            fontWeight="800"
            fontSize="25"
            letterSpacing="-0.5"
            fill="currentColor"
          >
            brembo
          </text>
        </svg>
      ),
    },
    {
      name: "LAUNCH",
      category: "Diagnostic & ADAS Systems",
      country: "Tech",
      logo: (
        <svg viewBox="0 0 160 40" className="h-7 md:h-8 w-auto fill-current" aria-label="Launch">
          {/* Launch red angled accent chevron */}
          <polygon
            points="6,32 18,8 26,8 14,32"
            fill="#E30613"
            className="group-hover:fill-[#E30613] transition-colors"
          />
          <polygon
            points="18,32 30,8 35,8 23,32"
            fill="#E30613"
            opacity="0.85"
            className="group-hover:fill-[#E30613] transition-colors"
          />
          {/* LAUNCH bold italic wordmark */}
          <text
            x="40"
            y="27"
            fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="24"
            letterSpacing="1.2"
            fill="currentColor"
          >
            LAUNCH
          </text>
        </svg>
      ),
    },
    {
      name: "HUNTER",
      category: "Wheel Alignment & Tyre Service",
      country: "USA",
      logo: (
        <svg
          viewBox="0 0 165 40"
          className="h-7 md:h-8 w-auto fill-current"
          aria-label="Hunter Engineering"
        >
          {/* Hunter Engineering classic bold block wordmark */}
          <text
            x="4"
            y="24"
            fontFamily="'Arial Black', Impact, system-ui, sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="23"
            letterSpacing="1"
            fill="currentColor"
          >
            HUNTER
          </text>
          <rect
            x="4"
            y="27"
            width="102"
            height="2"
            fill="#CE1126"
            className="group-hover:fill-[#CE1126] transition-colors"
          />
          <text
            x="4"
            y="35"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="700"
            fontSize="7"
            letterSpacing="2.8"
            fill="currentColor"
            opacity="0.9"
          >
            ENGINEERING CO.
          </text>
        </svg>
      ),
    },
    {
      name: "MOTUL",
      category: "High-Performance Lubricants",
      country: "France",
      logo: (
        <svg viewBox="0 0 150 40" className="h-7 md:h-8 w-auto" aria-label="Motul">
          {/* Motul classic red rounded container badge */}
          <rect
            x="4"
            y="4"
            width="135"
            height="32"
            rx="6"
            fill="#E30613"
            className="opacity-90 group-hover:opacity-100 transition-opacity"
          />
          <text
            x="71"
            y="27"
            textAnchor="middle"
            fontFamily="'Arial Black', Impact, system-ui, sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="24"
            letterSpacing="1.5"
            fill="#FFFFFF"
          >
            MOTUL
          </text>
        </svg>
      ),
    },
    {
      name: "KRAFTWERK",
      category: "Workshop & Precision Tools",
      country: "Switzerland",
      logo: (
        <svg viewBox="0 0 185 40" className="h-7 md:h-8 w-auto fill-current" aria-label="Kraftwerk">
          {/* Swiss Flag Badge */}
          <g transform="translate(4, 8)">
            <rect
              width="24"
              height="24"
              rx="3"
              fill="#D52B1E"
              className="group-hover:fill-[#D52B1E] transition-colors"
            />
            <rect x="10" y="4.5" width="4" height="15" fill="#FFFFFF" rx="0.5" />
            <rect x="4.5" y="10" width="15" height="4" fill="#FFFFFF" rx="0.5" />
          </g>
          {/* KRAFTWERK clean typography */}
          <text
            x="36"
            y="23"
            fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
            fontWeight="900"
            fontSize="18"
            letterSpacing="1.8"
            fill="currentColor"
          >
            KRAFTWERK
          </text>
          <text
            x="37"
            y="32"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="700"
            fontSize="6.5"
            letterSpacing="2.2"
            fill="currentColor"
            opacity="0.8"
          >
            SWISS QUALITY TOOLS
          </text>
        </svg>
      ),
    },
    {
      name: "MAHLE",
      category: "Engine Filtration & Thermal Systems",
      country: "Germany",
      logo: (
        <svg viewBox="0 0 160 40" className="h-7 md:h-8 w-auto fill-current" aria-label="Mahle">
          {/* Mahle distinctive blue circle emblem with geometric cutout */}
          <g transform="translate(6, 6)">
            <circle
              cx="14"
              cy="14"
              r="13"
              fill="#003B7E"
              className="group-hover:fill-[#003B7E] transition-colors"
            />
            <circle cx="14" cy="14" r="7.5" fill="#FFFFFF" />
            <rect
              x="12"
              y="1"
              width="4"
              height="26"
              fill="#003B7E"
              className="group-hover:fill-[#003B7E] transition-colors"
            />
          </g>
          {/* MAHLE bold industrial wordmark */}
          <text
            x="42"
            y="26"
            fontFamily="system-ui, -apple-system, 'Arial Black', sans-serif"
            fontWeight="900"
            fontSize="21"
            letterSpacing="2"
            fill="currentColor"
          >
            MAHLE
          </text>
        </svg>
      ),
    },
    {
      name: "SNAP-ON",
      category: "Professional Diagnostic & Workshop Units",
      country: "USA",
      logo: (
        <svg viewBox="0 0 160 40" className="h-7 md:h-8 w-auto fill-current" aria-label="Snap-on">
          {/* Snap-on red accent underline bar */}
          <rect
            x="6"
            y="28"
            width="138"
            height="3"
            fill="#D81E05"
            className="group-hover:fill-[#D81E05] transition-colors"
            rx="1"
          />
          {/* Snap-on signature italicized heavyweight wordmark */}
          <text
            x="6"
            y="24"
            fontFamily="'Arial Black', Impact, system-ui, sans-serif"
            fontWeight="900"
            fontStyle="italic"
            fontSize="23"
            letterSpacing="0.5"
            fill="currentColor"
          >
            Snap-on
          </text>
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 items-center justify-items-center gap-6 sm:gap-8 lg:gap-6">
      {partnerBrands.map((brand) => (
        <div
          key={brand.name}
          className="group relative flex flex-col items-center justify-center p-3 rounded-xl hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition-all duration-300 w-full cursor-pointer"
          title={`${brand.name} — ${brand.category} (${brand.country})`}
        >
          <div className="text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors duration-300 grayscale group-hover:grayscale-0 flex items-center justify-center h-10 w-full">
            {brand.logo}
          </div>
          <span className="text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate max-w-full text-center">
            {brand.category}
          </span>
        </div>
      ))}
    </div>
  );
}
