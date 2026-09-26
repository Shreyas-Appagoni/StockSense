import { useState } from "react";
import Layout from "../components/Layout";
import { useStock } from "../context/StockContext";

function MoveHistory() {
  const { operations } = useStock();

  const [search, setSearch] = useState("");

  const filteredMovements = operations.filter((operation) =>
    `${operation.product} ${operation.type} ${operation.quantity} ${operation.warehouse} ${operation.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="dashboard-page">

        <div className="dashboard-header">
          <div>
            <h1>Move History</h1>
            <p>Track all inventory movements</p>
          </div>
        </div>

        <div
          className="dashboard-card"
          style={{ marginBottom: "20px" }}
        >
          <input
            type="text"
            placeholder="Search product, operation or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div className="dashboard-card">

          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>Operation</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Location</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {filteredMovements.map((movement, index) => (
                  <tr key={index}>

                    <td>{movement.type}</td>

                    <td>{movement.product}</td>

                    <td>{movement.quantity}</td>

                    <td>{movement.warehouse}</td>

                    <td>{movement.reason || "-"}</td>

                    <td>{movement.status}</td>

                  </tr>
                ))}

                {filteredMovements.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      style={{ textAlign: "center" }}
                    >
                      No movements found yet
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

export default MoveHistory;