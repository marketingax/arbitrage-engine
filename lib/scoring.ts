/**
 * Scoring Engine for Arbitrage Opportunities
 * 
 * Scoring Formula:
 * Base Score = (Revenue * 0.40) + (Timeline * 0.25) + (SkillMatch * 0.20) + (Momentum * 0.10) + (Competition * 0.05)
 * 
 * Modifiers:
 * - Improvement Margin bonus: +20 if significant
 * - Distribution Leverage bonus: +15 if high
 * - Margin Potential bonus: +10 if 50%+ affiliate cuts possible
 * - Time to Market bonus: +5 if <7 days
 */

export interface ScoringDimensions {
  revenue_potential: number // 0-100
  timeline_days: number // actual days, will be normalized
  skill_match: number // 0-100
  momentum: number // 0-100
  competition: number // 0-100
  improvement_margin: number // 0-100
  distribution_leverage: number // 0-100
  margin_potential: number // 0-100
}

export interface ScoreResult {
  final_score: number
  score_breakdown: {
    revenue_potential: number
    timeline: number
    skill_match: number
    momentum: number
    competition: number
    base_score: number
    improvement_margin_bonus: number
    distribution_leverage_bonus: number
    margin_potential_bonus: number
    time_to_market_bonus: number
    total_modifiers: number
  }
  time_to_market_bonus: number
}

/**
 * Normalize timeline (days) to a 0-100 score
 * Faster = higher score (inverse relationship)
 * 1 day = 100, 30 days = 0, linear interpolation
 */
function normalizeTimeline(days: number): number {
  if (days <= 1) return 100
  if (days >= 30) return 0
  return Math.max(0, 100 - (days - 1) * (100 / 29))
}

/**
 * Calculate final score based on dimensions and modifiers
 */
export function calculateScore(dimensions: ScoringDimensions): ScoreResult {
  // Normalize timeline to 0-100 scale
  const timeline_score = normalizeTimeline(dimensions.timeline_days)

  // Base score calculation (weighted sum)
  const base_score =
    dimensions.revenue_potential * 0.4 +
    timeline_score * 0.25 +
    dimensions.skill_match * 0.2 +
    dimensions.momentum * 0.1 +
    dimensions.competition * 0.05

  // Modifiers
  const improvement_margin_bonus =
    dimensions.improvement_margin > 70 ? 20 : dimensions.improvement_margin > 40 ? 10 : 0
  const distribution_leverage_bonus = dimensions.distribution_leverage > 70 ? 15 : 0
  const margin_potential_bonus = dimensions.margin_potential > 50 ? 10 : 0
  const time_to_market_bonus = dimensions.timeline_days < 7 ? 5 : 0

  const total_modifiers =
    improvement_margin_bonus +
    distribution_leverage_bonus +
    margin_potential_bonus +
    time_to_market_bonus

  const final_score = Math.min(100, base_score + total_modifiers)

  return {
    final_score: Math.round(final_score * 100) / 100,
    score_breakdown: {
      revenue_potential: dimensions.revenue_potential,
      timeline: timeline_score,
      skill_match: dimensions.skill_match,
      momentum: dimensions.momentum,
      competition: dimensions.competition,
      base_score: Math.round(base_score * 100) / 100,
      improvement_margin_bonus,
      distribution_leverage_bonus,
      margin_potential_bonus,
      time_to_market_bonus,
      total_modifiers,
    },
    time_to_market_bonus,
  }
}

/**
 * Batch score multiple opportunities
 */
export function scoreOpportunities(
  opportunities: Array<{ id: string; dimensions: ScoringDimensions }>
) {
  return opportunities.map((opp) => ({
    id: opp.id,
    ...calculateScore(opp.dimensions),
  }))
}
