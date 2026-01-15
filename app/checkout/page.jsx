// app/checkout/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { motion } from 'framer-motion'
import { CreditCard, MapPin, Package, ArrowLeft, Loader } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { loadStripe } from '@/lib/stripe/config'
import { getCurrentUser } from '@/lib/firebase/auth'
import { getDivisions, getDistricts, getCities } from '@/utils/bdLocations'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
    const router = useRouter()
    const { cartItems, getCartTotal, clearCart } = useCart()
    const [user, setUser] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const [shippingInfo, setShippingInfo] = useState({
        street: '',
        division: '',
        district: '',
        city: '',
        zipCode: '',
        country: 'Bangladesh'
    })

    const [divisions] = useState(getDivisions())
    const [districts, setDistricts] = useState([])
    const [cities, setCities] = useState([])

    const [paymentMethod, setPaymentMethod] = useState('card')

    useEffect(() => {
        const currentUser = getCurrentUser()
        if (!currentUser) {
            toast.error('Please login to continue')
            router.push('/login')
            return
        }
        setUser(currentUser)
    }, [router])

    useEffect(() => {
        if (shippingInfo.division) {
            setDistricts(getDistricts(shippingInfo.division))
            setShippingInfo(prev => ({ ...prev, district: '', city: '' }))
        }
    }, [shippingInfo.division])

    useEffect(() => {
        if (shippingInfo.division && shippingInfo.district) {
            setCities(getCities(shippingInfo.division, shippingInfo.district))
            setShippingInfo(prev => ({ ...prev, city: '' }))
        }
    }, [shippingInfo.district])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setShippingInfo(prev => ({ ...prev, [name]: value }))
    }

    const subtotal = getCartTotal()
    const shipping = subtotal > 100 ? 0 : 10
    const tax = subtotal * 0.1
    const total = subtotal + shipping + tax

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!user) {
            toast.error('Please login to continue')
            return
        }

        if (cartItems.length === 0) {
            toast.error('Your cart is empty')
            return
        }

        // Validate shipping info
        if (!shippingInfo.street || !shippingInfo.division || !shippingInfo.district ||
            !shippingInfo.city || !shippingInfo.zipCode) {
            toast.error('Please fill in all shipping details')
            return
        }

        setIsProcessing(true)

        try {
            // Create order in database first
            const orderData = {
                userId: user.uid,
                items: cartItems.map(item => ({
                    productId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image
                })),
                shippingAddress: shippingInfo,
                paymentMethod: paymentMethod === 'card' ? 'Credit Card' : 'Cash on Delivery',
                subtotal,
                shipping,
                tax,
                total,
                status: 'processing',
                paymentStatus: paymentMethod === 'card' ? 'pending' : 'completed'
            }

            const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            })

            const orderResult = await orderResponse.json()

            if (!orderResult.success) {
                throw new Error('Failed to create order')
            }

            const orderId = orderResult.order.orderId

            // If payment method is card, process with Stripe
            if (paymentMethod === 'card') {
                const stripe = await loadStripe()

                // Create payment intent
                const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-intent`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        amount: total,
                        orderId: orderId,
                        currency: 'usd'
                    })
                })

                const paymentResult = await paymentResponse.json()

                if (!paymentResult.success) {
                    throw new Error('Failed to create payment intent')
                }

                // Confirm payment
                const { error: stripeError } = await stripe.confirmCardPayment(
                    paymentResult.clientSecret,
                    {
                        payment_method: {
                            card: {
                                // In production, you'd use Stripe Elements here
                                // For demo purposes, we'll use a test card
                            }
                        }
                    }
                )

                if (stripeError) {
                    throw new Error(stripeError.message)
                }

                // Save payment confirmation
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/confirm`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        orderId: orderId,
                        transactionId: paymentResult.transactionId,
                        amount: total,
                        paymentMethod: 'Credit Card'
                    })
                })
            }

            // Clear cart and redirect
            clearCart()
            toast.success('Order placed successfully!')
            router.push(`/order-success?orderId=${orderId}`)

        } catch (error) {
            console.error('Checkout error:', error)
            toast.error(error.message || 'Failed to process order')
        } finally {
            setIsProcessing(false)
        }
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen pt-32">
                <div className="section-padding">
                    <div className="container-custom max-w-md mx-auto text-center">
                        <Package className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-base-content mb-2">Your cart is empty</h2>
                        <p className="text-base-content/70 mb-6">Add some products to checkout</p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 bg-linear-to-r from-primary to-secondary text-primary-content px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-32">
            <div className="section-padding">
                <div className="container-custom max-w-6xl">
                    <Link
                        href="/cart"
                        className="inline-flex items-center gap-2 text-base-content/70 hover:text-primary transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Cart
                    </Link>

                    <h1 className="text-4xl font-bold text-base-content mb-8">Checkout</h1>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Shipping Information */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <MapPin className="w-6 h-6 text-primary" />
                                    <h2 className="text-2xl font-bold text-base-content">Shipping Address</h2>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-base-content mb-2">
                                            Street Address
                                        </label>
                                        <input
                                            type="text"
                                            name="street"
                                            value={shippingInfo.street}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 bg-base-200 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="House/Flat no., Street name"
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-base-content mb-2">
                                                Division
                                            </label>
                                            <select
                                                name="division"
                                                value={shippingInfo.division}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 bg-base-200 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            >
                                                <option value="">Select Division</option>
                                                {divisions.map(div => (
                                                    <option key={div} value={div}>{div}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-base-content mb-2">
                                                District
                                            </label>
                                            <select
                                                name="district"
                                                value={shippingInfo.district}
                                                onChange={handleInputChange}
                                                required
                                                disabled={!shippingInfo.division}
                                                className="w-full px-4 py-3 bg-base-200 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                            >
                                                <option value="">Select District</option>
                                                {districts.map(dist => (
                                                    <option key={dist} value={dist}>{dist}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-base-content mb-2">
                                                City/Area
                                            </label>
                                            <select
                                                name="city"
                                                value={shippingInfo.city}
                                                onChange={handleInputChange}
                                                required
                                                disabled={!shippingInfo.district}
                                                className="w-full px-4 py-3 bg-base-200 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                            >
                                                <option value="">Select City</option>
                                                {cities.map(city => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-base-content mb-2">
                                                Zip Code
                                            </label>
                                            <input
                                                type="text"
                                                name="zipCode"
                                                value={shippingInfo.zipCode}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 bg-base-200 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="1200"
                                            />
                                        </div>
                                    </div>
                                </form>
                            </motion.div>

                            {/* Payment Method */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="card"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <CreditCard className="w-6 h-6 text-primary" />
                                    <h2 className="text-2xl font-bold text-base-content">Payment Method</h2>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 p-4 bg-base-200 rounded-lg cursor-pointer hover:bg-base-300 transition-colors">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="card"
                                            checked={paymentMethod === 'card'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="radio radio-primary"
                                        />
                                        <div className="flex-1">
                                            <div className="font-semibold text-base-content">Credit/Debit Card</div>
                                            <div className="text-sm text-base-content/60">Pay securely with Stripe</div>
                                        </div>
                                        <CreditCard className="w-5 h-5 text-primary" />
                                    </label>

                                    <label className="flex items-center gap-3 p-4 bg-base-200 rounded-lg cursor-pointer hover:bg-base-300 transition-colors">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={paymentMethod === 'cod'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="radio radio-primary"
                                        />
                                        <div className="flex-1">
                                            <div className="font-semibold text-base-content">Cash on Delivery</div>
                                            <div className="text-sm text-base-content/60">Pay when you receive</div>
                                        </div>
                                    </label>
                                </div>
                            </motion.div>
                        </div>

                        {/* Order Summary */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-1"
                        >
                            <div className="card sticky top-24">
                                <h2 className="text-2xl font-bold text-base-content mb-6">Order Summary</h2>

                                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="flex gap-3">
                                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-base-200">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-sm text-base-content line-clamp-1">
                                                    {item.name}
                                                </h3>
                                                <p className="text-sm text-base-content/60">
                                                    Qty: {item.quantity}
                                                </p>
                                            </div>
                                            <div className="font-bold text-base-content">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 pt-4 border-t border-base-300">
                                    <div className="flex justify-between text-base-content/70">
                                        <span>Subtotal</span>
                                        <span className="font-semibold">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-base-content/70">
                                        <span>Shipping</span>
                                        <span className="font-semibold text-success">
                                            {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-base-content/70">
                                        <span>Tax</span>
                                        <span className="font-semibold">${tax.toFixed(2)}</span>
                                    </div>
                                    <div className="pt-3 border-t border-base-300">
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-semibold text-base-content">Total</span>
                                            <span className="text-2xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                                                ${total.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={isProcessing}
                                    className="w-full mt-6 bg-linear-to-r from-primary to-secondary text-primary-content py-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="w-5 h-5" />
                                            Place Order
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
