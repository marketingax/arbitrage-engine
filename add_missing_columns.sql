-- Add missing columns to opportunities table (if they don't exist)
ALTER TABLE opportunities
ADD COLUMN IF NOT EXISTS revenue_potential INT DEFAULT 0 CHECK (revenue_potential BETWEEN 0 AND 100);

ALTER TABLE opportunities
ADD COLUMN IF NOT EXISTS timeline_days INT;

ALTER TABLE opportunities
ADD COLUMN IF NOT EXISTS skill_match INT DEFAULT 0 CHECK (skill_match BETWEEN 0 AND 100);

ALTER TABLE opportunities
ADD COLUMN IF NOT EXISTS momentum INT DEFAULT 0 CHECK (momentum BETWEEN 0 AND 100);

ALTER TABLE opportunities
ADD COLUMN IF NOT EXISTS competition INT DEFAULT 0 CHECK (competition BETWEEN 0 AND 100);

ALTER TABLE opportunities
ADD COLUMN IF NOT EXISTS improvement_margin INT DEFAULT 0 CHECK (improvement_margin BETWEEN 0 AND 100);

ALTER TABLE opportunities
ADD COLUMN IF NOT EXISTS distribution_leverage INT DEFAULT 0 CHECK (distribution_leverage BETWEEN 0 AND 100);

ALTER TABLE opportunities
ADD COLUMN IF NOT EXISTS margin_potential INT DEFAULT 0 CHECK (margin_potential BETWEEN 0 AND 100);

ALTER TABLE opportunities
ADD COLUMN IF NOT EXISTS time_to_market_bonus INT DEFAULT 0 CHECK (time_to_market_bonus BETWEEN 0 AND 100);

ALTER TABLE opportunities
ADD COLUMN IF NOT EXISTS final_score DECIMAL(5, 2) DEFAULT 0;

ALTER TABLE opportunities
ADD COLUMN IF NOT EXISTS score_breakdown JSONB DEFAULT '{}';

ALTER TABLE opportunities
ADD COLUMN IF NOT EXISTS status opportunity_status DEFAULT 'new';

ALTER TABLE opportunities
ADD COLUMN IF NOT EXISTS manual_override BOOLEAN DEFAULT FALSE;

ALTER TABLE opportunities
ADD COLUMN IF NOT EXISTS override_score DECIMAL(5, 2);

ALTER TABLE opportunities
ADD COLUMN IF NOT EXISTS override_reason TEXT;

ALTER TABLE opportunities
ADD COLUMN IF NOT EXISTS override_by UUID;

ALTER TABLE opportunities
ADD COLUMN IF NOT EXISTS override_at TIMESTAMP;

ALTER TABLE opportunities
ADD COLUMN IF NOT EXISTS last_scored_at TIMESTAMP;
