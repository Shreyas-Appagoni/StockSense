import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../services/api";
import { Link } from "react-router-dom";
import { Plus, CheckCircle2, ArrowRight, PackageCheck, Truck, AlertCircle } from "lucide-react";

export const Deliveries: React.FC = () => {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: deliveries = [], isLoading } = useQuery({
    queryKey: ["deliveries"],
    queryFn: () => apiService.getDeliveries(),
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["deliveries"] });
    queryClient.invalidateQueries({ queryKey: ["inventory"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    queryClient.invalidateQueries({ queryKey: ["dashboardActivity"] });
    queryClient.invalidateQueries({ queryKey: ["alerts"] });
  };

  const pickMutation = useMutation({
    mutationFn: (id: string) => apiService.pickDelivery(id),
    onSuccess: invalidateAll,
    onError: (err: any) => setErrorMessage(err.message),
  });

  const packMutation = useMutation({
    mutationFn: (id: string) => apiService.packDelivery(id),
    onSuccess: invalidateAll,
    onError: (err: any) => setErrorMessage(err.message),
  });

  const validateMutation = useMutation({
    mutationFn: (id: string) => apiService.validateDelivery(id),
    onSuccess: invalidateAll,
    onError: (err: any) => setErrorMessage(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Outbound Deliveries</h1>
          <p className="text-xs text-slate-500">
            Pick, pack, and validate customer shipments with real-time stock deduction
          </p>
        </div>

        <Link
          to="/deliveries/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>New Delivery</span>
        </Link>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-700 font-bold">
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Reference #</th>
                <th className="py-3 px-4">Customer / Destination</th>
                <th className="py-3 px-4">Source Location</th>
                <th className="py-3 px-4">Items Count</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading deliveries...
                  </td>
                </tr>
              ) : deliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No deliveries created yet.
                  </td>
                </tr>
              ) : (
                deliveries.map((d: any) => {
                  const isValidated = d.status === "VALIDATED";
                  return (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                        <Link to={`/deliveries/${d.id}`}>{d.referenceNumber}</Link>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {d.customerName || "Standard Dispatch"}
                      </td>
                      <td className="py-3 px-4">
                        {d.sourceLocation?.warehouse?.name}{" "}
                        <span className="text-slate-400 font-normal">({d.sourceLocation?.name})</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {d.items?.length || 0} line items
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isValidated
                              ? "bg-emerald-100 text-emerald-800"
                              : d.status === "PACKED"
                              ? "bg-blue-100 text-blue-800"
                              : d.status === "PICKED"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        {d.status === "DRAFT" && (
                          <button
                            onClick={() => pickMutation.mutate(d.id)}
                            disabled={pickMutation.isPending}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-semibold transition-colors disabled:opacity-50"
                          >
                            <PackageCheck className="h-3 w-3" />
                            <span>Pick</span>
                          </button>
                        )}
                        {d.status === "PICKED" && (
                          <button
                            onClick={() => packMutation.mutate(d.id)}
                            disabled={packMutation.isPending}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold transition-colors disabled:opacity-50"
                          >
                            <Truck className="h-3 w-3" />
                            <span>Pack</span>
                          </button>
                        )}
                        {!isValidated && (d.status === "PACKED" || d.status === "DRAFT" || d.status === "PICKED") && (
                          <button
                            onClick={() => validateMutation.mutate(d.id)}
                            disabled={validateMutation.isPending}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Validate</span>
                          </button>
                        )}
                        <Link
                          to={`/deliveries/${d.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-indigo-600 ml-1"
                        >
                          View <ArrowRight className="h-3 w-3" />
                        </Link>
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
