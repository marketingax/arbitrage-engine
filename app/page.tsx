'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import OpportunityCard from '@/components/OpportunityCard'
import { Database } from '@/lib/supabase'

type Opportunity = Database['public']['Tables']['opportunities']['Row']

export default function DashboardPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [minScore, setMinScore] = useState(0)
  const [searchText, setSearchText] = useState('')
  const [sortBy, setSortBy] = useState('score')
  const [stats, setStats] = useState({
    total: 0,
    pursuing: 0,
    passed: 0,
    watching: 0,
    avgScore: 0,
  })

  // Fetch opportunities
  useEffect(() => {
    fetchOpportunities()
  }, [selectedStatus, selectedSource, minScore, sortBy])

  // Calculate stats
  useEffect(() => {
    if (opportunities.length > 0) {
      const pursuing = opportunities.filter((o) => o.status === 'pursuing').length
      const passed = opportunities.filter((o) => o.status === 'passed').length
      const watching = opportunities.filter((o) => o.status === 'watching').length
      const avgScore =
        opportunities.reduce((sum, o) => sum + o.final_score, 0) / opportunities.length

      setStats({
        total: opportunities.length,
        pursuing,
        passed,
        watching,
        avgScore,
      })
    }
  }, [opportunities])

  async function fetchOpportunities() {
    try {
      setLoading(true)

      let query = supabase
        .from('opportunities')
        .select('*')
        .gte('final_score', minScore)

      if (selectedStatus) {
        query = query.eq('status', selectedStatus)
      }

      if (selectedSource) {
        query = query.eq('source', selectedSource)
      }

      if (sortBy === 'score') {
        query = query.order('final_score', { ascending: false })
      } else if (sortBy === 'date') {
        query = query.order('created_at', { ascending: false })
      } else if (sortBy === 'source') {
        query = query.order('source', { ascending: true })
      }

      query = query.limit(100)

      const { data, error } = await query

      if (error) throw error

      let filtered = data || []

      // Client-side text search
      if (searchText.trim()) {
        const searchLower = searchText.toLowerCase()
        filtered = filtered.filter(
          (o) =>
            o.title.toLowerCase().includes(searchLower) ||
            (o.description && o.description.toLowerCase().includes(searchLower))
        )
      }

      setOpportunities(filtered)
    } catch (error) {
      console.error('Error fetching opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      setOpportunities((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: status as any } : o))
      )
    } catch (error) {
      console.error('Error updating opportunity:', error)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-slate-900/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Arbitrage Engine
            </h1>
            <p className="mt-2 text-gray-400">
              Find opportunities. Score them. Build them. Sell them.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <StatCard label="Total" value={stats.total} color="cyan" />
            <StatCard label="Pursuing" value={stats.pursuing} color="emerald" />
            <StatCard label="Watching" value={stats.watching} color="blue" />
            <StatCard label="Passed" value={stats.passed} color="red" />
            <StatCard
              label="Avg Score"
              value={stats.avgScore.toFixed(1)}
              color="yellow"
            />
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="border-b border-cyan-500/20 bg-slate-900/30 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search opportunities..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="rounded border border-cyan-500/30 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-cyan-400/60 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
            />

            {/* Status Filter */}
            <select
              value={selectedStatus || ''}
              onChange={(e) => setSelectedStatus(e.target.value || null)}
              className="rounded border border-cyan-500/30 bg-slate-800/50 px-3 py-2 text-sm text-white focus:border-cyan-400/60 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="pursuing">Pursuing</option>
              <option value="watching">Watching</option>
              <option value="passed">Passed</option>
            </select>

            {/* Source Filter */}
            <select
              value={selectedSource || ''}
              onChange={(e) => setSelectedSource(e.target.value || null)}
              className="rounded border border-cyan-500/30 bg-slate-800/50 px-3 py-2 text-sm text-white focus:border-cyan-400/60 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
            >
              <option value="">All Sources</option>
              <option value="github">GitHub</option>
              <option value="reddit">Reddit</option>
              <option value="moltbook">Moltbook</option>
              <option value="twitter">Twitter</option>
              <option value="producthunt">Product Hunt</option>
              <option value="appsumo">AppSumo</option>
              <option value="hackernews">HackerNews</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded border border-cyan-500/30 bg-slate-800/50 px-3 py-2 text-sm text-white focus:border-cyan-400/60 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
            >
              <option value="score">Sort by Score</option>
              <option value="date">Sort by Date</option>
              <option value="source">Sort by Source</option>
            </select>
          </div>

          {/* Score Slider */}
          <div className="mt-4">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-400">Min Score:</label>
              <input
                type="range"
                min="0"
                max="100"
                value={minScore}
                onChange={(e) => setMinScore(parseInt(e.target.value))}
                className="flex-1 h-2 bg-slate-800/50 rounded appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="w-12 text-right text-sm font-semibold text-cyan-400">
                {minScore}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-gray-400">Loading opportunities...</div>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="rounded border border-cyan-500/20 bg-slate-900/30 p-8 text-center">
            <p className="text-gray-400">No opportunities found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onStatusChange={handleStatusChange}
                onDetailClick={(id) => {
                  // Will implement detail panel in Phase 2
                  console.log('Detail clicked:', id)
                }}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  color: 'cyan' | 'emerald' | 'blue' | 'red' | 'yellow'
}

function StatCard({ label, value, color }: StatCardProps) {
  const colorMap = {
    cyan: 'border-cyan-500/30 text-cyan-400',
    emerald: 'border-emerald-500/30 text-emerald-400',
    blue: 'border-blue-500/30 text-blue-400',
    red: 'border-red-500/30 text-red-400',
    yellow: 'border-yellow-500/30 text-yellow-400',
  }

  return (
    <div className={`rounded border ${colorMap[color]} bg-slate-800/30 px-4 py-3`}>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  )
}
