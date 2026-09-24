# CareConnect — Codebase File Guide

**Purpose:** This document maps out the full project folder structure and explains what each file/folder is responsible for. Give this alongside the PRD to an AI coding assistant (e.g., Claude Code) so it knows exactly where to create each piece and what belongs in it, instead of guessing a structure on the fly.

---

## Top-Level Repository Structure

```
careconnect/
├── server/                # Express + MongoDB backend
├── client/                # React (Vite) frontend
├── .gitignore
├── README.md
└── package.json           # root scripts (optional: concurrently run both)
```

---

## Backend — `/server`

```
server/
├── server.js
├── app.js
├── config/
│   ├── db.js
│   └── env.js
├── models/
│   ├── User.js
│   ├── ProviderProfile.js
│   ├── ServiceCategory.js
│   ├── AvailabilitySlot.js
│   ├── ServiceRequest.js
│   ├── Quote.js
│   ├── Booking.js
│   ├── Invoice.js
│   ├── Review.js
│   ├── Dispute.js
│   ├── Notification.js
│   └── AuditLog.js
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── category.controller.js
│   ├── provider.controller.js
│   ├── availability.controller.js
│   ├── request.controller.js
│   ├── quote.controller.js
│   ├── booking.controller.js
│   ├── job.controller.js
│   ├── invoice.controller.js
│   ├── review.controller.js
│   ├── dispute.controller.js
│   ├── notification.controller.js
│   ├── ai.controller.js
│   └── analytics.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── category.routes.js
│   ├── provider.routes.js
│   ├── availability.routes.js
│   ├── request.routes.js
│   ├── quote.routes.js
│   ├── booking.routes.js
│   ├── job.routes.js
│   ├── invoice.routes.js
│   ├── review.routes.js
│   ├── dispute.routes.js
│   ├── notification.routes.js
│   ├── ai.routes.js
│   ├── analytics.routes.js
│   └── index.js
├── middleware/
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   ├── ownership.middleware.js
│   ├── validate.middleware.js
│   ├── errorHandler.middleware.js
│   └── notFound.middleware.js
├── services/
│   ├── ai/
│   │   ├── classifyRequest.js
│   │   └── rankProviders.js
│   ├── availabilityEngine.js
│   ├── invoiceGenerator.js
│   └── notificationService.js
├── validators/
│   ├── auth.validator.js
│   ├── request.validator.js
│   ├── quote.validator.js
│   ├── booking.validator.js
│   └── dispute.validator.js
├── utils/
│   ├── asyncHandler.js
│   ├── ApiError.js
│   ├── ApiResponse.js
│   └── generateToken.js
├── seed/
│   └── seed.js
└── .env.example
```

### What each backend piece does

**`server.js`** — Entry point. Loads env vars, connects to MongoDB, starts the HTTP server.

**`app.js`** — Configures the Express app: middleware (CORS, JSON body parsing, logging), mounts `routes/index.js`, wires the error handler last.

**`config/db.js`** — Mongoose connection logic with retry/error handling.

**`config/env.js`** — Centralized, validated access to environment variables (JWT secret, Mongo URI, AI API key, port) so nothing reads `process.env` directly elsewhere.

**`models/*.js`** — One Mongoose schema per entity from the PRD's data model (User, ProviderProfile, ServiceCategory, AvailabilitySlot, ServiceRequest, Quote, Booking, Invoice, Review, Dispute, Notification, AuditLog). Each defines fields, types, references (`ObjectId` + `ref`), indexes on frequently filtered fields, and any schema-level validation.

**`controllers/*.js`** — Route handler logic per resource. Each function: validates input has already passed middleware, calls the model/service layer, and returns a consistent JSON response via `utils/ApiResponse.js`. Business logic that's reusable (AI calls, availability checks, invoice math) lives in `services/`, not here.

**`routes/*.js`** — Defines the Express Router endpoints per resource and wires up `auth.middleware`, `role.middleware`, `ownership.middleware`, `validate.middleware`, and the matching controller function, in that order. `routes/index.js` mounts every router under `/api/...`.

**`middleware/auth.middleware.js`** — Verifies the JWT, attaches `req.user`.

**`middleware/role.middleware.js`** — `requireRole('admin', 'ops')`-style guard checked against `req.user.role`.

**`middleware/ownership.middleware.js`** — Confirms the authenticated user owns/is party to the resource being accessed (e.g., a provider can only PATCH their own booking).

**`middleware/validate.middleware.js`** — Runs the relevant validator schema (from `validators/`) and short-circuits with a 400 on failure.

**`middleware/errorHandler.middleware.js`** — Single place that formats all thrown/`next(err)` errors into `{ success: false, message, errors }`.

**`middleware/notFound.middleware.js`** — Catches unmatched routes → 404.

**`services/ai/classifyRequest.js`** — Isolated function: takes request text → returns `{ category, skills, confidence }`. Wraps whatever AI provider is used, so swapping models later doesn't touch controllers.

**`services/ai/rankProviders.js`** — Isolated function: takes a classified request + candidate providers → returns providers sorted by match score (skills, area, availability, rating).

**`services/availabilityEngine.js`** — Core conflict-check logic: given a providerId and a proposed time range, checks `AvailabilitySlot`/existing `Booking`s for overlap and either confirms or rejects.

**`services/invoiceGenerator.js`** — Builds an `Invoice` document from a completed `Booking` + accepted `Quote`.

**`services/notificationService.js`** — Single function used everywhere a notification needs to be created (`notify(userId, type, message, relatedEntityId)`).

**`validators/*.js`** — Schema definitions (Zod/Joi/express-validator) per write endpoint, imported by `validate.middleware.js`.

**`utils/asyncHandler.js`** — Wraps async controller functions so thrown errors are forwarded to `next()` without repetitive try/catch.

**`utils/ApiError.js` / `ApiResponse.js`** — Standard shapes for thrown errors and successful responses, used everywhere.

**`utils/generateToken.js`** — Signs access/refresh JWTs.

**`seed/seed.js`** — Populates the database with demo users (one per role), categories, providers with availability, sample requests through every status (open, quoted, booked, completed+reviewed, cancelled, disputed) — used for grading/demo, per PRD §8 test-data requirement.

**`.env.example`** — Documents required env vars (`MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `AI_API_KEY`, `PORT`) without real values.

---

## Frontend — `/client`

```
client/
├── index.html
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── routes/
│   │   ├── AppRoutes.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── customer/
│   │   │   ├── CreateRequestPage.jsx
│   │   │   ├── MyRequestsPage.jsx
│   │   │   ├── CompareQuotesPage.jsx
│   │   │   ├── BookingTrackerPage.jsx
│   │   │   └── ReviewPage.jsx
│   │   ├── provider/
│   │   │   ├── ProviderProfilePage.jsx
│   │   │   ├── AvailabilityPage.jsx
│   │   │   ├── MatchingRequestsPage.jsx
│   │   │   ├── MyQuotesPage.jsx
│   │   │   └── JobManagementPage.jsx
│   │   ├── ops/
│   │   │   ├── BookingsOverviewPage.jsx
│   │   │   └── EscalationsPage.jsx
│   │   ├── support/
│   │   │   └── DisputesInboxPage.jsx
│   │   └── admin/
│   │       ├── CategoriesPage.jsx
│   │       ├── ProviderVerificationPage.jsx
│   │       ├── UsersPage.jsx
│   │       └── AuditLogPage.jsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── RoleShell.jsx
│   │   ├── requests/
│   │   │   ├── RequestForm.jsx
│   │   │   └── RequestCard.jsx
│   │   ├── providers/
│   │   │   ├── ProviderCard.jsx
│   │   │   └── RankedProviderList.jsx
│   │   ├── bookings/
│   │   │   ├── BookingStatusTimeline.jsx
│   │   │   └── EvidenceUploader.jsx
│   │   ├── disputes/
│   │   │   └── DisputeThread.jsx
│   │   └── common/
│   │       ├── Button.jsx
│   │       ├── Modal.jsx
│   │       ├── StatusBadge.jsx
│   │       └── LoadingSpinner.jsx
│   ├── context/ (or store/ if using Redux/Zustand)
│   │   ├── AuthContext.jsx
│   │   └── NotificationContext.jsx
│   ├── services/
│   │   └── api/
│   │       ├── axiosClient.js
│   │       ├── authApi.js
│   │       ├── requestApi.js
│   │       ├── quoteApi.js
│   │       ├── bookingApi.js
│   │       ├── providerApi.js
│   │       ├── disputeApi.js
│   │       └── aiApi.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useFetch.js
│   ├── utils/
│   │   └── formatters.js
│   └── styles/
│       └── index.css
└── .env.example
```

### What each frontend piece does

**`main.jsx`** — Mounts `<App />`, wraps it in `AuthContext`/store provider and `BrowserRouter`.

**`App.jsx`** — Top-level layout shell, renders `AppRoutes`.

**`routes/AppRoutes.jsx`** — All route definitions, grouped by role-prefixed paths (`/customer/*`, `/provider/*`, `/ops/*`, `/support/*`, `/admin/*`).

**`routes/ProtectedRoute.jsx`** — Wraps a route, redirects to login if unauthenticated, redirects/blocks if `req.user.role` doesn't match the route's allowed roles — the frontend mirror of the backend's role middleware.

**`pages/<role>/*.jsx`** — One page component per screen in that role's workflow (see PRD §3–4 for what each role needs to see/do). Pages compose components and call the relevant `services/api/*` functions; they hold page-level state, not global state.

**`components/layout/*`** — Shared shell: nav bar, role-aware sidebar, `RoleShell` wraps pages with the right layout per role.

**`components/requests/*`** — Reusable pieces for creating/displaying a service request.

**`components/providers/*`** — Provider card (for browse/compare) and the AI-ranked list display.

**`components/bookings/*`** — Status timeline (visualizes the job lifecycle from PRD §4.4) and the before/after evidence uploader.

**`components/disputes/DisputeThread.jsx`** — Shared thread/activity-log view used by both Support and Admin dispute screens.

**`components/common/*`** — Generic UI primitives reused everywhere.

**`context/AuthContext.jsx`** — Holds current user + token, login/logout/refresh logic, exposes `useAuth()`.

**`context/NotificationContext.jsx`** — Polls/holds in-app notifications, exposes read/unread state.

**`services/api/axiosClient.js`** — Single Axios instance with base URL and an interceptor that attaches the JWT and handles 401s.

**`services/api/*Api.js`** — One file per backend resource; each exports thin functions (`getRequests()`, `createQuote()`, etc.) that call `axiosClient` — nothing else in the app should call `axios` directly.

**`hooks/useAuth.js`** — Convenience hook over `AuthContext`.

**`hooks/useFetch.js`** — Small generic data-fetching hook (loading/error/data states) to avoid repeating boilerplate in every page.

**`utils/formatters.js`** — Date/currency/status-label formatting helpers shared across pages.

---

## How to use this with an AI coding assistant

When handing this off, paste both this file and the PRD, then ask the assistant to:
1. Scaffold the folder structure exactly as laid out here.
2. Build backend in the phase order from PRD §10 (Foundation → Core Marketplace Data → Request-to-Book → Job Lifecycle → Reviews → AI Layer → Disputes → Ops/Analytics → Notifications/Search → Hardening).
3. Keep controllers thin and business logic in `services/`, matching the separation described above.
4. Implement `services/ai/*` behind a swappable interface so the AI provider can change without touching controllers or routes.
