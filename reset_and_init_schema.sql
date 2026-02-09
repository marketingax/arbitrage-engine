-- RESET: Drop all existing tables and types
DROP TABLE IF EXISTS opportunity_notes CASCADE;
DROP TABLE IF EXISTS cron_runs CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TYPE IF EXISTS opportunity_source CASCADE;
DROP TYPE IF EXISTS opportunity_status CASCADE;
DROP TYPE IF EXISTS cron_status CASCADE;

-- CREATE ENUM types
CREATE TYPE opportunity_source AS ENUM (
  'moltbook',
  'github',
  'reddit',
  'twitter',
  'producthunt',
  'appsumo',
  'hackernews'
);

CREATE TYPE opportunity_status AS ENUM (
  'new',
  'pursuing',
  'passed',
  'watching'
);

CREATE TYPE cron_status AS ENUM (
  'success',
  'failed',
  'partial'
);

-- Main opportunities table
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  source opportunity_source NOT NULL,
  source_url TEXT UNIQUE NOT NULL,
  source_id TEXT NOT NULL,
  raw_data JSONB DEFAULT '{}',
  
  -- Scoring dimensions
  revenue_potential INT DEFAULT 0 CHECK (revenue_potential BETWEEN 0 AND 100),
  timeline_days INT,
  skill_match INT DEFAULT 0 CHECK (skill_match BETWEEN 0 AND 100),
  momentum INT DEFAULT 0 CHECK (momentum BETWEEN 0 AND 100),
  competition INT DEFAULT 0 CHECK (competition BETWEEN 0 AND 100),
  improvement_margin INT DEFAULT 0 CHECK (improvement_margin BETWEEN 0 AND 100),
  distribution_leverage INT DEFAULT 0 CHECK (distribution_leverage BETWEEN 0 AND 100),
  margin_potential INT DEFAULT 0 CHECK (margin_potential BETWEEN 0 AND 100),
  time_to_market_bonus INT DEFAULT 0 CHECK (time_to_market_bonus BETWEEN 0 AND 100),
  final_score DECIMAL(5, 2) DEFAULT 0,
  score_breakdown JSONB DEFAULT '{}',
  
  -- Status & Tracking
  status opportunity_status DEFAULT 'new',
  manual_override BOOLEAN DEFAULT FALSE,
  override_score DECIMAL(5, 2),
  override_reason TEXT,
  override_by UUID,
  override_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  ingested_at TIMESTAMP DEFAULT NOW(),
  last_scored_at TIMESTAMP
);

-- Opportunity notes table
CREATE TABLE opportunity_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cron runs audit table
CREATE TABLE cron_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  status cron_status NOT NULL,
  records_pulled INT DEFAULT 0,
  records_stored INT DEFAULT 0,
  error_message TEXT,
  run_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_opportunities_source ON opportunities(source);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_final_score ON opportunities(final_score DESC);
CREATE INDEX idx_opportunities_created_at ON opportunities(created_at DESC);
CREATE INDEX idx_opportunities_source_id ON opportunities(source, source_id);
CREATE INDEX idx_opportunity_notes_opportunity_id ON opportunity_notes(opportunity_id);
CREATE INDEX idx_cron_runs_source ON cron_runs(source);
CREATE INDEX idx_cron_runs_created ON cron_runs(run_at DESC);

-- Enable Row Level Security
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cron_runs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (permissive for MVP)
CREATE POLICY "Allow all reads on opportunities" ON opportunities
  FOR SELECT USING (true);

CREATE POLICY "Allow all inserts on opportunities" ON opportunities
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all updates on opportunities" ON opportunities
  FOR UPDATE USING (true);

CREATE POLICY "Allow all deletes on opportunities" ON opportunities
  FOR DELETE USING (true);

CREATE POLICY "Allow all reads on opportunity_notes" ON opportunity_notes
  FOR SELECT USING (true);

CREATE POLICY "Allow all writes on opportunity_notes" ON opportunity_notes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all updates on opportunity_notes" ON opportunity_notes
  FOR UPDATE USING (true);

CREATE POLICY "Allow all reads on cron_runs" ON cron_runs
  FOR SELECT USING (true);

CREATE POLICY "Allow all inserts on cron_runs" ON cron_runs
  FOR INSERT WITH CHECK (true);
