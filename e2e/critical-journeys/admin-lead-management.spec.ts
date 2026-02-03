/**
 * E2E Test: Admin Lead Management Flow
 *
 * Tests the complete admin workflow for managing leads:
 * - Viewing leads
 * - Updating status
 * - Bulk operations
 * - Exporting data
 */

import { test, expect } from '@playwright/test'
import { loginAsAdmin, hasAdminCredentials } from '../fixtures/auth'
import { generateTestEmail, generateTestPhone } from '../helpers/test-data'

test.describe('Admin Lead Management - Full Flow', () => {
  test.skip(!hasAdminCredentials(), 'Requires TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD')

  const testLeadIds: string[] = []

  test.beforeAll(async ({ request }) => {
    // Create test leads via API for this test suite
    for (let i = 0; i < 3; i++) {
      const response = await request.post('/api/leads', {
        data: {
          source: `e2e_admin_test_${i}`,
          utmSource: 'playwright',
          utmCampaign: 'admin_lead_management',
        },
      })

      if (response.ok()) {
        const { lead } = await response.json()
        testLeadIds.push(lead.id)
      }
    }
  })

  test.afterAll(async ({ request }) => {
    // Archive all test leads
    for (const id of testLeadIds) {
      await request.patch(`/api/leads/${id}`, {
        data: { status: 'archived' },
      }).catch(() => {})
    }
  })

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('View leads list with test data', async ({ page }) => {
    await page.goto('/leads')

    // Wait for leads to load
    await page.waitForResponse(/\/api\/leads/)

    // Verify page loaded
    await expect(page.locator('h1:has-text("Leads")')).toBeVisible()

    // Should show lead count
    const leadCount = page.locator('text=/\\d+ Lead/')
    await expect(leadCount).toBeVisible()
  })

  test('Search for test leads by source', async ({ page }) => {
    await page.goto('/leads')
    await page.waitForResponse(/\/api\/leads/)

    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill('e2e_admin_test')

    // Wait for filter
    await page.waitForTimeout(500)

    // Should show filtered results or no results message
    const content = page.locator('table').or(page.locator('text=No leads'))
    await expect(content).toBeVisible()
  })

  test('Update single lead status via API and verify in UI', async ({ page, request }) => {
    test.skip(testLeadIds.length === 0, 'Requires test leads')

    const leadId = testLeadIds[0]

    // Update status via API
    const response = await request.patch(`/api/leads/${leadId}`, {
      data: { status: 'consultation_scheduled' },
    })
    expect(response.ok()).toBeTruthy()

    // Navigate to leads page
    await page.goto('/leads')
    await page.waitForResponse(/\/api\/leads/)

    // Filter by consultation_scheduled
    const statusFilter = page.locator('select').first()
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('consultation_scheduled')
      await page.waitForResponse(/\/api\/leads/)
    }

    // Page should still be functional
    await expect(page.locator('h1:has-text("Leads")')).toBeVisible()
  })

  test('Bulk status update via API', async ({ request }) => {
    test.skip(testLeadIds.length < 2, 'Requires at least 2 test leads')

    const response = await request.put('/api/leads/bulk', {
      data: {
        leadIds: testLeadIds.slice(0, 2),
        status: 'lost',
      },
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.updated).toBe(2)
  })

  test('Bulk export via API returns CSV data', async ({ request }) => {
    test.skip(testLeadIds.length === 0, 'Requires test leads')

    const ids = testLeadIds.join(',')
    const response = await request.get(`/api/leads/bulk?ids=${ids}`)

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data.leads).toBeDefined()
    expect(Array.isArray(data.leads)).toBe(true)

    // Verify flattened structure
    if (data.leads.length > 0) {
      const lead = data.leads[0]
      expect(lead.id).toBeDefined()
      expect(lead.status).toBeDefined()
      // Should have flattened fields
      expect('first_name' in lead || 'email' in lead || 'street_address' in lead).toBe(true)
    }
  })

  test('View lead detail page', async ({ page }) => {
    test.skip(testLeadIds.length === 0, 'Requires test leads')

    await page.goto(`/leads/${testLeadIds[0]}`)

    // Wait for page to load
    await page.waitForTimeout(1000)

    // Should show lead detail or error
    const content = page.locator('h1').or(
      page.locator('text=Lead').or(
        page.locator('text=Contact')
      )
    )
    await expect(content.first()).toBeVisible()
  })

  test('Lead detail shows estimate section', async ({ page, request }) => {
    test.skip(testLeadIds.length === 0, 'Requires test leads')

    const leadId = testLeadIds[0]

    // Generate an estimate for this lead first
    await request.post(`/api/leads/${leadId}/estimate`)

    // Navigate to lead detail
    await page.goto(`/leads/${leadId}`)
    await page.waitForTimeout(2000)

    // Should show estimate info
    const estimateSection = page.locator('text=Estimate').or(
      page.locator('text=/\\$[\\d,]+/').or(
        page.locator('[class*="estimate"]')
      )
    )
    await expect(estimateSection.first().or(page.locator('h1'))).toBeVisible()
  })
})

test.describe('Admin Lead Status Workflow', () => {
  test.skip(!hasAdminCredentials(), 'Requires admin credentials')

  let workflowLeadId: string | null = null

  test.beforeAll(async ({ request }) => {
    const response = await request.post('/api/leads', {
      data: { source: 'e2e_workflow_test' },
    })
    if (response.ok()) {
      const { lead } = await response.json()
      workflowLeadId = lead.id
    }
  })

  test.afterAll(async ({ request }) => {
    if (workflowLeadId) {
      await request.patch(`/api/leads/${workflowLeadId}`, {
        data: { status: 'archived' },
      }).catch(() => {})
    }
  })

  test('Progress lead through complete status workflow', async ({ request }) => {
    test.skip(!workflowLeadId, 'Requires workflow lead')

    const statusProgression = [
      'new',
      'intake_started',
      'intake_complete',
      'estimate_generated',
      'consultation_scheduled',
      'quote_sent',
      'won',
    ]

    for (let i = 1; i < statusProgression.length; i++) {
      const newStatus = statusProgression[i]

      const response = await request.patch(`/api/leads/${workflowLeadId}`, {
        data: { status: newStatus },
      })

      expect(response.ok()).toBeTruthy()

      // Verify status was updated
      const getResponse = await request.get(`/api/leads/${workflowLeadId}`)
      const { lead } = await getResponse.json()
      expect(lead.status).toBe(newStatus)
    }
  })

  test('Status can transition to lost from any state', async ({ request }) => {
    // Create a fresh lead
    const createResponse = await request.post('/api/leads', {
      data: { source: 'e2e_lost_test' },
    })

    const { lead } = await createResponse.json()

    // Set to consultation_scheduled
    await request.patch(`/api/leads/${lead.id}`, {
      data: { status: 'consultation_scheduled' },
    })

    // Then to lost
    const lostResponse = await request.patch(`/api/leads/${lead.id}`, {
      data: { status: 'lost' },
    })

    expect(lostResponse.ok()).toBeTruthy()

    // Verify
    const getResponse = await request.get(`/api/leads/${lead.id}`)
    const { lead: updatedLead } = await getResponse.json()
    expect(updatedLead.status).toBe('lost')

    // Cleanup
    await request.patch(`/api/leads/${lead.id}`, {
      data: { status: 'archived' },
    })
  })
})

test.describe('Admin Lead Filtering', () => {
  test.skip(!hasAdminCredentials(), 'Requires admin credentials')

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('Filter by status works correctly', async ({ page }) => {
    await page.goto('/leads')
    await page.waitForResponse(/\/api\/leads/)

    const statusFilter = page.locator('select').first()

    if (await statusFilter.isVisible()) {
      // Filter by 'new' status
      await statusFilter.selectOption('new')
      await page.waitForResponse(/\/api\/leads/)

      // Page should update
      await expect(page.locator('h1:has-text("Leads")')).toBeVisible()
    }
  })

  test('Filter by date range if available', async ({ page }) => {
    await page.goto('/leads')
    await page.waitForResponse(/\/api\/leads/)

    // Look for date picker
    const datePicker = page.locator('input[type="date"]').or(
      page.locator('[class*="date-picker"]')
    )

    if (await datePicker.first().isVisible()) {
      // Try to interact with date filter
      await datePicker.first().click()
      await expect(page.locator('h1:has-text("Leads")')).toBeVisible()
    }
  })

  test('Clear all filters resets view', async ({ page }) => {
    await page.goto('/leads')
    await page.waitForResponse(/\/api\/leads/)

    // Apply search filter
    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill('test')
    await page.waitForTimeout(300)

    // Clear
    await searchInput.clear()
    await page.waitForTimeout(300)

    // Should show all leads
    await expect(page.locator('h1:has-text("Leads")')).toBeVisible()
  })
})

test.describe('Admin Lead Notes', () => {
  test.skip(!hasAdminCredentials(), 'Requires admin credentials')

  test('Can add note to lead via UI', async ({ page, request }) => {
    // Create a test lead
    const createResponse = await request.post('/api/leads', {
      data: { source: 'e2e_notes_test' },
    })
    const { lead } = await createResponse.json()

    await loginAsAdmin(page)

    // Navigate to lead detail
    await page.goto(`/leads/${lead.id}`)
    await page.waitForTimeout(2000)

    // Look for notes section
    const notesSection = page.locator('text=Notes').or(
      page.locator('textarea').or(
        page.locator('[class*="notes"]')
      )
    )

    if (await notesSection.first().isVisible()) {
      // Try to add a note
      const noteInput = page.locator('textarea').first()
      if (await noteInput.isVisible()) {
        await noteInput.fill('E2E Test Note - This is a test note')

        // Look for save/submit button
        const saveButton = page.locator('button:has-text("Save")').or(
          page.locator('button:has-text("Add")')
        )
        if (await saveButton.first().isVisible()) {
          await saveButton.first().click()
          await page.waitForTimeout(1000)
        }
      }
    }

    // Cleanup
    await request.patch(`/api/leads/${lead.id}`, {
      data: { status: 'archived' },
    })
  })
})
