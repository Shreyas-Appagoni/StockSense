import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../services/api";
import { Link } from "react-router-dom";
import {
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Sliders,
} from "lucide-react";

export const StockLedger: React.FC = () => {
  const [selectedOperation, setSelectedOperation] = useState("ALL");
  const [selectedProduct, setSelectedProduct] = useState("ALL");
  const [selectedLocation, setSelectedLocation] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch filter dropdown options
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await apiService.getProducts();
      return Array.isArray(res) ? res : (res?.data || []);
    },
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const res = await apiService.getLocations();
      return Array.isArray(res) ? res : (res?.data || []);
    },
  });

  // Fetch real ledger from backend with query parameters
  const { data: ledgerEntries = [], isLoading, error } = useQuery({
    queryKey: ["stockLedger", selectedProduct, selectedLocation, selectedOperation],
    queryFn: async () => {
      const filters: any = {};
      if (selectedProduct !== "ALL") filters.productId = selectedProduct;
      if (selectedLocation !== "ALL") filters.locationId = selectedLocation;
      if (selectedOperation !== "ALL") filters.transactionType = selectedOperation;

      const res = await apiService.getStockLedger(filters);
      return Array.isArray(res) ? res : (res?.data || []);
    },
  });

  // Client-side search for reference or notes
  const filteredEntries = useMemo(() => {
    if (!searchTerm.trim()) return ledgerEntries;
    const term = searchTerm.toLowerCase();
    return ledgerEntries.filter((item: any) => {
      const prodName = item.product?.name?.toLowerCase() || "";
      const sku = item.product?.sku?.toLowerCase() || "";
      const ref = item.referenceId?.toLowerCase() || "";
      const loc = item.location?.name?.toLowerCase() || "";
      return prodName.includes(term) || sku.includes(term) || ref.includes(term) || loc.includes(term);
    });
  }, [ledgerEntries, searchTerm]);

  const getOperationBadge = (type: string) => {
    switch (type) {
      case "RECEIPT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            <ArrowDownLeft className="h-3 w-3" /> RECEIPT
          </span>
        );
      case "DELIVERY":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
            <ArrowUpRight className="h-3 w-3" /> DELIVERY
          </span>
        );
      case "TRANSFER_OUT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
            <ArrowRightLeft className="h-3 w-3" /> TRANSFER OUT
          </span>
        );
      case "TRANSFER_IN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
            <ArrowRightLeft className="h-3 w-3" /> TRANSFER IN
          </span>
        );
      case "ADJUSTMENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
            <Sliders className="h-3 w-3" /> ADJUSTMENT
          </span>
        );
      default:
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Stock Ledger</h1>
          <p className="text-xs text-slate-500">
            Immutable, audit-compliant transaction journal tracking every stock delta
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, product, SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          {/* Operation Filter */}
          <select
            value={selectedOperation}
            onChange={(e) => setSelectedOperation(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="ALL">All Operations</option>
            <option value="RECEIPT">Receipts</option>
            <option value="DELIVERY">Deliveries</option>
            <option value="TRANSFER_OUT">Transfer Out</option>
            <option value="TRANSFER_IN">Transfer In</option>
            <option value="ADJUSTMENT">Adjustments</option>
          </select>

          {/* Product Filter */}
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="ALL">All Products</option>
            {products.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="ALL">All Locations</option>
            {locations.map((loc: any) => (
              <option key={loc.id} value={loc.id}>
                {loc.warehouse?.name} &rsaquo; {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Product & SKU</th>
                <th className="py-3 px-4">Operation</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">Delta (Change)</th>
                <th className="py-3 px-4 text-right">Before &rarr; After</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading ledger entries...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-rose-500">
                    Failed to load stock ledger: {(error as any).message}
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No inventory movements yet.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry: any) => {
                  const isPositive = entry.quantityChange > 0;
                  const isNegative = entry.quantityChange < 0;

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(entry.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          to={`/products/${entry.productId}`}
                          className="font-semibold text-slate-900 hover:text-indigo-600 block"
                        >
                          {entry.product?.name || entry.productId}
                        </Link>
                        <span className="font-mono text-[10px] text-slate-400">
                          SKU: {entry.product?.sku || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {getOperationBadge(entry.transactionType)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">
                          {entry.location?.warehouse?.name || "Warehouse"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {entry.location?.name} ({entry.location?.type})
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span
                          className={
                            isPositive
                              ? "text-emerald-600"
                              : isNegative
                              ? "text-rose-600"
                              : "text-slate-600"
                          }
                        >
                          {isPositive ? `+${entry.quantityChange}` : entry.quantityChange}{" "}
                          {entry.product?.unit || "units"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[11px] whitespace-nowrap text-slate-500">
                        <span>{entry.previousQuantity}</span>
                        <span className="text-slate-300 mx-1">&rarr;</span>
                        <span className="font-bold text-slate-800">{entry.newQuantity}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {entry.user?.name || "System"}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {entry.referenceId || "—"}
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
