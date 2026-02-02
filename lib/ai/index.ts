/**
 * AI Provider Manager
 * Handles provider selection, fallback, and mock mode
 */

import { OpenAIProvider } from './providers/openai'
import { AnthropicProvider } from './providers/anthropic'
import { FallbackProvider } from './providers/fallback'
import {
  withFallback,
  type AiProvider,
  type PhotoAnalysisInput,
  type PhotoAnalysisResult,
  type ExplanationInput,
  type IntakeAnalysisInput,
  type IntakeAnalysisResult,
  type InternalNotesInput,
  type AiResult,
} from './provider'
import { shouldUseMockAi, mockAiProvider } from '@/lib/mocks/ai'

// Singleton instances
let openaiProvider: OpenAIProvider | null = null
let anthropicProvider: AnthropicProvider | null = null
const fallbackProvider = new FallbackProvider()

function getOpenAIProvider(): OpenAIProvider | null {
  if (!process.env.OPENAI_API_KEY) return null
  if (!openaiProvider) {
    openaiProvider = new OpenAIProvider()
  }
  return openaiProvider
}

function getAnthropicProvider(): AnthropicProvider | null {
  if (!process.env.ANTHROPIC_API_KEY) return null
  if (!anthropicProvider) {
    anthropicProvider = new AnthropicProvider()
  }
  return anthropicProvider
}

function getProviders(): AiProvider[] {
  // In mock mode, only use mock provider
  if (shouldUseMockAi()) {
    return [mockAiProvider as AiProvider]
  }

  const providers: AiProvider[] = []

  // Primary: OpenAI GPT-4o
  const openai = getOpenAIProvider()
  if (openai) providers.push(openai)

  // Fallback: Anthropic Claude
  const anthropic = getAnthropicProvider()
  if (anthropic) providers.push(anthropic)

  // Ultimate fallback: rule-based
  providers.push(fallbackProvider)

  return providers
}

/**
 * Check if we're using mock AI
 */
export function isMockAiMode(): boolean {
  return shouldUseMockAi()
}

/**
 * Analyze a photo for roof-related content
 */
export async function analyzePhoto(
  input: PhotoAnalysisInput
): Promise<AiResult<PhotoAnalysisResult>> {
  const providers = getProviders()
  return withFallback(providers, (provider) => provider.analyzePhoto(input))
}

/**
 * Generate a customer-facing explanation of an estimate
 */
export async function generateExplanation(
  input: ExplanationInput
): Promise<AiResult<string>> {
  const providers = getProviders()
  return withFallback(providers, (provider) => provider.generateExplanation(input))
}

/**
 * Analyze intake data for lead scoring and insights
 */
export async function analyzeIntake(
  input: IntakeAnalysisInput
): Promise<AiResult<IntakeAnalysisResult>> {
  const providers = getProviders()
  return withFallback(providers, (provider) => provider.analyzeIntake(input))
}

/**
 * Generate internal notes for sales team
 */
export async function generateInternalNotes(
  input: InternalNotesInput
): Promise<AiResult<string>> {
  const providers = getProviders()
  return withFallback(providers, (provider) => provider.generateInternalNotes(input))
}

// Photo measurement analysis
export {
  analyzePhotoForMeasurements,
  analyzeMultiplePhotos,
  type PhotoMeasurementInput,
  type PhotoMeasurementResult,
  type DetectedRoofPlane,
  type DetectedFeature,
} from './photo-measurements'

// Line item suggestions
export {
  suggestLineItems,
  checkForMissingItems,
  type LineItemSuggestionInput,
  type LineItemSuggestionResult,
  type LineItemRecommendation,
  type MacroRecommendation,
} from './line-item-suggestions'

export {
  type PhotoAnalysisResult,
  type PhotoAnalysisInput,
  type ExplanationInput,
  type IntakeAnalysisInput,
  type IntakeAnalysisResult,
  type InternalNotesInput,
  type AiResult,
}
