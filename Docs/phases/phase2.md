# Phase 2 - Leads Page Feature

Date: 2026-03-16
Status: Completed

## Goal
Build the Leads page on top of the Phase 1 foundation. Includes a live lead list table, a create lead form with validation, and a row-level Show Chat placeholder action button wired to Phase 3.

## What was completed

### 1) Lead types updated to match backend contract
Replaced the Phase 1 placeholder Lead type with types that match the real backend API shape.

Key file: lib/types/lead.ts

Types added:
- LeadApiResponseItem — raw snake_case shape returned by GET /api/v1/leads
- Lead — camelCase frontend model used in UI and table
- CreateLeadInput — form payload model with optional assignedTo

### 2) API constants corrected
- Updated leads endpoint from /api/leads to /api/v1/leads
- Added DEFAULT_USER_ID constant with fallback to "demo-user-1"
- Added NEXT_PUBLIC_DEFAULT_USER_ID to .env.local.example

Key file: lib/constants/api.ts

### 3) Leads API module added
Added a typed leads API module with two functions:

- fetchLeads(userId) — GET /api/v1/leads with required X-User-Id header, maps API response to frontend Lead model
- createLead(input, userId) — POST /api/v1/leads with X-User-Id header, translates CreateLeadInput to snake_case backend payload

Key file: lib/api/leads.ts

Mapping decisions:
- All snake_case API fields are mapped to camelCase on fetch
- assignedTo is optional — sent as null when not provided
- event_date is sent as a plain date string (YYYY-MM-DD) to match backend date validation

### 4) Leads page client UI built
Replaced the placeholder route with a full client-side feature component.

Key files:
- app/leads/page.tsx (thin server route wrapper)
- components/leads/leads-page-client.tsx (all UI logic)

Features:
- Lead list table using TanStack Table (getCoreRowModel)
- Columns: Title, Source, Stage, Assigned To, Estimated Value, Event Date, Action
- Loading state row while fetching
- Empty state row when no leads exist
- Error banner if fetch or create fails
- Create Lead button (toggles inline create form)
- Create Lead form with validation using React Hook Form + Zod
- Cancel button resets form and collapses form panel
- On successful create, form resets and lead list auto-refreshes

### 5) Create Lead form fields
Fields included in form:
- Title (required)
- Source (required)
- Stage ID (optional)
- Event Date — date picker, sends YYYY-MM-DD to backend (required)
- Estimated Value — number input (required)
- Notes — textarea, max 500 chars (optional)

Fields intentionally excluded:
- Customer ID — hardcoded in defaultValues for current phase
- Business ID — removed from visible form
- Assigned To — optional, not shown in form, sent as null to backend

### 6) Bug fix: event_date format
Backend requires a plain date (YYYY-MM-DD), not a datetime string.
Changed the Event Date input from type="datetime-local" to type="date" so the browser submits a clean date without a time component.

## Current scope boundaries
Not implemented in Phase 2 (intentionally):
- WhatsApp chat drawer (deferred to Phase 3)
- Show Chat button wired to a real drawer (currently logs lead id to console)
- Authentication and user session — userId is hardcoded via env variable
- Table pagination and search
- Lead editing or deletion

## What Show Chat placeholder does
Each table row has a Show Chat button that currently calls:
  console.info("Show Chat clicked for lead", row.original.id)

This is the integration point for Phase 3 to attach the WhatsApp chat drawer.

## Environment variables used
- NEXT_PUBLIC_API_BASE_URL — base URL of the remote Linode backend
- NEXT_PUBLIC_DEFAULT_USER_ID — user ID sent as X-User-Id header on all API requests
