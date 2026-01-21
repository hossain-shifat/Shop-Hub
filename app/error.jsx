'use client'

import { useEffect } from 'react'
import { Home, RefreshCcw, AlertCircle, Bug } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({ error, reset }) {
    useEffect(() => {
        // Log error to error reporting service
        console.error('Global Error:', error)
    }, [error])

    return (
        <div>
            <div>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-100 via-base-200 to-base-100 px-4">
                    <div className="max-w-2xl w-full text-center">
                        {/* Icon */}
                        <div className="mb-8 flex justify-center">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-error/20 to-warning/20 flex items-center justify-center">
                                <Bug className="w-16 h-16 text-error animate-pulse" />
                            </div>
                        </div>

                        {/* Message */}
                        <h1 className="text-5xl md:text-6xl font-bold text-base-content mb-4">
                            Something Went Wrong
                        </h1>
                        <p className="text-xl text-base-content/70 mb-8 max-w-md mx-auto">
                            We encountered an unexpected error. Don't worry, we're on it!
                        </p>

                        {/* Error Details (Development Only) */}
                        {process.env.NODE_ENV === 'development' && error && (
                            <div className="mb-8 p-6 bg-error/10 rounded-2xl border-2 border-error/20 max-w-2xl mx-auto text-left">
                                <div className="flex items-center gap-3 mb-3">
                                    <AlertCircle className="w-5 h-5 text-error" />
                                    <h3 className="font-semibold text-lg text-error">Error Details</h3>
                                </div>
                                <pre className="text-sm text-base-content/70 overflow-x-auto">
                                    {error.message}
                                </pre>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={reset}
                                className="btn btn-lg btn-primary gap-2 hover:scale-105 transition-transform"
                            >
                                <RefreshCcw className="w-5 h-5" />
                                Try Again
                            </button>

                            <Link
                                href="/"
                                className="btn btn-lg btn-outline gap-2 hover:scale-105 transition-transform"
                            >
                                <Home className="w-5 h-5" />
                                Back to Home
                            </Link>
                        </div>

                        {/* Help Text */}
                        <div className="mt-12 pt-8 border-t border-base-300">
                            <p className="text-sm text-base-content/60">
                                If this problem persists, please{' '}
                                <Link href="/contact" className="link link-primary">
                                    contact support
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
