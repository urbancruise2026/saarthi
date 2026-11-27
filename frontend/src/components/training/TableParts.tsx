import React from "react";
import { BookOpen, Users, ClipboardCheck, Car } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ---------- Trainer badge ----------
export function TrainerBadge({ name }: { name: string }) {
  return (
    <span className="absolute right-3 top-0 z-10 rounded-full bg-amber-400 px-3 py-0.5 text-[10px] font-extrabold text-white shadow">
      {name}
    </span>
  );
}

// ---------- Pill ----------
const cellTone = {
  blue: "bg-blue-100/80 text-blue-800",
  red: "bg-rose-100/80 text-rose-700",
  green: "bg-emerald-100/80 text-emerald-700",
  purple: "bg-purple-100/80 text-purple-700",
  orange: "bg-orange-50 text-slate-800",
} as const;

export function Pill({
  tone,
  children,
  className = "",
}: {
  tone: keyof typeof cellTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-[60px] items-center justify-center rounded-xl px-4 py-3 ${cellTone[tone]} ${className}`}
    >
      {children}
    </div>
  );
}

// ---------- Cells ----------
export function DateCell({ children }: { children: React.ReactNode }) {
  return (
    <td className="border-b border-r border-slate-200 px-3 py-4 text-center text-base font-semibold text-slate-700">
      {children}
    </td>
  );
}

export function Cell({
  children,
  rowSpan,
}: {
  children: React.ReactNode;
  rowSpan?: number;
}) {
  return (
    <td
      rowSpan={rowSpan}
      className="relative border-b border-r border-slate-200 px-2.5 py-2.5 align-middle last:border-r-0"
    >
      {children}
    </td>
  );
}

// ---------- Section heading ----------
// ---------- Section heading ----------
export function SectionHeading({
  title,
  subtitle,
  icon: Icon = Car,
}: {
  title: string;
  subtitle?: string;
  color?: "green" | "blue"; // ab use nahi hota, purane calls ke liye rakha hai
  icon?: LucideIcon;
}) {
  return (
    <tr>
      <td colSpan={4} className="border-b border-slate-200 bg-white px-3 py-3">
        <div className="flex items-center justify-center gap-4 rounded-2xl bg-green-500 px-6 py-4 text-white shadow-md">
          <span className="hidden h-px w-24 bg-white/40 sm:block" />
          <Icon size={30} className="text-white" />
          <span className="text-3xl font-black uppercase tracking-wide">
            {title}
            {subtitle && (
              <span className="ml-2 text-2xl font-bold normal-case opacity-90">
                {subtitle}
              </span>
            )}
          </span>
          <span className="hidden h-px w-24 bg-white/40 sm:block" />
        </div>
      </td>
    </tr>
  );
}

// ---------- Mode header (Self-learn / Classroom / Practical) ----------
export function ModeHeader() {
  return (
    <tr>
      <td className="border-b border-r border-slate-200" />
      <Cell>
        <Pill tone="orange" className="gap-3">
          <BookOpen className="text-blue-700" size={30} />
          <div className="text-left">
            <div className="text-xl font-black text-blue-800">SELF-LEARN</div>
            <div className="text-sm font-semibold text-slate-600">
              (Khud Se Seekho)
            </div>
          </div>
        </Pill>
      </Cell>

      <Cell>
        <Pill tone="red" className="gap-3">
          <Users className="text-red-600" size={30} />
          <div className="text-left">
            <div className="text-xl font-black text-red-700">CLASSROOM</div>
            <div className="text-sm font-semibold text-red-600">
              (Senior Se Seekho)
            </div>
          </div>
        </Pill>
      </Cell>

      <Cell>
        <Pill tone="green" className="gap-3">
          <ClipboardCheck className="text-green-700" size={30} />
          <div className="text-left">
            <div className="text-lg font-black text-slate-800">
              PRACTICAL - REVISE - TEST
            </div>
            <div className="text-sm font-semibold text-slate-600">
              (Pariksha Ka Samay)
            </div>
          </div>
        </Pill>
      </Cell>
    </tr>
  );
}
