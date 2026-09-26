import { useState } from "react";
import Layout from "../components/Layout";
import { useStock } from "../context/StockContext";

function Receipts() {
  const { addReceipt } = useStock();

  const [receipts, setReceipts] = useState([
    {
      product: "Steel Rods",
      quantity: 50,
      unit: "kg",
      warehouse: "Main Warehouse",
      status: "Received",
    },
  ]);

  const [showForm, setShowForm] = useState(false);

  const [newReceipt, setNewReceipt] = useState({
    product: "",
    quantity: "",
    warehouse: "Main Warehouse",
  });

  const handleChange = (e) => {
    setNewReceipt({
      ...newReceipt,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const receipt = {
      product: newReceipt.product,
      quantity: Number(newReceipt.quantity),
      unit: "kg",
      warehouse: newReceipt.warehouse,
      status: "Received",
    };

    setReceipts([...receipts, receipt]);

    addReceipt(
      newReceipt.product,
      Number(newReceipt.quantity),
      newReceipt.warehouse
    );

    setNewReceipt({
      product: "",
      quantity: "",
      warehouse: "Main Warehouse",
    });

    setShowForm(false);
  };

  return (
    <Layout>
      <div className="dashboard-page">

        <div className="dashboard-header">
          <div>
            <h1>Receipts</h1>
            <p>Record incoming stock</p>
          </div>

          <button
            className="primary-button"
            onClick={() => setShowForm(!showForm)}
          >
            + New Receipt
          </button>
        </div>

        {showForm && (
          <div
            className="dashboard-card"
            style={{ marginBottom: "20px" }}
          >
            <h2>New Receipt</h2>

            <form onSubmit={handleSubmit}>
              <div className="kpi-grid">

                <div>
                  <label>Product</label>

                  <input
                    type="text"
                    name="product"
                    value={newReceipt.product}
                    onChange={handleChange}
                    placeholder="e.g. Steel Rods"
                    required
                  />
                </div>

                <div>
                  <label>Quantity</label>

                  <input
                    type="number"
                    name="quantity"
                    value={newReceipt.quantity}
                    onChange={handleChange}
                    placeholder="e.g. 50"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label>Warehouse</label>

                  <select
                    name="warehouse"
                    value={newReceipt.warehouse}
                    onChange={handleChange}
                  >
                    <option>Main Warehouse</option>
                    <option>Production Rack</option>
                  </select>
                </div>

              </div>

              <div style={{ marginTop: "20px" }}>

                <button
                  type="submit"
                  className="primary-button"
                >
                  Receive Stock
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
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Warehouse</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {receipts.map((receipt, index) => (
                  <tr key={index}>

                    <td>{receipt.product}</td>

                    <td>+{receipt.quantity}</td>

                    <td>{receipt.unit}</td>

                    <td>{receipt.warehouse}</td>

                    <td>{receipt.status}</td>

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

export default Receipts;