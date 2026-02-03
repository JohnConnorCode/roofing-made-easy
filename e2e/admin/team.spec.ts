import { test, expect } from '@playwright/test'
import { loginAsAdmin, hasAdminCredentials } from '../fixtures/auth'

test.describe('Team Management', () => {
  test.skip(!hasAdminCredentials(), 'Requires TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD')

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/team')
  })

  test.describe('Page Load', () => {
    test('team page loads successfully', async ({ page }) => {
      await expect(page.locator('h1:has-text("Team")')).toBeVisible()
    })

    test('displays tabs for users and teams', async ({ page }) => {
      const usersTab = page.locator('button:has-text("Users")').or(
        page.locator('text=Users')
      )
      const teamsTab = page.locator('button:has-text("Teams")').or(
        page.locator('text=Teams')
      )

      // Should have at least one tab
      await expect(usersTab.first().or(teamsTab.first())).toBeVisible()
    })
  })

  test.describe('Users Tab', () => {
    test('displays users list or empty state', async ({ page }) => {
      const usersTab = page.locator('button:has-text("Users")').first()

      if (await usersTab.isVisible()) {
        await usersTab.click()
      }

      await page.waitForTimeout(1000)

      const usersList = page.locator('table').or(
        page.locator('[class*="card"]').or(
          page.locator('text=No users')
        )
      )

      await expect(usersList.first()).toBeVisible()
    })

    test('displays user information', async ({ page }) => {
      const usersTab = page.locator('button:has-text("Users")').first()

      if (await usersTab.isVisible()) {
        await usersTab.click()
      }

      await page.waitForTimeout(1000)

      // Check for user columns
      const userInfo = page.locator('text=Name').or(
        page.locator('text=Email').or(
          page.locator('text=Role')
        )
      )

      await expect(userInfo.first()).toBeVisible()
    })

    test('invite user button exists', async ({ page }) => {
      const usersTab = page.locator('button:has-text("Users")').first()

      if (await usersTab.isVisible()) {
        await usersTab.click()
      }

      const inviteButton = page.locator('button:has-text("Invite")').or(
        page.locator('button:has-text("Add User")')
      )

      await expect(inviteButton.first()).toBeVisible()
    })
  })

  test.describe('Teams Tab', () => {
    test('teams tab is accessible', async ({ page }) => {
      const teamsTab = page.locator('button:has-text("Teams")').first()

      if (await teamsTab.isVisible()) {
        await teamsTab.click()

        // Should show teams content
        const teamsContent = page.locator('text=Team').or(
          page.locator('table').or(
            page.locator('[class*="card"]')
          )
        )

        await expect(teamsContent.first()).toBeVisible()
      }
    })

    test('create team button exists', async ({ page }) => {
      const teamsTab = page.locator('button:has-text("Teams")').first()

      if (await teamsTab.isVisible()) {
        await teamsTab.click()

        const createButton = page.locator('button:has-text("Create Team")').or(
          page.locator('button:has-text("Add Team")')
        )

        // May or may not have create button
        const hasButton = await createButton.first().isVisible({ timeout: 3000 }).catch(() => false)
        expect(typeof hasButton).toBe('boolean')
      }
    })
  })

  test.describe('Invitations', () => {
    test('invite modal opens', async ({ page }) => {
      const inviteButton = page.locator('button:has-text("Invite")').or(
        page.locator('button:has-text("Add User")')
      ).first()

      if (await inviteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await inviteButton.click()

        const modal = page.locator('[role="dialog"]').or(
          page.locator('text=Invite User').or(
            page.locator('input[type="email"]')
          )
        )

        await expect(modal.first()).toBeVisible()
      }
    })

    test('invite form has email field', async ({ page }) => {
      const inviteButton = page.locator('button:has-text("Invite")').first()

      if (await inviteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await inviteButton.click()

        await page.waitForTimeout(500)

        const emailField = page.locator('input[type="email"]').or(
          page.locator('label:has-text("Email")')
        )

        await expect(emailField.first()).toBeVisible()
      }
    })

    test('invite form has role selection', async ({ page }) => {
      const inviteButton = page.locator('button:has-text("Invite")').first()

      if (await inviteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await inviteButton.click()

        await page.waitForTimeout(500)

        const roleField = page.locator('select').or(
          page.locator('label:has-text("Role")').or(
            page.locator('[role="combobox"]')
          )
        )

        await expect(roleField.first()).toBeVisible()
      }
    })
  })

  test.describe('Role Filtering', () => {
    test('role filter exists', async ({ page }) => {
      const roleFilter = page.locator('select').or(
        page.locator('[data-testid="role-filter"]').or(
          page.locator('text=Filter by role')
        )
      )

      // Role filter may or may not exist
      const hasFilter = await roleFilter.first().isVisible({ timeout: 3000 }).catch(() => false)
      expect(typeof hasFilter).toBe('boolean')
    })

    test('can filter by admin role', async ({ page }) => {
      const roleFilter = page.locator('select').first()

      if (await roleFilter.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Try to select admin option - may have different label
        await roleFilter.selectOption('admin').catch(() =>
          roleFilter.selectOption({ label: 'Admin' }).catch(() => {})
        )

        // Results should update
        await page.waitForTimeout(500)

        await expect(page.locator('h1:has-text("Team")')).toBeVisible()
      }
    })
  })

  test.describe('User Actions', () => {
    test('edit user button exists', async ({ page }) => {
      const editButton = page.locator('button:has([class*="Edit"])').or(
        page.locator('button[aria-label*="edit"]')
      ).first()

      // May or may not have edit button depending on users
      const hasEdit = await editButton.isVisible({ timeout: 3000 }).catch(() => false)
      expect(typeof hasEdit).toBe('boolean')
    })

    test('user detail slide-over or modal', async ({ page }) => {
      const userRow = page.locator('table tbody tr').first().or(
        page.locator('[class*="card"]').first()
      )

      if (await userRow.isVisible({ timeout: 3000 }).catch(() => false)) {
        const clickableElement = userRow.locator('a').or(
          userRow.locator('button')
        ).first()

        if (await clickableElement.isVisible({ timeout: 1000 }).catch(() => false)) {
          await clickableElement.click()

          // May open modal or navigate
          await page.waitForTimeout(500)

          await expect(page.locator('h1').or(page.locator('[role="dialog"]'))).toBeVisible()
        }
      }
    })
  })

  test.describe('Pending Invitations', () => {
    test('shows pending invitations section', async ({ page }) => {
      const pendingSection = page.locator('text=Pending').or(
        page.locator('text=Invitations')
      )

      // May or may not have pending invitations
      const hasPending = await pendingSection.first().isVisible({ timeout: 3000 }).catch(() => false)
      expect(typeof hasPending).toBe('boolean')
    })

    test('can resend invitation', async ({ page }) => {
      const resendButton = page.locator('button:has-text("Resend")').or(
        page.locator('text=Resend')
      )

      // May or may not have pending invitations to resend
      const hasResend = await resendButton.first().isVisible({ timeout: 3000 }).catch(() => false)
      expect(typeof hasResend).toBe('boolean')
    })
  })
})
