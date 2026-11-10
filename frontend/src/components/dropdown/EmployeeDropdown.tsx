import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, UserPlus, Link2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  generateLink: () => void;
}

function EmployeeDropdown({ generateLink }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const [firstOpen, setFirstOpen] = useState(false);
  const [secondOpen, setSecondOpen] = useState(false);

  if (
    path !== "/approvals" &&
    path !== "/employees" &&
    path !== "/add-employee"
  )
    return null;

  return (
    <div className="flex items-center gap-5">
      {/* First Dropdown */}
      <DropdownMenu onOpenChange={setFirstOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg
            transition-all duration-200 shadow-sm hover:shadow-md
            ${
              firstOpen
                ? "bg-purple-500 text-white border-purple-500"
                : "bg-white text-purple-600 border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
            }`}
          >
            <div
              className={`transition-transform duration-200 ${
                firstOpen ? "rotate-90" : ""
              }`}
            >
              <UserPlus size={16} />
            </div>
            <span>New Employee</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ml-1 ${
                firstOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-64 p-1 bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg rounded-xl"
          align="start"
        >
          <DropdownMenuItem
            onClick={() => navigate("/add-employee")}
            className="cursor-pointer rounded-lg py-2.5 hover:bg-purple-50 hover:text-purple-600 focus:bg-purple-50 focus:text-purple-600 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-purple-100 text-purple-600 group-hover:bg-purple-200 transition-colors">
                <UserPlus size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Add Employee</span>
                <span className="text-xs text-gray-500">
                  Create new employee profile
                </span>
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-gray-100" />

          <DropdownMenuItem
            onClick={generateLink}
            className="cursor-pointer rounded-lg py-2.5 hover:bg-purple-50 hover:text-purple-600 focus:bg-purple-50 focus:text-purple-600 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-purple-100 text-purple-600 group-hover:bg-purple-200 transition-colors">
                <Link2 size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Add via Link</span>
                <span className="text-xs text-gray-500">
                  Generate invitation link
                </span>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Second Dropdown */}
      <DropdownMenu onOpenChange={setSecondOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg
            transition-all duration-200 shadow-sm hover:shadow-md
            ${
              secondOpen
                ? "bg-purple-500 text-white border-purple-500"
                : "bg-white text-purple-600 border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
            }`}
          >
            <div
              className={`transition-transform duration-200 ${
                secondOpen ? "rotate-90" : ""
              }`}
            >
              <UserPlus size={16} />
            </div>
            <span>Existing Employee</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ml-1 ${
                secondOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-64 p-1 bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg rounded-xl"
          align="start"
        >
          <DropdownMenuItem
            onClick={() => navigate("/employees")}
            className="cursor-pointer rounded-lg py-2.5 hover:bg-purple-50 hover:text-purple-600 focus:bg-purple-50 focus:text-purple-600 group"
          >
            Employee Search
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default EmployeeDropdown;
