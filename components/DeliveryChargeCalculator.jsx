'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Package,
    Truck,
    MapPin,
    DollarSign,
    Info,
    ChevronDown
} from 'lucide-react'
import {
    calculateDeliveryCharge,
    calculateRiderCommission,
    isWithinCity,
    PRODUCT_TYPE,
    DELIVERY_CHARGES
} from '@/lib/delivery/deliveryPricing'
import { bdLocations } from '@/utils/bdLocations'

export default function DeliveryChargeCalculator({
    onCalculate,
    initialData = null
}) {
    const [productType, setProductType] = useState(PRODUCT_TYPE.NON_DOCUMENT)
    const [weight, setWeight] = useState(0)
    const [division, setDivision] = useState('')
    const [pickupDistrict, setPickupDistrict] = useState('')
    const [deliveryDistrict, setDeliveryDistrict] = useState('')
    const [deliveryCharge, setDeliveryCharge] = useState(0)
    const [riderCommission, setRiderCommission] = useState(0)
    const [showBreakdown, setShowBreakdown] = useState(false)

    const divisions = Object.keys(bdLocations)
    const districts = division ? bdLocations[division]?.districts || [] : []

    // Calculate charges when inputs change
    useEffect(() => {
        if (pickupDistrict && deliveryDistrict) {
            const withinCity = isWithinCity({
                pickupDistrict,
                deliveryDistrict
            })

            const charge = calculateDeliveryCharge({
                productType,
                weight,
                isWithinCity: withinCity
            })

            const commission = calculateRiderCommission(charge, withinCity)

            setDeliveryCharge(charge)
            setRiderCommission(commission)

            if (onCalculate) {
                onCalculate({
                    charge,
                    commission,
                    withinCity
                })
            }
        }
    }, [productType, weight, pickupDistrict, deliveryDistrict, onCalculate])

    const withinCity = pickupDistrict &&
        deliveryDistrict &&
        isWithinCity({
            pickupDistrict,
            deliveryDistrict
        })

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-base-100 rounded-2xl border border-base-300 p-6 md:p-8 shadow-lg"
        >
            <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-base-content mb-2">
                    Delivery Charge Calculator
                </h2>
                <p className="text-base-content/60">
                    Calculate your delivery fee based on product details and location
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Product Type */}
                <motion.div {...fadeInUp}>
                    <label className="block text-sm font-semibold text-base-content mb-3">
                        <Package className="w-4 h-4 inline mr-2 text-primary" />
                        Product Type
                    </label>
                    <select
                        value={productType}
                        onChange={(e) => setProductType(e.target.value)}
                        className="select select-bordered w-full text-base-content focus:outline-none focus:border-primary"
                    >
                        <option value={PRODUCT_TYPE.DOCUMENT}>
                            Document (Any Size)
                        </option>
                        <option value={PRODUCT_TYPE.NON_DOCUMENT}>
                            Non-Document (Parcel)
                        </option>
                    </select>
                </motion.div>

                {/* Weight */}
                {productType === PRODUCT_TYPE.NON_DOCUMENT && (
                    <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
                        <label className="block text-sm font-semibold text-base-content mb-3">
                            Weight (kg)
                        </label>
                        <input
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                            placeholder="Enter weight in kg"
                            className="input input-bordered w-full text-base-content focus:outline-none focus:border-primary"
                            min="0"
                            step="0.1"
                        />
                    </motion.div>
                )}

                {/* Division */}
                <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
                    <label className="block text-sm font-semibold text-base-content mb-3">
                        <MapPin className="w-4 h-4 inline mr-2 text-primary" />
                        Division
                    </label>
                    <select
                        value={division}
                        onChange={(e) => {
                            setDivision(e.target.value)
                            setPickupDistrict('')
                            setDeliveryDistrict('')
                        }}
                        className="select select-bordered w-full text-base-content focus:outline-none focus:border-primary"
                    >
                        <option value="">Select Division</option>
                        {divisions.map((div) => (
                            <option key={div} value={div}>
                                {div}
                            </option>
                        ))}
                    </select>
                </motion.div>

                {/* Pickup District */}
                {division && (
                    <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
                        <label className="block text-sm font-semibold text-base-content mb-3">
                            Pickup District
                        </label>
                        <select
                            value={pickupDistrict}
                            onChange={(e) => setPickupDistrict(e.target.value)}
                            className="select select-bordered w-full text-base-content focus:outline-none focus:border-primary"
                        >
                            <option value="">Select Pickup District</option>
                            {districts.map((dist) => (
                                <option key={dist} value={dist}>
                                    {dist}
                                </option>
                            ))}
                        </select>
                    </motion.div>
                )}

                {/* Delivery District */}
                {division && (
                    <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
                        <label className="block text-sm font-semibold text-base-content mb-3">
                            Delivery District
                        </label>
                        <select
                            value={deliveryDistrict}
                            onChange={(e) => setDeliveryDistrict(e.target.value)}
                            className="select select-bordered w-full text-base-content focus:outline-none focus:border-primary"
                        >
                            <option value="">Select Delivery District</option>
                            {districts.map((dist) => (
                                <option key={dist} value={dist}>
                                    {dist}
                                </option>
                            ))}
                        </select>
                    </motion.div>
                )}
            </div>

            {/* Delivery Type Badge */}
            {pickupDistrict && deliveryDistrict && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-4 rounded-lg border mb-6 flex items-center gap-3 ${withinCity
                            ? 'bg-success/10 border-success/20 text-success'
                            : 'bg-info/10 border-info/20 text-info'
                        }`}
                >
                    <Truck className="w-5 h-5" />
                    <div>
                        <p className="font-semibold">
                            {withinCity ? 'Within City Delivery' : 'Outside City Delivery'}
                        </p>
                        <p className="text-sm opacity-90">
                            {withinCity
                                ? 'Same city delivery - faster service'
                                : 'Cross-district delivery via warehouse'}
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Pricing Breakdown */}
            {deliveryCharge > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                >
                    {/* Main Charge */}
                    <div className="bg-linear-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-base-content/60">
                                        Delivery Charge
                                    </p>
                                    <p className="text-3xl font-bold text-primary">
                                        ৳{deliveryCharge}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Breakdown Toggle */}
                        <button
                            onClick={() => setShowBreakdown(!showBreakdown)}
                            className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                            <Info className="w-4 h-4" />
                            {showBreakdown ? 'Hide' : 'Show'} Calculation Details
                            <ChevronDown
                                className={`w-4 h-4 transition-transform ${showBreakdown ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Breakdown Details */}
                    {showBreakdown && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-base-200 rounded-xl p-6 space-y-3"
                        >
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm text-base-content/60">
                                        Product Type
                                    </p>
                                    <p className="font-semibold text-base-content capitalize">
                                        {productType.replace('-', ' ')}
                                    </p>
                                </div>
                                {productType === PRODUCT_TYPE.NON_DOCUMENT && (
                                    <div className="space-y-2">
                                        <p className="text-sm text-base-content/60">
                                            Weight
                                        </p>
                                        <p className="font-semibold text-base-content">
                                            {weight} kg
                                        </p>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <p className="text-sm text-base-content/60">
                                        Route
                                    </p>
                                    <p className="font-semibold text-base-content">
                                        {pickupDistrict} → {deliveryDistrict}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-base-content/60">
                                        Delivery Type
                                    </p>
                                    <p className="font-semibold text-base-content">
                                        {withinCity ? 'Same City' : 'Cross-District'}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-base-300">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                                        <p className="text-sm text-base-content/60 mb-1">
                                            Rider Commission
                                        </p>
                                        <p className="text-2xl font-bold text-success">
                                            ৳{riderCommission}
                                        </p>
                                        <p className="text-xs text-success/70 mt-2">
                                            ({withinCity ? '80%' : '60%'} of delivery charge)
                                        </p>
                                    </div>
                                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                                        <p className="text-sm text-base-content/60 mb-1">
                                            Platform Revenue
                                        </p>
                                        <p className="text-2xl font-bold text-warning">
                                            ৳{(deliveryCharge - riderCommission).toFixed(0)}
                                        </p>
                                        <p className="text-xs text-warning/70 mt-2">
                                            ({withinCity ? '20%' : '40%'} of delivery charge)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* Info Box */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 p-4 bg-info/5 border border-info/20 rounded-lg flex gap-3"
            >
                <Info className="w-5 h-5 text-info shrink-0 mt-0.5" />
                <div className="text-sm text-base-content/70">
                    <p className="font-semibold text-info mb-1">How pricing works</p>
                    <p>
                        Documents have a fixed rate, while parcels are charged based on weight. Cross-district deliveries go through a warehouse hub and have additional handling.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    )
}
