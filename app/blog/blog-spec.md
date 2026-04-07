# SellNSettle Blog — Design & Content Specification

## File Structure Per Blog Post

```
app/blog/[slug]/
├── page.tsx          ← Server component: metadata + JSON-LD + imports content component
└── [slug]-content.tsx ← Client component: "use client", all visual design
```

## Design System — Neobrutalist

### Colors
```typescript
const C = {
  coral: "#FF6B6B",
  teal: "#2EC4B6",
  gold: "#d4af37",
  navy: "#0a192f",
  gray: "#F8F9FA",
} as const;
```

### Typography
- Headlines: `fontFamily: "var(--font-plus-jakarta)"` — weight 900
- Body: default Inter from layout — weight 500 for body, 700-800 for emphasis
- Box-shadow helper: `const shadow = (x: number, y: number, color: string) => \`${x}px ${y}px 0px 0px ${color}\`;`

### Visual Components Available

These components are used across all blog posts. Recreate them in each post file (they are not shared components — each post is self-contained):

#### 1. TipCard
A numbered card with a colored header bar, icon, title, and body content.
```
- Header: colored background (coral/teal/gold/navy rotating), 4px navy border bottom
- Number circle: 52px, white bg, navy border, shadow(3,3,navy)
- Body: white bg, 4px navy border, shadow(8,8,[color])
```

#### 2. ScriptCard
A copy-paste message template with a situation label.
```
- Situation label: absolute positioned, colored bg, white text, top: -10px
- Body: white bg, 3px colored border, italic text
```

#### 3. PullQuote
Large italic text with thick left border.
```
- 8px left border in accent color
- Background: C.gray
- Font: FH, 17-21px, weight 800, italic
- Decorative " at top-left, 56px, 15% opacity
```

#### 4. BlobDivider
Abstract SVG shapes between sections. Low opacity (0.12). Alternates direction with `flip` prop.

#### 5. InvoiceComparison
Side-by-side cards: "❌ Unprofessional" WhatsApp text vs "✅ Professional" proper invoice.

#### 6. MistakeCard
Numbered card with colored circle, title, description. Used for listing common errors.

#### 7. StatusList
Follow-up list with red/yellow/green dots. Dark navy header bar.

#### 8. DoDontCard
Two-column comparison — green "DO" side and red "DON'T" side.

#### 9. ChatFlowMockup
Simulated chat showing user message with @mentions → AI response → action chips (Share, WhatsApp).

### Hero Banner Pattern
Every blog post has a dark navy hero with:
- Abstract blobs (absolute positioned, low opacity coral/teal/gold)
- Breadcrumb: Home / Blog / [Short label]
- Tag badge: colored bg with white text, 2px navy border, uppercase
- H1: clamp(26px, 5vw, 46px), weight 900, with one colored keyword span
- Subtitle: 16-17px, rgba(255,255,255,0.5)
- Date + read time

### CTA Section Pattern
At the bottom of every post:
- Background: C.gray
- Border: 4px solid C.navy
- Shadow: shadow(8, 8, C.teal)
- Title: "How SellNSettle helps" or similar
- Checklist of features (✓ checkmarks, honest mapping to real features)
- Coral CTA button with navy border + shadow

### Related Articles Pattern
3 links with colored dots, 3px border, at the very bottom.

## Content Rules

### Tone
- Write like a knowledgeable friend, not a SaaS marketing blog
- Mix Hindi/Hinglish phrases naturally into English text (e.g., "agar budget tight hai toh scope adjust karo")
- Use "aap" form in Hindi, not "tu" or "tum"
- No corporate jargon: "enquiry" not "lead" in user-facing context, though "lead" is fine in business tips
- Include real examples with Indian names (Rajesh, Anjali, Neha, Amit) and realistic scenarios (modular kitchen, wedding shoot, coaching package)

### Structure
- Each post: 800-1200 words of actual content
- 4-7 main sections/tips, each as a TipCard
- At least 3 visual elements between text (comparisons, diagrams, script cards, status lists, etc.)
- 1-2 PullQuotes breaking up text
- BlobDividers between major sections
- Never more than 2 paragraphs of plain text in a row without a visual break

### SEO
- page.tsx exports metadata: title, description, keywords, openGraph (type: "article"), canonical URL
- JSON-LD: Article schema (or HowTo for instructional posts)
- Single h1 in the hero
- h2 for each tip/section title (inside TipCard headers)
- Internal links to landing page ("/") and other blog posts
- All CTAs link to "/register"

### Honesty Rule
- Only reference SellNSettle features that actually exist (see CLAUDE.md)
- If a tip recommends something the app doesn't do, frame it as general business advice
- The CTA section must accurately describe what the app does for each tip

## Language Toggle (for Hinglish posts)

All posts should have a language toggle (EN/HI):
- Floating pill button, bottom-right, navy bg, teal dot toggle
- Default: Hinglish
- All text content switches; visual components stay the same
- Use pattern: `const t = (hi: string, en: string) => lang === "hi" ? hi : en;`
- **Critical:** Every visual element with text content (chat examples, script cards, timelines, checklists) must also use `t()` — not just paragraph text. These are the "money" screenshots; they must feel native in the active language.

---

## Lessons Learned (from Posts 4 & 5)

### Section structure — always use TipCard
- **Never** create a standalone section header (e.g., `SectionHeader`) + loose content below it.
- Every section must be wrapped in a `TipCard` so the 4px navy border + offset box-shadow applies to the whole section, not just the header.
- The header lives *inside* the card (`borderBottom: 4px solid navy`), and the body is the card's white padded area.

### All inner visual boxes — use ScriptCard style
- Any secondary visual box inside a section (timelines, schedules, stage lists) should follow the ScriptCard pattern: colored border, absolutely-positioned label at top-left (`top: -11px`), white background.
- Avoid the "navy header bar + table rows" pattern for inner boxes — it looks out of place inside a TipCard body.

### "Before/bad" state copy — make the frustration concrete
- Don't describe friction abstractly ("it takes time"). Walk through the actual steps with real pain: "10 fields bharo, 3 menus navigate karo, save button dhoondho — ek invoice banane mein 5 minute."
- End the "bad" side with an emotional cost: "5 minute wasted — aur mood 10 minute kharab."

### Emotionally specific signs / checklists
- Generic signs ("you forgot a follow-up last month") don't land. Make them sting with a real consequence: "Pichle month ek client ne doosre designer ko kaam de diya kyunki aapne callback nahi kiya."
- Each sign should describe a scenario the reader has actually lived, not a category of problem.

### Vary visual treatment for the most tangible action
- If a section has multiple chat examples, the most tangible/final action should look visually different — e.g., a mini phone-share mockup for "PDF banao aur WhatsApp pe bhejo" instead of another identical chat bubble.

### CTA button text — match the pricing framing
- Button text should be consistent with whatever the pricing/value section says. If the post frames it as "early access / free to start," the button should say "Free mein shuru karo →" / "Start your early access →" — not a generic "Try free."

### No competitor names
- Never mention specific competitor product names (e.g., Zoho, HubSpot, Salesforce) in any blog content.
- Use generic terms: "bade enterprise CRMs," "big CRMs," "large SaaS tools."

---

## Remaining Blog Posts to Write

### Post 4: "AI CRM Kya Hai? Small Business Ke Liye Simple Explanation"

**Slug:** `ai-crm-kya-hai-small-business-hindi`
**Target keyword:** AI CRM kya hai, AI CRM for small business Hindi
**Tag:** AI & Tech
**Language:** Hinglish with EN/HI toggle (default: Hinglish)
**English title:** "What is an AI CRM? A Simple Explanation for Small Businesses"
**Read time:** 6 min

**Outline:**

**Tip 1: CRM ka matlab kya hai?**
- HI: CRM = Customer Relationship Management. Simple language mein: ek jagah jahan aap apne saare clients ki details, unse kya baat hui, kya pending hai — sab rakh sako.
- EN: CRM = Customer Relationship Management. Simply: one place where you store all client details, conversations, and pending work.
- Visual: Before/After comparison card — "Without CRM" (notebook, WhatsApp, memory) vs "With CRM" (one searchable place)

**Tip 2: Normal CRM vs AI CRM — fark kya hai?**
- HI: Normal CRM mein aap forms bharte ho, buttons click karte ho, menus navigate karte ho. AI CRM mein aap baat karte ho — "Rajesh ka invoice banao" — aur kaam ho jaata hai.
- EN: Normal CRM = you fill forms, click buttons, navigate menus. AI CRM = you talk to it and work gets done.
- Visual: Side-by-side — "Normal CRM" (screenshot-like form mockup with many fields) vs "AI CRM" (chat bubble creating an invoice)

**Tip 3: AI CRM kya kya kar sakta hai? (5 real examples)**
- "Invoice banao @Rajesh" → invoice created
- "Aaj ke follow-ups dikhao" → list of pending follow-ups
- "Kitna outstanding hai?" → instant answer
- "Payment record karo ₹50K UPI" → done
- "PDF banao aur WhatsApp pe bhejo" → PDF generated + shared
- Visual: 5 mini chat mockup cards, each showing one example

**Tip 4: Kya AI CRM mehenga hota hai?**
- HI: Bahut se AI CRMs free tier dete hain. SellNSettle bhi free hai — card nahi chahiye. Zoho/HubSpot jaisi companies lakho mein padti hain. But chhoti business ke liye woh overkill hai.
- EN: Many AI CRMs offer free tiers. SellNSettle is free — no card needed. Zoho/HubSpot cost lakhs and are overkill for small businesses.
- Visual: Price comparison card (Generic CRMs: ₹2000-5000/month vs SellNSettle: Free)

**Tip 5: Kya aapko AI CRM chahiye? 5 signs**
- Notebook mein client details dhoondne mein 10+ minute lagte hain
- Pichle month mein kam se kam 1 follow-up bhool gaye
- Invoice banana itna tedious hai ki kabhi kabhi skip kar dete ho
- Payment maangne mein awkward feel hota hai
- WhatsApp pe business aur personal messages mix ho rahe hain
- Visual: Checklist card with checkboxes — "If 3+ match, you need an AI CRM"

**CTA:** Honest mapping of each example to real SellNSettle features.

**Related posts:** Post 1 (client management), Post 3 (follow-ups), Post 5 (payment reminders)

---

### Post 5: "Payment Reminder Messages — 10 Templates in Hindi & English"

**Slug:** `payment-reminder-templates-hindi-english`
**Target keyword:** payment reminder message Hindi, payment yaad dilane ka message
**Tag:** Payments
**Language:** English with both Hindi and English templates inline (NO toggle needed — both languages shown simultaneously as that's the point of the post)
**Read time:** 5 min

**Outline:**

**Intro:** Why most small businesses delay sending payment reminders. The awkwardness is real — but the unpaid invoices are more real.

**Section 1: When to send reminders**
- Day of due date (gentle)
- 3 days after (firm)
- 7 days after (direct)
- 14 days after (final)
- Visual: Timeline diagram with 4 stages

**Section 2: 5 Hindi payment reminder templates (WhatsApp-ready)**
Templates for: gentle first reminder, follow-up after 3 days, firm reminder after 7 days, partial payment acknowledgment, final notice.
- Visual: 5 ScriptCards with Hindi text, labeled by situation

**Section 3: 5 English payment reminder templates (email/WhatsApp)**
Same 5 situations but in professional English.
- Visual: 5 ScriptCards with English text

**Section 4: Tips for effective reminders**
- Always include the invoice number and amount
- Attach the invoice PDF (don't make them search)
- Include payment method (UPI ID or bank details)
- Keep tone polite but clear — you're running a business
- Don't apologize for asking — it's their obligation
- Visual: Do/Don't card

**CTA:** SellNSettle generates reminder messages with invoice details via chat → user shares on WhatsApp. Honest description.

**Related posts:** Post 1, Post 2 (invoicing), Post 8 (freelancer payment)

---

### Post 6: "GST Invoice Format for Interior Designers — Free Template Download"

**Slug:** `gst-invoice-format-interior-designer-free-template`
**Target keyword:** GST invoice format interior designer, interior design bill format
**Tag:** Invoicing
**Language:** English (no toggle)
**Read time:** 6 min

**Outline:**

**Section 1: GST requirements for interior design services**
- SAC code 998533 (Architectural and interior design services) or 998539
- 18% GST rate
- Registration threshold: ₹20L turnover (₹10L for special category states)
- CGST + SGST (intra-state) vs IGST (inter-state)
- Visual: Info card with SAC code and rate highlighted

**Section 2: What a GST-compliant invoice must include**
- All mandatory fields per GST rules
- Visual: Annotated invoice checklist (reuse pattern from Post 2 but with GST-specific fields)

**Section 3: Sample invoice walkthrough**
- A realistic example: Interior designer in Jaipur billing a client for modular kitchen + hardware + labour
- Visual: Full mock invoice card with all fields filled in

**Section 4: Common GST mistakes**
- Charging 18% on total instead of base amount
- Missing SAC code
- Wrong GSTIN format
- Not maintaining sequential invoice numbers
- Visual: MistakeCards

**Section 5: Create GST invoices in 30 seconds**
- Chat flow mockup showing SellNSettle creating a GST invoice
- Manual alternative: template approach
- Visual: ChatFlowMockup

**CTA:** SellNSettle handles GST calculation, PDF generation, WhatsApp sharing — all via chat.

**Related posts:** Post 2 (professional invoice), Post 7 (WhatsApp invoice), Post 1 (client management)

---

### Post 7: "WhatsApp Pe Invoice Kaise Bhejein — Professional Tarike Se"

**Slug:** `whatsapp-invoice-bhejne-ka-tarika`
**Target keyword:** WhatsApp pe invoice kaise bhejein, WhatsApp invoice share
**Tag:** WhatsApp
**Language:** Hinglish with EN/HI toggle (default: Hinglish)
**Read time:** 5 min

**Outline:**

**Tip 1: WhatsApp pe amount type karke bhejte ho? Yeh galat hai.**
Why a text message is not an invoice. Legal and professional implications.
- Visual: WhatsApp text vs PDF comparison (reuse InvoiceComparison pattern)

**Tip 2: Professional invoice PDF kaise banayein**
- Must have: business name, items, GST, due date, payment details
- Can use templates (Excel/Word) or chat-based tools
- Visual: Quick checklist card

**Tip 3: PDF share karne ka sahi tarika**
- Send the actual PDF file, not a screenshot
- Include a short message with the invoice: "Hi [name] ji, invoice attached for [project]. Due date: [date]. Payment details invoice mein hain."
- Visual: ScriptCard with the ideal WhatsApp message

**Tip 4: Invoice mein payment details zaroori hain**
- UPI ID + QR code = fastest payment
- Bank account details as backup
- Never assume client knows your payment details
- Visual: Payment details card mockup

**Tip 5: Client ko invoice mila ya nahi — kaise track karein**
- WhatsApp blue ticks ≠ client read the invoice
- Set a follow-up 2-3 days after sending
- If no response, resend with a polite message
- Visual: Follow-up timeline mini card

**CTA:** SellNSettle: create invoice by chat → PDF in one tap → WhatsApp share in one tap. Honest feature description.

**Related posts:** Post 2 (professional invoice), Post 6 (GST format), Post 5 (payment reminders)

---

### Post 8: "Freelancer Payment Collection Tips — Never Chase Clients Again"

**Slug:** `freelancer-payment-collection-tips-india`
**Target keyword:** freelancer payment collection India, how to collect payment from clients
**Tag:** Payments
**Language:** English (no toggle)
**Read time:** 6 min

**Outline:**

**Tip 1: Set payment expectations before the project starts**
- Discuss payment terms in the first meeting, not after delivery
- Include terms in your quote/proposal
- Visual: "Before" (no discussion) vs "After" (clear terms) comparison card

**Tip 2: Send invoices immediately — delay = delayed payment**
- The closer the invoice is to completed work, the faster the payment
- Never "batch" invoices at month end
- Visual: PullQuote with the key insight

**Tip 3: Offer multiple payment methods**
- UPI (fastest in India), bank transfer, cash for local work
- Include all options on the invoice
- Visual: Payment methods card with icons

**Tip 4: Use milestone billing for large projects**
- Don't wait for the whole project to finish
- Example: 30% advance, 40% on approval, 30% on delivery
- Visual: Milestone progress bar diagram
- NOTE: SellNSettle doesn't have milestone billing built-in. Frame this as general business advice, and mention that you can create separate invoices per milestone.

**Tip 5: Send payment reminders — take the awkwardness out**
- Reference Post 5 (payment reminder templates)
- The reframe: reminders are professional, not rude
- Visual: ScriptCard with a sample reminder

**Tip 6: What to do when a client ghosts on payment**
- Day 1-7: Polite reminders
- Day 7-14: Direct message asking if there's an issue
- Day 14-30: Written notice via email (creates a paper trail)
- Day 30+: Consider whether the relationship is worth continuing
- Visual: Escalation timeline

**Tip 7: Track everything — so you always know who owes what**
- Real-time view of all outstanding amounts
- Which clients are consistently late?
- Visual: Mini dashboard mockup showing outstanding by client

**CTA:** SellNSettle tracks payments, sends reminders via WhatsApp, shows outstanding at a glance. Honest mapping.

**Related posts:** Post 5 (payment templates), Post 2 (invoicing), Post 1 (client management)

---

## How to Prompt Claude Code for Each Post

Use this prompt template in Claude Code:

```
Read docs/blog-spec.md for the complete blog design system and post brief.
Read CLAUDE.md for product context and feature honesty rules.

Look at app/blog/interior-design-client-management-tips/post1-content.tsx and
app/blog/follow-up-kaise-karein-lead-miss-na-ho/post3-content.tsx as reference
implementations for the visual design pattern.

Now write Post [N]: "[title]" following the brief in docs/blog-spec.md.

Create two files:
1. app/blog/[slug]/page.tsx — server component with metadata + JSON-LD
2. app/blog/[slug]/[name]-content.tsx — client component with full visual design

Requirements:
- Match the neobrutalist design system exactly (colors, shadows, borders, TipCards, etc.)
- Follow the content outline in the spec but write naturally — not robotic
- Mix Hindi/Hinglish phrases naturally into the text
- Include all specified visual elements
- Only reference SellNSettle features that actually exist (check CLAUDE.md)
- CTA section must honestly map tips to real product features
```