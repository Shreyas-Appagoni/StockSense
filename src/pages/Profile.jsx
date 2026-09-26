import { useState } from "react";
import Layout from "../components/Layout";

function Profile() {
  const [name, setName] = useState("Admin");
  const [email, setEmail] = useState("admin@stocksense.com");
  const [role, setRole] = useState("Inventory Manager");

  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  return (
    <Layout>
      <div className="dashboard-page">

        <div className="dashboard-header">
          <div>
            <h1>My Profile</h1>
            <p>Manage your account information</p>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Profile Information</h2>

          <form onSubmit={handleSubmit}>

            <div className="kpi-grid">

              <div>
                <label>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label>Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>

            </div>

            <div style={{ marginTop: "20px" }}>
              <button type="submit" className="primary-button">
                Save Changes
              </button>

              {saved && (
                <span
                  style={{
                    marginLeft: "15px",
                    color: "green",
                    fontWeight: "500",
                  }}
                >
                  Profile saved successfully!
                </span>
              )}
            </div>

          </form>
        </div>

        <div className="dashboard-card" style={{ marginTop: "20px" }}>
          <h2>Account</h2>

          <p style={{ marginTop: "15px" }}>
            <strong>Account Status:</strong> Active
          </p>

          <p>
            <strong>Access Level:</strong> Administrator
          </p>
        </div>

      </div>
    </Layout>
  );
}

export default Profile;