'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { AlertCircle, RefreshCw, ArrowLeft, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function PaymentErrorPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const orderId = searchParams.get('order_id')

    useEffect(() => {
        toast.error('Payment failed. Please try again.')
    }, [])

    const handleRetryPayment = () => {
        router.push('/checkout')
    }

    return (
        <div className="min-h-screen pt-32">
            <div className="section-padding">
                <div className="container-custom max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="card text-center"
                    >
                        {/* Error Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-24 h-24 mx-auto mb-6 bg-error/20 rounded-full flex items-center justify-center"
                        >
                            <AlertCircle className="w-16 h-16 text-error" />
                        </motion.div>

                        {/* Error Message */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h1 className="text-4xl font-bold text-base-content mb-4">
                                Payment Failed
                            </h1>
                            <p className="text-lg text-base-content/70 mb-8">
                                We couldn't process your payment. Please check your payment details and try again.
                            </p>
                        </motion.div>

                        {/* Order Info */}
                        {orderId && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-base-200 rounded-lg p-6 mb-8"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-base-content/70">Order ID</span>
                                    <span className="font-bold text-base-content">{orderId}</span>
                                </div>
                                <p className="text-sm text-base-content/60 mt-4">
                                    Your order is pending payment. Complete the payment to confirm your order.
                                </p>
                            </motion.div>
                        )}

                        {/* Common Issues */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-warning/10 border border-warning/20 rounded-lg p-6 mb-8 text-left"
                        >
                            <h3 className="font-semibold text-base-content mb-3">Common payment issues:</h3>
                            <ul className="space-y-2 text-sm text-base-content/70">
                                <li>• Insufficient funds in your account</li>
                                <li>• Incorrect card details entered</li>
                                <li>• Card expired or blocked</li>
                                <li>• Bank declined the transaction</li>
                                <li>• Network connectivity issues</li>
                            </ul>
                        </motion.div>

                        {/* Suggestions Box */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-info/10 border border-info/20 rounded-lg p-6 mb-8 text-left"
                        >
                            <h3 className="font-semibold text-base-content mb-3">What you can do:</h3>
                            <ul className="space-y-2 text-sm text-base-content/70">
                                <li>• Verify your card details are correct</li>
                                <li>• Check your card has sufficient balance</li>
                                <li>• Try using a different card or payment method</li>
                                <li>• Contact your bank if the issue persists</li>
                                <li>• Try Cash on Delivery as an alternative</li>
                            </ul>
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <button
                                onClick={handleRetryPayment}
                                className="btn-primary inline-flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Retry Payment
                            </button>
                            <Link
                                href="/contact"
                                className="btn-secondary inline-flex items-center justify-center gap-2"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Contact Support
                            </Link>
                        </motion.div>

                        {/* Alternative Actions */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="mt-8 pt-6 border-t border-base-300"
                        >
                            <p className="text-sm text-base-content/60 mb-4">
                                Don't want to retry now?
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link
                                    href="/cart"
                                    className="text-sm text-primary hover:underline"
                                >
                                    Return to Cart
                                </Link>
                                <span className="hidden sm:inline text-base-content/30">•</span>
                                <Link
                                    href="/products"
                                    className="text-sm text-primary hover:underline"
                                >
                                    Continue Shopping
                                </Link>
                                <span className="hidden sm:inline text-base-content/30">•</span>
                                <Link
                                    href="/orders"
                                    className="text-sm text-primary hover:underline"
                                >
                                    View Orders
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
