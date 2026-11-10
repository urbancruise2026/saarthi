import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Plus,
  ChevronDown,
  Clock,
  FileText,
  TrendingUp,
  Award,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const menuItems = [
  {
    label: "Offer Letter",
    desc: "Create and edit Offer Letter",
    icon: <Plus size={14} />,
    path: "/offer-letter",
  },
  {
    label: "Confirmation Letter",
    desc: "Create employee confirmation letter",
    icon: <FileText size={14} />,
    path: "/confirmation-letter",
  },
  {
    label: "Increment Letter",
    desc: "Create salary increment letter",
    icon: <TrendingUp size={14} />,
    path: "/increment-letter",
  },
  {
    label: "Promotion Letter",
    desc: "Create employee promotion letter",
    icon: <Award size={14} />,
    path: "/promotion-letter",
  },
  {
    label: "Relieving Letter",
    desc: "Create employee relieving letter",
    icon: <LogOut size={14} />,
    path: "/relieving-letter",
  },
];

function DocumentDropdown() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const [openDropdown, setOpenDropdown] = useState(null);

  if (path !== "/documents/create") return null;

  const handleDropdownOpenChange = (dropdownName, isOpen) => {
    setOpenDropdown(isOpen ? dropdownName : null);
  };

  return (
    <div className="flex justify-center items-center gap-3">
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
                  ? "bg-yellow-500 text-white border-yellow-500"
                  : "bg-white text-yellow-600 border-2 border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50"
              }
            `}
          >
            <div
              className={`transition-transform duration-200 ${openDropdown === "shift" ? "rotate-90" : ""}`}
            >
              <Clock size={16} />
            </div>
            <span>Document Manages</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ml-1 ${openDropdown === "shift" ? "rotate-180" : ""}`}
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-64 p-1 bg-white/95 backdrop-blur-sm border border-yellow-100 shadow-lg rounded-xl"
          align="start"
        >
          {menuItems.map((item, index) => (
            <React.Fragment key={item.path}>
              <DropdownMenuItem
                onClick={() => navigate(item.path)}
                className="cursor-pointer rounded-lg py-2.5 hover:bg-yellow-50 hover:text-yellow-600 focus:bg-yellow-50 focus:text-yellow-600 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-md bg-yellow-100 text-yellow-600 group-hover:bg-yellow-200 transition-colors">
                    {item.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-xs text-gray-500">{item.desc}</span>
                  </div>
                </div>
              </DropdownMenuItem>
              {index < menuItems.length - 1 && (
                <DropdownMenuSeparator className="my-1 bg-yellow-100" />
              )}
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default DocumentDropdown;
