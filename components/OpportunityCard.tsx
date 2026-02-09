'use client'

import { useState } from 'react'
import { Database } from '@/lib/supabase'

type Opportunity = Database['public']['Tables']['opportunities']['Row']

interface OpportunityCardProps {
  opportunity: Opportunity
  onStatusChange: (id: string, status: string) => void
  onDetailClick: (id: string) => void
}

export default function OpportunityCard({
  opportunity,
  onStatusChange,
  onDetailClick,
}: OpportunityCardProps) {
  const [expanded, setExpanded] = useState(false)

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 50) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-400/10 border-emerald-400/30'
    if (score >= 50) return 'bg-yellow-400/10 border-yellow-400/30'
    return 'bg-red-400/10 border-red-400/30'
  }

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      github: 'bg-purple-500/20 text-purple-300',
      reddit: 'bg-orange-500/20 text-orange-300',
      moltbook: 'bg-blue-500/20 text-blue-300',
      twitter: 'bg-cyan-500/20 text-cyan-300',
      producthunt: 'bg-pink-500/20 text-pink-300',
      appsumo: 'bg-green-500/20 text-green-300',
      hackernews: 'bg-amber-500/20 text-amber-300',
    }
    return colors[source] || 'bg-gray-500/20 text-gray-300'
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border border-cyan-500/30 bg-slate-900/50 p-4 transition-all hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]">
      {/* Glowing background on hover */}
      <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-transparent to-blue-400/5" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="mb-2 pr-3 text-lg font-semibold text-white line-clamp-2">
              {opportunity.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${getSourceColor(opportunity.source)}`}>
                {opportunity.source}
              </span>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium capitalize text-gray-300 bg-gray-500/20`}
              >
                {opportunity.status}
              </span>
            </div>
          </div>

          {/* Score Badge */}
          <div
            className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border ${getScoreBgColor(opportunity.final_score)}`}
          >
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(opportunity.final_score)}`}>
                {opportunity.final_score.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400">score</div>
            </div>
          </div>
        </div>

        {/* Description */}
        {opportunity.description && (
          <p className="mb-3 text-sm text-gray-300 line-clamp-2">
            {opportunity.description}
          </p>
        )}

        {/* Score Breakdown (Expandable) */}
        {expanded && opportunity.score_breakdown && (
          <div className="mb-3 rounded bg-slate-800/50 p-2 text-xs text-gray-300">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-cyan-400">Revenue:</span>{' '}
                {(opportunity.score_breakdown as any).revenue_potential || 'N/A'}
              </div>
              <div>
                <span className="text-cyan-400">Timeline:</span>{' '}
                {opportunity.timeline_days}d
              </div>
              <div>
                <span className="text-cyan-400">Skill Match:</span>{' '}
                {(opportunity.score_breakdown as any).skill_match || 'N/A'}
              </div>
              <div>
                <span className="text-cyan-400">Momentum:</span>{' '}
                {(opportunity.score_breakdown as any).momentum || 'N/A'}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onDetailClick(opportunity.id)}
            className="flex-1 rounded bg-cyan-600/30 px-3 py-2 text-xs font-medium text-cyan-300 transition hover:bg-cyan-600/50 border border-cyan-500/30 hover:border-cyan-400/60"
          >
            Details
          </button>

          <button
            onClick={() => onStatusChange(opportunity.id, 'pursuing')}
            className="flex-1 rounded bg-emerald-600/30 px-3 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-600/50 border border-emerald-500/30 hover:border-emerald-400/60"
          >
            Pursuing
          </button>

          <button
            onClick={() => onStatusChange(opportunity.id, 'watching')}
            className="flex-1 rounded bg-blue-600/30 px-3 py-2 text-xs font-medium text-blue-300 transition hover:bg-blue-600/50 border border-blue-500/30 hover:border-blue-400/60"
          >
            Watch
          </button>

          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded bg-slate-700/30 px-3 py-2 text-xs font-medium text-gray-300 transition hover:bg-slate-700/50 border border-slate-600/30"
          >
            {expanded ? '−' : '+'}
          </button>
        </div>
      </div>
    </div>
  )
}
