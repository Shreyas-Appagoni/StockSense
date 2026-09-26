import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../services/api";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Warehouse,
  Boxes,
} from "lucide-react";

export const ReceiptDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: receipt, isLoading } = useQuery({
    queryKey: ["receipt", id],
    queryFn: async () => {
      try {
        return await apiService.getReceiptById(id!);
      } catch {
        const res = await apiService.getReceipts();
        const list = Array.isArray(res) ? res : (res?.data || []);
        return list.find((r: any) => r.id === id);
      }
    },
    enabled: !!id,
  });

  const validateMutation = useMutation({
    mutationFn: (recId: string) => apiService.validateReceipt(recId),
    onSuccess: () => {
      setSuccessMsg("Receipt validated! Inventory quantities, stock ledger, and alerts have been updated atomically.");
      queryClient.invalidateQueries({ queryKey: ["receipt", id] });
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardActivity"] });
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to validate receipt");
    },
  });

  if (isLoading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading receipt details...</div>;
  }

  if (!receipt) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-rose-600">Receipt not found</p>
        <Link to="/receipts" className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold">
          <ArrowLeft className="h-4 w-4" /> Back to Receipts
        </Link>
      </div>
    );
  }

  const isValidated = receipt.status === "VALIDATED";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/receipts"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Receipts
      </Link>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              {receipt.referenceNumber}
            </h1>
            <span
              className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold ${
                isValidated
                  ? "bg-emerald-100 text-emerald-800"
                  : receipt.status === "CANCELLED"
                  ? "bg-slate-100 text-slate-600"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {receipt.status}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Created on {new Date(receipt.createdAt).toLocaleString()} by{" "}
            <span className="font-semibold text-slate-700">{receipt.createdBy?.name || "System"}</span>
          </p>
        </div>

        <div>
          {!isValidated && receipt.status !== "CANCELLED" && (
            <button
              onClick={() => validateMutation.mutate(receipt.id)}
              disabled={validateMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{validateMutation.isPending ? "Validating & Receiving..." : "Validate & Receive Stock"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Destination & Supplier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <Warehouse className="h-4 w-4 text-indigo-600" />
            Destination Location
          </div>
          <p className="text-base font-bold text-slate-900">
            {receipt.destinationLocation?.warehouse?.name}
          </p>
          <p className="text-xs text-slate-500 font-mono">{receipt.destinationLocation?.name}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <Boxes className="h-4 w-4 text-indigo-600" />
            Supplier / Source
          </div>
          <p className="text-base font-bold text-slate-900">
            {receipt.supplier?.name || "Direct / Internal Warehouse Transfer"}
          </p>
          <p className="text-xs text-slate-500">{receipt.notes || "No additional notes provided"}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Received Line Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3 text-right">Received Quantity</th>
                <th className="py-2.5 px-3">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {(receipt.items || []).map((it: any) => (
                <tr key={it.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-3 font-semibold text-slate-900">{it.product?.name}</td>
                  <td className="py-3 px-3 font-mono text-slate-500">{it.product?.sku}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 text-sm">
                    +{it.quantity}
                  </td>
                  <td className="py-3 px-3 text-slate-500">{it.product?.unit || "units"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
