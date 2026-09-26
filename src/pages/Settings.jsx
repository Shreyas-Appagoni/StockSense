import { useState } from "react";
import Layout from "../components/Layout";

function Settings() {
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <Layout>
      <div className="dashboard-page">

        <div className="dashboard-header">
          <div>
            <h1>Settings</h1>
            <p>Manage your StockSense preferences</p>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Notifications</h2>

          <div style={{ marginTop: "20px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "18px",
              }}
            >
              <input
                type="checkbox"
                checked={lowStockAlerts}
                onChange={(e) => setLowStockAlerts(e.target.checked)}
              />
              <span>Low stock alerts</span>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) =>
                  setEmailNotifications(e.target.checked)
                }
              />
              <span>Email notifications</span>
            </label>
          </div>
        </div>

        <div className="dashboard-card" style={{ marginTop: "20px" }}>
          <h2>Appearance</h2>

          <div style={{ marginTop: "20px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
              <span>Dark mode</span>
            </label>
          </div>
        </div>

        <div className="dashboard-card" style={{ marginTop: "20px" }}>
          <h2>System Information</h2>

          <div style={{ marginTop: "20px" }}>
            <p><strong>Application:</strong> StockSense</p>
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>Environment:</strong> Prototype</p>
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default Settings;