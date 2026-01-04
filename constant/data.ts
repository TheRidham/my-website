export const GRADIENTS = {
  // Green Gradients
  greenLight: ["#6EE7B7", "#10B981"], // from-green-300 to-green-500
  greenDark: ["#34D399", "#059669"], // from-green-400 to-green-600

  // Orange Gradients
  orangeLight: ["#FDBA74", "#F97316"], // from-orange-300 to-orange-500
  orangeDark: ["#FB923C", "#EA580C"], // from-orange-400 to-orange-600

  // Blue Gradients
  blueLight: ["#93C5FD", "#3B82F6"], // from-blue-300 to-blue-500
  blueDark: ["#60A5FA", "#2563EB"], // from-blue-400 to-blue-600

  // Purple Gradients
  purpleLight: ["#aa97f4ff", "#8B5CF6"], // from-purple-300 to-purple-500
  purpleDark: ["#A78BFA", "#7C3AED"], // from-purple-400 to-purple-600

  // Teal Gradients
  tealLight: ["#5EEAD4", "#14B8A6"], // from-teal-300 to-teal-500
  tealDark: ["#2DD4BF", "#0D9488"], // from-teal-400 to-teal-600

  // Red Gradients
  redLight: ["#FCA5A5", "#EF4444"], // from-red-300 to-red-500
  redDark: ["#F87171", "#DC2626"], // from-red-400 to-red-600

  // Pink Gradients
  pinkLight: ["#F9A8D4", "#EC4899"], // from-pink-300 to-pink-500
  pinkDark: ["#F472B6", "#DB2777"], // from-pink-400 to-pink-600

  // Violet Gradients
  violetLight: ["#998bd3ff", "#8B5CF6"], // from-violet-300 to-violet-500
  violetDark: ["#8b75e3ff", "#7C3AED"], // from-violet-400 to-violet-600

  // Yellow Gradients
  yellowLight: ["#FDE68A", "#FBBF24"], // from-yellow-300 to-yellow-500
  yellowDark: ["#FCD34D", "#F59E0B"], // from-yellow-400 to-yellow-600

  // Indigo Gradients
  indigoLight: ["#A5B4FC", "#6366F1"], // from-indigo-300 to-indigo-500
  indigoDark: ["#818CF8", "#4F46E5"], // from-indigo-400 to-indigo-600

  // Lime Gradients
  limeLight: ["#D9F99D", "#84CC16"], // from-lime-300 to-lime-500
  limeDark: ["#BEF264", "#65A30D"], // from-lime-400 to-lime-600

  // Cyan Gradients
  cyanLight: ["#A5F3FC", "#06B6D4"], // from-cyan-300 to-cyan-500
  cyanDark: ["#67E8F9", "#0891B2"], // from-cyan-400 to-cyan-600

  // Rose Gradients
  roseLight: ["#FDA4AF", "#F43F5E"], // from-rose-300 to-rose-500
  roseDark: ["#FB7185", "#E11D48"], // from-rose-400 to-rose-600

  whiteLight: ["#F9FAFB", "#E5E7EB"], // from-white to light gray (very soft gradient)
  whiteDark: ["#E5E7EB", "#D1D5DB"], // from light gray to a slightly darker gray

  blueToPurple: ["#4DA1FF", "#A678FF"],
};

export const COLORS = {
  emrald: {
    background: "#D1FAE5", // bg-emerald-100
    text: "#059669", // text-emerald-600
    border: "#A7F3D0", // border-emerald-200
  },
  orange: {
    background: "#FFEDD5", // bg-orange-100
    text: "#EA580C", // text-orange-600
    border: "#FED7AA", // border-orange-200
  },
  blue: {
    background: "#DBEAFE", // bg-blue-100
    text: "#2563EB", // text-blue-600
    border: "#BFDBFE", // border-blue-200
  },
  purple: {
    background: "#EDE9FE", // bg-purple-100
    text: "#7C3AED", // text-purple-600
    border: "#DDD6FE", // border-purple-200
  },
  teal: {
    background: "#CCFBF1", // bg-teal-100
    text: "#0D9488", // text-teal-600
    border: "#99F6E4", // border-teal-200
  },
  red: {
    background: "#FEE2E2", // bg-red-100
    text: "#DC2626", // text-red-600
    border: "#FECACA", // border-red-200
  },
  pink: {
    background: "#FCE7F3", // bg-pink-100
    text: "#DB2777", // text-pink-600
    border: "#FBCFE8", // border-pink-200
  },
  violet: {
    background: "#EDE9FE", // bg-violet-100
    text: "#7C3AED", // text-violet-600
    border: "#DDD6FE", // border-violet-200
  },
  yellow: {
    background: "#FEF9C3", // bg-yellow-100
    text: "#CA8A04", // text-yellow-600
    border: "#FEF08A", // border-yellow-200
  },
  indigo: {
    background: "#E0E7FF", // bg-indigo-100
    text: "#4F46E5", // text-indigo-600
    border: "#C7D2FE", // border-indigo-200
  },
  lime: {
    background: "#ECFCCB", // bg-lime-100
    text: "#65A30D", // text-lime-600
    border: "#D9F99D", // border-lime-200
  },
  cyan: {
    background: "#CFFAFE", // bg-cyan-100
    text: "#0891B2", // text-cyan-600
    border: "#A5F3FC", // border-cyan-200
  },
  rose: {
    background: "#FFE4E6", // bg-rose-100
    text: "#E11D48", // text-rose-600
    border: "#FECDD3", // border-rose-200
  },
  logo: {
    text: "#743998",
  },
};

import { Scan, Pill, Star, FlaskConical, Link, Shirt, ShieldCheck, Gavel, UserRound, Lightbulb, FileText, ChartLine } from "lucide-react";

export const AI_APPS = {
  food: {
    id: 1,
    name: "Food Reader",
    icon: Scan,
    gradient: GRADIENTS.tealLight,
    tag: "food",
    isTop: true,
    background: COLORS.emrald.background, // bg-emerald-100
    text: COLORS.emrald.text, // text-emerald-600
    border: COLORS.emrald.border, // border-emerald-200
    gradientLight: GRADIENTS.greenLight, // Tailwind: from-green-300 to-green-500
    gradientDark: GRADIENTS.greenDark, // Tailwind: from-green-400 to-green-600
    isCompleted: true,
  },
  medicine: {
    id: 2,
    name: "Medicine Reader",
    icon: Pill,
    gradient: GRADIENTS.orangeDark,
    tag: "medicine",
    isTop: true,
    background: COLORS.orange.background, // bg-orange-100
    text: COLORS.orange.text, // text-orange-600
    border: COLORS.orange.border, // border-orange-200
    gradientLight: GRADIENTS.orangeLight, // from-orange-300 to-orange-500
    gradientDark: GRADIENTS.orangeDark, // from-orange-400 to-orange-600
    isCompleted: true,
  },
  prescription: {
    id: 3,
    name: "Deima AI",
    icon: Star,
    gradient: GRADIENTS.blueLight,
    tag: "prescription",
    isTop: true,
    background: COLORS.blue.background, // bg-blue-100
    text: COLORS.blue.text, // text-blue-600
    border: COLORS.blue.border, // border-blue-200
    gradientLight: GRADIENTS.blueLight, // from-blue-300 to-blue-500
    gradientDark: GRADIENTS.blueDark, // from-blue-400 to-blue-600
    isCompleted: true,
  },
  lab: {
    id: 4,
    name: "Lab Reports",
    icon: FlaskConical,
    gradient: GRADIENTS.purpleLight,
    tag: "lab",
    isTop: true,
    background: COLORS.purple.background, // bg-purple-100
    text: COLORS.purple.text, // text-purple-600
    border: COLORS.purple.border, // border-purple-200
    gradientLight: GRADIENTS.purpleLight, // from-purple-300 to-purple-500
    gradientDark: GRADIENTS.purpleDark, // from-purple-400 to-purple-600
    isCompleted: true,
  },
  shoplink: {
    id: 5,
    name: "Price Compare",
    icon: Link,
    gradient: GRADIENTS.redLight,
    tag: "shoplink",
    isTop: false,
    background: COLORS.red.background,
    text: COLORS.red.text,
    border: COLORS.red.border,
    gradientLight: GRADIENTS.redLight,
    gradientDark: GRADIENTS.redDark,
    isCompleted: false,
  },
  fashion: {
    id: 6,
    name: "Fashion",
    icon: Shirt,
    gradient: GRADIENTS.pinkDark,
    tag: "fashion",
    isTop: false,
    background: COLORS.pink.background,
    text: COLORS.pink.text,
    border: COLORS.pink.border,
    gradientLight: GRADIENTS.pinkLight,
    gradientDark: GRADIENTS.pinkDark,
    isCompleted: false,
  },
  truth: {
    id: 7,
    name: "Truth Detector",
    icon: ShieldCheck,
    gradient: GRADIENTS.cyanLight,
    tag: "truth",
    isTop: false,
    background: COLORS.cyan.background,
    text: COLORS.cyan.text,
    border: COLORS.cyan.border,
    gradientLight: GRADIENTS.cyanLight,
    gradientDark: GRADIENTS.cyanDark,
    isCompleted: false,
  },
  mediator: {
    id: 8,
    name: "AI Judge",
    icon: Gavel,
    gradient: GRADIENTS.purpleDark,
    tag: "mediator",
    isTop: false,
    background: COLORS.purple.background,
    text: COLORS.purple.text,
    border: COLORS.purple.border,
    gradientLight: GRADIENTS.purpleLight,
    gradientDark: GRADIENTS.purpleDark,
    isCompleted: true,
  },
  persona: {
    id: 9,
    name: "AI Personas",
    icon: UserRound,
    gradient: GRADIENTS.purpleLight,
    tag: "persona",
    isTop: false,
    background: COLORS.violet.background,
    text: COLORS.violet.text,
    border: COLORS.violet.border,
    gradientLight: GRADIENTS.violetLight,
    gradientDark: GRADIENTS.violetDark,
    isCompleted: false,
  },
  suggester: {
    id: 10,
    name: "AI Suggester",
    icon: Lightbulb,
    gradient: GRADIENTS.greenDark,
    tag: "suggester",
    isTop: true,
    background: COLORS.lime.background,
    text: COLORS.lime.text,
    border: COLORS.lime.border,
    gradientLight: GRADIENTS.limeLight,
    gradientDark: GRADIENTS.limeDark,
    isCompleted: false,
  },
  document: {
    id: 11,
    name: "Legal Expert",
    icon: FileText,
    gradient: GRADIENTS.blueLight,
    tag: "document",
    isTop: false,
    background: COLORS.indigo.background,
    text: COLORS.indigo.text,
    border: COLORS.indigo.border,
    gradientLight: GRADIENTS.indigoLight,
    gradientDark: GRADIENTS.indigoDark,
    isCompleted: false,
  },
  investment: {
    id: 12,
    name: "Investment Finder",
    icon: ChartLine,
    gradient: GRADIENTS.yellowDark,
    tag: "investment",
    isTop: true,
    background: COLORS.orange.background,
    text: COLORS.orange.text,
    border: COLORS.orange.border,
    gradientLight: GRADIENTS.orangeLight,
    gradientDark: GRADIENTS.orangeDark,
    isCompleted: false,
  },
};

export const AI_APP_TAGS = [
  { tag: 'food' },
  { tag: 'medicine' },
  { tag: 'prescription' },
  { tag: 'lab' },
  { tag: 'shoplink' },
  { tag: 'fashion' },
  { tag: 'truth' },
  { tag: 'mediator' },
  { tag: 'persona' },
  { tag: 'suggester' },
  { tag: 'document' },
  { tag: 'investment' },
];