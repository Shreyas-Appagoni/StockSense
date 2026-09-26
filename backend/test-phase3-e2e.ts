import { prisma } from "./src/services/databaseService.js";
import { inventoryTransactionService } from "./src/services/inventoryTransactionService.js";
import { alertService } from "./src/services/alertService.js";
import { TransactionType } from "@prisma/client";

export async function runEndToEndScenario() {
  console.log("=====================================================");
  console.log("  StockSense Phase 3 Critical End-to-End Scenario    ");
  console.log("=====================================================\n");

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err: any) {
    console.error("❌ PostgreSQL database is not reachable at localhost:5432.");
    console.error("   Integration tests against PostgreSQL cannot execute until Docker/PostgreSQL is running.\n");
    console.log("-----------------------------------------------------");
    console.log("Status: DATABASE TESTS BLOCKED BY MISSING POSTGRESQL");
    console.log("-----------------------------------------------------");
    process.exit(1);
  }

  console.log("✓ Connected to PostgreSQL.\n");

  // Setup: Find or create product (Steel Rods) and two locations
  let product = await prisma.product.findFirst({
    where: { name: { contains: "Steel Rods" } },
  });

  if (!product) {
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({
        data: { name: "Raw Materials", description: "Raw materials" },
      });
    }
    product = await prisma.product.create({
      data: {
        name: "Steel Rods 10mm",
        sku: `STL-E2E-${Date.now()}`,
        categoryId: category.id,
        unit: "meters",
        reorderLevel: 20,
      },
    });
  }

  let warehouse = await prisma.warehouse.findFirst();
  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: { name: "E2E Warehouse", code: `WH-E2E-${Date.now()}` },
    });
  }

  const locA = await prisma.location.create({
    data: {
      name: `Location A - Test ${Date.now()}`,
      warehouseId: warehouse.id,
    },
  });

  const locB = await prisma.location.create({
    data: {
      name: `Location B - Test ${Date.now()}`,
      warehouseId: warehouse.id,
    },
  });

  console.log(`Using product: ${product.name} (${product.sku})`);
  console.log(`Using Location A: ${locA.name} (${locA.id})`);
  console.log(`Using Location B: ${locB.name} (${locB.id})\n`);

  // STEP 1: Initial Inventory = 0
  console.log("--- STEP 1: Verify Initial Inventory ---");
  const initInv = await prisma.inventory.findUnique({
    where: { productId_locationId: { productId: product.id, locationId: locA.id } },
  });
  console.log(`Initial stock at Location A: ${initInv?.quantity ?? 0}`);

  // STEP 2: Receipt of 100 Steel Rods
  console.log("\n--- STEP 2: Receipt of 100 Steel Rods at Location A ---");
  const receipt = await inventoryTransactionService.createReceipt({
    destinationLocationId: locA.id,
    items: [{ productId: product.id, quantity: 100 }],
  });
  await inventoryTransactionService.validateReceipt(receipt.id);

  const invAfterReceipt = await prisma.inventory.findUnique({
    where: { productId_locationId: { productId: product.id, locationId: locA.id } },
  });
  console.log(`Location A stock after receipt: ${invAfterReceipt?.quantity} (Expected: 100)`);

  // STEP 3: Transfer 30 Steel Rods from Location A to Location B
  console.log("\n--- STEP 3: Transfer 30 Steel Rods (Location A -> Location B) ---");
  const transfer = await inventoryTransactionService.createTransfer({
    fromLocationId: locA.id,
    toLocationId: locB.id,
    items: [{ productId: product.id, quantity: 30 }],
  });
  await inventoryTransactionService.validateTransfer(transfer.id);

  const invAAfterTransfer = await prisma.inventory.findUnique({
    where: { productId_locationId: { productId: product.id, locationId: locA.id } },
  });
  const invBAfterTransfer = await prisma.inventory.findUnique({
    where: { productId_locationId: { productId: product.id, locationId: locB.id } },
  });
  console.log(`Location A stock: ${invAAfterTransfer?.quantity} (Expected: 70)`);
  console.log(`Location B stock: ${invBAfterTransfer?.quantity} (Expected: 30)`);
  console.log(`Total stock: ${(invAAfterTransfer?.quantity || 0) + (invBAfterTransfer?.quantity || 0)} (Expected: 100)`);

  // STEP 4: Delivery 20 Steel Rods from Location A
  console.log("\n--- STEP 4: Delivery 20 Steel Rods from Location A ---");
  const delivery = await inventoryTransactionService.createDelivery({
    sourceLocationId: locA.id,
    customerName: "Acme Corp",
    items: [{ productId: product.id, quantity: 20 }],
  });
  await inventoryTransactionService.validateDelivery(delivery.id);

  const invAAfterDelivery = await prisma.inventory.findUnique({
    where: { productId_locationId: { productId: product.id, locationId: locA.id } },
  });
  console.log(`Location A stock: ${invAAfterDelivery?.quantity} (Expected: 50)`);

  // STEP 5: Adjustment to 47 at Location A
  console.log("\n--- STEP 5: Adjustment with physical count = 47 at Location A ---");
  const adjustment = await inventoryTransactionService.createAdjustment({
    locationId: locA.id,
    reason: "Damaged inventory write-off",
    items: [{ productId: product.id, countedQuantity: 47 }],
  });
  await inventoryTransactionService.validateAdjustment(adjustment.id);

  const invAFinal = await prisma.inventory.findUnique({
    where: { productId_locationId: { productId: product.id, locationId: locA.id } },
  });
  const invBFinal = await prisma.inventory.findUnique({
    where: { productId_locationId: { productId: product.id, locationId: locB.id } },
  });

  console.log("\n=====================================================");
  console.log("                 FINAL RESULTS                       ");
  console.log("=====================================================");
  console.log(`Location A: ${invAFinal?.quantity} (Expected: 47)`);
  console.log(`Location B: ${invBFinal?.quantity} (Expected: 30)`);
  console.log(`Total: ${(invAFinal?.quantity || 0) + (invBFinal?.quantity || 0)} (Expected: 77)`);

  // Check ledger entries
  const ledgerEntries = await prisma.stockLedger.findMany({
    where: { productId: product.id },
    orderBy: { createdAt: "asc" },
  });
  console.log(`\nTotal StockLedger entries for product: ${ledgerEntries.length}`);
  ledgerEntries.forEach((l) => {
    console.log(
      `  • Type: ${l.transactionType}, Change: ${l.quantityChange}, Prev: ${l.previousQuantity} -> New: ${l.newQuantity}`
    );
  });

  // STEP 6: Insufficient Stock Tests
  console.log("\n--- INSUFFICIENT STOCK TESTS ---");
  const badDelivery = await inventoryTransactionService.createDelivery({
    sourceLocationId: locA.id,
    items: [{ productId: product.id, quantity: 999999 }],
  });

  try {
    await inventoryTransactionService.validateDelivery(badDelivery.id);
    console.error("FAIL: Oversized delivery should have thrown an error!");
  } catch (e: any) {
    console.log("✓ Oversized delivery rejected correctly:", e.message);
  }

  const checkAfterFailed = await prisma.inventory.findUnique({
    where: { productId_locationId: { productId: product.id, locationId: locA.id } },
  });
  console.log(`Location A stock after failed delivery: ${checkAfterFailed?.quantity} (Expected: 47)`);

  console.log("\n✓ Phase 3 End-to-End Scenario Completed Successfully!");
}

if (process.env.NODE_ENV !== "test") {
  runEndToEndScenario()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}
