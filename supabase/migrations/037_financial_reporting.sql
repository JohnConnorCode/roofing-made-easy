-- ============================================
-- Financial Reporting Views
-- Materialized views for revenue, profitability,
-- and accounts receivable aging analysis
-- ============================================

-- ============================================
-- View: financial_summary
-- Monthly revenue, costs, and profit metrics
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS financial_summary AS
SELECT
  date_trunc('month', j.created_at)::DATE AS month,
  COUNT(j.id) AS total_jobs,
  COUNT(j.id) FILTER (WHERE j.status IN ('in_progress', 'scheduled', 'inspection_pending', 'punch_list')) AS active_jobs,
  COUNT(j.id) FILTER (WHERE j.status IN ('completed', 'warranty_active', 'closed')) AS completed_jobs,
  COALESCE(SUM(j.contract_amount), 0) AS total_revenue,
  COALESCE(SUM(j.material_cost), 0) AS total_material_cost,
  COALESCE(SUM(j.labor_cost), 0) AS total_labor_cost,
  COALESCE(SUM(j.contract_amount) - SUM(j.material_cost) - SUM(j.labor_cost), 0) AS gross_profit,
  CASE
    WHEN SUM(j.contract_amount) > 0
    THEN ROUND(((SUM(j.contract_amount) - SUM(j.material_cost) - SUM(j.labor_cost)) / SUM(j.contract_amount) * 100)::NUMERIC, 1)
    ELSE 0
  END AS gross_margin_pct,
  COALESCE(SUM(j.total_paid), 0) AS total_collected,
  COALESCE(SUM(j.total_invoiced) - SUM(j.total_paid), 0) AS outstanding_ar
FROM jobs j
GROUP BY date_trunc('month', j.created_at)
ORDER BY month DESC;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX idx_financial_summary_month ON financial_summary(month);

-- ============================================
-- View: ar_aging
-- Accounts receivable aging buckets
-- ============================================
CREATE OR REPLACE VIEW ar_aging AS
SELECT
  i.id AS invoice_id,
  i.invoice_number,
  i.lead_id,
  i.customer_id,
  i.bill_to_name,
  i.bill_to_email,
  i.total,
  i.amount_paid,
  i.balance_due,
  i.issue_date,
  i.due_date,
  i.status,
  CASE
    WHEN i.due_date IS NULL THEN 'current'
    WHEN CURRENT_DATE - i.due_date <= 0 THEN 'current'
    WHEN CURRENT_DATE - i.due_date BETWEEN 1 AND 30 THEN '1_30'
    WHEN CURRENT_DATE - i.due_date BETWEEN 31 AND 60 THEN '31_60'
    WHEN CURRENT_DATE - i.due_date BETWEEN 61 AND 90 THEN '61_90'
    ELSE '90_plus'
  END AS aging_bucket,
  GREATEST(CURRENT_DATE - i.due_date, 0) AS days_overdue
FROM invoices i
WHERE i.status NOT IN ('paid', 'cancelled', 'refunded')
  AND i.balance_due > 0
ORDER BY i.due_date ASC NULLS LAST;

-- ============================================
-- Comments
-- ============================================
COMMENT ON MATERIALIZED VIEW financial_summary IS 'Monthly financial metrics aggregated from jobs. Refresh daily via cron.';
COMMENT ON VIEW ar_aging IS 'Accounts receivable aging report showing invoices in aging buckets';
