import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../services/api";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  Package,
  Clock,
  Warehouse,
  Boxes,
} from "lucide-react";

export const DeliveryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: delivery, isLoading } = useQuery({
    queryKey: ["delivery", id],
    queryFn: async () => {
      try {
        return await apiService.getDeliveryById(id!);
      } catch {
        const res = await apiService.getDeliveries();
        const list = Array.isArray(res) ? res : (res?.data || []);
        return list.find((d: any) => d.id === id);
      }
    },
    enabled: !!id,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["delivery", id] });
    queryClient.invalidateQueries({ queryKey: ["deliveries"] });
    queryClient.invalidateQueries({ queryKey: ["inventory"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    queryClient.invalidateQueries({ queryKey: ["dashboardActivity"] });
    queryClient.invalidateQueries({ queryKey: ["stockLedger"] });
    queryClient.invalidateQueries({ queryKey: ["alerts"] });
  };

  const pickMutation = useMutation({
    mutationFn: (delId: string) => apiService.pickDelivery(delId),
    onSuccess: () => {
      setSuccessMsg("Delivery items marked as PICKED from warehouse shelves.");
      setErrorMsg(null);
      invalidateAll();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to pick delivery");
    },
  });

  const packMutation = useMutation({
    mutationFn: (delId: string) => apiService.packDelivery(delId),
    onSuccess: () => {
      setSuccessMsg("Delivery marked as PACKED and ready for dispatch.");
      setErrorMsg(null);
      invalidateAll();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to pack delivery");
    },
  });

  const validateMutation = useMutation({
    mutationFn: (delId: string) => apiService.validateDelivery(delId),
    onSuccess: () => {
      setSuccessMsg(
        "Delivery validated! Stock has been deducted atomically, ledger recorded, and alerts updated."
      );
      setErrorMsg(null);
      invalidateAll();
    },
    onError: (err: any) => {
      // Clear business error from backend (e.g. Insufficient stock)
      setErrorMsg(err.message || "Failed to validate delivery");
    },
  });

  if (isLoading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Loading delivery details...</div>;
  }

  if (!delivery) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-rose-600">Delivery not found</p>
        <Link to="/deliveries" className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold">
          <ArrowLeft className="h-4 w-4" /> Back to Deliveries
        </Link>
      </div>
    );
  }

  const isValidated = delivery.status === "VALIDATED";
  const isPacked = delivery.status === "PACKED";
  const isPicked = delivery.status === "PICKED";
  const isDraft = delivery.status === "DRAFT";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/deliveries"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Deliveries
      </Link>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <div>
              <span className="font-bold">Operation Failed: </span>
              <span>{errorMsg}</span>
            </div>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-700 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              {delivery.referenceNumber}
            </h1>
            <span
              className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold ${
                isValidated
                  ? "bg-emerald-100 text-emerald-800"
                  : isPacked
                  ? "bg-blue-100 text-blue-800"
                  : isPicked
                  ? "bg-purple-100 text-purple-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {delivery.status}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Outbound Dispatch to: <strong className="text-slate-800">{delivery.customerName || "Standard Customer / Dispatch"}</strong>
          </p>
        </div>

        {/* Workflow Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {isDraft && (
            <button
              onClick={() => pickMutation.mutate(delivery.id)}
              disabled={pickMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
            >
              <PackageCheck className="h-4 w-4" />
              <span>{pickMutation.isPending ? "Picking..." : "1. Mark Picked"}</span>
            </button>
          )}

          {isPicked && (
            <button
              onClick={() => packMutation.mutate(delivery.id)}
              disabled={packMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
            >
              <Package className="h-4 w-4" />
              <span>{packMutation.isPending ? "Packing..." : "2. Mark Packed"}</span>
            </button>
          )}

          {!isValidated && (
            <button
              onClick={() => validateMutation.mutate(delivery.id)}
              disabled={validateMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{validateMutation.isPending ? "Validating & Deducting..." : "3. Validate & Deduct Stock"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Workflow Stepper */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between max-w-xl mx-auto text-xs font-semibold">
          <div className={`flex items-center gap-1.5 ${isDraft || isPicked || isPacked || isValidated ? "text-indigo-600 font-bold" : "text-slate-400"}`}>
            <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[10px]">1</span>
            <span>Draft</span>
          </div>
          <div className="h-0.5 flex-1 mx-2 bg-slate-200" />
          <div className={`flex items-center gap-1.5 ${isPicked || isPacked || isValidated ? "text-purple-600 font-bold" : "text-slate-400"}`}>
            <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] ${isPicked || isPacked || isValidated ? "bg-purple-50 border-purple-200" : "bg-slate-50 border-slate-200"}`}>2</span>
            <span>Picked</span>
          </div>
          <div className="h-0.5 flex-1 mx-2 bg-slate-200" />
          <div className={`flex items-center gap-1.5 ${isPacked || isValidated ? "text-blue-600 font-bold" : "text-slate-400"}`}>
            <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] ${isPacked || isValidated ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"}`}>3</span>
            <span>Packed</span>
          </div>
          <div className="h-0.5 flex-1 mx-2 bg-slate-200" />
          <div className={`flex items-center gap-1.5 ${isValidated ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
            <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] ${isValidated ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>4</span>
            <span>Validated</span>
          </div>
        </div>
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Warehouse className="h-4 w-4" />
            <span>Source Location</span>
          </div>
          <p className="text-sm font-bold text-slate-900">
            {delivery.sourceLocation?.warehouse?.name || "Warehouse"} &rsaquo; {delivery.sourceLocation?.name || "Rack"}
          </p>
          <p className="text-[11px] text-slate-400">
            Type: {delivery.sourceLocation?.type || "STORAGE"}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Clock className="h-4 w-4" />
            <span>Created At</span>
          </div>
          <p className="text-sm font-bold text-slate-900">
            {new Date(delivery.createdAt).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400">
            By user: {delivery.createdBy?.name || "System"}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Boxes className="h-4 w-4" />
            <span>Total Units</span>
          </div>
          <p className="text-sm font-bold text-slate-900 font-mono">
            {(delivery.items || []).reduce((acc: number, item: any) => acc + item.quantity, 0)} units
          </p>
          <p className="text-[11px] text-slate-400">
            Across {delivery.items?.length || 0} line items
          </p>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Delivery Line Items</h2>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-6">Product</th>
              <th className="py-3 px-6">SKU</th>
              <th className="py-3 px-6 text-right">Quantity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {(delivery.items || []).map((item: any) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-6 font-semibold text-slate-900">
                  <Link
                    to={`/products/${item.productId}`}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    {item.product?.name || item.productId}
                  </Link>
                </td>
                <td className="py-3.5 px-6 font-mono text-slate-500">
                  {item.product?.sku || "—"}
                </td>
                <td className="py-3.5 px-6 text-right font-mono font-bold text-slate-900">
                  {item.quantity} {item.product?.unit || "units"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
