import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Plus,
  ChevronDown,
  Clock,
  CalendarRange,
  Megaphone,
  ListChecks,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function OpsDropdown() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const [openDropdown, setOpenDropdown] = useState(null);

  if (path !== "/ops") return null;

  const handleDropdownOpenChange = (dropdownName, isOpen) => {
    setOpenDropdown(isOpen ? dropdownName : null);
  };

  return (
    <div className="flex justify-center items-center gap-3">
      {/* Shift Management Dropdown */}
      <DropdownMenu
        onOpenChange={(isOpen) => handleDropdownOpenChange("shift", isOpen)}
      >
        <DropdownMenuTrigger asChild>
          <button
            className={`
            flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg
            transition-all duration-200 shadow-sm hover:shadow-md
            ${
              openDropdown === "shift"
                ? "bg-pink-500 text-white border-pink-500"
                : "bg-white text-pink-600 border-2 border-pink-200 hover:border-pink-300 hover:bg-pink-50"
            }
          `}
          >
            <div
              className={`
              transition-transform duration-200
              ${openDropdown === "shift" ? "rotate-90" : ""}
            `}
            >
              <Clock size={16} />
            </div>
            <span>Shift Management</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ml-1 ${openDropdown === "shift" ? "rotate-180" : ""}`}
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-64 p-1 bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg rounded-xl"
          align="start"
        >
          <DropdownMenuItem
            onClick={() => navigate("/add-shift")}
            className="cursor-pointer rounded-lg py-2.5 hover:bg-pink-50 hover:text-pink-600 focus:bg-pink-50 focus:text-pink-600 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-pink-100 text-pink-600 group-hover:bg-pink-200 transition-colors">
                <Plus size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Shift Management</span>
                <span className="text-xs text-gray-500">
                  Create and edit shifts
                </span>
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-gray-100" />

          <DropdownMenuItem
            onClick={() => navigate("/duty-roster")}
            className="cursor-pointer rounded-lg py-2.5 hover:bg-pink-50 hover:text-pink-600 focus:bg-pink-50 focus:text-pink-600 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-pink-100 text-pink-600 group-hover:bg-pink-200 transition-colors">
                <CalendarRange size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Duty Roster</span>
                <span className="text-xs text-gray-500">
                  Manage employee schedules
                </span>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Announcement Dropdown */}
    </div>
  );
}

export default OpsDropdown;
