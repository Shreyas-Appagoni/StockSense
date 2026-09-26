import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../services/api";
import {
  ArrowLeft,
  Warehouse,
  History,
  AlertTriangle,
} from "lucide-react";

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch product details
  const { data: product, isLoading: isProductLoading, error: productError } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      try {
        return await apiService.getProductById(id!);
      } catch {
        const res = await apiService.getProducts();
        const list = Array.isArray(res) ? res : (res?.data || []);
        return list.find((p: any) => p.id === id);
      }
    },
    enabled: !!id,
  });

  // Fetch ledger activity for this product
  const { data: ledger = [] } = useQuery({
    queryKey: ["productLedger", id],
    queryFn: async () => {
      const res = await apiService.getStockLedger({ productId: id });
      return Array.isArray(res) ? res : (res?.data || []);
    },
    enabled: !!id,
  });

  // Fetch alerts for this product
  const { data: alerts = [] } = useQuery({
    queryKey: ["productAlerts", id],
    queryFn: async () => {
      const res = await apiService.getAlerts();
      const list = Array.isArray(res) ? res : (res?.data || []);
      return list.filter((a: any) => a.productId === id);
    },
    enabled: !!id,
  });

  if (isProductLoading) {
    return (
      <div className="py-12 text-center text-slate-500 text-sm">
        Loading product details...
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-rose-600">Product not found</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
      </div>
    );
  }

  const totalStock = (product.inventory || []).reduce(
    (acc: number, inv: any) => acc + inv.quantity,
    0
  );
  const isOutOfStock = totalStock <= 0;
  const isLowStock = !isOutOfStock && totalStock <= product.reorderLevel;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Products Catalog
        </Link>
      </div>

      {/* Header Info Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isOutOfStock
                  ? "bg-rose-100 text-rose-800"
                  : isLowStock
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock" : "Healthy Stock"}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono">SKU: {product.sku}</p>
          {product.description && (
            <p className="text-xs text-slate-600 pt-1">{product.description}</p>
          )}
        </div>

        <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100 shrink-0">
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total In Stock
            </span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {totalStock} <span className="text-xs font-normal text-slate-500">{product.unit}</span>
            </span>
          </div>
          <div className="border-l border-slate-200 pl-6">
            <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Reorder Level
            </span>
            <span className="text-2xl font-extrabold text-slate-600 font-mono">
              {product.reorderLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Stock by Location & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock by Location */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Warehouse className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Inventory by Location</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Warehouse</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {(product.inventory || []).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400">
                      No stock records across any locations.
                    </td>
                  </tr>
                ) : (
                  (product.inventory || []).map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {inv.location?.warehouse?.name || "Warehouse"}
                      </td>
                      <td className="py-2.5 px-3">{inv.location?.name}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {inv.quantity} {product.unit}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Current Alerts for this Product */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">Active Stock Alerts</h2>
          </div>

          <div className="space-y-2">
            {alerts.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No active alerts for this product.
              </div>
            ) : (
              alerts.map((alt: any) => (
                <div
                  key={alt.id}
                  className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                    alt.alertType === "OUT_OF_STOCK"
                      ? "bg-rose-50 border-rose-200 text-rose-800"
                      : "bg-amber-50 border-amber-200 text-amber-800"
                  }`}
                >
                  <div>
                    <span className="font-bold mr-2">{alt.alertType}</span>
                    <span>{alt.message}</span>
                  </div>
                  <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/60">
                    {alt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Product Ledger Movement History */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Stock Movement Audit History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Date/Time</th>
                <th className="py-2.5 px-3">Operation</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3 text-right">Delta</th>
                <th className="py-2.5 px-3 text-right">Before</th>
                <th className="py-2.5 px-3 text-right">After</th>
                <th className="py-2.5 px-3">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {ledger.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    No ledger transactions recorded yet for this product.
                  </td>
                </tr>
              ) : (
                ledger.map((l: any) => {
                  const isPositive = l.quantityChange > 0;
                  return (
                    <tr key={l.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 text-slate-500">
                        {new Date(l.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                            l.transactionType === "RECEIPT"
                              ? "bg-emerald-50 text-emerald-700"
                              : l.transactionType === "DELIVERY"
                              ? "bg-rose-50 text-rose-700"
                              : l.transactionType.startsWith("TRANSFER")
                              ? "bg-blue-50 text-blue-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {l.transactionType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">{l.location?.name}</td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono font-bold ${
                          isPositive ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isPositive ? `+${l.quantityChange}` : l.quantityChange}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                        {l.previousQuantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                        {l.newQuantity}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{l.user?.name || "System"}</td>
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
