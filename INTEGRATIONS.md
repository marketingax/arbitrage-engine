# Arbitrage Engine - Data Source Integration Guide

## Overview

The ingest pipeline has been updated with **4 new data sources** in addition to GitHub and Moltbook:

1. **Reddit** - Trending posts from r/entrepreneur, r/startups, r/SideProject
2. **Twitter/X** - AI/SaaS discussions and trending topics
3. **Product Hunt** - Trending products with upvotes and maker response
4. **AppSumo** - Trending SaaS deals and marketplace products

## API Endpoint

**POST /api/ingest**

### Request Format

```json
{
  "source": "github" | "moltbook" | "reddit" | "twitter" | "producthunt" | "appsumo" | "all",
  "limit": 50
}
```

### Examples

```bash
# Single source
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{ "source": "reddit", "limit": 30 }'

# All sources
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{ "source": "all", "limit": 20 }'

# Twitter source
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{ "source": "twitter", "limit": 50 }'
```

### Response Format

```json
{
  "success": true,
  "sources": ["reddit", "twitter"],
  "count": 45,
  "opportunities": [
    {
      "id": "uuid",
      "title": "AI Content Generator Opportunity",
      "description": "...",
      "source": "reddit",
      "source_url": "https://reddit.com/...",
      "source_id": "reddit_123",
      "final_score": 78.5,
      "score_breakdown": {
        "revenue_potential": 70,
        "timeline": 85,
        "skill_match": 75,
        "momentum": 80,
        "competition": 50,
        "base_score": 72.5,
        "improvement_margin_bonus": 10,
        "distribution_leverage_bonus": 15,
        "margin_potential_bonus": 10,
        "time_to_market_bonus": 5,
        "total_modifiers": 40
      },
      "status": "new"
    }
  ]
}
```

## Data Source Details

### 1. Reddit Ingest

**Subreddits monitored:**
- r/entrepreneur
- r/startups
- r/SideProject

**Metrics extracted:**
- Upvotes (post engagement)
- Comments (discussion intensity)
- Title & description (opportunity context)

**Scoring dimensions:**
- Momentum: Calculated from (upvotes + comments) / 1000 * 100
- Revenue potential: 65
- Timeline: 10 days
- Skill match: 75
- Distribution leverage: 65

**API:** Public Reddit JSON API (no authentication required)

**Rate limits:** ~60 requests/minute

**Status:** ✅ Fully implemented - fallback data available

---

### 2. Twitter/X Ingest

**Search query:** `AI SaaS startup -is:retweet`

**Metrics extracted:**
- Likes, retweets, replies (engagement)
- Author followers (influence)
- Tweet timestamp (freshness)

**Scoring dimensions:**
- Momentum: Calculated from engagement metrics
- Revenue potential: 70
- Timeline: 5 days (fastest TTM)
- Skill match: 85
- Distribution leverage: 80

**API:** Twitter API v2 (requires Bearer Token)

**Rate limits:** 300 requests/15 minutes

**Setup required:**
```bash
# Add to .env.local
TWITTER_BEARER_TOKEN=your_token_here
```

**Get credentials:**
1. Go to https://developer.twitter.com/en/portal/dashboard
2. Create an app in Developer Portal
3. Generate Bearer Token from App settings
4. Add to environment variables

**Status:** ✅ Implemented with graceful fallback if not configured

---

### 3. Product Hunt Ingest

**Query:** Trending products via GraphQL API

**Metrics extracted:**
- Vote count (upvotes)
- Comments & reviews count
- Maker information
- Product URL

**Scoring dimensions:**
- Momentum: (votesCount / 500) * 100
- Revenue potential: 75 (products are more monetizable)
- Timeline: 10 days
- Skill match: 80
- Distribution leverage: 85

**API:** Product Hunt GraphQL API

**Rate limits:** 100 requests/hour

**Setup required:**
```bash
# Add to .env.local
PRODUCTHUNT_API_KEY=your_api_key_here
```

**Get credentials:**
1. Go to https://www.producthunt.com/api/hostname
2. Sign in with your PH account
3. Create an API key under your app settings
4. Add to environment variables

**Status:** ✅ Implemented with graceful fallback if not configured

---

### 4. AppSumo Ingest

**Method:** Public API scraping (no authentication)

**Metrics extracted:**
- Deal trending score
- Product ratings & review count
- Price & original price
- Category information

**Scoring dimensions:**
- Momentum: (rating_count / 100) * 100
- Revenue potential: 70
- Timeline: 14 days
- Skill match: 75
- Distribution leverage: 75

**API:** AppSumo public `/api/deals` endpoint

**Rate limits:** ~30 requests/minute (respectful scraping)

**Setup required:** None - uses public API

**Status:** ✅ Implemented with public API fallback

---

## Error Handling

Each ingest function:
- ✅ Gracefully handles API failures
- ✅ Falls back to mock data when API unavailable
- ✅ Logs errors to `cron_runs` table with failure status
- ✅ Continues processing other sources if one fails
- ✅ Includes timeouts (5-8 seconds per source)

### Cron Runs Table

All ingests log to `cron_runs` table:

```sql
INSERT INTO cron_runs (source, status, records_pulled, records_stored, error_message)
VALUES ('reddit', 'success', 15, 15, NULL);
```

**Fields:**
- `source` - Data source name
- `status` - 'success' | 'failed'
- `records_pulled` - Opportunities fetched
- `records_stored` - Opportunities inserted into DB
- `error_message` - Error details (if failed)
- `created_at` - Timestamp (auto)

---

## Scoring Logic

All opportunities use the same scoring formula:

**Base Score:**
```
Base = (Revenue × 0.40) + (Timeline × 0.25) + (SkillMatch × 0.20) + (Momentum × 0.10) + (Competition × 0.05)
```

**Modifiers:**
- Improvement Margin > 70: +20 points
- Distribution Leverage > 70: +15 points
- Margin Potential > 50: +10 points
- Timeline < 7 days: +5 points

**Final Score:** `Base + Modifiers` (capped at 100)

---

## Testing

### Test each source individually:

```bash
# Test Reddit
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{ "source": "reddit", "limit": 10 }'

# Test Twitter
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{ "source": "twitter", "limit": 10 }'

# Test Product Hunt
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{ "source": "producthunt", "limit": 10 }'

# Test AppSumo
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{ "source": "appsumo", "limit": 10 }'

# Test all sources
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{ "source": "all", "limit": 10 }'
```

### Verify in database:

```sql
-- Check latest ingest results
SELECT source, status, records_stored, created_at 
FROM cron_runs 
ORDER BY created_at DESC 
LIMIT 10;

-- Check opportunities by source
SELECT source, COUNT(*) as count, AVG(final_score) as avg_score
FROM opportunities
GROUP BY source
ORDER BY count DESC;

-- View high-scoring opportunities
SELECT title, source, final_score, momentum
FROM opportunities
WHERE status = 'new'
ORDER BY final_score DESC
LIMIT 20;
```

---

## Deployment Checklist

- [ ] Copy `.env.example` to `.env.local`
- [ ] Add API keys for Twitter and Product Hunt (optional but recommended)
- [ ] Test each source with sample requests
- [ ] Verify `cron_runs` table is logging correctly
- [ ] Check opportunities table has new opportunities
- [ ] Monitor score distributions (avg should be 60-75)
- [ ] Set up cron job for automatic hourly/daily ingests (optional)

---

## Next Steps

1. **Add optional PRAW library** for advanced Reddit features:
   ```bash
   npm install praw
   ```

2. **Implement scheduled ingests** - Set up cron job:
   ```bash
   # Run every hour
   0 * * * * curl -X POST https://your-domain.com/api/ingest \
     -H "Content-Type: application/json" \
     -d '{"source": "all", "limit": 50}'
   ```

3. **Add source-specific filtering** - Enhance momentum calculations per source

4. **Implement deduplication** - Smart filtering across sources for the same opportunity

---

## Architecture

```
POST /api/ingest
    ├── GitHub (existing)
    ├── Moltbook (existing)
    ├── Reddit (NEW) → r/entrepreneur, r/startups, r/SideProject
    ├── Twitter (NEW) → AI SaaS trending
    ├── Product Hunt (NEW) → Trending products
    └── AppSumo (NEW) → Trending deals

    ↓ All sources return:
    {title, description, source_url, source_id, raw_data, scoring_dimensions}

    ↓ Unified scoring
    calculateScore(dimensions) → final_score (0-100)

    ↓ Upsert to database
    opportunities table (deduplicated by source_url)

    ↓ Log results
    cron_runs table (status, record counts, errors)
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "API not configured" fallback only | Add API key to `.env.local` and restart dev server |
| Timeout errors | Check internet connection, increase timeout values |
| 0 opportunities returned | Verify API credentials, check source is returning data |
| Duplicate opportunities | `source_url` upsert should prevent - check for URL inconsistencies |
| Low momentum scores | Review source-specific momentum calculation in code |

---

## Support & Monitoring

Monitor via Supabase dashboard:

1. **Real-time opportunities**: `opportunities` table
2. **Ingest history**: `cron_runs` table
3. **Scoring distribution**: Query average final_score by source
4. **API health**: Check `error_message` field in recent `cron_runs`

---

**Last Updated:** February 7, 2026
**Status:** Ready for Testing & Deployment
