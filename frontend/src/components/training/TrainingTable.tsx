import { useState } from "react";
import {
  Building2,
  CalendarDays,
  Clock,
  FileText,
  Keyboard,
  MessageSquareText,
  PlayCircle,
  Users,
} from "lucide-react";
import type { TrainingCategory } from "@/redux/features/TrainingModule/traininModuleApi";
import { SUB_DEPARTMENT_LABEL, type ModuleKey } from "./constants";
import type { ReviewMap } from "./types";
import DayNumberCell from "./DayNumberCell";
import LeadFileButton from "./LeadFileButton";
import QueryModal from "./Query/QueryModal";
import AnswersModal from "./Query/AnswersModal";
import TypingModal from "./TypingModal";
import { getDayDate } from "./utils";

import {
  Cell,
  ModeHeader,
  Pill,
  SectionHeading,
  TrainerBadge,
} from "./TableParts";

type Props = {
  subDepartment: "presales" | "telesales";
  reviews: ReviewMap;
  startDate: string | null;

  onOpenReview: (day: number) => void;
  onOpenLead: (category: TrainingCategory, moduleKey: ModuleKey) => void;
};

const thClass =
  "sticky top-0 z-20 bg-blue-900 px-3 py-1 text-base font-extrabold";

// Query modal me dikhne wala / backend ko jaane wala module name (day-wise)
const DAY_MODULE_NAME: Record<number, string> = {
  1: "Joining Formalities & Company Introduction",
  2: "Veh. - 1",
  3: "Veh. - 2",
  4: "Veh. - 2",
  5: "Veh. - 3",
  6: "Sales-1",
  7: "Sales-2 (Basics)",
  8: "Sales-2 (Rate Chart)",
};

export default function TrainingTable({
  subDepartment,
  reviews,
  startDate,
  onOpenReview,
  onOpenLead,
}: Props) {
  // kis day ke liye query modal khula hai (null = band)
  const [queryDay, setQueryDay] = useState<number | null>(null);

  // kis day ke answers popup me dikhane hain (null = band)
  const [answerDay, setAnswerDay] = useState<number | null>(null);

  // kis day ke liye typing popup khula hai (null = band)
  const [typingDay, setTypingDay] = useState<number | null>(null);

  const videoBtn = (key: ModuleKey) => (
    <LeadFileButton
      category="lead_video"
      onClick={() => onOpenLead("lead_video", key)}
    />
  );

  // Classroom text ke saamne hi dikhne wala chhota icon button
  const showAnswerBtn = (day: number) => (
    <button
      type="button"
      title="Show Answers"
      aria-label="Show Answers"
      onClick={() => setAnswerDay(day)}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-blue-800 shadow-sm ring-1 ring-blue-200 transition hover:bg-blue-50"
    >
      <MessageSquareText size={16} />
    </button>
  );

  // Typing icon button (Typing Tutor text ke bagal me, click par score popup khulta hai)
  const typingBtn = (day: number) => (
    <button
      type="button"
      title="Typing Scores"
      aria-label="Typing Scores"
      onClick={() => setTypingDay(day)}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-green-800 shadow-sm ring-1 ring-green-300 transition hover:bg-green-50"
    >
      <Keyboard size={16} />
    </button>
  );

  // date startDate se calculate hoti hai
  const dayCell = (day: number) => (
    <DayNumberCell
      day={day}
      date={getDayDate(startDate, day)}
      review={reviews[day]}
      onOpen={onOpenReview}
      onQuery={(d) => setQueryDay(d)}
    />
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* THICK SCROLLBAR CSS */}
      <style>{`
        .custom-scroll {
          scrollbar-width: auto !important;
          scrollbar-color: auto !important;
        }
        .custom-scroll::-webkit-scrollbar {
          width: 20px !important;
          height: 20px !important;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 10px;
          border: 4px solid #f1f5f9;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        .custom-scroll::-webkit-scrollbar-corner {
          background: #f1f5f9;
        }
      `}</style>

      {/* GREEN BAR: freeze */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-2 bg-green-500 px-6 py-4 text-white">
        <h2 className="flex items-center gap-3 text-xl font-black tracking-wide md:text-2xl">
          <CalendarDays size={26} />
          {SUB_DEPARTMENT_LABEL[subDepartment]} Training Program
        </h2>

        <div className="flex flex-1 flex-wrap items-center justify-evenly gap-x-5 gap-y-1 text-md font-bold">
          <span className="flex items-center gap-1.5">
            <Users size={16} />
            JOINER: DIVYA
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={16} />
            TL: RENU
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={16} />
            Working Hours: 11 AM - 7:30 PM
          </span>
        </div>
      </div>

      {/* SCROLL BOX 👈 custom-scroll class yahan add ki hai */}
      <div className="custom-scroll min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[1100px] border-separate border-spacing-0">
          <thead>
            <tr className="text-white">
              <th className={`${thClass} w-[260px] min-w-[260px] text-center`}>
                <span className="flex items-center justify-center gap-2">
                  <CalendarDays size={16} /> Day / Date
                </span>
              </th>
              <th className={thClass}>
                <span className="flex items-center justify-center gap-2">
                  <Clock size={16} /> 11:00 AM – 2:00 PM
                </span>
              </th>
              <th className={thClass}>
                <span className="flex items-center justify-center gap-2">
                  <Clock size={16} /> 2:30 PM – 5:00 PM
                </span>
              </th>
              <th className={thClass}>
                <span className="flex items-center justify-center gap-2">
                  <Clock size={16} /> 5:15 PM – 7:30 PM
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <SectionHeading
              title="Introduction & Documentation"
              icon={FileText}
            />
            <ModeHeader />

            {/* DAY 1 */}
            <tr>
              {dayCell(1)}

              <Cell>
                <Pill tone="blue" className="flex-wrap justify-start gap-4">
                  <FileText size={30} className="shrink-0 text-blue-700" />
                  <div className="text-left">
                    <div className="text-lg font-extrabold text-blue-800">
                      JOINING FORMALITIES
                    </div>
                    <TrainerBadge name="VIDYA" />

                    <div className="text-xs font-semibold leading-5 text-slate-700">
                      On-Boarding • Equipments & Docs
                      <br />
                      Training Program Print
                    </div>
                  </div>
                  {videoBtn("joining")}
                </Pill>
              </Cell>

              {/* Classroom */}
              <Cell>
                <TrainerBadge name="VIDYA" />
                <Pill tone="purple" className="gap-3">
                  <PlayCircle size={28} className="text-purple-700" />
                  <span className="text-lg font-bold text-purple-800">
                    Company Introduction
                  </span>
                  {showAnswerBtn(1)}
                </Pill>
              </Cell>

              <Cell>
                <Pill tone="green" className="gap-3">
                  <Building2 size={28} className="text-green-700" />
                  <span className="text-left text-lg font-bold leading-6 text-slate-800">
                    Company Intro-
                    <br />
                    Revise
                  </span>
                </Pill>
              </Cell>
            </tr>

            <SectionHeading title="VEHICLE Training" />
            <ModeHeader />

            {/* DAY 2 */}
            <tr>
              {dayCell(2)}

              <Cell>
                <Pill tone="blue" className="flex-wrap gap-3">
                  <span className="text-xl font-extrabold">Vehicle - 1</span>
                  {videoBtn("veh1")}
                </Pill>
              </Cell>

              {/* Classroom */}
              <Cell>
                <TrainerBadge name="MAYANK" />
                <Pill tone="red" className="gap-3">
                  <span className="text-xl font-extrabold">Vehicle - 1</span>
                  {showAnswerBtn(2)}
                </Pill>
              </Cell>

              <Cell rowSpan={3}>
                <Pill tone="green" className="h-full">
                  <div className="text-center text-base font-extrabold leading-7 text-slate-800">
                    Vehicle Research +
                    <br />
                    Group Discuss +
                    <br />
                    <span className="text-blue-700">
                      PINAAK Overview (Video)
                    </span>
                  </div>
                </Pill>

                {/* Typing Tutor (Day 2) */}
                <Pill tone="green" className="h-full m-2 gap-3">
                  <span className="text-center text-base font-extrabold leading-7 text-slate-800">
                    Typing Tutor
                  </span>
                  {typingBtn(2)}
                </Pill>

                <Pill tone="green" className="h-full m-2">
                  <div className="text-center text-base font-extrabold leading-7 text-slate-800">
                    Google Maps <br />
                  </div>
                </Pill>
              </Cell>
            </tr>

            {/* DAY 3 */}
            <tr>
              {dayCell(3)}

              <Cell>
                <Pill tone="blue" className="flex-wrap gap-3">
                  <span className="text-xl font-extrabold">Vehicle - 2</span>
                  {videoBtn("veh2")}
                </Pill>
              </Cell>

              {/* Classroom */}
              <Cell>
                <TrainerBadge name="MAYANK" />
                <Pill tone="red" className="gap-3">
                  <span className="text-xl font-extrabold">Vehicle - 2</span>
                  {showAnswerBtn(3)}
                </Pill>
              </Cell>
            </tr>

            {/* DAY 4 */}
            <tr>
              {dayCell(4)}

              <Cell>
                <Pill tone="blue" className="flex-wrap gap-3">
                  <span className="text-xl font-extrabold">Vehicle - 2</span>
                  {videoBtn("veh2")}
                </Pill>
              </Cell>

              {/* Classroom */}
              <Cell>
                <TrainerBadge name="MAYANK" />
                <Pill tone="red" className="gap-3">
                  <span className="text-xl font-extrabold">Vehicle - 2</span>
                  {showAnswerBtn(4)}
                </Pill>
              </Cell>
            </tr>

            {/* DAY 5 */}
            <tr>
              {dayCell(5)}

              <Cell>
                <Pill tone="blue" className="flex-wrap gap-3">
                  <span className="text-xl font-extrabold">Vehicle - 3</span>
                  {videoBtn("veh3")}
                </Pill>
              </Cell>

              {/* Classroom */}
              <Cell>
                <TrainerBadge name="MAYANK" />
                <Pill tone="red" className="gap-3">
                  <span className="text-xl font-extrabold">Vehicle - 3</span>
                  {showAnswerBtn(5)}
                </Pill>
              </Cell>

              <Cell>
                <TrainerBadge name="MAYANK" />
                <Pill tone="purple">
                  <span className="text-xl font-black text-red-700">
                    TEST - 1
                  </span>
                </Pill>
              </Cell>
            </tr>

            <SectionHeading title="SALES PROCESS" />
            <ModeHeader />

            {/* DAY 6 */}
            <tr>
              {dayCell(6)}

              <Cell>
                <Pill tone="blue" className="flex-wrap gap-3">
                  <span className="text-xl font-extrabold">Sales-1</span>
                  {videoBtn("sales1")}
                  {/* <LeadFileButton
                    category="lead_ppt"
                    onClick={() => onOpenLead("lead_ppt", "sales1")}
                  /> */}
                </Pill>
              </Cell>

              {/* Classroom */}
              <Cell>
                <TrainerBadge name="RENU" />
                <Pill tone="red" className="gap-3">
                  <span className="text-xl font-extrabold">Sales-1</span>
                  {showAnswerBtn(6)}
                </Pill>
              </Cell>

              <Cell rowSpan={2}>
                <Pill tone="green" className="h-full">
                  <div className="text-center text-xl font-extrabold leading-9 text-slate-800">
                    Group Discuss
                  </div>
                </Pill>

                {/* Typing Tutor (Day 6) */}
                <Pill tone="green" className="h-full m-2 gap-3">
                  <span className="text-center text-base font-extrabold leading-7 text-slate-800">
                    Typing Tutor
                  </span>
                  {typingBtn(6)}
                </Pill>

                <Pill tone="green" className="h-full m-2">
                  <div className="text-center text-base font-extrabold leading-7 text-slate-800">
                    Google Maps <br />
                  </div>
                </Pill>
              </Cell>
            </tr>

            {/* DAY 7 */}
            <tr>
              {dayCell(7)}

              <Cell>
                <Pill tone="blue" className="flex-wrap gap-3">
                  <span className="text-xl font-extrabold">
                    Sales-2
                    <span className="ml-1 text-sm font-semibold">(Basics)</span>
                  </span>
                  {videoBtn("sales2_basics")}
                </Pill>
              </Cell>

              {/* Classroom (Day 7 + Day 8 ka rowSpan cell) */}
              <Cell rowSpan={2}>
                <TrainerBadge name="RENU" />
                <Pill tone="red" className="h-full flex-col">
                  <div className="flex items-center gap-3 text-xl font-extrabold">
                    K.Y.C.
                    {showAnswerBtn(7)}
                  </div>
                  <div className="mt-2 text-sm font-bold">
                    (Next Month&apos;s Lead - 3/TS)
                  </div>
                </Pill>
              </Cell>
            </tr>

            {/* DAY 8 */}
            <tr>
              {dayCell(8)}

              <Cell>
                <Pill tone="blue" className="flex-wrap gap-3">
                  <span className="text-xl font-extrabold">
                    Sales-2
                    <span className="ml-1 text-sm font-semibold">
                      (Rate Chart)
                    </span>
                  </span>
                  {videoBtn("sales2_ratechart")}
                </Pill>
              </Cell>

              <Cell>
                <Pill tone="green">
                  <span className="text-xl font-extrabold">K.Y.C.</span>
                </Pill>
              </Cell>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FOOTER / LEGEND */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-5 py-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-700" />
            Self Learn
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-700" />
            Classroom
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-700" />
            Practical
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-purple-600" />
            Test
          </span>
        </div>

        <span className="text-xs font-bold text-slate-400">
          Urban Cruise | Training Manager
        </span>
      </div>

      {/* QUERY MODAL: ek hi baar, root me */}
      <QueryModal
        open={queryDay !== null}
        onClose={() => setQueryDay(null)}
        department="sales"
        subDepartment={subDepartment}
        day={queryDay ?? 1}
        moduleName={queryDay ? DAY_MODULE_NAME[queryDay] : ""}
      />

      {/* ANSWERS MODAL: ek hi baar, root me */}
      <AnswersModal
        open={answerDay !== null}
        onClose={() => setAnswerDay(null)}
        subDepartment={subDepartment}
        day={answerDay}
      />

      {/* TYPING MODAL: ek hi baar, root me */}
      <TypingModal
        open={typingDay !== null}
        onClose={() => setTypingDay(null)}
        subDepartment={subDepartment}
        day={typingDay}
      />
    </div>
  );
}
