import { createClient } from '@supabase/supabase-js'

// Use environment variables for credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase credentials not configured')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      opportunities: {
        Row: {
          id: string
          title: string
          description: string | null
          source: string
          source_url: string
          source_id: string
          raw_data: Record<string, any>
          revenue_potential: number
          timeline_days: number | null
          skill_match: number
          momentum: number
          competition: number
          improvement_margin: number
          distribution_leverage: number
          margin_potential: number
          time_to_market_bonus: number
          final_score: number
          score_breakdown: Record<string, any>
          status: string
          manual_override: boolean
          override_score: number | null
          override_reason: string | null
          override_by: string | null
          override_at: string | null
          created_at: string
          updated_at: string
          ingested_at: string
          last_scored_at: string | null
        }
        Insert: Omit<
          Database['public']['Tables']['opportunities']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['opportunities']['Insert']>
      }
      opportunity_notes: {
        Row: {
          id: string
          opportunity_id: string
          note_text: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['opportunity_notes']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['opportunity_notes']['Insert']>
      }
      cron_runs: {
        Row: {
          id: string
          source: string
          status: string
          records_pulled: number
          records_stored: number
          error_message: string | null
          run_at: string
          completed_at: string | null
        }
        Insert: Omit<
          Database['public']['Tables']['cron_runs']['Row'],
          'id' | 'run_at'
        >
        Update: Partial<Database['public']['Tables']['cron_runs']['Insert']>
      }
    }
  }
}
