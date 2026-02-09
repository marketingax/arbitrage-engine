# Features.md — Arbitrage Engine MVP

## Overview
The Arbitrage Engine is a rapid opportunity discovery and execution platform. It crawls 7 data sources, scores opportunities based on arbitrage potential (build/improve fast + leverage distribution + high margins), and surfaces the best plays via an intuitive dashboard.

**Goal:** Find underexploited opportunities → rapidly build/improve → flip via ClickBank/AppSumo/affiliates → profit.

---

## Feature Set

### 1. Data Ingestion Pipeline
**Description:** Autonomous crawler that pulls opportunities from 7 sources, normalizes data, and stores in Supabase.

**Data Sources:**
- Moltbook (AI agent ecosystem)
- GitHub trending (new tools, trending repos)
- Reddit (r/entrepreneur, r/SideProject, r/products — pain points + sentiment)
- X/Twitter (hashtags: #buildinpublic, #productlaunch, #startup)
- Product Hunt (daily launches, top-voted)
- AppSumo (trending deals, gaps in marketplace)
- HackerNews (Show HN, trending tech)

**Acceptance Criteria:**
- [ ] Each source returns normalized opportunity data (title, description, URL, source, timestamp)
- [ ] Data stored in `opportunities` table with status `raw`
- [ ] Crawler runs on schedule (OpenClaw cron, configurable frequency)
- [ ] Handles API rate limits gracefully (backoff/retry)
- [ ] Deduplicates opportunities across sources
- [ ] Logs all ingestion events (success/failure) for audit

**Output:** Raw opportunity records in Supabase `opportunities` table.

---

### 2. Opportunity Scoring Engine
**Description:** Ranks opportunities based on arbitrage potential: revenue, timeline, skill match, momentum, competition, improvement margin, distribution leverage, margin potential.

**Scoring Formula:**
```
Base Score = (Revenue * 0.40) + (Timeline * 0.25) + (SkillMatch * 0.20) + (Momentum * 0.10) + (Competition * 0.05)

Modifiers:
- Improvement Margin bonus: +20 points if we can improve significantly
- Distribution Leverage bonus: +15 points if ClickBank/AppSumo compatible
- Margin Potential bonus: +10 points if we can give 50%+ to affiliates + still profit
- Time to Market bonus: +5 points if shippable in <7 days
```

**Scoring Dimensions:**
- **Revenue Potential (0-100):** Estimated monthly revenue if executed well
- **Timeline (0-100):** Days to first shippable version (inverse — faster = higher)
- **Skill Match (0-100):** How well does this match our core competencies?
- **Momentum (0-100):** Growth rate, engagement, trending signal
- **Competition (0-100):** Inverse of market saturation (lower competition = higher)
- **Improvement Margin (0-100):** How much can we improve on existing solutions?
- **Distribution Leverage (0-100):** Can we tap ClickBank/AppSumo/affiliate networks?
- **Margin Potential (0-100):** Can margins support 50%+ affiliate commissions?
- **Time to Market (0-100):** Can we ship in <7 days? (enables rapid iteration)

**Acceptance Criteria:**
- [ ] Scoring logic implemented in backend (Node.js/API)
- [ ] Each dimension scored by dedicated micrologic or LLM analysis
- [ ] Final score = weighted formula + modifiers
- [ ] Scores updated in `opportunities` table
- [ ] Manual override capability (Preston can adjust scores via UI)
- [ ] Score breakdown visible in UI (show component scores, not just final)
- [ ] Scoring audit trail (log when scores change, why, by whom)

**Output:** Scored opportunities ranked by final score.

---

### 3. Dashboard UI
**Description:** Dark-themed, glowing accents, intuitive interface to browse, filter, and manage opportunities.

**Main Views:**

#### 3a. Opportunity Feed (Primary Dashboard)
- **Layout:** Card-based grid (responsive, 1-3 columns)
- **Card Contents:**
  - Opportunity title
  - Source badge (GitHub, Reddit, Product Hunt, etc.)
  - Final score (prominent, color-coded: green >80, yellow 50-80, red <50)
  - Score breakdown (Revenue, Timeline, SkillMatch, Momentum, Competition, Distribution Leverage, Margin Potential)
  - Short description (truncated, expandable)
  - Key metrics (estimated revenue, days to ship, improvement potential)
  - Action buttons: "View Details," "Mark as Pursuing," "Passed," "Watching"

- **Sorting Options:**
  - By score (descending)
  - By source
  - By date added
  - By status (pursuing, passed, watching)
  - Custom (user-defined weights)

- **Filtering Options:**
  - By score range (slider)
  - By source (multi-select)
  - By status (pursuing, passed, watching)
  - By timeline (days to ship)
  - By estimated revenue range
  - Text search (title + description)

- **UI Theme:**
  - Dark background (charcoal/near-black)
  - Glowing accents (electric blue, cyan, neon green)
  - Clean typography (Geist/system fonts)
  - Smooth transitions and hover states
  - Mobile-responsive

**Acceptance Criteria:**
- [ ] Displays 20 opportunities per page (lazy load or pagination)
- [ ] All sorting options functional
- [ ] All filters work independently and combined
- [ ] Search is real-time
- [ ] Cards render in <100ms
- [ ] Responsive on mobile/tablet/desktop
- [ ] Hover states show action buttons clearly
- [ ] Dark theme with glowing accents (no eye strain)

#### 3b. Opportunity Details Panel
- **Triggered by:** Clicking "View Details" on a card
- **Contents:**
  - Full opportunity title + description
  - Source + original URL (linked)
  - Complete score breakdown (all 9 dimensions with explanations)
  - Manual score override controls (Preston can adjust)
  - Status selector (Pursuing, Passed, Watching)
  - Notes field (collaborative notes, timestamped)
  - Timeline estimate (days to first shippable version)
  - Revenue estimate (if available)
  - Improvement opportunities (what we can do better)
  - Distribution channels (which marketplaces/platforms fit)
  - Action buttons: "Start Building," "Archive," "Share"

**Acceptance Criteria:**
- [ ] Loads in <200ms
- [ ] All fields editable/override-capable
- [ ] Notes persist to Supabase
- [ ] Status changes auto-save
- [ ] Score overrides logged with timestamp + reason field
- [ ] Share generates short link or shareable summary

#### 3c. Status Dashboard (Summary View)
- **Metrics:**
  - Total opportunities in system
  - Opportunities by status (Pursuing, Passed, Watching)
  - Average score
  - Highest-scoring opportunity
  - Most recent additions (last 24h)
  - Distribution by source
  - Upcoming data refreshes (cron status)

**Acceptance Criteria:**
- [ ] Real-time metrics (updated on data refresh)
- [ ] Visual charts (pie/bar for distributions)
- [ ] Last sync timestamp displayed
- [ ] Cron job status indicator (next run, success/failure)

---

### 4. Decision Tracking System
**Description:** Tag opportunities as "Pursuing," "Passed," or "Watching" to track what we're actually building.

**Features:**
- Status selector on every card and details panel
- Status persistence in `opportunities` table (status field)
- Filter by status on main feed
- "Pursuing" list (active builds — primary focus)
- "Watching" list (monitoring, might build later)
- "Passed" list (rejected, reference for future)

**Acceptance Criteria:**
- [ ] Status change saves instantly to Supabase
- [ ] Status visible on card badge
- [ ] Pursuing opportunities highlighted or top-ranked
- [ ] Status change logged (timestamp + action)
- [ ] Can bulk-change status (select multiple, change all)

---

### 5. Manual Override & Customization
**Description:** Preston can adjust scores, weights, and filtering to refine what surfaces as high-priority.

**Features:**
- Score override (click a score, manually enter new value)
- Weighting customization (adjust the 40/25/20/10/5 split)
- Custom sort criteria (save filters/sorts as presets)
- Quick actions (mark as pursuing, archive, share)

**Acceptance Criteria:**
- [ ] Override changes logged (who, when, why)
- [ ] Weights applied in real-time to rankings
- [ ] Presets saved to user profile/Supabase
- [ ] Undo capability (revert override)

---

### 6. Database Schema
**Tables:**

#### `opportunities`
```
id (uuid, pk)
title (text)
description (text)
source (enum: moltbook|github|reddit|twitter|producthunt|appsumo|hackernews)
source_url (text, unique per source)
source_id (text, unique identifier from source)
raw_data (jsonb, full original data from source)

-- Scoring
revenue_potential (int, 0-100)
timeline_days (int)
skill_match (int, 0-100)
momentum (int, 0-100)
competition (int, 0-100)
improvement_margin (int, 0-100)
distribution_leverage (int, 0-100)
margin_potential (int, 0-100)
time_to_market_bonus (int, 0-100)
final_score (decimal)
score_breakdown (jsonb, detailed scoring)

-- Status & Tracking
status (enum: new|pursuing|passed|watching, default: new)
manual_override (boolean)
override_score (decimal, if manually set)
override_reason (text)
override_by (uuid, fk to users if auth added)
override_at (timestamp)

-- Metadata
created_at (timestamp)
updated_at (timestamp)
ingested_at (timestamp, when pulled from source)
last_scored_at (timestamp)
```

#### `opportunity_notes`
```
id (uuid, pk)
opportunity_id (uuid, fk)
note_text (text)
created_by (text, agent/user name)
created_at (timestamp)
updated_at (timestamp)
```

#### `cron_runs`
```
id (uuid, pk)
source (text, which data source)
status (enum: success|failed|partial)
records_pulled (int)
records_stored (int)
error_message (text, if failed)
run_at (timestamp)
completed_at (timestamp)
```

**Acceptance Criteria:**
- [ ] Schema created in Supabase
- [ ] All foreign keys configured
- [ ] Indexes on frequently-queried fields (source, status, final_score, created_at)
- [ ] RLS policies allow app to read/write (MVP: permissive, lock later)
- [ ] Migrations tracked and reproducible

---

### 7. Data Refresh & Automation
**Description:** OpenClaw cron jobs pull fresh data from sources on a schedule.

**Cron Jobs:**
- **Moltbook:** Every 6 hours
- **GitHub Trending:** Every 12 hours
- **Reddit:** Every 6 hours (multiple subreddits in parallel)
- **Twitter/X:** Every 4 hours (API-dependent)
- **Product Hunt:** Daily (fresh launches)
- **AppSumo:** Daily
- **HackerNews:** Every 8 hours

**Acceptance Criteria:**
- [ ] Cron jobs defined in OpenClaw
- [ ] Each job logs success/failure to `cron_runs` table
- [ ] Failed jobs retry with exponential backoff
- [ ] Data deduplication (don't re-ingest same opportunity)
- [ ] Logging includes record count + timestamps
- [ ] Dashboard shows cron status (last run, next run, success rate)

---

## Implementation Order (Phased)

### Phase 1: MVP Foundation (Days 1-2)
1. Database schema + Supabase setup
2. Basic data ingestion (Moltbook + GitHub, hardcoded pull)
3. Scoring logic (40/25/20/10/5 + modifiers)
4. Dashboard UI (card grid + basic filters)
5. Manual status tracking (Pursuing/Passed/Watching)

### Phase 2: Expand & Polish (Day 3)
1. Add remaining data sources (Reddit, Twitter, Product Hunt, AppSumo, HN)
2. Cron automation (schedule pulls)
3. Details panel + manual override
4. Score breakdowns + customization
5. Performance optimization (lazy load, caching)

### Phase 3: Iterate & Refine (Post-MVP)
1. User auth (if needed)
2. Collaborative notes + team features
3. Advanced filtering/sorting
4. Data export (CSV, JSON)
5. Public dashboard (if shareable)

---

## Success Criteria

- [ ] Dashboard loads in <2s on first visit
- [ ] Data sources pull fresh opportunities every 4-12h
- [ ] Scoring engine surfaces top 10 opportunities accurately
- [ ] Filters + sorting work smoothly
- [ ] Manual overrides persist and log changes
- [ ] UI is dark/glowing/intuitive per Preston's spec
- [ ] No bugs blocking "Pursuing" workflow
- [ ] Cron jobs succeed 99%+ of the time
- [ ] Schema handles 10k+ opportunities without slowdown

---

## Tech Stack (Locked)
- **Frontend:** Next.js (React) + TypeScript + Tailwind CSS
- **Backend:** Next.js API routes + Node.js
- **Database:** Supabase (PostgreSQL)
- **Automation:** OpenClaw cron
- **Deployment:** Vercel (if pushed)

---

## Notes
- **No auth MVP:** MVP is single-user/team-only. Auth can be added later if needed.
- **Manual overrides logged:** Preston can tweak scores, but changes are audited.
- **Rapid iteration loop:** MVP → test with Preston/Spencer → iterate based on feedback.
- **Affiliates + ClickBank:** Out of scope for MVP (handled externally), but UI should hint at distribution potential for each opp.

---

**Status:** Ready for review + approval by Preston/Spencer/Atlas before build begins.
