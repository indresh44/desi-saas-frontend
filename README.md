# SellNSettle — Frontend

Next.js frontend for **SellNSettle**, a chat-first AI CRM for Indian MSMEs (interior designers, photographers, coaches, contractors) in Tier 2/3 cities. Users run their whole business cycle — enquiry → follow-up → quote → invoice → payment — by chatting in Hindi, English, or Hinglish, backed by a traditional CRM UI underneath.

Backend repo: `crm-saas-backend` (FastAPI).

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Forms/validation:** react-hook-form + zod
- **PDF preview:** react-pdf (inline invoice/estimate preview in chat)
- **PWA:** Serwist (service worker, installable app)
- **Fonts:** Plus Jakarta Sans (headings), Inter (body), Geist Mono (code)

## Architecture

- `app/` — routes (App Router). Thin `page.tsx` server wrappers handle metadata/SEO; the actual UI lives in client components.
- `components/<feature>/*-client.tsx` — page-level client components (leads, invoices, payments, customers, catalog, chat, admin, …)
- `lib/api/*.ts` — API service layer, all calls go through a shared `apiClient<T>()` with Bearer token auth
- `lib/types/*.ts` — TypeScript types shared across the app
- `AppShell` wraps every authenticated route

### Chat AI

The chat surface (`components/chat/`, `components/agent-chat/`) talks to the backend's 32-tool agent. Read-only questions ("what's overdue this month?") execute immediately; write operations (create invoice, record payment, etc.) come back as a prefilled form the user reviews and confirms before anything is written — no silent writes from the LLM.

### Invoice-as-Quote

There's no separate "Quote" entity. An invoice in `draft`/`sent` status renders as an **Estimate**; once `approved` it becomes a **Tax Invoice**. Status flow: `draft → sent → approved → partial → paid`, with `cancelled` as a terminal pre-payment void state and `overdue` computed on the fly (never stored).

## Running Locally

Requires Node 20+.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Points the frontend at a running instance of the backend repo. No other env vars are required for local dev.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (Webpack — see `next.config.ts` for why Turbopack isn't used) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Status

This was a solo-founder side project; the hosted app is no longer running. This repo is shared as a code sample.
