# CareConnect

Home Services Booking & Operations Platform — a MERN marketplace connecting customers with verified home-service providers (electrical, cleaning, plumbing, appliance repair, maintenance), with AI-assisted request classification and provider ranking.

This implements the PRD in `CareConnect_PRD.md` (also included in this delivery). See `CareConnect_File_Structure_Guide.md` for a full map of what every file does.

## What's included

**Backend** (`/server`) — complete REST API:
- JWT auth (access + refresh tokens), 5 roles (customer, provider, ops, support, admin)
- 12 Mongoose models covering the full data model from the PRD
- Full request → quote → book → job-tracking → invoice → review workflow
- Availability engine that prevents overlapping provider bookings
- Dispute workflow (raise → triage → resolve, with refund/re-service/dismiss actions)
- AI service layer: request classification via a **local LLM (Ollama)** — no API key, nothing leaves your machine — with an offline heuristic fallback if Ollama isn't running; provider ranking is a deterministic weighted-scoring algorithm (no LLM needed at all)
- Role + ownership middleware, Zod validation on every write route, centralized error handling
- Audit logging, notifications, analytics dashboard endpoint
- A seed script with realistic demo data across every workflow state

**Frontend** (`/client`) — React (Vite) + Tailwind:
- Role-aware routing and navigation (5 distinct dashboards)
- Every core screen: request creation with live AI classification preview, quote comparison + booking, job status tracking with evidence uploads, invoices, reviews, dispute raising/resolution, provider verification queue, analytics
- A deliberately non-generic visual style (custom Tailwind theme, not default shadcn/Bootstrap look)

## Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string
- [Ollama](https://ollama.com) installed and running, with a model pulled — **optional**: the app works without it, just with a lower-precision heuristic classifier instead of an LLM

```bash
# one-time setup, if you want LLM-backed classification
ollama pull llama3.1
```

Ollama runs its own local server on `http://localhost:11434` once installed (usually starts automatically). No signup, no API key.

## Setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` — at minimum set `JWT_SECRET`, `JWT_REFRESH_SECRET` (any long random strings), and `MONGO_URI` if not using the local default. `OLLAMA_BASE_URL` and `OLLAMA_MODEL` already default to a standard local Ollama install (`http://localhost:11434`, `llama3.1`) — only change them if you're running Ollama elsewhere or pulled a different model. If Ollama isn't running at all, classification transparently falls back to the built-in heuristic — nothing breaks.

Seed demo data (creates users for every role, categories, providers, and requests in every workflow state — open, quoted, completed+reviewed, cancelled, disputed):

```bash
npm run seed
```

Start the API:

```bash
npm run dev      # with nodemon
# or
npm start
```

API runs on `http://localhost:5000`, health check at `GET /api/health`.

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env   # defaults to http://localhost:5000/api, adjust if needed
npm run dev
```

App runs on `http://localhost:5173` (Vite dev server proxies `/api` to the backend).

## Demo logins

All seeded accounts use password: `Password123!`

| Role | Email |
|---|---|
| Admin | admin@careconnect.dev |
| Ops | ops@careconnect.dev |
| Support | support@careconnect.dev |
| Customer | priya@careconnect.dev / rahul@careconnect.dev |
| Provider (verified) | suresh.electric@careconnect.dev / lakshmi.clean@careconnect.dev |
| Provider (pending verification) | manoj.plumb@careconnect.dev |

Try this walkthrough: log in as **Priya** → view "My Requests" → open the deep-cleaning request → you'll see a pending quote from Lakshmi → book it → log in as **Lakshmi** to move the job through en route → in progress → completed (uploading an evidence photo URL) → log back in as **Priya** to confirm completion, view the invoice, and leave a review. Log in as **Admin** to approve Manoj's pending verification, or as **Support** to resolve the seeded open dispute.

## Notes on scope / what's simplified for a capstone

- **Payments** are simulated (an invoice with a `paymentStatus` field) — no real payment gateway.
- **File uploads** (evidence photos, verification documents) are stored as plain URLs you paste in — there's no S3/Cloudinary integration wired up. Swap `EvidenceUploader.jsx` and the document upload flow for a real upload widget if you need one.
- **Email/SMS notifications** are out of scope per the PRD; in-app notifications (bell icon, polled every 30s) are implemented.
- **AI classification** uses a locally-running LLM via Ollama (no API key, no data leaves your machine). Provider **ranking** is a deterministic weighted-scoring algorithm — explainable/auditable by design, not an LLM call. If Ollama isn't installed or running, classification falls back automatically to a keyword-overlap heuristic, so the app is fully usable with zero AI infrastructure at all if you'd rather not run a local model.

## Project structure

See `CareConnect_File_Structure_Guide.md` for the complete annotated file tree. Quick orientation:

```
server/   Express API — models, controllers, routes, middleware, services, validators
client/   React app — pages (per role), components, context, API service layer
```
