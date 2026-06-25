export interface Profile {
  name: string;
  title: string;
  summary: string;
  contact: {
    email: string;
    phone: string;
    github?: string;
    linkedin?: string;
    website?: string;
    location: string;
  };
  skills: {
    category: string;
    items: string[];
  }[];
  experience: {
    id: string;
    company: string;
    role: string;
    period: string; // e.g. "2023.06 - Present"
    location: string;
    bullets: string[];
    skillsUsed?: string[];
  }[];
  projects: {
    id: string;
    name: string;
    role: string;
    period: string;
    bullets: string[];
    skillsUsed?: string[];
    link?: string;
  }[];
  education: {
    id: string;
    school: string;
    degree: string;
    major: string;
    period: string;
    bullets?: string[];
  }[];
  languages?: {
    name: string;
    level: string;
  }[];
  achievements?: string[];
  sectionNames?: {
    skills?: string;
    experience?: string;
    projects?: string;
    education?: string;
    achievements?: string;
  };
}

export type ThemeType = 'swiss' | 'luxury' | 'emerald' | 'tech' | 'indigo' | 'amber_warm';

export const THEMES = {
  swiss: {
    id: 'swiss',
    name: 'Swiss Minimalist',
    bg: 'bg-stone-50 text-stone-900',
    cardBg: 'bg-white',
    accent: 'text-rose-600',
    accentBg: 'bg-rose-50',
    accentBorder: 'border-rose-100',
    primaryBtn: 'bg-stone-900 hover:bg-stone-800 text-stone-50',
    labelBg: 'bg-stone-100 text-stone-800',
    fontSans: 'font-sans',
    fontSerif: 'font-sans',
    border: 'border-stone-200',
  },
  luxury: {
    id: 'luxury',
    name: 'Executive Gold',
    bg: 'bg-slate-900 text-slate-100',
    cardBg: 'bg-slate-950/60 backdrop-blur-md border border-amber-900/30',
    accent: 'text-amber-400',
    accentBg: 'bg-amber-950/50',
    accentBorder: 'border-amber-900/40',
    primaryBtn: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-medium',
    labelBg: 'bg-amber-950/40 text-amber-300 border border-amber-900/30',
    fontSans: 'font-sans',
    fontSerif: 'font-serif',
    border: 'border-slate-800',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Creative',
    bg: 'bg-[#fafbfa] text-emerald-950',
    cardBg: 'bg-white shadow-[0_4px_24px_-4px_rgba(16,185,129,0.06)]',
    accent: 'text-emerald-700',
    accentBg: 'bg-emerald-50',
    accentBorder: 'border-emerald-100',
    primaryBtn: 'bg-emerald-800 hover:bg-emerald-900 text-emerald-50',
    labelBg: 'bg-emerald-50 text-emerald-800 border border-emerald-100',
    fontSans: 'font-sans',
    fontSerif: 'font-sans',
    border: 'border-emerald-100',
  },
  tech: {
    id: 'tech',
    name: 'Tech Dark Mono',
    bg: 'bg-[#0a0f0d] text-[#e0e6e3]',
    cardBg: 'bg-[#101714] border border-[#23352e]',
    accent: 'text-[#00ff9d]',
    accentBg: 'bg-[#112a1f]',
    accentBorder: 'border-[#1b4c37]',
    primaryBtn: 'bg-[#00ff9d] hover:bg-[#00e18a] text-[#0a0f0d] font-bold',
    labelBg: 'bg-[#14231d] text-[#00ff9d] border border-[#1e3c30]',
    fontSans: 'font-mono',
    fontSerif: 'font-mono',
    border: 'border-[#1e2f28]',
  },
  indigo: {
    id: 'indigo',
    name: 'Nordic Editorial',
    bg: 'bg-slate-50 text-slate-900',
    cardBg: 'bg-white',
    accent: 'text-indigo-600',
    accentBg: 'bg-indigo-50/60',
    accentBorder: 'border-indigo-100',
    primaryBtn: 'bg-indigo-900 hover:bg-indigo-800 text-indigo-50',
    labelBg: 'bg-indigo-50 text-indigo-700 border border-indigo-100/60',
    fontSans: 'font-sans',
    fontSerif: 'font-serif',
    border: 'border-indigo-100/85',
  },
  amber_warm: {
    id: 'amber_warm',
    name: 'Warm Cappuccino',
    bg: 'bg-[#FAF6F0] text-[#3D352E]',
    cardBg: 'bg-[#FCFAF7] border border-[#EBE3D5]',
    accent: 'text-[#8E6C4E]',
    accentBg: 'bg-[#F2EAE0]',
    accentBorder: 'border-[#E6D9C8]',
    primaryBtn: 'bg-[#8E6C4E] hover:bg-[#78593F] text-white',
    labelBg: 'bg-[#F4ECE1] text-[#7A5B40] border border-[#E8DCB7]/20',
    fontSans: 'font-sans',
    fontSerif: 'font-sans',
    border: 'border-[#E6DDCE]',
  },
} as const;
