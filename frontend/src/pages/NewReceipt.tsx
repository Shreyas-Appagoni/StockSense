import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, AlertCircle, ArrowDownToLine } from "lucide-react";

export const NewReceipt: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [destinationLocationId, setDestinationLocationId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: "", quantity: 10 },
  ]);
  const [error, setError] = useState<string | null>(null);

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => apiService.getLocations(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => apiService.getProducts(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiService.createReceipt(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      navigate(`/receipts/${res.data.id}`);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to create receipt");
    },
  });

  const handleAddItem = () => {
    setItems([...items, { productId: "", quantity: 10 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!destinationLocationId) {
      setError("Please select a destination location");
      return;
    }

    if (items.some((it) => !it.productId || it.quantity <= 0)) {
      setError("All items must have a product selected and quantity > 0");
      return;
    }

    createMutation.mutate({
      destinationLocationId,
      supplierId: supplierId || undefined,
      referenceNumber: referenceNumber || undefined,
      notes: notes || undefined,
      items,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          to="/receipts"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Receipts
        </Link>
        <h1 className="text-xl font-bold text-slate-900 mt-2 flex items-center gap-2">
          <ArrowDownToLine className="h-5 w-5 text-indigo-600" />
          Create Inbound Receipt
        </h1>
        <p className="text-xs text-slate-500">
          Draft a new goods receipt. Inventory updates upon validation.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Destination Location *
            </label>
            <select
              required
              value={destinationLocationId}
              onChange={(e) => setDestinationLocationId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Select Location</option>
              {locations.map((loc: any) => (
                <option key={loc.id} value={loc.id}>
                  {loc.warehouse?.name} - {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reference / Document Number
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. REC-2026-001 (auto-generated if empty)"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supplier / Vendor
            </label>
            <input
              type="text"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              placeholder="e.g. Apex Industrial Supplies"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Remarks</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Supplier PO #4502 delivered by truck"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Received Line Items
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <Plus className="h-3.5 w-3.5" /> Add Another Item
            </button>
          </div>

          <div className="space-y-2">
            {items.map((it, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                    Product
                  </label>
                  <select
                    required
                    value={it.productId}
                    onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">Select Product</option>
                    {products.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-32">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={it.quantity}
                    onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-right"
                  />
                </div>

                <div className="pt-5">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    disabled={items.length <= 1}
                    className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            to="/receipts"
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
          >
            {createMutation.isPending ? "Creating Draft..." : "Save Draft Receipt"}
          </button>
        </div>
      </form>
    </div>
  );
};
