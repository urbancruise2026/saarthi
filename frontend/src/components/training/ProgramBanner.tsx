import { Clock, Users } from "lucide-react";
import { SUB_DEPARTMENT_LABEL } from "./constants";
import logo from "../../assets/LOGO.png";

export default function ProgramBanner({
  subDepartment,
}: {
  subDepartment: "presales" | "telesales";
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 via-teal-600 to-teal-800 shadow-sm md:flex-row md:items-center">
      <div className="flex items-center justify-center p-4 md:border-r md:border-white/30">
        <div className="flex h-24 w-40 items-center justify-center rounded-2xl bg-white p-3">
          <img
            src={logo}
            alt="Urban Cruise"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </div>

      <div className="flex-1 px-6 py-4 text-white">
        <h2 className="text-2xl font-black tracking-wide md:text-3xl">
          TRAINING PROGRAM – {SUB_DEPARTMENT_LABEL[subDepartment]}
        </h2>

        <div className="mt-3 grid grid-cols-1 gap-3 text-sm font-extrabold sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <Users size={24} />
            JOINER: DIVYA
          </div>
          <div className="flex items-center gap-2 sm:border-l sm:border-white/30 sm:pl-4">
            <Users size={24} />
            TL: RENU
          </div>
          <div className="flex items-center gap-2 sm:border-l sm:border-white/30 sm:pl-4">
            <Clock size={24} />
            11 AM - 7:30 PM
          </div>
        </div>
      </div>
    </div>
  );
}
