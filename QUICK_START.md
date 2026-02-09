# Quick Start - Testing the New Integrations

## 1. No Setup Needed - Test Immediately

Reddit and AppSumo work without any API keys:

```bash
# Test Reddit (no config needed)
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"source": "reddit", "limit": 10}'

# Test AppSumo (no config needed)
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"source": "appsumo", "limit": 10}'

# Test all sources (some with fallback data)
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"source": "all", "limit": 20}'
```

## 2. Optional - Enable Twitter & Product Hunt

### Get Twitter API Access
1. Go to https://developer.twitter.com/en/portal/dashboard
2. Create an app (if you don't have one)
3. Go to "Keys and tokens" tab
4. Generate "Bearer Token"
5. Add to `.env.local`:
```
TWITTER_BEARER_TOKEN=your_token_here
```

### Get Product Hunt API Access
1. Go to https://www.producthunt.com/api/hostname
2. Sign in with your account
3. Create new API key
4. Add to `.env.local`:
```
PRODUCTHUNT_API_KEY=your_key_here
```

### Restart dev server
```bash
npm run dev
```

Now Twitter and Product Hunt will use real API instead of fallback.

## 3. Verify in Database

```sql
-- Check opportunities
SELECT source, COUNT(*) as count
FROM opportunities
WHERE created_at > now() - interval '1 hour'
GROUP BY source;

-- Check cron logs
SELECT source, status, records_stored, created_at
FROM cron_runs
WHERE created_at > now() - interval '1 hour'
ORDER BY created_at DESC;

-- View highest scoring new opportunities
SELECT title, source, final_score, momentum
FROM opportunities
WHERE status = 'new'
ORDER BY final_score DESC
LIMIT 20;
```

## 4. Check Scoring Distribution

```sql
-- Verify scores are 0-100
SELECT 
  source,
  COUNT(*) as total,
  ROUND(AVG(final_score)::numeric, 2) as avg_score,
  MIN(final_score) as min_score,
  MAX(final_score) as max_score
FROM opportunities
WHERE source IN ('reddit', 'twitter', 'producthunt', 'appsumo')
GROUP BY source;
```

Expected: avg_score 60-75, min 30+, max 90+

## 5. Troubleshooting

| Problem | Fix |
|---------|-----|
| Returns 0 opportunities | Check internet, Reddit/AppSumo APIs might be down |
| Twitter/ProductHunt returns only mock | Missing API key in `.env.local`, restart server |
| Error in console | Check URL format in curl command |
| Score calculation off | Verify scoring.ts hasn't changed |

## 6. All Responses Use Same Structure

Every ingest returns:
```json
{
  "success": true,
  "sources": ["reddit"],
  "count": 15,
  "opportunities": [
    {
      "title": "...",
      "description": "...",
      "source": "reddit",
      "source_url": "https://...",
      "source_id": "...",
      "revenue_potential": 65,
      "timeline_days": 10,
      "skill_match": 75,
      "momentum": 68,
      "competition": 55,
      "improvement_margin": 70,
      "distribution_leverage": 65,
      "margin_potential": 70,
      "final_score": 71.25,
      "score_breakdown": {...},
      "status": "new"
    }
  ]
}
```

## 7. Production Checklist

- [ ] Add API keys to production `.env` (optional)
- [ ] Test "all" source mode
- [ ] Verify cron_runs logging
- [ ] Check score distributions look reasonable
- [ ] Set up monitoring for ingest failures
- [ ] (Optional) Create scheduled cron job for hourly ingests

---

**Everything is ready to test!** Start with Reddit/AppSumo (no config), then add Twitter/PH keys if you want real data.
