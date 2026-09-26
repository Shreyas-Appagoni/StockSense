import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../services/api";
import { Link } from "react-router-dom";
import {
  Package,
  AlertTriangle,
  XCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  TrendingUp,
  Warehouse,
  FolderTree,
  Activity,
  ArrowRight,
  Boxes,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

export const Dashboard: React.FC = () => {
  const [trendDays, setTrendDays] = useState(30);

  // 1. KPI Summary
  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: () => apiService.getDashboardSummary(),
  });

  // 2. Recent Ledger Activity
  const { data: activity = [], isLoading: isActivityLoading } = useQuery({
    queryKey: ["dashboardActivity"],
    queryFn: () => apiService.getDashboardActivity(8),
  });

  // 3. Warehouse Distribution
  const { data: warehouseDist = [] } = useQuery({
    queryKey: ["warehouseDistribution"],
    queryFn: () => apiService.getWarehouseDistribution(),
  });

  // 4. Category Distribution
  const { data: categoryDist = [] } = useQuery({
    queryKey: ["categoryDistribution"],
    queryFn: () => apiService.getCategoryDistribution(),
  });

  // 5. Stock Movement Trends
  const { data: stockTrends = [] } = useQuery({
    queryKey: ["stockTrends", trendDays],
    queryFn: () => apiService.getStockTrends(trendDays),
  });

  // 6. Real inventory table
  const { data: inventory = [] } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => apiService.getInventory(),
  });

  return (
    <div className="space-y-8">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Products */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Products
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              {isSummaryLoading ? "..." : summary?.totalProducts ?? 0}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {summary?.totalInventoryUnits ?? 0} total units
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Low Stock
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-amber-600">
              {isSummaryLoading ? "..." : summary?.lowStockCount ?? 0}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500">Below reorder level</div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Out of Stock
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-rose-600">
              {isSummaryLoading ? "..." : summary?.outOfStockCount ?? 0}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500">Immediate action needed</div>
        </div>

        {/* Pending Receipts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Inbound Receipts
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ArrowDownToLine className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              {isSummaryLoading ? "..." : summary?.pendingReceipts ?? 0}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500">Draft / Inbound</div>
        </div>

        {/* Pending Deliveries */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Outbound Deliveries
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ArrowUpFromLine className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              {isSummaryLoading ? "..." : summary?.pendingDeliveries ?? 0}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500">Pending validation</div>
        </div>

        {/* Pending Transfers */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Transfers
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <ArrowLeftRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              {isSummaryLoading ? "..." : summary?.pendingTransfers ?? 0}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500">Inter-location move</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Movement Trends */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Inventory Movement Over Time</h2>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
              {[7, 30, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => setTrendDays(days)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    trendDays === days
                      ? "bg-white text-indigo-700 shadow-2xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {days}D
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 flex items-center justify-center">
            {stockTrends.length === 0 ? (
              <div className="text-center text-slate-400 text-sm">
                <Boxes className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                No inventory movements yet in this timeframe.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="receipts" name="Receipts" fill="#10b981" />
                  <Bar dataKey="deliveries" name="Deliveries" fill="#ef4444" />
                  <Bar dataKey="transfers" name="Transfers" fill="#6366f1" />
                  <Bar dataKey="adjustments" name="Adjustments" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Warehouse Distribution Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Stock by Warehouse</h2>
            </div>
          </div>

          <div className="h-64 flex items-center justify-center">
            {warehouseDist.length === 0 ? (
              <div className="text-center text-slate-400 text-sm">No warehouse stock data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={warehouseDist} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="code" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="totalQuantity" name="Total Units" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <FolderTree className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Category Distribution</h2>
          </div>

          <div className="h-56 flex items-center justify-center">
            {categoryDist.length === 0 ? (
              <div className="text-center text-slate-400 text-sm">No category distribution data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDist}
                    dataKey="totalQuantity"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({ name, percent }: any) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {categoryDist.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Recent Inventory Activity</h2>
            </div>
            <Link
              to="/ledger"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View Full Ledger <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {isActivityLoading ? (
              <p className="text-xs text-slate-400 py-4">Loading activity log...</p>
            ) : activity.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                No recent activity records found in the ledger.
              </div>
            ) : (
              activity.map((item: any) => {
                const isPositive = item.quantityChange > 0;
                return (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          item.transactionType === "RECEIPT"
                            ? "bg-emerald-50 text-emerald-700"
                            : item.transactionType === "DELIVERY"
                            ? "bg-rose-50 text-rose-700"
                            : item.transactionType.startsWith("TRANSFER")
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {item.transactionType}
                      </span>
                      <span className="font-semibold text-slate-800">{item.product?.name}</span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        @{item.location?.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`font-mono font-bold ${
                          isPositive ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isPositive ? `+${item.quantityChange}` : item.quantityChange}{" "}
                        {item.product?.unit || "units"}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Inventory Overview Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Current Inventory Overview</h2>
            <p className="text-xs text-slate-500">Live stock across warehouses and locations</p>
          </div>
          <Link
            to="/products"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Manage Products <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Warehouse & Location</th>
                <th className="py-3 px-4 text-right">Available Qty</th>
                <th className="py-3 px-4 text-right">Reorder Level</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No inventory records present in database.
                  </td>
                </tr>
              ) : (
                inventory.slice(0, 10).map((inv: any) => {
                  const isOutOfStock = inv.quantity <= 0;
                  const isLowStock = !isOutOfStock && inv.quantity <= inv.product?.reorderLevel;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {inv.product?.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{inv.product?.sku}</td>
                      <td className="py-3 px-4">{inv.product?.category?.name || "General"}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-900">
                          {inv.location?.warehouse?.name}
                        </span>{" "}
                        <span className="text-slate-400">({inv.location?.name})</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {inv.quantity} {inv.product?.unit || ""}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">
                        {inv.product?.reorderLevel}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isOutOfStock
                              ? "bg-rose-100 text-rose-800"
                              : isLowStock
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock" : "Healthy"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
