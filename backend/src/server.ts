import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler.js";
import healthRoutes from "./routes/health.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import categoryRoutes from "./routes/categories.js";
import warehouseRoutes from "./routes/warehouses.js";
import locationRoutes from "./routes/locations.js";
import inventoryRoutes from "./routes/inventory.js";
import receiptRoutes from "./routes/receipts.js";
import deliveryRoutes from "./routes/deliveries.js";
import transferRoutes from "./routes/transfers.js";
import adjustmentRoutes from "./routes/adjustments.js";
import stockLedgerRoutes from "./routes/stockLedger.js";
import alertRoutes from "./routes/alerts.js";
import dashboardRoutes from "./routes/dashboard.js";
import aiRoutes from "./routes/ai.js";

dotenv.config({ path: [".env", "../.env"] });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.json({ name: "StockSense API", version: "1.0.0" });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/adjustments", adjustmentRoutes);
app.use("/api/stock-ledger", stockLedgerRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/ai", aiRoutes);

app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`StockSense backend running on port ${PORT}`);
    console.log(`Health endpoint: http://localhost:${PORT}/api/health`);
    console.log(`Database health: http://localhost:${PORT}/api/health/db`);
  });
}

export default app;
