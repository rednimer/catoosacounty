/**
 * Odoo integration layer — STUBBED.
 *
 * Fifth Street Labs' Odoo connection isn't wired up in this environment yet.
 * Every function below has the exact signature the UI calls, and returns a
 * deterministic mocked response. When real Odoo API access (base URL, DB,
 * API key) is available, replace each function body with the actual
 * XML-RPC/JSON-RPC call — nothing above this module needs to change.
 *
 * Config comes from env: ODOO_BASE_URL, ODOO_DB, ODOO_API_KEY, ODOO_ENABLED.
 */

export function isOdooConfigured(): boolean {
  return (
    process.env.ODOO_ENABLED === "true" &&
    !!process.env.ODOO_BASE_URL &&
    !!process.env.ODOO_DB &&
    !!process.env.ODOO_API_KEY
  );
}

export interface StockLevelResult {
  componentId: string;
  onHandQty: number;
  source: "odoo" | "stub";
}

/** Pull current on-hand quantity for a set of components from Odoo inventory. */
export async function fetchStockLevels(
  components: { id: string; odooProductRef: string | null; fallbackQty: number }[]
): Promise<StockLevelResult[]> {
  if (isOdooConfigured()) {
    // TODO: replace with a real call, e.g.
    //   POST `${process.env.ODOO_BASE_URL}/jsonrpc` with method
    //   `stock.quant`/`search_read` filtered by product refs, authenticated
    //   with ODOO_DB / ODOO_API_KEY.
    console.warn("[odoo] ODOO_ENABLED=true but no real client implemented yet — using stub.");
  }

  // Stub: just echo back the component's locally-tracked on-hand quantity,
  // so "check inventory" behaves sensibly against local data until Odoo is live.
  return components.map((c) => ({
    componentId: c.id,
    onHandQty: c.fallbackQty,
    source: "stub" as const,
  }));
}

export interface MakeOrderPayload {
  workOrderNumber: string;
  fnsku: string | null;
  productName: string;
  quantity: number;
}

export interface MakeOrderResult {
  odooMakeOrderRef: string;
  source: "odoo" | "stub";
}

/** Create a manufacturing order ("make order") in Odoo when a work order enters production. */
export async function createMakeOrder(payload: MakeOrderPayload): Promise<MakeOrderResult> {
  if (isOdooConfigured()) {
    // TODO: replace with a real call, e.g. `mrp.production`/`create`.
    console.warn("[odoo] ODOO_ENABLED=true but no real client implemented yet — using stub.");
  }

  return {
    odooMakeOrderRef: `STUB-MO-${payload.workOrderNumber}`,
    source: "stub",
  };
}

export interface CloseMakeOrderPayload {
  odooMakeOrderRef: string;
  actualQtyProduced: number;
}

export interface CloseMakeOrderResult {
  success: boolean;
  source: "odoo" | "stub";
}

/** Close out a make order in Odoo with the actual quantity produced. */
export async function closeMakeOrder(
  payload: CloseMakeOrderPayload
): Promise<CloseMakeOrderResult> {
  if (isOdooConfigured()) {
    // TODO: replace with a real call, e.g. `mrp.production`/`button_mark_done`
    // after setting `qty_produced`.
    console.warn("[odoo] ODOO_ENABLED=true but no real client implemented yet — using stub.");
  }

  return { success: true, source: "stub" };
}
