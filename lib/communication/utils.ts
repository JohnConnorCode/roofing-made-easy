/**
 * Shared utilities for communication/template features
 */

/**
 * Extract {{variable}} placeholders from a template string.
 * Returns array of variable names (without the braces).
 */
export function extractVariables(template: string): string[] {
  const matches = template.match(/\{\{([^}]+)\}\}/g) || []
  return matches.map(m => m.replace(/\{\{|\}\}/g, '').trim())
}

/**
 * Extract and deduplicate variables from body and optional subject.
 */
export function extractAllVariables(body: string, subject?: string | null): string[] {
  const vars = extractVariables(body)
  if (subject) {
    vars.push(...extractVariables(subject))
  }
  return [...new Set(vars)]
}
