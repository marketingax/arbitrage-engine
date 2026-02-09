# API Reference - Example Requests & Responses

## Base URL
```
http://localhost:3000/api/ingest  (Development)
https://your-domain.com/api/ingest  (Production)
```

## Method
```
POST
```

---

## Request Examples

### 1. Fetch from Reddit Only

**Request:**
```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "source": "reddit",
    "limit": 5
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "sources": ["reddit"],
  "count": 3,
  "opportunities": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Building an AI content generator tool",
      "description": "I've been working on an AI tool that helps content creators...",
      "source": "reddit",
      "source_url": "https://reddit.com/r/entrepreneur/comments/abcdef123",
      "source_id": "abcdef123",
      "raw_data": {
        "subreddit": "entrepreneur",
        "upvotes": 245,
        "comments": 18,
        "created_utc": 1707312693
      },
      "revenue_potential": 65,
      "timeline_days": 10,
      "skill_match": 75,
      "momentum": 26.3,
      "competition": 55,
      "improvement_margin": 70,
      "distribution_leverage": 65,
      "margin_potential": 70,
      "final_score": 67.45,
      "score_breakdown": {
        "revenue_potential": 65,
        "timeline": 72.73,
        "skill_match": 75,
        "momentum": 26.3,
        "competition": 55,
        "base_score": 64.77,
        "improvement_margin_bonus": 0,
        "distribution_leverage_bonus": 0,
        "margin_potential_bonus": 10,
        "time_to_market_bonus": 0,
        "total_modifiers": 10
      },
      "time_to_market_bonus": 0,
      "status": "new",
      "created_at": "2026-02-07T03:51:33.000Z"
    }
  ]
}
```

---

### 2. Fetch from Product Hunt Only

**Request:**
```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "source": "producthunt",
    "limit": 3
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "sources": ["producthunt"],
  "count": 2,
  "opportunities": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "NotebookLM",
      "description": "AI-powered note-taking and knowledge synthesis",
      "source": "producthunt",
      "source_url": "https://www.producthunt.com/posts/notebooklm",
      "source_id": "ph_123456",
      "raw_data": {
        "votes": 1240,
        "comments": 87,
        "reviews": 156,
        "makers": ["john_doe", "jane_smith"]
      },
      "revenue_potential": 75,
      "timeline_days": 10,
      "skill_match": 80,
      "momentum": 80.0,
      "competition": 50,
      "improvement_margin": 75,
      "distribution_leverage": 85,
      "margin_potential": 80,
      "final_score": 80.15,
      "score_breakdown": {
        "revenue_potential": 75,
        "timeline": 72.73,
        "skill_match": 80,
        "momentum": 80.0,
        "competition": 50,
        "base_score": 74.15,
        "improvement_margin_bonus": 10,
        "distribution_leverage_bonus": 15,
        "margin_potential_bonus": 10,
        "time_to_market_bonus": 0,
        "total_modifiers": 35
      },
      "time_to_market_bonus": 0,
      "status": "new",
      "created_at": "2026-02-07T03:51:35.000Z"
    }
  ]
}
```

---

### 3. Fetch from All Sources

**Request:**
```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "source": "all",
    "limit": 10
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "sources": ["github", "moltbook", "reddit", "twitter", "producthunt", "appsumo"],
  "count": 47,
  "opportunities": [
    {
      "id": "uuid-1",
      "title": "Build better with React",
      "description": "Popular React library",
      "source": "github",
      "source_url": "https://github.com/facebook/react",
      "source_id": "12345",
      "final_score": 72.5,
      "status": "new"
    },
    {
      "id": "uuid-2",
      "title": "AI Startup Discussion",
      "description": "Thread about building AI startups",
      "source": "reddit",
      "source_url": "https://reddit.com/r/entrepreneur/comments/xyz",
      "source_id": "xyz123",
      "momentum": 45.2,
      "final_score": 68.3,
      "status": "new"
    },
    {
      "id": "uuid-3",
      "title": "New SaaS Tool Trending",
      "description": "Everyone talking about this new tool",
      "source": "twitter",
      "source_url": "https://twitter.com/user/status/123456",
      "source_id": "123456",
      "momentum": 72.5,
      "final_score": 75.8,
      "status": "new"
    }
  ]
}
```

---

### 4. Fetch from AppSumo

**Request:**
```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "source": "appsumo",
    "limit": 5
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "sources": ["appsumo"],
  "count": 4,
  "opportunities": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "title": "Notion AI Pro Bundle",
      "description": "All-in-one workspace with AI features",
      "source": "appsumo",
      "source_url": "https://appsumo.com/products/notion-pro",
      "source_id": "notion_pro_bundle",
      "raw_data": {
        "category": "Productivity",
        "price": 299,
        "original_price": 999,
        "rating": 4.8,
        "review_count": 342,
        "trending_score": 8.7
      },
      "revenue_potential": 70,
      "timeline_days": 14,
      "skill_match": 75,
      "momentum": 75.0,
      "competition": 60,
      "improvement_margin": 70,
      "distribution_leverage": 75,
      "margin_potential": 75,
      "final_score": 74.35,
      "score_breakdown": {
        "revenue_potential": 70,
        "timeline": 63.63,
        "skill_match": 75,
        "momentum": 75.0,
        "competition": 60,
        "base_score": 71.35,
        "improvement_margin_bonus": 0,
        "distribution_leverage_bonus": 15,
        "margin_potential_bonus": 10,
        "time_to_market_bonus": 0,
        "total_modifiers": 25
      },
      "time_to_market_bonus": 0,
      "status": "new",
      "created_at": "2026-02-07T03:51:40.000Z"
    }
  ]
}
```

---

### 5. Fetch from Twitter (With Config)

**Request:**
```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "source": "twitter",
    "limit": 3
  }'
```

**Response (200 OK) - With Valid Bearer Token:**
```json
{
  "success": true,
  "sources": ["twitter"],
  "count": 3,
  "opportunities": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "title": "Building AI SaaS in 2026 - here's what...",
      "description": "Building AI SaaS in 2026 - here's what actually works. Context windows are bigger than ever, training costs are down...",
      "source": "twitter",
      "source_url": "https://twitter.com/user123/status/1755123456",
      "source_id": "1755123456",
      "raw_data": {
        "author": "user123",
        "author_followers": 15000,
        "engagement_metrics": {
          "like_count": 2340,
          "retweet_count": 567,
          "reply_count": 189,
          "impression_count": 45000
        },
        "created_at": "2026-02-06T12:34:56.000Z"
      },
      "revenue_potential": 70,
      "timeline_days": 5,
      "skill_match": 85,
      "momentum": 80.6,
      "competition": 45,
      "improvement_margin": 75,
      "distribution_leverage": 80,
      "margin_potential": 80,
      "final_score": 78.53,
      "score_breakdown": {
        "revenue_potential": 70,
        "timeline": 98.28,
        "skill_match": 85,
        "momentum": 80.6,
        "competition": 45,
        "base_score": 78.03,
        "improvement_margin_bonus": 10,
        "distribution_leverage_bonus": 15,
        "margin_potential_bonus": 10,
        "time_to_market_bonus": 5,
        "total_modifiers": 40
      },
      "time_to_market_bonus": 5,
      "status": "new",
      "created_at": "2026-02-07T03:51:45.000Z"
    }
  ]
}
```

---

## Error Responses

### 400 - Bad Request (Unknown Source)

**Request:**
```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"source": "invalid_source"}'
```

**Response:**
```json
{
  "error": "No opportunities found from specified sources"
}
```

### 400 - Missing API Key (Some sources fall back to mock)

**Request (Twitter without TWITTER_BEARER_TOKEN):**
```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"source": "twitter", "limit": 10}'
```

**Response (Still 200 with fallback mock data):**
```json
{
  "success": true,
  "sources": ["twitter"],
  "count": 1,
  "opportunities": [
    {
      "title": "AI/SaaS Innovation Thread",
      "description": "Emerging discussion about AI tooling and SaaS opportunities",
      "source": "twitter",
      "source_url": "https://twitter.com/search?q=AI%20SaaS",
      "source_id": "twitter_fallback_1",
      "raw_data": {
        "reason": "API not configured"
      },
      "final_score": 77.65,
      "status": "new"
    }
  ]
}
```

### 500 - Server Error

**Response:**
```json
{
  "error": "Failed to ingest from [source]"
}
```

---

## Database Verification

### Check Results in Opportunities Table

```bash
# Using psql / Supabase CLI
SELECT source, COUNT(*) as count, AVG(final_score) as avg_score
FROM opportunities
WHERE source IN ('reddit', 'twitter', 'producthunt', 'appsumo')
  AND created_at > now() - interval '1 hour'
GROUP BY source
ORDER BY count DESC;

# Expected output:
# source        | count | avg_score
# reddit        |    12 |     68.5
# twitter       |     8 |     76.2
# producthunt   |     6 |     79.1
# appsumo       |    10 |     73.8
```

### Check Cron Run Logs

```bash
SELECT source, status, records_stored, error_message, created_at
FROM cron_runs
WHERE created_at > now() - interval '1 hour'
ORDER BY created_at DESC;

# Expected output:
# source        | status  | records_stored | error_message | created_at
# reddit        | success |            12  | NULL          | 2026-02-07 03:51:45
# twitter       | success |             8  | NULL          | 2026-02-07 03:51:47
# producthunt   | success |             6  | NULL          | 2026-02-07 03:51:50
# appsumo       | success |            10  | NULL          | 2026-02-07 03:51:52
```

---

## Rate Limiting & Timeouts

| Source | Timeout | Rate Limit | Recommendation |
|--------|---------|-----------|-----------------|
| Reddit | 5s | 60/min | ✅ Safe to call frequently |
| Twitter | 8s | 300/15min | ✅ Daily/hourly scheduled |
| Product Hunt | 8s | 100/hr | ⚠️ Call 1-2x per day |
| AppSumo | 8s | ~30/min | ✅ Safe to call 2-3x/day |

---

## Payload Size

| Source | Avg Response | With raw_data |
|--------|-------------|---------------|
| Reddit | ~2 KB | ~8 KB |
| Twitter | ~3 KB | ~12 KB |
| Product Hunt | ~2.5 KB | ~10 KB |
| AppSumo | ~2 KB | ~8 KB |

**Total for 50 opportunities:** ~10-15 MB (depending on raw_data)

---

## Node.js/cURL Testing

### Using Node.js fetch:
```javascript
const response = await fetch('http://localhost:3000/api/ingest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    source: 'reddit',
    limit: 10
  })
});

const data = await response.json();
console.log(`Got ${data.count} opportunities`);
```

### Using Python requests:
```python
import requests

response = requests.post(
  'http://localhost:3000/api/ingest',
  json={
    'source': 'reddit',
    'limit': 10
  }
)

data = response.json()
print(f"Got {data['count']} opportunities")
```

---

**Last Updated:** February 7, 2026
