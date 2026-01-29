'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Package, Truck, CheckCircle, MapPin, Calendar, Clock, Phone, User, AlertCircle, ArrowRight, Home } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useSearchParams } from 'next/navigation'

export default function TrackOrderPage() {
    const searchParams = useSearchParams()
    const [trackingId, setTrackingId] = useState('')
    const [order, setOrder] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    // Check for tracking ID or order ID in URL params
    useEffect(() => {
        const urlTrackingId = searchParams.get('id')
        const urlOrderId = searchParams.get('orderId')

        if (urlTrackingId) {
            setTrackingId(urlTrackingId)
            handleTrackById(urlTrackingId)
        } else if (urlOrderId) {
            handleTrackByOrderId(urlOrderId)
        }
    }, [searchParams])

    const handleTrackById = async (id) => {
        if (!id.trim()) {
            toast.error('Please enter a tracking ID')
            return
        }

        setIsLoading(true)
        setError(null)
        setOrder(null)

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/tracking/${id.trim()}`
            )

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Order not found')
            }

            setOrder(data.order)
            toast.success('Order found!')
        } catch (err) {
            console.error('Track order error:', err)
            setError(err.message || 'Failed to track order')
            toast.error(err.message || 'Order not found')
        } finally {
            setIsLoading(false)
        }
    }

    const handleTrackByOrderId = async (orderId) => {
        setIsLoading(true)
        setError(null)
        setOrder(null)

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`
            )

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Order not found')
            }

            setOrder(data.order)
            if (data.order.trackingId) {
                setTrackingId(data.order.trackingId)
            }
            toast.success('Order found!')
        } catch (err) {
            console.error('Track order error:', err)
            setError(err.message || 'Failed to track order')
            toast.error(err.message || 'Order not found')
        } finally {
            setIsLoading(false)
        }
    }

    const handleTrack = async (e) => {
        e.preventDefault()
        await handleTrackById(trackingId)
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'processing':
            case 'pending':
                return 'bg-warning text-warning-content'
            case 'confirmed':
            case 'assigned':
                return 'bg-info text-info-content'
            case 'collected':
            case 'picked_up':
                return 'bg-primary text-primary-content'
            case 'shipped':
            case 'in_transit':
            case 'out_for_delivery':
                return 'bg-secondary text-secondary-content'
            case 'delivered':
                return 'bg-success text-success-content'
            case 'cancelled':
                return 'bg-error text-error-content'
            default:
                return 'bg-base-300 text-base-content'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'processing':
            case 'pending':
                return <Clock className="w-5 h-5" />
            case 'confirmed':
            case 'assigned':
            case 'collected':
            case 'picked_up':
                return <Package className="w-5 h-5" />
            case 'shipped':
            case 'in_transit':
            case 'out_for_delivery':
                return <Truck className="w-5 h-5" />
            case 'delivered':
                return <CheckCircle className="w-5 h-5" />
            case 'cancelled':
                return <AlertCircle className="w-5 h-5" />
            default:
                return <Package className="w-5 h-5" />
        }
    }

    const getStatusLabel = (status) => {
        const labels = {
            'processing': 'Processing',
            'confirmed': 'Confirmed',
            'assigned': 'Rider Assigned',
            'collected': 'Collected',
            'picked_up': 'Picked Up',
            'shipped': 'Shipped',
            'in_transit': 'In Transit',
            'out_for_delivery': 'Out for Delivery',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled'
        }
        return labels[status] || status.charAt(0).toUpperCase() + status.slice(1)
    }

    const getTimelineSteps = () => {
        const allSteps = [
            { status: 'processing', label: 'Order Placed', icon: Package },
            { status: 'confirmed', label: 'Confirmed', icon: CheckCircle },
            { status: 'picked_up', label: 'Picked Up', icon: Package },
            { status: 'in_transit', label: 'In Transit', icon: Truck },
            { status: 'delivered', label: 'Delivered', icon: CheckCircle }
        ]

        const statusOrder = ['processing', 'confirmed', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered']
        const currentIndex = statusOrder.indexOf(order?.status)

        return allSteps.map((step) => {
            const stepIndex = statusOrder.indexOf(step.status)
            return {
                ...step,
                completed: stepIndex <= currentIndex,
                current: step.status === order?.status
            }
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary to-secondary text-primary-content py-16 md:py-20">
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <Package className="w-16 h-16 mx-auto mb-6 opacity-90" />
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Track Your Order
                        </h1>
                        <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
                            Stay updated with real-time tracking information
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 -mt-8 pb-20">
                {/* Search Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card bg-base-100 shadow-2xl mb-8"
                >
                    <div className="card-body p-6 md:p-8">
                        <form onSubmit={handleTrack} className="space-y-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Enter Tracking ID</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={trackingId}
                                        onChange={(e) => setTrackingId(e.target.value)}
                                        placeholder="TRK-XXXXXXXXXX"
                                        className="input input-bordered w-full pr-12 text-lg"
                                        disabled={isLoading}
                                    />
                                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn btn-primary w-full gap-2 text-lg"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading loading-spinner"></span>
                                        Tracking...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5" />
                                        Track Order
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="divider my-4">OR</div>

                        <div className="text-center">
                            <p className="text-base-content/70 mb-3">
                                Don&apos;t have a tracking ID?
                            </p>
                            <Link href="/orders" className="btn btn-outline btn-sm gap-2">
                                <Home className="w-4 h-4" />
                                View My Orders
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="alert alert-error shadow-lg mb-6"
                        >
                            <AlertCircle className="w-6 h-6" />
                            <div>
                                <h3 className="font-bold">Order Not Found</h3>
                                <div className="text-sm">{error}</div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Order Details */}
                <AnimatePresence mode="wait">
                    {order && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6"
                        >
                            {/* Order Header Card */}
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body p-6 md:p-8">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-2xl md:text-3xl font-bold">
                                                    Order #{order.orderId}
                                                </h2>
                                            </div>
                                            <div className="flex items-center gap-2 text-base-content/60">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`badge ${getStatusColor(order.status)} badge-lg gap-2 px-6 py-4`}>
                                            {getStatusIcon(order.status)}
                                            <span className="font-semibold text-base">
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="divider my-4"></div>

                                    <div className="bg-base-200 rounded-lg p-4">
                                        <div className="flex items-center gap-3">
                                            <Package className="w-5 h-5 text-primary" />
                                            <div>
                                                <p className="text-sm text-base-content/60">Tracking Number</p>
                                                <p className="text-lg font-mono font-bold">{order.trackingId}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Timeline */}
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body p-6 md:p-8">
                                    <h3 className="text-xl font-bold mb-6">Delivery Progress</h3>
                                    <div className="relative">
                                        <div className="flex justify-between items-start">
                                            {getTimelineSteps().map((step, index) => {
                                                const StepIcon = step.icon
                                                return (
                                                    <div key={step.status} className="flex flex-col items-center flex-1 relative">
                                                        {/* Connecting Line */}
                                                        {index < getTimelineSteps().length - 1 && (
                                                            <div
                                                                className={`absolute top-6 left-1/2 w-full h-1 transition-all duration-500 ${step.completed ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-base-300'
                                                                    }`}
                                                                style={{ transform: 'translateY(-50%)' }}
                                                            ></div>
                                                        )}

                                                        {/* Icon */}
                                                        <div
                                                            className={`relative z-10 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-500 ${step.completed
                                                                    ? 'bg-gradient-to-r from-primary to-secondary text-primary-content shadow-lg scale-110'
                                                                    : 'bg-base-300 text-base-content/50'
                                                                } ${step.current ? 'ring-4 ring-primary/30 animate-pulse' : ''}`}
                                                        >
                                                            <StepIcon className="w-5 h-5 md:w-6 md:h-6" />
                                                        </div>

                                                        {/* Label */}
                                                        <p
                                                            className={`text-xs md:text-sm text-center mt-3 font-medium px-2 ${step.completed ? 'text-base-content' : 'text-base-content/50'
                                                                }`}
                                                        >
                                                            {step.label}
                                                        </p>
                                                        {step.current && (
                                                            <span className="badge badge-primary badge-sm mt-2">Current</span>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Rider Info */}
                                {order.riderInfo && order.riderInfo.name && (
                                    <div className="card bg-base-100 shadow-xl">
                                        <div className="card-body p-6">
                                            <h3 className="card-title text-lg mb-4">
                                                <User className="w-5 h-5 text-primary" />
                                                Delivery Rider
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar placeholder">
                                                        <div className="bg-primary text-primary-content rounded-full w-12">
                                                            <span className="text-xl">{order.riderInfo.name.charAt(0)}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold">{order.riderInfo.name}</p>
                                                        <div className="flex items-center gap-1 text-sm text-base-content/60">
                                                            <Phone className="w-3 h-3" />
                                                            {order.riderInfo.phone}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-base-200 rounded-lg p-3 flex items-center gap-2">
                                                    <Truck className="w-4 h-4 text-primary" />
                                                    <span className="text-sm">
                                                        {order.riderInfo.vehicleType} • {order.riderInfo.vehicleNumber}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Delivery Address */}
                                <div className="card bg-base-100 shadow-xl">
                                    <div className="card-body p-6">
                                        <h3 className="card-title text-lg mb-4">
                                            <MapPin className="w-5 h-5 text-primary" />
                                            Delivery Address
                                        </h3>
                                        <div className="space-y-2">
                                            <p className="font-semibold">{order.shippingAddress.street}</p>
                                            <p className="text-base-content/70">
                                                {order.shippingAddress.city}, {order.shippingAddress.district}
                                            </p>
                                            <p className="text-base-content/70">
                                                {order.shippingAddress.division} {order.shippingAddress.zipCode}
                                            </p>
                                            <p className="text-base-content/70">{order.shippingAddress.country}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body p-6 md:p-8">
                                    <h3 className="card-title text-lg mb-6">Order Items ({order.items.length})</h3>
                                    <div className="space-y-4">
                                        {order.items.map((item) => (
                                            <div
                                                key={item._id}
                                                className="flex gap-4 p-4 bg-base-200 rounded-lg hover:shadow-md transition-shadow"
                                            >
                                                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-base-300 shrink-0">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-base mb-1">{item.name}</h4>
                                                    <p className="text-sm text-base-content/60">
                                                        Quantity: {item.quantity} × ${item.price.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-primary">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="divider my-6"></div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold">Total Amount</span>
                                        <span className="text-3xl font-bold text-primary">
                                            ${order.total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline History */}
                            {order.timeline && order.timeline.length > 0 && (
                                <div className="card bg-base-100 shadow-xl">
                                    <div className="card-body p-6 md:p-8">
                                        <h3 className="card-title text-lg mb-6">Order Timeline</h3>
                                        <div className="space-y-4">
                                            {[...order.timeline].reverse().map((event, index) => (
                                                <div key={index} className="flex gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                            <Clock className="w-5 h-5 text-primary" />
                                                        </div>
                                                        {index < order.timeline.length - 1 && (
                                                            <div className="w-0.5 h-full bg-base-300 my-2"></div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 pb-6">
                                                        <p className="font-semibold text-base mb-1">
                                                            {event.note || getStatusLabel(event.status)}
                                                        </p>
                                                        <p className="text-sm text-base-content/60">
                                                            {new Date(event.timestamp).toLocaleString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                        {event.location && (
                                                            <p className="text-sm text-base-content/60 flex items-center gap-1 mt-1">
                                                                <MapPin className="w-3 h-3" />
                                                                {event.location}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body p-6">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Link href="/contact" className="btn btn-outline flex-1 gap-2">
                                            <AlertCircle className="w-5 h-5" />
                                            Need Help?
                                        </Link>
                                        <Link href="/products" className="btn btn-primary flex-1 gap-2">
                                            Continue Shopping
                                            <ArrowRight className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty State */}
                {!order && !isLoading && !error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="card bg-base-100 shadow-xl"
                    >
                        <div className="card-body p-12 text-center">
                            <div className="w-24 h-24 mx-auto mb-6 bg-base-200 rounded-full flex items-center justify-center">
                                <Package className="w-12 h-12 text-base-content/30" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Ready to Track?</h3>
                            <p className="text-base-content/70 mb-2">
                                Enter your tracking ID above to see real-time updates
                            </p>
                            <p className="text-sm text-base-content/60">
                                Your tracking ID can be found in your order confirmation email
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
