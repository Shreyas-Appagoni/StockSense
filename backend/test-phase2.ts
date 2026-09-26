process.env.NODE_ENV = "test";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import app from "./src/server.js";
import { generateToken, sanitizeUser } from "./src/services/authService.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from "./src/validators/authValidator.js";
import {
  createProductSchema,
  createCategorySchema,
  createWarehouseSchema,
  createLocationSchema,
} from "./src/validators/dataValidator.js";

async function runTests() {
  console.log("==========================================");
  console.log("   StockSense Phase 2 Verification Suite  ");
  console.log("==========================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Password Hashing Tests
  console.log("--- 1. Password Hashing ---");
  const rawPassword = "TestPassword123!";
  const hash = await bcrypt.hash(rawPassword, 10);
  assert(hash !== rawPassword, "Password must not be stored in plaintext");
  assert(hash.startsWith("$2"), "Password hash must be a valid bcrypt hash");
  const validMatch = await bcrypt.compare(rawPassword, hash);
  assert(validMatch, "bcrypt.compare succeeds for correct password");
  const invalidMatch = await bcrypt.compare("WrongPassword", hash);
  assert(!invalidMatch, "bcrypt.compare fails for wrong password");

  // 2. Token Generation & Sanitization
  console.log("\n--- 2. JWT Generation & User Sanitization ---");
  const mockUser = {
    id: "user_test_123",
    name: "Alice Manager",
    email: "alice@test.com",
    role: "INVENTORY_MANAGER" as const,
    passwordHash: hash,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const sanitized = sanitizeUser(mockUser);
  assert(!("passwordHash" in sanitized), "Sanitized user does NOT contain passwordHash");
  assert(sanitized.email === "alice@test.com", "Sanitized user retains email");
  assert(sanitized.role === "INVENTORY_MANAGER", "Sanitized user retains role");

  const token = generateToken(sanitized);
  assert(typeof token === "string" && token.length > 20, "generateToken generates JWT string");
  const decoded = jwt.decode(token) as any;
  assert(decoded.id === mockUser.id, "Decoded JWT contains user ID");
  assert(decoded.role === "INVENTORY_MANAGER", "Decoded JWT contains role");

  // 3. Zod Validation Tests
  console.log("\n--- 3. Input Validation (Zod) ---");
  // Auth validator
  const validRegister = registerSchema.safeParse({
    name: "John Doe",
    email: "john@example.com",
    password: "securepassword",
    role: "WAREHOUSE_STAFF",
  });
  assert(validRegister.success, "registerSchema accepts valid input");

  const invalidEmailRegister = registerSchema.safeParse({
    name: "John Doe",
    email: "not-an-email",
    password: "securepassword",
  });
  assert(!invalidEmailRegister.success, "registerSchema rejects invalid email");

  const shortPasswordRegister = registerSchema.safeParse({
    name: "John Doe",
    email: "john@example.com",
    password: "123",
  });
  assert(!shortPasswordRegister.success, "registerSchema rejects password < 6 characters");

  const validLogin = loginSchema.safeParse({
    email: "john@example.com",
    password: "anypassword",
  });
  assert(validLogin.success, "loginSchema accepts valid input");

  const invalidLogin = loginSchema.safeParse({
    email: "invalid-email",
    password: "",
  });
  assert(!invalidLogin.success, "loginSchema rejects empty password and bad email");

  const validOtp = verifyOtpSchema.safeParse({
    email: "john@example.com",
    otp: "123456",
  });
  assert(validOtp.success, "verifyOtpSchema accepts 6-digit OTP");

  const invalidOtp = verifyOtpSchema.safeParse({
    email: "john@example.com",
    otp: "12",
  });
  assert(!invalidOtp.success, "verifyOtpSchema rejects short OTP");

  // Data validator
  const validProd = createProductSchema.safeParse({
    name: "Test Rods",
    sku: "TEST-ROD-01",
    categoryId: "cat_123",
    unit: "meters",
    reorderLevel: 25,
  });
  assert(validProd.success, "createProductSchema accepts valid product");

  const missingSkuProd = createProductSchema.safeParse({
    name: "Test Rods",
    categoryId: "cat_123",
  });
  assert(!missingSkuProd.success, "createProductSchema rejects missing SKU");

  // 4. Express Server & Route Tests
  console.log("\n--- 4. HTTP Routes & Middleware Tests ---");
  const server = app.listen(0);
  const port = (server.address() as any).port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // Health check
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthJson = await healthRes.json();
    assert(healthRes.status === 200, "GET /api/health returns 200");
    assert(healthJson.status === "ok", "GET /api/health returns status ok");

    // Unauthenticated access rejection
    const unauthMe = await fetch(`${baseUrl}/api/auth/me`);
    assert(unauthMe.status === 401, "GET /api/auth/me without token returns 401");

    const unauthProducts = await fetch(`${baseUrl}/api/products`);
    assert(unauthProducts.status === 401, "GET /api/products without token returns 401");

    const unauthCategories = await fetch(`${baseUrl}/api/categories`);
    assert(unauthCategories.status === 401, "GET /api/categories without token returns 401");

    const unauthInventory = await fetch(`${baseUrl}/api/inventory`);
    assert(unauthInventory.status === 401, "GET /api/inventory without token returns 401");

    // Invalid body validation rejection
    const badRegisterRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert(badRegisterRes.status === 400, "POST /api/auth/register with empty body returns 400 Bad Request");
    const badRegisterJson = await badRegisterRes.json();
    assert(badRegisterJson.error === "Validation failed", "Validation error details returned");

    // Staff vs Manager Role Authorization
    const staffUser = {
      id: "staff_123",
      name: "Bob Staff",
      email: "staff@test.com",
      role: "WAREHOUSE_STAFF" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const staffToken = generateToken(staffUser);

    const managerUser = {
      id: "mgr_123",
      name: "Alice Manager",
      email: "manager@test.com",
      role: "INVENTORY_MANAGER" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const managerToken = generateToken(managerUser);

    // Staff trying to access manager-only route: POST /api/products
    const staffCreateProd = await fetch(`${baseUrl}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        name: "Test",
        sku: "TEST-SKU",
        categoryId: "cat_1",
      }),
    });
    assert(staffCreateProd.status === 403, "POST /api/products with WAREHOUSE_STAFF returns 403 Forbidden");

    // Staff trying to create category: POST /api/categories
    const staffCreateCat = await fetch(`${baseUrl}/api/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({ name: "New Cat" }),
    });
    assert(staffCreateCat.status === 403, "POST /api/categories with WAREHOUSE_STAFF returns 403 Forbidden");

    // Manager accessing manager route with invalid body: should pass auth & role check and hit validator (400)
    const managerBadProd = await fetch(`${baseUrl}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({ name: "Missing SKU" }),
    });
    assert(managerBadProd.status === 400, "POST /api/products with INVENTORY_MANAGER passes auth/role and returns 400 on invalid body");

    // Invalid Token
    const invalidTokenRes = await fetch(`${baseUrl}/api/products`, {
      headers: { Authorization: "Bearer bogus-token-value" },
    });
    assert(invalidTokenRes.status === 401, "GET /api/products with bogus token returns 401");

  } finally {
    server.close();
  }

  console.log("\n==========================================");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((e) => {
  console.error("Test runner failed:", e);
  process.exit(1);
});
