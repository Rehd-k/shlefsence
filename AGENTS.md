<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ShelfSense Agent Architecture & Module Development Rules

When creating or expanding any module in ShelfSense, you MUST follow this end-to-end architecture pipeline:

## 1. Zero Hardcoded Data Rule
- NEVER create UI pages or views that rely on hardcoded static data arrays.
- All domain data (products, inventory, sales, invoices, POS catalog, POs, suppliers, warehouses, warranty claims) MUST be driven by Mongoose database models and fetched via REST API handlers.

## 2. End-to-End Module Pipeline
Every new feature or module must be built through all 4 layers:

1. **Database / Mongoose Model (`lib/models/`)**:
   - Define a strict TypeScript interface extending `Document`.
   - Define a Mongoose Schema with explicit types, defaults, required fields, and indexes (`{ index: true }`).
   - Register model using cached `mongoose.models.<ModelName> || mongoose.model(...)`.

2. **API Route Handler (`app/api/<module>/route.ts`)**:
   - Always call `await connectToDatabase()` using the cached helper at `@/lib/db/mongodb`.
   - Implement standard REST handlers (`GET`, `POST`, `PUT`, `DELETE`).
   - Format response JSON with `{ success: true, data: ... }`.

3. **Seeding Logic (`app/api/seed/route.ts`)**:
   - Include auto-seeding logic in `/api/seed` for initial or reset dataset population.

4. **UI Components & Pages (`app/<module>/page.tsx` & `components/<module>/`)**:
   - Fetch data dynamically on mount or via state/query hooks from the API handler.
   - Support live creation and mutation operations wired to API `POST`/`PUT` endpoints with instant UI feedback (toasts, optimistic updates).
