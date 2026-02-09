# Arbitrage Engine MVP

A rapid opportunity discovery and execution platform that finds underexploited opportunities, scores them based on arbitrage potential, and surfaces the best plays via an intuitive dark-themed dashboard.

**Goal:** Find gaps → Build/improve → Flip via ClickBank/AppSumo/affiliates → Profit.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

### Installation

1. **Clone and install dependencies:**
```bash
cd arbitrage-engine
npm install
```

2. **Set up environment variables:**
Copy `.env.local` and fill in your credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
MOLTBOOK_API_KEY=your_key
```

3. **Create Supabase schema:**
Run the SQL migration in Supabase dashboard:
```
src/supabase_schema.sql
```

Or use Supabase CLI:
```bash
supabase db push
```

4. **Start the dev server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Features (Phase 1)

### ✅ Implemented
- [x] Dark theme dashboard with glowing accents (cyan/blue)
- [x] Opportunity card grid with score badges
- [x] Status filtering (New, Pursuing, Watching, Passed)
- [x] Source filtering (GitHub, Reddit, Moltbook, etc.)
- [x] Score-based sorting
- [x] Real-time score slider
- [x] Database schema (Supabase)
- [x] Data ingestion API (GitHub, Moltbook, mock Reddit)
- [x] Scoring engine (40/25/20/10/5 weighted formula + modifiers)
- [x] Opportunity CRUD API

### 🔄 Phase 2 (Coming Soon)
- [ ] Detail panel with score breakdowns
- [ ] Manual score override
- [ ] Cron-based automated data pulls
- [ ] Reddit, Twitter, Product Hunt, AppSumo, HackerNews sources
- [ ] Collaborative notes
- [ ] Advanced filtering
- [ ] Performance optimization

### 📊 Phase 3 (Post-MVP)
- [ ] User authentication
- [ ] Multi-user collaboration
- [ ] Data export (CSV, JSON)
- [ ] Public dashboard
- [ ] Analytics and trends

## 📁 Project Structure

```
arbitrage-engine/
├── app/
│   ├── api/
│   │   ├── ingest/route.ts        # Data ingestion API
│   │   └── opportunities/route.ts # CRUD API
│   ├── globals.css                 # Dark theme + glowing accents
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Dashboard UI
├── components/
│   └── OpportunityCard.tsx         # Opportunity card component
├── lib/
│   ├── scoring.ts                  # Scoring engine logic
│   └── supabase.ts                 # Supabase client & types
├── .env.local                      # Environment variables
├── .gitignore
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── supabase_schema.sql             # Database schema
└── README.md
```

## 🧮 Scoring Logic

**Base Score (0-100):**
```
(Revenue * 0.40) + (Timeline * 0.25) + (SkillMatch * 0.20) + (Momentum * 0.10) + (Competition * 0.05)
```

**Modifiers (if true):**
- Improvement Margin > 70: +20 points
- Distribution Leverage > 70: +15 points
- Margin Potential > 50 (50%+ affiliate cuts possible): +10 points
- Time to Market < 7 days: +5 points

**Final Score:** Base + Modifiers (capped at 100)

### Scoring Dimensions
- **Revenue Potential (0-100):** Estimated monthly revenue if executed well
- **Timeline:** Days to first shippable version (inverse scale)
- **Skill Match (0-100):** How well fits our core competencies
- **Momentum (0-100):** Growth rate, engagement, trending signal
- **Competition (0-100):** Inverse of market saturation
- **Improvement Margin (0-100):** How much better can we make existing solutions?
- **Distribution Leverage (0-100):** Can we tap ClickBank/AppSumo/affiliates?
- **Margin Potential (0-100):** Can margins support 50%+ affiliate commissions?

## 🔌 API Endpoints

### Data Ingestion
```bash
POST /api/ingest
Content-Type: application/json

{
  "source": "github",  // github | moltbook | reddit
  "limit": 50
}

Response: { success, source, count, opportunities }
```

### Fetch Opportunities
```bash
GET /api/opportunities?status=pursuing&source=github&minScore=70&sortBy=score&limit=100&offset=0

Response: { success, opportunities, total, limit, offset }
```

### Update Opportunity
```bash
PATCH /api/opportunities?id=uuid
Content-Type: application/json

{
  "status": "pursuing",
  "override_score": 85,
  "override_reason": "High revenue potential"
}

Response: { success, opportunity }
```

## 🎨 UI/UX Specifications

### Dark Theme
- **Background:** Slate-950 (#020815) with subtle gradient
- **Cards:** Slate-900/50 with cyan/blue glowing borders
- **Text:** White on dark, gray-300 for secondary
- **Accents:** Cyan-400 (primary), Blue-400 (secondary)

### Interaction
- Hover states show glowing shadow effect
- Smooth transitions (200ms default)
- Score badges color-coded: Green (>80), Yellow (50-80), Red (<50)
- Source badges with distinct colors per source

### Responsiveness
- Mobile-first design
- 1 column on mobile, 2 on tablet, 3 on desktop
- Touch-friendly button sizes (min 44px)

## 🔐 Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Data Sources
MOLTBOOK_API_KEY=moltbook_sk_...
GITHUB_API_TOKEN=ghp_...
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
TWITTER_API_KEY=...
PRODUCTHUNT_API_TOKEN=...

# App
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## 🚀 Deployment

### To Vercel
```bash
git push origin main
```

Vercel auto-deploys. Configure environment variables in Vercel dashboard.

### To Self-Hosted
```bash
npm run build
npm run start
```

## 📊 Success Criteria (MVP)

- [x] Dashboard loads in <2s
- [ ] Data sources pull fresh opportunities every 4-12h (Phase 2)
- [ ] Top 10 opportunities surface accurately
- [x] Filters + sorting work smoothly
- [ ] Manual overrides persist and log (Phase 2)
- [x] Dark theme + glowing accents per spec
- [x] No bugs blocking core workflow
- [ ] Cron jobs succeed 99%+ of the time (Phase 2)
- [ ] Schema handles 10k+ opportunities without slowdown

## 🤝 Team Roles

| Role | Responsibilities |
| --- | --- |
| **Preston** | Vision, UI direction, git push |
| **Spencer** | Product validation, data feedback |
| **Miko** | Frontend/dashboard coding, schema |
| **Atlas** | Data pipeline, cron setup, coordination |

## 📝 Notes

- **No auth MVP:** Single-user/team-only for now
- **Manual overrides logged:** Preston can tweak scores, changes are audited
- **Rapid iteration:** MVP → test → iterate based on feedback
- **Affiliates out of scope:** Handled externally, but UI hints at distribution potential

## 🐛 Known Issues

- Reddit ingestion is mock data (Phase 2: use PRAW library)
- Detail panel not yet implemented (Phase 2)
- No cron automation yet (Phase 2: OpenClaw cron)

## 📞 Support

Questions? Check ThePlan.md or Features.md for full specifications.

---

**Status:** Phase 1 MVP complete. Ready for Phase 2 expansion.  
**Last Updated:** 2026-02-07
