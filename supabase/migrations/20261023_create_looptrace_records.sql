-- WasteWise - LoopTrace Database Schema
-- Table: looptrace_records
-- Description: Stores personal lifecycle diversion records (reused, repaired, donated, resold, recycled)
-- Row Level Security (RLS) ensures users can strictly view, insert, update, and delete their own records.

CREATE TABLE IF NOT EXISTS public.looptrace_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('reused', 'repaired', 'donated', 'resold', 'recycled')),
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'in_progress')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'nextworth', 'matterlens')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_looptrace_user_id ON public.looptrace_records(user_id);
CREATE INDEX IF NOT EXISTS idx_looptrace_date ON public.looptrace_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_looptrace_action ON public.looptrace_records(action);

-- Enable Row Level Security (RLS)
ALTER TABLE public.looptrace_records ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own activity records
CREATE POLICY "Users can view own looptrace records"
    ON public.looptrace_records
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own activity records
CREATE POLICY "Users can insert own looptrace records"
    ON public.looptrace_records
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own activity records
CREATE POLICY "Users can update own looptrace records"
    ON public.looptrace_records
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own activity records
CREATE POLICY "Users can delete own looptrace records"
    ON public.looptrace_records
    FOR DELETE
    USING (auth.uid() = user_id);
