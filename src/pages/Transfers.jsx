import { useState } from "react";
import Layout from "../components/Layout";
import { useStock } from "../context/StockContext";

function Transfers() {
  const { addTransfer } = useStock();

  const [transfers, setTransfers] = useState([
    {
      product: "Steel Rods",
      quantity: 50,
      from: "Main Warehouse",
      to: "Production Rack",
      status: "Completed",
    },
  ]);

  const [showForm, setShowForm] = useState(false);

  const [newTransfer, setNewTransfer] = useState({
    product: "",
    quantity: "",
    from: "Main Warehouse",
    to: "Production Rack",
  });

  const handleChange = (e) => {
    setNewTransfer({
      ...newTransfer,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const quantity = Number(newTransfer.quantity);

    if (newTransfer.from === newTransfer.to) {
      alert("From and To locations must be different.");
      return;
    }

    const transfer = {
      product: newTransfer.product,
      quantity: quantity,
      from: newTransfer.from,
      to: newTransfer.to,
      status: "Completed",
    };

    setTransfers([...transfers, transfer]);

    addTransfer(
      newTransfer.product,
      quantity,
      newTransfer.from,
      newTransfer.to
    );

    setNewTransfer({
      product: "",
      quantity: "",
      from: "Main Warehouse",
      to: "Production Rack",
    });

    setShowForm(false);
  };

  return (
    <Layout>
      <div className="dashboard-page">

        <div className="dashboard-header">
          <div>
            <h1>Internal Transfers</h1>
            <p>Move stock between warehouses and locations</p>
          </div>

          <button
            className="primary-button"
            onClick={() => setShowForm(!showForm)}
          >
            + New Transfer
          </button>
        </div>

        {showForm && (
          <div
            className="dashboard-card"
            style={{ marginBottom: "20px" }}
          >
            <h2>New Internal Transfer</h2>

            <form onSubmit={handleSubmit}>

              <div className="kpi-grid">

                <div>
                  <label>Product</label>

                  <input
                    type="text"
                    name="product"
                    value={newTransfer.product}
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
                    value={newTransfer.quantity}
                    onChange={handleChange}
                    placeholder="e.g. 50"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label>From</label>

                  <select
                    name="from"
                    value={newTransfer.from}
                    onChange={handleChange}
                  >
                    <option>Main Warehouse</option>
                    <option>Production Rack</option>
                  </select>
                </div>

                <div>
                  <label>To</label>

                  <select
                    name="to"
                    value={newTransfer.to}
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
                  Transfer Stock
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
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {transfers.map((transfer, index) => (
                  <tr key={index}>

                    <td>{transfer.product}</td>

                    <td>{transfer.quantity} kg</td>

                    <td>{transfer.from}</td>

                    <td>{transfer.to}</td>

                    <td>{transfer.status}</td>

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

export default Transfers;