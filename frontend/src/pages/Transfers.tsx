import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../services/api";
import { Link } from "react-router-dom";
import {
  Plus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export const Transfers: React.FC = () => {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: transfers = [], isLoading } = useQuery({
    queryKey: ["transfers"],
    queryFn: async () => {
      const res = await apiService.getTransfers();
      return Array.isArray(res) ? res : (res?.data || []);
    },
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["transfers"] });
    queryClient.invalidateQueries({ queryKey: ["inventory"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    queryClient.invalidateQueries({ queryKey: ["dashboardActivity"] });
    queryClient.invalidateQueries({ queryKey: ["stockLedger"] });
    queryClient.invalidateQueries({ queryKey: ["alerts"] });
  };

  const validateMutation = useMutation({
    mutationFn: (id: string) => apiService.validateTransfer(id),
    onSuccess: () => {
      setSuccessMessage("Transfer validated! Stock moved between locations atomically.");
      setErrorMessage(null);
      invalidateAll();
    },
    onError: (err: any) => {
      setErrorMessage(err.message || "Failed to validate transfer");
      setSuccessMessage(null);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Internal Transfers</h1>
          <p className="text-xs text-slate-500">
            Move stock between warehouses and storage locations atomically
          </p>
        </div>

        <Link
          to="/transfers/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>New Transfer</span>
        </Link>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-700 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Transfer #</th>
                <th className="py-3 px-4">Source Location</th>
                <th className="py-3 px-4">Destination Location</th>
                <th className="py-3 px-4">Items / Qty</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading transfers...
                  </td>
                </tr>
              ) : transfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No transfers recorded yet.
                  </td>
                </tr>
              ) : (
                transfers.map((t: any) => {
                  const isValidated = t.status === "VALIDATED";
                  const totalQty = (t.items || []).reduce(
                    (acc: number, item: any) => acc + item.quantity,
                    0
                  );

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                        {t.referenceNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {t.fromLocation?.warehouse?.name || "Warehouse"} &rsaquo;{" "}
                        <span className="text-slate-600">{t.fromLocation?.name}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {t.toLocation?.warehouse?.name || "Warehouse"} &rsaquo;{" "}
                        <span className="text-slate-600">{t.toLocation?.name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className="font-bold text-slate-900">{totalQty} units</span>{" "}
                        <span className="text-slate-400">({t.items?.length || 0} items)</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isValidated
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isValidated ? (
                          <button
                            onClick={() => validateMutation.mutate(t.id)}
                            disabled={validateMutation.isPending}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Validate Transfer</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Completed</span>
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
