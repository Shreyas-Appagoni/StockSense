const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("stocksense_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // --- Health Endpoints ---
  async getHealth() {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    return response.json();
  }

  async getDbHealth() {
    const response = await fetch(`${this.baseUrl}/health/db`);
    if (!response.ok) {
      throw new Error(`Database health check failed: ${response.status}`);
    }
    return response.json();
  }

  // --- Auth Endpoints ---
  async register(data: { name: string; email: string; password: string; role?: string }) {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Registration failed");
    if (result.token) localStorage.setItem("stocksense_token", result.token);
    return result;
  }

  async login(data: { email: string; password: string }) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Login failed");
    if (result.token) localStorage.setItem("stocksense_token", result.token);
    return result;
  }

  async logout() {
    localStorage.removeItem("stocksense_token");
    const response = await fetch(`${this.baseUrl}/auth/logout`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  async getMe() {
    const response = await fetch(`${this.baseUrl}/auth/me`, {
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to fetch user");
    return result;
  }

  async forgotPassword(email: string) {
    const response = await fetch(`${this.baseUrl}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to request password reset");
    return result;
  }

  async verifyOtp(email: string, otp: string) {
    const response = await fetch(`${this.baseUrl}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to verify OTP");
    return result;
  }

  async resetPassword(data: { email: string; otp: string; newPassword: string }) {
    const response = await fetch(`${this.baseUrl}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to reset password");
    return result;
  }

  // --- Data Endpoints ---
  async getProducts() {
    const response = await fetch(`${this.baseUrl}/products`, {
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to fetch products");
    return result.data !== undefined ? result.data : result;
  }

  async getProductById(id: string) {
    const response = await fetch(`${this.baseUrl}/products/${id}`, {
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to fetch product");
    return result.data !== undefined ? result.data : result;
  }

  async getCategories() {
    const response = await fetch(`${this.baseUrl}/categories`, {
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to fetch categories");
    return result.data !== undefined ? result.data : result;
  }

  async getWarehouses() {
    const response = await fetch(`${this.baseUrl}/warehouses`, {
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to fetch warehouses");
    return result.data !== undefined ? result.data : result;
  }

  async getLocations() {
    const response = await fetch(`${this.baseUrl}/locations`, {
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to fetch locations");
    return result.data !== undefined ? result.data : result;
  }

  async getInventory() {
    const response = await fetch(`${this.baseUrl}/inventory`, {
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to fetch inventory");
    return result.data !== undefined ? result.data : result;
  }

  // --- Receipts (Phase 3) ---
  async getReceipts() {
    const response = await fetch(`${this.baseUrl}/receipts`, {
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to fetch receipts");
    return result.data !== undefined ? result.data : result;
  }

  async getReceiptById(id: string) {
    const response = await fetch(`${this.baseUrl}/receipts/${id}`, {
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to fetch receipt");
    return result.data !== undefined ? result.data : result;
  }

  async createReceipt(data: any) {
    const response = await fetch(`${this.baseUrl}/receipts`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to create receipt");
    return result;
  }

  async validateReceipt(id: string) {
    const response = await fetch(`${this.baseUrl}/receipts/${id}/validate`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to validate receipt");
    return result;
  }

  // --- Deliveries (Phase 3) ---
  async getDeliveries() {
    const response = await fetch(`${this.baseUrl}/deliveries`, {
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to fetch deliveries");
    return result.data !== undefined ? result.data : result;
  }

  async getDeliveryById(id: string) {
    const response = await fetch(`${this.baseUrl}/deliveries/${id}`, {
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to fetch delivery");
    return result.data !== undefined ? result.data : result;
  }

  async createDelivery(data: any) {
    const response = await fetch(`${this.baseUrl}/deliveries`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to create delivery");
    return result;
  }

  async pickDelivery(id: string) {
    const response = await fetch(`${this.baseUrl}/deliveries/${id}/pick`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to pick delivery");
    return result;
  }

  async packDelivery(id: string) {
    const response = await fetch(`${this.baseUrl}/deliveries/${id}/pack`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to pack delivery");
    return result;
  }

  async validateDelivery(id: string) {
    const response = await fetch(`${this.baseUrl}/deliveries/${id}/validate`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to validate delivery");
    return result;
  }

  // --- Transfers (Phase 3) ---
  async getTransfers() {
    const response = await fetch(`${this.baseUrl}/transfers`, {
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to fetch transfers");
    return result.data !== undefined ? result.data : result;
  }

  async getTransferById(id: string) {
    const response = await fetch(`${this.baseUrl}/transfers/${id}`, {
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to fetch transfer");
    return result.data !== undefined ? result.data : result;
  }

  async createTransfer(data: any) {
    const response = await fetch(`${this.baseUrl}/transfers`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to create transfer");
    return result;
  }

  async validateTransfer(id: string) {
    const response = await fetch(`${this.baseUrl}/transfers/${id}/validate`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to validate transfer");
    return result;
  }

  // --- Adjustments (Phase 3) ---
  async getAdjustments() {
    const response = await fetch(`${this.baseUrl}/adjustments`, {
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to fetch adjustments");
    return result.data !== undefined ? result.data : result;
  }

  async getAdjustmentById(id: string) {
    const response = await fetch(`${this.baseUrl}/adjustments/${id}`, {
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to fetch adjustment");
    return result.data !== undefined ? result.data : result;
  }

  async createAdjustment(data: any) {
    const response = await fetch(`${this.baseUrl}/adjustments`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to create adjustment");
    return result;
  }

  async validateAdjustment(id: string) {
    const response = await fetch(`${this.baseUrl}/adjustments/${id}/validate`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to validate adjustment");
    return result;
  }

  // --- Stock Ledger & Alerts (Phase 3) ---
  async getStockLedger(filters?: { productId?: string; locationId?: string; transactionType?: string }) {
    const params = new URLSearchParams(filters as any);
    const response = await fetch(`${this.baseUrl}/stock-ledger?${params.toString()}`, {
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to fetch stock ledger");
    return result.data !== undefined ? result.data : result;
  }

  async getAlerts(filters?: { status?: string; alertType?: string }) {
    const params = new URLSearchParams(filters as any);
    const response = await fetch(`${this.baseUrl}/alerts?${params.toString()}`, {
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to fetch alerts");
    return result.data !== undefined ? result.data : result;
  }

  async updateAlertStatus(id: string, status: string) {
    const response = await fetch(`${this.baseUrl}/alerts/${id}/status`, {
      method: "PATCH",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to update alert status");
    return result;
  }

  // --- Dashboard Endpoints (Phase 4) ---
  async getDashboardSummary() {
    const response = await fetch(`${this.baseUrl}/dashboard/summary`, {
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to fetch dashboard summary");
    return result.data;
  }

  async getDashboardActivity(limit = 10) {
    const response = await fetch(`${this.baseUrl}/dashboard/activity?limit=${limit}`, {
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to fetch dashboard activity");
    return result.data;
  }

  async getWarehouseDistribution() {
    const response = await fetch(`${this.baseUrl}/dashboard/warehouse-distribution`, {
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to fetch warehouse distribution");
    return result.data;
  }

  async getCategoryDistribution() {
    const response = await fetch(`${this.baseUrl}/dashboard/category-distribution`, {
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to fetch category distribution");
    return result.data;
  }

  async getStockTrends(days = 30) {
    const response = await fetch(`${this.baseUrl}/dashboard/stock-trends?days=${days}`, {
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to fetch stock trends");
    return result.data;
  }

  async createProduct(data: { name: string; sku: string; categoryId: string; description?: string; unit?: string; reorderLevel?: number }) {
    const response = await fetch(`${this.baseUrl}/products`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to create product");
    return result;
  }

  async createCategory(data: { name: string; description?: string }) {
    const response = await fetch(`${this.baseUrl}/categories`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to create category");
    return result;
  }

  // --- AI Assistant (Phase 5) ---
  async sendAiChat(
    message: string,
    history?: Array<{ role: "user" | "assistant"; content: string }>
  ) {
    const response = await fetch(`${this.baseUrl}/ai/chat`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ message, history }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(
        result.error || result.message || "Failed to communicate with AI assistant"
      );
    }
    return result;
  }
}

export const apiService = new ApiService(API_BASE);