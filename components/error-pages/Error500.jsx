'use client'

import { Home, RefreshCcw, AlertTriangle, Mail } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Error500() {
    const router = useRouter()

    const handleRefresh = () => {
        window.location.reload()
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-100 via-base-200 to-base-100 px-4">
            <div className="max-w-2xl w-full text-center">
                {/* Animated 500 */}
                <div className="mb-8">
                    <h1 className="text-9xl md:text-[12rem] font-black bg-gradient-to-r from-error via-warning to-error bg-clip-text text-transparent animate-pulse">
                        500
                    </h1>
                </div>

                {/* Icon */}
                <div className="mb-8 flex justify-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-error/20 to-warning/20 flex items-center justify-center">
                        <AlertTriangle className="w-16 h-16 text-error animate-bounce" />
                    </div>
                </div>

                {/* Message */}
                <h2 className="text-4xl md:text-5xl font-bold text-base-content mb-4">
                    Server Error
                </h2>
                <p className="text-xl text-base-content/70 mb-8 max-w-md mx-auto">
                    Something went wrong on our end. We're working to fix it. Please try again later.
                </p>

                {/* Error Details */}
                <div className="mb-8 p-6 bg-error/10 rounded-2xl border-2 border-error/20 max-w-md mx-auto">
                    <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="w-5 h-5 text-error" />
                        <h3 className="font-semibold text-lg text-error">What happened?</h3>
                    </div>
                    <p className="text-base-content/70 text-sm">
                        Our servers encountered an unexpected error. Our team has been notified and is working on a fix.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <button
                        onClick={handleRefresh}
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

                {/* Contact Support */}
                <div className="mt-8 p-6 bg-base-200 rounded-2xl border border-base-300 max-w-md mx-auto">
                    <div className="flex items-center gap-3 mb-3">
                        <Mail className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-lg">Need Help?</h3>
                    </div>
                    <p className="text-base-content/70 text-sm mb-4">
                        If this problem persists, please contact our support team
                    </p>
                    <Link
                        href="/contact"
                        className="btn btn-sm btn-primary"
                    >
                        Contact Support
                    </Link>
                </div>

                {/* Status Indicator */}
                <div className="mt-12 pt-8 border-t border-base-300">
                    <p className="text-sm text-base-content/60">
                        Error Code: 500 | Internal Server Error
                    </p>
                </div>
            </div>
        </div>
    )
}
