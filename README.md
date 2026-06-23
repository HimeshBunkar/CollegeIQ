# CollegeIQ

**Discover, Compare, Predict and Decide.**

Production-grade college discovery and decision-making platform built for the AI Software Engineer Internship assignment.

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Next.js 15 │────▶│  API Routes      │────▶│  PostgreSQL  │
│  App Router │     │  (REST + Zod)    │     │  (Neon)      │
└─────────────┘     └──────────────────┘     └──────────────┘
       │                     │
       ▼                     ▼
 TanStack Query        Prisma ORM
 React Hook Form       NextAuth.js
 shadcn/ui
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, TailwindCSS, shadcn/ui |
| Backend | Next.js API Routes, Zod validation |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (Email + Google) |
| State | TanStack Query, React Hook Form |
| Deploy | Vercel + Neon PostgreSQL |

## Quick Start

```bash
cd C:\Users\hp5cd\Projects\collegeiq
npm install
cp .env.example .env.local
# Set DATABASE_URL to your Neon PostgreSQL connection string
npm run db:push
npm run db:seed
npm run dev
```

**Demo login:** `demo@collegeiq.in` / `password123`

## Folder Structure

```
collegeiq/
├── prisma/
│   ├── schema.prisma      # Database models
│   └── seed.ts            # Sample data (10 colleges)
├── src/
│   ├── app/
│   │   ├── api/           # REST API routes
│   │   ├── colleges/      # Search + detail pages
│   │   ├── compare/       # Comparison page
│   │   ├── predict/       # Rank predictor
│   │   ├── dashboard/     # User dashboard
│   │   ├── saved/         # Saved colleges
│   │   └── profile/       # User profile
│   ├── components/        # UI components
│   ├── lib/               # Services, auth, validations
│   └── test/              # Vitest tests
└── README.md
```

## API Documentation

### `GET /api/colleges`
Search, filter, sort, paginate colleges.

| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 12) |
| search | string | Search name/city/state |
| state | string | Filter by state |
| ownership | enum | GOVERNMENT, PRIVATE, etc. |
| minFees, maxFees | number | Fee range |
| minRating | number | Minimum rating |
| maxNirfRank | number | Max NIRF rank |
| course | string | Filter by course name |
| sortBy | enum | name, fees, rating, nirfRank, avgPackage |

### `GET /api/colleges/[slug]`
Full college profile with courses, placements, reviews, facilities, admissions, cutoffs.

### `GET /api/compare?c=id1&c=id2`
Compare 2-3 colleges side-by-side.

### `POST /api/predict`
Rank predictor engine.

```json
{
  "exam": "JEE_MAIN",
  "category": "GENERAL",
  "gender": "MALE",
  "homeState": "Delhi",
  "rank": 5000
}
```

### `GET/POST/DELETE /api/saved`
Manage saved colleges (auth required).

### `POST /api/users`
Register new user.

## Database Schema

```
User ──┬── SavedCollege ── College
       ├── Shortlist ── ShortlistItem ── College
       ├── Comparison
       ├── ActivityLog
       └── Review ── College

College ──┬── Course
          ├── Placement
          ├── Cutoff
          ├── Facility
          └── Admission
```

## Features

- **Search & Filter** — Debounced search, infinite scroll, multi-filter
- **College Detail** — 7 tabs: Overview, Courses, Placements, Admissions, Facilities, Reviews, Statistics
- **Compare** — Shareable URL `/compare?c=id1&c=id2`
- **Rank Predictor** — JEE Main/JoSAA/CSAB with probability + confidence scores
- **Auth** — Email + Google login, protected routes
- **Saved Colleges** — Save, remove, shortlist, track comparisons

## Deployment (Vercel + Neon)

1. Create a [Neon](https://neon.tech) PostgreSQL database
2. Copy connection string to `DATABASE_URL`
3. Push to GitHub
4. Import to [Vercel](https://vercel.com)
5. Set environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (your Vercel domain)
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
6. Run `npx prisma db push` and `npx prisma db seed` via Vercel CLI or build hook

## Testing

```bash
npm test
```

- Unit tests: utils, validations, rank engine
- Component tests: UI components
- Integration tests: college service filters

## Interview Preparation

### College Search Module
- **Why:** Server-side filtering via Prisma keeps frontend lean; TanStack Query handles caching/infinite scroll
- **Alternative:** Elasticsearch for full-text search at scale
- **Tradeoff:** PostgreSQL ILIKE is simpler but slower at millions of rows
- **Scale:** Add Redis cache for popular queries, read replicas

### Rank Predictor
- **Why:** Rule-based engine on stored cutoffs is transparent and fast for MVP
- **Alternative:** ML model trained on historical admission data
- **Tradeoff:** Less accurate for edge cases but explainable and debuggable
- **Scale:** Pre-compute predictions for common rank ranges, batch process

### Auth
- **Why:** NextAuth with JWT sessions avoids DB lookups per request
- **Alternative:** Clerk, Auth0 for managed auth
- **Tradeoff:** JWT can't be revoked instantly without blocklist
- **Scale:** Move to database sessions for enterprise needs

## Tradeoffs

| Decision | Pro | Con |
|----------|-----|-----|
| Monolith (Next.js) | Fast development, single deploy | Harder to scale individual services |
| Prisma ORM | Type-safe, migrations | Slight overhead vs raw SQL |
| Client-side infinite scroll | Better UX | More API calls |
| Rule-based predictor | Explainable, fast | Less accurate than ML |

## Future Improvements

- Elasticsearch integration for advanced search
- ML-based rank prediction with historical trends
- Real-time cutoff updates during counseling
- College recommendation engine based on preferences
- Mobile app with React Native
- Admin panel for data management
- Email notifications for cutoff changes

## License

MIT
