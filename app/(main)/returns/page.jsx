'use client'

import { motion } from 'framer-motion'
import { RotateCcw, CheckCircle, XCircle, Package, Clock, ChevronDown, Undo2, Zap, RefreshCcw } from 'lucide-react'

export default function ReturnsPage() {
    const returnSteps = [
        { step: '1', title: 'Initiate Return', description: 'Log in to your account and select the order' },
        { step: '2', title: 'Choose Reason', description: 'Select your return reason and provide details' },
        { step: '3', title: 'Print Label', description: 'Download and print the prepaid return label' },
        { step: '4', title: 'Pack & Ship', description: 'Pack the item securely and drop it off' },
        { step: '5', title: 'Get Refund', description: 'Receive your refund within 5-7 business days' },
    ]

    const eligible = [
        'Items must be unused and in original condition',
        'Original packaging and tags must be intact',
        'Return within 30 days of delivery',
        'Proof of purchase required',
        'Items must not show signs of wear or use',
    ]

    const notEligible = [
        'Final sale or clearance items',
        'Personalized or custom-made products',
        'Opened hygiene products or cosmetics',
        'Digital products or gift cards',
        'Items damaged due to misuse',
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
                            <span className="flex items-center gap-2">
                                <Undo2 /> <p>Returns & Exchanges</p>
                            </span>
                        </span>

                        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-base-content">
                            Easy Returns &{' '}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-accent">
                                Exchanges
                            </span>
                        </h1>

                        <p className="text-xl text-base-content/70">
                            Not satisfied? We offer hassle-free returns within 30 days of purchase.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Policy Highlights */}
            <section className="section-padding bg-base-200">
                <div className="container-custom">
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <motion.div {...fadeInUp} className="card bg-base-100 text-center">
                            <div className="text-5xl mb-4 flex justify-center"><RefreshCcw size={50} stroke='skyblue'/></div>
                            <h3 className="text-2xl font-bold text-base-content mb-2">30-Day Returns</h3>
                            <p className="text-base-content/70">Full refund within 30 days of delivery</p>
                        </motion.div>

                        <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="card bg-base-100 text-center">
                            <div className="text-5xl mb-4">🆓</div>
                            <h3 className="text-2xl font-bold text-base-content mb-2">Free Returns</h3>
                            <p className="text-base-content/70">No cost return shipping on defective items</p>
                        </motion.div>

                        <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="card bg-base-100 text-center">
                            <div className="text-5xl mb-4 flex justify-center"><Zap size={50} stroke='orange'/></div>
                            <h3 className="text-2xl font-bold text-base-content mb-2">Fast Refunds</h3>
                            <p className="text-base-content/70">Refund processed within 5-7 business days</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Return Process */}
            <section className="section-padding bg-base-100">
                <div className="container-custom">
                    <motion.div {...fadeInUp} className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-base-content mb-4">How to Return an Item</h2>
                        <p className="text-base-content/70">Follow these simple steps for a smooth return experience</p>
                    </motion.div>

                    <div className="max-w-5xl mx-auto">
                        <div className="relative">
                            {/* Progress Line */}
                            <div className="absolute top-10 left-0 right-0 h-1 bg-base-300 hidden lg:block"></div>
                            <div className="absolute top-10 left-0 w-4/5 h-1 bg-linear-to-r from-primary to-secondary hidden lg:block"></div>

                            <div className="grid lg:grid-cols-5 gap-6">
                                {returnSteps.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        {...fadeInUp}
                                        transition={{ delay: idx * 0.1 }}
                                        className="relative z-10"
                                    >
                                        <div className="card bg-base-200 text-center">
                                            <div className="w-20 h-20 rounded-full bg-linear-to-br from-primary to-secondary text-white text-3xl font-bold flex items-center justify-center mx-auto mb-4">
                                                {item.step}
                                            </div>
                                            <h3 className="font-bold text-base-content mb-2">{item.title}</h3>
                                            <p className="text-sm text-base-content/70">{item.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Eligible vs Not Eligible */}
            <section className="section-padding bg-base-200">
                <div className="container-custom max-w-5xl">
                    <motion.div {...fadeInUp} className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-base-content mb-4">Return Eligibility</h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Eligible */}
                        <motion.div {...fadeInUp} className="card bg-base-100 border-2 border-success/20">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center">
                                    <CheckCircle className="w-7 h-7 text-success" />
                                </div>
                                <h3 className="text-2xl font-bold text-base-content">Eligible for Return</h3>
                            </div>
                            <ul className="space-y-3">
                                {eligible.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                                        <span className="text-base-content/70">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Not Eligible */}
                        <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="card bg-base-100 border-2 border-error/20">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-lg bg-error/20 flex items-center justify-center">
                                    <XCircle className="w-7 h-7 text-error" />
                                </div>
                                <h3 className="text-2xl font-bold text-base-content">Not Eligible</h3>
                            </div>
                            <ul className="space-y-3">
                                {notEligible.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <XCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                                        <span className="text-base-content/70">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Exchanges */}
            <section className="section-padding bg-base-100">
                <div className="container-custom max-w-4xl">
                    <motion.div {...fadeInUp} className="card bg-linear-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
                        <div className="flex flex-col items-start gap-4">
                            <div className="text-5xl flex gap-2"><RefreshCcw size={40} stroke='skyblue' /><h2 className="text-3xl font-bold text-base-content mb-4">Exchanges</h2></div>
                            <div>
                                <p className="text-base-content/70 mb-4 leading-relaxed">
                                    Want to exchange an item for a different size, color, or style? We make it easy! Simply return your original item and place a new order for the item you want. This ensures you get your exchange as quickly as possible.
                                </p>
                                <div className="bg-base-100 rounded-lg p-4">
                                    <h4 className="font-bold text-base-content mb-2">Exchange Process:</h4>
                                    <ol className="list-decimal list-inside space-y-2 text-base-content/70">
                                        <li>Initiate a return for the original item</li>
                                        <li>Place a new order for the replacement item</li>
                                        <li>Once we receive your return, we&apos;ll process your refund</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* FAQs */}
            <section className="section-padding bg-base-200">
                <div className="container-custom max-w-4xl">
                    <motion.div {...fadeInUp} className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-base-content mb-4">Common Questions</h2>
                    </motion.div>

                    <div className="space-y-4">
                        {[
                            {
                                q: 'How long do refunds take?',
                                a: 'Refunds are processed within 5-7 business days after we receive your return. It may take an additional 3-5 days for the refund to appear in your account.'
                            },
                            {
                                q: 'Who pays for return shipping?',
                                a: 'We provide free return shipping for defective items. For other returns, return shipping costs $5.99, which will be deducted from your refund.'
                            },
                            {
                                q: 'Can I return sale items?',
                                a: 'Most sale items can be returned within 30 days. However, final sale items marked as "Final Sale" are not eligible for returns.'
                            },
                            {
                                q: 'What if I received a damaged item?',
                                a: 'Contact us immediately with photos of the damage. We\'ll arrange a free return and send a replacement or full refund.'
                            },
                        ].map((faq, idx) => (
                            <motion.details
                                key={idx}
                                {...fadeInUp}
                                transition={{ delay: idx * 0.05 }}
                                className="card bg-base-100 group cursor-pointer"
                            >
                                <summary className="font-bold text-lg text-base-content list-none flex items-center justify-between">
                                    {faq.q}
                                    <ChevronDown className="w-5 h-5 text-primary group-open:rotate-180 transition-transform" />
                                </summary>
                                <div className="mt-4 pt-4 border-t border-base-content/10">
                                    <p className="text-base-content/70">{faq.a}</p>
                                </div>
                            </motion.details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="section-padding bg-linear-to-r from-primary via-secondary to-accent text-primary-content">
                <div className="container-custom text-center">
                    <motion.div {...fadeInUp}>
                        <h2 className="text-4xl font-bold mb-4">Need Help with a Return?</h2>
                        <p className="text-xl mb-8 text-primary-content/90 max-w-2xl mx-auto">
                            Our customer support team is ready to assist you with any return or exchange questions.
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
