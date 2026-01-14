'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { CreditCard, Truck, MapPin, Lock, Check, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'

export default function CheckoutPage() {
    const router = useRouter()
    const { cartItems, getCartTotal, clearCart } = useCart()
    const [currentStep, setCurrentStep] = useState(1)
    const [isProcessing, setIsProcessing] = useState(false)

    const [shippingInfo, setShippingInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States'
    })

    const [paymentInfo, setPaymentInfo] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
        saveCard: false
    })

    const subtotal = getCartTotal()
    const shipping = subtotal > 100 ? 0 : 10
    const tax = subtotal * 0.1
    const total = subtotal + shipping + tax

    const handleShippingChange = (e) => {
        setShippingInfo({
            ...shippingInfo,
            [e.target.name]: e.target.value
        })
    }

    const handlePaymentChange = (e) => {
        const { name, value, type, checked } = e.target

        if (name === 'cardNumber') {
            // Format card number with spaces
            const formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()
            setPaymentInfo({ ...paymentInfo, [name]: formattedValue })
        } else if (name === 'expiryDate') {
            // Format expiry date MM/YY
            const formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5)
            setPaymentInfo({ ...paymentInfo, [name]: formattedValue })
        } else if (name === 'cvv') {
            // Only allow numbers and max 4 digits
            const formattedValue = value.replace(/\D/g, '').slice(0, 4)
            setPaymentInfo({ ...paymentInfo, [name]: formattedValue })
        } else {
            setPaymentInfo({
                ...paymentInfo,
                [name]: type === 'checkbox' ? checked : value
            })
        }
    }

    const validateShipping = () => {
        const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode']
        return required.every(field => shippingInfo[field].trim() !== '')
    }

    const validatePayment = () => {
        return (
            paymentInfo.cardNumber.replace(/\s/g, '').length === 16 &&
            paymentInfo.cardName.trim() !== '' &&
            paymentInfo.expiryDate.length === 5 &&
            paymentInfo.cvv.length >= 3
        )
    }

    const handleContinue = () => {
        if (currentStep === 1 && validateShipping()) {
            setCurrentStep(2)
        } else if (currentStep === 2 && validatePayment()) {
            setCurrentStep(3)
        }
    }

    const handlePlaceOrder = async () => {
        if (!validateShipping() || !validatePayment()) {
            alert('Please fill in all required fields')
            return
        }

        setIsProcessing(true)

        // Simulate order processing
        setTimeout(() => {
            // Create order object
            const order = {
                id: `ORD${Date.now()}`,
                date: new Date().toLocaleDateString(),
                status: 'processing',
                total: total,
                items: cartItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image
                })),
                shippingAddress: {
                    street: shippingInfo.address,
                    city: shippingInfo.city,
                    state: shippingInfo.state,
                    zipCode: shippingInfo.zipCode,
                    country: shippingInfo.country
                },
                paymentMethod: `**** **** **** ${paymentInfo.cardNumber.slice(-4)}`
            }

            // Save order to localStorage (replace with API call)
            const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]')
            localStorage.setItem('orders', JSON.stringify([order, ...existingOrders]))

            // Clear cart
            clearCart()

            // Redirect to success page
            router.push(`/order-success?orderId=${order.id}`)
        }, 2000)
    }

    const steps = [
        { number: 1, title: 'Shipping', icon: Truck },
        { number: 2, title: 'Payment', icon: CreditCard },
        { number: 3, title: 'Review', icon: Check }
    ]

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    }

    if (cartItems.length === 0 && !isProcessing) {
        router.push('/cart')
        return null
    }

    return (
        <div className="min-h-screen pt-32">
            <div className="section-padding">
                <div className="container-custom max-w-6xl">
                    {/* Header */}
                    <motion.div {...fadeInUp} className="mb-8">
                        <Link
                            href="/cart"
                            className="inline-flex items-center gap-2 text-base-content/70 hover:text-primary transition-colors mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Cart
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-2">
                            Checkout
                        </h1>
                        <p className="text-base-content/70">
                            Complete your order in just a few steps
                        </p>
                    </motion.div>

                    {/* Progress Steps */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between max-w-2xl mx-auto">
                            {steps.map((step, index) => (
                                <div key={step.number} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep >= step.number
                                                    ? 'bg-gradient-to-r from-primary to-secondary text-primary-content'
                                                    : 'bg-base-300 text-base-content/50'
                                                }`}
                                        >
                                            {currentStep > step.number ? (
                                                <Check className="w-6 h-6" />
                                            ) : (
                                                <step.icon className="w-5 h-5" />
                                            )}
                                        </div>
                                        <span className={`text-sm font-semibold mt-2 ${currentStep >= step.number ? 'text-base-content' : 'text-base-content/50'
                                            }`}>
                                            {step.title}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`flex-1 h-1 mx-4 transition-all duration-300 ${currentStep > step.number
                                                ? 'bg-gradient-to-r from-primary to-secondary'
                                                : 'bg-base-300'
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Step 1: Shipping Information */}
                            {currentStep === 1 && (
                                <motion.div
                                    key="shipping"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="card bg-base-200"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-base-content">Shipping Information</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-base-content mb-2">
                                                    First Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={shippingInfo.firstName}
                                                    onChange={handleShippingChange}
                                                    className="w-full px-4 py-3 rounded-lg bg-base-100 border border-base-300 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-base-content mb-2">
                                                    Last Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={shippingInfo.lastName}
                                                    onChange={handleShippingChange}
                                                    className="w-full px-4 py-3 rounded-lg bg-base-100 border border-base-300 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-base-content mb-2">
                                                    Email Address *
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={shippingInfo.email}
                                                    onChange={handleShippingChange}
                                                    className="w-full px-4 py-3 rounded-lg bg-base-100 border border-base-300 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-base-content mb-2">
                                                    Phone Number *
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={shippingInfo.phone}
                                                    onChange={handleShippingChange}
                                                    className="w-full px-4 py-3 rounded-lg bg-base-100 border border-base-300 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-base-content mb-2">
                                                Street Address *
                                            </label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={shippingInfo.address}
                                                onChange={handleShippingChange}
                                                className="w-full px-4 py-3 rounded-lg bg-base-100 border border-base-300 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
                                                required
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-base-content mb-2">
                                                    City *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={shippingInfo.city}
                                                    onChange={handleShippingChange}
                                                    className="w-full px-4 py-3 rounded-lg bg-base-100 border border-base-300 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-base-content mb-2">
                                                    State *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    value={shippingInfo.state}
                                                    onChange={handleShippingChange}
                                                    className="w-full px-4 py-3 rounded-lg bg-base-100 border border-base-300 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-base-content mb-2">
                                                    Zip Code *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="zipCode"
                                                    value={shippingInfo.zipCode}
                                                    onChange={handleShippingChange}
                                                    className="w-full px-4 py-3 rounded-lg bg-base-100 border border-base-300 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-base-content mb-2">
                                                Country *
                                            </label>
                                            <select
                                                name="country"
                                                value={shippingInfo.country}
                                                onChange={handleShippingChange}
                                                className="w-full px-4 py-3 rounded-lg bg-base-100 border border-base-300 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
                                            >
                                                <option>United States</option>
                                                <option>Canada</option>
                                                <option>United Kingdom</option>
                                                <option>Australia</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleContinue}
                                        disabled={!validateShipping()}
                                        className="w-full mt-6 bg-gradient-to-r from-primary to-secondary text-primary-content px-6 py-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Continue to Payment
                                    </button>
                                </motion.div>
                            )}

                            {/* Step 2: Payment Information */}
                            {currentStep === 2 && (
                                <motion.div
                                    key="payment"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="card bg-base-200"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-base-content">Payment Information</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-base-content mb-2">
                                                Card Number *
                                            </label>
                                            <input
                                                type="text"
                                                name="cardNumber"
                                                value={paymentInfo.cardNumber}
                                                onChange={handlePaymentChange}
                                                placeholder="1234 5678 9012 3456"
                                                maxLength={19}
                                                className="w-full px-4 py-3 rounded-lg bg-base-100 border border-base-300 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-base-content mb-2">
                                                Cardholder Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="cardName"
                                                value={paymentInfo.cardName}
                                                onChange={handlePaymentChange}
                                                placeholder="John Doe"
                                                className="w-full px-4 py-3 rounded-lg bg-base-100 border border-base-300 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-base-content mb-2">
                                                    Expiry Date *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="expiryDate"
                                                    value={paymentInfo.expiryDate}
                                                    onChange={handlePaymentChange}
                                                    placeholder="MM/YY"
                                                    maxLength={5}
                                                    className="w-full px-4 py-3 rounded-lg bg-base-100 border border-base-300 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-base-content mb-2">
                                                    CVV *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cvv"
                                                    value={paymentInfo.cvv}
                                                    onChange={handlePaymentChange}
                                                    placeholder="123"
                                                    maxLength={4}
                                                    className="w-full px-4 py-3 rounded-lg bg-base-100 border border-base-300 text-base-content focus:outline-none focus:ring-2 focus:ring-primary"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                name="saveCard"
                                                checked={paymentInfo.saveCard}
                                                onChange={handlePaymentChange}
                                                className="w-5 h-5 rounded border-base-300 text-primary focus:ring-2 focus:ring-primary"
                                            />
                                            <label className="text-sm text-base-content">
                                                Save card for future purchases
                                            </label>
                                        </div>

                                        <div className="bg-info/10 border border-info/20 rounded-lg p-4 flex items-start gap-3">
                                            <Lock className="w-5 h-5 text-info shrink-0 mt-0.5" />
                                            <div className="text-sm text-base-content/80">
                                                Your payment information is encrypted and secure. We never store your full card details.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={() => setCurrentStep(1)}
                                            className="flex-1 bg-base-100 text-base-content px-6 py-4 rounded-lg font-semibold hover:bg-base-300 transition-all duration-300 border-2 border-base-300"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleContinue}
                                            disabled={!validatePayment()}
                                            className="flex-1 bg-gradient-to-r from-primary to-secondary text-primary-content px-6 py-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Review Order
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Review Order */}
                            {currentStep === 3 && (
                                <motion.div
                                    key="review"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-6"
                                >
                                    {/* Shipping Address */}
                                    <div className="card bg-base-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-bold text-base-content">Shipping Address</h3>
                                            <button
                                                onClick={() => setCurrentStep(1)}
                                                className="text-primary hover:text-primary/80 font-semibold text-sm"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                        <div className="text-base-content/70">
                                            <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>
                                            <p>{shippingInfo.address}</p>
                                            <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                                            <p>{shippingInfo.country}</p>
                                            <p className="mt-2">{shippingInfo.email}</p>
                                            <p>{shippingInfo.phone}</p>
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="card bg-base-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-bold text-base-content">Payment Method</h3>
                                            <button
                                                onClick={() => setCurrentStep(2)}
                                                className="text-primary hover:text-primary/80 font-semibold text-sm"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CreditCard className="w-8 h-8 text-primary" />
                                            <div>
                                                <p className="font-semibold text-base-content">
                                                    **** **** **** {paymentInfo.cardNumber.slice(-4)}
                                                </p>
                                                <p className="text-sm text-base-content/60">
                                                    Expires {paymentInfo.expiryDate}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setCurrentStep(2)}
                                            className="flex-1 bg-base-100 text-base-content px-6 py-4 rounded-lg font-semibold hover:bg-base-300 transition-all duration-300 border-2 border-base-300"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handlePlaceOrder}
                                            disabled={isProcessing}
                                            className="flex-1 bg-gradient-to-r from-primary to-secondary text-primary-content px-6 py-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="w-5 h-5" />
                                                    Place Order
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Order Summary Sidebar */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-1"
                        >
                            <div className="card bg-base-200 sticky top-24">
                                <h2 className="text-2xl font-bold text-base-content mb-6">Order Summary</h2>

                                {/* Cart Items */}
                                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-3">
                                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-base-300 shrink-0">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-base-content text-sm truncate">
                                                    {item.name}
                                                </h4>
                                                <p className="text-xs text-base-content/60">
                                                    Qty: {item.quantity}
                                                </p>
                                                <p className="text-sm font-bold text-primary">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Price Breakdown */}
                                <div className="space-y-3 pt-6 border-t border-base-300">
                                    <div className="flex justify-between text-base-content/70">
                                        <span>Subtotal</span>
                                        <span className="font-semibold">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-base-content/70">
                                        <span>Shipping</span>
                                        <span className="font-semibold">
                                            {shipping === 0 ? (
                                                <span className="text-success">Free</span>
                                            ) : (
                                                `$${shipping.toFixed(2)}`
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-base-content/70">
                                        <span>Tax</span>
                                        <span className="font-semibold">${tax.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-base-300 pt-3">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-lg font-semibold text-base-content">Total</span>
                                            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                                ${total.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Security Badge */}
                                <div className="mt-6 pt-6 border-t border-base-300 flex items-center gap-3 text-sm text-base-content/60">
                                    <Lock className="w-5 h-5" />
                                    <span>Secure SSL Encrypted Payment</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
