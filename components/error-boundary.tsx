'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Send to Sentry if configured
    Sentry.withScope((scope) => {
      scope.setExtra('componentStack', errorInfo.componentStack)
      scope.setTag('errorBoundary', 'true')
      Sentry.captureException(error)
    })

  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>

            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Something went wrong
            </h1>

            <p className="mb-6 text-gray-600">
              We encountered an unexpected error. Please try again or return to
              the home page.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 text-left">
                <p className="text-sm font-medium text-red-800">
                  {this.state.error.message}
                </p>
                <pre className="mt-2 overflow-auto text-xs text-red-600">
                  {this.state.error.stack}
                </pre>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                variant="primary"
                onClick={this.handleRetry}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                leftIcon={<Home className="h-4 w-4" />}
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook-friendly wrapper for error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }
}
