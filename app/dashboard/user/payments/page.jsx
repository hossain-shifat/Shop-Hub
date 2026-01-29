'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, CheckCircle, XCircle, Clock, Calendar, DollarSign, Search, Eye, X, Package, MapPin, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import Loading from '../../loading'

export default function UserPayments() {
    const [payments, setPayments] = useState([])
    const [filteredPayments, setFilteredPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedPayment, setSelectedPayment] = useState(null)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const { userData } = useFirebaseAuth()

    useEffect(() => {
        if (userData) {
            fetchPayments()
        }
    }, [userData])

    useEffect(() => {
        filterPayments()
    }, [searchQuery, statusFilter, payments])

    const fetchPayments = async () => {
        try {
            setLoading(true)

            // Fetch user's orders first
            const ordersRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/user/${userData.uid}`
            )
            const ordersData = await ordersRes.json()
            const orders = ordersData.orders || []

            // Fetch all payments
            const paymentsRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/payments`
            )
            const paymentsData = await paymentsRes.json()
            const allPayments = paymentsData.payments || []

            // Filter payments for user's orders
            const orderIds = orders.map(o => o.orderId)
            const userPayments = allPayments.filter(p => orderIds.includes(p.orderId))

            // Merge with order data
            const paymentsWithOrders = userPayments.map(payment => {
                const order = orders.find(o => o.orderId === payment.orderId)
                return {
                    ...payment,
                    order: order,
                    orderDate: order?.createdAt,
                    orderStatus: order?.status
                }
            })

            setPayments(paymentsWithOrders)
            setFilteredPayments(paymentsWithOrders)
        } catch (error) {
            console.error('Failed to fetch payments:', error)
            toast.error('Failed to load payments')
        } finally {
            setLoading(false)
        }
    }

    const filterPayments = () => {
        let filtered = payments

        if (statusFilter !== 'all') {
            filtered = filtered.filter(payment => payment.status === statusFilter)
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(payment =>
                payment.orderId?.toLowerCase().includes(query) ||
                payment.transactionId?.toLowerCase().includes(query)
            )
        }

        setFilteredPayments(filtered)
    }

    const handleViewDetails = (payment) => {
        setSelectedPayment(payment)
        setIsDetailsModalOpen(true)
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'succeeded':
            case 'completed':
                return 'bg-green-500/10 text-green-600 border-green-500/20'
            case 'pending':
                return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
            case 'failed':
            case 'cancelled':
                return 'bg-red-500/10 text-red-600 border-red-500/20'
            default:
                return 'bg-base-300 text-base-content border-base-300'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'succeeded':
            case 'completed':
                return <CheckCircle className="w-4 h-4" />
            case 'pending':
                return <Clock className="w-4 h-4" />
            case 'failed':
            case 'cancelled':
                return <XCircle className="w-4 h-4" />
            default:
                return <CreditCard className="w-4 h-4" />
        }
    }

    const totalPaid = payments
        .filter(p => p.status === 'succeeded' || p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0)

    const statusFilters = [
        { value: 'all', label: 'All Payments', count: payments.length },
        { value: 'succeeded', label: 'Completed', count: payments.filter(p => p.status === 'succeeded' || p.status === 'completed').length },
        { value: 'pending', label: 'Pending', count: payments.filter(p => p.status === 'pending').length },
        { value: 'failed', label: 'Failed', count: payments.filter(p => p.status === 'failed' || p.status === 'cancelled').length }
    ]

    if (loading) {
        return <Loading />
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">My Payments</h1>
                <p className="text-base-content/70">Track your payment history and transactions</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">${totalPaid.toFixed(2)}</p>
                            <p className="text-sm text-base-content/70">Total Paid</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-success" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {payments.filter(p => p.status === 'succeeded').length}
                            </p>
                            <p className="text-sm text-base-content/70">Successful</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-warning" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {payments.filter(p => p.status === 'pending').length}
                            </p>
                            <p className="text-sm text-base-content/70">Pending</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 overflow-x-auto pb-2">
                {statusFilters.map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => setStatusFilter(filter.value)}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap ${statusFilter === filter.value
                                ? 'bg-primary text-primary-content shadow-lg'
                                : 'bg-base-200 text-base-content hover:bg-base-300'
                            }`}
                    >
                        {filter.label} ({filter.count})
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="card bg-base-200 p-6">
                <div className="form-control">
                    <div className="input">
                        <span className="bg-base-100">
                            <Search className="w-5 h-5" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search by order ID or transaction ID..."
                            className=" w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Payments Table */}
            <div className="card bg-base-200 overflow-x-auto">
                <table className="table table-zebra">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Order ID</th>
                            <th>Transaction ID</th>
                            <th>Method</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPayments.map((payment) => (
                            <tr key={payment._id}>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-base-content/60" />
                                        <span className="text-sm">
                                            {new Date(payment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <span className="font-mono text-sm">{payment.orderId}</span>
                                </td>
                                <td>
                                    <span className="font-mono text-xs text-base-content/60">
                                        {payment.transactionId?.slice(0, 20)}...
                                    </span>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4" />
                                        <span className="text-sm">{payment.paymentMethod}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="font-bold text-primary">
                                        ${payment.amount.toFixed(2)}
                                    </span>
                                </td>
                                <td>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 flex items-center gap-2 w-fit ${getStatusColor(payment.status)}`}>
                                        {getStatusIcon(payment.status)}
                                        <span className="capitalize">
                                            {payment.status}
                                        </span>
                                    </span>
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleViewDetails(payment)}
                                        className="btn btn-sm btn-square btn-info"
                                        title="View Details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredPayments.length === 0 && (
                    <div className="text-center py-12">
                        <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-base-content/70">
                            {searchQuery || statusFilter !== 'all'
                                ? 'No payments found matching your filters'
                                : 'No payment history yet'}
                        </p>
                    </div>
                )}
            </div>

            {/* Payment Details Modal */}
            <AnimatePresence>
                {isDetailsModalOpen && selectedPayment && (
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
                            className="bg-base-100 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="bg-base-200 p-4 flex items-center justify-between border-b border-base-300">
                                <div>
                                    <h2 className="text-xl font-bold text-base-content">Payment Details</h2>
                                    <p className="text-base-content/60 text-sm font-mono">Transaction: {selectedPayment.transactionId?.slice(0, 20)}...</p>
                                </div>
                                <button
                                    onClick={() => setIsDetailsModalOpen(false)}
                                    className="btn btn-sm btn-square btn-ghost"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-4 space-y-4 overflow-y-auto flex-1">
                                {/* Payment Status */}
                                <div className="card bg-base-200 p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-sm flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-primary" />
                                            Payment Status
                                        </h3>
                                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 ${getStatusColor(selectedPayment.status)}`}>
                                            {getStatusIcon(selectedPayment.status)}
                                            <span className="ml-2 capitalize">{selectedPayment.status}</span>
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-base-content/60">Amount:</span>
                                            <span className="ml-2 font-bold text-primary text-sm">
                                                ${selectedPayment.amount.toFixed(2)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-base-content/60">Currency:</span>
                                            <span className="ml-2 font-semibold uppercase">{selectedPayment.currency || 'USD'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Information */}
                                <div className="card bg-base-200 p-3">
                                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-primary" />
                                        Payment Information
                                    </h3>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-base-content/60">Payment Method:</span>
                                            <span className="font-semibold">{selectedPayment.paymentMethod}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-base-content/60">Transaction ID:</span>
                                            <span className="font-mono font-semibold">{selectedPayment.transactionId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-base-content/60">Order ID:</span>
                                            <span className="font-mono font-semibold">{selectedPayment.orderId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-base-content/60">Payment Date:</span>
                                            <span className="font-semibold">
                                                {new Date(selectedPayment.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Details */}
                                {selectedPayment.order && (
                                    <>
                                        {/* Order Items */}
                                        <div className="card bg-base-200 p-3">
                                            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                <ShoppingCart className="w-4 h-4 text-primary" />
                                                Order Items ({selectedPayment.order.items?.length || 0})
                                            </h3>
                                            <div className="space-y-2">
                                                {selectedPayment.order.items?.map((item, index) => (
                                                    <div key={index} className="flex gap-2 bg-base-100 p-2 rounded-lg">
                                                        {item.image && (
                                                            <Image
                                                                src={item.image}
                                                                alt={item.name}
                                                                width={48}
                                                                height={48}
                                                                className="object-cover rounded-lg"
                                                            />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                                                            <div className="text-xs text-base-content/60">
                                                                Qty: {item.quantity} × ${item.price?.toFixed(2)}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-bold text-sm text-success">
                                                                ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Shipping Address */}
                                        {selectedPayment.order.shippingAddress && (
                                            <div className="card bg-base-200 p-3">
                                                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-primary" />
                                                    Shipping Address
                                                </h3>
                                                <div className="text-xs space-y-0.5">
                                                    <p>{selectedPayment.order.shippingAddress.street}</p>
                                                    <p>{selectedPayment.order.shippingAddress.city}, {selectedPayment.order.shippingAddress.district}</p>
                                                    <p>{selectedPayment.order.shippingAddress.division} - {selectedPayment.order.shippingAddress.zipCode}</p>
                                                    <p>{selectedPayment.order.shippingAddress.country}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Order Summary */}
                                        <div className="card bg-base-200 p-3">
                                            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                <Package className="w-4 h-4 text-primary" />
                                                Order Summary
                                            </h3>
                                            <div className="space-y-1 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-base-content/60">Subtotal:</span>
                                                    <span className="font-semibold">${selectedPayment.order.subtotal?.toFixed(2) || '0.00'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-base-content/60">Shipping:</span>
                                                    <span className="font-semibold">${selectedPayment.order.shipping?.toFixed(2) || '0.00'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-base-content/60">Tax:</span>
                                                    <span className="font-semibold">${selectedPayment.order.tax?.toFixed(2) || '0.00'}</span>
                                                </div>
                                                <div className="divider my-1"></div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-bold">Total Paid:</span>
                                                    <span className="font-bold text-success">${selectedPayment.order.total?.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Additional Info */}
                                <div className="card bg-base-200 p-3">
                                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        Timeline
                                    </h3>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-base-content/60">Payment Created:</span>
                                            <span>{new Date(selectedPayment.createdAt).toLocaleString()}</span>
                                        </div>
                                        {selectedPayment.updatedAt && (
                                            <div className="flex justify-between">
                                                <span className="text-base-content/60">Last Updated:</span>
                                                <span>{new Date(selectedPayment.updatedAt).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-3 bg-base-200 border-t border-base-300 flex justify-end">
                                <button
                                    onClick={() => setIsDetailsModalOpen(false)}
                                    className="btn btn-sm btn-primary"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
