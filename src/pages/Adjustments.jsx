import { useState } from "react";
import Layout from "../components/Layout";
import { useStock } from "../context/StockContext";

function Adjustments() {
  const { addAdjustment } = useStock();

  const [adjustments, setAdjustments] = useState([
    {
      product: "Steel Rods",
      quantity: -3,
      reason: "Damaged",
      warehouse: "Production Rack",
      status: "Applied",
    },
  ]);

  const [showForm, setShowForm] = useState(false);

  const [newAdjustment, setNewAdjustment] = useState({
    product: "",
    quantity: "",
    reason: "Damaged",
    warehouse: "Production Rack",
  });

  const handleChange = (e) => {
    setNewAdjustment({
      ...newAdjustment,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const quantity = Number(newAdjustment.quantity);

    const adjustment = {
      product: newAdjustment.product,
      quantity: -Math.abs(quantity),
      reason: newAdjustment.reason,
      warehouse: newAdjustment.warehouse,
      status: "Applied",
    };

    setAdjustments([...adjustments, adjustment]);

    addAdjustment(
      newAdjustment.product,
      quantity,
      newAdjustment.warehouse,
      newAdjustment.reason
    );

    setNewAdjustment({
      product: "",
      quantity: "",
      reason: "Damaged",
      warehouse: "Production Rack",
    });

    setShowForm(false);
  };

  return (
    <Layout>
      <div className="dashboard-page">

        <div className="dashboard-header">
          <div>
            <h1>Stock Adjustments</h1>
            <p>Correct inventory quantities</p>
          </div>

          <button
            className="primary-button"
            onClick={() => setShowForm(!showForm)}
          >
            + New Adjustment
          </button>
        </div>

        {showForm && (
          <div
            className="dashboard-card"
            style={{ marginBottom: "20px" }}
          >
            <h2>New Stock Adjustment</h2>

            <form onSubmit={handleSubmit}>

              <div className="kpi-grid">

                <div>
                  <label>Product</label>

                  <input
                    type="text"
                    name="product"
                    value={newAdjustment.product}
                    onChange={handleChange}
                    placeholder="e.g. Steel Rods"
                    required
                  />
                </div>

                <div>
                  <label>Quantity to Remove</label>

                  <input
                    type="number"
                    name="quantity"
                    value={newAdjustment.quantity}
                    onChange={handleChange}
                    placeholder="e.g. 3"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label>Reason</label>

                  <select
                    name="reason"
                    value={newAdjustment.reason}
                    onChange={handleChange}
                  >
                    <option>Damaged</option>
                    <option>Lost</option>
                    <option>Expired</option>
                    <option>Counting Error</option>
                  </select>
                </div>

                <div>
                  <label>Warehouse</label>

                  <select
                    name="warehouse"
                    value={newAdjustment.warehouse}
                    onChange={handleChange}
                  >
                    <option>Production Rack</option>
                    <option>Main Warehouse</option>
                  </select>
                </div>

              </div>

              <div style={{ marginTop: "20px" }}>

                <button
                  type="submit"
                  className="primary-button"
                >
                  Apply Adjustment
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
                  <th>Product</th>
                  <th>Adjustment</th>
                  <th>Reason</th>
                  <th>Warehouse</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {adjustments.map((adjustment, index) => (
                  <tr key={index}>

                    <td>{adjustment.product}</td>

                    <td>{adjustment.quantity} kg</td>

                    <td>{adjustment.reason}</td>

                    <td>{adjustment.warehouse}</td>

                    <td>{adjustment.status}</td>

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

export default Adjustments;