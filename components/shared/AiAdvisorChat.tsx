'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Sparkles,
  Send,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import type { AdvisorTopic } from '@/lib/ai/provider'

interface SuggestedAction {
  label: string
  href?: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  suggestedActions?: SuggestedAction[]
}

interface AiAdvisorChatProps {
  topic: AdvisorTopic
  leadId?: string
  suggestedQuestions?: string[]
  compact?: boolean
  className?: string
}

export function AiAdvisorChat({
  topic,
  leadId,
  suggestedQuestions = [],
  compact = false,
  className,
}: AiAdvisorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(!compact)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (cooldownSeconds <= 0) return
    const timer = setTimeout(() => setCooldownSeconds((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldownSeconds])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading || cooldownSeconds > 0) return

    const userMessage: ChatMessage = { role: 'user', content: content.trim() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/customer/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          leadId,
        }),
      })

      if (response.status === 429) {
        const data = await response.json()
        setCooldownSeconds(data.retryAfter || 60)
        setError('Too many requests. Please wait a moment.')
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        suggestedActions: data.suggestedActions,
      }
      setMessages([...updatedMessages, assistantMessage])
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const topicLabel = topic === 'financing' ? 'Financing' : topic === 'insurance' ? 'Insurance' : 'Programs'

  if (compact && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={cn(
          'w-full flex items-center gap-3 rounded-xl border border-[#c9a25c]/20 bg-gradient-to-r from-[#1a1f2e] to-[#161a23] p-4 text-left transition-all hover:border-[#c9a25c]/40',
          className
        )}
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#c9a25c]/20 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-[#c9a25c]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-100">AI {topicLabel} Advisor</p>
          <p className="text-sm text-slate-400 truncate">
            Ask questions about your {topic} options
          </p>
        </div>
        <ChevronDown className="h-5 w-5 text-slate-500 flex-shrink-0" />
      </button>
    )
  }

  return (
    <Card className={cn('border-[#c9a25c]/20 bg-[#1a1f2e]', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#c9a25c]/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-[#c9a25c]" />
            </div>
            <CardTitle className="text-base text-slate-100">
              AI {topicLabel} Advisor
            </CardTitle>
          </div>
          {compact && (
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-500 hover:text-slate-300 p-1"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Messages */}
        {messages.length > 0 && (
          <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-lg p-3 text-sm',
                  msg.role === 'user'
                    ? 'bg-[#c9a25c]/10 text-slate-200 ml-8'
                    : 'bg-slate-800 text-slate-300 mr-4'
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {msg.suggestedActions.map((action, j) => (
                      action.href ? (
                        <a
                          key={j}
                          href={action.href}
                          className="inline-flex items-center gap-1 text-xs text-[#c9a25c] hover:text-[#b5893a] bg-[#c9a25c]/10 rounded-full px-3 py-1"
                        >
                          {action.label}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span
                          key={j}
                          className="inline-flex items-center text-xs text-[#c9a25c] bg-[#c9a25c]/10 rounded-full px-3 py-1"
                        >
                          {action.label}
                        </span>
                      )
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-slate-400 mr-4 bg-slate-800 rounded-lg p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Suggested Questions */}
        {messages.length === 0 && suggestedQuestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(question)}
                  disabled={isLoading}
                  className="text-left text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-lg p-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
            {cooldownSeconds > 0 && (
              <span className="ml-auto text-xs">({cooldownSeconds}s)</span>
            )}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${topic}...`}
            disabled={isLoading || cooldownSeconds > 0}
            className="flex-1 h-10 px-3 rounded-lg border border-slate-700 bg-[#0c0f14] text-sm text-slate-200 placeholder:text-slate-500 focus:border-[#c9a25c] focus:outline-none focus:ring-1 focus:ring-[#c9a25c]/30 disabled:opacity-50"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!input.trim() || isLoading || cooldownSeconds > 0}
            className="bg-[#c9a25c] hover:bg-[#b5893a] text-[#0c0f14] border-0 h-10 px-3"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        <p className="text-[10px] text-slate-600 text-center">
          AI advisor provides general guidance, not professional financial or legal advice.
        </p>
      </CardContent>
    </Card>
  )
}
