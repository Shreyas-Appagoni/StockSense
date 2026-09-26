import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../services/api";
import {
  ArrowLeft,
  SlidersHorizontal,
  Info,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Equal,
} from "lucide-react";

export const NewAdjustment: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [referenceNumber, setReferenceNumber] = useState(
    `ADJ-${Date.now().toString().slice(-6)}`
  );
  const [locationId, setLocationId] = useState("");
  const [productId, setProductId] = useState("");
  const [countedQuantity, setCountedQuantity] = useState<number | "">("");
  const [reason, setReason] = useState("PHYSICAL_COUNT_RECONCILIATION");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load locations, products, and current inventory
  const { data: locations = [], isLoading: isLocationsLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const res = await apiService.getLocations();
      return Array.isArray(res) ? res : (res?.data || []);
    },
  });

  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await apiService.getProducts();
      return Array.isArray(res) ? res : (res?.data || []);
    },
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const res = await apiService.getInventory();
      return Array.isArray(res) ? res : (res?.data || []);
    },
  });

  // Calculate current system quantity for selected product & location
  const currentSystemQty = useMemo(() => {
    if (!productId || !locationId) return null;
    const inv = inventory.find(
      (item: any) => item.productId === productId && item.locationId === locationId
    );
    return inv ? inv.quantity : 0;
  }, [inventory, productId, locationId]);

  // Calculate difference
  const difference = useMemo(() => {
    if (countedQuantity === "" || currentSystemQty === null) return null;
    return Number(countedQuantity) - currentSystemQty;
  }, [countedQuantity, currentSystemQty]);

  const createMutation = useMutation({
    mutationFn: (data: any) => apiService.createAdjustment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adjustments"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      queryClient.invalidateQueries({ queryKey: ["stockLedger"] });
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      navigate("/adjustments");
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to record adjustment");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!locationId) {
      setErrorMsg("Please select a warehouse location.");
      return;
    }

    if (!productId) {
      setErrorMsg("Please select a product.");
      return;
    }

    if (countedQuantity === "" || Number(countedQuantity) < 0) {
      setErrorMsg("Please provide a valid non-negative physical count quantity.");
      return;
    }

    if (!reason.trim()) {
      setErrorMsg("Please provide a reason for the adjustment.");
      return;
    }

    createMutation.mutate({
      referenceNumber: referenceNumber.trim() || undefined,
      locationId,
      reason: reason.trim(),
      items: [
        {
          productId,
          countedQuantity: Number(countedQuantity),
          notes: notes.trim() || undefined,
        },
      ],
    });
  };

  const isLoadingData = isLocationsLoading || isProductsLoading;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        to="/adjustments"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Adjustments
      </Link>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <SlidersHorizontal className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">New Inventory Adjustment</h1>
            <p className="text-xs text-slate-500">
              Reconcile physical inventory count against system ledger records
            </p>
          </div>
        </div>

        {/* Informative Callout */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg text-blue-900 text-xs flex items-start gap-2.5">
          <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
          <div>
            <span className="font-bold">Important: </span>
            <span>
              Physical count replaces the system quantity. The system will record the difference
              (Counted &minus; System) in the Stock Ledger and adjust the active inventory record.
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-rose-600 font-bold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adjustment Reference #
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                placeholder="e.g. ADJ-1003"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location <span className="text-rose-500">*</span>
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                required
                disabled={isLoadingData}
              >
                <option value="">-- Select Location --</option>
                {locations.map((loc: any) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.warehouse?.name} &rsaquo; {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product <span className="text-rose-500">*</span>
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              required
              disabled={isLoadingData}
            >
              <option value="">-- Select Product --</option>
              {products.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) &bull; Unit: {p.unit}
                </option>
              ))}
            </select>
          </div>

          {/* System Qty vs Physical Count */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <span className="block text-[11px] font-semibold text-slate-500 uppercase">
                  Current System Qty
                </span>
                <span className="text-base font-bold font-mono text-slate-800">
                  {currentSystemQty !== null ? `${currentSystemQty} units` : "—"}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                  Physical Count Qty <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={countedQuantity}
                  onChange={(e) =>
                    setCountedQuantity(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono font-bold bg-white"
                  placeholder="Counted"
                  required
                />
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-slate-500 uppercase">
                  Adjustment Delta
                </span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-sm">
                  {difference === null ? (
                    <span className="text-slate-400">—</span>
                  ) : difference > 0 ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" /> +{difference} units
                    </span>
                  ) : difference < 0 ? (
                    <span className="text-rose-600 flex items-center gap-1">
                      <TrendingDown className="h-4 w-4" /> {difference} units
                    </span>
                  ) : (
                    <span className="text-slate-600 flex items-center gap-1">
                      <Equal className="h-4 w-4" /> 0 (No change)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Adjustment <span className="text-rose-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              >
                <option value="PHYSICAL_COUNT_RECONCILIATION">Physical Count Reconciliation</option>
                <option value="DAMAGED_GOODS">Damaged / Expired Goods</option>
                <option value="SCRAP_OR_LOSS">Scrap or Unaccounted Loss</option>
                <option value="FOUND_STOCK">Found Stock / Inventory Gain</option>
                <option value="AUDIT_CORRECTION">Annual Audit Correction</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Auditor Notes / Remarks
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Verified by warehouse auditor"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              to="/adjustments"
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending || isLoadingData}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? "Submitting..." : "Save Adjustment Draft"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
