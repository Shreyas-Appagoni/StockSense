import React from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../services/api";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  FileSpreadsheet,
  Bell,
  Sparkles,
  LogOut,
  User as UserIcon,
  ShieldAlert,
} from "lucide-react";

export const Layout: React.FC = () => {
  const { user, logout, isManager } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Query summary for alert badge count
  const { data: summary } = useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: () => apiService.getDashboardSummary(),
    refetchInterval: 15000,
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Products", path: "/products", icon: Package },
    { label: "Categories", path: "/categories", icon: FolderTree },
    { label: "Receipts", path: "/receipts", icon: ArrowDownToLine },
    { label: "Deliveries", path: "/deliveries", icon: ArrowUpFromLine },
    { label: "Transfers", path: "/transfers", icon: ArrowLeftRight },
    { label: "Adjustments", path: "/adjustments", icon: SlidersHorizontal },
    { label: "Stock Ledger", path: "/ledger", icon: FileSpreadsheet },
    {
      label: "Alerts",
      path: "/alerts",
      icon: Bell,
      badge: summary?.unreadAlertsCount ? summary.unreadAlertsCount : null,
    },
    {
      label: "AI Assistant",
      path: "/assistant",
      icon: Sparkles,
    },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            S
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight">StockSense</span>
            <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              Operations Hub
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/dashboard" && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Role Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
              <UserIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || "User"}</p>
              <span
                className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isManager
                    ? "bg-purple-900/60 text-purple-300 border border-purple-700/50"
                    : "bg-blue-900/60 text-blue-300 border border-blue-700/50"
                }`}
              >
                {user?.role === "INVENTORY_MANAGER" ? "Manager" : "Warehouse Staff"}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 border border-rose-900/30 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800">
              {navItems.find((item) =>
                item.path === "/dashboard"
                  ? location.pathname === "/dashboard"
                  : location.pathname.startsWith(item.path)
              )?.label || "StockSense"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {summary?.lowStockCount || summary?.outOfStockCount ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-medium">
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                <span>
                  {summary.outOfStockCount > 0
                    ? `${summary.outOfStockCount} Out of Stock`
                    : `${summary.lowStockCount} Low Stock`}
                </span>
              </div>
            ) : null}
            <div className="text-xs text-slate-500 font-medium">
              Real-time Database: <span className="text-emerald-600 font-semibold">● Active</span>
            </div>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
