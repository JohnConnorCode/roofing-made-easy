-- Aggregate estimate status counts in a single query instead of 5 separate HEAD requests
CREATE OR REPLACE FUNCTION get_estimate_status_counts()
RETURNS json AS $$
  SELECT json_build_object(
    'total', COUNT(*),
    'draft', COUNT(*) FILTER (WHERE status = 'draft'),
    'sent', COUNT(*) FILTER (WHERE status = 'sent'),
    'accepted', COUNT(*) FILTER (WHERE status = 'accepted'),
    'expired', COUNT(*) FILTER (WHERE status = 'expired'),
    'total_value', COALESCE(SUM(price_likely), 0)
  ) FROM estimates;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
