// app/dashboard/admin/orders/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ShoppingCart, Package, Truck, CheckCircle, XCircle, Eye, Filter,
    Trash2, X, MapPin, Phone, Mail, CreditCard, Calendar, FileText,
    TruckIcon, Navigation, Clock, MapPinned
} from 'lucide-react'
import DataTable from '@/app/dashboard/components/DataTable'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import Invoice from '@/components/Invoice'
import toast from 'react-hot-toast'

export default function AdminOrdersPage() {
    const { user, userData } = useFirebaseAuth()
    const [orders, setOrders] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false)
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
    const [isDeletingOrder, setIsDeletingOrder] = useState(null)

    useEffect(() => {
        if (user && userData) {
            fetchOrders()
        }
    }, [user, userData])

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`)
            const data = await response.json()

            if (data.success) {
                setOrders(data.orders || [])
            } else {
                toast.error('Failed to fetch orders')
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
            toast.error('Failed to load orders')
        } finally {
            setIsLoading(false)
        }
    }

    const handleViewDetails = (order) => {
        setSelectedOrder(order)
        setIsDetailsModalOpen(true)
    }

    const handleViewTracking = (order) => {
        setSelectedOrder(order)
        setIsTrackingModalOpen(true)
    }

    const handleViewInvoice = (order) => {
        setSelectedOrder(order)
        setIsInvoiceModalOpen(true)
    }

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            return
        }

        setIsDeletingOrder(orderId)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`, {
                method: 'DELETE'
            })

            const data = await response.json()

            if (data.success || response.ok) {
                toast.success('Order deleted successfully')
                setOrders(orders.filter(o => o.orderId !== orderId))
            } else {
                toast.error(data.error || 'Failed to delete order')
            }
        } catch (error) {
            console.error('Error deleting order:', error)
            toast.error('Failed to delete order')
        } finally {
            setIsDeletingOrder(null)
        }
    }

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            })

            const data = await response.json()

            if (data.success) {
                toast.success(`Order status updated to ${newStatus}`)
                fetchOrders()
                if (selectedOrder?.orderId === orderId) {
                    setSelectedOrder(data.order)
                }
            } else {
                toast.error(data.error || 'Failed to update status')
            }
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error('Failed to update status')
        }
    }

    const getStatusBadge = (status) => {
        const badges = {
            processing: { class: 'badge-info', text: 'Processing' },
            confirmed: { class: 'badge-primary', text: 'Confirmed' },
            assigned: { class: 'badge-warning', text: 'Assigned' },
            collected: { class: 'badge-info', text: 'Collected' },
            in_transit: { class: 'badge-primary', text: 'In Transit' },
            out_for_delivery: { class: 'badge-secondary', text: 'Out for Delivery' },
            shipped: { class: 'badge-warning', text: 'Shipped' },
            delivered: { class: 'badge-success', text: 'Delivered' },
            cancelled: { class: 'badge-error', text: 'Cancelled' }
        }
        return badges[status] || { class: 'badge-ghost', text: status }
    }

    const getTimelineSteps = (order) => {
        const allSteps = [
            { status: 'processing', label: 'Order Placed', icon: ShoppingCart },
            { status: 'confirmed', label: 'Confirmed', icon: CheckCircle },
            { status: 'assigned', label: 'Assigned to Rider', icon: TruckIcon },
            { status: 'shipped', label: 'Shipped', icon: Package },
            { status: 'in_transit', label: 'In Transit', icon: Truck },
            { status: 'out_for_delivery', label: 'Out for Delivery', icon: Navigation },
            { status: 'delivered', label: 'Delivered', icon: CheckCircle }
        ]

        const currentStatusIndex = allSteps.findIndex(step => step.status === order.status)

        return allSteps.map((step, index) => ({
            ...step,
            completed: index <= currentStatusIndex,
            current: index === currentStatusIndex
        }))
    }

    const columns = [
        {
            header: 'Order ID',
            accessor: 'orderId',
            render: (row) => (
                <div className="font-mono text-sm font-semibold text-primary">
                    #{row.orderId}
                </div>
            )
        },
        {
            header: 'Customer',
            accessor: 'buyerInfo',
            render: (row) => (
                <div>
                    <div className="font-semibold">{row.buyerInfo?.name || 'N/A'}</div>
                    <div className="text-xs text-base-content/60">{row.buyerInfo?.email}</div>
                </div>
            )
        },
        {
            header: 'Items',
            accessor: 'items',
            render: (row) => (
                <div className="text-sm">
                    {row.items?.length || 0} item(s)
                </div>
            )
        },
        {
            header: 'Amount',
            accessor: 'total',
            render: (row) => (
                <div className="font-bold text-success">
                    ${row.total?.toFixed(2)}
                </div>
            )
        },
        {
            header: 'Payment',
            accessor: 'paymentStatus',
            render: (row) => (
                <span className={`badge ${row.paymentStatus === 'completed' ? 'badge-success' :
                    row.paymentStatus === 'pending' ? 'badge-warning' :
                        'badge-error'
                    }`}>
                    {row.paymentStatus}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => {
                const badge = getStatusBadge(row.status)
                return <span className={`badge ${badge.class}`}>{badge.text}</span>
            }
        },
        {
            header: 'Rider',
            accessor: 'riderInfo',
            render: (row) => (
                <div className="text-sm">
                    {row.riderInfo?.name || (
                        <span className="text-base-content/40">Not assigned</span>
                    )}
                </div>
            )
        },
        {
            header: 'Date',
            accessor: 'createdAt',
            render: (row) => (
                <div className="text-sm">
                    {new Date(row.createdAt).toLocaleDateString()}
                </div>
            )
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleViewDetails(row)}
                        className="btn btn-sm btn-info btn-outline"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleViewTracking(row)}
                        className="btn btn-sm btn-accent btn-outline"
                        title="Track Order"
                    >
                        <Truck className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDeleteOrder(row.orderId)}
                        className="btn btn-sm btn-outline text-error hover:bg-error hover:text-error-content"
                        title="Delete Order"
                        disabled={isDeletingOrder === row.orderId}
                    >
                        {isDeletingOrder === row.orderId ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                    </button>
                </div>
            )
        }
    ]

    const filteredOrders = orders.filter(order => {
        if (statusFilter === 'all') return true
        return order.status === statusFilter
    })

    const statusCounts = {
        all: orders.length,
        processing: orders.filter(o => o.status === 'processing').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        assigned: orders.filter(o => o.status === 'assigned').length,
        in_transit: orders.filter(o => ['collected', 'in_transit', 'out_for_delivery', 'shipped'].includes(o.status)).length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
                        <ShoppingCart className="w-8 h-8 text-primary" />
                        All Orders
                    </h1>
                    <p className="text-base-content/60 mt-1">
                        View and manage all customer orders
                    </p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="btn btn-primary"
                >
                    Refresh Orders
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="card bg-base-100 shadow-xl p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{statusCounts.all}</div>
                        <div className="text-xs text-base-content/60">Total Orders</div>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-xl p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-info">{statusCounts.processing}</div>
                        <div className="text-xs text-base-content/60">Processing</div>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-xl p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-warning">{statusCounts.assigned}</div>
                        <div className="text-xs text-base-content/60">Assigned</div>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-xl p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{statusCounts.in_transit}</div>
                        <div className="text-xs text-base-content/60">In Transit</div>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-xl p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-success">{statusCounts.delivered}</div>
                        <div className="text-xs text-base-content/60">Delivered</div>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-xl p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-error">{statusCounts.cancelled}</div>
                        <div className="text-xs text-base-content/60">Cancelled</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 overflow-x-auto pb-2">
                {[
                    { value: 'all', label: 'All Orders' },
                    { value: 'processing', label: 'Processing' },
                    { value: 'confirmed', label: 'Confirmed' },
                    { value: 'assigned', label: 'Assigned' },
                    { value: 'in_transit', label: 'In Transit' },
                    { value: 'delivered', label: 'Delivered' },
                    { value: 'cancelled', label: 'Cancelled' }
                ].map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => setStatusFilter(filter.value)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${statusFilter === filter.value
                            ? 'bg-linear-to-r from-primary to-secondary text-primary-content shadow-lg'
                            : 'bg-base-200 text-base-content hover:bg-base-300'
                            }`}
                    >
                        {filter.label} ({statusCounts[filter.value] || 0})
                    </button>
                ))}
            </div>

            {/* Orders Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-base-100 shadow-xl p-6"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-base-content/70">Loading orders...</p>
                        </div>
                    </div>
                ) : (
                    <DataTable
                        data={filteredOrders}
                        columns={columns}
                        itemsPerPage={10}
                        emptyMessage="No orders found"
                        EmptyIcon={ShoppingCart}
                    />
                )}
            </motion.div>

            {/* Order Details Modal */}
            <AnimatePresence>
                {isDetailsModalOpen && selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setIsDetailsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-base-100 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="bg-linear-to-r from-primary to-secondary p-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-primary-content">Order Details</h2>
                                    <p className="text-primary-content/80 font-mono">#{selectedOrder.orderId}</p>
                                </div>
                                <button
                                    onClick={() => setIsDetailsModalOpen(false)}
                                    className="btn btn-sm btn-ghost text-primary-content hover:bg-white/20"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-6 overflow-y-auto flex-1">
                                {/* Order Status */}
                                <div className="card bg-base-200 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Package className="w-5 h-5 text-primary" />
                                            Order Status
                                        </h3>
                                        <span className={`badge ${getStatusBadge(selectedOrder.status).class} badge-lg`}>
                                            {getStatusBadge(selectedOrder.status).text}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-base-content/60">Payment:</span>
                                            <span className={`ml-2 badge ${selectedOrder.paymentStatus === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                                                {selectedOrder.paymentStatus}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-base-content/60">Tracking ID:</span>
                                            <span className="ml-2 font-mono font-semibold">{selectedOrder.trackingId}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Information */}
                                <div className="card bg-base-200 p-4">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <Mail className="w-5 h-5 text-primary" />
                                        Customer Information
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-start gap-2">
                                            <span className="text-base-content/60 w-24">Name:</span>
                                            <span className="font-semibold">{selectedOrder.buyerInfo?.name}</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-base-content/60 w-24">Email:</span>
                                            <span>{selectedOrder.buyerInfo?.email}</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-base-content/60 w-24">Phone:</span>
                                            <span>{selectedOrder.buyerInfo?.phoneNumber || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                {selectedOrder.shippingAddress && (
                                    <div className="card bg-base-200 p-4">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-primary" />
                                            Shipping Address
                                        </h3>
                                        <div className="text-sm space-y-1">
                                            <p>{selectedOrder.shippingAddress.street}</p>
                                            <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.district}</p>
                                            <p>{selectedOrder.shippingAddress.division} - {selectedOrder.shippingAddress.zipCode}</p>
                                            <p>{selectedOrder.shippingAddress.country}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Order Items */}
                                <div className="card bg-base-200 p-4">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <ShoppingCart className="w-5 h-5 text-primary" />
                                        Order Items ({selectedOrder.items?.length || 0})
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedOrder.items?.map((item, index) => (
                                            <div key={index} className="flex gap-3 bg-base-100 p-3 rounded-lg">
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-16 h-16 object-cover rounded-lg"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-semibold">{item.name}</h4>
                                                    <div className="text-sm text-base-content/60 mt-1">
                                                        Quantity: {item.quantity} × ${item.price?.toFixed(2)}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-success">
                                                        ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Rider Information */}
                                {selectedOrder.riderInfo?.name && (
                                    <div className="card bg-base-200 p-4">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <Truck className="w-5 h-5 text-primary" />
                                            Rider Information
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-start gap-2">
                                                <span className="text-base-content/60 w-24">Name:</span>
                                                <span className="font-semibold">{selectedOrder.riderInfo.name}</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-base-content/60 w-24">Phone:</span>
                                                <span>{selectedOrder.riderInfo.phone}</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-base-content/60 w-24">Vehicle:</span>
                                                <span>{selectedOrder.riderInfo.vehicleType} - {selectedOrder.riderInfo.vehicleNumber}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Order Summary */}
                                <div className="card bg-base-200 p-4">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-primary" />
                                        Order Summary
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-base-content/60">Subtotal:</span>
                                            <span className="font-semibold">${selectedOrder.subtotal?.toFixed(2) || '0.00'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-base-content/60">Shipping:</span>
                                            <span className="font-semibold">${selectedOrder.shipping?.toFixed(2) || '0.00'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-base-content/60">Tax:</span>
                                            <span className="font-semibold">${selectedOrder.tax?.toFixed(2) || '0.00'}</span>
                                        </div>
                                        <div className="divider my-2"></div>
                                        <div className="flex justify-between text-lg">
                                            <span className="font-bold">Total:</span>
                                            <span className="font-bold text-success">${selectedOrder.total?.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="card bg-base-200 p-4">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-primary" />
                                        Timeline
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-base-content/60">Order Placed:</span>
                                            <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                                        </div>
                                        {selectedOrder.updatedAt && (
                                            <div className="flex justify-between">
                                                <span className="text-base-content/60">Last Updated:</span>
                                                <span>{new Date(selectedOrder.updatedAt).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 bg-base-200 border-t border-base-300 flex gap-3">
                                <button
                                    onClick={() => {
                                        setIsDetailsModalOpen(false)
                                        handleViewTracking(selectedOrder)
                                    }}
                                    className="btn btn-primary flex-1"
                                >
                                    <Truck className="w-4 h-4 mr-2" />
                                    Track Order
                                </button>
                                <button
                                    onClick={() => {
                                        setIsDetailsModalOpen(false)
                                        handleDeleteOrder(selectedOrder.orderId)
                                    }}
                                    className="btn btn-error"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Track Order Modal */}
            <AnimatePresence>
                {isTrackingModalOpen && selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setIsTrackingModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-base-100 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="bg-linear-to-r from-primary to-secondary p-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-primary-content">Track Order</h2>
                                    <p className="text-primary-content/80 font-mono">Tracking ID: {selectedOrder.trackingId}</p>
                                </div>
                                <button
                                    onClick={() => setIsTrackingModalOpen(false)}
                                    className="btn btn-sm btn-ghost text-primary-content hover:bg-white/20"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-6 overflow-y-auto flex-1">
                                {/* Order Info Banner */}
                                <div className="bg-linear-to-r from-primary/10 to-secondary/10 border-2 border-primary/20 rounded-xl p-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                        <div>
                                            <div className="text-xs text-base-content/60 mb-1">Order ID</div>
                                            <div className="font-bold text-sm">#{selectedOrder.orderId}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-base-content/60 mb-1">Status</div>
                                            <span className={`badge ${getStatusBadge(selectedOrder.status).class}`}>
                                                {getStatusBadge(selectedOrder.status).text}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="text-xs text-base-content/60 mb-1">Items</div>
                                            <div className="font-bold text-sm">{selectedOrder.items?.length || 0}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-base-content/60 mb-1">Total</div>
                                            <div className="font-bold text-sm text-success">${selectedOrder.total?.toFixed(2)}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="space-y-4">
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <MapPinned className="w-5 h-5 text-primary" />
                                        Delivery Progress
                                    </h3>

                                    <div className="relative">
                                        {getTimelineSteps(selectedOrder).map((step, index) => (
                                            <div key={step.status} className="flex gap-4 pb-8 last:pb-0">
                                                {/* Timeline Line */}
                                                {index < getTimelineSteps(selectedOrder).length - 1 && (
                                                    <div className={`absolute left-6 top-12 w-0.5 h-full ${step.completed ? 'bg-success' : 'bg-base-300'}`} />
                                                )}

                                                {/* Icon */}
                                                <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${step.current
                                                    ? 'bg-primary text-primary-content ring-4 ring-primary/20'
                                                    : step.completed
                                                        ? 'bg-success text-success-content'
                                                        : 'bg-base-300 text-base-content/40'
                                                    }`}>
                                                    <step.icon className="w-6 h-6" />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 pt-2">
                                                    <div className={`font-bold ${step.current ? 'text-primary' : step.completed ? 'text-success' : 'text-base-content/40'}`}>
                                                        {step.label}
                                                    </div>
                                                    {step.completed && (
                                                        <div className="text-sm text-base-content/60 mt-1">
                                                            <Clock className="w-3 h-3 inline mr-1" />
                                                            {new Date(selectedOrder.createdAt).toLocaleString()}
                                                        </div>
                                                    )}
                                                    {step.current && (
                                                        <div className="text-sm text-primary mt-1">
                                                            Current Status
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Rider Info */}
                                {selectedOrder.riderInfo?.name && (
                                    <div className="card bg-base-200 p-4">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <Truck className="w-5 h-5 text-primary" />
                                            Delivery Rider
                                        </h3>
                                        <div className="flex items-center gap-4">
                                            <div className="avatar placeholder">
                                                <div className="bg-primary text-primary-content rounded-full w-12">
                                                    <span className="text-xl">{selectedOrder.riderInfo.name.charAt(0)}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold">{selectedOrder.riderInfo.name}</div>
                                                <div className="text-sm text-base-content/60">
                                                    <Phone className="w-3 h-3 inline mr-1" />
                                                    {selectedOrder.riderInfo.phone}
                                                </div>
                                                <div className="text-sm text-base-content/60">
                                                    {selectedOrder.riderInfo.vehicleType} - {selectedOrder.riderInfo.vehicleNumber}
                                                </div>
                                            </div>
                                            {selectedOrder.riderInfo.rating && (
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-warning">★ {selectedOrder.riderInfo.rating}</div>
                                                    <div className="text-xs text-base-content/60">Rating</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Delivery Address */}
                                {selectedOrder.shippingAddress && (
                                    <div className="card bg-base-200 p-4">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-primary" />
                                            Delivery Address
                                        </h3>
                                        <div className="text-sm space-y-1">
                                            <p className="font-semibold">{selectedOrder.buyerInfo?.name}</p>
                                            <p>{selectedOrder.shippingAddress.street}</p>
                                            <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.district}</p>
                                            <p>{selectedOrder.shippingAddress.division} - {selectedOrder.shippingAddress.zipCode}</p>
                                            <p>{selectedOrder.shippingAddress.country}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 bg-base-200 border-t border-base-300 flex gap-3">
                                <button
                                    onClick={() => {
                                        setIsTrackingModalOpen(false)
                                        handleViewDetails(selectedOrder)
                                    }}
                                    className="btn btn-primary flex-1"
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
