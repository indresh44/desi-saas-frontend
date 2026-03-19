# Phase 3 - WhatsApp Chat Drawer for Leads

Date: 2026-03-16
Status: Completed

## Goal
Add WhatsApp chat inside the Leads UI for already-linked conversations only. Users can open a drawer from a lead row, view conversation messages, refresh, and send text messages.

## What was completed

### 1) WhatsApp API constants added
Added API endpoint constants for conversation lookup, message listing, and text send.

Key file: lib/constants/api.ts

Constants added:
- whatsappConversations: /api/v1/whatsapp/conversations
- whatsappMessages: /api/v1/whatsapp/conversations
- whatsappSendText: /api/v1/whatsapp/messages/text

### 2) WhatsApp types added
Created strict TypeScript types matching backend contracts.

Key file: lib/types/whatsapp.ts

Types added:
- WhatsAppConversationRead
- WhatsAppMessageRead
- WhatsAppMessageStatus
- WhatsAppMessageDirection
- SendWhatsAppTextInput

### 3) WhatsApp API service layer implemented
Implemented service functions using existing apiClient and existing X-User-Id header pattern.

Key file: lib/api/whatsapp.ts

Functions added:
- fetchLeadConversation(leadId, userId)
- fetchConversationMessages(conversationId, { limit, offset, userId })
- sendWhatsAppText({ conversation_id, text }, userId)

Flow implemented:
1. GET /api/v1/whatsapp/conversations?lead_id={leadId}
2. If exists, use first conversation
3. GET /api/v1/whatsapp/conversations/{conversationId}/messages?limit=50&offset=0
4. POST /api/v1/whatsapp/messages/text for sending messages

### 4) Reusable hooks implemented
Added composable hooks for clean data/state handling.

Key files:
- hooks/use-lead-whatsapp-conversation.ts
- hooks/use-whatsapp-messages.ts

Hook responsibilities:
- useLeadWhatsAppConversation:
  - Loads linked conversation for selected lead
  - Exposes loading/error and refreshConversation
- useWhatsAppMessages:
  - Loads latest 50 messages
  - Exposes loading/error, isSending, refreshMessages, sendMessage
  - Appends sent message on success

### 5) Chat UI components implemented
Added composable UI components for the drawer feature.

Key files:
- components/whatsapp/lead-whatsapp-chat-drawer.tsx
- components/whatsapp/message-list.tsx
- components/whatsapp/message-composer.tsx

UI features:
- Right-side drawer/modal pattern with overlay
- Header shows contact_name fallback to phone_number
- Secondary info includes phone number and blocked status
- Manual Refresh button
- Loading state while fetching conversation/messages
- Friendly error state
- Friendly empty state when no linked conversation:
  "No WhatsApp conversation linked to this lead yet."
- Message alignment by direction:
  - incoming: left
  - outgoing: right
- Outgoing status metadata shown (sent/delivered/read/failed etc.)
- Non-text fallback rendering:
  - "Unsupported message type: <type>"
- Message composer with:
  - text input
  - send button
  - disabled when empty, sending, blocked, or no conversation

### 6) Leads page wired to real chat drawer
Replaced placeholder Show Chat action with real drawer behavior.

Key file: components/leads/leads-page-client.tsx

Behavior:
- Clicking Show Chat sets selected lead and opens drawer
- Drawer fetches linked conversation + messages
- Sending text posts and updates message list

### 7) Type safety and build fix
Resolved resolver typing mismatch in lead form schema to keep production build clean.

Key file: components/leads/leads-page-client.tsx

## Current scope boundaries
Not implemented in Phase 3 (intentionally):
- No conversation creation/initiation flow
- No use of link endpoint for new linking logic
- No attachment/media sending
- No websocket/realtime updates
- No infinite scroll or advanced pagination
- No backend changes

## API endpoints used in this phase
- GET /api/v1/whatsapp/conversations?lead_id={leadId}
- GET /api/v1/whatsapp/conversations/{conversationId}/messages?limit=50&offset=0
- POST /api/v1/whatsapp/messages/text

## Assumptions made
- Existing auth/header approach is X-User-Id via DEFAULT_USER_ID and is reused.
- If multiple conversations are returned for a lead, frontend uses the first one.
- Timestamp formatting uses native Date formatting since no shared date formatter existed in project utilities.
