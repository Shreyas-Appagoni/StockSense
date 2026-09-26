import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";

import Products from "./pages/Products";
import Receipts from "./pages/Receipts";
import Deliveries from "./pages/Deliveries";
import Transfers from "./pages/Transfers";
import Adjustments from "./pages/Adjustments";
import MoveHistory from "./pages/MoveHistory";
import Warehouse from "./pages/Warehouse";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default */}
        <Route
          path="/"
          element={<Navigate to="/login" />}
        />

        {/* Authentication */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* Main Dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* Inventory */}
        <Route
          path="/products"
          element={<Products />}
        />

        <Route
          path="/warehouse"
          element={<Warehouse />}
        />

        <Route
          path="/move-history"
          element={<MoveHistory />}
        />

        {/* Operations */}
        <Route
          path="/receipts"
          element={<Receipts />}
        />

        <Route
          path="/deliveries"
          element={<Deliveries />}
        />

        <Route
          path="/transfers"
          element={<Transfers />}
        />

        <Route
          path="/adjustments"
          element={<Adjustments />}
        />

        {/* Account */}
        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;