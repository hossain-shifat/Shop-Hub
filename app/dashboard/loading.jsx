'use client'

import { Loader2, Package } from 'lucide-react'

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-100 via-base-200 to-base-100">
            <div className="text-center">
                {/* Animated Logo */}
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl animate-pulse">
                            <Package className="w-12 h-12 text-white" />
                        </div>
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-secondary opacity-50 blur-xl animate-pulse"></div>
                    </div>
                </div>

                {/* Loading Spinner */}
                <div className="mb-6">
                    <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
                </div>

                {/* Text */}
                <h2 className="text-2xl font-bold text-base-content mb-2">
                    Loading...
                </h2>
                <p className="text-base-content/70">
                    Please wait while we prepare your content
                </p>

                {/* Progress Bar */}
                <div className="mt-8 max-w-xs mx-auto">
                    <div className="h-2 bg-base-300 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full animate-loading-bar"></div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes loading-bar {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
      `}</style>
        </div>
    )
}
