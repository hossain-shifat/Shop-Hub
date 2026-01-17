'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function PaymentCancelPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const orderId = searchParams.get('order_id')

    useEffect(() => {
        const handleCancellation = async () => {
            if (orderId) {
                try {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/cancel-payment`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ orderId })
                    })
                } catch (error) {
                    console.error('Error handling payment cancellation:', error)
                }
            }
        }

        handleCancellation()
        toast.error('Payment was cancelled')
    }, [orderId])

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
                        {/* Cancel Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-24 h-24 mx-auto mb-6 bg-warning/20 rounded-full flex items-center justify-center"
                        >
                            <XCircle className="w-16 h-16 text-warning" />
                        </motion.div>

                        {/* Cancel Message */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h1 className="text-4xl font-bold text-base-content mb-4">
                                Payment Cancelled
                            </h1>
                            <p className="text-lg text-base-content/70 mb-8">
                                Your payment was cancelled. No charges have been made to your account.
                            </p>
                        </motion.div>

                        {/* Info Box */}
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
                                    This order has been marked as cancelled. Your cart items are still saved.
                                </p>
                            </motion.div>
                        )}

                        {/* Reasons Box */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-info/10 border border-info/20 rounded-lg p-6 mb-8 text-left"
                        >
                            <h3 className="font-semibold text-base-content mb-3">Common reasons for cancellation:</h3>
                            <ul className="space-y-2 text-sm text-base-content/70">
                                <li>• Changed your mind about the purchase</li>
                                <li>• Want to review items in cart again</li>
                                <li>• Prefer a different payment method</li>
                                <li>• Technical issues during checkout</li>
                            </ul>
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Link
                                href="/cart"
                                className="btn-primary inline-flex items-center justify-center gap-2"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Return to Cart
                            </Link>
                            <Link
                                href="/products"
                                className="btn-secondary inline-flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Continue Shopping
                            </Link>
                        </motion.div>

                        {/* Help Text */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="text-sm text-base-content/60 mt-8"
                        >
                            Need help? <Link href="/contact" className="text-primary hover:underline">Contact our support team</Link>
                        </motion.p>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
