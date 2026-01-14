'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function AddProductPage() {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        image: '📦',
        category: '',
        stock: '',
        features: ''
    })

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/check')
            const data = await response.json()

            if (!data.isAuthenticated) {
                toast.error('Please login to access this page')
                router.push('/login')
            } else {
                setIsAuthenticated(true)
            }
        } catch (error) {
            toast.error('Authentication error')
            router.push('/login')
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        const productData = {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            features: formData.features.split(',').map(f => f.trim()).filter(f => f)
        }

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            })

            const data = await response.json()

            if (response.ok) {
                toast.success('Product added successfully! 🎉')
                router.push('/products')
            } else {
                toast.error(data.message || 'Failed to add product')
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-100">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-base-content/70 text-lg">Checking authentication...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    const emojiOptions = ['📦', '🎧', '⌚', '📷', '💻', '🔊', '🏠', '⌨️', '🚁', '📱', '🎮', '🎁', '👕', '👟', '🎒', '📚']

    return (
        <div className="section-padding bg-base-100 min-h-screen">
            <div className="container-custom max-w-4xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6"
                    >
                        ✨ Admin Panel
                    </motion.span>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-base-content">
                        Add New <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">Product</span>
                    </h1>
                    <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
                        Fill in the details below to add a new product to your catalog
                    </p>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card bg-base-100 shadow-2xl border border-base-content/10"
                >
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Product Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-base-content mb-3">
                                Product Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-5 py-4 rounded-lg bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 outline-none transition-all text-base-content text-lg"
                                placeholder="e.g., Wireless Headphones Pro"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-bold text-base-content mb-3">
                                Product Description *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="5"
                                className="w-full px-5 py-4 rounded-lg bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 outline-none transition-all resize-none text-base-content text-lg"
                                placeholder="Provide a detailed description of the product..."
                            />
                            <div className="flex items-center justify-between mt-2 text-xs text-base-content/50">
                                <span>Be descriptive and highlight key selling points</span>
                                <span>{formData.description.length} characters</span>
                            </div>
                        </div>

                        {/* Price and Stock Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="price" className="block text-sm font-bold text-base-content mb-3">
                                    Price (USD) *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <span className="text-base-content/40 text-xl font-bold">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full pl-12 pr-5 py-4 rounded-lg bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 outline-none transition-all text-base-content text-lg"
                                        placeholder="99.99"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="stock" className="block text-sm font-bold text-base-content mb-3">
                                    Stock Quantity *
                                </label>
                                <input
                                    type="number"
                                    id="stock"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    className="w-full px-5 py-4 rounded-lg bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 outline-none transition-all text-base-content text-lg"
                                    placeholder="50"
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-bold text-base-content mb-3">
                                Category *
                            </label>
                            <div className="relative">
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-5 py-4 rounded-lg bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 outline-none transition-all text-base-content text-lg appearance-none cursor-pointer"
                                >
                                    <option value="">Select a category</option>
                                    <option value="Electronics">📱 Electronics</option>
                                    <option value="Photography">📷 Photography</option>
                                    <option value="Computers">💻 Computers</option>
                                    <option value="Audio">🔊 Audio</option>
                                    <option value="Smart Home">🏠 Smart Home</option>
                                    <option value="Fitness">💪 Fitness</option>
                                    <option value="Accessories">⌨️ Accessories</option>
                                    <option value="Fashion">👕 Fashion</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Product Icon */}
                        <div>
                            <label className="block text-sm font-bold text-base-content mb-4">
                                Product Icon *
                            </label>
                            <div className="bg-base-200 rounded-xl p-6">
                                <div className="grid grid-cols-8 gap-3">
                                    {emojiOptions.map((emoji) => (
                                        <motion.button
                                            key={emoji}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, image: emoji })}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`aspect-square rounded-lg border-3 transition-all text-4xl flex items-center justify-center ${formData.image === emoji
                                                    ? 'border-primary bg-primary/10 scale-110 shadow-lg'
                                                    : 'border-base-300 hover:border-primary/50 hover:bg-base-100'
                                                }`}
                                        >
                                            {emoji}
                                        </motion.button>
                                    ))}
                                </div>
                                <div className="text-center mt-4 text-sm text-base-content/60">
                                    Selected: <span className="text-2xl ml-2">{formData.image}</span>
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div>
                            <label htmlFor="features" className="block text-sm font-bold text-base-content mb-3">
                                Key Features (Optional)
                            </label>
                            <input
                                type="text"
                                id="features"
                                name="features"
                                value={formData.features}
                                onChange={handleChange}
                                className="w-full px-5 py-4 rounded-lg bg-base-200 border-2 border-base-300 focus:border-primary focus:bg-base-100 outline-none transition-all text-base-content text-lg"
                                placeholder="Feature 1, Feature 2, Feature 3"
                            />
                            <p className="text-sm text-base-content/60 mt-2 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Separate multiple features with commas
                            </p>
                        </div>

                        {/* Preview Card */}
                        {formData.name && formData.price && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 border-2 border-primary/20"
                            >
                                <h3 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Preview
                                </h3>
                                <div className="card bg-base-100">
                                    <div className="flex items-center gap-4">
                                        <div className="text-6xl">{formData.image}</div>
                                        <div className="flex-1">
                                            <h4 className="text-xl font-bold text-base-content">{formData.name}</h4>
                                            {formData.category && (
                                                <span className="inline-block mt-1 px-3 py-1 bg-base-200 text-base-content/60 text-xs font-semibold rounded-full">
                                                    {formData.category}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-3xl font-bold text-primary">
                                            ${formData.price}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => router.push('/products')}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary flex-1 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        <span>Adding Product...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span>Add Product</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>

                {/* Help Text */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 text-center text-sm text-base-content/60"
                >
                    <p>All fields marked with * are required. Make sure to provide accurate information.</p>
                </motion.div>
            </div>
        </div>
    )
}
