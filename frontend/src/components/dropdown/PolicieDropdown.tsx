import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Plus,
  ChevronDown,
  FileText,
  Calendar,
  Clock,
  Sun,
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

import UploadPolicyForm from "@/components/UploadPolicyModal";

function PolicieDropdown() {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  if (path !== "/hr-policies") return null;

  const handleDropdownOpenChange = (dropdownName, isOpen) => {
    setOpenDropdown(isOpen ? dropdownName : null);
  };

  return (
    <div className="flex justify-center items-center gap-10">
      {/* Policy Dropdown */}
      <DropdownMenu
        onOpenChange={(isOpen) => handleDropdownOpenChange("policy", isOpen)}
      >
        <DropdownMenuTrigger asChild>
          <button
            className={`
            flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg
            transition-all duration-200 shadow-sm hover:shadow-md
            ${
              openDropdown === "policy"
                ? "bg-indigo-500 text-white border-indigo-500"
                : "bg-white text-indigo-600 border-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50"
            }
          `}
          >
            <Plus
              size={16}
              className={openDropdown === "policy" ? "animate-pulse" : ""}
            />
            <span>Policy</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${openDropdown === "policy" ? "rotate-180" : ""}`}
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-56 p-1 bg-white/90 backdrop-blur-sm border border-gray-100 shadow-lg rounded-xl"
          align="start"
        >
          <DropdownMenuItem
            onClick={() => setShowUploadForm(true)}
            className="cursor-pointer rounded-lg py-2.5 hover:bg-indigo-50 hover:text-indigo-600 focus:bg-indigo-50 focus:text-indigo-600"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-indigo-100 text-indigo-600">
                <Plus size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Upload Policy</span>
                <span className="text-xs text-gray-500">
                  Add new company policy
                </span>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Leave Policy Dropdown */}
      {/* <DropdownMenu
        onOpenChange={(isOpen) => handleDropdownOpenChange("leave", isOpen)}
      >
        <DropdownMenuTrigger asChild>
          <button
            className={`
            flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg
            transition-all duration-200 shadow-sm hover:shadow-md
            ${
              openDropdown === "leave"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-blue-600 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
            }
          `}
          >
            <Plus
              size={16}
              className={openDropdown === "leave" ? "animate-pulse" : ""}
            />
            <span>Leave Policy</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${openDropdown === "leave" ? "rotate-180" : ""}`}
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-64 p-1 bg-white/90 backdrop-blur-sm border border-gray-100 shadow-lg rounded-xl">
          <DropdownMenuItem className="cursor-pointer rounded-lg py-2.5 hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-blue-100 text-blue-600">
                <Clock size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Attendance Policy</span>
                <span className="text-xs text-gray-500">
                  Manage work hours & attendance
                </span>
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-gray-100" />

          <DropdownMenuItem className="cursor-pointer rounded-lg py-2.5 hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-blue-100 text-blue-600">
                <Calendar size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Leave Policy</span>
                <span className="text-xs text-gray-500">
                  Vacation & time-off rules
                </span>
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-gray-100" />

          <DropdownMenuItem className="cursor-pointer rounded-lg py-2.5 hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-blue-100 text-blue-600">
                <Sun size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Holiday Policy</span>
                <span className="text-xs text-gray-500">
                  Company holidays & observances
                </span>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu> */}

      <DropdownMenu
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

        <DropdownMenuContent
          className="w-64 p-1 bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg rounded-xl"
          align="start"
        >
          <DropdownMenuItem
            onClick={() => navigate("/add-announcement")}
            className="cursor-pointer rounded-lg py-2.5 hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
                <Plus size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Notice</span>
                <span className="text-xs text-gray-500">Create new Notice</span>
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-gray-100" />

          {/* <DropdownMenuItem
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
          </DropdownMenuItem>*/}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Upload Modal */}
      {showUploadForm && (
        <UploadPolicyForm onClose={() => setShowUploadForm(false)} />
      )}
    </div>
  );
}

export default PolicieDropdown;
