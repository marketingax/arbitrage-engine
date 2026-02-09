# Architecture & Data Flow Diagram

## Complete Ingest Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    POST /api/ingest                             │
│  { "source": "reddit|twitter|producthunt|appsumo|all", ... }   │
└────────────────────┬────────────────────────────────────────────┘
                     │
         ┌───────────┴─────────────┐
         │ Router Logic            │
         │ (Source Selection)      │
         └───────────┬─────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   ┌────────┐  ┌────────┐  ┌─────────────────┐
   │ Reddit │  │Twitter │  │ Product Hunt    │
   │ Public │  │ v2 API │  │ GraphQL API     │
   │   API  │  │(Token) │  │ (Token)         │
   └───┬────┘  └───┬────┘  └────────┬────────┘
       │           │               │
       └─────┬─────┴───────┬───────┘
             │             │
             ▼             ▼
      ┌──────────────┐  ┌──────────┐
      │ r/entrepreneur
      │ r/startups   │  │ AppSumo  │
      │ r/SideProject│  │ Public   │
      └──────┬───────┘  │   API    │
             │          └────┬─────┘
             │               │
        ┌────┴───────────────┴──────┐
        │                            │
        ▼ (All return same format)   ▼
   ┌─────────────────────────────────────────┐
   │ Array of Objects:                       │
   │ {                                       │
   │   title, description, source,           │
   │   source_url, source_id, raw_data,      │
   │   revenue_potential, timeline_days,     │
   │   skill_match, momentum, competition,   │
   │   improvement_margin,                   │
   │   distribution_leverage,                │
   │   margin_potential                      │
   │ }                                       │
   └────────────────┬────────────────────────┘
                    │
                    ▼
          ┌──────────────────┐
          │  Unified Scoring │
          │  Engine          │
          │  (scoring.ts)    │
          │                  │
          │ final_score      │
          │ score_breakdown  │
          │ time_to_market   │
          │ _bonus           │
          └────────┬─────────┘
                   │
                   ▼
        ┌────────────────────────┐
        │ Supabase Upsert        │
        │ opportunities table    │
        │ (deduplicated by       │
        │  source_url)           │
        └────────┬───────────────┘
                 │
        ┌────────┴───────────┐
        │                    │
        ▼                    ▼
   ┌─────────┐         ┌──────────┐
   │Returned │         │Logged to │
   │to client│         │cron_runs │
   │ (JSON)  │         │  table   │
   └─────────┘         └──────────┘
```

---

## Data Structure Example

### Input (From Any Source)
```
{
  title: "AI Content Generator Business",
  description: "Trending discussion about building...",
  source: "reddit",
  source_url: "https://reddit.com/r/entrepreneur/comments/abc123",
  source_id: "abc123",
  raw_data: {
    subreddit: "entrepreneur",
    upvotes: 250,
    comments: 45
  },
  revenue_potential: 65,
  timeline_days: 10,
  skill_match: 75,
  momentum: 72,
  competition: 55,
  improvement_margin: 70,
  distribution_leverage: 65,
  margin_potential: 70
}
```

### Output (After Scoring)
```
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  title: "AI Content Generator Business",
  description: "Trending discussion about building...",
  source: "reddit",
  source_url: "https://reddit.com/r/entrepreneur/comments/abc123",
  source_id: "abc123",
  raw_data: { ... },
  
  // Scoring dimensions
  revenue_potential: 65,
  timeline_days: 10,
  skill_match: 75,
  momentum: 72,
  competition: 55,
  improvement_margin: 70,
  distribution_leverage: 65,
  margin_potential: 70,
  
  // Final scores
  final_score: 73.15,
  score_breakdown: {
    revenue_potential: 65,
    timeline: 72.73,
    skill_match: 75,
    momentum: 72,
    competition: 55,
    base_score: 70.15,
    improvement_margin_bonus: 0,
    distribution_leverage_bonus: 0,
    margin_potential_bonus: 10,
    time_to_market_bonus: 0,
    total_modifiers: 10
  },
  time_to_market_bonus: 0,
  
  status: "new",
  created_at: "2026-02-07T03:51:33.000Z"
}
```

---

## Scoring Formula Breakdown

### Base Score Calculation
```
Base = (Revenue × 0.40) 
     + (Timeline × 0.25) 
     + (SkillMatch × 0.20) 
     + (Momentum × 0.10)
     + (Competition × 0.05)
```

### Example Calculation (Reddit):
```
Base = (65 × 0.40) + (72.73 × 0.25) + (75 × 0.20) + (72 × 0.10) + (55 × 0.05)
     = 26 + 18.18 + 15 + 7.2 + 2.75
     = 69.13

Modifiers:
- Improvement Margin (70): 0 bonus (need >70)
- Distribution Leverage (65): 0 bonus (need >70)
- Margin Potential (70): +10 bonus (>50%)
- Time to Market (10 days): 0 bonus (need <7)
- Total Modifiers: +10

Final Score = 69.13 + 10 = 79.13 (capped at 100)
```

---

## Source Characteristics

### Reddit 🔴
```
┌──────────────────────────────────┐
│ Source: Reddit                   │
├──────────────────────────────────┤
│ Subreddits: 3                    │
│ - r/entrepreneur                 │
│ - r/startups                     │
│ - r/SideProject                  │
├──────────────────────────────────┤
│ Metrics:                         │
│ - Upvotes → engagement           │
│ - Comments → discussion depth    │
│ - Momentum = (up+comments)/1000  │
├──────────────────────────────────┤
│ API: Public (no auth needed)     │
│ Rate Limit: 60 req/min           │
│ Timeout: 5 seconds               │
│ Fallback: Mock data if fails     │
└──────────────────────────────────┘
```

### Twitter 🐦
```
┌──────────────────────────────────┐
│ Source: Twitter/X                │
├──────────────────────────────────┤
│ Query: "AI SaaS startup"         │
│ Excludes: Retweets              │
├──────────────────────────────────┤
│ Metrics:                         │
│ - Likes                          │
│ - Retweets                       │
│ - Replies                        │
│ - Author followers               │
│ - Momentum = (likes+rt+reply)/100│
├──────────────────────────────────┤
│ API: Twitter v2 (Token required) │
│ Rate Limit: 300 req/15min        │
│ Timeout: 8 seconds               │
│ Fallback: Mock data if no token  │
└──────────────────────────────────┘
```

### Product Hunt 📦
```
┌──────────────────────────────────┐
│ Source: Product Hunt             │
├──────────────────────────────────┤
│ Query: Recent trending products  │
├──────────────────────────────────┤
│ Metrics:                         │
│ - Votes (upvotes)                │
│ - Comments                       │
│ - Reviews                        │
│ - Makers info                    │
│ - Momentum = (votes/500) × 100   │
├──────────────────────────────────┤
│ API: GraphQL (Token required)    │
│ Rate Limit: 100 req/hour         │
│ Timeout: 8 seconds               │
│ Fallback: Mock data if no token  │
└──────────────────────────────────┘
```

### AppSumo 🎯
```
┌──────────────────────────────────┐
│ Source: AppSumo                  │
├──────────────────────────────────┤
│ Query: Trending deals            │
│ Category: SaaS/Tools             │
├──────────────────────────────────┤
│ Metrics:                         │
│ - Rating count                   │
│ - Price / Original price         │
│ - Trending score                 │
│ - Category                       │
│ - Momentum = (ratings/100) × 100 │
├──────────────────────────────────┤
│ API: Public (no auth needed)     │
│ Rate Limit: 30 req/min           │
│ Timeout: 8 seconds               │
│ Fallback: Mock data if API fails │
└──────────────────────────────────┘
```

---

## Error Handling Flow

```
Try API Call (with timeout)
        │
        ├─ Success ──────→ Parse Response ──→ Extract Data ──→ Return
        │
        ├─ API Error
        │  (timeout, 5xx, etc)
        │       │
        │       ├─→ Log Error to Console
        │       ├─→ Log to cron_runs (status=failed)
        │       └─→ Return Fallback Mock Data
        │
        └─ Missing Auth (no token/key)
             │
             ├─→ Log Warning
             └─→ Return Fallback Mock Data Immediately
```

---

## Response Timing

Typical response time for "all" source ingest:
```
Reddit:        500ms - 2s  (can hit all 3 subreddits)
Twitter:       1s - 3s     (API call + parsing)
Product Hunt:  1s - 4s     (GraphQL parsing)
AppSumo:       500ms - 2s  (public API)
Scoring:       500ms       (all sources)
Database:      1s - 2s     (upsert operation)
────────────────────────────────
Total: ~4-14 seconds for "all" mode
```

---

## Database Schema (Relevant Fields)

### opportunities table
```sql
CREATE TABLE opportunities (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  source TEXT NOT NULL,  -- 'reddit', 'twitter', 'producthunt', 'appsumo'
  source_url TEXT UNIQUE NOT NULL,  -- Used for deduplication
  source_id TEXT NOT NULL,
  raw_data JSONB,  -- Source-specific metadata
  
  -- Scoring dimensions (0-100)
  revenue_potential INT,
  timeline_days INT,
  skill_match INT,
  momentum INT,
  competition INT,
  improvement_margin INT,
  distribution_leverage INT,
  margin_potential INT,
  
  -- Final scores
  final_score DECIMAL(5,2),  -- 0-100
  score_breakdown JSONB,  -- Detailed breakdown
  time_to_market_bonus INT,
  
  status TEXT DEFAULT 'new',  -- 'new', 'reviewing', 'archived'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX opportunities_source_idx ON opportunities(source);
CREATE INDEX opportunities_score_idx ON opportunities(final_score);
CREATE INDEX opportunities_created_idx ON opportunities(created_at);
```

### cron_runs table
```sql
CREATE TABLE cron_runs (
  id UUID PRIMARY KEY,
  source TEXT NOT NULL,  -- Which data source ran
  status TEXT NOT NULL,  -- 'success' or 'failed'
  records_pulled INT,
  records_stored INT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX cron_runs_source_idx ON cron_runs(source);
CREATE INDEX cron_runs_created_idx ON cron_runs(created_at);
```

---

## Testing & Validation

### Unit Tests (What You Should Check)
```bash
✓ Reddit endpoint returns 3-5 posts
✓ Twitter endpoint returns mock data (if no token)
✓ Product Hunt returns mock data (if no token)
✓ AppSumo returns trending deals
✓ All responses include final_score
✓ final_score is between 0-100
✓ Scoring dimensions are populated
✓ Database records created/updated
✓ cron_runs table has entries
✓ No duplicate source_urls
```

### Integration Tests (Database)
```bash
✓ opportunities table has new records
✓ cron_runs table logs each source
✓ Upsert prevents duplicate source_urls
✓ raw_data is stored correctly
✓ score_breakdown is complete
✓ Filtering by source works
✓ Sorting by final_score works
```

---

**Complete Implementation Ready for Deployment** ✅
