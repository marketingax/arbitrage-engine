import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import axios from 'axios'
import { calculateScore, ScoringDimensions } from '@/lib/scoring'

/**
 * API route: POST /api/ingest
 * Pulls opportunities from data sources and stores them in Supabase
 * 
 * Request body:
 * {
 *   source: 'github' | 'moltbook' | 'reddit' | 'twitter' | 'producthunt' | 'appsumo' | 'all',
 *   limit: number (default: 50)
 * }
 * 
 * Examples:
 * POST /api/ingest { "source": "reddit", "limit": 30 }
 * POST /api/ingest { "source": "all", "limit": 20 }
 */

export async function POST(request: NextRequest) {
  try {
    const { source = 'github', limit = 50 } = await request.json()

    console.log(`[INGEST] Starting for source: ${source}`)

    let opportunities: any[] = []
    let sources: string[] = []

    // Route to appropriate data source(s)
    if (source === 'all') {
      sources = ['github', 'moltbook', 'reddit', 'twitter', 'producthunt', 'appsumo']
    } else {
      sources = [source]
    }

    for (const src of sources) {
      try {
        let srcOpportunities: any[] = []

        switch (src) {
          case 'github':
            srcOpportunities = await ingestGitHub(limit)
            break
          case 'moltbook':
            srcOpportunities = await ingestMoltbook(limit)
            break
          case 'reddit':
            srcOpportunities = await ingestReddit(limit)
            break
          case 'twitter':
            srcOpportunities = await ingestTwitter(limit)
            break
          case 'producthunt':
            srcOpportunities = await ingestProductHunt(limit)
            break
          case 'appsumo':
            srcOpportunities = await ingestAppSumo(limit)
            break
          default:
            console.warn(`[INGEST] Unknown source: ${src}`)
            continue
        }

        opportunities = opportunities.concat(srcOpportunities)
        console.log(`[INGEST] ${src}: ${srcOpportunities.length} opportunities`)
      } catch (srcError) {
        console.error(`[INGEST] Error ingesting from ${src}:`, srcError)
        // Log failed cron run
        await supabase.from('cron_runs').insert({
          source: src,
          status: 'failed',
          records_pulled: 0,
          records_stored: 0,
          error_message: srcError instanceof Error ? srcError.message : String(srcError),
        })
      }
    }

    if (opportunities.length === 0) {
      return NextResponse.json(
        { error: 'No opportunities found from specified sources' },
        { status: 400 }
      )
    }

    // Score each opportunity
    const scoredOpportunities = opportunities.map((opp) => {
      const dimensions: ScoringDimensions = {
        revenue_potential: opp.revenue_potential || 50,
        timeline_days: opp.timeline_days || 14,
        skill_match: opp.skill_match || 70,
        momentum: opp.momentum || 40,
        competition: opp.competition || 50,
        improvement_margin: opp.improvement_margin || 60,
        distribution_leverage: opp.distribution_leverage || 50,
        margin_potential: opp.margin_potential || 60,
      }

      const scoreResult = calculateScore(dimensions)

      return {
        title: opp.title,
        description: opp.description,
        source: opp.source,
        source_url: opp.source_url,
        source_id: opp.source_id,
        raw_data: opp.raw_data || {},
        revenue_potential: dimensions.revenue_potential,
        timeline_days: dimensions.timeline_days,
        skill_match: dimensions.skill_match,
        momentum: dimensions.momentum,
        competition: dimensions.competition,
        improvement_margin: dimensions.improvement_margin,
        distribution_leverage: dimensions.distribution_leverage,
        margin_potential: dimensions.margin_potential,
        final_score: scoreResult.final_score,
        score_breakdown: scoreResult.score_breakdown,
        time_to_market_bonus: scoreResult.time_to_market_bonus,
        status: 'new',
      }
    })

    // Insert into Supabase (upsert to avoid duplicates)
    const { data, error } = await supabase
      .from('opportunities')
      .upsert(scoredOpportunities, {
        onConflict: 'source_url',
      })
      .select()

    if (error) {
      console.error(`[INGEST] Supabase error:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log successful cron run for each source
    for (const src of sources) {
      const srcCount = scoredOpportunities.filter((o) => o.source === src).length
      if (srcCount > 0) {
        await supabase.from('cron_runs').insert({
          source: src,
          status: 'success',
          records_pulled: srcCount,
          records_stored: srcCount,
        })
      }
    }

    console.log(`[INGEST] Complete: ${data?.length} opportunities stored`)

    return NextResponse.json({
      success: true,
      sources: sources,
      count: data?.length || 0,
      opportunities: data,
    })
  } catch (error) {
    console.error('[INGEST] Error:', error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Ingest from GitHub Trending
 * Uses GitHub API to fetch trending repos
 */
async function ingestGitHub(limit: number) {
  try {
    const response = await axios.get(
      'https://api.github.com/search/repositories?q=stars:>100&sort=stars&order=desc&per_page=' +
        limit,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    )

    return response.data.items.map((repo: any) => ({
      title: repo.name,
      description: repo.description,
      source: 'github',
      source_url: repo.html_url,
      source_id: String(repo.id),
      raw_data: repo,
      revenue_potential: 60, // GitHub repos - moderate revenue potential
      timeline_days: 14,
      skill_match: 80, // We can build with code
      momentum: Math.min(100, (repo.stargazers_count / 10000) * 100), // Star count = momentum
      competition: 50,
      improvement_margin: 70,
      distribution_leverage: 60,
      margin_potential: 70,
    }))
  } catch (error) {
    console.error('[INGEST] GitHub error:', error)
    throw new Error('Failed to ingest from GitHub')
  }
}

/**
 * Ingest from Moltbook
 * Uses Moltbook API key from environment
 */
async function ingestMoltbook(limit: number) {
  const apiKey = process.env.MOLTBOOK_API_KEY
  if (!apiKey) {
    throw new Error('MOLTBOOK_API_KEY not configured')
  }

  try {
    const response = await axios.get('https://api.moltbook.com/v1/agents', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      params: {
        limit,
        trending: true,
      },
    })

    return response.data.agents.map((agent: any) => ({
      title: agent.name,
      description: agent.description,
      source: 'moltbook',
      source_url: agent.url || `https://moltbook.com/${agent.id}`,
      source_id: agent.id,
      raw_data: agent,
      revenue_potential: 75, // AI agents - high potential
      timeline_days: 7, // Can build fast
      skill_match: 90, // Our wheelhouse
      momentum: agent.usage_count || 50,
      competition: 40,
      improvement_margin: 80,
      distribution_leverage: 70,
      margin_potential: 80,
    }))
  } catch (error) {
    console.error('[INGEST] Moltbook error:', error)
    throw new Error('Failed to ingest from Moltbook')
  }
}

/**
 * Ingest from Reddit
 * Fetches trending posts from entrepreneur, startups, and SideProject subreddits
 * Reddit API returns public data without authentication for casual use
 */
async function ingestReddit(limit: number) {
  try {
    const subreddits = ['entrepreneur', 'startups', 'SideProject']
    const allPosts: any[] = []

    for (const subreddit of subreddits) {
      try {
        const response = await axios.get(
          `https://www.reddit.com/r/${subreddit}/hot.json?limit=${Math.ceil(limit / 3)}`,
          {
            headers: {
              'User-Agent': 'arbitrage-engine/1.0',
            },
            timeout: 5000,
          }
        )

        const posts = response.data.data.children
          .filter((child: any) => child.kind === 't3') // Filter for posts only
          .map((child: any) => child.data)
          .filter((post: any) => post.selftext && !post.is_self) // Self-posts with content
          .slice(0, Math.ceil(limit / 3))

        posts.forEach((post: any) => {
          const momentum = Math.min(
            100,
            ((post.ups + post.num_comments) / 1000) * 100
          )

          allPosts.push({
            title: post.title,
            description: post.selftext.substring(0, 500),
            source: 'reddit',
            source_url: `https://reddit.com${post.permalink}`,
            source_id: post.id,
            raw_data: {
              subreddit: post.subreddit,
              upvotes: post.ups,
              comments: post.num_comments,
              created_utc: post.created_utc,
            },
            revenue_potential: 65,
            timeline_days: 10,
            skill_match: 75,
            momentum: momentum,
            competition: 55,
            improvement_margin: 70,
            distribution_leverage: 65,
            margin_potential: 70,
          })
        })
      } catch (subError) {
        console.error(`[INGEST] Reddit/${subreddit} error:`, subError)
        // Continue with other subreddits
      }
    }

    return allPosts.length > 0
      ? allPosts
      : [
          {
            title: 'Failed to fetch Reddit data',
            description: 'Using fallback mock data',
            source: 'reddit',
            source_url: 'https://reddit.com/r/entrepreneur',
            source_id: 'reddit_fallback',
            raw_data: { error: 'API timeout' },
            revenue_potential: 50,
            timeline_days: 14,
            skill_match: 70,
            momentum: 40,
            competition: 50,
            improvement_margin: 60,
            distribution_leverage: 50,
            margin_potential: 60,
          },
        ]
  } catch (error) {
    console.error('[INGEST] Reddit error:', error)
    throw new Error('Failed to ingest from Reddit')
  }
}

/**
 * Ingest from Twitter/X
 * Fetches trending topics and replies about AI/SaaS
 * Requires TWITTER_BEARER_TOKEN environment variable
 */
async function ingestTwitter(limit: number) {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN
  if (!bearerToken) {
    console.warn('[INGEST] TWITTER_BEARER_TOKEN not configured, using fallback data')
    // Return fallback mock data
    return [
      {
        title: 'AI/SaaS Innovation Thread',
        description: 'Emerging discussion about AI tooling and SaaS opportunities',
        source: 'twitter',
        source_url: 'https://twitter.com/search?q=AI%20SaaS',
        source_id: 'twitter_fallback_1',
        raw_data: { reason: 'API not configured' },
        revenue_potential: 70,
        timeline_days: 7,
        skill_match: 85,
        momentum: 75,
        competition: 45,
        improvement_margin: 75,
        distribution_leverage: 80,
        margin_potential: 80,
      },
    ]
  }

  try {
    const response = await axios.get(
      'https://api.twitter.com/2/tweets/search/recent?query=AI%20SaaS%20startup%20-is:retweet&max_results=' +
        limit +
        '&tweet.fields=public_metrics,created_at&expansions=author_id&user.fields=username,public_metrics',
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
        timeout: 8000,
      }
    )

    const tweets = response.data.data || []
    const users = response.data.includes?.users || []

    return tweets.map((tweet: any) => {
      const author = users.find((u: any) => u.id === tweet.author_id)
      const engagement =
        (tweet.public_metrics.like_count +
          tweet.public_metrics.retweet_count +
          tweet.public_metrics.reply_count) /
        100

      return {
        title: tweet.text.substring(0, 100),
        description: tweet.text,
        source: 'twitter',
        source_url: `https://twitter.com/${author?.username}/status/${tweet.id}`,
        source_id: tweet.id,
        raw_data: {
          author: author?.username,
          author_followers: author?.public_metrics.followers_count,
          engagement_metrics: tweet.public_metrics,
          created_at: tweet.created_at,
        },
        revenue_potential: 70,
        timeline_days: 5,
        skill_match: 85,
        momentum: Math.min(100, engagement),
        competition: 45,
        improvement_margin: 75,
        distribution_leverage: 80,
        margin_potential: 80,
      }
    })
  } catch (error) {
    console.error('[INGEST] Twitter error:', error)
    // Return fallback on error
    return [
      {
        title: 'AI/SaaS Innovation Thread',
        description: 'Emerging discussion about AI tooling and SaaS opportunities',
        source: 'twitter',
        source_url: 'https://twitter.com/search?q=AI%20SaaS',
        source_id: 'twitter_fallback_error',
        raw_data: { error: 'API request failed' },
        revenue_potential: 70,
        timeline_days: 7,
        skill_match: 85,
        momentum: 75,
        competition: 45,
        improvement_margin: 75,
        distribution_leverage: 80,
        margin_potential: 80,
      },
    ]
  }
}

/**
 * Ingest from Product Hunt
 * Fetches trending products with upvotes and maker metrics
 * Requires PRODUCTHUNT_API_KEY environment variable
 */
async function ingestProductHunt(limit: number) {
  const apiKey = process.env.PRODUCTHUNT_API_KEY
  if (!apiKey) {
    console.warn('[INGEST] PRODUCTHUNT_API_KEY not configured, using fallback data')
    return [
      {
        title: 'Trending Product Hunt Products',
        description: 'Emerging products gaining traction on Product Hunt',
        source: 'producthunt',
        source_url: 'https://www.producthunt.com',
        source_id: 'producthunt_fallback',
        raw_data: { reason: 'API not configured' },
        revenue_potential: 75,
        timeline_days: 10,
        skill_match: 80,
        momentum: 80,
        competition: 50,
        improvement_margin: 75,
        distribution_leverage: 85,
        margin_potential: 80,
      },
    ]
  }

  try {
    const response = await axios.post(
      'https://api.producthunt.com/v2/posts',
      {
        query: `{
          postsConnection(first: ${limit}, after: "") {
            edges {
              node {
                id
                name
                tagline
                description
                votesCount
                url
                makers {
                  name
                  username
                }
                comments {
                  totalCount
                }
                reviews {
                  totalCount
                }
              }
            }
          }
        }`,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 8000,
      }
    )

    const products = response.data.data?.postsConnection?.edges || []

    return products.map((edge: any) => {
      const product = edge.node
      const momentum = Math.min(100, (product.votesCount / 500) * 100)

      return {
        title: product.name,
        description: product.tagline || product.description,
        source: 'producthunt',
        source_url: product.url,
        source_id: product.id,
        raw_data: {
          votes: product.votesCount,
          comments: product.comments?.totalCount,
          reviews: product.reviews?.totalCount,
          makers: product.makers?.map((m: any) => m.username),
        },
        revenue_potential: 75,
        timeline_days: 10,
        skill_match: 80,
        momentum: momentum,
        competition: 50,
        improvement_margin: 75,
        distribution_leverage: 85,
        margin_potential: 80,
      }
    })
  } catch (error) {
    console.error('[INGEST] Product Hunt error:', error)
    // Return fallback on error
    return [
      {
        title: 'Trending Product Hunt Products',
        description: 'Emerging products gaining traction on Product Hunt',
        source: 'producthunt',
        source_url: 'https://www.producthunt.com',
        source_id: 'producthunt_fallback_error',
        raw_data: { error: 'API request failed' },
        revenue_potential: 75,
        timeline_days: 10,
        skill_match: 80,
        momentum: 80,
        competition: 50,
        improvement_margin: 75,
        distribution_leverage: 85,
        margin_potential: 80,
      },
    ]
  }
}

/**
 * Ingest from AppSumo
 * Scrapes trending deals and their trending status
 * No API key required - uses public HTML scraping
 */
async function ingestAppSumo(limit: number) {
  try {
    // AppSumo doesn't have a public API, so we fetch trending deals from the homepage
    const response = await axios.get('https://appsumo.com/api/deals/', {
      headers: {
        'User-Agent': 'arbitrage-engine/1.0',
      },
      timeout: 8000,
      params: {
        sort: 'trending',
        limit: limit,
      },
    })

    const deals = response.data.deals || response.data || []

    return Array.isArray(deals)
      ? deals.slice(0, limit).map((deal: any) => {
          const momentum = deal.ratings?.rating_count
            ? Math.min(100, (deal.ratings.rating_count / 100) * 100)
            : 50

          return {
            title: deal.name || deal.title,
            description:
              deal.description || deal.details?.summary || 'AppSumo trending deal',
            source: 'appsumo',
            source_url: deal.url || `https://appsumo.com/products/${deal.slug}`,
            source_id: deal.id || deal.slug,
            raw_data: {
              category: deal.category?.name,
              price: deal.price,
              original_price: deal.original_price,
              rating: deal.ratings?.rating,
              review_count: deal.ratings?.rating_count,
              trending_score: deal.trending_score,
            },
            revenue_potential: 70,
            timeline_days: 14,
            skill_match: 75,
            momentum: momentum,
            competition: 60,
            improvement_margin: 70,
            distribution_leverage: 75,
            margin_potential: 75,
          }
        })
      : [
          {
            title: 'AppSumo Trending Deals',
            description: 'Trending deals from the AppSumo marketplace',
            source: 'appsumo',
            source_url: 'https://appsumo.com',
            source_id: 'appsumo_fallback',
            raw_data: { error: 'Parse error' },
            revenue_potential: 70,
            timeline_days: 14,
            skill_match: 75,
            momentum: 50,
            competition: 60,
            improvement_margin: 70,
            distribution_leverage: 75,
            margin_potential: 75,
          },
        ]
  } catch (error) {
    console.error('[INGEST] AppSumo error:', error)
    // Return fallback on error
    return [
      {
        title: 'AppSumo Trending Deals',
        description: 'Trending deals from the AppSumo marketplace',
        source: 'appsumo',
        source_url: 'https://appsumo.com',
        source_id: 'appsumo_fallback_error',
        raw_data: { error: 'API/scrape request failed' },
        revenue_potential: 70,
        timeline_days: 14,
        skill_match: 75,
        momentum: 50,
        competition: 60,
        improvement_margin: 70,
        distribution_leverage: 75,
        margin_potential: 75,
      },
    ]
  }
}
