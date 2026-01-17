'use client'

import { useEffect, useState } from 'react'
import { Search, Edit, Trash2, Package } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function AdminProducts() {
    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [sellerFilter, setSellerFilter] = useState('all')

    useEffect(() => {
        fetchProducts()
    }, [])

    useEffect(() => {
        filterProducts()
    }, [searchQuery, categoryFilter, sellerFilter, products])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
            const data = await response.json()

            if (data.success) {
                setProducts(data.products || [])
                setFilteredProducts(data.products || [])
            }
        } catch (error) {
            console.error('Failed to fetch products:', error)
            toast.error('Failed to load products')
        } finally {
            setLoading(false)
        }
    }

    const filterProducts = () => {
        let filtered = products

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(product => product.category === categoryFilter)
        }

        if (sellerFilter !== 'all') {
            filtered = filtered.filter(product => product.sellerEmail === sellerFilter)
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(product =>
                product.name?.toLowerCase().includes(query) ||
                product.description?.toLowerCase().includes(query) ||
                product.id?.toLowerCase().includes(query) ||
                product.sellerEmail?.toLowerCase().includes(query)
            )
        }

        setFilteredProducts(filtered)
    }

    const handleDeleteProduct = async (productId) => {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`, {
                method: 'DELETE'
            })

            const data = await response.json()

            if (data.success) {
                toast.success('Product deleted successfully')
                setProducts(products.filter(p => p.id !== productId))
            } else {
                toast.error(data.error || 'Failed to delete product')
            }
        } catch (error) {
            console.error('Failed to delete product:', error)
            toast.error('Failed to delete product')
        }
    }

    const categories = ['all', ...new Set(products.map(p => p.category))]
    const sellers = ['all', ...new Set(products.map(p => p.sellerEmail).filter(Boolean))]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-base-content/70">Loading products...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">All Products</h1>
                <p className="text-base-content/70">Manage all products in the system</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Package className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{products.length}</p>
                            <p className="text-sm text-base-content/70">Total Products</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                            <Package className="w-6 h-6 text-success" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {products.filter(p => (p.stock || 0) > 0).length}
                            </p>
                            <p className="text-sm text-base-content/70">In Stock</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                            <Package className="w-6 h-6 text-warning" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {products.filter(p => (p.stock || 0) < 5).length}
                            </p>
                            <p className="text-sm text-base-content/70">Low Stock</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
                            <Package className="w-6 h-6 text-info" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{categories.length - 1}</p>
                            <p className="text-sm text-base-content/70">Categories</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card bg-base-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-control">
                        <div className="input">
                            <span className="">
                                <Search className="w-5 h-5" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="flex-1"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-control">
                        <select
                            className="select select-bordered"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category === 'all' ? 'All Categories' : category}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-control">
                        <select
                            className="select select-bordered"
                            value={sellerFilter}
                            onChange={(e) => setSellerFilter(e.target.value)}
                        >
                            <option value="all">All Sellers</option>
                            {sellers.filter(s => s !== 'all').map(seller => (
                                <option key={seller} value={seller}>
                                    {seller}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="card bg-base-200 overflow-x-auto">
                <table className="table table-zebra">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Seller</th>
                            <th>Rating</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => (
                            <tr key={product._id}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="w-12 h-12 rounded-lg">
                                                {product.image ? (
                                                    <Image
                                                        src={product.image}
                                                        alt={product.name}
                                                        width={48}
                                                        height={48}
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-base-300 flex items-center justify-center">
                                                        <Package className="w-6 h-6 text-base-content/30" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-bold">{product.name}</div>
                                            <div className="text-xs opacity-50">{product.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className="badge badge-outline capitalize">
                                        {product.category}
                                    </span>
                                </td>
                                <td className="font-bold text-primary">${product.price.toFixed(2)}</td>
                                <td>
                                    <span className={`badge ${(product.stock || 0) < 5
                                            ? 'badge-error'
                                            : 'badge-success'
                                        }`}>
                                        {product.stock || 0}
                                    </span>
                                </td>
                                <td className="text-xs">{product.sellerEmail || 'N/A'}</td>
                                <td>
                                    <div className="flex items-center gap-1">
                                        <span className="text-warning">★</span>
                                        <span>{(product.rating || 0).toFixed(1)}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="btn btn-sm btn-ghost text-error"
                                            title="Delete Product"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-base-content/70">No products found</p>
                    </div>
                )}
            </div>
        </div>
    )
}
