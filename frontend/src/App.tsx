import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";

// Auth Pages
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";

// Operations & Reporting Pages
import { Dashboard } from "./pages/Dashboard";
import { Products } from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";
import { Categories } from "./pages/Categories";
import { Receipts } from "./pages/Receipts";
import { NewReceipt } from "./pages/NewReceipt";
import { ReceiptDetail } from "./pages/ReceiptDetail";
import { Deliveries } from "./pages/Deliveries";
import { NewDelivery } from "./pages/NewDelivery";
import { DeliveryDetail } from "./pages/DeliveryDetail";
import { Transfers } from "./pages/Transfers";
import { NewTransfer } from "./pages/NewTransfer";
import { Adjustments } from "./pages/Adjustments";
import { NewAdjustment } from "./pages/NewAdjustment";
import { StockLedger } from "./pages/StockLedger";
import { Alerts } from "./pages/Alerts";
import { Assistant } from "./pages/Assistant";

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<Navigate to="/forgot-password" replace />} />

        {/* Authenticated Application Shell */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Products & Catalog */}
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/categories" element={<Categories />} />

          {/* Inbound Receipts */}
          <Route path="/receipts" element={<Receipts />} />
          <Route path="/receipts/new" element={<NewReceipt />} />
          <Route path="/receipts/:id" element={<ReceiptDetail />} />

          {/* Outbound Deliveries */}
          <Route path="/deliveries" element={<Deliveries />} />
          <Route path="/deliveries/new" element={<NewDelivery />} />
          <Route path="/deliveries/:id" element={<DeliveryDetail />} />

          {/* Internal Transfers */}
          <Route path="/transfers" element={<Transfers />} />
          <Route path="/transfers/new" element={<NewTransfer />} />

          {/* Inventory Adjustments */}
          <Route path="/adjustments" element={<Adjustments />} />
          <Route path="/adjustments/new" element={<NewAdjustment />} />

          {/* Audit Ledger & Real-Time Alerts */}
          <Route path="/ledger" element={<StockLedger />} />
          <Route path="/alerts" element={<Alerts />} />

          {/* AI Inventory Assistant */}
          <Route path="/assistant" element={<Assistant />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;