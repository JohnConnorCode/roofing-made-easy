-- ============================================
-- Invoice System Migration
-- Enables full invoicing workflow with line items,
-- status tracking, and Stripe payment integration
-- ============================================

-- Invoice status enum
CREATE TYPE invoice_status AS ENUM (
  'draft',
  'sent',
  'viewed',
  'paid',
  'partially_paid',
  'overdue',
  'cancelled',
  'refunded'
);

-- Invoice payment type enum
CREATE TYPE invoice_payment_type AS ENUM (
  'deposit',
  'progress',
  'final',
  'adjustment'
);

-- ============================================
-- Table: invoices
-- Main invoice records with totals and status
-- ============================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  estimate_id UUID REFERENCES detailed_estimates(id) ON DELETE SET NULL,

  -- Invoice identification
  invoice_number TEXT UNIQUE NOT NULL,

  -- Status tracking
  status invoice_status NOT NULL DEFAULT 'draft',
  payment_type invoice_payment_type NOT NULL DEFAULT 'deposit',

  -- Amounts
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5, 4) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(12, 2) NOT NULL DEFAULT 0,
  balance_due DECIMAL(12, 2) NOT NULL DEFAULT 0,

  -- Dates
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,

  -- Tracking timestamps
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,

  -- Stripe integration
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,

  -- Recipient info (denormalized for invoice history)
  bill_to_name VARCHAR(255),
  bill_to_email VARCHAR(255),
  bill_to_phone VARCHAR(50),
  bill_to_address TEXT,

  -- Notes
  notes TEXT,
  internal_notes TEXT,
  terms TEXT,

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Table: invoice_line_items
-- Individual line items on each invoice
-- ============================================
CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  -- Description
  description TEXT NOT NULL,

  -- Amounts
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,

  -- Taxable flag
  is_taxable BOOLEAN NOT NULL DEFAULT true,

  -- Display order
  sort_order INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Table: invoice_payments
-- Track individual payments against invoices
-- (one invoice can have multiple partial payments)
-- ============================================
CREATE TABLE invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  -- Payment details
  amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(50), -- card, check, cash, bank_transfer

  -- Stripe reference
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, succeeded, failed, refunded

  -- Payer info
  payer_email VARCHAR(255),
  payer_name VARCHAR(255),

  -- Notes
  notes TEXT,
  receipt_url TEXT,

  -- Timestamps
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Sequence for invoice numbers
-- ============================================
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START WITH 1001;

-- ============================================
-- Function to generate invoice number
-- ============================================
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'INV-' || LPAD(nextval('invoice_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Trigger to auto-generate invoice number
-- ============================================
CREATE OR REPLACE FUNCTION trigger_set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_invoice_number();

-- ============================================
-- Function to recalculate invoice totals
-- ============================================
CREATE OR REPLACE FUNCTION recalculate_invoice_totals(p_invoice_id UUID)
RETURNS void AS $$
DECLARE
  v_subtotal DECIMAL(12, 2);
  v_taxable_amount DECIMAL(12, 2);
  v_tax_rate DECIMAL(5, 4);
  v_tax_amount DECIMAL(12, 2);
  v_discount_percent DECIMAL(5, 2);
  v_discount_amount DECIMAL(12, 2);
  v_total DECIMAL(12, 2);
  v_amount_paid DECIMAL(12, 2);
BEGIN
  -- Get invoice settings
  SELECT tax_rate, discount_percent
  INTO v_tax_rate, v_discount_percent
  FROM invoices
  WHERE id = p_invoice_id;

  -- Sum line items
  SELECT
    COALESCE(SUM(total), 0),
    COALESCE(SUM(CASE WHEN is_taxable THEN total ELSE 0 END), 0)
  INTO v_subtotal, v_taxable_amount
  FROM invoice_line_items
  WHERE invoice_id = p_invoice_id;

  -- Calculate discount
  v_discount_amount := v_subtotal * (v_discount_percent / 100);

  -- Calculate tax on discounted taxable amount
  v_tax_amount := (v_taxable_amount - (v_taxable_amount * v_discount_percent / 100)) * v_tax_rate;

  -- Calculate total
  v_total := v_subtotal - v_discount_amount + v_tax_amount;

  -- Get amount paid
  SELECT COALESCE(SUM(amount), 0)
  INTO v_amount_paid
  FROM invoice_payments
  WHERE invoice_id = p_invoice_id AND status = 'succeeded';

  -- Update invoice
  UPDATE invoices
  SET
    subtotal = v_subtotal,
    tax_amount = v_tax_amount,
    discount_amount = v_discount_amount,
    total = v_total,
    amount_paid = v_amount_paid,
    balance_due = v_total - v_amount_paid,
    updated_at = NOW()
  WHERE id = p_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Trigger to recalculate totals on line item changes
-- ============================================
CREATE OR REPLACE FUNCTION trigger_recalculate_invoice_on_line_item()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM recalculate_invoice_totals(OLD.invoice_id);
    RETURN OLD;
  ELSE
    -- Calculate line total before trigger completes
    NEW.total := NEW.quantity * NEW.unit_price;
    PERFORM recalculate_invoice_totals(NEW.invoice_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_invoice_on_line_item_change
  AFTER INSERT OR UPDATE OR DELETE ON invoice_line_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_invoice_on_line_item();

-- ============================================
-- Trigger to recalculate totals on payment changes
-- ============================================
CREATE OR REPLACE FUNCTION trigger_recalculate_invoice_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM recalculate_invoice_totals(OLD.invoice_id);
    RETURN OLD;
  ELSE
    PERFORM recalculate_invoice_totals(NEW.invoice_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_invoice_on_payment_change
  AFTER INSERT OR UPDATE OR DELETE ON invoice_payments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_invoice_on_payment();

-- ============================================
-- Function to update invoice status based on payments
-- ============================================
CREATE OR REPLACE FUNCTION update_invoice_payment_status()
RETURNS TRIGGER AS $$
DECLARE
  v_total DECIMAL(12, 2);
  v_amount_paid DECIMAL(12, 2);
  v_new_status invoice_status;
BEGIN
  -- Get current invoice totals
  SELECT total, amount_paid
  INTO v_total, v_amount_paid
  FROM invoices
  WHERE id = NEW.invoice_id;

  -- Determine new status
  IF v_amount_paid >= v_total THEN
    v_new_status := 'paid';
    UPDATE invoices
    SET status = v_new_status, paid_at = NOW(), updated_at = NOW()
    WHERE id = NEW.invoice_id AND status NOT IN ('paid', 'cancelled', 'refunded');
  ELSIF v_amount_paid > 0 THEN
    v_new_status := 'partially_paid';
    UPDATE invoices
    SET status = v_new_status, updated_at = NOW()
    WHERE id = NEW.invoice_id AND status NOT IN ('paid', 'cancelled', 'refunded');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoice_status_on_payment
  AFTER INSERT OR UPDATE ON invoice_payments
  FOR EACH ROW
  WHEN (NEW.status = 'succeeded')
  EXECUTE FUNCTION update_invoice_payment_status();

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_invoices_lead_id ON invoices(lead_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_estimate_id ON invoices(estimate_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);

CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
CREATE INDEX idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);
CREATE INDEX idx_invoice_payments_stripe_intent ON invoice_payments(stripe_payment_intent_id);

-- ============================================
-- Updated_at triggers
-- ============================================
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_line_items_updated_at
  BEFORE UPDATE ON invoice_line_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_payments_updated_at
  BEFORE UPDATE ON invoice_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;

-- Admins can manage all invoices
CREATE POLICY "invoices_admin" ON invoices FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

-- Customers can view their own invoices
CREATE POLICY "invoices_customer_read" ON invoices FOR SELECT USING (
  customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  OR
  lead_id IN (SELECT lead_id FROM customer_leads WHERE customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()))
);

-- Invoice line items follow invoice access
CREATE POLICY "invoice_line_items_admin" ON invoice_line_items FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

CREATE POLICY "invoice_line_items_customer_read" ON invoice_line_items FOR SELECT USING (
  invoice_id IN (
    SELECT id FROM invoices WHERE
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    OR
    lead_id IN (SELECT lead_id FROM customer_leads WHERE customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()))
  )
);

-- Invoice payments follow invoice access
CREATE POLICY "invoice_payments_admin" ON invoice_payments FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

CREATE POLICY "invoice_payments_customer_read" ON invoice_payments FOR SELECT USING (
  invoice_id IN (
    SELECT id FROM invoices WHERE
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    OR
    lead_id IN (SELECT lead_id FROM customer_leads WHERE customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()))
  )
);

-- Allow customers to create payments (for online payment)
CREATE POLICY "invoice_payments_customer_insert" ON invoice_payments FOR INSERT WITH CHECK (
  invoice_id IN (
    SELECT id FROM invoices WHERE
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    OR
    lead_id IN (SELECT lead_id FROM customer_leads WHERE customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()))
  )
);

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE invoices IS 'Invoice records with line items, payment tracking, and Stripe integration';
COMMENT ON TABLE invoice_line_items IS 'Individual line items on each invoice';
COMMENT ON TABLE invoice_payments IS 'Individual payment records against invoices';
COMMENT ON FUNCTION generate_invoice_number() IS 'Auto-generates invoice numbers in format INV-XXXXXX';
COMMENT ON FUNCTION recalculate_invoice_totals(UUID) IS 'Recalculates invoice subtotal, tax, discount, total, and balance';
