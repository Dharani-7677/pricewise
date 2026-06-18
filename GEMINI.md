# PriceWise - Project Roadmap & Instructions

Welcome to the **PriceWise** project! This file serves as the primary source of truth for our development standards, tech stack, and roadmap.

## 🛠 Tech Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** Supabase (PostgreSQL)
- **Charts:** Recharts
- **HTTP Client:** Axios

## 🎨 Design System (Dark Theme)
- **Background:** `#0f172a`
- **Card:** `#1e293b`
- **Primary:** `#6366f1` (Indigo)
- **Text:** `#f1f5f9`
- **Muted:** `#94a3b8`
- **Border:** `#334155`

## 📂 Project Structure
- `frontend/`: Next.js application
- `backend/`: Express server
- `backend/models/supabase.js`: Supabase client configuration
- `backend/services/`: Scraper, Email, AI, and Cron services

## 📝 Roadmap & Progress

### Phase 1: Foundation (Current)
- [x] Initial Project Setup
- [x] Basic Dashboard & History UI
- [x] Basic Server Setup
- [x] **Step 1: Confirm Supabase Connection** (Fix API Key issues)

### Phase 2: Backend Development
- [x] **Step 2:** `routes/products.js` (Add/Get/Delete products API)
- [x] **Step 3:** `scraper.js` (Extract product details from URL)
- [x] **Step 4:** `routes/prices.js` (Price history API)
- [x] **Step 5:** `emailService.js` + `routes/alerts.js` (Email alerts)

### Phase 3: Advanced Features
- [x] **Step 6:** `aiService.js` (Claude API - AI Deal Checker)
- [x] **Step 7:** `cronService.js` (Auto price check scheduling)

### Phase 4: Frontend Integration
- [x] **Step 8:** `lib/api.ts` (Connect frontend to real backend)
- [x] **Step 9:** `alerts/page.tsx`
- [x] **Step 10:** `compare/page.tsx`
- [x] **Step 11:** Community Deals Feed page

### Phase 5: Finalization
- [ ] **Step 12:** End-to-end testing & Deployment

## 📜 Development Guidelines
- **Beginner Friendly:** Provide full code for copy-pasting.
- **Explicit Paths:** Always state the file path and necessary actions.
- **Verification:** Always verify a step works before moving to the next.
