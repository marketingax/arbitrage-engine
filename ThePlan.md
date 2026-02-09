# The Plan — Arbitrage Engine

**Last Updated:** 2026-02-07  
**Status:** Active Development

---

## Core Vision

**Arbitrage Engine is not just an intelligence tool — it's an arbitrage finder + rapid execution factory.**

We're building a system that:

1. **Finds opportunities** — Spots products that exist but are mediocre, gaps in the market, trending tools
2. **Scores them** — Based on how fast we can build/improve + revenue potential + distribution leverage
3. **Surfaces the best plays** — Dashboard shows top opportunities we should pursue
4. **Enables rapid execution** — We build/improve fast, then leverage existing distribution channels (ClickBank, AppSumo, affiliates)

---

## Business Model

**The Play:**

Intelligence → Spot gap → Build/improve existing idea → List on ClickBank/AppSumo → Let promoters sell it → Repeat

**Key Insight:**

- We don't need to be original — we need to be better and faster
- Low cost to build (AI/automation)
- High margins (digital products)
- Give affiliates big commissions (50%+) to sell for us
- We still win because our cost is so low

**Distribution Channels:**

- ClickBank (affiliate marketplace)
- AppSumo (software deals)
- Product Hunt (launches)
- Direct sales (if warranted)

---

## Data Sources (Priority Order)

1. **GitHub Trending** — New tools, what's getting stars, developer interest
2. **Product Hunt** — Spot mediocre products we can improve
3. **AppSumo** — See what's selling, find gaps
4. **Reddit** — Community pain points, what's broken, what people want
5. **Twitter/X** — Real-time pulse, what's getting attention
6. **Moltbook** — AI agent ecosystem opportunities (Atlas already monitoring)
7. **HackerNews** — Tech community trends

---

## Scoring Framework

**What makes a good opportunity?**

| Metric | Weight | What We're Measuring |
| --- | --- | --- |
| **Revenue Potential** | 40% | Can we make money from this? Is there clear demand? |
| **Timeline** | 25% | Can we ship in days/weeks (not months)? |
| **Skill Match** | 20% | Do we have the skills to build this with AI assistance? |
| **Momentum** | 10% | Is this gaining traction? (GitHub stars, upvotes, mentions) |
| **Competition** | 5% | How hard will it be to stand out? |

**Additional Filters:**

- **Improvement Margin** — How much better can we make it vs. what exists?
- **Distribution Leverage** — Can we tap into existing channels (ClickBank, AppSumo)?
- **Margin Potential** — Can we give 50%+ to affiliates and still profit?
- **Time to Market** — Can we ship fast enough to capture opportunity?

---

## Tech Stack

| Component | Technology | Purpose |
| --- | --- | --- |
| **Database** | Supabase | Structured tables for opportunities, trends, scoring |
| **Frontend** | Next.js 16 + React 19 | Dashboard UI |
| **Styling** | Tailwind CSS v4 | Dark theme, glowing accents, clean/intuitive |
| **Automation** | OpenClaw cron jobs | Automated data pulls from sources |
| **Data Pipeline** | Atlas's ingestion scripts | Pull from GitHub, Reddit, PH, AppSumo, etc. |
| **Hosting** | Vercel | Fast deployment, serverless functions |

---

## UI/UX Requirements (Preston's Vision)

**Visual Direction:**

- ✅ Dark theme (primary)
- ✅ Glowing accents (highlights, CTAs, scores)
- ✅ Clean and intuitive (minimal friction)
- ✅ Data-dense but not overwhelming
- ✅ Built to minimize nitpicking later (Preston will iterate)

**Key Screens:**

1. **Dashboard Home** — Top-scored opportunities, quick filters
2. **Opportunity Detail** — Full breakdown of why it scored high
3. **Decision Tracking** — Tag ideas as "pursuing," "passed," "watching"
4. **Source Explorer** — Browse raw feeds from each source
5. **Manual Override** — Adjust scores based on human intuition

---

## MVP Timeline

**Phase 1 (Days 1-2): Foundation**
- Database schema + Supabase setup
- Basic data ingestion (Moltbook + GitHub)
- Scoring logic implementation
- Dashboard UI (card grid + filters)
- Manual status tracking

**Phase 2 (Day 3): Expansion**
- Add remaining data sources
- Cron automation
- Details panel + manual override
- Score breakdowns
- Performance optimization

**Phase 3 (Post-MVP): Refinement**
- User auth (if needed)
- Collaborative features
- Advanced filtering
- Data export
- Public dashboard (optional)

---

## Success Criteria

- [ ] Dashboard loads in <2s
- [ ] Data sources pull fresh opportunities every 4-12h
- [ ] Top 10 opportunities surface accurately
- [ ] Filters + sorting work smoothly
- [ ] Manual overrides persist and log
- [ ] Dark theme + glowing accents (per Preston spec)
- [ ] No bugs blocking "Pursuing" workflow
- [ ] Cron jobs succeed 99%+ of the time
- [ ] Handles 10k+ opportunities without slowdown

---

## Team Roles

| Role | Responsibilities |
| --- | --- |
| **Preston (pcpaperchaser)** | Vision, UI direction, code push to GitHub |
| **Spencer (Fame Johnson)** | Product validation, data source feedback |
| **Miko** | Frontend/dashboard coding, schema design, Features.md |
| **Atlas** | Data pipeline architecture, cron setup, coordination |

---

## Key Decisions (Locked In)

1. **Arbitrage over originality** — We're hunting for existing gaps we can improve, not building from scratch
2. **Speed over perfection** — Ship fast, iterate based on Preston/Spencer feedback
3. **Distribution-first thinking** — Every opportunity evaluated for ClickBank/AppSumo/affiliate potential
4. **Dark theme + glowing accents** — Preston's visual standard for all screens
5. **Supabase + Next.js** — Tech stack locked, no pivots mid-project
6. **ECHO v1.3.4 methodology** — All code follows Flawless Protocol + GUARDIAN compliance

---

## Next Steps

1. ✅ ThePlan.md written
2. ✅ Features.md written
3. → **Preston/Spencer approve both docs**
4. → **Miko starts Phase 1 build (database + ingestion + scoring)**
5. → **Atlas sets up cron jobs + data pipeline**
6. → **Daily sync on progress + adjustments**

---

**Status:** Ready for approval. Awaiting Preston/Spencer sign-off before Phase 1 begins.
