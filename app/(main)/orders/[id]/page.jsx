'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Package, ArrowLeft, Calendar, CreditCard, MapPin, Phone, Mail,
    FileText, Download, Printer, CheckCircle2, Clock, XCircle,
    ShoppingBag, Receipt, Building2, User, Hash, DollarSign,
    Shield, AlertCircle, ExternalLink, Copy, Check
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Invoice from '@/components/Invoice'
import { getCurrentUser } from '@/lib/firebase/auth'
import toast from 'react-hot-toast'

export default function OrderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const orderId = params.id
    const [order, setOrder] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showInvoice, setShowInvoice] = useState(false)
    const [copiedField, setCopiedField] = useState(null)

    useEffect(() => {
        const user = getCurrentUser()
        if (!user) {
            toast.error('Please login to view order details')
            router.push('/login')
            return
        }

        if (orderId) {
            fetchOrder()
        }
    }, [orderId, router])

    const fetchOrder = async () => {
        try {
            setIsLoading(true)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`)
            const data = await response.json()

            if (data.success && data.order) {
                const formattedOrder = {
                    ...data.order,
                    id: data.order.orderId,
                    date: new Date(data.order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    time: new Date(data.order.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                }
                setOrder(formattedOrder)
            } else {
                toast.error('Order not found')
                router.push('/orders')
            }
        } catch (error) {
            console.error('Error fetching order:', error)
            toast.error('Failed to load order')
            router.push('/orders')
        } finally {
            setIsLoading(false)
        }
    }

    const copyToClipboard = async (text, field) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedField(field)
            toast.success('Copied to clipboard!')
            setTimeout(() => setCopiedField(null), 2000)
        } catch (err) {
            toast.error('Failed to copy')
        }
    }

    const getStatusConfig = (status) => {
        const configs = {
            processing: {
                gradient: 'from-amber-500 to-orange-500',
                bg: 'bg-amber-50 dark:bg-amber-950',
                border: 'border-amber-200 dark:border-amber-800',
                text: 'text-amber-700 dark:text-amber-300',
                icon: Clock,
                label: 'Processing',
                badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
            },
            confirmed: {
                gradient: 'from-blue-500 to-indigo-500',
                bg: 'bg-blue-50 dark:bg-blue-950',
                border: 'border-blue-200 dark:border-blue-800',
                text: 'text-blue-700 dark:text-blue-300',
                icon: CheckCircle2,
                label: 'Confirmed',
                badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            },
            shipped: {
                gradient: 'from-violet-500 to-purple-500',
                bg: 'bg-violet-50 dark:bg-violet-950',
                border: 'border-violet-200 dark:border-violet-800',
                text: 'text-violet-700 dark:text-violet-300',
                icon: Package,
                label: 'Shipped',
                badge: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200'
            },
            delivered: {
                gradient: 'from-emerald-500 to-green-500',
                bg: 'bg-emerald-50 dark:bg-emerald-950',
                border: 'border-emerald-200 dark:border-emerald-800',
                text: 'text-emerald-700 dark:text-emerald-300',
                icon: CheckCircle2,
                label: 'Delivered',
                badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
            },
            cancelled: {
                gradient: 'from-red-500 to-rose-500',
                bg: 'bg-red-50 dark:bg-red-950',
                border: 'border-red-200 dark:border-red-800',
                text: 'text-red-700 dark:text-red-300',
                icon: XCircle,
                label: 'Cancelled',
                badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }
        }
        return configs[status] || configs.processing
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary"
                        />
                        <Receipt className="absolute inset-0 m-auto w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-base-content mb-2">Loading Order</h3>
                    <p className="text-base-content/60">Fetching order details...</p>
                </motion.div>
            </div>
        )
    }

    if (!order) return null

    const statusConfig = getStatusConfig(order.status)
    const StatusIcon = statusConfig.icon

    return (
        <div className="min-h-screen bg-base-200">
            <div className="section-padding">
                <div className="container-custom max-w-7xl">
                    {/* Header Navigation */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <Link
                            href="/orders"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-base-100 hover:bg-base-300 transition-all duration-200 border border-base-300 group shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-medium">Back to Orders</span>
                        </Link>
                    </motion.div>

                    {/* Main Grid Layout */}
                    <div className="grid lg:grid-cols-12 gap-8">
                        {/* Left Column - Main Content (8 columns) */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Order Header Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-base-100 rounded-2xl shadow-lg border border-base-300 overflow-hidden"
                            >
                                {/* Top Section with Gradient */}
                                <div className={`bg-gradient-to-r ${statusConfig.gradient} p-8 text-white`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                                    <Receipt className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h1 className="text-3xl font-bold">Order #{order.orderId}</h1>
                                                    <p className="text-white/90 text-sm mt-1">
                                                        Placed on {order.date} at {order.time}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-3">
                                            <div className={`px-4 py-2 rounded-lg ${statusConfig.badge} font-semibold flex items-center gap-2`}>
                                                <StatusIcon className="w-4 h-4" />
                                                {statusConfig.label}
                                            </div>
                                            {order.paymentStatus === 'completed' && (
                                                <div className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center gap-2 text-sm">
                                                    <Shield className="w-3.5 h-3.5" />
                                                    <span>Payment Verified</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Order Details Grid */}
                                <div className="p-8">
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-base-content/60 text-sm">
                                                <Hash className="w-4 h-4" />
                                                <span>Order ID</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-mono font-bold text-base-content">
                                                    {order.orderId}
                                                </p>
                                                <button
                                                    onClick={() => copyToClipboard(order.orderId, 'orderId')}
                                                    className="p-1 hover:bg-base-200 rounded transition-colors"
                                                >
                                                    {copiedField === 'orderId' ? (
                                                        <Check className="w-4 h-4 text-success" />
                                                    ) : (
                                                        <Copy className="w-4 h-4 text-base-content/40" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-base-content/60 text-sm">
                                                <Calendar className="w-4 h-4" />
                                                <span>Order Date</span>
                                            </div>
                                            <p className="font-semibold text-base-content">
                                                {order.date}
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-base-content/60 text-sm">
                                                <DollarSign className="w-4 h-4" />
                                                <span>Total Amount</span>
                                            </div>
                                            <p className="font-bold text-2xl text-primary">
                                                ${order.total.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    {order.trackingId && (
                                        <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Package className="w-5 h-5 text-primary" />
                                                    <div>
                                                        <p className="text-sm text-base-content/60">Tracking Number</p>
                                                        <p className="font-mono font-bold text-base-content">
                                                            {order.trackingId}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => copyToClipboard(order.trackingId, 'trackingId')}
                                                    className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                                                >
                                                    {copiedField === 'trackingId' ? (
                                                        <Check className="w-5 h-5 text-success" />
                                                    ) : (
                                                        <Copy className="w-5 h-5 text-primary" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Order Items Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-base-100 rounded-2xl shadow-lg border border-base-300 overflow-hidden"
                            >
                                <div className="p-6 border-b border-base-300">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <ShoppingBag className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-base-content">Order Items</h2>
                                                <p className="text-sm text-base-content/60">
                                                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="space-y-4">
                                        {order.items.map((item, idx) => (
                                            <motion.div
                                                key={item._id || idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * idx }}
                                                className="group relative bg-base-200 rounded-xl p-5 hover:shadow-md transition-all duration-300 border border-base-300"
                                            >
                                                <div className="flex gap-5">
                                                    {/* Product Image */}
                                                    <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-base-300 shrink-0 border-2 border-base-300 group-hover:border-primary transition-colors">
                                                        <Image
                                                            src={item.image}
                                                            alt={item.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-lg text-base-content mb-2 line-clamp-2">
                                                            {item.name}
                                                        </h3>
                                                        <p className="text-sm text-base-content/60 mb-4">
                                                            Product ID: {item.productId}
                                                        </p>

                                                        <div className="flex items-center gap-6">
                                                            <div>
                                                                <p className="text-xs text-base-content/60 mb-1">Quantity</p>
                                                                <p className="font-bold text-base-content text-lg">{item.quantity}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-base-content/60 mb-1">Unit Price</p>
                                                                <p className="font-bold text-base-content text-lg">
                                                                    ${item.price.toFixed(2)}
                                                                </p>
                                                            </div>
                                                            <div className="ml-auto">
                                                                <p className="text-xs text-base-content/60 mb-1">Total</p>
                                                                <p className="font-bold text-primary text-xl">
                                                                    ${(item.price * item.quantity).toFixed(2)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Shipping & Payment Information */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="grid md:grid-cols-2 gap-6"
                            >
                                {/* Shipping Address */}
                                <div className="bg-base-100 rounded-2xl shadow-lg border border-base-300 overflow-hidden">
                                    <div className="p-5 border-b border-base-300 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                                <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <h3 className="font-bold text-base-content">Delivery Address</h3>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <Building2 className="w-5 h-5 text-base-content/40 mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="font-semibold text-base-content">
                                                        {order.shippingAddress.street}
                                                    </p>
                                                    <p className="text-sm text-base-content/70 mt-1">
                                                        {order.shippingAddress.city}, {order.shippingAddress.district}
                                                    </p>
                                                    <p className="text-sm text-base-content/70">
                                                        {order.shippingAddress.division} {order.shippingAddress.zipCode}
                                                    </p>
                                                    <p className="text-sm font-medium text-base-content/90 mt-2">
                                                        {order.shippingAddress.country}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Information */}
                                <div className="bg-base-100 rounded-2xl shadow-lg border border-base-300 overflow-hidden">
                                    <div className="p-5 border-b border-base-300 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <h3 className="font-bold text-base-content">Payment Information</h3>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-base-200">
                                            <span className="text-sm text-base-content/70">Payment Method</span>
                                            <span className="font-semibold text-base-content">{order.paymentMethod}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-base-200">
                                            <span className="text-sm text-base-content/70">Payment Status</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.paymentStatus === 'completed'
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                }`}>
                                                {order.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                                            </span>
                                        </div>
                                        {order.transactionId && (
                                            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div>
                                                        <p className="text-xs text-base-content/60 mb-1">Transaction ID</p>
                                                        <p className="font-mono text-sm font-bold text-primary break-all">
                                                            {order.transactionId}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => copyToClipboard(order.transactionId, 'transactionId')}
                                                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors shrink-0"
                                                    >
                                                        {copiedField === 'transactionId' ? (
                                                            <Check className="w-4 h-4 text-success" />
                                                        ) : (
                                                            <Copy className="w-4 h-4 text-primary" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Invoice Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-base-100 rounded-2xl shadow-lg border border-base-300 overflow-hidden"
                            >
                                <div className="p-6 border-b border-base-300 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-violet-500/20 rounded-lg">
                                                <FileText className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-base-content">Invoice</h2>
                                                <p className="text-sm text-base-content/60">Download your order invoice</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowInvoice(!showInvoice)}
                                            className="px-4 py-2 rounded-lg bg-violet-500 hover:bg-violet-600 text-white font-medium transition-colors flex items-center gap-2"
                                        >
                                            <FileText className="w-4 h-4" />
                                            {showInvoice ? 'Hide Invoice' : 'View Invoice'}
                                        </button>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {showInvoice && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-6 border-t border-base-300">
                                                <Invoice order={order} />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>

                        {/* Right Column - Summary Sidebar (4 columns) */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-4"
                        >
                            <div className="sticky top-24 space-y-6">
                                {/* Order Summary */}
                                <div className="bg-base-100 rounded-2xl shadow-lg border border-base-300 overflow-hidden">
                                    <div className="p-5 border-b border-base-300 bg-gradient-to-r from-primary/10 to-secondary/10">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/20 rounded-lg">
                                                <Receipt className="w-5 h-5 text-primary" />
                                            </div>
                                            <h3 className="font-bold text-base-content">Order Summary</h3>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-base-content/70">Subtotal</span>
                                                <span className="font-semibold text-base-content">
                                                    ${order.subtotal.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-base-content/70">Shipping</span>
                                                <span className={`font-semibold ${order.shipping === 0 ? 'text-emerald-500' : 'text-base-content'}`}>
                                                    {order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center pb-3 border-b border-base-300">
                                                <span className="text-base-content/70">Tax (10%)</span>
                                                <span className="font-semibold text-base-content">
                                                    ${order.tax.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center pt-1">
                                                <span className="font-bold text-lg text-base-content">Total</span>
                                                <span className="font-bold text-2xl text-primary">
                                                    ${order.total.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-base-300 space-y-3">
                                            <Link
                                                href="/products"
                                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-4 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg"
                                            >
                                                <ShoppingBag className="w-5 h-5" />
                                                Continue Shopping
                                            </Link>
                                            {order.status === 'delivered' && (
                                                <button className="w-full flex items-center justify-center gap-2 bg-base-200 hover:bg-base-300 text-base-content px-4 py-3 rounded-xl font-semibold transition-colors border border-base-300">
                                                    <ExternalLink className="w-5 h-5" />
                                                    Reorder Items
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Need Help Card */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="p-2 bg-blue-500 rounded-lg">
                                            <AlertCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-base-content mb-1">Need Assistance?</h4>
                                            <p className="text-sm text-base-content/70">
                                                Our support team is ready to help
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Link
                                            href="/contact"
                                            className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-colors group"
                                        >
                                            <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            <span className="text-sm font-medium text-base-content group-hover:text-primary">
                                                Email Support
                                            </span>
                                        </Link>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-white/5">
                                            <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            <span className="text-sm text-base-content/80">+880 1234-567890</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Status Info */}
                                <div className="bg-base-100 rounded-2xl shadow-lg border border-base-300 p-6">
                                    <h4 className="font-bold text-base-content mb-4 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-primary" />
                                        Order Information
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center pb-3 border-b border-base-300">
                                            <span className="text-sm text-base-content/60">Status</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig.badge}`}>
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pb-3 border-b border-base-300">
                                            <span className="text-sm text-base-content/60">Order Date</span>
                                            <span className="text-sm font-medium text-base-content">{order.date}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-3 border-b border-base-300">
                                            <span className="text-sm text-base-content/60">Payment</span>
                                            <span className="text-sm font-medium text-base-content">{order.paymentMethod}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-base-content/60">Items</span>
                                            <span className="text-sm font-medium text-base-content">
                                                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
