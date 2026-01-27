// app/orders/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Truck, CheckCircle, XCircle, Eye, MapPin, Calendar, CreditCard, X, Search, ChevronLeft, ChevronRight, FileText, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Invoice from '@/components/Invoice'
import { getCurrentUser } from '@/lib/firebase/auth'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Loading from '@/app/loading'

export default function OrdersPage() {
    const router = useRouter()
    const [orders, setOrders] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showInvoice, setShowInvoice] = useState(false)
    const [user, setUser] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const itemsPerPage = 10

    useEffect(() => {
        const currentUser = getCurrentUser()
        if (!currentUser) {
            toast.error('Please login to view your orders')
            router.push('/login')
            return
        }
        setUser(currentUser)
        fetchOrders(currentUser.uid)
    }, [router])

    const fetchOrders = async (userId) => {
        try {
            setIsLoading(true)
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/user/${userId}`
            )
            const data = await response.json()

            if (data.success) {
                // Format orders for display
                const formattedOrders = data.orders.map(order => ({
                    ...order,
                    id: order.orderId,
                    date: new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    }),
                    time: new Date(order.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                }))
                setOrders(formattedOrders)
            } else {
                toast.error('Failed to load orders')
                setOrders([])
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
            toast.error('Failed to load orders')
            setOrders([])
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        const badges = {
            'processing': { class: 'badge-warning', label: 'Processing', icon: Package },
            'confirmed': { class: 'badge-info', label: 'Confirmed', icon: CheckCircle },
            'shipped': { class: 'badge-primary', label: 'Shipped', icon: Truck },
            'delivered': { class: 'badge-success', label: 'Delivered', icon: CheckCircle },
            'cancelled': { class: 'badge-error', label: 'Cancelled', icon: XCircle }
        }
        const badge = badges[status] || badges.processing
        const Icon = badge.icon

        return (
            <span className={`badge ${badge.class} gap-1`}>
                <Icon className="w-3 h-3" />
                {badge.label}
            </span>
        )
    }

    const getPaymentBadge = (paymentStatus) => {
        if (paymentStatus === 'completed') {
            return (
                <span className="badge badge-success badge-sm">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Paid
                </span>
            )
        } else if (paymentStatus === 'pending') {
            return (
                <span className="badge badge-warning badge-sm">
                    <Package className="w-3 h-3 mr-1" />
                    Pending
                </span>
            )
        } else {
            return (
                <span className="badge badge-error badge-sm">
                    <XCircle className="w-3 h-3 mr-1" />
                    Failed
                </span>
            )
        }
    }

    // Calculate status counts dynamically from orders
    const statusCounts = {
        all: orders.length,
        processing: orders.filter(o => o.status === 'processing').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
    }

    const statusFilters = [
        { value: 'all', label: 'All Orders', icon: Package, count: statusCounts.all },
        { value: 'processing', label: 'Processing', icon: Package, count: statusCounts.processing },
        { value: 'confirmed', label: 'Confirmed', icon: CheckCircle, count: statusCounts.confirmed },
        { value: 'shipped', label: 'Shipped', icon: Truck, count: statusCounts.shipped },
        { value: 'delivered', label: 'Delivered', icon: CheckCircle, count: statusCounts.delivered },
        { value: 'cancelled', label: 'Cancelled', icon: XCircle, count: statusCounts.cancelled },
    ]

    // Get current filter label
    const currentFilter = statusFilters.find(f => f.value === selectedStatus)

    // Filter and search
    const filteredOrders = orders.filter(order => {
        const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus
        const matchesSearch = searchTerm === '' ||
            order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.trackingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
        return matchesStatus && matchesSearch
    })

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentOrders = filteredOrders.slice(startIndex, endIndex)

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    const handleViewOrder = (order) => {
        setSelectedOrder(order)
        setShowInvoice(false)
    }

    const handleViewInvoice = (order) => {
        setSelectedOrder(order)
        setShowInvoice(true)
    }

    const handleStatusChange = (status) => {
        setSelectedStatus(status)
        setCurrentPage(1)
        setIsDropdownOpen(false)
    }

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    }

    if (isLoading) {
        return <Loading />
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-screen">
                <div className="section-padding">
                    <div className="container-custom">
                        <motion.div {...fadeInUp} className="text-center max-w-md mx-auto">
                            <div className="w-32 h-32 mx-auto mb-6 bg-base-200 rounded-full flex items-center justify-center">
                                <Package className="w-16 h-16 text-base-content/30" />
                            </div>
                            <h1 className="text-4xl font-bold text-base-content mb-4">No Orders Yet</h1>
                            <p className="text-base-content/70 mb-8 text-lg">
                                You haven&apos;t placed any orders yet. Start shopping to see your orders here!
                            </p>
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-2 bg-linear-to-r from-primary to-secondary text-primary-content px-8 py-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                Start Shopping
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <div className="section-padding">
                <div className="container-custom">
                    {/* Header */}
                    <motion.div {...fadeInUp} className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-2">
                            My Orders
                        </h1>
                        <p className="text-base-content/70">
                            Track and manage your orders ({orders.length} total)
                        </p>
                    </motion.div>

                    {/* Filters and Search */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-6"
                    >
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                            {/* Left side - Title or breadcrumb (optional) */}
                            <div className="text-sm text-base-content/70">
                                Showing {filteredOrders.length} {selectedStatus !== 'all' ? selectedStatus : ''} order{filteredOrders.length !== 1 ? 's' : ''}
                            </div>

                            {/* Right side - Search and Dropdown */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                {/* Search Bar */}
                                <div className="relative w-full sm:w-80">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/50" />
                                    <input
                                        type="text"
                                        placeholder="Search orders..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value)
                                            setCurrentPage(1)
                                        }}
                                        className="input input-bordered w-full pl-10 pr-4"
                                    />
                                </div>

                                {/* Status Dropdown */}
                                <div className="dropdown dropdown-end w-full sm:w-auto">
                                    <button
                                        tabIndex={0}
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="btn btn-outline w-full sm:w-auto justify-between min-w-50"
                                    >
                                        <span className="flex items-center gap-2">
                                            {currentFilter && <currentFilter.icon className="w-4 h-4" />}
                                            {currentFilter?.label} ({currentFilter?.count})
                                        </span>
                                        <ChevronDown className="w-4 h-4 ml-2" />
                                    </button>
                                    {isDropdownOpen && (
                                        <ul
                                            tabIndex={0}
                                            className="dropdown-content menu p-2 shadow-xl bg-base-100 rounded-box w-64 mt-2 border border-base-300 z-10"
                                        >
                                            {statusFilters.map((filter) => {
                                                const Icon = filter.icon
                                                return (
                                                    <li key={filter.value}>
                                                        <button
                                                            onClick={() => handleStatusChange(filter.value)}
                                                            className={`flex items-center justify-between ${selectedStatus === filter.value
                                                                    ? 'bg-linear-to-r from-primary to-secondary text-primary-content'
                                                                    : 'hover:bg-base-200'
                                                                }`}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <Icon className="w-4 h-4" />
                                                                {filter.label}
                                                            </span>
                                                            <span className={`badge ${selectedStatus === filter.value
                                                                    ? 'badge-neutral'
                                                                    : 'badge-ghost'
                                                                }`}>
                                                                {filter.count}
                                                            </span>
                                                        </button>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Orders Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card bg-base-100 shadow-xl overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                    <tr className="bg-base-200">
                                        <th className="font-bold">Order ID</th>
                                        <th className="font-bold">Date & Time</th>
                                        <th className="font-bold">Items</th>
                                        <th className="font-bold">Total</th>
                                        <th className="font-bold">Payment</th>
                                        <th className="font-bold">Status</th>
                                        <th className="font-bold text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-12">
                                                <Package className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
                                                <p className="text-base-content/70 text-lg">
                                                    No {selectedStatus !== 'all' ? selectedStatus : ''} orders found
                                                    {searchTerm && ` matching "${searchTerm}"`}
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        currentOrders.map((order, index) => (
                                            <motion.tr
                                                key={order._id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="hover:bg-base-200/50 transition-colors"
                                            >
                                                {/* Order ID */}
                                                <td>
                                                    <div>
                                                        <div className="font-bold text-primary">
                                                            #{order.orderId}
                                                        </div>
                                                        {order.trackingId && (
                                                            <div className="text-xs text-base-content/60 font-mono">
                                                                {order.trackingId}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Date & Time */}
                                                <td>
                                                    <div>
                                                        <div className="font-semibold flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {order.date}
                                                        </div>
                                                        <div className="text-xs text-base-content/60">
                                                            {order.time}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Items */}
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <div className="avatar-group -space-x-3">
                                                            {order.items.slice(0, 3).map((item, i) => (
                                                                <div key={i} className="avatar">
                                                                    <div className="w-8 h-8 rounded-lg ring ring-base-100">
                                                                        <Image
                                                                            src={item.image}
                                                                            alt={item.name}
                                                                            width={100}
                                                                            height={100}
                                                                            className="object-cover"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <span className="font-semibold">
                                                            {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Total */}
                                                <td>
                                                    <div className="font-bold text-lg text-success">
                                                        ${order.total.toFixed(2)}
                                                    </div>
                                                    <div className="text-xs text-base-content/60">
                                                        {order.paymentMethod}
                                                    </div>
                                                </td>

                                                {/* Payment Status */}
                                                <td>
                                                    {getPaymentBadge(order.paymentStatus)}
                                                </td>

                                                {/* Order Status */}
                                                <td>
                                                    {getStatusBadge(order.status)}
                                                </td>

                                                {/* Actions */}
                                                <td>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleViewOrder(order)}
                                                            className="btn btn-sm btn-outline tooltip tooltip-left"
                                                            data-tip="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleViewInvoice(order)}
                                                            className="btn btn-sm btn-outline btn-info tooltip tooltip-left"
                                                            data-tip="View Invoice"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination - Only show if more than itemsPerPage */}
                        {filteredOrders.length > itemsPerPage && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-base-300">
                                {/* Info */}
                                <div className="text-sm text-base-content/70">
                                    Showing <span className="font-semibold text-base-content">{startIndex + 1}</span> to{' '}
                                    <span className="font-semibold text-base-content">{Math.min(endIndex, filteredOrders.length)}</span> of{' '}
                                    <span className="font-semibold text-base-content">{filteredOrders.length}</span> orders
                                </div>

                                {/* Pagination Controls */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="btn btn-sm btn-ghost disabled:opacity-50"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum
                                            if (totalPages <= 5) {
                                                pageNum = i + 1
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i
                                            } else {
                                                pageNum = currentPage - 2 + i
                                            }
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => goToPage(pageNum)}
                                                    className={`btn btn-sm ${pageNum === currentPage ? 'btn-primary' : 'btn-ghost'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    <button
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="btn btn-sm btn-ghost disabled:opacity-50"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Order Details/Invoice Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedOrder(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-base-100 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        >
                            {/* Modal Header - Simple Clean Design */}
                            <div className="sticky top-0 bg-base-200 p-6 flex items-center justify-between z-10 border-b border-base-300">
                                <div>
                                    <h2 className="text-2xl font-bold text-base-content">
                                        {showInvoice ? 'Invoice' : 'Order Details'}
                                    </h2>
                                    <p className="text-base-content/60 text-sm">
                                        Order #{selectedOrder.orderId}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="btn btn-circle btn-sm btn-ghost hover:bg-base-300"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6">
                                {showInvoice ? (
                                    <Invoice order={selectedOrder} />
                                ) : (
                                    <div className="space-y-6">
                                        {/* Order Info */}
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="card bg-base-200 p-4">
                                                <h3 className="font-bold text-base-content mb-3 flex items-center gap-2">
                                                    <Package className="w-5 h-5 text-primary" />
                                                    Order Information
                                                </h3>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-base-content/70">Status:</span>
                                                        {getStatusBadge(selectedOrder.status)}
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-base-content/70">Payment:</span>
                                                        {getPaymentBadge(selectedOrder.paymentStatus)}
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-base-content/70">Date:</span>
                                                        <span className="font-semibold">{selectedOrder.date} {selectedOrder.time}</span>
                                                    </div>
                                                    {selectedOrder.trackingId && (
                                                        <div className="flex justify-between">
                                                            <span className="text-base-content/70">Tracking:</span>
                                                            <span className="font-mono text-xs">{selectedOrder.trackingId}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="card bg-base-200 p-4">
                                                <h3 className="font-bold text-base-content mb-3 flex items-center gap-2">
                                                    <MapPin className="w-5 h-5 text-primary" />
                                                    Shipping Address
                                                </h3>
                                                <div className="text-sm text-base-content/70">
                                                    {selectedOrder.shippingAddress.street}<br />
                                                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.district}<br />
                                                    {selectedOrder.shippingAddress.division} {selectedOrder.shippingAddress.zipCode}<br />
                                                    {selectedOrder.shippingAddress.country}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="card bg-base-200 p-4">
                                            <h3 className="font-bold text-base-content mb-4">Order Items</h3>
                                            <div className="space-y-4">
                                                {selectedOrder.items.map((item, i) => (
                                                    <div key={i} className="flex gap-4 items-center pb-4 border-b border-base-300 last:border-0">
                                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-base-300 shrink-0">
                                                            <Image
                                                                src={item.image}
                                                                alt={item.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold">{item.name}</h4>
                                                            <p className="text-sm text-base-content/60">
                                                                Qty: {item.quantity} × ${item.price.toFixed(2)}
                                                            </p>
                                                        </div>
                                                        <div className="font-bold text-success">
                                                            ${(item.price * item.quantity).toFixed(2)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Total */}
                                            <div className="mt-4 pt-4 border-t border-base-300 flex justify-between items-center">
                                                <span className="font-bold text-lg">Total:</span>
                                                <span className="font-bold text-2xl text-success">
                                                    ${selectedOrder.total.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setShowInvoice(true)}
                                                className="btn btn-primary flex-1"
                                            >
                                                <FileText className="w-4 h-4" />
                                                View Invoice
                                            </button>
                                            <Link
                                                href={`/orders/${selectedOrder.orderId}`}
                                                className="btn btn-secondary flex-1"
                                            >
                                                Track Order
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
