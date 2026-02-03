-- ============================================
-- Phase 2: Communication Automation
-- Message templates, workflows, and scheduled messages
-- ============================================

-- ============================================
-- ENUMS
-- ============================================

-- Message channel type
CREATE TYPE message_channel AS ENUM ('email', 'sms');

-- Message status
CREATE TYPE message_status AS ENUM ('pending', 'scheduled', 'sending', 'sent', 'delivered', 'failed', 'cancelled');

-- Workflow trigger events
CREATE TYPE workflow_trigger AS ENUM (
  'lead_created',
  'lead_status_changed',
  'intake_completed',
  'estimate_generated',
  'quote_sent',
  'quote_viewed',
  'appointment_scheduled',
  'appointment_reminder',
  'payment_received',
  'job_completed',
  'review_request',
  'manual'
);

-- ============================================
-- Table: message_templates
-- Reusable email and SMS templates
-- ============================================
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Template identity
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type message_channel NOT NULL,

  -- Content
  subject VARCHAR(200), -- For emails only
  body TEXT NOT NULL,

  -- Variables available in this template
  -- e.g., ['customer_name', 'estimate_total', 'company_phone']
  variables TEXT[] DEFAULT '{}',

  -- Categorization
  category VARCHAR(50) DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',

  -- System templates cannot be deleted
  is_system BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  -- Usage tracking
  usage_count INT DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Audit
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON message_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_message_templates_type ON message_templates(type);
CREATE INDEX idx_message_templates_category ON message_templates(category);
CREATE INDEX idx_message_templates_is_active ON message_templates(is_active);

-- ============================================
-- Table: automation_workflows
-- Automated message sequences triggered by events
-- ============================================
CREATE TABLE automation_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Workflow identity
  name VARCHAR(100) NOT NULL,
  description TEXT,

  -- Trigger configuration
  trigger_event workflow_trigger NOT NULL,

  -- Conditions (JSON for flexibility)
  -- e.g., {"lead_status": ["new", "intake_complete"], "has_phone": true}
  conditions JSONB DEFAULT '{}',

  -- Delay before sending (in minutes)
  delay_minutes INT NOT NULL DEFAULT 0,

  -- Template to send
  template_id UUID NOT NULL REFERENCES message_templates(id) ON DELETE CASCADE,

  -- Channel override (if null, uses template's default)
  channel message_channel,

  -- Workflow settings
  is_active BOOLEAN DEFAULT TRUE,
  priority INT DEFAULT 0, -- Higher = runs first when multiple match

  -- Rate limiting
  max_sends_per_lead INT DEFAULT 1, -- Max times this workflow can fire for same lead
  cooldown_hours INT DEFAULT 24, -- Hours between sends to same lead

  -- Business hours restriction
  respect_business_hours BOOLEAN DEFAULT TRUE,
  business_hours_start TIME DEFAULT '08:00',
  business_hours_end TIME DEFAULT '18:00',
  business_days INT[] DEFAULT '{1,2,3,4,5}', -- 1=Monday, 7=Sunday

  -- Tracking
  execution_count INT DEFAULT 0,
  last_executed_at TIMESTAMPTZ,

  -- Audit
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_automation_workflows_updated_at
  BEFORE UPDATE ON automation_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_automation_workflows_trigger ON automation_workflows(trigger_event);
CREATE INDEX idx_automation_workflows_is_active ON automation_workflows(is_active);
CREATE INDEX idx_automation_workflows_template ON automation_workflows(template_id);

-- ============================================
-- Table: scheduled_messages
-- Queue of messages to be sent
-- ============================================
CREATE TABLE scheduled_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Target
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,

  -- Recipient info (cached for reliability)
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(20),
  recipient_name VARCHAR(200),

  -- Source
  workflow_id UUID REFERENCES automation_workflows(id) ON DELETE SET NULL,
  template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,

  -- Message content (rendered from template)
  channel message_channel NOT NULL,
  subject VARCHAR(200),
  body TEXT NOT NULL,

  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL,

  -- Status tracking
  status message_status NOT NULL DEFAULT 'scheduled',
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,

  -- Delivery info
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,

  -- External IDs
  external_id VARCHAR(100), -- Twilio SID or Resend ID

  -- Error handling
  error_message TEXT,
  error_code VARCHAR(50),

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  cancelled_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  cancelled_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_scheduled_messages_updated_at
  BEFORE UPDATE ON scheduled_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_scheduled_messages_lead ON scheduled_messages(lead_id);
CREATE INDEX idx_scheduled_messages_customer ON scheduled_messages(customer_id);
CREATE INDEX idx_scheduled_messages_status ON scheduled_messages(status);
CREATE INDEX idx_scheduled_messages_scheduled_for ON scheduled_messages(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX idx_scheduled_messages_workflow ON scheduled_messages(workflow_id);

-- ============================================
-- Table: communication_logs
-- History of all sent communications
-- ============================================
CREATE TABLE communication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Target
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,

  -- Message details
  channel message_channel NOT NULL,
  direction VARCHAR(10) NOT NULL DEFAULT 'outbound', -- outbound or inbound

  -- Recipient/Sender info
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(20),
  recipient_name VARCHAR(200),
  sender_email VARCHAR(255),
  sender_phone VARCHAR(20),

  -- Content
  subject VARCHAR(200),
  body TEXT NOT NULL,
  body_html TEXT, -- For emails

  -- Source tracking
  workflow_id UUID REFERENCES automation_workflows(id) ON DELETE SET NULL,
  template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
  scheduled_message_id UUID REFERENCES scheduled_messages(id) ON DELETE SET NULL,

  -- Status
  status message_status NOT NULL DEFAULT 'sent',

  -- External tracking
  external_id VARCHAR(100),
  external_status VARCHAR(50),

  -- Engagement tracking (for emails)
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,

  -- For inbound messages
  replied_to_id UUID REFERENCES communication_logs(id) ON DELETE SET NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Audit
  sent_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_communication_logs_lead ON communication_logs(lead_id);
CREATE INDEX idx_communication_logs_customer ON communication_logs(customer_id);
CREATE INDEX idx_communication_logs_channel ON communication_logs(channel);
CREATE INDEX idx_communication_logs_direction ON communication_logs(direction);
CREATE INDEX idx_communication_logs_created_at ON communication_logs(created_at DESC);
CREATE INDEX idx_communication_logs_external_id ON communication_logs(external_id);

-- ============================================
-- Table: workflow_executions
-- Track workflow execution history
-- ============================================
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  workflow_id UUID NOT NULL REFERENCES automation_workflows(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,

  -- Trigger info
  trigger_event workflow_trigger NOT NULL,
  trigger_data JSONB DEFAULT '{}',

  -- Execution result
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, success, skipped, failed
  skip_reason TEXT,
  error_message TEXT,

  -- Message created (if successful)
  scheduled_message_id UUID REFERENCES scheduled_messages(id) ON DELETE SET NULL,
  communication_log_id UUID REFERENCES communication_logs(id) ON DELETE SET NULL,

  -- Timing
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_lead ON workflow_executions(lead_id);
CREATE INDEX idx_workflow_executions_executed_at ON workflow_executions(executed_at DESC);

-- ============================================
-- Table: sms_conversations
-- Track SMS conversation threads
-- ============================================
CREATE TABLE sms_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Participants
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  phone_number VARCHAR(20) NOT NULL,

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, closed, spam
  unread_count INT DEFAULT 0,

  -- Last message
  last_message_at TIMESTAMPTZ,
  last_message_preview VARCHAR(160),
  last_message_direction VARCHAR(10),

  -- Assignment
  assigned_to UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_sms_conversations_updated_at
  BEFORE UPDATE ON sms_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_sms_conversations_phone ON sms_conversations(phone_number);
CREATE INDEX idx_sms_conversations_lead ON sms_conversations(lead_id);
CREATE INDEX idx_sms_conversations_status ON sms_conversations(status);
CREATE INDEX idx_sms_conversations_assigned ON sms_conversations(assigned_to);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_conversations ENABLE ROW LEVEL SECURITY;

-- Message templates: Admin/Manager can manage, others can view
CREATE POLICY "Managers can manage message templates"
ON message_templates FOR ALL
TO authenticated
USING (is_manager_or_above())
WITH CHECK (is_manager_or_above());

CREATE POLICY "Users can view active templates"
ON message_templates FOR SELECT
TO authenticated
USING (is_active = true);

-- Automation workflows: Admin/Manager only
CREATE POLICY "Managers can manage automation workflows"
ON automation_workflows FOR ALL
TO authenticated
USING (is_manager_or_above())
WITH CHECK (is_manager_or_above());

-- Scheduled messages: Admin/Manager can manage
CREATE POLICY "Managers can manage scheduled messages"
ON scheduled_messages FOR ALL
TO authenticated
USING (is_manager_or_above())
WITH CHECK (is_manager_or_above());

-- Communication logs: All authenticated users can view
CREATE POLICY "Authenticated users can view communication logs"
ON communication_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role can insert communication logs"
ON communication_logs FOR INSERT
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Workflow executions: Managers can view
CREATE POLICY "Managers can view workflow executions"
ON workflow_executions FOR SELECT
TO authenticated
USING (is_manager_or_above());

CREATE POLICY "Service role can manage workflow executions"
ON workflow_executions FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- SMS conversations: Authenticated users can view/manage
CREATE POLICY "Authenticated users can manage SMS conversations"
ON sms_conversations FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Service role full access to all tables
CREATE POLICY "Service role full access to message_templates"
ON message_templates FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to automation_workflows"
ON automation_workflows FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to scheduled_messages"
ON scheduled_messages FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to communication_logs"
ON communication_logs FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to sms_conversations"
ON sms_conversations FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- Functions
-- ============================================

-- Function to render template with variables
CREATE OR REPLACE FUNCTION render_template(
  p_template_body TEXT,
  p_variables JSONB
)
RETURNS TEXT AS $$
DECLARE
  v_result TEXT := p_template_body;
  v_key TEXT;
  v_value TEXT;
BEGIN
  FOR v_key, v_value IN SELECT * FROM jsonb_each_text(p_variables)
  LOOP
    v_result := REPLACE(v_result, '{{' || v_key || '}}', COALESCE(v_value, ''));
  END LOOP;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if workflow should execute for a lead
CREATE OR REPLACE FUNCTION should_execute_workflow(
  p_workflow_id UUID,
  p_lead_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_workflow automation_workflows;
  v_execution_count INT;
  v_last_execution TIMESTAMPTZ;
BEGIN
  -- Get workflow
  SELECT * INTO v_workflow FROM automation_workflows WHERE id = p_workflow_id;

  IF NOT FOUND OR NOT v_workflow.is_active THEN
    RETURN FALSE;
  END IF;

  -- Check execution count for this lead
  SELECT COUNT(*), MAX(executed_at)
  INTO v_execution_count, v_last_execution
  FROM workflow_executions
  WHERE workflow_id = p_workflow_id
    AND lead_id = p_lead_id
    AND status = 'success';

  -- Check max sends
  IF v_execution_count >= v_workflow.max_sends_per_lead THEN
    RETURN FALSE;
  END IF;

  -- Check cooldown
  IF v_last_execution IS NOT NULL
     AND v_last_execution > NOW() - (v_workflow.cooldown_hours || ' hours')::INTERVAL THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- Seed system templates
-- ============================================

INSERT INTO message_templates (name, description, type, subject, body, variables, category, is_system) VALUES

-- Welcome email
('Welcome Email', 'Sent when a new lead is created', 'email',
 'Thanks for reaching out to {{company_name}}!',
 E'Hi {{customer_name}},\n\nThank you for contacting us about your roofing project. We''ve received your information and one of our specialists will be in touch shortly.\n\nIn the meantime, feel free to call us at {{company_phone}} if you have any questions.\n\nBest regards,\n{{company_name}}',
 ARRAY['customer_name', 'company_name', 'company_phone'],
 'lead', true),

-- Welcome SMS
('Welcome SMS', 'Sent when a new lead is created', 'sms',
 NULL,
 'Hi {{customer_name}}! Thanks for reaching out to {{company_name}}. We''ll be in touch soon. Questions? Call {{company_phone}}',
 ARRAY['customer_name', 'company_name', 'company_phone'],
 'lead', true),

-- Estimate ready email
('Estimate Ready Email', 'Sent when estimate is generated', 'email',
 'Your Roofing Estimate is Ready - {{company_name}}',
 E'Hi {{customer_name}},\n\nGreat news! Your roofing estimate is ready for review.\n\nEstimated cost: ${{estimate_total}}\n\nView your detailed estimate here: {{estimate_link}}\n\nThis estimate is valid for 30 days. If you have any questions or would like to schedule a consultation, please don''t hesitate to reach out.\n\nBest regards,\n{{company_name}}\n{{company_phone}}',
 ARRAY['customer_name', 'company_name', 'company_phone', 'estimate_total', 'estimate_link'],
 'estimate', true),

-- Estimate ready SMS
('Estimate Ready SMS', 'Sent when estimate is generated', 'sms',
 NULL,
 'Hi {{customer_name}}! Your roofing estimate (${{estimate_total}}) is ready: {{estimate_link}} - {{company_name}}',
 ARRAY['customer_name', 'estimate_total', 'estimate_link', 'company_name'],
 'estimate', true),

-- Follow-up email (24h)
('24 Hour Follow-up Email', 'Sent 24 hours after estimate', 'email',
 'Following up on your roofing estimate',
 E'Hi {{customer_name}},\n\nI wanted to follow up on the estimate we sent yesterday for your roofing project.\n\nDo you have any questions about the estimate or our services? I''d be happy to schedule a call to discuss the details.\n\nBest regards,\n{{company_name}}\n{{company_phone}}',
 ARRAY['customer_name', 'company_name', 'company_phone'],
 'follow_up', true),

-- Follow-up SMS (24h)
('24 Hour Follow-up SMS', 'Sent 24 hours after estimate', 'sms',
 NULL,
 'Hi {{customer_name}}, just following up on your roofing estimate. Any questions? Reply here or call {{company_phone}} - {{company_name}}',
 ARRAY['customer_name', 'company_name', 'company_phone'],
 'follow_up', true),

-- Quote reminder email (3 days)
('Quote Reminder Email', 'Sent 3 days after quote sent', 'email',
 'Your roofing quote expires soon',
 E'Hi {{customer_name}},\n\nJust a friendly reminder that your roofing quote will expire in a few days.\n\nIf you''re ready to move forward or have any questions, we''re here to help. Don''t miss out on securing your roof before the busy season!\n\nView your quote: {{estimate_link}}\n\nBest regards,\n{{company_name}}\n{{company_phone}}',
 ARRAY['customer_name', 'company_name', 'company_phone', 'estimate_link'],
 'follow_up', true),

-- Appointment confirmation email
('Appointment Confirmation Email', 'Sent when appointment is scheduled', 'email',
 'Appointment Confirmed - {{company_name}}',
 E'Hi {{customer_name}},\n\nYour appointment has been confirmed!\n\nDate: {{appointment_date}}\nTime: {{appointment_time}}\nAddress: {{property_address}}\n\nOne of our specialists will arrive at the scheduled time. If you need to reschedule, please call us at {{company_phone}}.\n\nSee you soon!\n{{company_name}}',
 ARRAY['customer_name', 'company_name', 'company_phone', 'appointment_date', 'appointment_time', 'property_address'],
 'appointment', true),

-- Appointment confirmation SMS
('Appointment Confirmation SMS', 'Sent when appointment is scheduled', 'sms',
 NULL,
 'Confirmed! Your {{company_name}} appointment is {{appointment_date}} at {{appointment_time}}. Questions? {{company_phone}}',
 ARRAY['company_name', 'appointment_date', 'appointment_time', 'company_phone'],
 'appointment', true),

-- Appointment reminder SMS (day before)
('Appointment Reminder SMS', 'Sent day before appointment', 'sms',
 NULL,
 'Reminder: Your {{company_name}} appointment is tomorrow at {{appointment_time}}. We''ll see you at {{property_address}}!',
 ARRAY['company_name', 'appointment_time', 'property_address'],
 'appointment', true),

-- Review request email
('Review Request Email', 'Sent after job completion', 'email',
 'How did we do? - {{company_name}}',
 E'Hi {{customer_name}},\n\nThank you for choosing {{company_name}} for your roofing project!\n\nWe hope you''re happy with the work. If so, would you mind leaving us a review? It really helps other homeowners find quality roofers.\n\n{{review_link}}\n\nIf there''s anything we could have done better, please let us know directly at {{company_phone}}.\n\nThank you!\n{{company_name}}',
 ARRAY['customer_name', 'company_name', 'company_phone', 'review_link'],
 'review', true);

-- ============================================
-- Seed default workflows
-- ============================================

INSERT INTO automation_workflows (name, description, trigger_event, delay_minutes, template_id, is_active, conditions) VALUES

-- Welcome sequence
('Welcome Email', 'Send welcome email when new lead is created', 'lead_created', 0,
 (SELECT id FROM message_templates WHERE name = 'Welcome Email' LIMIT 1),
 true, '{"has_email": true}'),

('Welcome SMS', 'Send welcome SMS when new lead is created', 'lead_created', 5,
 (SELECT id FROM message_templates WHERE name = 'Welcome SMS' LIMIT 1),
 true, '{"has_phone": true}'),

-- Estimate sequence
('Estimate Ready Email', 'Send email when estimate is generated', 'estimate_generated', 0,
 (SELECT id FROM message_templates WHERE name = 'Estimate Ready Email' LIMIT 1),
 true, '{"has_email": true}'),

('Estimate Ready SMS', 'Send SMS when estimate is generated', 'estimate_generated', 5,
 (SELECT id FROM message_templates WHERE name = 'Estimate Ready SMS' LIMIT 1),
 true, '{"has_phone": true}'),

-- Follow-up sequence
('24h Follow-up Email', 'Follow up 24 hours after estimate', 'estimate_generated', 1440,
 (SELECT id FROM message_templates WHERE name = '24 Hour Follow-up Email' LIMIT 1),
 true, '{"has_email": true}'),

('3 Day Quote Reminder', 'Remind about quote after 3 days', 'quote_sent', 4320,
 (SELECT id FROM message_templates WHERE name = 'Quote Reminder Email' LIMIT 1),
 true, '{"has_email": true}');

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE message_templates IS 'Reusable email and SMS templates with variable substitution.';
COMMENT ON TABLE automation_workflows IS 'Event-triggered automation rules for sending messages.';
COMMENT ON TABLE scheduled_messages IS 'Queue of messages scheduled for future delivery.';
COMMENT ON TABLE communication_logs IS 'Complete history of all inbound and outbound communications.';
COMMENT ON TABLE workflow_executions IS 'Audit trail of workflow executions.';
COMMENT ON TABLE sms_conversations IS 'SMS conversation threads for two-way messaging.';

COMMENT ON FUNCTION render_template IS 'Renders a template body by replacing {{variable}} placeholders with values from JSON.';
COMMENT ON FUNCTION should_execute_workflow IS 'Checks if a workflow should execute for a lead based on limits and cooldowns.';
