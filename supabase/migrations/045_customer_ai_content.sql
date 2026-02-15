-- ============================================
-- Customer AI Content Storage
-- Migration: 045_customer_ai_content.sql
--
-- Stores AI-generated content for customers:
-- advisor chat messages, insurance letters,
-- financing scenarios, and program guidance.
-- ============================================

CREATE TABLE IF NOT EXISTS customer_ai_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,

  -- Content type discriminator
  content_type TEXT NOT NULL CHECK (content_type IN (
    'advisor_message',
    'insurance_letter',
    'financing_guidance',
    'program_guidance'
  )),

  -- Topic for advisor messages (financing, insurance, assistance)
  topic TEXT,

  -- The AI-generated content
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- For advisor: { message, suggestedActions: [{label, href}] }
  -- For insurance_letter: { letterType, letter }
  -- For financing_guidance: { scenarios: [...], summary, nextStep }
  -- For program_guidance: { prioritizedActions: [...], combinedStrategy, importantNotes }

  -- Which AI provider served this response
  provider TEXT,

  -- Input context snapshot (for reproducibility)
  input_context JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast customer lookups
CREATE INDEX idx_customer_ai_content_customer_id ON customer_ai_content(customer_id);
CREATE INDEX idx_customer_ai_content_lead_id ON customer_ai_content(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX idx_customer_ai_content_type ON customer_ai_content(customer_id, content_type, created_at DESC);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE customer_ai_content ENABLE ROW LEVEL SECURITY;

-- Customer: Read own AI content
CREATE POLICY "Customer read own ai content" ON customer_ai_content FOR SELECT TO authenticated
  USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

-- Admin: Full access
CREATE POLICY "Admin full access customer_ai_content" ON customer_ai_content FOR ALL TO authenticated
  USING (
    COALESCE(auth.jwt()->>'role', '') = 'admin' OR
    COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
    COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
  )
  WITH CHECK (
    COALESCE(auth.jwt()->>'role', '') = 'admin' OR
    COALESCE((auth.jwt()->'user_metadata'->>'role')::text, '') = 'admin' OR
    COALESCE((auth.jwt()->'app_metadata'->>'role')::text, '') = 'admin'
  );

-- Service role: Insert (API routes use admin client)
-- Admin client bypasses RLS, so no explicit insert policy needed for service role.
