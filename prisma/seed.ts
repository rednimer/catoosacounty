import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function computeStatus(requiredQty: number, onHandQty: number): "GREEN" | "YELLOW" | "RED" {
  if (onHandQty <= 0 || onHandQty < requiredQty) return "RED";
  if (onHandQty < requiredQty * 1.25) return "YELLOW";
  return "GREEN";
}

async function main() {
  console.log("Seeding...");

  await prisma.$transaction([
    prisma.componentCheck.deleteMany(),
    prisma.qaPhoto.deleteMany(),
    prisma.shipment.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.productComponent.deleteMany(),
    prisma.product.deleteMany(),
    prisma.component.deleteMany(),
    prisma.customer.deleteMany(),
  ]);

  const [levenRose, privateLabelCo] = await Promise.all([
    prisma.customer.create({ data: { name: "Leven Rose", email: "orders@levenrose.com" } }),
    prisma.customer.create({
      data: { name: "Private Label Co", email: "restock@privatelabelco.com" },
    }),
  ]);

  const components = await Promise.all([
    prisma.component.create({
      data: { name: "1oz Amber Glass Bottle", type: "BOTTLE", unitOfMeasure: "ea", onHandQty: 10000, lowStockThreshold: 2000, criticalThreshold: 500 },
    }),
    prisma.component.create({
      data: { name: "4oz Amber Glass Bottle", type: "BOTTLE", unitOfMeasure: "ea", onHandQty: 170, lowStockThreshold: 200, criticalThreshold: 80 },
    }),
    prisma.component.create({
      data: { name: "20/410 Dropper Closure", type: "CLOSURE", unitOfMeasure: "ea", onHandQty: 5000, lowStockThreshold: 1000, criticalThreshold: 300 },
    }),
    prisma.component.create({
      data: { name: "Glass Dropper 1oz", type: "DROPPER", unitOfMeasure: "ea", onHandQty: 250, lowStockThreshold: 400, criticalThreshold: 150 },
    }),
    prisma.component.create({
      data: { name: "Glass Dropper 4oz", type: "DROPPER", unitOfMeasure: "ea", onHandQty: 1000, lowStockThreshold: 200, criticalThreshold: 80 },
    }),
    prisma.component.create({
      data: { name: "Rosehip Oil 1oz Label — Leven Rose", type: "LABEL", unitOfMeasure: "ea", onHandQty: 600, lowStockThreshold: 500, criticalThreshold: 200 },
    }),
    prisma.component.create({
      data: { name: "Rosehip Oil 4oz Label — Leven Rose", type: "LABEL", unitOfMeasure: "ea", onHandQty: 500, lowStockThreshold: 150, criticalThreshold: 60 },
    }),
    prisma.component.create({
      data: { name: "Jojoba Oil 1oz Label — Leven Rose", type: "LABEL", unitOfMeasure: "ea", onHandQty: 1000, lowStockThreshold: 250, criticalThreshold: 100 },
    }),
    prisma.component.create({
      data: { name: "Argan Oil 1oz Label — Private Label Co", type: "LABEL", unitOfMeasure: "ea", onHandQty: 50, lowStockThreshold: 200, criticalThreshold: 75 },
    }),
    prisma.component.create({
      data: { name: "Jojoba Serum 1oz Label — Private Label Co", type: "LABEL", unitOfMeasure: "ea", onHandQty: 400, lowStockThreshold: 100, criticalThreshold: 40 },
    }),
    prisma.component.create({
      data: { name: "Rosehip Seed Oil (bulk)", type: "BULK", unitOfMeasure: "oz", onHandQty: 3000, lowStockThreshold: 600, criticalThreshold: 200 },
    }),
    prisma.component.create({
      data: { name: "Jojoba Oil (bulk)", type: "BULK", unitOfMeasure: "oz", onHandQty: 150, lowStockThreshold: 400, criticalThreshold: 150 },
    }),
    prisma.component.create({
      data: { name: "Argan Oil (bulk)", type: "BULK", unitOfMeasure: "oz", onHandQty: 20, lowStockThreshold: 250, criticalThreshold: 100 },
    }),
  ]);

  const byName = Object.fromEntries(components.map((c) => [c.name, c]));

  const rosehip1oz = await prisma.product.create({
    data: {
      fnsku: "X001AAA111",
      name: "Rosehip Oil 1oz",
      sizeLabel: "1oz",
      customerId: levenRose.id,
      unitPrice: 6.5,
      cogsPerUnit: 2.1,
      productionGuidelines: "Fill to 1oz mark on scale (28.3g ±0.3g). Torque dropper cap to 15 in-lb. QC: check fill line and label alignment before cartoning.",
      components: {
        create: [
          { componentId: byName["1oz Amber Glass Bottle"].id, role: "BOTTLE", qtyPerUnit: 1 },
          { componentId: byName["20/410 Dropper Closure"].id, role: "CLOSURE", qtyPerUnit: 1 },
          { componentId: byName["Glass Dropper 1oz"].id, role: "DROPPER", qtyPerUnit: 1 },
          { componentId: byName["Rosehip Oil 1oz Label — Leven Rose"].id, role: "LABEL", qtyPerUnit: 1 },
          { componentId: byName["Rosehip Seed Oil (bulk)"].id, role: "BULK", qtyPerUnit: 1 },
        ],
      },
    },
  });

  const rosehip4oz = await prisma.product.create({
    data: {
      fnsku: "X001AAA444",
      name: "Rosehip Oil 4oz",
      sizeLabel: "4oz",
      customerId: levenRose.id,
      unitPrice: 14,
      cogsPerUnit: 6,
      productionGuidelines: "Fill to 4oz mark on scale (113.4g ±0.5g). Torque dropper cap to 18 in-lb.",
      components: {
        create: [
          { componentId: byName["4oz Amber Glass Bottle"].id, role: "BOTTLE", qtyPerUnit: 1 },
          { componentId: byName["20/410 Dropper Closure"].id, role: "CLOSURE", qtyPerUnit: 1 },
          { componentId: byName["Glass Dropper 4oz"].id, role: "DROPPER", qtyPerUnit: 1 },
          { componentId: byName["Rosehip Oil 4oz Label — Leven Rose"].id, role: "LABEL", qtyPerUnit: 1 },
          { componentId: byName["Rosehip Seed Oil (bulk)"].id, role: "BULK", qtyPerUnit: 4 },
        ],
      },
    },
  });

  const jojoba1oz = await prisma.product.create({
    data: {
      fnsku: "X002BBB111",
      name: "Jojoba Oil 1oz",
      sizeLabel: "1oz",
      customerId: levenRose.id,
      unitPrice: 6,
      cogsPerUnit: 1.8,
      productionGuidelines: "Fill to 1oz mark. Standard dropper torque 15 in-lb.",
      components: {
        create: [
          { componentId: byName["1oz Amber Glass Bottle"].id, role: "BOTTLE", qtyPerUnit: 1 },
          { componentId: byName["20/410 Dropper Closure"].id, role: "CLOSURE", qtyPerUnit: 1 },
          { componentId: byName["Glass Dropper 1oz"].id, role: "DROPPER", qtyPerUnit: 1 },
          { componentId: byName["Jojoba Oil 1oz Label — Leven Rose"].id, role: "LABEL", qtyPerUnit: 1 },
          { componentId: byName["Jojoba Oil (bulk)"].id, role: "BULK", qtyPerUnit: 1 },
        ],
      },
    },
  });

  const argan1oz = await prisma.product.create({
    data: {
      fnsku: "Y009CCC111",
      name: "Argan Oil 1oz",
      sizeLabel: "1oz",
      customerId: privateLabelCo.id,
      unitPrice: 7,
      cogsPerUnit: 2.5,
      productionGuidelines: "Fill to 1oz mark. Private Label Co label must be aligned with logo facing dropper seam.",
      components: {
        create: [
          { componentId: byName["1oz Amber Glass Bottle"].id, role: "BOTTLE", qtyPerUnit: 1 },
          { componentId: byName["20/410 Dropper Closure"].id, role: "CLOSURE", qtyPerUnit: 1 },
          { componentId: byName["Glass Dropper 1oz"].id, role: "DROPPER", qtyPerUnit: 1 },
          { componentId: byName["Argan Oil 1oz Label — Private Label Co"].id, role: "LABEL", qtyPerUnit: 1 },
          { componentId: byName["Argan Oil (bulk)"].id, role: "BULK", qtyPerUnit: 1 },
        ],
      },
    },
  });

  const jojobaSerum1oz = await prisma.product.create({
    data: {
      fnsku: "Y010DDD111",
      name: "Jojoba Facial Serum 1oz",
      sizeLabel: "1oz",
      customerId: privateLabelCo.id,
      unitPrice: 9,
      cogsPerUnit: 3.2,
      productionGuidelines: "Diluted jojoba serum blend — fill to 1oz mark, cap torque 15 in-lb.",
      components: {
        create: [
          { componentId: byName["1oz Amber Glass Bottle"].id, role: "BOTTLE", qtyPerUnit: 1 },
          { componentId: byName["20/410 Dropper Closure"].id, role: "CLOSURE", qtyPerUnit: 1 },
          { componentId: byName["Glass Dropper 1oz"].id, role: "DROPPER", qtyPerUnit: 1 },
          { componentId: byName["Jojoba Serum 1oz Label — Private Label Co"].id, role: "LABEL", qtyPerUnit: 1 },
          { componentId: byName["Jojoba Oil (bulk)"].id, role: "BULK", qtyPerUnit: 0.5 },
        ],
      },
    },
  });

  const giftSet = await prisma.product.create({
    data: {
      name: "Custom Holiday Gift Set — One-Time Run",
      sizeLabel: null,
      customerId: levenRose.id,
      trackInventory: false,
      customerSuppliesParts: true,
      unitPrice: 22,
      cogsPerUnit: 4,
      productionGuidelines: "Customer supplies boxes, ribbon, and insert cards. We assemble only — no inventory tracked for this one-off.",
      notes: "Specialty one-off — not worth tracking bottle/box inventory for a single run.",
    },
  });

  const restockOrder = await prisma.order.create({
    data: {
      orderNumber: "SO-RESTOCK-0001",
      customerId: levenRose.id,
      source: "RESTOCK_REPORT",
      notes: "Pasted from Leven Rose restock report, week of 8/25.",
      items: {
        create: [
          {
            productId: rosehip1oz.id,
            quantity: 500,
            priority: "HOT",
            kanbanStage: "LINE_1",
            workOrderNumber: "WO-0001",
            sentToProductionAt: new Date(),
            odooMakeOrderRef: "STUB-MO-WO-0001",
            notes: "Rush — Leven Rose wants this on the next truck.",
          },
          {
            productId: rosehip4oz.id,
            quantity: 150,
            kanbanStage: "READY",
            workOrderNumber: "WO-0002",
            sentToProductionAt: new Date(),
            odooMakeOrderRef: "STUB-MO-WO-0002",
          },
          {
            productId: jojoba1oz.id,
            quantity: 300,
            kanbanStage: "INCOMING",
            notes: "Not checked yet.",
          },
        ],
      },
    },
    include: { items: true },
  });

  const emailOrder = await prisma.order.create({
    data: {
      orderNumber: "SO-EMAIL-0002",
      customerId: privateLabelCo.id,
      source: "EMAIL",
      notes: "Forwarded from customer email 8/26.",
      items: {
        create: [
          {
            productId: argan1oz.id,
            quantity: 200,
            kanbanStage: "CARTONING",
            workOrderNumber: "WO-0003",
            sentToProductionAt: new Date(),
            odooMakeOrderRef: "STUB-MO-WO-0003",
          },
          {
            productId: jojobaSerum1oz.id,
            quantity: 100,
            kanbanStage: "READY",
            workOrderNumber: "WO-0004",
            sentToProductionAt: new Date(),
            odooMakeOrderRef: "STUB-MO-WO-0004",
          },
        ],
      },
    },
    include: { items: true },
  });

  const manualOrder = await prisma.order.create({
    data: {
      orderNumber: "SO-MANUAL-0003",
      customerId: levenRose.id,
      source: "MANUAL",
      notes: "One-off custom assembly job.",
      items: {
        create: [
          {
            oneOffName: giftSet.name,
            productId: giftSet.id,
            quantity: 50,
            trackInventory: false,
            kanbanStage: "MANUAL",
            workOrderNumber: "WO-0005",
            sentToProductionAt: new Date(),
            notes: "Customer-supplied boxes/ribbon on site already — just assemble and shrink wrap.",
          },
        ],
      },
    },
    include: { items: true },
  });

  const completedOrder = await prisma.order.create({
    data: {
      orderNumber: "SO-RESTOCK-0004",
      customerId: levenRose.id,
      source: "RESTOCK_REPORT",
      notes: "Prior week restock — already finished.",
      items: {
        create: [
          {
            productId: rosehip1oz.id,
            quantity: 400,
            kanbanStage: "COMPLETED",
            workOrderNumber: "WO-0000",
            sentToProductionAt: new Date(Date.now() - 5 * 86400000),
            completedAt: new Date(Date.now() - 2 * 86400000),
            actualQtyProduced: 396,
            odooMakeOrderRef: "STUB-MO-WO-0000",
            odooMakeOrderClosed: true,
          },
        ],
      },
    },
    include: { items: true },
  });

  // Pre-populate component checks for the items already sent to production.
  const bomByProduct = {
    [rosehip1oz.id]: rosehip1oz,
    [rosehip4oz.id]: rosehip4oz,
    [argan1oz.id]: argan1oz,
    [jojobaSerum1oz.id]: jojobaSerum1oz,
  };

  const productComponents = await prisma.productComponent.findMany({
    where: { productId: { in: Object.keys(bomByProduct) } },
    include: { component: true },
  });

  const itemsNeedingChecks = [
    ...restockOrder.items.filter((i) => i.productId === rosehip1oz.id || i.productId === rosehip4oz.id),
    ...emailOrder.items,
    ...completedOrder.items,
  ];

  for (const item of itemsNeedingChecks) {
    if (!item.productId) continue;
    const lines = productComponents.filter((pc) => pc.productId === item.productId);
    for (const pc of lines) {
      const requiredQty = pc.qtyPerUnit * item.quantity;
      const onHandAtCheck = pc.component.onHandQty;
      await prisma.componentCheck.create({
        data: {
          orderItemId: item.id,
          componentId: pc.componentId,
          role: pc.role,
          requiredQty,
          onHandAtCheck,
          status: computeStatus(requiredQty, onHandAtCheck),
        },
      });
    }
  }

  // A little shipping/invoicing history for the current month.
  await prisma.shipment.createMany({
    data: [
      {
        productId: rosehip1oz.id,
        customerId: levenRose.id,
        quantity: 396,
        unitPrice: rosehip1oz.unitPrice ?? 0,
        shippedAt: new Date(),
        notes: "Restock SO-RESTOCK-0004 shipped complete.",
      },
      {
        productId: jojobaSerum1oz.id,
        customerId: privateLabelCo.id,
        quantity: 80,
        unitPrice: jojobaSerum1oz.unitPrice ?? 0,
        shippedAt: new Date(),
        notes: "Partial shipment, remainder staged.",
      },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
