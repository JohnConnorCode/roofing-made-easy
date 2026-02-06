'use client'

import { Fragment } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tag, Shield, CheckCircle } from 'lucide-react'
import { TEMPLATE_VARIABLE_DEFINITIONS } from '@/lib/communication/types'

// Derived from the canonical variable list - used by TemplateFormModal for quick-insert buttons
const AVAILABLE_VARIABLES = TEMPLATE_VARIABLE_DEFINITIONS.map(v => ({
  variable: `{{${v.variable}}}`,
  description: v.description,
}))

export { AVAILABLE_VARIABLES }

export function VariablesReference() {
  // Group by category for display
  const categories = [...new Set(TEMPLATE_VARIABLE_DEFINITIONS.map(v => v.category))]

  return (
    <div className="space-y-6">
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <Tag className="h-5 w-5 text-blue-500" />
            Template Variables Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">
            Use these variables in your email and SMS templates. They will be replaced with actual
            values when messages are sent.
          </p>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Variable
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Example
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {categories.map(category => (
                  <Fragment key={category}>
                    <tr className="bg-slate-50/50">
                      <td colSpan={3} className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">
                        {category}
                      </td>
                    </tr>
                    {TEMPLATE_VARIABLE_DEFINITIONS
                      .filter(v => v.category === category)
                      .map(({ variable, description, example }) => (
                        <tr key={variable} className="hover:bg-slate-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <code className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-700">
                              {`{{${variable}}}`}
                            </code>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {description}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-400 italic">
                            {example}
                          </td>
                        </tr>
                      ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            Usage Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              Variables are case-sensitive. Use exactly as shown above.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              If a variable has no value, it will be replaced with an empty string.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              For SMS, keep messages under 160 characters (including expanded variables) for a single segment.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              For emails, you can use HTML. Use inline styles for maximum compatibility.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
