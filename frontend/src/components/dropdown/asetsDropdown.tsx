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

function AsetDropdown() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const [openDropdown, setOpenDropdown] = useState(null);

  if (path !== "/assets") return null;

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
                ? "bg-red-500 text-white border-red-500"
                : "bg-white text-red-600 border-2 border-red-200 hover:border-red-300 hover:bg-red-50"
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
            <span>Asset Management</span>
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
            onClick={() => navigate("/onboardingVerify")}
            className="cursor-pointer rounded-lg py-2.5 hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-red-100 text-red-600 group-hover:bg-red-200 transition-colors">
                <Plus size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Onboarding Verify</span>
                <span className="text-xs text-gray-500">
                  Create and edit Onboarding Verify
                </span>
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-gray-100" />

          <DropdownMenuItem
            onClick={() => navigate("/duty-roster")}
            className="cursor-pointer rounded-lg py-2.5 hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-red-100 text-red-600 group-hover:bg-red-200 transition-colors">
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

          <DropdownMenuItem
            onClick={() => navigate("/background-verification")}
            className="cursor-pointer rounded-lg py-2.5 hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-red-100 text-red-600 group-hover:bg-red-200 transition-colors">
                <CalendarRange size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  Background Verification
                </span>
                <span className="text-xs text-gray-500">
                  Manage employee verification
                </span>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Announcement Dropdown */}
      {/* <DropdownMenu
        onOpenChange={(isOpen) =>
          handleDropdownOpenChange("announcement", isOpen)
        }
      >
        <DropdownMenuTrigger asChild>
          <button
            className={`
            flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg
            transition-all duration-200 shadow-sm hover:shadow-md
            ${
              openDropdown === "announcement"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-blue-600 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
            }
          `}
          >
            <div
              className={`
              transition-transform duration-200
              ${openDropdown === "announcement" ? "scale-110" : ""}
            `}
            >
              <Megaphone size={16} />
            </div>
            <span>Announcement</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ml-1 ${openDropdown === "announcement" ? "rotate-180" : ""}`}
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-64 p-1 bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg rounded-xl">
          <DropdownMenuItem
            onClick={() => navigate("/add-announcement")}
            className="cursor-pointer rounded-lg py-2.5 hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
                <Plus size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Add Announcement</span>
                <span className="text-xs text-gray-500">
                  Create new announcement
                </span>
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-gray-100" />

          <DropdownMenuItem
            onClick={() => navigate("/announcement-list")}
            className="cursor-pointer rounded-lg py-2.5 hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
                <ListChecks size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">View Announcements</span>
                <span className="text-xs text-gray-500">
                  Browse all announcements
                </span>
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-gray-100" />

          <DropdownMenuItem
            onClick={() => navigate("/announcement-target")}
            className="cursor-pointer rounded-lg py-2.5 hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
                <Users size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Target Audience</span>
                <span className="text-xs text-gray-500">
                  Manage announcement visibility
                </span>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu> */}
    </div>
  );
}

export default AsetDropdown;
