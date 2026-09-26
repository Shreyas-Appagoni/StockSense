import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../services/api";
import { Link } from "react-router-dom";
import { Plus, CheckCircle2, ArrowRight } from "lucide-react";

export const Receipts: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: receipts = [], isLoading } = useQuery({
    queryKey: ["receipts"],
    queryFn: () => apiService.getReceipts(),
  });

  const validateMutation = useMutation({
    mutationFn: (id: string) => apiService.validateReceipt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardActivity"] });
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Inbound Receipts</h1>
          <p className="text-xs text-slate-500">
            Receive incoming vendor stock into warehouse locations
          </p>
        </div>

        <Link
          to="/receipts/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>New Receipt</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Reference #</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Destination Location</th>
                <th className="py-3 px-4">Items Count</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading receipts...
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No receipts created yet.
                  </td>
                </tr>
              ) : (
                receipts.map((r: any) => {
                  const isValidated = r.status === "VALIDATED";
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                        <Link to={`/receipts/${r.id}`}>{r.referenceNumber}</Link>
                      </td>
                      <td className="py-3 px-4">{r.supplier?.name || "Direct / Internal"}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {r.destinationLocation?.warehouse?.name}{" "}
                        <span className="text-slate-400 font-normal">
                          ({r.destinationLocation?.name})
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {r.items?.length || 0} line items
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isValidated
                              ? "bg-emerald-100 text-emerald-800"
                              : r.status === "CANCELLED"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {!isValidated && r.status !== "CANCELLED" && (
                          <button
                            onClick={() => validateMutation.mutate(r.id)}
                            disabled={validateMutation.isPending}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Validate</span>
                          </button>
                        )}
                        <Link
                          to={`/receipts/${r.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-indigo-600"
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
