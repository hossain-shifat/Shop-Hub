'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, Package, Star, Calendar, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import toast from 'react-hot-toast'
import Loading from '@/app/dashboard/loading'
import DataTable from '../../components/DataTable'

export default function RiderIncomePage() {
    const { user, userData } = useFirebaseAuth()
    const [earnings, setEarnings] = useState(null)
    const [earningsHistory, setEarningsHistory] = useState([])
    const [completedOrders, setCompletedOrders] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRiderRegistered, setIsRiderRegistered] = useState(false)

    useEffect(() => {
        if (user) {
            fetchEarningsData()
        }
    }, [user])

    const fetchEarningsData = async () => {
        setIsLoading(true)
        try {
            console.log('📊 Fetching earnings for rider:', user.uid)

            // First, try to get earnings from the Rider collection
            const earningsResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/riders/${user.uid}/earnings`,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )

            if (earningsResponse.status === 404) {
                // Rider not found in Rider collection
                console.log('⚠️ Rider not found in Rider collection - user needs to complete rider registration')
                setIsRiderRegistered(false)

                // Still try to fetch orders if they exist
                await fetchCompletedOrders()

                setIsLoading(false)
                return
            }

            if (!earningsResponse.ok) {
                const errorText = await earningsResponse.text()
                console.error('❌ Earnings API Error:', errorText)
                throw new Error(`HTTP ${earningsResponse.status}: ${errorText}`)
            }

            const earningsData = await earningsResponse.json()
            console.log('💰 Earnings data:', earningsData)

            if (earningsData.success) {
                setEarnings(earningsData.earnings)
                setEarningsHistory(earningsData.earningsHistory || [])
                setIsRiderRegistered(true)
            } else {
                throw new Error(earningsData.error || 'Failed to fetch earnings')
            }

            // Fetch completed orders for the table
            await fetchCompletedOrders()

        } catch (error) {
            console.error('❌ Error fetching earnings:', error)
            toast.error('Failed to load earnings data: ' + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchCompletedOrders = async () => {
        try {
            // GET /riders/:riderId/orders?status=delivered
            const ordersResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/riders/${user.uid}/orders?status=delivered`,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )

            if (ordersResponse.ok) {
                const ordersData = await ordersResponse.json()
                console.log('📦 Completed orders:', ordersData)

                if (ordersData.success) {
                    const orders = ordersData.orders || []
                    setCompletedOrders(orders)

                    // If no rider data from API, calculate basic stats from orders
                    if (!earnings && orders.length > 0) {
                        calculateEarningsFromOrders(orders)
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error fetching orders:', error)
        }
    }

    const calculateEarningsFromOrders = (orders) => {
        const total = orders.reduce((sum, order) => sum + (order.deliveryFee || 50), 0)
        const count = orders.length
        const average = count > 0 ? (total / count).toFixed(2) : '0.00'

        setEarnings({
            total: total,
            deliveries: count,
            average: average,
            rating: 5.0,
            onTimeRate: '100'
        })
    }

    // Completed Orders Table Columns
    const ordersColumns = [
        {
            header: 'Order ID',
            accessor: 'orderId',
            render: (row) => (
                <div>
                    <div className="font-mono text-sm font-semibold">
                        {row.orderId}
                    </div>
                    <div className="font-mono text-xs text-base-content/60">
                        {row.trackingId}
                    </div>
                </div>
            )
        },
        {
            header: 'Customer',
            accessor: 'buyerInfo',
            render: (row) => (
                <div className="text-sm">
                    <p className="font-semibold">{row.buyerInfo?.name || 'N/A'}</p>
                    <p className="text-xs text-base-content/60">{row.buyerInfo?.phoneNumber || 'N/A'}</p>
                </div>
            )
        },
        {
            header: 'Delivery Address',
            accessor: 'shippingAddress',
            render: (row) => (
                <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div className="text-sm">
                        <p className="font-semibold">{row.shippingAddress?.city || 'N/A'}</p>
                        <p className="text-xs text-base-content/60">
                            {row.shippingAddress?.district}, {row.shippingAddress?.division}
                        </p>
                    </div>
                </div>
            )
        },
        {
            header: 'Items',
            accessor: 'items',
            render: (row) => (
                <div className="text-sm">
                    <span className="font-semibold">{row.items?.length || 0}</span>
                    <span className="text-base-content/60"> item(s)</span>
                </div>
            )
        },
        {
            header: 'Order Total',
            accessor: 'total',
            render: (row) => (
                <div className="font-semibold text-base-content">
                    ${row.total?.toFixed(2) || '0.00'}
                </div>
            ),
            cellClassName: 'text-right'
        },
        {
            header: 'Delivery Fee',
            accessor: 'deliveryFee',
            render: (row) => (
                <div className="font-bold text-success flex items-center justify-end gap-1">
                    <DollarSign className="w-3 h-3" />
                    {(row.deliveryFee || 50).toFixed(2)}
                </div>
            ),
            cellClassName: 'text-right'
        },
        {
            header: 'Delivered',
            accessor: 'deliveredAt',
            render: (row) => (
                <div className="flex items-center gap-2 text-sm text-base-content/70">
                    <Calendar className="w-4 h-4" />
                    {row.deliveredAt
                        ? new Date(row.deliveredAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })
                        : 'N/A'
                    }
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'riderStatus',
            render: (row) => (
                <span className="badge badge-success badge-sm gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Completed
                </span>
            ),
            cellClassName: 'text-center'
        }
    ]

    // Earnings History Table Columns
    const historyColumns = [
        {
            header: 'Order ID',
            accessor: 'orderId',
            render: (row) => (
                <div className="font-mono text-sm font-semibold">
                    {row.orderId}
                </div>
            )
        },
        {
            header: 'Amount',
            accessor: 'amount',
            render: (row) => (
                <div className="font-bold text-success flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {row.amount?.toFixed(2) || '0.00'}
                </div>
            ),
            cellClassName: 'text-right'
        },
        {
            header: 'Date',
            accessor: 'date',
            render: (row) => (
                <div className="flex items-center gap-2 text-sm text-base-content/70">
                    <Calendar className="w-4 h-4" />
                    {row.date
                        ? new Date(row.date).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                        : 'N/A'
                    }
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => {
                const statusBadges = {
                    pending: { class: 'badge-warning', label: 'Pending', icon: Clock },
                    completed: { class: 'badge-success', label: 'Completed', icon: CheckCircle },
                    withdrawn: { class: 'badge-info', label: 'Withdrawn', icon: DollarSign }
                }
                const badge = statusBadges[row.status] || statusBadges.completed
                const Icon = badge.icon

                return (
                    <span className={`badge ${badge.class} badge-sm gap-1`}>
                        <Icon className="w-3 h-3" />
                        {badge.label}
                    </span>
                )
            },
            cellClassName: 'text-center'
        }
    ]

    if (isLoading) {
        return <Loading />
    }

    // If rider is not registered in Rider collection
    if (!isRiderRegistered && completedOrders.length === 0) {
        return (
            <div className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-bold text-base-content mb-2">My Earnings</h1>
                    <p className="text-base-content/70">
                        Track your delivery income and performance
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card bg-warning/10 border-2 border-warning/20"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-6 h-6 text-warning" />
                        </div>
                        <div>
                            <h3 className="font-bold text-warning text-lg mb-2">
                                Complete Rider Registration
                            </h3>
                            <p className="text-base-content/70 mb-4">
                                To start earning and track your income, you need to complete your rider registration with vehicle details, license information, and address.
                            </p>
                            <button
                                onClick={() => window.location.href = '/dashboard/rider/profile'}
                                className="btn btn-warning btn-sm"
                            >
                                Complete Registration
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Show basic stats if user has role but no rider profile */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="card bg-base-200 opacity-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-base-content/60 font-semibold mb-1">
                                    Total Earnings
                                </p>
                                <p className="text-3xl font-bold text-base-content/50">
                                    $0.00
                                </p>
                            </div>
                            <DollarSign className="w-10 h-10 text-base-content/30" />
                        </div>
                    </div>
                    <div className="card bg-base-200 opacity-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-base-content/60 font-semibold mb-1">
                                    Total Deliveries
                                </p>
                                <p className="text-3xl font-bold text-base-content/50">
                                    0
                                </p>
                            </div>
                            <Package className="w-10 h-10 text-base-content/30" />
                        </div>
                    </div>
                    <div className="card bg-base-200 opacity-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-base-content/60 font-semibold mb-1">
                                    Avg Per Delivery
                                </p>
                                <p className="text-3xl font-bold text-base-content/50">
                                    $0.00
                                </p>
                            </div>
                            <TrendingUp className="w-10 h-10 text-base-content/30" />
                        </div>
                    </div>
                    <div className="card bg-base-200 opacity-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-base-content/60 font-semibold mb-1">
                                    Your Rating
                                </p>
                                <p className="text-3xl font-bold text-base-content/50">
                                    5.0
                                </p>
                            </div>
                            <Star className="w-10 h-10 text-base-content/30" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold text-base-content mb-2">My Earnings</h1>
                <p className="text-base-content/70">
                    Track your delivery income and performance
                </p>
            </motion.div>

            {/* Warning if not fully registered but has orders */}
            {!isRiderRegistered && completedOrders.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="alert alert-warning"
                >
                    <AlertCircle className="w-5 h-5" />
                    <div>
                        <h3 className="font-bold">Limited Data Available</h3>
                        <p className="text-sm">
                            Complete your rider registration to access detailed earnings history and performance metrics.
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card bg-gradient-to-br from-success/10 to-success/5 border-2 border-success/20"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-base-content/60 font-semibold mb-1">
                                Total Earnings
                            </p>
                            <p className="text-3xl font-bold text-success">
                                ${earnings?.total?.toFixed(2) || '0.00'}
                            </p>
                            <p className="text-xs text-success/70 mt-1">
                                All time revenue
                            </p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-success/20 flex items-center justify-center">
                            <DollarSign className="w-7 h-7 text-success" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-base-content/60 font-semibold mb-1">
                                Total Deliveries
                            </p>
                            <p className="text-3xl font-bold text-primary">
                                {earnings?.deliveries || 0}
                            </p>
                            <p className="text-xs text-primary/70 mt-1">
                                Completed orders
                            </p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                            <Package className="w-7 h-7 text-primary" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card bg-gradient-to-br from-secondary/10 to-secondary/5 border-2 border-secondary/20"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-base-content/60 font-semibold mb-1">
                                Avg Per Delivery
                            </p>
                            <p className="text-3xl font-bold text-secondary">
                                ${earnings?.average || '0.00'}
                            </p>
                            <p className="text-xs text-secondary/70 mt-1">
                                Per order average
                            </p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center">
                            <TrendingUp className="w-7 h-7 text-secondary" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="card bg-gradient-to-br from-warning/10 to-warning/5 border-2 border-warning/20"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-base-content/60 font-semibold mb-1">
                                Your Rating
                            </p>
                            <p className="text-3xl font-bold text-warning">
                                {earnings?.rating?.toFixed(1) || '5.0'}
                            </p>
                            <p className="text-xs text-warning/70 mt-1">
                                {earnings?.onTimeRate || '100'}% on-time
                            </p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-warning/20 flex items-center justify-center">
                            <Star className="w-7 h-7 text-warning fill-warning" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Performance Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="card bg-base-200"
            >
                <h2 className="text-xl font-bold mb-4">Earnings Overview</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-base-100 rounded-lg border border-base-300">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-base-content/60 font-semibold">Total Revenue</p>
                            <DollarSign className="w-5 h-5 text-success" />
                        </div>
                        <p className="text-2xl font-bold text-success">
                            ${earnings?.total?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-xs text-base-content/60 mt-1">
                            From {earnings?.deliveries || 0} deliveries
                        </p>
                    </div>
                    <div className="p-4 bg-base-100 rounded-lg border border-base-300">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-base-content/60 font-semibold">Average Fee</p>
                            <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-2xl font-bold text-primary">
                            ${earnings?.average || '0.00'}
                        </p>
                        <p className="text-xs text-base-content/60 mt-1">
                            Per delivery average
                        </p>
                    </div>
                    <div className="p-4 bg-base-100 rounded-lg border border-base-300">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-base-content/60 font-semibold">On-Time Rate</p>
                            <CheckCircle className="w-5 h-5 text-success" />
                        </div>
                        <p className="text-2xl font-bold text-success">
                            {earnings?.onTimeRate || '100'}%
                        </p>
                        <p className="text-xs text-base-content/60 mt-1">
                            Delivery performance
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Earnings History Table */}
            {earningsHistory && earningsHistory.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="card bg-base-100 shadow-xl"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Recent Earnings</h2>
                        <div className="badge badge-primary">
                            {earningsHistory.length} transactions
                        </div>
                    </div>

                    <DataTable
                        columns={historyColumns}
                        data={earningsHistory}
                        itemsPerPage={10}
                        emptyMessage="No earnings history yet"
                        EmptyIcon={DollarSign}
                    />
                </motion.div>
            )}

            {/* Completed Deliveries Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="card bg-base-100 shadow-xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Completed Deliveries</h2>
                    <div className="badge badge-success">
                        {completedOrders.length} orders
                    </div>
                </div>

                <DataTable
                    columns={ordersColumns}
                    data={completedOrders}
                    itemsPerPage={10}
                    emptyMessage="No completed deliveries yet"
                    EmptyIcon={Package}
                />
            </motion.div>

            {/* Tips Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="card bg-info/10 border-2 border-info/20"
            >
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-info/20 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-5 h-5 text-info" />
                    </div>
                    <div>
                        <h3 className="font-bold text-info mb-3">💡 Tips to Increase Your Earnings</h3>
                        <ul className="space-y-2 text-sm text-base-content/70">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                                <span>Accept deliveries quickly to get more assignments</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                                <span>Maintain a high rating by providing excellent service</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                                <span>Complete deliveries on time to build trust and improve your on-time rate</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                                <span>Be available during peak hours for more opportunities</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                                <span>Keep your profile information and availability status up to date</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
