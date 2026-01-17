'use client'

import { useState, useEffect } from 'react'
import { Download, FileText, Users, Package, DollarSign, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminReports() {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState({
        users: [],
        products: [],
        orders: [],
        payments: []
    })
    const [reportType, setReportType] = useState('users')
    const [dateRange, setDateRange] = useState('all')

    useEffect(() => {
        fetchAllData()
    }, [])

    const fetchAllData = async () => {
        try {
            setLoading(true)

            const [usersRes, productsRes, ordersRes, paymentsRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/users`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`)
            ])

            const usersData = await usersRes.json()
            const productsData = await productsRes.json()
            const ordersData = await ordersRes.json()
            const paymentsData = await paymentsRes.json()

            setData({
                users: usersData.users || [],
                products: productsData.products || [],
                orders: ordersData.orders || [],
                payments: paymentsData.payments || []
            })
        } catch (error) {
            console.error('Failed to fetch data:', error)
            toast.error('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const filterDataByDate = (items, dateField = 'createdAt') => {
        if (dateRange === 'all') return items

        const now = new Date()
        let startDate = new Date()

        switch (dateRange) {
            case '7days':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                break
            case '30days':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                break
            case '90days':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
                break
        }

        return items.filter(item => new Date(item[dateField]) >= startDate)
    }

    const downloadExcel = (reportData, filename) => {
        // Convert to CSV (simple Excel format)
        const headers = Object.keys(reportData[0] || {})
        const csvContent = [
            headers.join(','),
            ...reportData.map(row =>
                headers.map(header => {
                    const value = row[header]
                    // Escape commas and quotes
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`
                    }
                    return value
                }).join(',')
            )
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)

        link.setAttribute('href', url)
        link.setAttribute('download', `${filename}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success(`${filename} downloaded successfully`)
    }

    const generateUserReport = () => {
        const filteredUsers = filterDataByDate(data.users)

        const reportData = filteredUsers.map(user => {
            // Calculate user's orders and earnings
            const userOrders = data.orders.filter(o => o.userId === user.uid)
            const totalOrders = userOrders.length
            const totalSpent = userOrders
                .filter(o => o.paymentStatus === 'completed')
                .reduce((sum, o) => sum + o.total, 0)

            // Calculate products added (if seller)
            const productsAdded = user.role === 'seller'
                ? data.products.filter(p => p.sellerEmail === user.email).length
                : 0

            // Calculate earnings (if seller)
            const sellerProducts = data.products
                .filter(p => p.sellerEmail === user.email)
                .map(p => p.id)

            const earnings = user.role === 'seller'
                ? data.orders
                    .filter(o => o.paymentStatus === 'completed')
                    .reduce((sum, order) => {
                        const sellerItems = order.items.filter(item => sellerProducts.includes(item.id))
                        return sum + sellerItems.reduce((s, item) => s + (item.price * item.quantity), 0)
                    }, 0)
                : 0

            return {
                'User ID': user.uid,
                'Name': user.displayName || 'N/A',
                'Email': user.email,
                'Role': user.role,
                'Provider': user.provider,
                'Total Orders': totalOrders,
                'Total Spent': `$${totalSpent.toFixed(2)}`,
                'Products Added': productsAdded,
                'Earnings': user.role === 'seller' ? `$${earnings.toFixed(2)}` : 'N/A',
                'Activity Level': totalOrders > 10 ? 'High' : totalOrders > 5 ? 'Medium' : 'Low',
                'Joined Date': new Date(user.createdAt).toLocaleDateString()
            }
        })

        downloadExcel(reportData, `user-report-${Date.now()}`)
    }

    const generateProductReport = () => {
        const filteredProducts = filterDataByDate(data.products)

        const reportData = filteredProducts.map(product => {
            // Calculate orders for this product
            const productOrders = data.orders.filter(order =>
                order.items.some(item => item.id === product.id)
            )

            const totalOrdered = productOrders.reduce((sum, order) => {
                const item = order.items.find(i => i.id === product.id)
                return sum + (item?.quantity || 0)
            }, 0)

            const totalRevenue = productOrders.reduce((sum, order) => {
                const item = order.items.find(i => i.id === product.id)
                return sum + ((item?.price || 0) * (item?.quantity || 0))
            }, 0)

            return {
                'Product ID': product.id,
                'Name': product.name,
                'Category': product.category,
                'Price': `$${product.price.toFixed(2)}`,
                'Stock': product.stock || 0,
                'Rating': product.rating || 0,
                'Total Ordered': totalOrdered,
                'Total Revenue': `$${totalRevenue.toFixed(2)}`,
                'Seller': product.sellerEmail || 'N/A',
                'Added Date': new Date(product.createdAt || Date.now()).toLocaleDateString()
            }
        })

        downloadExcel(reportData, `product-report-${Date.now()}`)
    }

    const generateOrderReport = () => {
        const filteredOrders = filterDataByDate(data.orders)

        const reportData = filteredOrders.map(order => ({
            'Order ID': order.orderId,
            'User ID': order.userId,
            'Total Items': order.items.length,
            'Subtotal': `$${order.subtotal?.toFixed(2) || '0.00'}`,
            'Tax': `$${order.tax?.toFixed(2) || '0.00'}`,
            'Total': `$${order.total.toFixed(2)}`,
            'Payment Method': order.paymentMethod,
            'Payment Status': order.paymentStatus,
            'Order Status': order.status,
            'Shipping City': order.shippingAddress?.city || 'N/A',
            'Order Date': new Date(order.createdAt).toLocaleDateString()
        }))

        downloadExcel(reportData, `order-report-${Date.now()}`)
    }

    const generatePaymentReport = () => {
        const filteredPayments = filterDataByDate(data.payments)

        const reportData = filteredPayments.map(payment => ({
            'Transaction ID': payment.transactionId,
            'Order ID': payment.orderId,
            'Amount': `$${payment.amount.toFixed(2)}`,
            'Currency': payment.currency || 'USD',
            'Payment Method': payment.paymentMethod,
            'Status': payment.status,
            'Date': new Date(payment.createdAt).toLocaleDateString()
        }))

        downloadExcel(reportData, `payment-report-${Date.now()}`)
    }

    const generateSellerReport = () => {
        const sellers = data.users.filter(u => u.role === 'seller')

        const reportData = sellers.map(seller => {
            const sellerProducts = data.products.filter(p => p.sellerEmail === seller.email)
            const productIds = sellerProducts.map(p => p.id)

            const sellerOrders = data.orders.filter(order =>
                order.items.some(item => productIds.includes(item.id))
            )

            const earnings = sellerOrders
                .filter(o => o.paymentStatus === 'completed')
                .reduce((sum, order) => {
                    const sellerItems = order.items.filter(item => productIds.includes(item.id))
                    return sum + sellerItems.reduce((s, item) => s + (item.price * item.quantity), 0)
                }, 0)

            return {
                'Seller ID': seller.uid,
                'Name': seller.displayName,
                'Email': seller.email,
                'Products Added': sellerProducts.length,
                'Total Orders': sellerOrders.length,
                'Total Earnings': `$${earnings.toFixed(2)}`,
                'Activity Level': sellerOrders.length > 20 ? 'High' : sellerOrders.length > 10 ? 'Medium' : 'Low',
                'Joined Date': new Date(seller.createdAt).toLocaleDateString()
            }
        })

        downloadExcel(reportData, `seller-report-${Date.now()}`)
    }

    const handleGenerate = () => {
        switch (reportType) {
            case 'users':
                generateUserReport()
                break
            case 'products':
                generateProductReport()
                break
            case 'orders':
                generateOrderReport()
                break
            case 'payments':
                generatePaymentReport()
                break
            case 'sellers':
                generateSellerReport()
                break
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-base-content/70">Loading data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Reports & Exports</h1>
                <p className="text-base-content/70">Generate and download comprehensive reports</p>
            </div>

            {/* Report Configuration */}
            <div className="card bg-base-200 p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Configure Report
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Report Type */}
                    <div className="form-control gap-2">
                        <label className="label">
                            <span className="label-text font-semibold">Report Type</span>
                        </label>
                        <select
                            className="select select-bordered select-lg"
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                        >
                            <option value="users">User Report (All Users)</option>
                            <option value="sellers">Seller Performance Report</option>
                            <option value="products">Product Report</option>
                            <option value="orders">Order Report</option>
                            <option value="payments">Payment Report</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Date Range</span>
                        </label>
                        <select
                            className="select select-bordered select-lg"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option value="all">All Time</option>
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="90days">Last 90 Days</option>
                        </select>
                    </div>
                </div>

                {/* Generate Button */}
                <div className="mt-6">
                    <button
                        onClick={handleGenerate}
                        className="btn btn-primary btn-lg w-full md:w-auto"
                    >
                        <Download className="w-5 h-5" />
                        Generate & Download Excel Report
                    </button>
                </div>
            </div>

            {/* Report Previews */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="card bg-base-200 p-6 hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => { setReportType('users'); handleGenerate() }}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                        <Download className="w-5 h-5 text-base-content/50" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">User Report</h3>
                    <p className="text-sm text-base-content/70">
                        Complete user activity, orders, spending, and engagement metrics
                    </p>
                </div>

                <div className="card bg-base-200 p-6 hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => { setReportType('sellers'); handleGenerate() }}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-success" />
                        </div>
                        <Download className="w-5 h-5 text-base-content/50" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Seller Performance</h3>
                    <p className="text-sm text-base-content/70">
                        Seller products, earnings, orders, and activity levels
                    </p>
                </div>

                <div className="card bg-base-200 p-6 hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => { setReportType('products'); handleGenerate() }}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
                            <Package className="w-6 h-6 text-info" />
                        </div>
                        <Download className="w-5 h-5 text-base-content/50" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Product Report</h3>
                    <p className="text-sm text-base-content/70">
                        Product performance, sales, revenue, and inventory data
                    </p>
                </div>

                <div className="card bg-base-200 p-6 hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => { setReportType('orders'); handleGenerate() }}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-warning" />
                        </div>
                        <Download className="w-5 h-5 text-base-content/50" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Order Report</h3>
                    <p className="text-sm text-base-content/70">
                        Comprehensive order details, status, and transaction information
                    </p>
                </div>

                <div className="card bg-base-200 p-6 hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => { setReportType('payments'); handleGenerate() }}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-error/10 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-error" />
                        </div>
                        <Download className="w-5 h-5 text-base-content/50" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">Payment Report</h3>
                    <p className="text-sm text-base-content/70">
                        Payment transactions, methods, statuses, and financial data
                    </p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="card bg-base-200 p-6">
                <h2 className="text-xl font-bold mb-4">Data Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-primary">{data.users.length}</p>
                        <p className="text-sm text-base-content/70">Total Users</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-success">{data.products.length}</p>
                        <p className="text-sm text-base-content/70">Total Products</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-info">{data.orders.length}</p>
                        <p className="text-sm text-base-content/70">Total Orders</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-warning">{data.payments.length}</p>
                        <p className="text-sm text-base-content/70">Total Payments</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
