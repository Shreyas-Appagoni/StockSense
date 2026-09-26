import { useState } from "react";
import Layout from "../components/Layout";

function Products() {
  const [showForm, setShowForm] = useState(false);

  const [products, setProducts] = useState([
    {
      name: "Steel Rods",
      sku: "SR-001",
      category: "Raw Material",
      stock: 100,
      unit: "kg",
      status: "In Stock",
    },
    {
      name: "Cement",
      sku: "CM-001",
      category: "Construction",
      stock: 250,
      unit: "kg",
      status: "In Stock",
    },
    {
      name: "Paint",
      sku: "PT-001",
      category: "Finishing",
      stock: 25,
      unit: "litres",
      status: "Low Stock",
    },
  ]);

  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    category: "",
    stock: "",
    unit: "kg",
  });

  const handleChange = (e) => {
    setNewProduct({
      ...newProduct,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const stockValue = Number(newProduct.stock);

    const product = {
      name: newProduct.name,
      sku: newProduct.sku,
      category: newProduct.category,
      stock: stockValue,
      unit: newProduct.unit,
      status: stockValue < 30 ? "Low Stock" : "In Stock",
    };

    setProducts([...products, product]);

    setNewProduct({
      name: "",
      sku: "",
      category: "",
      stock: "",
      unit: "kg",
    });

    setShowForm(false);
  };

  return (
    <Layout>
      <div className="dashboard-page">

        <div className="dashboard-header">
          <div>
            <h1>Products</h1>
            <p>Manage your inventory products</p>
          </div>

          <button
            className="primary-button"
            onClick={() => setShowForm(!showForm)}
          >
            + Add Product
          </button>
        </div>

        {showForm && (
          <div className="dashboard-card" style={{ marginBottom: "20px" }}>
            <h2>Add New Product</h2>

            <form onSubmit={handleSubmit}>
              <div className="kpi-grid">

                <div>
                  <label>Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newProduct.name}
                    onChange={handleChange}
                    placeholder="e.g. Steel Rods"
                    required
                  />
                </div>

                <div>
                  <label>SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={newProduct.sku}
                    onChange={handleChange}
                    placeholder="e.g. SR-001"
                    required
                  />
                </div>

                <div>
                  <label>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={newProduct.category}
                    onChange={handleChange}
                    placeholder="e.g. Raw Material"
                    required
                  />
                </div>

                <div>
                  <label>Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={newProduct.stock}
                    onChange={handleChange}
                    placeholder="e.g. 100"
                    required
                  />
                </div>

                <div>
                  <label>Unit</label>
                  <select
                    name="unit"
                    value={newProduct.unit}
                    onChange={handleChange}
                  >
                    <option value="kg">kg</option>
                    <option value="litres">litres</option>
                    <option value="pieces">pieces</option>
                    <option value="boxes">boxes</option>
                  </select>
                </div>

              </div>

              <div style={{ marginTop: "20px" }}>
                <button type="submit" className="primary-button">
                  Save Product
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
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Unit</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.sku}>
                    <td>{product.name}</td>
                    <td>{product.sku}</td>
                    <td>{product.category}</td>
                    <td>{product.stock}</td>
                    <td>{product.unit}</td>
                    <td>{product.status}</td>
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

export default Products;