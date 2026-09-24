# CareConnect — Product Requirements Document (PRD)

**Project:** Home Services Booking & Operations Platform
**Stack:** MERN (MongoDB, Express.js, React, Node.js) + AI integration
**Type:** AI-Enabled Capstone Project

---

## 1. Overview

CareConnect is a marketplace platform connecting customers who need home services (appliance repair, cleaning, electrical, plumbing, maintenance) with verified service providers. The platform manages the full lifecycle of a service request — from creation, through provider discovery and quoting, to booking, job execution, invoicing, and review — while giving operations and support staff the tools to monitor quality, resolve disputes, and keep the marketplace healthy.

AI is used in two places: classifying free-text service requests into structured categories/skills, and ranking providers for a given request.

## 2. Objective

Build a production-shaped, fully working MERN application that demonstrates:
- Multi-role authentication and authorization
- Real-world marketplace workflows (request → quote → book → complete → review)
- Correct data modeling and relationships in MongoDB
- An availability engine with real conflict prevention
- AI-assisted classification and matching
- Secure, validated REST APIs and a responsive React frontend

## 3. User Roles & Permissions

| Role | Key Permissions |
|---|---|
| **Platform Admin** | Full access. Manage service categories, pricing rules, provider verification, all users, disputes (final say), view audit logs. |
| **Operations Manager** | View/monitor all bookings, manually assign/reassign providers, handle escalations, flag quality issues, view analytics. Cannot edit pricing rules or verify providers. |
| **Service Provider** | Manage own profile, skills, service areas, availability slots, submit quotes, manage own bookings/jobs, upload evidence, view own invoices. |
| **Customer** | Create service requests, view/compare quotes, book a provider, track job status, cancel (per policy), leave reviews, raise disputes. |
| **Support Agent** | Handle cancellations, complaints, disputes (first line), process refunds, communicate with customers/providers. Cannot edit categories or pricing rules. |

Authorization must be enforced both at the route level (role check) and the resource level (ownership check — e.g., a provider can only edit their own booking, a customer can only cancel their own request).

## 4. Core Workflows

### 4.1 Request-to-Book Workflow
1. Customer creates a service request (free-text description + optional category/photos/location/preferred time window).
2. AI classifies the request into a service category and required skill tags (customer can override).
3. System surfaces eligible providers (AI-ranked) based on skills, service area, availability, and rating.
4. Providers view matching requests and submit quotes (price, estimated duration, notes).
5. Customer compares quotes, selects a provider.
6. System checks the availability engine and creates a booking on an agreed slot (no overlap allowed).
7. Provider performs the job, updates status (en route → in progress → completed), attaches before/after evidence.
8. Customer confirms completion; invoice is generated.
9. Customer submits a review/rating.
10. Cancellation is possible at defined stages (before booking confirmed, before job start) per cancellation policy.

### 4.2 Provider Verification Workflow
1. Provider registers and builds profile (skills, service areas, experience, pricing, documents).
2. Provider submits verification documents.
3. Platform Admin reviews and approves/rejects with reason.
4. Only verified providers appear in discovery/ranking results.

### 4.3 Dispute & Refund Workflow
1. Customer or provider raises a dispute on a booking (reason + evidence).
2. Support Agent triages, communicates with both parties.
3. Support Agent proposes resolution (refund, partial refund, re-service, dismiss).
4. Unresolved/escalated disputes go to Platform Admin for final decision.
5. All actions are logged to the audit trail.

### 4.4 Job Completion & Evidence Workflow
1. Provider updates job status through defined states with timestamps.
2. Provider attaches notes and before/after photos at relevant stages.
3. Customer must confirm completion before the job is marked closed and invoice finalized.

## 5. Functional Requirements

### 5.1 Authentication & Authorization
- JWT-based auth (access + refresh token pattern recommended).
- Password hashing (bcrypt), email uniqueness, role assigned at signup (Customer/Provider) or by Admin (Ops/Support/Admin).
- Role-based route middleware + resource ownership middleware.
- Provider accounts are gated as "unverified" until Admin approval; unverified providers cannot receive requests.

### 5.2 Service Category Management (Admin)
- CRUD for categories (name, description, icon, required skill tags, base pricing rules, active/inactive).
- Categories drive AI classification labels and provider skill matching.

### 5.3 Provider Profile & Skills
- CRUD for provider profile: bio, skills (linked to categories), service areas (geo or list of localities), years of experience, hourly/flat pricing, verification documents, portfolio images.
- Skills and service areas are the primary matching inputs for AI ranking.

### 5.4 Availability Engine
- Providers define recurring or one-off availability slots.
- On booking confirmation, the engine must reject/prevent any overlapping slot for that provider.
- Must handle timezones consistently and expose free/busy slots to the discovery UI.

### 5.5 Service Requests
- Customer CRUD (create/edit while open, cancel).
- Fields: description, category (AI-suggested + editable), location, preferred time window, budget range, photos/attachments, status (open, quoted, booked, in progress, completed, cancelled, disputed).

### 5.6 Quotes
- Providers submit quotes against open requests they're eligible/matched for.
- Fields: price, estimated duration, notes, validity window.
- Customer can accept exactly one quote per request; accepting locks the booking flow.

### 5.7 Bookings
- Created on quote acceptance + availability confirmation.
- Status lifecycle: scheduled → in progress → completed → closed / cancelled / disputed.
- Reschedule support with re-validation against the availability engine.

### 5.8 Job Tracking
- Status updates with timestamps and actor (who changed it).
- Notes and attachments per status change.
- Before/after evidence required for "completed" status.
- Customer confirmation step required to close the job.

### 5.9 Invoices
- Auto-generated on job completion from the accepted quote + any approved adjustments.
- Fields: line items, taxes/fees if modeled, total, payment status (mock/simulated payment acceptable for capstone scope).

### 5.10 Reviews & Ratings
- Customer rates provider (1–5) + written review, tied to a completed booking only.
- Provider average rating feeds into AI ranking.
- Optional: provider response to review.

### 5.11 Disputes
- Raised by customer or provider against a booking.
- Status lifecycle: open → in review → resolved/escalated → closed.
- Resolution actions: refund, partial refund, re-service, dismissed.
- Full activity log per dispute.

### 5.12 Notifications
- In-app (minimum) notifications for: quote received, quote accepted, booking confirmed, status changes, dispute updates, verification result.
- Email notifications are a stretch goal, not required for MVP.

### 5.13 Search & Filters
- Customers: search/filter providers by category, location, rating, price range, availability.
- Admin/Ops: search/filter bookings, disputes, users by status, date range, role.

### 5.14 Analytics & Audit Trail
- Ops dashboard: active bookings, completion rate, average resolution time, category demand.
- Audit log: who did what, when, on which resource (esp. verification, pricing, dispute resolution, role changes).

### 5.15 AI Integration
**a) Request Classification**
- Input: free-text service request description (+ optional photos metadata).
- Output: predicted category + required skill tags + confidence score.
- Customer/Admin can override the AI suggestion.

**b) Provider Ranking**
- Input: classified request (category, skills, location, time window).
- Signals: skill match, service-area match, current availability, historical rating, completed-jobs count, response time (if tracked).
- Output: ranked list of eligible providers with a match score, shown to the customer during discovery.

Both AI features should be implemented as an isolated service layer (e.g., `services/ai/`) so the underlying model/API can be swapped without touching controllers.

## 6. Data Model (Core Entities)

| Entity | Key Fields | Key Relationships |
|---|---|---|
| **User** | name, email, passwordHash, role, isVerified, createdAt | base for Customer/Provider/Ops/Support/Admin |
| **ProviderProfile** | userId, bio, skills[], serviceAreas[], experienceYears, pricing, documents[], verificationStatus, avgRating | 1:1 with User(role=provider) |
| **ServiceCategory** | name, description, requiredSkills[], basePricingRule, isActive | referenced by ServiceRequest, ProviderProfile.skills |
| **AvailabilitySlot** | providerId, startTime, endTime, isBooked | belongs to ProviderProfile |
| **ServiceRequest** | customerId, description, categoryId, aiSuggestedCategory, location, preferredWindow, status, attachments[] | belongs to Customer; has many Quotes |
| **Quote** | requestId, providerId, price, estimatedDuration, notes, status | belongs to ServiceRequest and ProviderProfile |
| **Booking** | requestId, quoteId, customerId, providerId, slot, status, timeline[] | central workflow entity |
| **JobUpdate** | bookingId, status, note, attachments[], actorId, timestamp | belongs to Booking (or embedded array on Booking) |
| **Invoice** | bookingId, lineItems[], total, paymentStatus | 1:1 with Booking |
| **Review** | bookingId, customerId, providerId, rating, comment | 1:1 with Booking |
| **Dispute** | bookingId, raisedBy, reason, status, resolution, activityLog[] | belongs to Booking |
| **Notification** | userId, type, message, isRead, relatedEntityId | belongs to User |
| **AuditLog** | actorId, action, resourceType, resourceId, timestamp, meta | system-wide |

## 7. API Surface (Summary)

```
/api/auth          POST /register, /login, /refresh, /logout
/api/users         GET, PATCH (admin/self), role management (admin)
/api/categories     CRUD (admin)
/api/providers      CRUD profile, GET /providers?filters, POST /verify (admin)
/api/availability    CRUD slots, GET /providers/:id/availability
/api/requests       CRUD, POST /:id/classify (AI)
/api/quotes         CRUD, POST /:id/accept
/api/bookings       CRUD, PATCH /:id/status, POST /:id/reschedule
/api/jobs           POST /:bookingId/updates, POST /:bookingId/evidence
/api/invoices       GET, POST /:bookingId/generate
/api/reviews        CRUD (create restricted to completed bookings)
/api/disputes       CRUD, PATCH /:id/resolve
/api/notifications   GET, PATCH /:id/read
/api/ai             POST /classify, POST /rank-providers
/api/analytics      GET dashboards (ops/admin)
/api/audit-logs      GET (admin)
```

## 8. Non-Functional Requirements

- **Security:** JWT auth, bcrypt hashing, input sanitization, rate limiting on auth routes, role + ownership checks on every protected route, secrets in `.env` (never committed).
- **Validation:** Server-side validation on every write endpoint (e.g., via Joi/Zod/express-validator); reject malformed requests with clear 4xx errors.
- **Error Handling:** Centralized Express error-handling middleware; consistent error response shape (`{ success, message, errors }`).
- **Performance:** Indexed MongoDB queries on frequently filtered fields (category, location, status, providerId).
- **Responsiveness:** Mobile-first React UI, usable on small screens for customers and providers in the field.
- **Testing/Test Data:** Seed script producing realistic data across all roles, categories, and booking states (including at least one dispute, one completed job with review, and one cancelled booking) for demo purposes.

## 9. Tech Stack

- **Frontend:** React (Vite), React Router, a state solution (Context API or Redux Toolkit/Zustand), Axios, Tailwind or component library of choice.
- **Backend:** Node.js, Express.js, Mongoose (MongoDB), JWT, bcrypt.
- **AI:** Pluggable service layer — can call an LLM API (e.g., Claude) for classification/ranking, or a lightweight local heuristic/model, behind a common interface.
- **Dev/Test:** dotenv, express-validator/Zod, Jest/Supertest (backend), seed scripts.

## 10. Suggested Build Phases

1. **Foundation:** Auth, User model, role middleware, base project structure.
2. **Core Marketplace Data:** Categories, ProviderProfile, AvailabilitySlot, CRUD + validation.
3. **Request-to-Book Core Flow:** ServiceRequest → Quote → Booking, without AI (manual category selection first).
4. **Job Lifecycle:** JobUpdate, evidence uploads, completion confirmation, Invoice generation.
5. **Reviews + Ratings.**
6. **AI Layer:** Classification service, wire into request creation; Ranking service, wire into discovery.
7. **Disputes + Support Tools.**
8. **Ops Dashboard + Analytics + Audit Trail.**
9. **Notifications + Search/Filters polish.**
10. **Hardening:** validation pass, error handling pass, responsive UI pass, seed data, README.

## 11. Acceptance Criteria

- All five roles can log in and see a role-appropriate view; unauthorized actions return 403.
- A customer can go from creating a request to a completed, reviewed booking end to end.
- The availability engine provably rejects an overlapping booking attempt.
- AI classification returns a category/skill suggestion for a sample free-text request.
- AI ranking returns an ordered provider list for a sample request.
- A dispute can be raised, triaged by Support, and resolved by Admin, with an audit trail.
- All list/detail pages work on a mobile viewport.

## 12. Out of Scope / Assumptions

- Real payment processing (mock/simulated payment status is sufficient).
- Real SMS/email delivery (in-app notifications are sufficient; email is a stretch goal).
- Native mobile apps (responsive web only).
- Real background-check/document verification automation (Admin manual approval is sufficient).
