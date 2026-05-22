import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="pl-56">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
