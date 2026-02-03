import { createAdminClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email'

export interface AutoCreateCustomerParams {
  leadId: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
}

export interface AutoCreateCustomerResult {
  success: boolean
  customerId?: string
  authUserId?: string
  alreadyExists?: boolean
  error?: string
}

/**
 * Auto-creates a customer account when an estimate is generated.
 * - Creates a Supabase Auth user (if doesn't exist)
 * - Creates a customer record (if doesn't exist)
 * - Links customer to lead via customer_leads table
 * - Sends welcome email with magic link to portal
 */
export async function autoCreateCustomerAccount(
  params: AutoCreateCustomerParams
): Promise<AutoCreateCustomerResult> {
  const { leadId, email, firstName, lastName, phone } = params

  if (!email) {
    return { success: false, error: 'Email is required' }
  }

  const supabase = await createAdminClient()

  try {
    // 1. Check if auth user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingAuthUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    )

    let authUserId: string

    if (existingAuthUser) {
      authUserId = existingAuthUser.id
    } else {
      // 2. Create auth user with a random password (they'll use magic link)
      const tempPassword = crypto.randomUUID() + crypto.randomUUID()
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          role: 'customer',
          first_name: firstName,
          last_name: lastName,
        },
      })

      if (createError) {
        return { success: false, error: `Failed to create user: ${createError.message}` }
      }

      authUserId = newUser.user.id
    }

    // 3. Check if customer record exists
    const { data: existingCustomerData } = await supabase
      .from('customers')
      .select('id')
      .eq('auth_user_id', authUserId)
      .single()

    const existingCustomer = existingCustomerData as { id: string } | null

    let customerId: string

    if (existingCustomer) {
      customerId = existingCustomer.id
    } else {
      // 4. Create customer record
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          auth_user_id: authUserId,
          email,
          first_name: firstName || null,
          last_name: lastName || null,
          phone: phone || null,
        } as never)
        .select('id')
        .single()

      if (customerError) {
        return { success: false, error: `Failed to create customer: ${customerError.message}` }
      }

      customerId = (newCustomer as { id: string }).id
    }

    // 5. Check if customer_leads link exists
    const { data: existingLink } = await supabase
      .from('customer_leads')
      .select('id')
      .eq('customer_id', customerId)
      .eq('lead_id', leadId)
      .single()

    if (!existingLink) {
      // 6. Link customer to lead
      const { error: linkError } = await supabase
        .from('customer_leads')
        .insert({
          customer_id: customerId,
          lead_id: leadId,
          is_primary: true,
        } as never)

      if (linkError) {
        // Non-fatal - customer was still created, but log for debugging
        console.error(`[auto-create] Failed to link customer ${customerId} to lead ${leadId}:`, linkError.message)
      }
    }

    // 7. Send welcome email (non-blocking)
    if (!existingAuthUser) {
      sendWelcomeEmail({
        email,
        firstName,
        leadId,
      }).catch(() => {
        // Welcome email failed - non-fatal
      })
    }

    return {
      success: true,
      customerId,
      authUserId,
      alreadyExists: !!existingAuthUser,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
