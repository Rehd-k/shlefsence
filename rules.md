# ShelfSense Architecture & Development Rules

ShelfSense is a modern, enterprise-grade ERP web application designed for phone spare parts distributors and wholesalers. It is optimized for high-volume inventory management, multi-warehouse stock tracking, purchasing, and sales fulfillment.

---

## 1. Design System & UX Standards

### Aesthetics & Visual Tone
- **Design Inspiration**: Stripe, Linear, Notion, Ramp, Vercel, SAP Fiori.
- **Tone**: Professional, crisp, modern, minimal, enterprise-grade.
- **Theme**: Light mode primary (slate/zinc neutral palette with indigo/blue primary accents), dark mode ready.
- **Components**: Large rounded cards (`rounded-xl` or `rounded-2xl`), subtle borders (`border-slate-200`), soft shadows (`shadow-sm` / `shadow-md`), high clarity typography.

### Interactivity & Layout Rules
- **Density**: Data-dense without feeling cluttered. Use optimal padding (`px-4 py-3`), clear hierarchy, and truncation with tooltips where necessary.
- **Sticky Headers**: All data tables must use sticky column headers (`sticky top-0 bg-slate-50/90 backdrop-blur-xs z-10`).
- **Slide-over Drawers**: Prefer slide-over side panels over full page navigations for detail views, item movement histories, and audit logs.
- **Modal Dialogs**: Use modal dialogs for quick, focused operations (e.g., Stock Adjustments, Warehouses Transfers, Barcode Printing).
- **Keyboard Friendliness**: Include quick hotkeys (`Ctrl+K` for global search, `Esc` to close drawers/modals, `Shift+N` for creation).

---

## 2. Technical Stack & Component Conventions

### Core Stack
- **Framework**: Next.js (App Router, Server & Client Components)
- **UI & Styling**: React 19, Tailwind CSS v4, Lucide Icons (`lucide-react`)
- **Table System**: `@tanstack/react-table` for fast, headless, typed, and sortable tables
- **State & Data Fetching**: `@tanstack/react-query` & Zustand for client state management
- **Database**: MongoDB with Mongoose (`mongoose`)
- **Forms & Validation**: `react-hook-form` with `zod` resolvers
- **Utilities**: `clsx`, `tailwind-merge`, `date-fns`, `papaparse`, `xlsx`, `react-barcode`

### DRY & Reusability Rules
1. **No Ad-Hoc UI Duplication**: Always utilize shared UI primitives in `@/components/ui` (`Button`, `Input`, `Select`, `Badge`, `Card`, `Modal`, `Drawer`, `Table`, `Dropdown`, `Checkbox`, `Tabs`).
2. **Strict Component Separation**:
   - `components/ui/`: Dumb, presentation-only UI components with standard variants.
   - `components/layout/`: Layout shells, navigation bars, headers, sidebar.
   - `components/inventory/`: Feature-specific domain components.
3. **Type Safety**: Define TypeScript interfaces in `@/types` or adjacent model definitions. Never use `any`.

---

## 3. Database & Mongoose Rules

1. **Singleton Connection**: Always import the cached Mongoose connection helper from `@/lib/db/mongodb`. Never call `mongoose.connect()` directly inside API routes.
2. **Schemas**: Define strict Mongoose schemas with explicit defaults, index declarations for fast querying (e.g., indexes on `sku`, `brand`, `warehouse`, `status`), and timestamp options (`{ timestamps: true }`).
3. **Audit Logging**: Any stock modification (adjustment, transfer, receipt, damage) MUST create a corresponding `InventoryMovement` log entry for audit compliance.
4. **Calculated Fields**: Keep calculated properties (e.g., `available = quantity - reserved`) synced in schemas or computed in standard getters.

---

## 4. Domain Data Model (Phone Spare Parts Distribution)

The application manages:
- **Phone Parts**: Screens/OLEDs, Batteries, Charging Ports, Cameras, Back Glasses, Flex Cables, Housing, IC Chips.
- **Quality Grades**: OEM Original, Service Pack, Refurbished Grade A, Premium Aftermarket.
- **Warehouses**: Multi-location tracking (Main Hub, Regional Depots, Shelf/Bin locations like `A1-S3-B2`).
- **Inventory Metrics**: Total Stock Units, Inventory Value ($), Low Stock Alerts, Dead Stock (>90 days untouched), Incoming PO Stock.