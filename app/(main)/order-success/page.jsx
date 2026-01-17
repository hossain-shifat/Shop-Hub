'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Package, Truck, MapPin, Download, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Confetti from 'react-confetti'

export default function OrderSuccessPage() {
    const searchParams = useSearchParams()
    const orderId = searchParams.get('orderId')
    const [order, setOrder] = useState(null)
    const [showConfetti, setShowConfetti] = useState(true)
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

    useEffect(() => {
        // Set window size for confetti
        setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight
        })

        // Stop confetti after 5 seconds
        const timer = setTimeout(() => setShowConfetti(false), 5000)

        // Fetch order details
        if (orderId) {
            const orders = JSON.parse(localStorage.getItem('orders') || '[]')
            const foundOrder = orders.find((o) => o.id === orderId)
            setOrder(foundOrder)
        }

        return () => clearTimeout(timer)
    }, [orderId])

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    }

    const scaleIn = {
        initial: { scale: 0 },
        animate: { scale: 1 },
        transition: { type: 'spring', duration: 0.6, delay: 0.2 }
    }

    if (!order) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-base-content/70 text-lg">Loading order details...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-32">
            {showConfetti && (
                <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    recycle={false}
                    numberOfPieces={500}
                />
            )}

            <div className="section-padding">
                <div className="container-custom max-w-4xl">
                    {/* Success Message */}
                    <motion.div
                        {...fadeInUp}
                        className="text-center mb-12"
                    >
                        <motion.div
                            {...scaleIn}
                            className="w-24 h-24 mx-auto mb-6 bg-linear-to-br from-success to-success/80 rounded-full flex items-center justify-center"
                        >
                            <CheckCircle className="w-12 h-12 text-white" />
                        </motion.div>

                        <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-4">
                            Order Placed Successfully!
                        </h1>
                        <p className="text-xl text-base-content/70 mb-2">
                            Thank you for your purchase
                        </p>
                        <p className="text-base-content/60">
                            Your order <span className="font-semibold text-primary">#{order.id}</span> has been confirmed
                        </p>
                    </motion.div>

                    {/* Order Details Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="card bg-base-200 mb-6"
                    >
                        <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-base-300">
                            <div>
                                <h2 className="text-2xl font-bold text-base-content mb-2">Order Details</h2>
                                <p className="text-base-content/60">
                                    Confirmation sent to your email
                                </p>
                            </div>
                            <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-content rounded-lg font-semibold hover:opacity-90 transition-opacity">
                                <Download className="w-4 h-4" />
                                Download Invoice
                            </button>
                        </div>

                        {/* Order Info Grid */}
                        <div className="grid md:grid-cols-3 gap-6 py-6 border-b border-base-300">
                            <div className="text-center md:text-left">
                                <div className="text-sm text-base-content/60 mb-1">Order Number</div>
                                <div className="font-bold text-base-content">#{order.id}</div>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="text-sm text-base-content/60 mb-1">Order Date</div>
                                <div className="font-bold text-base-content">{order.date}</div>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="text-sm text-base-content/60 mb-1">Total Amount</div>
                                <div className="font-bold text-primary text-xl">${order.total.toFixed(2)}</div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="py-6 border-b border-base-300">
                            <h3 className="font-bold text-base-content mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                Order Items ({order.items.length})
                            </h3>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-center">
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-base-300 shrink-0">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-base-content truncate">
                                                {item.name}
                                            </h4>
                                            <p className="text-sm text-base-content/60">
                                                Qty: {item.quantity} × ${item.price.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="font-bold text-base-content">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="pt-6">
                            <h3 className="font-bold text-base-content mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Shipping Address
                            </h3>
                            <div className="text-base-content/70">
                                <p>{order.shippingAddress.street}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                                <p>{order.shippingAddress.country}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* What's Next */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="card bg-base-200 mb-6"
                    >
                        <h2 className="text-2xl font-bold text-base-content mb-6">What Happens Next?</h2>
                        <div className="space-y-4">
                            {[
                                {
                                    icon: Package,
                                    title: 'Order Processing',
                                    description: 'We\'re preparing your items for shipment',
                                    time: 'Within 24 hours'
                                },
                                {
                                    icon: Truck,
                                    title: 'Shipping',
                                    description: 'Your order will be shipped to your address',
                                    time: '2-3 business days'
                                },
                                {
                                    icon: CheckCircle,
                                    title: 'Delivery',
                                    description: 'Your order will arrive at your doorstep',
                                    time: '3-5 business days'
                                }
                            ].map((step, index) => (
                                <div key={index} className="flex gap-4 items-start">
                                    <div className="w-12 h-12 rounded-lg bg-linear-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                                        <step.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-base-content mb-1">{step.title}</h3>
                                        <p className="text-base-content/70 mb-1">{step.description}</p>
                                        <p className="text-sm text-primary font-semibold">{step.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <Link
                            href="/orders"
                            className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-primary to-secondary text-primary-content px-6 py-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 shadow-lg"
                        >
                            <Package className="w-5 h-5" />
                            View All Orders
                        </Link>
                        <Link
                            href="/products"
                            className="flex-1 flex items-center justify-center gap-2 bg-base-100 text-base-content px-6 py-4 rounded-lg font-semibold hover:bg-base-300 transition-all duration-300 border-2 border-base-300"
                        >
                            Continue Shopping
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>

                    {/* Help Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8 text-center"
                    >
                        <p className="text-base-content/60 mb-4">
                            Need help with your order?
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="/contact"
                                className="text-primary hover:text-primary/80 font-semibold"
                            >
                                Contact Support
                            </Link>
                            <span className="text-base-content/30">•</span>
                            <Link
                                href="/faq"
                                className="text-primary hover:text-primary/80 font-semibold"
                            >
                                FAQ
                            </Link>
                            <span className="text-base-content/30">•</span>
                            <Link
                                href="/shipping"
                                className="text-primary hover:text-primary/80 font-semibold"
                            >
                                Shipping Info
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
