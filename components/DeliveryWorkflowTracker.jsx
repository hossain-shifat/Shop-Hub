'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
    Package,
    Clock,
    Truck,
    Warehouse,
    CheckCircle,
    AlertCircle,
    MapPin
} from 'lucide-react'
import { getStatusInfo, DELIVERY_STATUS } from '@/lib/delivery/deliveryPricing'

export default function DeliveryWorkflowTracker({ delivery }) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0)

    const steps = delivery?.isWithinCity
        ? [
            {
                status: DELIVERY_STATUS.UNPAID,
                label: 'Payment Pending',
                description: 'Awaiting payment',
                icon: Clock
            },
            {
                status: DELIVERY_STATUS.PAID,
                label: 'Payment Received',
                description: 'Payment confirmed',
                icon: CheckCircle
            },
            {
                status: DELIVERY_STATUS.READY_TO_PICKUP,
                label: 'Ready for Pickup',
                description: 'Waiting for rider',
                icon: Package
            },
            {
                status: DELIVERY_STATUS.IN_TRANSIT,
                label: 'Pickup in Progress',
                description: 'Rider collecting item',
                icon: Truck
            },
            {
                status: DELIVERY_STATUS.READY_FOR_DELIVERY,
                label: 'Out for Delivery',
                description: 'On the way to customer',
                icon: Truck
            },
            {
                status: DELIVERY_STATUS.DELIVERED,
                label: 'Delivered',
                description: 'Successfully delivered',
                icon: CheckCircle
            }
        ]
        : [
            {
                status: DELIVERY_STATUS.UNPAID,
                label: 'Payment Pending',
                description: 'Awaiting payment',
                icon: Clock
            },
            {
                status: DELIVERY_STATUS.PAID,
                label: 'Payment Received',
                description: 'Payment confirmed',
                icon: CheckCircle
            },
            {
                status: DELIVERY_STATUS.READY_TO_PICKUP,
                label: 'Ready for Pickup',
                description: 'Waiting for rider',
                icon: Package
            },
            {
                status: DELIVERY_STATUS.IN_TRANSIT,
                label: 'Pickup in Progress',
                description: 'Rider collecting item',
                icon: Truck
            },
            {
                status: DELIVERY_STATUS.REACHED_WAREHOUSE,
                label: 'Reached Warehouse',
                description: 'At distribution hub',
                icon: Warehouse
            },
            {
                status: DELIVERY_STATUS.SHIPPED,
                label: 'Shipped',
                description: 'Forwarded to destination',
                icon: Truck
            },
            {
                status: DELIVERY_STATUS.READY_FOR_DELIVERY,
                label: 'Out for Delivery',
                description: 'On the way to customer',
                icon: Truck
            },
            {
                status: DELIVERY_STATUS.DELIVERED,
                label: 'Delivered',
                description: 'Successfully delivered',
                icon: CheckCircle
            }
        ]

    // Find current step
    useEffect(() => {
        const index = steps.findIndex(step => step.status === delivery?.status)
        setCurrentStepIndex(index !== -1 ? index : 0)
    }, [delivery?.status, steps])

    const statusInfo = getStatusInfo(delivery?.status)

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Current Status Card */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`p-6 rounded-xl border-2 flex items-center gap-4 ${statusInfo.color === 'success'
                        ? 'bg-success/10 border-success/20'
                        : statusInfo.color === 'error'
                            ? 'bg-error/10 border-error/20'
                            : statusInfo.color === 'warning'
                                ? 'bg-warning/10 border-warning/20'
                                : 'bg-info/10 border-info/20'
                    }`}
            >
                <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${statusInfo.color === 'success'
                            ? 'bg-success/20'
                            : statusInfo.color === 'error'
                                ? 'bg-error/20'
                                : statusInfo.color === 'warning'
                                    ? 'bg-warning/20'
                                    : 'bg-info/20'
                        }`}
                >
                    {statusInfo.icon === 'CheckCircle' && (
                        <CheckCircle className="w-8 h-8 text-success" />
                    )}
                    {statusInfo.icon === 'Clock' && (
                        <Clock className="w-8 h-8 text-warning" />
                    )}
                    {statusInfo.icon === 'Package' && (
                        <Package className="w-8 h-8 text-info" />
                    )}
                    {statusInfo.icon === 'Truck' && (
                        <Truck className="w-8 h-8 text-primary" />
                    )}
                    {statusInfo.icon === 'Warehouse' && (
                        <Warehouse className="w-8 h-8 text-secondary" />
                    )}
                    {statusInfo.icon === 'XCircle' && (
                        <AlertCircle className="w-8 h-8 text-error" />
                    )}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-base-content">
                        {statusInfo.label}
                    </h3>
                    <p className="text-sm text-base-content/70">
                        {statusInfo.message}
                    </p>
                </div>
            </motion.div>

            {/* Delivery Details */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid md:grid-cols-2 gap-6"
            >
                {/* Pickup Location */}
                <div className="bg-base-100 border border-base-300 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-5 h-5 text-primary" />
                        <h4 className="font-semibold text-base-content">Pickup Location</h4>
                    </div>
                    <div className="space-y-1 text-sm text-base-content/70">
                        <p className="font-semibold text-base-content">
                            {delivery?.pickupLocation?.street}
                        </p>
                        <p>
                            {delivery?.pickupLocation?.city},{' '}
                            {delivery?.pickupLocation?.district}
                        </p>
                        <p>{delivery?.pickupLocation?.division}</p>
                    </div>
                </div>

                {/* Delivery Location */}
                <div className="bg-base-100 border border-base-300 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-5 h-5 text-secondary" />
                        <h4 className="font-semibold text-base-content">
                            Delivery Location
                        </h4>
                    </div>
                    <div className="space-y-1 text-sm text-base-content/70">
                        <p className="font-semibold text-base-content">
                            {delivery?.deliveryLocation?.street}
                        </p>
                        <p>
                            {delivery?.deliveryLocation?.city},{' '}
                            {delivery?.deliveryLocation?.district}
                        </p>
                        <p>{delivery?.deliveryLocation?.division}</p>
                    </div>
                </div>
            </motion.div>

            {/* Workflow Timeline */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-base-100 border border-base-300 rounded-xl p-8"
            >
                <h4 className="font-bold text-base-content mb-8 text-lg">
                    Delivery Progress
                </h4>

                <div className="space-y-0">
                    {steps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex
                        const isCurrent = index === currentStepIndex
                        const Icon = step.icon

                        return (
                            <motion.div key={step.status} variants={itemVariants}>
                                <div className="flex gap-6">
                                    {/* Timeline Marker */}
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${isCompleted
                                                    ? 'bg-gradient-to-r from-primary to-secondary text-primary-content'
                                                    : 'bg-base-200 text-base-content/50'
                                                } ${isCurrent ? 'ring-4 ring-primary/30' : ''}`}
                                        >
                                            <Icon className="w-6 h-6" />
                                        </div>

                                        {/* Connecting Line */}
                                        {index < steps.length - 1 && (
                                            <div
                                                className={`w-1 h-16 my-2 rounded-full transition-all duration-300 ${isCompleted
                                                        ? 'bg-gradient-to-b from-primary to-secondary'
                                                        : 'bg-base-300'
                                                    }`}
                                            ></div>
                                        )}
                                    </div>

                                    {/* Step Content */}
                                    <div className="pb-6 flex-1 pt-2">
                                        <h5
                                            className={`font-semibold text-base transition-colors ${isCompleted
                                                    ? 'text-base-content'
                                                    : 'text-base-content/60'
                                                }`}
                                        >
                                            {step.label}
                                        </h5>
                                        <p
                                            className={`text-sm ${isCompleted
                                                    ? 'text-base-content/70'
                                                    : 'text-base-content/50'
                                                }`}
                                        >
                                            {step.description}
                                        </p>
                                    </div>

                                    {/* Completion Badge */}
                                    {isCompleted && index !== currentStepIndex && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="flex items-center text-success"
                                        >
                                            <CheckCircle className="w-6 h-6" />
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </motion.div>

            {/* Delivery Info */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid md:grid-cols-3 gap-6"
            >
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
                    <p className="text-sm text-primary/70 mb-1">Delivery ID</p>
                    <p className="font-bold text-primary text-lg break-all">
                        {delivery?.deliveryId}
                    </p>
                </div>

                <div className="bg-success/10 border border-success/20 rounded-xl p-6">
                    <p className="text-sm text-success/70 mb-1">Delivery Charge</p>
                    <p className="font-bold text-success text-lg">
                        ৳{delivery?.deliveryCharge}
                    </p>
                </div>

                <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-6">
                    <p className="text-sm text-secondary/70 mb-1">Rider Commission</p>
                    <p className="font-bold text-secondary text-lg">
                        ৳{delivery?.riderCommission}
                    </p>
                </div>
            </motion.div>
        </motion.div>
    )
}
