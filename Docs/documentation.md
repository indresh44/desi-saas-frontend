# CRM SaaS Frontend — Full Project Documentation

> **Last updated:** March 2026  
> **Project:** `desi-saas-frontend`  
> **Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Versions](#2-tech-stack--versions)
3. [Folder Structure](#3-folder-structure)
4. [Environment Variables](#4-environment-variables)
5. [Hardcoded Values (Important)](#5-hardcoded-values-important)
6. [API Client — How Calls Work](#6-api-client--how-calls-work)
7. [API Endpoints Reference](#7-api-endpoints-reference)
8. [Type Definitions](#8-type-definitions)
9. [API Service Layer](#9-api-service-layer)
10. [React Hooks](#10-react-hooks)
11. [Components](#11-components)
12. [Pages & Routing](#12-pages--routing)
13. [Multi-Tenancy & Auth](#13-multi-tenancy--auth)
14. [Data Flow — Create Lead](#14-data-flow--create-lead)
15. [Data Flow — WhatsApp Chat](#15-data-flow--whatsapp-chat)
16. [Known Assumptions & TODOs](#16-known-assumptions--todos)
17. [Running the Project](#17-running-the-project)

---

## 1. Project Overview

A minimal CRM SaaS frontend built with Next.js App Router. Features built so far:

| Phase | Feature |
|-------|---------|
| Phase 1 | Project setup, layout shell, API client foundation |
| Phase 2 | Leads list table, create lead form, row action |
| Phase 3 | WhatsApp chat drawer (view + send messages) |
| Phase 4 | Customer-aware create lead flow — phone search, deduplication |
| Phase 5 | find-or-create conversation by lead — chat always opens |
| Phase 6 | Lead detail workspace — activity log, follow-ups, tasks, stage change |
| Phase 7 | Customers page — search, create customer, outstanding dues |
| Phase 8 | Invoices and payments — create invoice, record payment, receipt upload, attachment previews |

---

## 2. Tech Stack & Versions

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.1.6 | Framework (App Router, Turbopack) |
| `react` | 19.2.3 | UI library |
| `react-dom` | 19.2.3 | DOM rendering |
| `typescript` | via devDeps | Static typing |
| `tailwindcss` | v4 | Utility-first CSS |
| `@base-ui/react` | ^1.3.0 | Headless UI primitives (used in shadcn components) |
| `shadcn` | ^4.0.8 | Component scaffolding (base-nova style) |
| `@tanstack/react-table` | ^8.21.3 | Leads table |
| `react-hook-form` | ^7.71.2 | Form state management |
| `zod` | ^4.3.6 | Schema validation |
| `@hookform/resolvers` | ^5.2.2 | Zod ↔ RHF bridge |
| `lucide-react` | ^0.577.0 | Icons |
| `clsx` + `tailwind-merge` | latest | Class name utilities |
| `class-variance-authority` | ^0.7.1 | Variant-based styling |

**Build tool:** Turbopack (via `next build`)  
**Fonts:** Geist Sans + Geist Mono (Google Fonts, loaded in `app/layout.tsx`)

---

## 3. Folder Structure

```
desi-saas-frontend/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout — wraps everything in AppShell
│   ├── page.tsx                  # Dashboard route — renders DashboardClient
│   ├── globals.css               # Global CSS / Tailwind base
│   ├── customers/
│   │   └── page.tsx              # /customers route — renders CustomersPageClient
│   └── leads/
│       ├── page.tsx              # /leads route — renders LeadsPageClient
│       └── [id]/
│           └── page.tsx          # /leads/[id] route — renders LeadDetailClient
│
├── components/
│   ├── customers/
│   │   └── customers-page-client.tsx # Customers list, search, create, dues
│   ├── dashboard/
│   │   └── dashboard-client.tsx  # Dashboard cards + today's follow-ups
│   ├── layout/
│   │   ├── app-shell.tsx         # Outer layout wrapper (sidebar + header + content)
│   │   ├── app-header.tsx        # Top navigation bar
│   │   └── app-sidebar.tsx       # Left sidebar with nav links
│   ├── leads/
│   │   ├── leads-page-client.tsx # Main leads page (cards, filters, dialogs)
│   │   ├── lead-detail-client.tsx# Lead detail workspace — activity, follow-ups, tasks, invoices
│   │   ├── create-lead-dialog.tsx# Modal for creating a lead (customer resolution flow)
│   │   ├── create-invoice-modal.tsx # Modal for creating invoice line items
│   │   ├── invoice-card.tsx      # Invoice card with progress, payments, items
│   │   ├── record-payment-modal.tsx # Modal for recording a payment + receipt upload
│   │   ├── payment-attachment-preview.tsx # Payment receipt thumbnails / PDF pills
│   │   └── customer-phone-input.tsx # Phone input with debounced customer search
│   ├── whatsapp/
│   │   ├── lead-whatsapp-chat-drawer.tsx # Slide-in chat panel
│   │   ├── message-list.tsx      # Renders list of chat messages
│   │   └── message-composer.tsx  # Text input + send button
│   └── ui/
│       └── button.tsx            # shadcn Button component
│
├── hooks/
│   ├── use-lookup-maps.ts                # Fetches pipeline stages and builds stage map
│   ├── use-lead-whatsapp-conversation.ts # Fetches/creates conversation for a lead
│   └── use-whatsapp-messages.ts          # Fetches + sends messages for a conversation
│
├── lib/
│   ├── api/
│   │   ├── client.ts             # Core fetch wrapper (apiClient)
│   │   ├── activities.ts         # Lead activity API calls
│   │   ├── leads.ts              # Leads API calls
│   │   ├── customers.ts          # Customers API calls
│   │   ├── followups.ts          # Lead follow-up API calls
│   │   ├── invoices.ts           # Invoices, payments, attachments API calls
│   │   ├── pipelines.ts          # Pipelines and stage lookup API calls
│   │   ├── tasks.ts              # Lead task API calls
│   │   └── whatsapp.ts           # WhatsApp API calls
│   ├── constants/
│   │   ├── api.ts                # API_BASE_URL, DEFAULT_USER_ID, API_ENDPOINTS
│   │   └── navigation.ts         # SIDEBAR_NAV_ITEMS
│   ├── types/
│   │   ├── activity.ts           # Lead activity types
│   │   ├── api.ts                # ApiError, ApiResult generic types
│   │   ├── lead.ts               # Lead, LeadApiResponseItem, CreateLeadInput
│   │   ├── customer.ts           # Customer, CustomerByPhoneResponse, CreateCustomerInput
│   │   ├── followup.ts           # Follow-up types
│   │   ├── invoice.ts            # Invoice, payment, attachment types
│   │   ├── pipeline.ts           # Pipeline and stage types
│   │   ├── task.ts               # Task types
│   │   └── whatsapp.ts           # WhatsAppConversationRead, WhatsAppMessageRead, etc.
│   └── utils.ts                  # cn() helper (clsx + tailwind-merge)
│
├── Docs/
│   ├── documentation.md          # ← this file
│   └── phases/
│       ├── phase1.md
│       ├── phase2.md
│       └── phase3.md
│
├── .env.local.example            # Example env vars (copy to .env.local)
├── next.config.ts
├── tsconfig.json
├── components.json               # shadcn config
└── package.json
```

---

## 4. Environment Variables

Copy `.env.local.example` to `.env.local` before running locally.

```env
NEXT_PUBLIC_API_BASE_URL=https://<ngrok-or-production-url>
NEXT_PUBLIC_DEFAULT_USER_ID=<uuid-of-the-test-user>
```

| Variable | Purpose | Fallback if missing |
|----------|---------|-------------------|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL for all backend API calls | `http://172.105.53.206:8000` |
| `NEXT_PUBLIC_DEFAULT_USER_ID` | User ID sent in `X-User-Id` header | `ba61cf8f-d920-4bc0-88d0-b2773fd60a9d` |

> Both variables are prefixed `NEXT_PUBLIC_` so they are available in browser-side code.  
> Trailing slashes on `API_BASE_URL` are stripped automatically in `lib/constants/api.ts`.

---

## 5. Hardcoded Values (Important)

These values are currently hardcoded or have hardcoded fallbacks. They must be replaced when real authentication is introduced.

| What | Where | Current Value / Behavior |
|------|-------|--------------------------|
| **API base URL fallback** | `lib/constants/api.ts` | `http://172.105.53.206:8000` |
| **User ID fallback** | `lib/constants/api.ts` | `ba61cf8f-d920-4bc0-88d0-b2773fd60a9d` |
| **`business_id` on create lead** | `components/leads/create-lead-dialog.tsx` submit handler | Hardcoded as `""` (empty string) — no business selector exists yet |
| **`DEFAULT_USER_ID` export** | `lib/constants/api.ts` | Reads `NEXT_PUBLIC_DEFAULT_USER_ID` env var, falls back to the UUID above |
| **All API function user ID params** | `lib/api/leads.ts`, `lib/api/customers.ts`, `lib/api/whatsapp.ts`, `lib/api/pipelines.ts`, `lib/api/activities.ts`, `lib/api/followups.ts`, `lib/api/tasks.ts`, `lib/api/invoices.ts` | Default parameter `userId = DEFAULT_USER_ID` — caller rarely overrides this currently |
| **Messages page size** | `hooks/use-whatsapp-messages.ts` | `limit: 50, offset: 0` — no pagination implemented |
| **Customer search debounce** | `components/leads/customer-phone-input.tsx` | 400ms delay, minimum 3 characters before search fires |
| **Blur-close delay on dropdown** | `components/leads/customer-phone-input.tsx` | 150ms timeout to avoid blur-before-click race |
| **Receipt upload validation** | `components/leads/record-payment-modal.tsx` | Accepts JPG / PNG / PDF only, max size 10MB |

---

## 6. API Client — How Calls Work

**File:** `lib/api/client.ts`

All API calls go through `apiClient<T>()`. It:

1. Prepends `API_BASE_URL` to the path
2. Automatically sets `Content-Type: application/json` if a `body` is provided
3. Serializes `body` with `JSON.stringify()`
4. On non-2xx response → parses the error body, extracts `message` field, throws an `ApiError`
5. On success → returns `{ data: T, status: number }`

```ts
// Signature
apiClient<T>(path: string, init?: ApiRequestInit): Promise<ApiResult<T>>

// ApiResult<T>
{ data: T; status: number }

// ApiError
{ message: string; status: number }
```

**Authentication header** is NOT set inside `apiClient`. Each service function is responsible for passing it:

```ts
// Pattern used everywhere
function getUserHeader(userId: string) {
  return { "X-User-Id": userId || DEFAULT_USER_ID };
}
// Passed as: headers: getUserHeader(userId)
```

**Query string helper** (`withQuery`) is defined locally in multiple API files (`lib/api/customers.ts`, `lib/api/whatsapp.ts`, `lib/api/pipelines.ts`, `lib/api/followups.ts`, `lib/api/tasks.ts`, `lib/api/invoices.ts`). It skips `undefined` and empty-string values.

**Multipart uploads** are not sent through `apiClient`. `uploadAttachment()` in `lib/api/invoices.ts` uses `fetch()` directly with `FormData` so the browser can set the multipart boundary automatically.

---

## 7. API Endpoints Reference

All constants live in `lib/constants/api.ts` under `API_ENDPOINTS`.

| Constant Key | Path | Used In |
|---|---|---|
| `leads` | `GET/POST /api/v1/leads` | `lib/api/leads.ts` |
| `customersSearch` | `GET /api/v1/customers/search?query=` | `lib/api/customers.ts` |
| `customersByPhone` | `GET /api/v1/customers/by-phone?phone=` | `lib/api/customers.ts` |
| `customers` | `GET/POST /api/v1/customers` | `lib/api/customers.ts` |
| `whatsappConversations` | `GET /api/v1/whatsapp/conversations` | `lib/api/whatsapp.ts` (legacy fetch) |
| `whatsappMessages` | `GET /api/v1/whatsapp/conversations/{id}/messages` | `lib/api/whatsapp.ts` |
| `whatsappSendText` | `POST /api/v1/whatsapp/messages/text` | `lib/api/whatsapp.ts` |
| `whatsappFindOrCreate` | `POST /api/v1/whatsapp/conversations/find-or-create-by-lead` | `lib/api/whatsapp.ts` |
| `pipelines` | `GET /api/v1/pipelines` | `lib/api/pipelines.ts` |
| `pipelineStages` | `GET /api/v1/pipeline-stages` | `lib/api/pipelines.ts` |
| `leadFollowUps` | `GET/POST /api/v1/lead_followups` | `lib/api/followups.ts` |
| `leadFollowUpsToday` | `GET /api/v1/lead_followups/today` | `lib/api/followups.ts` |
| `leadActivities` | `Nested under /api/v1/leads/{id}/activities` | `lib/api/activities.ts` |
| `invoices` | `GET/POST /api/v1/invoices` | `lib/api/invoices.ts` |
| `payments` | `GET/POST /api/v1/payments` | `lib/api/invoices.ts` |
| `tasks` | `GET/POST/PATCH /api/v1/tasks` | `lib/api/tasks.ts` |
| `customerOutstanding` | `GET /api/v1/customers/{id}/outstanding` | `lib/api/invoices.ts` |

### Full request details

#### Leads
```
GET  /api/v1/leads
Headers: X-User-Id
Response: LeadApiResponseItem[]

POST /api/v1/leads
Headers: X-User-Id, Content-Type: application/json
Body: { customer_id, stage_id, title, source, event_date, estimated_value, assigned_to, notes, business_id }
Response: LeadApiResponseItem
```

#### Customers
```
GET  /api/v1/customers
Headers: X-User-Id
Response: Customer[]

GET  /api/v1/customers/search?query=<string>
Headers: X-User-Id
Response: Customer[]

GET  /api/v1/customers/by-phone?phone=<string>
Headers: X-User-Id
Response: { found: boolean, customer: Customer | null }

POST /api/v1/customers
Headers: X-User-Id, Content-Type: application/json
Body: { name, phone, email? }
Response: Customer

GET  /api/v1/customers/<id>/outstanding
Headers: X-User-Id
Response: { total_invoiced, total_paid, outstanding, overdue_invoices }
```

#### Pipelines
```
GET  /api/v1/pipelines
Headers: X-User-Id
Response: Pipeline[]

GET  /api/v1/pipeline-stages
Headers: X-User-Id
Response: PipelineStage[]

GET  /api/v1/pipeline-stages?pipeline_id=<uuid>
Headers: X-User-Id
Response: PipelineStage[]
```

#### Activities
```
GET  /api/v1/leads/<lead_id>/activities
Headers: X-User-Id
Response: LeadActivity[]

POST /api/v1/leads/<lead_id>/activities
Headers: X-User-Id, Content-Type: application/json
Body: { lead_id, type, description }
Response: LeadActivity
```

#### Follow-ups
```
GET  /api/v1/lead_followups?lead_id=<uuid>
Headers: X-User-Id
Response: LeadFollowUp[]

GET  /api/v1/lead_followups/today
Headers: X-User-Id
Response: LeadFollowUp[]

POST /api/v1/lead_followups
Headers: X-User-Id, Content-Type: application/json
Body: { lead_id, scheduled_at, note? }
Response: LeadFollowUp

PATCH /api/v1/lead_followups/<id>/done
Headers: X-User-Id, Content-Type: application/json
Body: {}
Response: LeadFollowUp
```

#### Tasks
```
GET  /api/v1/tasks?lead_id=<uuid>
Headers: X-User-Id
Response: Task[]

POST /api/v1/tasks
Headers: X-User-Id, Content-Type: application/json
Body: { lead_id, title, assigned_to, priority, status, due_date? }
Response: Task

PATCH /api/v1/tasks/<id>
Headers: X-User-Id, Content-Type: application/json
Body: { status }
Response: Task
```

#### Invoices / Payments / Attachments
```
GET  /api/v1/invoices?lead_id=<uuid>
Headers: X-User-Id
Response: Invoice[]

POST /api/v1/invoices
Headers: X-User-Id, Content-Type: application/json
Body: {
  invoice: { lead_id, total_amount, status, issued_date, due_date },
  items: [{ description, quantity, unit_price, gst_percent }]
}
Response: Invoice

GET  /api/v1/payments?invoice_id=<uuid>
Headers: X-User-Id
Response: Payment[]

POST /api/v1/payments
Headers: X-User-Id, Content-Type: application/json
Body: { invoice_id, amount, payment_method, payment_date, reference? }
Response: Payment

GET  /api/v1/attachments?entity_type=payment&entity_id=<payment_id>
Headers: X-User-Id
Response: PaymentAttachment[]

POST /api/v1/attachments/upload
Headers: X-User-Id, multipart/form-data
Body: FormData { file, entity_type, entity_id }
Response: { id, file_url, filename }
```

#### WhatsApp
```
GET  /api/v1/whatsapp/conversations?lead_id=<uuid>
Headers: X-User-Id
Response: WhatsAppConversationRead[]

GET  /api/v1/whatsapp/conversations/<id>/messages?limit=50&offset=0
Headers: X-User-Id
Response: WhatsAppMessageRead[]

POST /api/v1/whatsapp/messages/text
Headers: X-User-Id, Content-Type: application/json
Body: { conversation_id: string, text: string }
Response: WhatsAppMessageRead

POST /api/v1/whatsapp/conversations/find-or-create-by-lead
Headers: X-User-Id, Content-Type: application/json
Body: { lead_id: string }
Response: WhatsAppConversationRead
```

---

## 8. Type Definitions

### `lib/types/api.ts`
```ts
ApiError  { message: string; status: number }
ApiResult<T> { data: T; status: number }
```

### `lib/types/lead.ts`
```ts
// Raw shape from backend (snake_case)
LeadApiResponseItem {
  id, customer_id, business_id, stage_id, title, source,
  event_date, estimated_value, assigned_to, notes, created_at, updated_at
}

// Frontend model (camelCase)
Lead {
  id, customerId, businessId, stageId, title, source,
  eventDate, estimatedValue, assignedTo, notes, createdAt, updatedAt
}

// Form submit payload
CreateLeadInput {
  customerId, stageId, title, source, eventDate,
  estimatedValue, assignedTo?: string | null, notes, businessId
}
```

The mapping from `LeadApiResponseItem` → `Lead` is done in `toLeadModel()` inside `lib/api/leads.ts`.  
The mapping from form values → API payload is done in `toCreateLeadPayload()` inside `lib/api/leads.ts`.

### `lib/types/customer.ts`
```ts
Customer { id, name, phone, email: string | null }
CustomerByPhoneResponse { found: boolean; customer: Customer | null }
CreateCustomerInput { name, phone, email?: string | null }
```

### `lib/types/activity.ts`
```ts
LeadActivity { id, leadId, type, description, createdBy, createdAt }
CreateActivityInput { lead_id, type, description }
```

### `lib/types/followup.ts`
```ts
LeadFollowUp {
  id, leadId, scheduledAt, note, status,
  createdBy, createdAt, completedAt,
  leadTitle?, customerName?, customerPhone?
}
CreateFollowUpInput { lead_id, scheduled_at, note? }
```

### `lib/types/task.ts`
```ts
Task {
  id, businessId, leadId, title, assignedTo,
  status, dueDate, priority, createdAt
}
CreateTaskInput { lead_id, title, assigned_to, priority, status, due_date? }
```

### `lib/types/pipeline.ts`
```ts
Pipeline { id, name, businessId, createdAt }
PipelineStage { id, pipelineId, name, position, color }
```

### `lib/types/invoice.ts`
```ts
InvoiceItem { id, invoiceId, description, quantity, unitPrice, gstPercent, amount }

Invoice {
  id, businessId, leadId, bookingId,
  invoiceNumber, totalAmount, status,
  issuedDate, dueDate, createdAt,
  items?
}

CreateInvoiceInput {
  invoice: { lead_id, total_amount, status, issued_date, due_date }
  items: [{ description, quantity, unit_price, gst_percent }]
}

Payment {
  id, invoiceId, amount, paymentMethod,
  paymentDate, reference, createdAt
}

CreatePaymentInput {
  invoice_id, amount, payment_method, payment_date, reference?
}

PaymentAttachment { id, filename, file_url, file_size, created_at }
CustomerOutstanding { total_invoiced, total_paid, outstanding, overdue_invoices }
```

### `lib/types/whatsapp.ts`
```ts
WhatsAppConversationRead {
  id, lead_id: string | null, customer_id: string | null,
  phone_number, contact_name: string | null,
  last_message_at: string | null, is_blocked: boolean,
  created_at, updated_at
}

WhatsAppMessageRead {
  id, conversation_id, direction: "incoming" | "outgoing",
  message_type, text_body: string | null,
  status: "pending"|"accepted"|"sent"|"delivered"|"read"|"failed",
  error_message, sent_at, delivered_at, read_at, failed_at,
  created_at, updated_at
}

SendWhatsAppTextInput { conversation_id: string; text: string }
```

> **Note:** WhatsApp types use `snake_case` field names — they are not converted, used directly from the API response.

> **Note:** `Invoice.invoiceNumber` is returned by the backend response. `CreateInvoiceInput` does **not** send `invoice_number` from the frontend.

---

## 9. API Service Layer

### `lib/api/leads.ts`
| Function | HTTP | Notes |
|---|---|---|
| `fetchLeads(userId?)` | `GET /api/v1/leads` | Returns `Lead[]` (camelCase mapped) |
| `createLead(input, userId?)` | `POST /api/v1/leads` | Returns `Lead \| null` |

### `lib/api/customers.ts`
| Function | HTTP | Notes |
|---|---|---|
| `fetchCustomers(userId?)` | `GET /api/v1/customers` | Returns `Customer[]` |
| `searchCustomers(query, userId?)` | `GET /api/v1/customers/search` | Returns `Customer[]` |
| `getCustomerByPhone(phone, userId?)` | `GET /api/v1/customers/by-phone` | Returns `CustomerByPhoneResponse` |
| `createCustomer(input, userId?)` | `POST /api/v1/customers` | Returns `Customer` |
| `fetchCustomerOutstanding(customerId, userId?)` | `GET /api/v1/customers/{id}/outstanding` | Returns outstanding totals |

### `lib/api/pipelines.ts`
| Function | HTTP | Notes |
|---|---|---|
| `fetchPipelines(userId?)` | `GET /api/v1/pipelines` | Returns `Pipeline[]` |
| `fetchPipelineStages(pipelineId, userId?)` | `GET /api/v1/pipeline-stages?pipeline_id=` | Returns `PipelineStage[]` |
| `fetchAllStages(userId?)` | `GET /api/v1/pipeline-stages` | Used by `useLookupMaps()` |

### `lib/api/activities.ts`
| Function | HTTP | Notes |
|---|---|---|
| `fetchLeadActivities(leadId, userId?)` | `GET /api/v1/leads/{id}/activities` | Returns `LeadActivity[]` |
| `createActivity(input, userId?)` | `POST /api/v1/leads/{id}/activities` | Returns `LeadActivity` |

### `lib/api/followups.ts`
| Function | HTTP | Notes |
|---|---|---|
| `fetchTodaysFollowUps(userId?)` | `GET /api/v1/lead_followups/today` | Used by dashboard |
| `fetchLeadFollowUps(leadId, userId?)` | `GET /api/v1/lead_followups?lead_id=` | Returns `LeadFollowUp[]` |
| `createFollowUp(input, userId?)` | `POST /api/v1/lead_followups` | Returns `LeadFollowUp` |
| `markFollowUpDone(id, input, userId?)` | `PATCH /api/v1/lead_followups/{id}/done` | Marks follow-up complete |

### `lib/api/tasks.ts`
| Function | HTTP | Notes |
|---|---|---|
| `fetchLeadTasks(leadId, userId?)` | `GET /api/v1/tasks?lead_id=` | Returns `Task[]` |
| `createTask(input, userId?)` | `POST /api/v1/tasks` | Returns `Task` |
| `updateTask(id, data, userId?)` | `PATCH /api/v1/tasks/{id}` | Used for marking tasks done |

### `lib/api/invoices.ts`
| Function | HTTP | Notes |
|---|---|---|
| `fetchLeadInvoices(leadId, userId?)` | `GET /api/v1/invoices?lead_id=` | Returns `Invoice[]` for one lead |
| `createInvoice(input, userId?)` | `POST /api/v1/invoices` | Returns created `Invoice` |
| `fetchCustomerOutstanding(customerId, userId?)` | `GET /api/v1/customers/{id}/outstanding` | Outstanding dues summary |
| `fetchInvoicePayments(invoiceId, userId?)` | `GET /api/v1/payments?invoice_id=` | Returns `Payment[]` |
| `createPayment(input, userId?)` | `POST /api/v1/payments` | Returns created `Payment` |
| `fetchPaymentAttachments(paymentId, userId?)` | `GET /api/v1/attachments?entity_type=payment&entity_id=` | Returns stored receipt attachments |
| `uploadAttachment(entityType, entityId, file, userId?)` | `POST /api/v1/attachments/upload` | Uses `FormData` for receipt upload |

### `lib/api/whatsapp.ts`
| Function | HTTP | Notes |
|---|---|---|
| `fetchLeadConversation(leadId, userId?)` | `GET /api/v1/whatsapp/conversations?lead_id=` | Returns first result or `null`; legacy, not used in active chat flow |
| `fetchConversationMessages(id, opts?)` | `GET /api/v1/whatsapp/conversations/{id}/messages` | Default limit 50, offset 0 |
| `findOrCreateConversationByLead(leadId, userId?)` | `POST /api/v1/whatsapp/conversations/find-or-create-by-lead` | Active chat flow; always returns a conversation |
| `sendWhatsAppText(input, userId?)` | `POST /api/v1/whatsapp/messages/text` | Returns sent `WhatsAppMessageRead` |

---

## 10. React Hooks

### `hooks/use-lookup-maps.ts`

Loads pipeline stages once and exposes a `stageMap` dictionary used by the leads list and lead detail page.

**Signature:**
```ts
useLookupMaps()
→ { stageMap, isLoading }
```

**Behavior:**
- Calls `fetchAllStages()` on mount
- Converts the stage array into `Record<string, PipelineStage>` for cheap lookup by `stageId`
- Used for stage names, colors, and stage filter options

### `hooks/use-lead-whatsapp-conversation.ts`

Manages loading (or creating) a WhatsApp conversation for a given lead.

**Signature:**
```ts
useLeadWhatsAppConversation(leadId: string | null, isEnabled: boolean)
→ { conversation, isLoading, error, refreshConversation }
```

**Behavior:**
- Calls `findOrCreateConversationByLead(leadId)` when `isEnabled && leadId` are truthy
- Re-runs whenever `leadId` or `isEnabled` changes
- `refreshConversation` is exposed for the Refresh button in the drawer
- On 400 error (e.g. no phone): surfaces the backend error message directly
- On unknown error: shows `"Unable to open chat. Please try again."`

---

### `hooks/use-whatsapp-messages.ts`

Manages message list and sending for a conversation.

**Signature:**
```ts
useWhatsAppMessages(conversationId: string | null, isEnabled: boolean)
→ { messages, isLoading, isSending, error, refreshMessages, sendMessage }
```

**Behavior:**
- Loads messages on mount / when `conversationId` changes (50 at a time, no pagination)
- Sorts messages ascending by `created_at`
- `sendMessage(text)`: calls `sendWhatsAppText`, appends the returned message to local state (no full re-fetch)
- `isSending` flag disables the composer during send

---

## 11. Components

### Layout

**`components/layout/app-shell.tsx`**  
Outer wrapper. Renders `AppHeader` + `AppSidebar` + main content area. Wraps all pages via `app/layout.tsx`.

**`components/layout/app-header.tsx`**  
Top bar with app title.

**`components/layout/app-sidebar.tsx`**  
Left nav sidebar (hidden on mobile). Reads `SIDEBAR_NAV_ITEMS` from `lib/constants/navigation.ts`. Active state detected via `usePathname()`. Current app navigation includes Dashboard, Leads, and Customers.

---

### Dashboard

**`components/dashboard/dashboard-client.tsx`**  
Home page dashboard. Fetches total leads and today's follow-ups, shows summary cards, lists pending follow-ups, and allows marking a follow-up as done.

---

### Customers

**`components/customers/customers-page-client.tsx`**  
Main client component for `/customers`. Responsibilities:
- Fetches all customers via `fetchCustomers()`
- Loads each customer's outstanding balance via `fetchCustomerOutstanding()`
- Supports search by name or phone
- Inline create-customer form with name, phone, email
- Quick WhatsApp deep-link action to `wa.me`

---

### Leads

**`components/leads/leads-page-client.tsx`**  
Main client component for `/leads`. Responsibilities:
- Fetches and displays leads as responsive cards
- Search by title / source / customer name / customer phone
- Stage filter using `useLookupMaps()`
- "Add Lead" button → opens `CreateLeadDialog`
- "Show Chat" button in each row → opens `LeadWhatsAppChatDrawer`
- "View Details" button → navigates to `/leads/[id]`
- Passes `loadLeads` as `onCreated` to dialog so table refreshes on create

Each lead card shows: title, customer, stage badge, source, service date, estimated value, and action buttons.

---

**`components/leads/create-lead-dialog.tsx`**  
Modal dialog for creating a new lead. Multi-step customer resolution flow:

1. User types phone → `CustomerPhoneInput` searches for existing customers
2. If user picks existing → `customerMode = "existing"`, name/email locked
3. If no match / user ignores → `customerMode = "new"`, name required

**Submit flow:**
1. If `selectedCustomer` already set → use its `id`
2. Else → call `getCustomerByPhone(phone)`
   - If found → use that customer's id (sets `customerMode = "existing"`)
   - If not found → call `createCustomer({ name, phone, email })` → use new id
3. Call `createLead({ ...formValues, customerId, businessId: "" })`
4. On success → call `onCreated()` (refreshes table) + close dialog

**Zod schema highlights:**
- `customerName` is only required when `customerMode === "new"` (via `superRefine`)
- `customerEmail` accepts empty string or valid email
- `eventDate` is `type="date"` (plain `YYYY-MM-DD`) — backend rejects datetime strings

---

**`components/leads/customer-phone-input.tsx`**  
Controlled input that shows a dropdown of matching customers.

- Debounce: 400ms, minimum 3 characters
- Dropdown `onMouseDown` + `event.preventDefault()` prevents blur firing before click
- 150ms blur timeout for natural close
- When a customer is selected: shows confirmation chip with Clear button
- Typing a different phone after selection → auto-calls `onClearSelection`

---

**`components/leads/lead-detail-client.tsx`**  
Main client component for `/leads/[id]`. Responsibilities:
- Fetches one lead indirectly from `fetchLeads()` and filters by the route id
- Fetches lead-specific activities, follow-ups, tasks, and invoices
- Supports stage changes via `moveLeadStage()`
- Opens `CreateInvoiceModal` for invoice creation
- Renders `InvoiceCard` for each invoice
- Opens WhatsApp drawer from the customer card

Sections rendered: header, activity log, invoices, customer card, follow-ups, tasks.

---

**`components/leads/create-invoice-modal.tsx`**  
Modal dialog for creating a new invoice for a lead.

- User adds one or more line items
- Total is calculated client-side from quantity, unit price, and GST
- Due date is required
- Frontend sends `lead_id`, totals, status, issued date, due date, and invoice items
- `invoice_number` is **not** entered by the user; it comes back from the backend response

---

**`components/leads/invoice-card.tsx`**  
Displays a single invoice on the lead detail page.

- Header shows invoice number, status badge, due date, and total amount
- Progress bar shows paid vs total using fetched payment history
- Line items table is collapsible
- Payments section loads payments per invoice on mount
- Opens `RecordPaymentModal` when invoice status is not `paid`
- After payment success, reloads payments and triggers invoice refresh in the parent

---

**`components/leads/record-payment-modal.tsx`**  
Modal dialog for recording a payment against an invoice.

- Fields: amount, payment method, payment date, reference, optional receipt file
- Validates amount > 0 and amount <= remaining balance
- Validates receipt type (JPG / PNG / PDF) and size (max 10MB)
- Calls `createPayment()` then optional `uploadAttachment("payment", payment.id, file)`

---

**`components/leads/payment-attachment-preview.tsx`**  
Loads stored receipt attachments for a payment and renders:
- image thumbnails for JPG / JPEG / PNG
- pill links for PDFs
- nothing when no attachments exist

---

### WhatsApp

**`components/whatsapp/lead-whatsapp-chat-drawer.tsx`**  
Slide-in panel from the right. Opens when "Show Chat" is clicked on a lead row.

- Uses `useLeadWhatsAppConversation` + `useWhatsAppMessages`
- Header: `contact_name || phone_number || "WhatsApp Chat"`
- Sub-header: phone number + "(Blocked)" badge if blocked
- Shows spinner while loading conversation or messages
- Error state: shows backend error message; if error contains "phone" → also shows hint to update customer profile
- Messages: rendered by `MessageList`
- Composer disabled when: no conversation, blocked, has error
- Escape key closes the drawer
- Refresh button calls `refreshConversation()` then `refreshMessages()`

**`components/whatsapp/message-list.tsx`**  
Renders messages. Incoming → left-aligned. Outgoing → right-aligned with status. Non-text message types show "Unsupported message type: X".

**`components/whatsapp/message-composer.tsx`**  
Text input + Send button. Calls `onSend(text)`. Disabled when empty / sending / blocked / no conversation.

---

## 12. Pages & Routing

| Route | File | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Dashboard route → `<DashboardClient />` |
| `/customers` | `app/customers/page.tsx` | Thin wrapper → `<CustomersPageClient />` |
| `/leads` | `app/leads/page.tsx` | Thin wrapper → `<LeadsPageClient />` |
| `/leads/[id]` | `app/leads/[id]/page.tsx` | Thin wrapper → `<LeadDetailClient leadId={id} />` |
| `/_not-found` | Auto-generated | Next.js default |

Page files are thin route wrappers. Data fetching for business data happens client-side inside components and hooks.

---

## 13. Multi-Tenancy & Auth

**Current state: No real authentication.**

The backend uses `X-User-Id` header to identify the user and derive the `business_id` for data scoping. The frontend:

- Reads `NEXT_PUBLIC_DEFAULT_USER_ID` from env
- Falls back to hardcoded UUID `ba61cf8f-d920-4bc0-88d0-b2773fd60a9d`
- Passes it as `{ "X-User-Id": userId }` on every API request

Every API service function accepts an optional `userId` parameter that defaults to `DEFAULT_USER_ID`. Currently, no call site overrides this default — every call uses the env/fallback value.

**What needs to change for real auth:**
- Add an auth provider (e.g. NextAuth, Clerk)
- Replace `DEFAULT_USER_ID` with the authenticated user's ID
- Remove hardcoded fallback UUIDs
- Replace `businessId: ""` in `create-lead-dialog.tsx` with actual business ID from session

---

## 14. Data Flow — Create Lead

```
User opens "Add Lead" dialog
  │
  ▼
Types phone number
  │
  ▼ (debounced 400ms, min 3 chars)
searchCustomers(phone) → GET /api/v1/customers/search?query=<phone>
  │
  ├── Results found → dropdown shown
  │     └── User selects → customerMode = "existing"
  │                        name/email locked from customer record
  │
  └── No results → "No customer found — will create new"
                   User fills Name + Email manually
                   customerMode = "new"

User fills: Title, Source, Stage, Event Date, Estimated Value, Notes
  │
  ▼
Submit
  │
  ├── [existing] selectedCustomer.id → skip customer lookup
  │
  └── [new] getCustomerByPhone(phone)
              ├── found → use existing id (deduplication)
              └── not found → createCustomer({ name, phone, email })
                                  GET /api/v1/customers/by-phone?phone=
                                  POST /api/v1/customers

  ▼
createLead({ customerId, ...formValues, businessId: "" })
  POST /api/v1/leads

  ▼
onCreated() → fetchLeads() → table refreshes
Dialog closes
```

---

## 15. Data Flow — WhatsApp Chat

```
User clicks "Show Chat" on a lead row
  │
  ▼
LeadWhatsAppChatDrawer opens (isOpen = true, lead = selected lead)
  │
  ▼
useLeadWhatsAppConversation(lead.id, true)
  │
  ▼
findOrCreateConversationByLead(leadId)
  POST /api/v1/whatsapp/conversations/find-or-create-by-lead
  Body: { lead_id: uuid }
  │
  ├── Backend finds existing conversation for that lead → returns it
  ├── Backend finds conversation by phone (different lead) → reassigns → returns it
  └── Backend creates new conversation → returns it
  │
  ▼
conversation set in state
  │
  ▼
useWhatsAppMessages(conversation.id, true)
  │
  ▼
fetchConversationMessages(conversation.id, { limit: 50, offset: 0 })
  GET /api/v1/whatsapp/conversations/<id>/messages
  │
  ▼
Messages sorted ascending by created_at → rendered in MessageList

User types message → MessageComposer
  │
  ▼
sendWhatsAppText({ conversation_id, text })
  POST /api/v1/whatsapp/messages/text
  │
  ▼
Returned message appended to local messages array (no re-fetch)

User clicks Refresh → refreshConversation() + refreshMessages()
User presses Escape or clicks overlay → drawer closes
```

**Error cases:**
| Scenario | Backend response | UI |
|---|---|---|
| Customer has no phone | 400 "Customer phone number is required..." | Error shown with hint to update customer |
| Any other API failure | 4xx/5xx | "Unable to open chat. Please try again." |
| Conversation is blocked | `is_blocked: true` | Composer disabled, amber notice shown |

---

## 16. Known Assumptions & TODOs

| # | Item | Location | Notes |
|---|------|----------|-------|
| 1 | `business_id` sent as `""` | `create-lead-dialog.tsx` submit handler | No business selector built yet; backend must handle or default |
| 2 | No real auth | All API service files | All calls use `DEFAULT_USER_ID` env var / fallback |
| 3 | No pagination on messages | `use-whatsapp-messages.ts` | Fixed at `limit: 50, offset: 0` |
| 4 | No pagination on leads | `leads-page-client.tsx` | All leads loaded in one request |
| 5 | No pagination on invoices / payments | `lead-detail-client.tsx`, `invoice-card.tsx` | Lead invoices and invoice payments are loaded as full lists |
| 6 | `fetchLeadConversation` still in `whatsapp.ts` | `lib/api/whatsapp.ts` | Legacy function kept but not used in active flow; can be removed |
| 7 | Lead reassignment on find-or-create | Backend TODO comment | Currently unconditional; future: only reassign if existing lead is closed |
| 8 | WhatsApp account selection | Backend | Frontend sends no account ID; backend picks first/default account |
| 9 | No optimistic updates | Most create/send flows | Forms are disabled during submit; data is refreshed after success |
| 10 | No real-time / WebSocket | WhatsApp chat, invoices | Messages and payment history update on manual refresh or after local success paths |
| 11 | Attachment preview types limited | `payment-attachment-preview.tsx` | Only image and PDF attachments render; unknown file types are skipped |

---

## 17. Running the Project

### Prerequisites
- Node.js installed (location on this machine: `C:\Program Files\nodejs`)
- Backend running (locally or via ngrok)

### Setup
```powershell
# If Node is not in PATH (Windows):
$env:Path = "C:\Program Files\nodejs;" + $env:Path

# Navigate to project
Set-Location "c:\Users\HP\Documents\desi-saas-frontend"

# Install dependencies (first time only)
npm.cmd install

# Copy and fill env vars
copy .env.local.example .env.local
# Edit .env.local with your API URL and user ID
```

### Dev server
```powershell
npm.cmd run dev
# App available at http://localhost:3000
```

### Production build
```powershell
npm.cmd run build
npm.cmd run start
```

### Lint
```powershell
npm.cmd run lint
```

### Routes after build
```
Route (app)
├ ○ /
├ ○ /customers
├ ○ /leads
├ dynamic /leads/[id]
└ ○ /_not-found
```
Business data fetching is client-side inside the page components and hooks.
