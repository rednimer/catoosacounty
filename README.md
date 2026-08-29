# FSL Production Hub

Fifth Street Labs' order intake, inventory-check, production Kanban, and
shipping/invoicing system — replacing the standalone Airtable + printed
work-order workflow with one connected app.

> Currently living on the `claude/production-order-management-r4l304` branch
> of this repo as a stopgap (GitHub repo-creation access was blocked for the
> automated session). Move it to its own repository when that's sorted —
> everything below is self-contained and has no dependency on the old
> storage-site content this repo used to hold.

## Screens

1. **Order Sheet** (`/orders`) — sortable/filterable intake table. Everything
   ties to the product's FNSKU, which drives the bill-of-materials (bottle,
   closure, label, bulk ingredient, dropper). Run a supply check per row
   (currently against locally-tracked on-hand quantities via a stubbed Odoo
   call), see a live "supply needs across all open orders" rollup (e.g. "how
   many 4oz bottles does everything on the sheet need," "does anything else
   need Rosehip"), manually override a check, add one-off/untracked items,
   and send a checked item to the production board (assigns a work order
   number and opens a stubbed Odoo make order).
2. **Production Board** (`/production`) — drag-and-drop Kanban across
   Incoming → Ready → Line 1 → Line 2 → Manual → Cartoning → Shrinking →
   Completed. Cards show product, quantity, last 4 of the FNSKU, and a hot/
   priority indicator. Each card opens a detail drawer with production
   guidelines, notes, and QA photo upload. Completing a card records the
   actual quantity produced and closes the (stubbed) Odoo make order.
3. **Shipping & Invoicing** (`/shipping`) — log outbound shipments against a
   product/customer, then see a monthly amount-due rollup per customer
   (priced off the product's FNSKU-linked unit price, with COGS/margin shown
   alongside).

## Data model

See `prisma/schema.prisma`. Core entities: `Customer`, `Component` (bottle /
closure / label / bulk / dropper / box, with on-hand qty + thresholds),
`Product` (the FNSKU-level SKU, with a `ProductComponent` bill-of-materials),
`Order` / `OrderItem` (the sheet + board rows), `ComponentCheck` (a supply
check snapshot per item/component), `QaPhoto`, `Shipment`, `Invoice`.

SQLite is used for zero-config local development (`DATABASE_URL` in `.env`).
Swap the Prisma datasource to Postgres for a real deployment — nothing else
in the app assumes SQLite.

## Odoo integration — stubbed

`src/lib/odoo.ts` defines the exact functions the UI calls
(`fetchStockLevels`, `createMakeOrder`, `closeMakeOrder`) with mocked
responses. Set `ODOO_ENABLED=true` plus `ODOO_BASE_URL` / `ODOO_DB` /
`ODOO_API_KEY` in `.env` and replace each function body with the real
API call — no other code needs to change.

## Airtable

The current Airtable base wasn't reachable when this was built (the
connector needs re-authorizing), so the schema above was modeled from the
described workflow rather than the live base. Once Airtable is reachable,
compare its Products/Ingredients/Suppliers tables against `prisma/schema.prisma`
and adjust field names/mappings as needed — a one-time import script would be
the natural next step for migrating historical SKU data.

## Getting started

```bash
npm install
cp .env.example .env
npm run db:migrate   # creates dev.db and applies the schema
npm run db:seed      # loads sample Leven Rose / Private Label Co data
npm run dev
```

Visit `http://localhost:3000`.

## Known gaps / next steps

- No authentication or user roles yet (office vs. production-floor views).
- QA photos are written to local disk (`public/uploads`) — fine for a single
  server, but swap for blob storage before deploying anywhere ephemeral.
- Order-number/work-order-number generation is a timestamp+random code, not
  a sequential counter — fine for a shop-floor label, not for accounting.
- `npm audit` flags Next.js 14.2.x advisories that are largely about
  middleware/Server-Actions/Image-Optimizer attack surfaces this internal
  app doesn't use; a move to Next 15/16 is a deliberate future upgrade, not
  done here to avoid an unvalidated breaking change.
