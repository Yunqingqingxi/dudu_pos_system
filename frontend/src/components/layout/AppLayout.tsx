import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex h-12 items-center gap-3 border-b bg-card px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded p-1 hover:bg-accent"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-semibold text-sm">都嘟单据管理系统</span>
      </div>

      <main className="pl-0 lg:pl-56 pt-12 lg:pt-0">
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}