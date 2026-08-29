import { prisma } from "@/lib/db";
import { last4 } from "@/lib/constants";

export const orderItemInclude = {
  order: { include: { customer: true } },
  product: { include: { components: { include: { component: true } } } },
  componentChecks: { include: { component: true } },
  qaPhotos: true,
} as const;

export type OrderItemWithRelations = Awaited<
  ReturnType<typeof prisma.orderItem.findFirstOrThrow<{ include: typeof orderItemInclude }>>
>;

/** Flatten an order item + relations into the shape the order sheet / kanban UI consumes. */
export function serializeOrderItem(item: OrderItemWithRelations) {
  const displayName = item.product?.name ?? item.oneOffName ?? "Untitled item";
  const fnsku = item.product?.fnsku ?? item.oneOffFnsku ?? null;

  return {
    id: item.id,
    orderId: item.orderId,
    orderNumber: item.order.orderNumber,
    orderSource: item.order.source,
    receivedAt: item.order.receivedAt,
    customer: item.order.customer ? { id: item.order.customer.id, name: item.order.customer.name } : null,
    productId: item.productId,
    displayName,
    fnsku,
    fnskuLast4: last4(fnsku),
    sizeLabel: item.product?.sizeLabel ?? null,
    isOneOff: !item.productId,
    customerSuppliesParts: item.product?.customerSuppliesParts ?? false,
    quantity: item.quantity,
    workOrderNumber: item.workOrderNumber,
    priority: item.priority,
    kanbanStage: item.kanbanStage,
    trackInventory: item.trackInventory,
    manualOverride: item.manualOverride,
    notes: item.notes,
    sentToProductionAt: item.sentToProductionAt,
    completedAt: item.completedAt,
    actualQtyProduced: item.actualQtyProduced,
    odooMakeOrderRef: item.odooMakeOrderRef,
    odooMakeOrderClosed: item.odooMakeOrderClosed,
    unitPrice: item.product?.unitPrice ?? null,
    cogsPerUnit: item.product?.cogsPerUnit ?? null,
    productionGuidelines: item.product?.productionGuidelines ?? null,
    bom:
      item.product?.components.map((pc) => ({
        componentId: pc.componentId,
        componentName: pc.component.name,
        type: pc.component.type,
        role: pc.role,
        qtyPerUnit: pc.qtyPerUnit,
        unitOfMeasure: pc.component.unitOfMeasure,
      })) ?? [],
    componentChecks: item.componentChecks.map((cc) => ({
      id: cc.id,
      componentId: cc.componentId,
      componentName: cc.component.name,
      role: cc.role,
      requiredQty: cc.requiredQty,
      onHandAtCheck: cc.onHandAtCheck,
      status: cc.status,
      manualOverride: cc.manualOverride,
      note: cc.note,
      checkedAt: cc.checkedAt,
    })),
    qaPhotos: item.qaPhotos.map((p) => ({
      id: p.id,
      url: p.url,
      caption: p.caption,
      uploadedAt: p.uploadedAt,
    })),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export type SerializedOrderItem = ReturnType<typeof serializeOrderItem>;
