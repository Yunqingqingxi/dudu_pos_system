import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, Package, PlusCircle, History, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "仪表板" },
  { to: "/orders/new", icon: PlusCircle, label: "新建开单" },
  { to: "/orders", icon: History, label: "单据列表" },
  { to: "/products", icon: Package, label: "商品库" },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const nav = (
    <nav className="flex-1 space-y-1 p-3">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/" || item.to === "/orders"}
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )
          }
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-56 border-r bg-card flex-col">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <FileText className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">嘟嘟 POS 系统</span>
        </div>
        {nav}
        <div className="border-t p-3 text-xs text-muted-foreground">
          广信区都嘟百货店
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50" onClick={onClose}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute left-0 top-0 h-full w-56 bg-card border-r shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-14 items-center justify-between border-b px-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-semibold text-sm">嘟嘟 POS 系统</span>
              </div>
              <button onClick={onClose} className="p-1 rounded hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
            {nav}
            <div className="border-t p-3 text-xs text-muted-foreground">
              广信区都嘟百货店
            </div>
          </div>
        </div>
      )}
    </>
  );
}