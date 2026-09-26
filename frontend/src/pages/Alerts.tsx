import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../services/api";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  Eye,
  CheckCircle2,
} from "lucide-react";

export const Alerts: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");

  const { data: alerts = [], isLoading, error } = useQuery({
    queryKey: ["alerts", selectedStatus, selectedType],
    queryFn: async () => {
      const filters: any = {};
      if (selectedStatus !== "ALL") filters.status = selectedStatus;
      if (selectedType !== "ALL") filters.alertType = selectedType;

      const res = await apiService.getAlerts(filters);
      return Array.isArray(res) ? res : (res?.data || []);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiService.updateAlertStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
  });

  const activeCount = alerts.filter((a: any) => a.status === "ACTIVE").length;
  const acknowledgedCount = alerts.filter((a: any) => a.status === "ACKNOWLEDGED").length;
  const resolvedCount = alerts.filter((a: any) => a.status === "RESOLVED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Inventory Alerts</h1>
          <p className="text-xs text-slate-500">
            Real-time notifications for threshold breaches, low stock, and stockouts
          </p>
        </div>
      </div>

      {/* KPI mini-counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Active Alerts
            </span>
            <div className="text-2xl font-bold text-rose-600 font-mono">{activeCount}</div>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Acknowledged
            </span>
            <div className="text-2xl font-bold text-amber-600 font-mono">{acknowledgedCount}</div>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <Eye className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Resolved
            </span>
            <div className="text-2xl font-bold text-emerald-600 font-mono">{resolvedCount}</div>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Type:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="ALL">All Types</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Severity / Type</th>
                <th className="py-3 px-4">Product & SKU</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Message</th>
                <th className="py-3 px-4">Created Time</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading alerts...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-rose-500">
                    Failed to load alerts: {(error as any).message}
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-600">No alerts found.</p>
                      <p className="text-[11px] text-slate-400">
                        All monitored inventory levels are within normal reorder thresholds.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                alerts.map((alert: any) => {
                  const isOutOfStock = alert.alertType === "OUT_OF_STOCK";
                  const isActive = alert.status === "ACTIVE";
                  const isAck = alert.status === "ACKNOWLEDGED";

                  return (
                    <tr key={alert.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            <AlertOctagon className="h-3 w-3" /> OUT OF STOCK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <AlertTriangle className="h-3 w-3" /> LOW STOCK
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/products/${alert.productId}`}
                          className="font-semibold text-slate-900 hover:text-indigo-600 block"
                        >
                          {alert.product?.name || alert.productId}
                        </Link>
                        <span className="font-mono text-[10px] text-slate-400">
                          SKU: {alert.product?.sku || "—"} &bull; Reorder Level: {alert.product?.reorderLevel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">
                          {alert.location?.warehouse?.name || "Warehouse"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {alert.location?.name}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                        {alert.message}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(alert.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            alert.status === "ACTIVE"
                              ? "bg-rose-100 text-rose-800"
                              : alert.status === "ACKNOWLEDGED"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {alert.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {isActive && (
                          <button
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: alert.id,
                                status: "ACKNOWLEDGED",
                              })
                            }
                            disabled={updateStatusMutation.isPending}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-semibold transition-colors disabled:opacity-50"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Acknowledge</span>
                          </button>
                        )}
                        {(isActive || isAck) && (
                          <button
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: alert.id,
                                status: "RESOLVED",
                              })
                            }
                            disabled={updateStatusMutation.isPending}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Resolve</span>
                          </button>
                        )}
                        {alert.status === "RESOLVED" && (
                          <span className="text-slate-400 text-[11px]">Closed</span>
                        )}
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
