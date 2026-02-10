-- Performance indexes for common query patterns
-- All use IF NOT EXISTS to be safely re-runnable

CREATE INDEX IF NOT EXISTS idx_estimates_status ON estimates(status);
CREATE INDEX IF NOT EXISTS idx_estimates_lead_id_not_superseded ON estimates(lead_id) WHERE is_superseded = false;
CREATE INDEX IF NOT EXISTS idx_detailed_estimates_lead_id ON detailed_estimates(lead_id);
CREATE INDEX IF NOT EXISTS idx_customers_auth_user_id ON customers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_customer_leads_customer_id ON customer_leads(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_lead_id ON invoices(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);
