'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Send } from 'lucide-react'
import { resetPassword } from '@/lib/firebase/auth'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            toast.loading('Sending reset link...')
            const { error } = await resetPassword(email)

            toast.dismiss()

            if (error) {
                toast.error(error)
            } else {
                setEmailSent(true)
                toast.success('Password reset link sent! Check your email.')
            }
        } catch (error) {
            console.error('Password reset error:', error)
            toast.error('Failed to send reset link. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center section-padding bg-base-200 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md mx-auto relative z-10"
            >
                <div className="card bg-base-100 shadow-2xl">
                    {!emailSent ? (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
                                    🔑
                                </div>
                                <h2 className="text-3xl font-bold text-base-content mb-2">
                                    Forgot Password?
                                </h2>
                                <p className="text-base-content/60">
                                    Enter your email and we&apos;ll send you a reset link
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-base-content mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="w-5 h-5 text-base-content/40" />
                                        </div>
                                        <input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 outline-none transition-all text-base-content"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn-primary w-full flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            <span>Send Reset Link</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-10 h-10 text-success" />
                            </div>
                            <h3 className="text-2xl font-bold text-base-content mb-3">
                                Check Your Email
                            </h3>
                            <p className="text-base-content/70 mb-6">
                                We&apos;ve sent a password reset link to<br />
                                <span className="font-semibold text-base-content">{email}</span>
                            </p>
                            <p className="text-sm text-base-content/60 mb-6">
                                Didn&apos;t receive the email? Check your spam folder or try again.
                            </p>
                            <button
                                onClick={() => setEmailSent(false)}
                                className="btn-secondary"
                            >
                                Try Another Email
                            </button>
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 text-base-content/70 hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Sign In
                        </Link>
                    </div>
                </div>

                {/* Info Box */}
                <div className="card bg-info/10 border border-info/20 mt-6">
                    <div className="text-sm text-base-content/70">
                        <p className="font-semibold text-base-content mb-2">💡 Security Tips:</p>
                        <ul className="space-y-1 list-disc list-inside">
                            <li>The reset link expires in 1 hour</li>
                            <li>Check spam folder if not received</li>
                            <li>Never share reset links with anyone</li>
                        </ul>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
