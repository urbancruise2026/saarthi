import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useSocketEvents } from "@/hooks/useEmployeeSocket";

export function AppLayout() {
  useSocketEvents();
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDark = () => {
    setDarkMode((d) => {
      document.documentElement.classList.toggle("dark", !d);
      return !d;
    });
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      <Topbar
        onMenuClick={() => setMobileOpen(true)}
        darkMode={darkMode}
        onToggleDark={toggleDark}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop — is wrapper ki width FIXED rehti hai (collapsed width),
            isliye main content kabhi shift nahi hota. Sidebar khud hover
            pe overlay ki tarah expand hoga (position: absolute/fixed) */}
        <div className="hidden md:block relative w-16 shrink-0">
          <Sidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed((c) => !c)}
          />
        </div>

        {/* Mobile */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-64 border-0">
            <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
