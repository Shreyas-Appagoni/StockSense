import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function main() {
  console.log("Seeding StockSense Phase 2 database...");

  // 1. Users
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const manager = await prisma.user.upsert({
    where: { email: "manager@stocksense.com" },
    update: {},
    create: {
      name: "Alice Chen",
      email: "manager@stocksense.com",
      passwordHash,
      role: Role.INVENTORY_MANAGER,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@stocksense.com" },
    update: {},
    create: {
      name: "Bob Smith",
      email: "staff@stocksense.com",
      passwordHash,
      role: Role.WAREHOUSE_STAFF,
    },
  });

  console.log(`Created users: ${manager.email} (${manager.role}), ${staff.email} (${staff.role})`);

  // 2. Categories
  const catRaw = await prisma.category.upsert({
    where: { name: "Raw Materials" },
    update: {},
    create: {
      name: "Raw Materials",
      description: "Base materials for manufacturing and construction",
    },
  });

  const catComp = await prisma.category.upsert({
    where: { name: "Components" },
    update: {},
    create: {
      name: "Components",
      description: "Sub-assemblies, spare parts, and consumables",
    },
  });

  const catFin = await prisma.category.upsert({
    where: { name: "Finished Goods" },
    update: {},
    create: {
      name: "Finished Goods",
      description: "Final packaged goods ready for dispatch or distribution",
    },
  });

  // 3. Warehouses & Locations
  const whMdc = await prisma.warehouse.upsert({
    where: { code: "WH-MDC" },
    update: {},
    create: {
      name: "Main Distribution Center",
      code: "WH-MDC",
      address: "100 Logistics Way, Industrial Park",
    },
  });

  const whSec = await prisma.warehouse.upsert({
    where: { code: "WH-SEC" },
    update: {},
    create: {
      name: "Secondary Hub",
      code: "WH-SEC",
      address: "45 Cargo Road, Eastport",
    },
  });

  const locMdcA = await prisma.location.upsert({
    where: {
      warehouseId_name: {
        warehouseId: whMdc.id,
        name: "Zone A - Bulk Storage",
      },
    },
    update: {},
    create: {
      name: "Zone A - Bulk Storage",
      code: "MDC-ZA",
      warehouseId: whMdc.id,
    },
  });

  const locMdcB = await prisma.location.upsert({
    where: {
      warehouseId_name: {
        warehouseId: whMdc.id,
        name: "Zone B - High Density Rack",
      },
    },
    update: {},
    create: {
      name: "Zone B - High Density Rack",
      code: "MDC-ZB",
      warehouseId: whMdc.id,
    },
  });

  const locMdcIn = await prisma.location.upsert({
    where: {
      warehouseId_name: {
        warehouseId: whMdc.id,
        name: "Staging Inbound",
      },
    },
    update: {},
    create: {
      name: "Staging Inbound",
      code: "MDC-STG-IN",
      warehouseId: whMdc.id,
    },
  });

  const locSec1 = await prisma.location.upsert({
    where: {
      warehouseId_name: {
        warehouseId: whSec.id,
        name: "Aisle 1 - Fast Moving",
      },
    },
    update: {},
    create: {
      name: "Aisle 1 - Fast Moving",
      code: "SEC-A1",
      warehouseId: whSec.id,
    },
  });

  const locSec2 = await prisma.location.upsert({
    where: {
      warehouseId_name: {
        warehouseId: whSec.id,
        name: "Aisle 2 - Small Parts",
      },
    },
    update: {},
    create: {
      name: "Aisle 2 - Small Parts",
      code: "SEC-A2",
      warehouseId: whSec.id,
    },
  });

  // 4. Suppliers
  await prisma.supplier.createMany({
    data: [
      {
        name: "Global Industrial Supplies Ltd",
        contactPerson: "Marcus Vance",
        email: "orders@globalindustrial.com",
        phone: "+1-555-0192",
        address: "500 Commerce Blvd, Suite 200",
      },
      {
        name: "Apex Metal & Alloys Co",
        contactPerson: "Elena Rostova",
        email: "sales@apexmetals.com",
        phone: "+1-555-0183",
        address: "12 Foundry Street",
      },
      {
        name: "SafeWork Equipment Direct",
        contactPerson: "David Miller",
        email: "supply@safework.com",
        phone: "+1-555-0144",
        address: "88 Protection Way",
      },
    ],
    skipDuplicates: true,
  });

  // 5. Products
  const prodSteel = await prisma.product.upsert({
    where: { sku: "STL-ROD-010" },
    update: {},
    create: {
      name: "Steel Rods 10mm",
      sku: "STL-ROD-010",
      description: "Standard structural steel reinforcement rods",
      categoryId: catRaw.id,
      unit: "meters",
      reorderLevel: 50,
    },
  });

  const prodBearings = await prisma.product.upsert({
    where: { sku: "BRG-6205-IND" },
    update: {},
    create: {
      name: "Industrial Bearings 6205",
      sku: "BRG-6205-IND",
      description: "Deep groove ball bearing for rotating equipment",
      categoryId: catComp.id,
      unit: "pieces",
      reorderLevel: 100,
    },
  });

  const prodCopper = await prisma.product.upsert({
    where: { sku: "COP-WIR-025" },
    update: {},
    create: {
      name: "Copper Wire 2.5mm",
      sku: "COP-WIR-025",
      description: "Insulated single-core electrical copper wire",
      categoryId: catRaw.id,
      unit: "meters",
      reorderLevel: 80,
    },
  });

  const prodGloves = await prisma.product.upsert({
    where: { sku: "SAF-GLV-001" },
    update: {},
    create: {
      name: "Safety Gloves Kevlar Heavy",
      sku: "SAF-GLV-001",
      description: "Cut-resistant heavy-duty warehouse safety gloves",
      categoryId: catComp.id,
      unit: "pairs",
      reorderLevel: 30,
    },
  });

  const prodBoxes = await prisma.product.upsert({
    where: { sku: "BOX-HD-001" },
    update: {},
    create: {
      name: "Packaging Boxes Heavy Duty",
      sku: "BOX-HD-001",
      description: "Corrugated double-wall packing containers",
      categoryId: catFin.id,
      unit: "boxes",
      reorderLevel: 200,
    },
  });

  // 6. Initial Inventory (uniquely identified by productId + locationId)
  await prisma.inventory.upsert({
    where: {
      productId_locationId: {
        productId: prodSteel.id,
        locationId: locMdcA.id,
      },
    },
    update: {},
    create: {
      productId: prodSteel.id,
      locationId: locMdcA.id,
      quantity: 250,
    },
  });

  await prisma.inventory.upsert({
    where: {
      productId_locationId: {
        productId: prodBearings.id,
        locationId: locMdcB.id,
      },
    },
    update: {},
    create: {
      productId: prodBearings.id,
      locationId: locMdcB.id,
      quantity: 400,
    },
  });

  await prisma.inventory.upsert({
    where: {
      productId_locationId: {
        productId: prodCopper.id,
        locationId: locSec2.id,
      },
    },
    update: {},
    create: {
      productId: prodCopper.id,
      locationId: locSec2.id,
      quantity: 180,
    },
  });

  await prisma.inventory.upsert({
    where: {
      productId_locationId: {
        productId: prodGloves.id,
        locationId: locSec1.id,
      },
    },
    update: {},
    create: {
      productId: prodGloves.id,
      locationId: locSec1.id,
      quantity: 65,
    },
  });

  await prisma.inventory.upsert({
    where: {
      productId_locationId: {
        productId: prodBoxes.id,
        locationId: locMdcIn.id,
      },
    },
    update: {},
    create: {
      productId: prodBoxes.id,
      locationId: locMdcIn.id,
      quantity: 500,
    },
  });

  console.log("Seed data applied successfully!");
}

if (process.env.NODE_ENV !== "test") {
  main()
    .catch((e) => {
      console.error("Error seeding database:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
