import { useState } from "react";
import Layout from "../components/Layout";
import { Bell, Search, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useStock } from "../context/StockContext";

const movementData = [
  { day: "Mon", stock: 120 },
  { day: "Tue", stock: 145 },
  { day: "Wed", stock: 138 },
  { day: "Thu", stock: 160 },
  { day: "Fri", stock: 150 },
  { day: "Sat", stock: 175 },
  { day: "Sun", stock: 168 },
];

function Dashboard() {
  const { stock, operations } = useStock();

  const [search, setSearch] = useState("");

  const steelRods = stock["Steel Rods"];

  const totalStock = steelRods ? steelRods.total : 0;

  const filteredOperations = operations.filter((operation) =>
    `${operation.type} ${operation.product} ${operation.quantity} ${operation.warehouse}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="dashboard-page">

        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, Admin 👋</p>
          </div>

          <div className="header-actions">

            <div className="search-box">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search operations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="notification-button">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>

            <div className="user-profile">
              <div className="user-avatar">A</div>

              <div>
                <strong>Admin User</strong>
                <span>Administrator</span>
              </div>
            </div>

          </div>
        </header>

        <div className="dashboard-filters">

          <select>
            <option>All Warehouses</option>
            <option>Main Warehouse</option>
            <option>Production Rack</option>
          </select>

          <select>
            <option>All Categories</option>
            <option>Raw Materials</option>
            <option>Finished Goods</option>
          </select>

          <select>
            <option>All Operations</option>
            <option>Receipts</option>
            <option>Deliveries</option>
            <option>Transfers</option>
            <option>Adjustments</option>
          </select>

          <button className="filter-button">
            Apply Filters
          </button>

        </div>

        <div className="kpi-grid">

          <div className="kpi-card">
            <div className="kpi-top">
              <span>Total Stock</span>
              <div className="kpi-icon blue">📦</div>
            </div>

            <h2>{totalStock} kg</h2>

            <div className="kpi-change positive">
              <TrendingUp size={15} />
              Current inventory
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-top">
              <span>Low Stock Items</span>
              <div className="kpi-icon orange">⚠️</div>
            </div>

            <h2>8</h2>

            <div className="kpi-change negative">
              Needs attention
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-top">
              <span>Receipts</span>
              <div className="kpi-icon green">↓</div>
            </div>

            <h2>
              {operations.filter(
                (operation) => operation.type === "Receipt"
              ).length}
            </h2>

            <div className="kpi-change">
              Stock received
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-top">
              <span>Deliveries</span>
              <div className="kpi-icon purple">↑</div>
            </div>

            <h2>
              {operations.filter(
                (operation) => operation.type === "Delivery"
              ).length}
            </h2>

            <div className="kpi-change">
              Stock delivered
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-top">
              <span>Transfers</span>
              <div className="kpi-icon blue">↔</div>
            </div>

            <h2>
              {operations.filter(
                (operation) => operation.type === "Transfer"
              ).length}
            </h2>

            <div className="kpi-change">
              Internal movements
            </div>
          </div>

        </div>

        <div className="dashboard-grid">

          <div className="dashboard-card chart-card">

            <div className="card-header">
              <div>
                <h3>Stock Movement</h3>
                <p>Stock quantity over the last 7 days</p>
              </div>

              <select>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
            </div>

            <div className="chart-container">

              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={movementData}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="day" />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="stock"
                    stroke="#2563eb"
                    strokeWidth={3}
                  />

                </LineChart>
              </ResponsiveContainer>

            </div>

          </div>

          <div className="dashboard-card">

            <div className="card-header">
              <div>
                <h3>Low Stock Alerts</h3>
                <p>Items that need attention</p>
              </div>
            </div>

            <div className="alert-list">

              <div className="alert-item">
                <div>
                  <strong>Steel Sheets</strong>
                  <span>Raw Materials</span>
                </div>

                <strong className="stock-warning">
                  8 kg
                </strong>
              </div>

              <div className="alert-item">
                <div>
                  <strong>Aluminium Rods</strong>
                  <span>Raw Materials</span>
                </div>

                <strong className="stock-warning">
                  12 kg
                </strong>
              </div>

              <div className="alert-item">
                <div>
                  <strong>Bolts M12</strong>
                  <span>Components</span>
                </div>

                <strong className="stock-warning">
                  18 pcs
                </strong>
              </div>

              <div className="alert-item">
                <div>
                  <strong>Paint - Blue</strong>
                  <span>Consumables</span>
                </div>

                <strong className="stock-warning">
                  5 L
                </strong>
              </div>

            </div>

          </div>

        </div>

        <div className="dashboard-card recent-card">

          <div className="card-header">

            <div>
              <h3>Recent Operations</h3>
              <p>Latest inventory movements</p>
            </div>

          </div>

          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>Type</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {filteredOperations.map((operation, index) => (
                  <tr key={index}>

                    <td>{operation.type}</td>

                    <td>{operation.product}</td>

                    <td>{operation.quantity}</td>

                    <td>{operation.warehouse}</td>

                    <td>{operation.status}</td>

                  </tr>
                ))}

                {filteredOperations.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      No new operations yet
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>
    </Layout>
  );
}

export default Dashboard;