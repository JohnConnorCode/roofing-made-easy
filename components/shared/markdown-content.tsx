'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import type { ComponentProps } from 'react'

interface MarkdownContentProps {
  content: string
  className?: string
}

type AnchorProps = ComponentProps<'a'>

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2 className="text-3xl font-bold text-slate-100 mt-10 mb-4 leading-tight">{children}</h2>
          ),
          h2: ({ children }) => (
            <h3 className="text-2xl font-bold text-slate-100 mt-8 mb-3 leading-snug">{children}</h3>
          ),
          h3: ({ children }) => (
            <h4 className="text-xl font-semibold text-slate-100 mt-6 mb-2">{children}</h4>
          ),
          h4: ({ children }) => (
            <h5 className="text-lg font-semibold text-slate-200 mt-4 mb-2">{children}</h5>
          ),
          p: ({ children }) => (
            <p className="text-slate-300 leading-relaxed mb-4">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-100">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-300">{children}</em>
          ),
          a: ({ href, children, ...rest }: AnchorProps) => {
            if (href?.startsWith('/')) {
              return (
                <Link
                  href={href}
                  className="text-[#c9a25c] hover:text-[#e6c588] underline underline-offset-2 transition-colors"
                >
                  {children}
                </Link>
              )
            }
            return (
              <a
                href={href}
                className="text-[#c9a25c] hover:text-[#e6c588] underline underline-offset-2 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                {...rest}
              >
                {children}
              </a>
            )
          },
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-5 mb-4 space-y-1.5 text-slate-300">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-5 mb-4 space-y-1.5 text-slate-300">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-slate-300 leading-relaxed pl-1">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[#c9a25c]/50 pl-4 my-4 italic text-slate-400">
              {children}
            </blockquote>
          ),
          code: ({ children, className: codeClass }) => {
            const isBlock = codeClass?.includes('language-')
            if (isBlock) {
              return (
                <pre className="bg-[#0c0f14] border border-slate-700 rounded-lg p-4 my-4 overflow-x-auto">
                  <code className="text-sm text-slate-300 font-mono">{children}</code>
                </pre>
              )
            }
            return (
              <code className="bg-[#1a1f2e] text-[#c9a25c] px-1.5 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            )
          },
          hr: () => <hr className="border-slate-700 my-8" />,
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="w-full text-sm text-slate-300 border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#1a1f2e] text-slate-100">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-800">{children}</tbody>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left font-semibold border border-slate-700">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 border border-slate-800">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
