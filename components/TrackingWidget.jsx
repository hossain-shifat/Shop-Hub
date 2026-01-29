'use client'

import { useState } from 'react'
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function TrackingWidget({ onOrderFound }) {
    const [trackingId, setTrackingId] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleTrack = async (e) => {
        e.preventDefault()

        if (!trackingId.trim()) {
            toast.error('Please enter a tracking ID')
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/tracking/${trackingId.trim()}`
            )

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Order not found')
            }

            toast.success('Order found!')
            if (onOrderFound) {
                onOrderFound(data.order)
            }
        } catch (err) {
            console.error('Track order error:', err)
            toast.error(err.message || 'Order not found')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
        >
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={trackingId}
                        onChange={(e) => setTrackingId(e.target.value)}
                        placeholder="Enter tracking ID (e.g., TRK-123456)"
                        className="input input-bordered w-full"
                        disabled={isLoading}
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn bg-linear-to-r from-primary to-secondary text-primary-content border-none hover:opacity-90 disabled:opacity-50"
                >
                    {isLoading ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Tracking...
                        </>
                    ) : (
                        <>
                            <Search className="w-4 h-4" />
                            Track
                        </>
                    )}
                </button>
            </form>
        </motion.div>
    )
}

// Status Badge Component
export function OrderStatusBadge({ status }) {
    const getStatusConfig = (status) => {
        const configs = {
            'processing': { color: 'bg-warning/10 text-warning border-warning/20', icon: Clock, label: 'Processing' },
            'confirmed': { color: 'bg-info/10 text-info border-info/20', icon: CheckCircle, label: 'Confirmed' },
            'assigned': { color: 'bg-info/10 text-info border-info/20', icon: Package, label: 'Rider Assigned' },
            'picked_up': { color: 'bg-primary/10 text-primary border-primary/20', icon: Package, label: 'Picked Up' },
            'in_transit': { color: 'bg-secondary/10 text-secondary border-secondary/20', icon: Truck, label: 'In Transit' },
            'out_for_delivery': { color: 'bg-secondary/10 text-secondary border-secondary/20', icon: Truck, label: 'Out for Delivery' },
            'delivered': { color: 'bg-success/10 text-success border-success/20', icon: CheckCircle, label: 'Delivered' },
            'cancelled': { color: 'bg-error/10 text-error border-error/20', icon: AlertCircle, label: 'Cancelled' }
        }
        return configs[status] || configs['processing']
    }

    const config = getStatusConfig(status)
    const StatusIcon = config.icon

    return (
        <span className={`px-4 py-2 rounded-lg font-semibold border-2 flex items-center gap-2 ${config.color}`}>
            <StatusIcon className="w-4 h-4" />
            {config.label}
        </span>
    )
}
