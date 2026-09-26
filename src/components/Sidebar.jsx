import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  Truck,
  ArrowLeftRight,
  ClipboardList,
  Warehouse,
  History,
  Settings,
  User,
  LogOut,
} from "lucide-react";

function Sidebar() {
      const navigate = useNavigate();
      
  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          📦
        </div>

        <div>
          <h2>StockSense</h2>
          <span>Inventory System</span>
        </div>
      </div>

      <nav className="sidebar-nav">

        <p className="nav-section-title">
          MAIN
        </p>

        <a href="/dashboard" className="nav-item active">
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </a>

        <a href="/products" className="nav-item">
          <Package size={19} />
          <span>Products</span>
        </a>

        <p className="nav-section-title">
          OPERATIONS
        </p>

        <a href="/receipts" className="nav-item">
          <ArrowDownToLine size={19} />
          <span>Receipts</span>
        </a>

        <a href="/deliveries" className="nav-item">
          <Truck size={19} />
          <span>Deliveries</span>
        </a>

        <a href="/transfers" className="nav-item">
          <ArrowLeftRight size={19} />
          <span>Internal Transfers</span>
        </a>

        <a href="/adjustments" className="nav-item">
          <ClipboardList size={19} />
          <span>Adjustments</span>
        </a>

        <p className="nav-section-title">
          INVENTORY
        </p>

        <a href="/move-history" className="nav-item">
          <History size={19} />
          <span>Move History</span>
        </a>

        <a href="/warehouse" className="nav-item">
          <Warehouse size={19} />
          <span>Warehouse</span>
        </a>

        <p className="nav-section-title">
          ACCOUNT
        </p>

        <a href="/profile" className="nav-item">
          <User size={19} />
          <span>My Profile</span>
        </a>

        <a href="/settings" className="nav-item">
          <Settings size={19} />
          <span>Settings</span>
        </a>

      </nav>

      <div className="sidebar-bottom">

        <button className="logout-button" onClick={() => navigate("/login")}>
          <LogOut size={19} />
          <span>Logout</span>
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;