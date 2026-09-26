import { useState } from "react";
import Layout from "../components/Layout";

function Warehouse() {
  const [warehouses, setWarehouses] = useState([
    {
      name: "Main Warehouse",
      location: "Building A",
      capacity: "1000 kg",
      stock: "150 kg",
      status: "Active",
    },
    {
      name: "Production Rack",
      location: "Production Area",
      capacity: "500 kg",
      stock: "0 kg",
      status: "Active",
    },
  ]);

  const [showForm, setShowForm] = useState(false);

  const [newWarehouse, setNewWarehouse] = useState({
    name: "",
    location: "",
    capacity: "",
  });

  const handleChange = (e) => {
    setNewWarehouse({
      ...newWarehouse,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const warehouse = {
      name: newWarehouse.name,
      location: newWarehouse.location,
      capacity: `${newWarehouse.capacity} kg`,
      stock: "0 kg",
      status: "Active",
    };

    setWarehouses([...warehouses, warehouse]);

    setNewWarehouse({
      name: "",
      location: "",
      capacity: "",
    });

    setShowForm(false);
  };

  return (
    <Layout>
      <div className="dashboard-page">

        <div className="dashboard-header">
          <div>
            <h1>Warehouse</h1>
            <p>Manage your storage locations</p>
          </div>

          <button
            className="primary-button"
            onClick={() => setShowForm(!showForm)}
          >
            + Add Warehouse
          </button>
        </div>

        {showForm && (
          <div className="dashboard-card" style={{ marginBottom: "20px" }}>
            <h2>Add Warehouse</h2>

            <form onSubmit={handleSubmit}>
              <div className="kpi-grid">

                <div>
                  <label>Warehouse Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newWarehouse.name}
                    onChange={handleChange}
                    placeholder="e.g. Secondary Warehouse"
                    required
                  />
                </div>

                <div>
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={newWarehouse.location}
                    onChange={handleChange}
                    placeholder="e.g. Building B"
                    required
                  />
                </div>

                <div>
                  <label>Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={newWarehouse.capacity}
                    onChange={handleChange}
                    placeholder="e.g. 500"
                    required
                  />
                </div>

              </div>

              <div style={{ marginTop: "20px" }}>
                <button type="submit" className="primary-button">
                  Save Warehouse
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    marginLeft: "10px",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="dashboard-card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Warehouse</th>
                  <th>Location</th>
                  <th>Capacity</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {warehouses.map((warehouse, index) => (
                  <tr key={index}>
                    <td>{warehouse.name}</td>
                    <td>{warehouse.location}</td>
                    <td>{warehouse.capacity}</td>
                    <td>{warehouse.stock}</td>
                    <td>{warehouse.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default Warehouse;