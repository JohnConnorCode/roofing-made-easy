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
  type FinancingGuidanceInput,
  type FinancingGuidanceResult,
  type InsuranceLetterInput,
  type EligibilityGuidanceInput,
  type EligibilityGuidanceResult,
  type AdvisorInput,
  type AdvisorResult,
} from './provider'
import { shouldUseMockAi, mockAiProvider } from '@/lib/mocks/ai'
import { getOpenAICredentials } from '@/lib/credentials/loader'

// Singleton instances (keyed by API key to handle credential changes)
let openaiProvider: OpenAIProvider | null = null
let openaiApiKey: string | null = null
let anthropicProvider: AnthropicProvider | null = null
const fallbackProvider = new FallbackProvider()

async function getOpenAIProviderAsync(): Promise<OpenAIProvider | null> {
  const { credentials } = await getOpenAICredentials()
  if (!credentials) return null

  // Create new provider if API key changed or not initialized
  if (!openaiProvider || openaiApiKey !== credentials.apiKey) {
    openaiProvider = new OpenAIProvider(credentials.apiKey)
    openaiApiKey = credentials.apiKey
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

async function getProvidersAsync(): Promise<AiProvider[]> {
  // In mock mode, only use mock provider
  if (shouldUseMockAi()) {
    return [mockAiProvider as AiProvider]
  }

  const providers: AiProvider[] = []

  // Primary: OpenAI GPT-4o
  const openai = await getOpenAIProviderAsync()
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
 * Check if OpenAI is configured (async, checks DB too)
 */
export async function isOpenAIConfiguredAsync(): Promise<boolean> {
  const { credentials } = await getOpenAICredentials()
  return credentials !== null
}

/**
 * Analyze a photo for roof-related content
 */
export async function analyzePhoto(
  input: PhotoAnalysisInput
): Promise<AiResult<PhotoAnalysisResult>> {
  const providers = await getProvidersAsync()
  return withFallback(providers, (provider) => provider.analyzePhoto(input))
}

/**
 * Generate a customer-facing explanation of an estimate
 */
export async function generateExplanation(
  input: ExplanationInput
): Promise<AiResult<string>> {
  const providers = await getProvidersAsync()
  return withFallback(providers, (provider) => provider.generateExplanation(input))
}

/**
 * Analyze intake data for lead scoring and insights
 */
export async function analyzeIntake(
  input: IntakeAnalysisInput
): Promise<AiResult<IntakeAnalysisResult>> {
  const providers = await getProvidersAsync()
  return withFallback(providers, (provider) => provider.analyzeIntake(input))
}

/**
 * Generate internal notes for sales team
 */
export async function generateInternalNotes(
  input: InternalNotesInput
): Promise<AiResult<string>> {
  const providers = await getProvidersAsync()
  return withFallback(providers, (provider) => provider.generateInternalNotes(input))
}

/**
 * Generate AI-powered financing guidance with payment scenarios
 */
export async function generateFinancingGuidance(
  input: FinancingGuidanceInput
): Promise<AiResult<FinancingGuidanceResult>> {
  const providers = await getProvidersAsync()
  return withFallback(providers, (provider) => provider.generateFinancingGuidance(input))
}

/**
 * Generate a professional insurance claim or appeal letter
 */
export async function generateInsuranceLetter(
  input: InsuranceLetterInput
): Promise<AiResult<string>> {
  const providers = await getProvidersAsync()
  return withFallback(providers, (provider) => provider.generateInsuranceLetter(input))
}

/**
 * Generate personalized eligibility guidance for assistance programs
 */
export async function generateEligibilityGuidance(
  input: EligibilityGuidanceInput
): Promise<AiResult<EligibilityGuidanceResult>> {
  const providers = await getProvidersAsync()
  return withFallback(providers, (provider) => provider.generateEligibilityGuidance(input))
}

/**
 * Generate an AI advisor response for multi-turn chat
 */
export async function generateAdvisorResponse(
  input: AdvisorInput
): Promise<AiResult<AdvisorResult>> {
  const providers = await getProvidersAsync()
  return withFallback(providers, (provider) => provider.generateAdvisorResponse(input))
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
  type FinancingGuidanceInput,
  type FinancingGuidanceResult,
  type InsuranceLetterInput,
  type EligibilityGuidanceInput,
  type EligibilityGuidanceResult,
  type AdvisorInput,
  type AdvisorResult,
}
