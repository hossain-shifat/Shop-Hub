'use client'

import { motion } from 'framer-motion'
import { Truck, Clock, Globe, Package, MapPin, CheckCircle } from 'lucide-react'

export default function ShippingPage() {
    const shippingMethods = [
        {
            icon: Truck,
            name: 'Standard Shipping',
            duration: '3-5 Business Days',
            cost: 'FREE on orders $50+',
            details: 'Free standard shipping on all orders over $50. Orders under $50 have a flat rate of $5.99.'
        },
        {
            icon: Clock,
            name: 'Express Shipping',
            duration: '1-2 Business Days',
            cost: '$14.99',
            details: 'Get your order faster with express shipping. Available for most locations.'
        },
        {
            icon: Globe,
            name: 'International',
            duration: '7-14 Business Days',
            cost: 'Varies by location',
            details: 'We ship to over 50 countries. Customs fees may apply.'
        },
    ]

    const shippingZones = [
        { region: 'United States', time: '3-5 days', cost: '$5.99 or FREE over $50' },
        { region: 'Canada', time: '5-7 days', cost: '$12.99' },
        { region: 'Europe', time: '7-10 days', cost: '$19.99' },
        { region: 'Asia', time: '7-14 days', cost: '$24.99' },
        { region: 'Australia', time: '10-14 days', cost: '$29.99' },
        { region: 'Rest of World', time: '14-21 days', cost: 'Calculated at checkout' },
    ]

    const trackingSteps = [
        { step: 'Order Placed', icon: '📋', description: 'Your order has been received' },
        { step: 'Processing', icon: '⚙️', description: 'We\'re preparing your items' },
        { step: 'Shipped', icon: '📦', description: 'Your order is on its way' },
        { step: 'Out for Delivery', icon: '🚚', description: 'Your order is nearby' },
        { step: 'Delivered', icon: '✅', description: 'Package has been delivered' },
    ]

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    }

    return (
        <div className="min-h-screen bg-base-100">
            {/* Hero */}
            <section className="relative section-padding bg-linear-to-br from-primary/5 via-secondary/5 to-accent/5 overflow-hidden">
                <div className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>

                <div className="container-custom relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">
                            🚚 Shipping Info
                        </span>

                        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-base-content">
                            Shipping &{' '}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-accent">
                                Delivery
                            </span>
                        </h1>

                        <p className="text-xl text-base-content/70">
                            Fast, reliable shipping to your doorstep. Track your order every step of the way.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Shipping Methods */}
            <section className="section-padding bg-base-200">
                <div className="container-custom">
                    <motion.div {...fadeInUp} className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-base-content mb-4">
                            Shipping Methods
                        </h2>
                        <p className="text-base-content/70">Choose the delivery option that works best for you</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {shippingMethods.map((method, idx) => (
                            <motion.div
                                key={idx}
                                {...fadeInUp}
                                transition={{ delay: idx * 0.1 }}
                                className="card bg-base-100 hover:shadow-xl transition-all"
                            >
                                <div className="w-14 h-14 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center mb-4 mx-auto">
                                    <method.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-base-content mb-2 text-center">
                                    {method.name}
                                </h3>
                                <div className="text-center mb-4">
                                    <div className="text-primary font-bold text-lg">{method.duration}</div>
                                    <div className="text-base-content/70">{method.cost}</div>
                                </div>
                                <p className="text-base-content/70 text-center">
                                    {method.details}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Shipping Zones */}
            <section className="section-padding bg-base-100">
                <div className="container-custom max-w-4xl">
                    <motion.div {...fadeInUp} className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-base-content mb-4">
                            Shipping Zones & Rates
                        </h2>
                        <p className="text-base-content/70">Delivery times and costs by region</p>
                    </motion.div>

                    <motion.div {...fadeInUp} className="card bg-base-200">
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr className="border-b border-base-content/10">
                                        <th className="text-left font-bold text-base-content">Region</th>
                                        <th className="text-left font-bold text-base-content">Delivery Time</th>
                                        <th className="text-left font-bold text-base-content">Shipping Cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shippingZones.map((zone, idx) => (
                                        <tr key={idx} className="border-b border-base-content/5 hover:bg-base-100 transition-colors">
                                            <td className="font-semibold text-base-content">{zone.region}</td>
                                            <td className="text-base-content/70">{zone.time}</td>
                                            <td className="text-primary font-semibold">{zone.cost}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Order Tracking */}
            <section className="section-padding bg-base-200">
                <div className="container-custom">
                    <motion.div {...fadeInUp} className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-base-content mb-4">
                            Track Your Order
                        </h2>
                        <p className="text-base-content/70">Follow your package from warehouse to doorstep</p>
                    </motion.div>

                    <div className="max-w-4xl mx-auto">
                        <div className="relative">
                            {/* Progress Line */}
                            <div className="absolute top-8 left-0 right-0 h-1 bg-base-300 hidden md:block"></div>
                            <div className="absolute top-8 left-0 w-1/2 h-1 bg-linear-to-r from-primary to-secondary hidden md:block"></div>

                            <div className="grid md:grid-cols-5 gap-4">
                                {trackingSteps.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        {...fadeInUp}
                                        transition={{ delay: idx * 0.1 }}
                                        className="relative z-10"
                                    >
                                        <div className="card bg-base-100 text-center hover:shadow-xl transition-all">
                                            <div className={`w-16 h-16 rounded-full ${idx <= 2 ? 'bg-linear-to-br from-primary to-secondary' : 'bg-base-300'} flex items-center justify-center text-3xl mx-auto mb-3`}>
                                                {item.icon}
                                            </div>
                                            <h3 className="font-bold text-base-content mb-1">{item.step}</h3>
                                            <p className="text-xs text-base-content/70">{item.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Important Information */}
            <section className="section-padding bg-base-100">
                <div className="container-custom max-w-4xl">
                    <motion.div {...fadeInUp} className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-base-content mb-4">
                            Important Information
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <motion.div {...fadeInUp} className="card bg-base-200">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-6 h-6 text-success shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-base-content mb-2">Processing Time</h3>
                                    <p className="text-base-content/70 text-sm">
                                        Orders are processed within 1-2 business days. You&apos;ll receive a confirmation email once your order ships.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="card bg-base-200">
                            <div className="flex items-start gap-3">
                                <Package className="w-6 h-6 text-primary shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-base-content mb-2">Package Tracking</h3>
                                    <p className="text-base-content/70 text-sm">
                                        All orders include tracking information. Track your package anytime through your account or the link in your email.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="card bg-base-200">
                            <div className="flex items-start gap-3">
                                <Globe className="w-6 h-6 text-secondary shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-base-content mb-2">International Shipping</h3>
                                    <p className="text-base-content/70 text-sm">
                                        Customs fees and import duties are the responsibility of the recipient. Delivery times may vary.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div {...fadeInUp} transition={{ delay: 0.3 }} className="card bg-base-200">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-6 h-6 text-accent shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-base-content mb-2">Delivery Address</h3>
                                    <p className="text-base-content/70 text-sm">
                                        Please ensure your shipping address is correct. We cannot redirect packages once shipped.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="section-padding bg-linear-to-r from-primary via-secondary to-accent text-primary-content">
                <div className="container-custom text-center">
                    <motion.div {...fadeInUp}>
                        <h2 className="text-4xl font-bold mb-4">Have Shipping Questions?</h2>
                        <p className="text-xl mb-8 text-primary-content/90 max-w-2xl mx-auto">
                            Our customer support team is here to help with any shipping inquiries.
                        </p>
                        <a href="/contact" className="btn bg-white text-primary hover:bg-base-100 border-0">
                            Contact Support
                        </a>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
