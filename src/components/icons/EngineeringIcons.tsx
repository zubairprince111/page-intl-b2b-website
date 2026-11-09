interface IconProps {
  className?: string;
}

/**
 * 01 — Turnkey Bay Engineering
 * Intricate CAD Blueprint & Electro-Hydraulic Lift Elevation Schematic
 */
export function IconBayEngineering({ className = "w-10 h-10" }: IconProps) {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Background blueprint subtle grid ticks */}
      <circle
        cx="6"
        cy="6"
        r="1"
        fill="currentColor"
        className="text-zinc-300 dark:text-zinc-700"
      />
      <circle
        cx="50"
        cy="6"
        r="1"
        fill="currentColor"
        className="text-zinc-300 dark:text-zinc-700"
      />
      <circle
        cx="6"
        cy="50"
        r="1"
        fill="currentColor"
        className="text-zinc-300 dark:text-zinc-700"
      />
      <circle
        cx="50"
        cy="50"
        r="1"
        fill="currentColor"
        className="text-zinc-300 dark:text-zinc-700"
      />

      {/* Concrete Foundation Ground Line & Anchor Bolts */}
      <path
        d="M4 48H52"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-zinc-400 dark:text-zinc-600"
      />
      <path
        d="M8 52L12 48M20 52L24 48M32 52L36 48M44 52L48 48"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-zinc-300 dark:text-zinc-700"
      />

      {/* Left Lift Column with Mounting Flange */}
      <rect
        x="10"
        y="12"
        width="6"
        height="36"
        rx="1"
        fill="currentColor"
        className="text-zinc-200 dark:text-zinc-800"
      />
      <rect
        x="10"
        y="12"
        width="6"
        height="36"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.75"
        className="text-zinc-800 dark:text-zinc-300 group-hover:text-primary transition-colors"
      />
      <line
        x1="8"
        y1="48"
        x2="18"
        y2="48"
        stroke="currentColor"
        strokeWidth="2.5"
        className="text-zinc-800 dark:text-zinc-200"
      />

      {/* Right Lift Column with Mounting Flange */}
      <rect
        x="40"
        y="12"
        width="6"
        height="36"
        rx="1"
        fill="currentColor"
        className="text-zinc-200 dark:text-zinc-800"
      />
      <rect
        x="40"
        y="12"
        width="6"
        height="36"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.75"
        className="text-zinc-800 dark:text-zinc-300 group-hover:text-primary transition-colors"
      />
      <line
        x1="38"
        y1="48"
        x2="48"
        y2="48"
        stroke="currentColor"
        strokeWidth="2.5"
        className="text-zinc-800 dark:text-zinc-200"
      />

      {/* Overhead Synchronization Cross-Beam & Level Axis */}
      <path
        d="M16 16H40"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="3 2"
        className="text-primary/70"
      />

      {/* Hydraulic Lift Carriages & Telescoping Swing Arms */}
      <g className="group-hover:-translate-y-1 transition-transform duration-300">
        {/* Left Carriage */}
        <rect x="14" y="27" width="5" height="11" rx="1" fill="#dc2626" />
        {/* Left Arm extending toward center with rubber pad */}
        <path d="M19 32H28" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="28" cy="30" r="2" fill="#dc2626" />

        {/* Right Carriage */}
        <rect x="37" y="27" width="5" height="11" rx="1" fill="#dc2626" />
        {/* Right Arm extending toward center with rubber pad */}
        <path d="M37 32H28" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Central CAD Dimension Measurement Crosshair */}
      <circle cx="28" cy="8" r="3" stroke="#dc2626" strokeWidth="1.5" fill="none" />
      <path d="M28 3V13M23 8H33" stroke="#dc2626" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 02 — 100% Genuine OEM Spares
 * Precision Helical Gear, Hydraulic Piston & Seal Assembly
 */
export function IconOemSpares({ className = "w-10 h-10" }: IconProps) {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Precision Interlocking Main Gear */}
      <g className="group-hover:rotate-45 transition-transform duration-500 origin-[24px_24px]">
        {/* Gear Outer Teeth (8 teeth) */}
        <rect
          x="22"
          y="6"
          width="4"
          height="6"
          rx="1"
          fill="currentColor"
          className="text-zinc-700 dark:text-zinc-300"
        />
        <rect
          x="22"
          y="36"
          width="4"
          height="6"
          rx="1"
          fill="currentColor"
          className="text-zinc-700 dark:text-zinc-300"
        />
        <rect
          x="6"
          y="22"
          width="6"
          height="4"
          rx="1"
          fill="currentColor"
          className="text-zinc-700 dark:text-zinc-300"
        />
        <rect
          x="36"
          y="22"
          width="6"
          height="4"
          rx="1"
          fill="currentColor"
          className="text-zinc-700 dark:text-zinc-300"
        />

        {/* Diagonal teeth */}
        <rect
          x="11.5"
          y="11.5"
          width="4"
          height="6"
          rx="1"
          transform="rotate(-45 11.5 11.5)"
          fill="currentColor"
          className="text-zinc-700 dark:text-zinc-300"
        />
        <rect
          x="33.5"
          y="33.5"
          width="4"
          height="6"
          rx="1"
          transform="rotate(-45 33.5 33.5)"
          fill="currentColor"
          className="text-zinc-700 dark:text-zinc-300"
        />
        <rect
          x="33.5"
          y="14.5"
          width="4"
          height="6"
          rx="1"
          transform="rotate(45 33.5 14.5)"
          fill="currentColor"
          className="text-zinc-700 dark:text-zinc-300"
        />
        <rect
          x="11.5"
          y="36.5"
          width="4"
          height="6"
          rx="1"
          transform="rotate(45 11.5 36.5)"
          fill="currentColor"
          className="text-zinc-700 dark:text-zinc-300"
        />

        {/* Pitch Circle Body */}
        <circle
          cx="24"
          cy="24"
          r="14"
          fill="currentColor"
          className="text-zinc-100 dark:text-zinc-800"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Center Bore with Keyway Slot */}
        <circle cx="24" cy="24" r="6" fill="#dc2626" />
        <rect x="23" y="16" width="2" height="4" fill="#dc2626" />
      </g>

      {/* Hydraulic Piston Rod & Viton Dual Seal Ring (Lower Right Assembly) */}
      <rect
        x="33"
        y="28"
        width="18"
        height="22"
        rx="2"
        fill="currentColor"
        className="text-zinc-200 dark:text-zinc-900"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      {/* Precision Micro Grooves / O-Ring channels */}
      <line x1="33" y1="34" x2="51" y2="34" stroke="#dc2626" strokeWidth="2" />
      <line x1="33" y1="40" x2="51" y2="40" stroke="#dc2626" strokeWidth="2" />
      {/* Machined Chamfer indicator */}
      <path d="M42 22V28" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
      <circle cx="42" cy="20" r="1.5" fill="#dc2626" />

      {/* Verified OEM Quality Checkmark Tag */}
      <circle cx="44" cy="46" r="5" fill="#dc2626" />
      <path
        d="M42 46L43.5 47.5L46.5 44.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 03 — High-Voltage EV Infrastructure
 * 1,000V VDE Dielectric Shield, Lithium Battery Cell Busbar & Lightning Arc
 */
export function IconEvReady({ className = "w-10 h-10" }: IconProps) {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Outer Dielectric Protective Shield */}
      <path
        d="M28 4L48 11V26C48 38.5 39.5 47.5 28 51C16.5 47.5 8 38.5 8 26V11L28 4Z"
        fill="currentColor"
        className="text-zinc-100 dark:text-zinc-900 group-hover:fill-primary/5 transition-colors"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Inner VDE Safety Boundary Line */}
      <path
        d="M28 9L44 14.5V26C44 36 37 43.5 28 46.5C19 43.5 12 36 12 26V14.5L28 9Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="3 2"
        className="text-zinc-300 dark:text-zinc-700"
      />

      {/* Lithium Cell Module Grid Busbars (Horizontal power rails) */}
      <line
        x1="18"
        y1="21"
        x2="38"
        y2="21"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-zinc-300 dark:text-zinc-700"
      />
      <line
        x1="18"
        y1="35"
        x2="38"
        y2="35"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-zinc-300 dark:text-zinc-700"
      />

      {/* Battery Cell Contacts (+ / -) */}
      <circle cx="18" cy="21" r="1.5" fill="#dc2626" />
      <circle cx="38" cy="21" r="1.5" fill="currentColor" className="text-zinc-400" />
      <circle cx="18" cy="35" r="1.5" fill="currentColor" className="text-zinc-400" />
      <circle cx="38" cy="35" r="1.5" fill="#dc2626" />

      {/* Center High-Voltage Lightning Bolt */}
      <path
        d="M30 14L20 28H28L26 42L38 26H29L30 14Z"
        fill="#dc2626"
        stroke="#dc2626"
        strokeWidth="1"
        strokeLinejoin="round"
        className="group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(220,38,38,0.5)] transition-all origin-center"
      />
    </svg>
  );
}

/**
 * 04 — Direct Field Engineering Squads
 * Calibrated Torque Gauge Dial, Service Micrometer & Inspection Seal
 */
export function IconFieldService({ className = "w-10 h-10" }: IconProps) {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Dial Gauge Outer Bezel */}
      <circle
        cx="28"
        cy="28"
        r="22"
        fill="currentColor"
        className="text-zinc-100 dark:text-zinc-900"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Gauge Scale Arc Tick Marks (0 - 400 Nm) */}
      {/* 240-degree dial scale */}
      <path
        d="M13 36C9.5 28 11.5 18 19 12C26.5 6 37 7 43 14C47.5 19.5 48 28 43 36"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 4"
        className="text-zinc-400 dark:text-zinc-600"
      />

      {/* Calibration Safe Operating Zone (Red Arc Segment) */}
      <path
        d="M35 10C39.5 12.5 43.5 17 44.5 22"
        stroke="#dc2626"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Center Pivot Hub */}
      <circle
        cx="28"
        cy="28"
        r="5"
        fill="currentColor"
        className="text-zinc-800 dark:text-zinc-200"
      />
      <circle cx="28" cy="28" r="2.5" fill="#dc2626" />

      {/* Dynamic Torque Indicator Needle (Pointing toward calibrated safe zone at 45 deg) */}
      <g className="group-hover:rotate-12 transition-transform duration-300 origin-[28px_28px]">
        <path d="M28 28L39 17" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="39" cy="17" r="1.5" fill="#dc2626" />
      </g>

      {/* Bottom Digital Torque Readout Box (280 Nm PASS) */}
      <rect
        x="18"
        y="36"
        width="20"
        height="8"
        rx="2"
        fill="currentColor"
        className="text-zinc-800 dark:text-zinc-200"
      />
      <rect x="18" y="36" width="20" height="8" rx="2" stroke="#dc2626" strokeWidth="1" />
      {/* Digital LCD segmented representation */}
      <line
        x1="21"
        y1="40"
        x2="35"
        y2="40"
        stroke="#dc2626"
        strokeWidth="1.5"
        strokeDasharray="3 2"
      />

      {/* Top Mounting Ring / Lanyard Lug */}
      <path
        d="M25 6C25 4.3 26.3 3 28 3C29.7 3 31 4.3 31 6"
        stroke="currentColor"
        strokeWidth="2"
        className="text-zinc-500"
      />
    </svg>
  );
}

/**
 * 01 — Extensive Network (500+ Workshops Nationwide)
 * Interconnected Map Hubs, Geometric Network Lattice & Workshop Pins
 */
export function IconExtensiveNetwork({ className = "w-10 h-10" }: IconProps) {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Network Grid Base */}
      <rect
        x="6"
        y="6"
        width="44"
        height="44"
        rx="8"
        fill="currentColor"
        className="text-zinc-50 dark:text-zinc-900"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Network Bus Lines */}
      <path
        d="M16 20L28 14L40 20L42 36L28 44L14 36L16 20Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeDasharray="2 3"
        className="text-zinc-400 dark:text-zinc-600"
      />
      <path
        d="M28 14V28M40 20L28 28M42 36L28 28M28 44V28M14 36L28 28M16 20L28 28"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-zinc-300 dark:text-zinc-700"
      />

      {/* Satellite Workshop Nodes */}
      <circle
        cx="16"
        cy="20"
        r="3"
        fill="currentColor"
        className="text-zinc-800 dark:text-zinc-200"
      />
      <circle
        cx="40"
        cy="20"
        r="3"
        fill="currentColor"
        className="text-zinc-800 dark:text-zinc-200"
      />
      <circle
        cx="42"
        cy="36"
        r="3"
        fill="currentColor"
        className="text-zinc-800 dark:text-zinc-200"
      />
      <circle
        cx="14"
        cy="36"
        r="3"
        fill="currentColor"
        className="text-zinc-800 dark:text-zinc-200"
      />
      <circle
        cx="28"
        cy="14"
        r="3"
        fill="currentColor"
        className="text-zinc-800 dark:text-zinc-200"
      />
      <circle
        cx="28"
        cy="44"
        r="3"
        fill="currentColor"
        className="text-zinc-800 dark:text-zinc-200"
      />

      {/* Central Command Hub (Dhaka Central HQ) */}
      <g className="group-hover:scale-110 transition-transform duration-300 origin-[28px_28px]">
        <circle cx="28" cy="28" r="6" fill="#dc2626" />
        <circle
          cx="28"
          cy="28"
          r="9"
          stroke="#dc2626"
          strokeWidth="1.5"
          strokeDasharray="3 2"
          className="animate-spin-slow origin-center"
        />
        <circle cx="28" cy="28" r="2.5" fill="#ffffff" />
      </g>
    </svg>
  );
}

/**
 * 02 — Strong Market Presence
 * Telemetry Tower, Radio Transceiver & Dynamic Communication Waveforms
 */
export function IconMarketPresence({ className = "w-10 h-10" }: IconProps) {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Communication Tower Base Legs */}
      <path
        d="M20 48L26 24M36 48L30 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-zinc-800 dark:text-zinc-200"
      />
      <path
        d="M22 42H34M24 33H32"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-zinc-400 dark:text-zinc-600"
      />

      {/* Central Mast & Transmitter Emitter */}
      <line
        x1="28"
        y1="24"
        x2="28"
        y2="15"
        stroke="currentColor"
        strokeWidth="2.5"
        className="text-zinc-900 dark:text-zinc-100"
      />
      <circle cx="28" cy="15" r="4" fill="#dc2626" />
      <circle cx="28" cy="15" r="1.5" fill="#ffffff" />

      {/* Radial Broadcast Waves */}
      <g className="group-hover:scale-105 transition-transform duration-300 origin-[28px_15px]">
        {/* Inner Wave Arc */}
        <path
          d="M20 15C20 10.6 23.6 7 28 7C32.4 7 36 10.6 36 15"
          stroke="#dc2626"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        {/* Outer Wave Arc */}
        <path
          d="M14 15C14 7.3 20.3 1 28 1C35.7 1 42 7.3 42 15"
          stroke="#dc2626"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="3 3"
        />
      </g>

      {/* Base Anchor Line */}
      <path
        d="M14 48H42"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-zinc-400 dark:text-zinc-600"
      />
    </svg>
  );
}

/**
 * 03 — Industry Connections
 * Institutional Crest, Handshake Alliance & Workshop Association Laurels
 */
export function IconIndustryConnections({ className = "w-10 h-10" }: IconProps) {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Crest Shield Boundary */}
      <path
        d="M28 6L44 11V26C44 37 36.5 45 28 49C19.5 45 12 37 12 26V11L28 6Z"
        fill="currentColor"
        className="text-zinc-100 dark:text-zinc-900"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Association Alliance Handshake Graphic */}
      <g className="group-hover:scale-105 transition-transform duration-300 origin-[28px_26px]">
        {/* Left Arm / Hand */}
        <path
          d="M17 29L23 23L27 26L23 31L17 29Z"
          fill="currentColor"
          className="text-zinc-700 dark:text-zinc-300"
        />
        {/* Right Arm / Hand Interlock */}
        <path d="M39 29L33 23L29 26L33 31L39 29Z" fill="#dc2626" />
        <circle cx="28" cy="25" r="2.5" fill="#ffffff" stroke="#dc2626" strokeWidth="1.5" />
      </g>

      {/* Dual City Stars (Dhaka & Chittagong) */}
      <circle cx="23" cy="38" r="2" fill="#dc2626" />
      <circle cx="33" cy="38" r="2" fill="#dc2626" />
      <path d="M28 35V42" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400" />
    </svg>
  );
}

/**
 * 04 — Proactive Sales (100+ Monthly On-Site Engagements)
 * Field Dispatch Waypoint, Speed Dial & Active Route Pointer
 */
export function IconProactiveSales({ className = "w-10 h-10" }: IconProps) {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Calendar / Milestone Target Board */}
      <rect
        x="8"
        y="10"
        width="40"
        height="38"
        rx="6"
        fill="currentColor"
        className="text-zinc-50 dark:text-zinc-900"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Top Calendar Binding Bar */}
      <path
        d="M8 20H48"
        stroke="currentColor"
        strokeWidth="2"
        className="text-zinc-800 dark:text-zinc-200"
      />
      <rect x="15" y="6" width="4" height="6" rx="1" fill="#dc2626" />
      <rect x="37" y="6" width="4" height="6" rx="1" fill="#dc2626" />

      {/* Target Engagement Reticle & Rapid Pointer */}
      <g className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">
        <circle
          cx="28"
          cy="33"
          r="8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="3 2"
          className="text-zinc-400 dark:text-zinc-600"
        />
        {/* Dynamic Arrow Navigation Heading */}
        <path
          d="M24 37L34 33L30 23L27 29L24 37Z"
          fill="#dc2626"
          stroke="#dc2626"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <circle cx="28" cy="33" r="2" fill="#ffffff" />
      </g>
    </svg>
  );
}

/**
 * 05 — Reliable Partner
 * Certified Heavy Hydraulic Column & Structural Anchor Pillar
 */
export function IconReliablePartner({ className = "w-10 h-10" }: IconProps) {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Concrete Foundation Base */}
      <rect
        x="10"
        y="44"
        width="36"
        height="6"
        rx="2"
        fill="currentColor"
        className="text-zinc-800 dark:text-zinc-200"
      />

      {/* Dual Heavy-Duty Support Columns */}
      <rect
        x="15"
        y="16"
        width="8"
        height="28"
        rx="1"
        fill="currentColor"
        className="text-zinc-200 dark:text-zinc-800"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <rect
        x="33"
        y="16"
        width="8"
        height="28"
        rx="1"
        fill="currentColor"
        className="text-zinc-200 dark:text-zinc-800"
        stroke="currentColor"
        strokeWidth="1.75"
      />

      {/* Center Hydraulic Cross-Brace & Synchronizer */}
      <path
        d="M19 22L37 38M37 22L19 38"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-zinc-400 dark:text-zinc-600"
      />

      {/* Top Solid Heavy Cross-Beam */}
      <rect
        x="12"
        y="10"
        width="32"
        height="6"
        rx="1.5"
        fill="currentColor"
        className="text-zinc-800 dark:text-zinc-200"
      />

      {/* Center Reliability Quality Seal */}
      <g className="group-hover:scale-110 transition-transform duration-300 origin-[28px_30px]">
        <circle cx="28" cy="30" r="6" fill="#dc2626" />
        <path
          d="M25 30L27 32L31 28"
          stroke="#ffffff"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/**
 * 06 — Focused Expertise
 * Technical Precision Caliper, Optical Reticle & Machinery Training Module
 */
export function IconFocusedExpertise({ className = "w-10 h-10" }: IconProps) {
  return (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Precision Lens Outer Ring */}
      <circle
        cx="28"
        cy="28"
        r="20"
        fill="currentColor"
        className="text-zinc-50 dark:text-zinc-900"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Precision Reticle Crosshair Ticks */}
      <path
        d="M28 10V18M28 38V46M10 28H18M38 28H46"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-zinc-400 dark:text-zinc-600"
      />

      {/* Concentric Calibration Target Rings */}
      <circle
        cx="28"
        cy="28"
        r="12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2 3"
        className="text-zinc-300 dark:text-zinc-700"
      />

      {/* Central Specialized Core / Electronic IC & Training Diamond */}
      <g className="group-hover:rotate-90 transition-transform duration-500 origin-[28px_28px]">
        <rect x="23" y="23" width="10" height="10" rx="2" fill="#dc2626" />
        <circle cx="28" cy="28" r="2" fill="#ffffff" />
      </g>

      {/* Corner Calibration Accents */}
      <circle cx="16" cy="16" r="1.5" fill="#dc2626" />
      <circle cx="40" cy="40" r="1.5" fill="#dc2626" />
    </svg>
  );
}
