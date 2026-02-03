/**
 * Integration Connection Testers
 *
 * Test functions for verifying API credentials work before saving.
 * Each tester makes a minimal API call to verify the credentials are valid.
 */

import { Resend } from 'resend'
import Stripe from 'stripe'
import twilio from 'twilio'
import OpenAI from 'openai'
import type {
  ResendCredentials,
  StripeCredentials,
  TwilioCredentials,
  OpenAICredentials,
} from '@/lib/credentials/loader'

export interface TestResult {
  success: boolean
  error?: string
  details?: string
}

/**
 * Test Resend API credentials
 * Uses the API Keys list endpoint (minimal, read-only)
 */
export async function testResendConnection(
  credentials: ResendCredentials
): Promise<TestResult> {
  try {
    const resend = new Resend(credentials.apiKey)

    // List API keys is a simple read operation
    await resend.apiKeys.list()

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    // Check for common error types
    if (message.includes('401') || message.includes('Unauthorized')) {
      return { success: false, error: 'Invalid API key' }
    }

    return { success: false, error: message }
  }
}

/**
 * Test Stripe API credentials
 * Uses the balance retrieve endpoint (minimal, read-only)
 */
export async function testStripeConnection(
  credentials: StripeCredentials
): Promise<TestResult> {
  try {
    const stripe = new Stripe(credentials.secretKey, {
      apiVersion: '2026-01-28.clover',
    })

    // Retrieve balance is a simple read operation
    await stripe.balance.retrieve()

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    // Check for common Stripe error types
    if (message.includes('Invalid API Key')) {
      return { success: false, error: 'Invalid API key' }
    }
    if (message.includes('api_key_expired')) {
      return { success: false, error: 'API key has expired' }
    }

    return { success: false, error: message }
  }
}

/**
 * Test Twilio API credentials
 * Uses account fetch endpoint (minimal, read-only)
 */
export async function testTwilioConnection(
  credentials: TwilioCredentials
): Promise<TestResult> {
  try {
    const client = twilio(credentials.accountSid, credentials.authToken)

    // Fetch account details is a simple read operation
    const account = await client.api.accounts(credentials.accountSid).fetch()

    // Verify phone number format
    if (
      !credentials.phoneNumber.startsWith('+') &&
      !credentials.phoneNumber.match(/^\d{10,}$/)
    ) {
      return {
        success: false,
        error: 'Phone number should be in E.164 format (e.g., +1234567890)',
      }
    }

    return {
      success: true,
      details: `Account: ${account.friendlyName} (${account.status})`,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    // Check for common Twilio error types
    if (message.includes('20003') || message.includes('authenticate')) {
      return {
        success: false,
        error: 'Invalid Account SID or Auth Token',
      }
    }

    return { success: false, error: message }
  }
}

/**
 * Test OpenAI API credentials
 * Uses models list endpoint (minimal, read-only)
 */
export async function testOpenAIConnection(
  credentials: OpenAICredentials
): Promise<TestResult> {
  try {
    const openai = new OpenAI({
      apiKey: credentials.apiKey,
    })

    // List models is a simple read operation
    const models = await openai.models.list()

    // Check if we got any models back
    const modelCount = models.data.length
    return {
      success: true,
      details: `Access verified (${modelCount} models available)`,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    // Check for common OpenAI error types
    if (message.includes('401') || message.includes('Incorrect API key')) {
      return { success: false, error: 'Invalid API key' }
    }
    if (message.includes('429')) {
      return { success: false, error: 'Rate limit exceeded - try again later' }
    }
    if (message.includes('insufficient_quota')) {
      return { success: false, error: 'API key has no remaining quota' }
    }

    return { success: false, error: message }
  }
}

/**
 * Test any service connection
 */
export async function testServiceConnection(
  serviceId: 'resend' | 'stripe' | 'twilio' | 'openai',
  credentials: Record<string, string>
): Promise<TestResult> {
  switch (serviceId) {
    case 'resend':
      if (!credentials.apiKey) {
        return { success: false, error: 'API key is required' }
      }
      return testResendConnection({ apiKey: credentials.apiKey })

    case 'stripe':
      if (!credentials.secretKey) {
        return { success: false, error: 'Secret key is required' }
      }
      return testStripeConnection({
        secretKey: credentials.secretKey,
        publishableKey: credentials.publishableKey,
        webhookSecret: credentials.webhookSecret,
      })

    case 'twilio':
      if (!credentials.accountSid || !credentials.authToken || !credentials.phoneNumber) {
        return {
          success: false,
          error: 'Account SID, Auth Token, and Phone Number are all required',
        }
      }
      return testTwilioConnection({
        accountSid: credentials.accountSid,
        authToken: credentials.authToken,
        phoneNumber: credentials.phoneNumber,
      })

    case 'openai':
      if (!credentials.apiKey) {
        return { success: false, error: 'API key is required' }
      }
      return testOpenAIConnection({ apiKey: credentials.apiKey })

    default:
      return { success: false, error: `Unknown service: ${serviceId}` }
  }
}

/**
 * Get required fields for each service
 */
export function getServiceFields(
  serviceId: 'resend' | 'stripe' | 'twilio' | 'openai'
): Array<{
  key: string
  label: string
  required: boolean
  placeholder: string
  sensitive: boolean
}> {
  switch (serviceId) {
    case 'resend':
      return [
        {
          key: 'apiKey',
          label: 'API Key',
          required: true,
          placeholder: 're_xxxxxxxxxx',
          sensitive: true,
        },
      ]

    case 'stripe':
      return [
        {
          key: 'secretKey',
          label: 'Secret Key',
          required: true,
          placeholder: 'sk_live_xxxxxxxxxx',
          sensitive: true,
        },
        {
          key: 'publishableKey',
          label: 'Publishable Key',
          required: false,
          placeholder: 'pk_live_xxxxxxxxxx',
          sensitive: false,
        },
        {
          key: 'webhookSecret',
          label: 'Webhook Secret',
          required: false,
          placeholder: 'whsec_xxxxxxxxxx',
          sensitive: true,
        },
      ]

    case 'twilio':
      return [
        {
          key: 'accountSid',
          label: 'Account SID',
          required: true,
          placeholder: 'ACxxxxxxxxxx',
          sensitive: false,
        },
        {
          key: 'authToken',
          label: 'Auth Token',
          required: true,
          placeholder: 'xxxxxxxxxx',
          sensitive: true,
        },
        {
          key: 'phoneNumber',
          label: 'Phone Number',
          required: true,
          placeholder: '+1234567890',
          sensitive: false,
        },
      ]

    case 'openai':
      return [
        {
          key: 'apiKey',
          label: 'API Key',
          required: true,
          placeholder: 'sk-xxxxxxxxxx',
          sensitive: true,
        },
      ]

    default:
      return []
  }
}
