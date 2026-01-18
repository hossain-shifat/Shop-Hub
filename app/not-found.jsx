'use client'

import { Home, ArrowLeft, Search, Package } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NotFound() {
    const router = useRouter()

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-base-100 via-base-200 to-base-100 px-4">
            <div className="max-w-2xl w-full text-center">
                {/* Animated 404 */}
                <div className="mb-8">
                    <h1 className="text-9xl md:text-[12rem] font-black bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-pulse">
                        404
                    </h1>
                </div>

                {/* Icon */}
                <div className="mb-8 flex justify-center">
                    <div className="w-32 h-32 rounded-full bg-linear-to-br from-error/20 to-warning/20 flex items-center justify-center animate-bounce">
                        <Package className="w-16 h-16 text-error" />
                    </div>
                </div>

                {/* Message */}
                <h2 className="text-4xl md:text-5xl font-bold text-base-content mb-4">
                    Page Not Found
                </h2>
                <p className="text-xl text-base-content/70 mb-8 max-w-md mx-auto">
                    Oops! The page you&apos;re looking for seems to have wandered off. Let&apos;s get you back on track.
                </p>

                {/* Search Suggestion */}
                <div className="mb-8 p-6 bg-base-200 rounded-2xl border border-base-300 max-w-md mx-auto">
                    <div className="flex items-center gap-3 mb-3">
                        <Search className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-lg">Looking for something?</h3>
                    </div>
                    <p className="text-base-content/70 text-sm mb-4">
                        Try searching our products or visit our homepage
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => router.back()}
                        className="btn btn-lg btn-outline gap-2 hover:scale-105 transition-transform"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </button>

                    <Link
                        href="/"
                        className="btn btn-lg btn-primary gap-2 hover:scale-105 transition-transform"
                    >
                        <Home className="w-5 h-5" />
                        Back to Home
                    </Link>

                    <Link
                        href="/products"
                        className="btn btn-lg btn-secondary gap-2 hover:scale-105 transition-transform"
                    >
                        <Package className="w-5 h-5" />
                        Browse Products
                    </Link>
                </div>

                {/* Popular Links */}
                <div className="mt-12 pt-8 border-t border-base-300">
                    <h3 className="text-sm font-semibold text-base-content/60 mb-4">POPULAR PAGES</h3>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/products" className="link link-hover text-base-content/70">
                            Products
                        </Link>
                        <Link href="/about" className="link link-hover text-base-content/70">
                            About Us
                        </Link>
                        <Link href="/contact" className="link link-hover text-base-content/70">
                            Contact
                        </Link>
                        <Link href="/help" className="link link-hover text-base-content/70">
                            Help Center
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
