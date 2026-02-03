-- ============================================
-- Phase: Email Template System Enhancement
-- Add system templates to database with full HTML support
-- ============================================

-- Add slug column for system template identification
ALTER TABLE message_templates ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;

-- Add default_body column for reset functionality
ALTER TABLE message_templates ADD COLUMN IF NOT EXISTS default_body TEXT;

-- Add default_subject column for reset functionality
ALTER TABLE message_templates ADD COLUMN IF NOT EXISTS default_subject VARCHAR(200);

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_message_templates_slug ON message_templates(slug);

-- ============================================
-- Seed system email templates with HTML support
-- These are the templates used by the hardcoded email functions
-- ============================================

-- Note: HTML templates use {{variable}} placeholders
-- The rendering system will substitute these with actual values

INSERT INTO message_templates (slug, name, description, type, subject, body, variables, category, is_system, is_active, default_body, default_subject) VALUES

-- New Lead Admin Notification
('new_lead_admin', 'New Lead Notification', 'Sent to admin when a new lead is created', 'email',
 'New Lead: {{customer_name}}',
 E'<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td>
      {{#urgency_badge}}
      <h2 style="margin: 0 0 8px; color: #0c0f14; font-size: 20px; font-weight: 600;">New Lead Received</h2>
      <p style="margin: 0 0 24px; color: #64748b; font-size: 14px;">{{created_at_formatted}}</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 24px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px;">Name</td><td style="padding: 8px 0; color: #334155; font-size: 14px; font-weight: 500;">{{customer_name}}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email</td><td style="padding: 8px 0; color: #334155; font-size: 14px; font-weight: 500;">{{customer_email}}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Phone</td><td style="padding: 8px 0; color: #334155; font-size: 14px; font-weight: 500;">{{customer_phone}}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Address</td><td style="padding: 8px 0; color: #334155; font-size: 14px; font-weight: 500;">{{property_address}}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Service</td><td style="padding: 8px 0; color: #334155; font-size: 14px; font-weight: 500;">{{job_type}}</td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding-top: 24px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="border-radius: 8px; background-color: #c9a25c;">
            <a href="{{admin_url}}" target="_blank" style="display: inline-block; padding: 14px 28px; color: #0c0f14; text-decoration: none; font-size: 14px; font-weight: 600;">View Lead Details</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>',
 ARRAY['customer_name', 'customer_email', 'customer_phone', 'property_address', 'job_type', 'admin_url', 'created_at_formatted', 'urgency_badge'],
 'notification', true, true, NULL, NULL),

-- Estimate Generated Admin Notification
('estimate_generated_admin', 'Estimate Generated Notification', 'Sent to admin when estimate is generated', 'email',
 'Estimate Generated: {{customer_name}} - {{estimate_total}}',
 E'<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td>
      <h2 style="margin: 0 0 8px; color: #0c0f14; font-size: 20px; font-weight: 600;">Estimate Generated</h2>
      <p style="margin: 0 0 24px; color: #64748b; font-size: 14px;">A customer has completed the estimate funnel</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 24px; background-color: #0c0f14; border-radius: 8px; text-align: center; margin-bottom: 24px;">
      <p style="margin: 0 0 8px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Estimated Price</p>
      <p style="margin: 0; color: #c9a25c; font-size: 36px; font-weight: 700;">{{estimate_total}}</p>
      <p style="margin: 8px 0 0; color: #94a3b8; font-size: 14px;">Range: {{estimate_low}} - {{estimate_high}}</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #f8fafc; border-radius: 8px; margin-top: 24px;">
      <p style="margin: 0 0 12px; color: #0c0f14; font-size: 14px; font-weight: 600;">Customer Details</p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px;">Name</td><td style="padding: 8px 0; color: #334155; font-size: 14px; font-weight: 500;">{{customer_name}}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email</td><td style="padding: 8px 0; color: #334155; font-size: 14px; font-weight: 500;">{{customer_email}}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">Phone</td><td style="padding: 8px 0; color: #334155; font-size: 14px; font-weight: 500;">{{customer_phone}}</td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding-top: 24px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="border-radius: 8px; background-color: #c9a25c;">
            <a href="{{admin_url}}" target="_blank" style="display: inline-block; padding: 14px 28px; color: #0c0f14; text-decoration: none; font-size: 14px; font-weight: 600;">View Full Details</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>',
 ARRAY['customer_name', 'customer_email', 'customer_phone', 'estimate_total', 'estimate_low', 'estimate_high', 'admin_url'],
 'notification', true, true, NULL, NULL),

-- Customer Estimate Email
('customer_estimate', 'Customer Estimate Email', 'Sent to customer with their estimate', 'email',
 'Your Roofing Estimate: {{estimate_total}}',
 E'<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td>
      <h2 style="margin: 0 0 8px; color: #0c0f14; font-size: 20px; font-weight: 600;">Hi {{customer_first_name}}!</h2>
      <p style="margin: 0 0 24px; color: #334155; font-size: 16px; line-height: 1.6;">
        Thank you for requesting an estimate for your roofing project. Based on the information you provided, here''s your personalized estimate:
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding: 32px; background-color: #0c0f14; border-radius: 12px; text-align: center;">
      <p style="margin: 0 0 8px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Estimated Investment</p>
      <p style="margin: 0; color: #c9a25c; font-size: 42px; font-weight: 700;">{{estimate_total}}</p>
      <p style="margin: 12px 0 0; color: #94a3b8; font-size: 14px;">Range: {{estimate_low}} - {{estimate_high}}</p>
    </td>
  </tr>
  <tr>
    <td style="text-align: center; padding-top: 24px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
        <tr>
          <td style="border-radius: 8px; background-color: #c9a25c;">
            <a href="{{estimate_link}}" target="_blank" style="display: inline-block; padding: 14px 28px; color: #0c0f14; text-decoration: none; font-size: 14px; font-weight: 600;">View My Estimate</a>
          </td>
        </tr>
      </table>
      <p style="margin: 16px 0 0; color: #64748b; font-size: 13px;">You can access this estimate anytime using the button above.</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 32px 0 0;">
      <h3 style="margin: 0 0 16px; color: #0c0f14; font-size: 16px; font-weight: 600;">What''s Next?</h3>
      <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.8;">
        1. <strong>Review your estimate</strong> - Click the button above to see the full breakdown<br>
        2. <strong>Schedule a consultation</strong> - We''ll do an on-site inspection at no cost<br>
        3. <strong>Get a detailed quote</strong> - After inspection, we''ll provide an exact price
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding: 24px 0 0;">
      <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">
        Questions? Just reply to this email or call us at <strong style="color: #334155;">{{company_phone}}</strong>. We''re here to help!
      </p>
    </td>
  </tr>
</table>',
 ARRAY['customer_first_name', 'estimate_total', 'estimate_low', 'estimate_high', 'estimate_link', 'company_phone'],
 'estimate', true, true, NULL, NULL),

-- Contact Form Confirmation
('contact_confirmation', 'Contact Form Confirmation', 'Sent to customer after contact form submission', 'email',
 'We received your message - {{company_name}}',
 E'<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td>
      <h2 style="margin: 0 0 8px; color: #0c0f14; font-size: 20px; font-weight: 600;">Thanks for reaching out, {{customer_first_name}}!</h2>
      <p style="margin: 0 0 24px; color: #334155; font-size: 16px; line-height: 1.6;">
        We''ve received your message and will get back to you within 24 hours. In the meantime, here''s a copy of what you sent us:
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #c9a25c;">
      <p style="margin: 0 0 8px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Your Message</p>
      <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">{{message_body}}</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 24px 0;">
      <p style="margin: 0 0 16px; color: #0c0f14; font-size: 14px; font-weight: 600;">Need faster service?</p>
      <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">
        Call us directly at <strong>{{company_phone}}</strong> or get an instant estimate online.
      </p>
    </td>
  </tr>
  <tr>
    <td>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="border-radius: 8px; background-color: #c9a25c;">
            <a href="{{website_url}}" target="_blank" style="display: inline-block; padding: 14px 28px; color: #0c0f14; text-decoration: none; font-size: 14px; font-weight: 600;">Get a Free Estimate</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>',
 ARRAY['customer_first_name', 'message_body', 'company_phone', 'company_name', 'website_url'],
 'contact', true, true, NULL, NULL),

-- Daily Digest
('daily_digest', 'Daily Digest', 'Daily summary of leads and pipeline', 'email',
 'Daily Digest: {{new_leads_count}} new leads, {{pipeline_value}} pipeline',
 E'<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td>
      <h2 style="margin: 0 0 8px; color: #0c0f14; font-size: 20px; font-weight: 600;">Daily Digest</h2>
      <p style="margin: 0 0 24px; color: #64748b; font-size: 14px;">{{date_formatted}}</p>
    </td>
  </tr>
  <tr>
    <td>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="width: 33%; text-align: center; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
            <p style="margin: 0; color: #c9a25c; font-size: 32px; font-weight: 700;">{{new_leads_count}}</p>
            <p style="margin: 4px 0 0; color: #64748b; font-size: 12px; text-transform: uppercase;">New Leads</p>
          </td>
          <td style="width: 8px;"></td>
          <td style="width: 33%; text-align: center; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
            <p style="margin: 0; color: #c9a25c; font-size: 32px; font-weight: 700;">{{estimates_count}}</p>
            <p style="margin: 4px 0 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Estimates</p>
          </td>
          <td style="width: 8px;"></td>
          <td style="width: 33%; text-align: center; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
            <p style="margin: 0; color: #c9a25c; font-size: 24px; font-weight: 700;">{{pipeline_value}}</p>
            <p style="margin: 4px 0 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Pipeline</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding-top: 24px;">
      {{recent_leads_table}}
    </td>
  </tr>
  <tr>
    <td style="padding-top: 24px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="border-radius: 8px; background-color: #c9a25c;">
            <a href="{{admin_url}}" target="_blank" style="display: inline-block; padding: 14px 28px; color: #0c0f14; text-decoration: none; font-size: 14px; font-weight: 600;">View Dashboard</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>',
 ARRAY['date_formatted', 'new_leads_count', 'estimates_count', 'pipeline_value', 'recent_leads_table', 'admin_url'],
 'digest', true, true, NULL, NULL),

-- Consultation Reminder
('consultation_reminder', 'Consultation Reminder', 'Sent 24h before scheduled consultation', 'email',
 'Reminder: Your Roofing Consultation Tomorrow at {{appointment_time}}',
 E'<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td style="padding-bottom: 24px;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #0c0f14;">See You Tomorrow!</h1>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 24px;">
      <p style="margin: 0 0 16px; color: #334155; font-size: 16px; line-height: 1.6;">Hi {{customer_name}},</p>
      <p style="margin: 0; color: #334155; font-size: 16px; line-height: 1.6;">
        This is a friendly reminder that your roofing consultation is scheduled for <strong>tomorrow</strong>. We''re looking forward to meeting with you!
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 24px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: rgba(201, 162, 92, 0.1); border-radius: 12px; border: 2px solid rgba(201, 162, 92, 0.4);">
        <tr>
          <td style="padding: 24px;">
            <p style="margin: 0 0 4px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Consultation Details</p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 12px;">
              <tr><td style="padding: 8px 0;"><p style="margin: 0; color: #64748b; font-size: 14px;">Date</p><p style="margin: 4px 0 0; color: #0c0f14; font-size: 16px; font-weight: 600;">{{appointment_date}}</p></td></tr>
              <tr><td style="padding: 8px 0;"><p style="margin: 0; color: #64748b; font-size: 14px;">Time</p><p style="margin: 4px 0 0; color: #0c0f14; font-size: 16px; font-weight: 600;">{{appointment_time}}</p></td></tr>
              <tr><td style="padding: 8px 0;"><p style="margin: 0; color: #64748b; font-size: 14px;">Location</p><p style="margin: 4px 0 0; color: #0c0f14; font-size: 16px; font-weight: 600;">{{property_address}}</p></td></tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 24px;">
      <p style="margin: 0 0 12px; color: #0c0f14; font-size: 16px; font-weight: 600;">What to Expect</p>
      <ul style="margin: 0; padding: 0 0 0 20px; color: #334155; font-size: 15px; line-height: 1.8;">
        <li>We''ll perform a thorough roof inspection (about 30-45 minutes)</li>
        <li>Review any issues or concerns we find</li>
        <li>Discuss your options and answer any questions</li>
        <li>Provide a detailed estimate if repairs or replacement is needed</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <p style="margin: 0; color: #334155; font-size: 15px; line-height: 1.6;">
        <strong>Need to reschedule?</strong> No problem! Call us at {{company_phone}} and we''ll find a time that works better for you.
      </p>
    </td>
  </tr>
</table>',
 ARRAY['customer_name', 'appointment_date', 'appointment_time', 'property_address', 'company_phone'],
 'appointment', true, true, NULL, NULL),

-- Welcome Email (Portal Account)
('welcome_portal', 'Welcome Email', 'Sent when customer portal account is created', 'email',
 'Welcome to {{company_name}} - Your Account is Ready',
 E'<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td style="padding-bottom: 24px;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #0c0f14;">Welcome to {{company_name}}!</h1>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 24px;">
      <p style="margin: 0 0 16px; color: #334155; font-size: 16px; line-height: 1.6;">Hi {{customer_first_name}},</p>
      <p style="margin: 0; color: #334155; font-size: 16px; line-height: 1.6;">
        Thank you for getting an estimate with us! We''ve created a customer portal account for you where you can view your estimate, track your project progress, and manage your roofing journey.
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 24px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc; border-radius: 12px;">
        <tr>
          <td style="padding: 24px;">
            <p style="margin: 0 0 16px; color: #0c0f14; font-size: 16px; font-weight: 600;">With your portal account, you can:</p>
            <ul style="margin: 0; padding: 0 0 0 20px; color: #334155; font-size: 15px; line-height: 1.8;">
              <li>View and download your estimate anytime</li>
              <li>Upload photos of your roof</li>
              <li>Track your project status</li>
              <li>Explore financing options</li>
              <li>Communicate with our team</li>
            </ul>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="text-align: center; padding-bottom: 24px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
        <tr>
          <td style="border-radius: 8px; background-color: #c9a25c;">
            <a href="{{portal_link}}" target="_blank" style="display: inline-block; padding: 14px 28px; color: #0c0f14; text-decoration: none; font-size: 14px; font-weight: 600;">Access My Portal</a>
          </td>
        </tr>
      </table>
      <p style="margin: 16px 0 0; color: #64748b; font-size: 13px;">Sign in with your email to access your portal.</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #c9a25c;">
      <p style="margin: 0 0 8px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Your Account Email</p>
      <p style="margin: 0; color: #0c0f14; font-size: 16px; font-weight: 500;">{{customer_email}}</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 24px 0 0;">
      <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">
        Questions? Just reply to this email or call us at <strong style="color: #334155;">{{company_phone}}</strong>. We''re here to help!
      </p>
    </td>
  </tr>
</table>',
 ARRAY['customer_first_name', 'customer_email', 'company_name', 'company_phone', 'portal_link'],
 'welcome', true, true, NULL, NULL),

-- Payment Received
('payment_received', 'Payment Received', 'Sent when a payment is received', 'email',
 'Payment Received - {{payment_amount}} {{payment_type}}',
 E'<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td style="padding-bottom: 24px; text-align: center;">
      <div style="display: inline-block; width: 64px; height: 64px; background-color: rgba(34, 197, 94, 0.125); border-radius: 50%; line-height: 64px; margin-bottom: 16px;">
        <span style="font-size: 32px; color: #22c55e;">✓</span>
      </div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #0c0f14;">Payment Received!</h1>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 24px;">
      <p style="margin: 0; color: #334155; font-size: 16px; line-height: 1.6; text-align: center;">
        Hi {{customer_name}}, thank you for your payment! We''ve successfully received your {{payment_type_label}}.
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 24px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
        <tr>
          <td style="padding: 24px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
                  <p style="margin: 0; color: #64748b; font-size: 14px;">{{payment_type_label}}</p>
                  <p style="margin: 8px 0 0; color: #22c55e; font-size: 32px; font-weight: 700;">{{payment_amount}}</p>
                </td>
              </tr>
              <tr>
                <td style="padding-top: 16px;">
                  <p style="margin: 0; color: #64748b; font-size: 14px;">Project Address</p>
                  <p style="margin: 4px 0 0; color: #0c0f14; font-size: 16px;">{{property_address}}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 24px;">
      <p style="margin: 0 0 12px; color: #0c0f14; font-size: 16px; font-weight: 600;">What''s Next?</p>
      <p style="margin: 0; color: #334155; font-size: 15px; line-height: 1.6;">{{next_steps_message}}</p>
    </td>
  </tr>
  <tr>
    <td>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="border-radius: 8px; background-color: #c9a25c;">
            <a href="{{portal_link}}" target="_blank" style="display: inline-block; padding: 14px 28px; color: #0c0f14; text-decoration: none; font-size: 14px; font-weight: 600;">View Project Details</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>',
 ARRAY['customer_name', 'payment_amount', 'payment_type_label', 'property_address', 'next_steps_message', 'portal_link'],
 'payment', true, true, NULL, NULL)

ON CONFLICT (slug) DO UPDATE SET
  body = EXCLUDED.body,
  subject = EXCLUDED.subject,
  variables = EXCLUDED.variables,
  is_active = true,
  updated_at = NOW();

-- Store original body as default_body for reset functionality
UPDATE message_templates
SET default_body = body, default_subject = subject
WHERE is_system = true AND default_body IS NULL;

-- ============================================
-- Comments
-- ============================================

COMMENT ON COLUMN message_templates.slug IS 'Unique identifier for system templates, used for programmatic access';
COMMENT ON COLUMN message_templates.default_body IS 'Original template body for reset functionality';
COMMENT ON COLUMN message_templates.default_subject IS 'Original template subject for reset functionality';
