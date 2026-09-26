import { useState } from "react";
import Layout from "../components/Layout";
import { useStock } from "../context/StockContext";

function Deliveries() {
  const { addDelivery } = useStock();

  const [deliveries, setDeliveries] = useState([
    {
      product: "Steel Rods",
      quantity: 20,
      unit: "kg",
      warehouse: "Production Rack",
      status: "Delivered",
    },
  ]);

  const [showForm, setShowForm] = useState(false);

  const [newDelivery, setNewDelivery] = useState({
    product: "",
    quantity: "",
    warehouse: "Production Rack",
  });

  const handleChange = (e) => {
    setNewDelivery({
      ...newDelivery,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const quantity = Number(newDelivery.quantity);

    const delivery = {
      product: newDelivery.product,
      quantity: quantity,
      unit: "kg",
      warehouse: newDelivery.warehouse,
      status: "Delivered",
    };

    setDeliveries([...deliveries, delivery]);

    addDelivery(
      newDelivery.product,
      quantity,
      newDelivery.warehouse
    );

    setNewDelivery({
      product: "",
      quantity: "",
      warehouse: "Production Rack",
    });

    setShowForm(false);
  };

  return (
    <Layout>
      <div className="dashboard-page">

        <div className="dashboard-header">
          <div>
            <h1>Deliveries</h1>
            <p>Record outgoing stock</p>
          </div>

          <button
            className="primary-button"
            onClick={() => setShowForm(!showForm)}
          >
            + New Delivery
          </button>
        </div>

        {showForm && (
          <div
            className="dashboard-card"
            style={{ marginBottom: "20px" }}
          >
            <h2>New Delivery</h2>

            <form onSubmit={handleSubmit}>
              <div className="kpi-grid">

                <div>
                  <label>Product</label>

                  <input
                    type="text"
                    name="product"
                    value={newDelivery.product}
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
                    value={newDelivery.quantity}
                    onChange={handleChange}
                    placeholder="e.g. 20"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label>Warehouse</label>

                  <select
                    name="warehouse"
                    value={newDelivery.warehouse}
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
                  Deliver Stock
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

                {deliveries.map((delivery, index) => (
                  <tr key={index}>

                    <td>{delivery.product}</td>

                    <td>-{delivery.quantity}</td>

                    <td>{delivery.unit}</td>

                    <td>{delivery.warehouse}</td>

                    <td>{delivery.status}</td>

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

export default Deliveries;