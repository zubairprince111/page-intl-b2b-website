export interface Review {
  id: string;
  name: string;
  role: string;
  workshop: string;
  location?: string;
  rating?: number;
  date: string;
  verifiedBuyer?: boolean;
  equipment?: string;
  category?:
    "Garage Equipment" | "Diagnostics" | "Tyre & Wheel" | "EV Solutions" | "Spare Parts" | string;
  title?: string;
  comment: string;
  badge?: string;
  avatarInitials?: string;
  avatarColor?: string;
  highlights?: string[];
  installationTag?: string;
  helpfulCount?: number;
  operationalMetric?: string;
  audioDuration?: string;
  inspectionPass?: string;
}

export const reviewsStats = {
  averageRating: 4.92,
  totalReviews: 342,
  recommendationRate: 98.4,
  breakdown: [
    { stars: 5, count: 312, percent: 91 },
    { stars: 4, count: 24, percent: 7 },
    { stars: 3, count: 4, percent: 1.2 },
    { stars: 2, count: 1, percent: 0.4 },
    { stars: 1, count: 1, percent: 0.4 },
  ],
  aspectRatings: [
    { label: "Machinery Build Quality & Durability", score: "4.95", percent: 99 },
    { label: "On-Site Installation & Commissioning", score: "5.00", percent: 100 },
    { label: "Spare Parts Availability & Replenishment", score: "4.88", percent: 97 },
    { label: "After-Sales Technical Field Support", score: "4.92", percent: 98 },
  ],
};

export const reviewsData: Review[] = [
  {
    id: "rev-1",
    name: "Engr. Rafiqul Islam",
    role: "Managing Director",
    workshop: "Apex Master Garage & Fleet Hub",
    location: "Tejgaon Industrial Area, Dhaka",
    rating: 5,
    date: "March 2026",
    verifiedBuyer: true,
    equipment: "TORQ-4000 · 4.0T Electro-Hydraulic 2-Post Lift",
    category: "Garage Equipment",
    title: "Faultless lifting power and outstanding structural steel build",
    comment:
      "We installed two PAGE 4-Ton electro-hydraulic lifts six months ago. They handle everything from compact sedans to commercial delivery vans without breaking a sweat. The dual-cylinder synchronization is flawless, and PAGE International's engineering team handled the foundation certification on-site.",
    badge: "Commercial Fleet Depot",
    avatarInitials: "RI",
    avatarColor: "from-blue-600 to-indigo-700",
    highlights: ["4.0 Ton Capacity", "Dual-Cylinder Sync", "Zero Creep"],
    installationTag: "Verified 6-Month Installation",
    helpfulCount: 28,
    operationalMetric: "+140% Daily Bay Turnover",
    audioDuration: "0:24",
    inspectionPass: "Foundation Torque 280Nm · Pass",
  },
  {
    id: "rev-2",
    name: "Mahmud Hasan Chowdhury",
    role: "Head of After-Sales Operations",
    workshop: "Autobahn Multi-Brand German Service Hub",
    location: "Uttara Sector 7, Dhaka",
    rating: 5,
    date: "February 2026",
    verifiedBuyer: true,
    equipment: "AERO-10 · Rotary Screw Air Compressor 10HP (Silent)",
    category: "Garage Equipment",
    title: "Quiet enough to install inside the main customer-facing workshop bay",
    comment:
      "Pneumatic impact wrenches, bead breakers and paint guns consume serious continuous CFM. The 10HP rotary screw compressor from PAGE provides continuous clean 10-bar pressure with zero pressure drop. Noise level is remarkably low—our technicians can talk right beside the unit.",
    badge: "Authorized Service Hub",
    avatarInitials: "MC",
    avatarColor: "from-red-600 to-rose-700",
    highlights: ["10 Bar Continuous", "Silent Enclosure", "Clean Air Dryers"],
    installationTag: "Verified Commercial Buyer",
    helpfulCount: 21,
    operationalMetric: "<64 dB Ultra-Silent Operation",
    audioDuration: "0:19",
    inspectionPass: "10-Bar Continuous Flow · Pass",
  },
  {
    id: "rev-3",
    name: "Tanvir Ahmed",
    role: "Chief Diagnostician & Owner",
    workshop: "SpeedPulse Diagnostics & Performance Lab",
    location: "Chittagong Port Commercial Zone",
    rating: 5,
    date: "January 2026",
    verifiedBuyer: true,
    equipment: "SCAN-PRO X9 · Bidirectional OE Diagnostic Tablet",
    category: "Diagnostics",
    title: "OE-level bidirectional coding for Asian, European and hybrid platforms",
    comment:
      "Fast, responsive tablet with up-to-date CAN-FD and DoIP protocols. We routinely program steering angle sensors, ECU adaptations, and diesel DPF regenerations. The technical helpline from PAGE is always ready with calibration guidance and remote assistance.",
    badge: "Diagnostics Center",
    avatarInitials: "TA",
    avatarColor: "from-emerald-600 to-teal-700",
    highlights: ["CAN-FD & DoIP", "ECU Online Coding", "ADAS Calibration"],
    installationTag: "Verified Specialist Bay",
    helpfulCount: 34,
    operationalMetric: "2-Min ECU Online Flash",
    audioDuration: "0:32",
    inspectionPass: "DoIP & CAN-FD Bus Sync · Pass",
  },
  {
    id: "rev-4",
    name: "Sajid Karim",
    role: "Proprietor",
    workshop: "Express Tyre & Alignment Center",
    location: "Mirpur 10, Dhaka",
    rating: 5,
    date: "January 2026",
    verifiedBuyer: true,
    equipment: "TORQ-TC26 · Automatic Tyre Changer with Dual Assist Arms",
    category: "Tyre & Wheel",
    title: "Zero rim scratches even on 22-inch low-profile run-flats",
    comment:
      "The pneumatic assist arms make mounting stiff run-flat tires an effortless one-man job. Paired with the laser-guided wheel balancer, our throughput doubled within the first month. Essential machinery for high-volume tyre shops.",
    badge: "Tyre Specialist",
    avatarInitials: "SK",
    avatarColor: "from-amber-600 to-orange-700",
    highlights: ["Dual Assist Arms", "Laser Positioning", "22-Inch Capability"],
    installationTag: "Verified High-Volume Hub",
    helpfulCount: 19,
    operationalMetric: "0 Rim Scratches on 22-Inch",
    audioDuration: "0:21",
    inspectionPass: 'Pneumatic Clamping 26" · Pass',
  },
  {
    id: "rev-5",
    name: "Kazi Nayeem",
    role: "Technical Operations Manager",
    workshop: "GreenVolt Mobility Depot",
    location: "Savar EPZ Commercial Hub",
    rating: 5,
    date: "December 2025",
    verifiedBuyer: true,
    equipment: "VDE-1000 · 1000V Insulated Tool Set & Battery Diagnostic Station",
    category: "EV Solutions",
    title: "Certified 1000V safety tooling for commercial EV fleet servicing",
    comment:
      "With electric 3-wheelers and commercial delivery vans growing fast, PAGE provided our technicians with fully certified VDE insulated toolkits and high-voltage battery cell testers. Excellent compliance standards and safety training support.",
    badge: "EV Fleet Hub",
    avatarInitials: "KN",
    avatarColor: "from-cyan-600 to-blue-700",
    highlights: ["1000V VDE Certified", "Cell Balancing", "Isolation PPE"],
    installationTag: "Verified EV Depot",
    helpfulCount: 15,
    operationalMetric: "10,000V Dielectric Certified",
    audioDuration: "0:28",
    inspectionPass: "IEC 60900 VDE Proof · Pass",
  },
  {
    id: "rev-6",
    name: "Farhan Siddique",
    role: "Senior Workshop Engineer",
    workshop: "Crescent Motors Commercial Vehicle Depots",
    location: "Gazipur Industrial Zone",
    rating: 5,
    date: "November 2025",
    verifiedBuyer: true,
    equipment: "HYDRA-JACK 1.5 · Heavy-Duty Low-Profile Transmission Jack",
    category: "Garage Equipment",
    title: "Rugged hydraulic performance, fast delivery and solid build",
    comment:
      "Handles truck and commercial gearbox drops with great stability. The wide base and smooth swiveling ball-bearing casters allow safe maneuvering across workshop floor tiles. Prompt delivery directly to our Gazipur depot.",
    badge: "Commercial Depot",
    avatarInitials: "FS",
    avatarColor: "from-purple-600 to-violet-700",
    highlights: ["1.5T Capacity", "Universal Saddle", "360-Degree Casters"],
    installationTag: "Verified Industrial Bay",
    helpfulCount: 12,
    operationalMetric: "1.5T Low-Profile Lift",
    audioDuration: "0:15",
    inspectionPass: "Hydraulic Seal Pressure · Pass",
  },
  {
    id: "rev-7",
    name: "Hasanur Rahman",
    role: "Managing Partner",
    workshop: "Precision Track Wheel Alignment & Tyre Care",
    location: "Agrabad Commercial Area, Chittagong",
    rating: 5,
    date: "November 2025",
    verifiedBuyer: true,
    equipment: "TORQ-ALIGN 3D · High-Definition 3D Camera Wheel Aligner",
    category: "Tyre & Wheel",
    title: "Instant 2-minute roll-back calibration and pinpoint laser accuracy",
    comment:
      "Our alignment bay speed tripled after switching to the PAGE 3D HD camera aligner. The software database covers all Japanese imports, European sedans, and domestic fleet SUVs with automatic target recognition. Customers love the color-coded before/after alignment printout.",
    badge: "Alignment Center",
    avatarInitials: "HR",
    avatarColor: "from-teal-600 to-cyan-700",
    highlights: ["2-Min Roll-Back", "HD Optical Cameras", "OE Vehicle Specs"],
    installationTag: "Verified High-Volume Bay",
    helpfulCount: 17,
    operationalMetric: "3X Faster Bay Alignment",
    audioDuration: "0:26",
    inspectionPass: "Laser 3D Calibration: 0.01° · Pass",
  },
  {
    id: "rev-8",
    name: "Kamrul Hassan",
    role: "Technical Director",
    workshop: "Apex Prestige Auto Hub",
    location: "Kandirpar, Comilla",
    rating: 5,
    date: "October 2025",
    verifiedBuyer: true,
    equipment: "TORQ-SC45 · 4.5T Heavy-Duty In-Ground Scissor Lift",
    category: "Garage Equipment",
    title: "Flush floor design saves workshop space without compromising stability",
    comment:
      "When lowered, the lift sits flush with our epoxy workshop flooring, creating extra drive-over space in our busy service lanes. Pneumatic lock releases and dual hydraulic circuits provide maximum safety for our technicians working on luxury SUVs and armored pickups.",
    badge: "Prestige Auto Hub",
    avatarInitials: "KH",
    avatarColor: "from-indigo-600 to-blue-700",
    highlights: ["Flush In-Ground", "4.5T Heavy Duty", "Pneumatic Safety Locks"],
    installationTag: "Verified Certified Installation",
    helpfulCount: 23,
    operationalMetric: "100% Flush Floor Driveover",
    audioDuration: "0:20",
    inspectionPass: "Dual Hydraulic Circuit · Pass",
  },
  {
    id: "rev-9",
    name: "Syed Golam Kibria",
    role: "Chief EV Engineer",
    workshop: "VoltZone Commercial Fleet & Battery Workshop",
    location: "Tongi Industrial Area, Gazipur",
    rating: 5,
    date: "September 2025",
    verifiedBuyer: true,
    equipment: "EV-PACK 750 · High-Voltage Battery Pack Lifting Table & Cell Tester",
    category: "EV Solutions",
    title: "Safely handles 1,200kg battery drop-outs with zero tilt",
    comment:
      "Dropping and reinstalling EV powertrain packs requires precise tilt adjustments and insulated safety barriers. The PAGE hydraulic EV lifting table has adjustable tilting pads and insulated mechanical safety locks. An indispensable tool for our EV bus and commercial van fleet.",
    badge: "Certified EV Depot",
    avatarInitials: "SK",
    avatarColor: "from-emerald-600 to-green-700",
    highlights: ["1200kg Lift Capacity", "Adjustable Multi-Axis Table", "1000V Insulated"],
    installationTag: "Verified Commercial Fleet Hub",
    helpfulCount: 31,
    operationalMetric: "1,200kg Zero-Tilt Drop",
    audioDuration: "0:35",
    inspectionPass: "3-Axis Tilt Leveling · Pass",
  },
];

const LS_KEY_REVIEWS = "page_published_reviews";

export function getPublishedReviews(): Review[] {
  if (typeof window === "undefined") return reviewsData;
  try {
    const raw = localStorage.getItem(LS_KEY_REVIEWS);
    if (!raw) return reviewsData;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : reviewsData;
  } catch {
    return reviewsData;
  }
}

export function addPublishedReview(
  data: Omit<Review, "id" | "date"> & { id?: string; date?: string },
): Review {
  const current = getPublishedReviews();
  const initials = data.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const newReview: Review = {
    ...data,
    id: data.id || `rev-${Date.now()}`,
    date: data.date || "Just now",
    avatarInitials: data.avatarInitials || initials,
    verifiedBuyer: data.verifiedBuyer ?? true,
    badge: data.badge || "Verified Workshop",
  };

  const updated = [newReview, ...current];
  if (typeof window !== "undefined") {
    localStorage.setItem(LS_KEY_REVIEWS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("reviews_updated", { detail: updated }));
  }
  return newReview;
}
