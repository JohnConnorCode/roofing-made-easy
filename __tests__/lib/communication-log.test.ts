/**
 * Tests for communication logging payload construction
 */

import { describe, it, expect } from 'vitest'

// --- Extracted from log-direct-send.ts ---

interface LogCommunicationParams {
  channel: 'email' | 'sms'
  to: string
  subject?: string
  body?: string
  leadId?: string
  customerId?: string
  category: string
  status?: 'sent' | 'failed'
  errorMessage?: string
}

function buildLogPayload(params: LogCommunicationParams) {
  return {
    lead_id: params.leadId || null,
    customer_id: params.customerId || null,
    channel: params.channel,
    direction: 'outbound' as const,
    recipient_email: params.channel === 'email' ? params.to : null,
    recipient_phone: params.channel === 'sms' ? params.to : null,
    subject: params.subject || null,
    body: params.body || null,
    status: params.status || 'sent',
    metadata: {
      category: params.category,
      ...(params.errorMessage ? { error: params.errorMessage } : {}),
    },
  }
}

// --- Tests ---

describe('Communication Logging', () => {
  describe('Email Payload', () => {
    it('should set recipient_email for email channel', () => {
      const payload = buildLogPayload({
        channel: 'email',
        to: 'user@example.com',
        subject: 'Welcome',
        category: 'welcome_email',
      })
      expect(payload.recipient_email).toBe('user@example.com')
      expect(payload.recipient_phone).toBeNull()
      expect(payload.channel).toBe('email')
    })

    it('should set direction to outbound', () => {
      const payload = buildLogPayload({
        channel: 'email',
        to: 'user@example.com',
        category: 'test',
      })
      expect(payload.direction).toBe('outbound')
    })
  })

  describe('SMS Payload', () => {
    it('should set recipient_phone for sms channel', () => {
      const payload = buildLogPayload({
        channel: 'sms',
        to: '+15551234567',
        category: 'payment_received',
      })
      expect(payload.recipient_phone).toBe('+15551234567')
      expect(payload.recipient_email).toBeNull()
      expect(payload.channel).toBe('sms')
    })
  })

  describe('Default Values', () => {
    it('should default status to sent', () => {
      const payload = buildLogPayload({
        channel: 'email',
        to: 'test@test.com',
        category: 'test',
      })
      expect(payload.status).toBe('sent')
    })

    it('should default lead_id and customer_id to null', () => {
      const payload = buildLogPayload({
        channel: 'email',
        to: 'test@test.com',
        category: 'test',
      })
      expect(payload.lead_id).toBeNull()
      expect(payload.customer_id).toBeNull()
    })

    it('should default subject and body to null', () => {
      const payload = buildLogPayload({
        channel: 'sms',
        to: '+1555',
        category: 'test',
      })
      expect(payload.subject).toBeNull()
      expect(payload.body).toBeNull()
    })
  })

  describe('With All Fields', () => {
    it('should populate all fields when provided', () => {
      const payload = buildLogPayload({
        channel: 'email',
        to: 'customer@example.com',
        subject: 'Payment Received',
        body: 'Thank you for your payment of $500',
        leadId: 'lead-123',
        customerId: 'cust-456',
        category: 'payment_received',
        status: 'sent',
      })
      expect(payload.lead_id).toBe('lead-123')
      expect(payload.customer_id).toBe('cust-456')
      expect(payload.subject).toBe('Payment Received')
      expect(payload.body).toBe('Thank you for your payment of $500')
      expect(payload.metadata.category).toBe('payment_received')
    })
  })

  describe('Error Metadata', () => {
    it('should include error in metadata when failed', () => {
      const payload = buildLogPayload({
        channel: 'email',
        to: 'bad@example.com',
        category: 'welcome_email',
        status: 'failed',
        errorMessage: 'Mailbox not found',
      })
      expect(payload.status).toBe('failed')
      expect(payload.metadata).toEqual({
        category: 'welcome_email',
        error: 'Mailbox not found',
      })
    })

    it('should omit error key when no errorMessage', () => {
      const payload = buildLogPayload({
        channel: 'email',
        to: 'good@example.com',
        category: 'test',
      })
      expect(payload.metadata).toEqual({ category: 'test' })
      expect('error' in payload.metadata).toBe(false)
    })
  })
})
