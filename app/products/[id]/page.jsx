'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function ProductDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [product, setProduct] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)

    useEffect(() => {
        fetchProduct()
    }, [params.id])

    const fetchProduct = async () => {
        try {
            const response = await fetch(`/api/products/${params.id}`)
            if (response.ok) {
                const data = await response.json()
                setProduct(data)
            } else {
                router.push('/products')
            }
        } catch (error) {
            console.error('Error fetching product:', error)
            router.push('/products')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading product...</p>
                </div>
            </div>
        )
    }

    if (!product) {
        return null
    }

    return (
        <div className="section-padding bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container-custom">
                {/* Back Button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
                >
                    <Link href="/products" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Products
                    </Link>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Product Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="bg-white rounded-2xl shadow-xl p-12 flex items-center justify-center h-full">
                            <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-full h-96 rounded-xl flex items-center justify-center text-9xl">
                                {product.image}
                            </div>
                        </div>
                    </motion.div>

                    {/* Product Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                    >
                        <div>
                            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-1 rounded-full mb-4">
                                {product.category}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                {product.name}
                            </h1>
                            <div className="flex items-center mb-6">
                                <span className="text-yellow-400 text-2xl">★★★★★</span>
                                <span className="text-gray-600 ml-2 text-lg">({product.rating} rating)</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <p className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                ${product.price}
                            </p>
                            <p className={`text-lg font-semibold ${product.stock > 20 ? 'text-green-600' : 'text-orange-600'}`}>
                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold mb-4">Description</h2>
                            <p className="text-gray-700 text-lg leading-relaxed">{product.description}</p>
                        </div>

                        {product.features && product.features.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold mb-4">Key Features</h2>
                                <ul className="space-y-3">
                                    {product.features.map((feature, index) => (
                                        <li key={index} className="flex items-center text-gray-700">
                                            <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <label className="block text-lg font-semibold mb-3">Quantity</label>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-12 h-12 rounded-lg bg-gray-200 hover:bg-gray-300 font-bold text-xl transition-colors"
                                >
                                    -
                                </button>
                                <span className="text-2xl font-bold w-16 text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    className="w-12 h-12 rounded-lg bg-gray-200 hover:bg-gray-300 font-bold text-xl transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            <button
                                disabled={product.stock === 0}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                Add to Cart
                            </button>
                            <button className="w-full bg-white text-gray-900 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all border-2 border-gray-300">
                                Add to Wishlist
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
