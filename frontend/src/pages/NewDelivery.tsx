import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../services/api";
import {
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  Truck,
} from "lucide-react";

interface DeliveryItemInput {
  productId: string;
  quantity: number;
}

export const NewDelivery: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [customerName, setCustomerName] = useState("");
  const [referenceNumber, setReferenceNumber] = useState(
    `OUT-${Date.now().toString().slice(-6)}`
  );
  const [sourceLocationId, setSourceLocationId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<DeliveryItemInput[]>([
    { productId: "", quantity: 1 },
  ]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch real locations and products
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

  const createDeliveryMutation = useMutation({
    mutationFn: (payload: any) => apiService.createDelivery(payload),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
      const deliveryId = data?.data?.id || data?.id;
      if (deliveryId) {
        navigate(`/deliveries/${deliveryId}`);
      } else {
        navigate("/deliveries");
      }
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to create delivery draft");
    },
  });

  const handleAddItem = () => {
    setItems([...items, { productId: "", quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof DeliveryItemInput, value: any) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: field === "quantity" ? Math.max(1, parseInt(value) || 1) : value,
    };
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!sourceLocationId) {
      setErrorMsg("Please select a source location.");
      return;
    }

    const validItems = items.filter((item) => item.productId && item.quantity > 0);
    if (validItems.length === 0) {
      setErrorMsg("Please add at least one valid product line with quantity.");
      return;
    }

    createDeliveryMutation.mutate({
      referenceNumber: referenceNumber.trim() || undefined,
      customerName: customerName.trim() || undefined,
      sourceLocationId,
      notes: notes.trim() || undefined,
      items: validItems.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
      })),
    });
  };

  const isLoadingData = isLocationsLoading || isProductsLoading;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/deliveries"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Deliveries
      </Link>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Create Outbound Delivery</h1>
            <p className="text-xs text-slate-500">
              Prepare a shipment draft. Picking, packing, and validation will deduct real stock.
            </p>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reference Number
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                placeholder="e.g. OUT-1004"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Name / Destination
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Acme Corp / Direct Dispatch"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Source Location <span className="text-rose-500">*</span>
            </label>
            <select
              value={sourceLocationId}
              onChange={(e) => setSourceLocationId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              required
              disabled={isLoadingData}
            >
              <option value="">-- Select Source Location --</option>
              {locations.map((loc: any) => (
                <option key={loc.id} value={loc.id}>
                  {loc.warehouse?.name || "Warehouse"} &rsaquo; {loc.name} ({loc.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes / Dispatch Remarks
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Priority dispatch via FedEx"
            />
          </div>

          {/* Line items table */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Delivery Items
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <Plus className="h-3.5 w-3.5" /> Add Item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <div className="flex-1">
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                      required
                    >
                      <option value="">-- Select Product --</option>
                      {products.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) &bull; Reorder Level: {p.reorderLevel}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-28">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                      placeholder="Qty"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    disabled={items.length <= 1}
                    className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-400"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              to="/deliveries"
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createDeliveryMutation.isPending || isLoadingData}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-50"
            >
              {createDeliveryMutation.isPending ? "Creating..." : "Save Delivery Draft"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
