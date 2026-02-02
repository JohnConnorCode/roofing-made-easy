'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  FileText,
  CheckSquare,
  Video,
  Download,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ExternalLink,
} from 'lucide-react'
import { INSURANCE_RESOURCES, type InsuranceResource } from '@/lib/data/insurance-resources'

interface ResourceLibraryProps {
  category?: InsuranceResource['category']
  limit?: number
}

const TYPE_ICONS: Record<InsuranceResource['type'], typeof FileText> = {
  guide: FileText,
  checklist: CheckSquare,
  template: Download,
  video: Video,
}

const CATEGORY_LABELS: Record<InsuranceResource['category'], string> = {
  filing: 'Filing a Claim',
  documentation: 'Documentation',
  adjuster: 'Adjuster Visit',
  appeal: 'Appeals',
  general: 'General Resources',
}

export function ResourceLibrary({ category, limit }: ResourceLibraryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  let resources = category
    ? INSURANCE_RESOURCES.filter((r) => r.category === category)
    : INSURANCE_RESOURCES

  if (limit && !showAll) {
    resources = resources.slice(0, limit)
  }

  const totalResources = category
    ? INSURANCE_RESOURCES.filter((r) => r.category === category).length
    : INSURANCE_RESOURCES.length

  return (
    <div className="space-y-4">
      {resources.map((resource) => {
        const Icon = TYPE_ICONS[resource.type]
        const isExpanded = expandedId === resource.id

        return (
          <Card
            key={resource.id}
            className={cn(
              'border-slate-700 transition-all',
              isExpanded && 'border-[#c9a25c]/30'
            )}
          >
            <CardHeader
              className="cursor-pointer pb-2"
              onClick={() => setExpandedId(isExpanded ? null : resource.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 shrink-0">
                    <Icon className="h-5 w-5 text-[#c9a25c]" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-slate-100">{resource.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                        {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {CATEGORY_LABELS[resource.category]}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{resource.description}</p>
                  </div>
                </div>
                <div className="shrink-0 ml-4">
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-500" />
                  )}
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0">
                <div className="border-t border-slate-700 pt-4">
                  {resource.type === 'checklist' && Array.isArray(resource.content) ? (
                    <div className="space-y-2">
                      {resource.content.map((item, index) => (
                        <label
                          key={index}
                          className="flex items-start gap-3 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800 text-[#c9a25c] focus:ring-[#c9a25c]/20"
                          />
                          <span className="text-sm text-slate-300 group-hover:text-slate-200">
                            {item}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : resource.type === 'template' ? (
                    <div>
                      <pre className="bg-slate-800 rounded-lg p-4 text-sm text-slate-300 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
                        {resource.content as string}
                      </pre>
                      <div className="mt-4 flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-slate-300 hover:bg-slate-800"
                          onClick={() => {
                            navigator.clipboard.writeText(resource.content as string)
                          }}
                        >
                          Copy to Clipboard
                        </Button>
                      </div>
                    </div>
                  ) : resource.type === 'video' && resource.videoUrl ? (
                    <div>
                      <a
                        href={resource.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[#c9a25c] hover:text-[#d4b06c]"
                      >
                        <Video className="h-5 w-5" />
                        Watch Video
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <div
                        className="text-slate-300 leading-relaxed whitespace-pre-wrap"
                        style={{ fontFamily: 'inherit' }}
                      >
                        {(resource.content as string).split('\n').map((line, i) => {
                          // Handle headers
                          if (line.startsWith('# ')) {
                            return (
                              <h2 key={i} className="text-xl font-semibold text-slate-100 mt-6 mb-3 first:mt-0">
                                {line.replace('# ', '')}
                              </h2>
                            )
                          }
                          if (line.startsWith('## ')) {
                            return (
                              <h3 key={i} className="text-lg font-semibold text-slate-200 mt-5 mb-2">
                                {line.replace('## ', '')}
                              </h3>
                            )
                          }
                          if (line.startsWith('### ')) {
                            return (
                              <h4 key={i} className="text-base font-medium text-slate-200 mt-4 mb-2">
                                {line.replace('### ', '')}
                              </h4>
                            )
                          }
                          // Handle list items
                          if (line.startsWith('- ')) {
                            return (
                              <div key={i} className="flex items-start gap-2 ml-4 my-1">
                                <span className="text-[#c9a25c]">•</span>
                                <span>{line.replace('- ', '')}</span>
                              </div>
                            )
                          }
                          if (line.match(/^\d+\./)) {
                            return (
                              <div key={i} className="flex items-start gap-2 ml-4 my-1">
                                <span className="text-[#c9a25c] font-medium">{line.match(/^\d+/)![0]}.</span>
                                <span>{line.replace(/^\d+\.\s*/, '')}</span>
                              </div>
                            )
                          }
                          // Handle bold text
                          if (line.includes('**')) {
                            const parts = line.split(/\*\*([^*]+)\*\*/)
                            return (
                              <p key={i} className="my-2">
                                {parts.map((part, j) =>
                                  j % 2 === 1 ? (
                                    <strong key={j} className="text-slate-100 font-medium">{part}</strong>
                                  ) : (
                                    part
                                  )
                                )}
                              </p>
                            )
                          }
                          // Regular paragraph
                          if (line.trim()) {
                            return <p key={i} className="my-2">{line}</p>
                          }
                          return <br key={i} />
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}

      {limit && totalResources > limit && (
        <Button
          variant="ghost"
          className="w-full text-slate-400 hover:text-slate-200"
          onClick={() => setShowAll(!showAll)}
          leftIcon={<BookOpen className="h-4 w-4" />}
        >
          {showAll ? 'Show Less' : `View All ${totalResources} Resources`}
        </Button>
      )}
    </div>
  )
}
