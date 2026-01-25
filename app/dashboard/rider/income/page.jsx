'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, Package, Star, Calendar, MapPin } from 'lucide-react'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import DataTable from '@/app/dashboard/components/DataTable'
import toast from 'react-hot-toast'
import Loading from '../../loading'

export default function RiderIncomePage() {
    const { user } = useFirebaseAuth()
    const [earnings, setEarnings] = useState(null)
    const [deliveries, setDeliveries] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchEarnings()
        }
    }, [user])

    const fetchEarnings = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/riders/${user.uid}/earnings`
            )
            const data = await response.json()

            if (data.success) {
                setEarnings(data.earnings)
                setDeliveries(data.recentDeliveries)
            }
        } catch (error) {
            console.error('Error fetching earnings:', error)
            toast.error('Failed to load earnings data')
        } finally {
            setIsLoading(false)
        }
    }

    const columns = [
        {
            header: 'Order ID',
            accessor: 'orderId',
            render: (row) => (
                <div className="font-mono text-sm">
                    #{row.orderId}
                </div>
            )
        },
        {
            header: 'Tracking ID',
            accessor: 'trackingId',
            render: (row) => (
                <div className="font-mono text-xs text-base-content/70">
                    {row.trackingId}
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
                        <p className="font-semibold">{row.shippingAddress.area}</p>
                        <p className="text-xs text-base-content/60">
                            {row.shippingAddress.district}, {row.shippingAddress.division}
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
                    <span className="font-semibold">{row.items.length}</span>
                    <span className="text-base-content/60"> item(s)</span>
                </div>
            )
        },
        {
            header: 'Order Total',
            accessor: 'total',
            render: (row) => (
                <div className="font-semibold text-base-content">
                    ${row.total.toFixed(2)}
                </div>
            ),
            cellClassName: 'text-right'
        },
        {
            header: 'Delivery Fee',
            accessor: 'deliveryFee',
            render: (row) => (
                <div className="font-bold text-success">
                    ${(row.deliveryFee || 50).toFixed(2)}
                </div>
            ),
            cellClassName: 'text-right'
        },
        {
            header: 'Status',
            accessor: 'riderStatus',
            render: (row) => (
                <span className="badge badge-success badge-sm">
                    {row.riderStatus}
                </span>
            ),
            cellClassName: 'text-center'
        },
        {
            header: 'Delivered Date',
            accessor: 'deliveredAt',
            render: (row) => (
                <div className="flex items-center gap-2 text-sm text-base-content/70">
                    <Calendar className="w-4 h-4" />
                    {new Date(row.deliveredAt).toLocaleDateString()}
                </div>
            )
        }
    ]

    if (isLoading) {
        return <Loading />
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

            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card bg-linear-to-br from-success/10 to-success/5 border-2 border-success/20"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-base-content/60 font-semibold mb-1">
                                Total Earnings
                            </p>
                            <p className="text-3xl font-bold text-success">
                                ${earnings?.total.toFixed(2) || '0.00'}
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
                    className="card bg-linear-to-br from-primary/10 to-primary/5 border-2 border-primary/20"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-base-content/60 font-semibold mb-1">
                                Total Deliveries
                            </p>
                            <p className="text-3xl font-bold text-primary">
                                {earnings?.deliveries || 0}
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
                    className="card bg-linear-to-br from-secondary/10 to-secondary/5 border-2 border-secondary/20"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-base-content/60 font-semibold mb-1">
                                Avg Per Delivery
                            </p>
                            <p className="text-3xl font-bold text-secondary">
                                ${earnings?.average || '0.00'}
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
                    className="card bg-linear-to-br from-warning/10 to-warning/5 border-2 border-warning/20"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-base-content/60 font-semibold mb-1">
                                Rating
                            </p>
                            <p className="text-3xl font-bold text-warning">
                                {earnings?.rating.toFixed(1) || '5.0'}
                            </p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-warning/20 flex items-center justify-center">
                            <Star className="w-7 h-7 text-warning fill-warning" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Performance Chart (Optional - can be added later) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="card bg-base-200"
            >
                <h2 className="text-xl font-bold mb-4">Earnings Breakdown</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-base-100 rounded-lg">
                        <p className="text-sm text-base-content/60 mb-1">This Week</p>
                        <p className="text-2xl font-bold text-primary">
                            $--.--
                        </p>
                        <p className="text-xs text-success mt-1">Coming soon</p>
                    </div>
                    <div className="p-4 bg-base-100 rounded-lg">
                        <p className="text-sm text-base-content/60 mb-1">This Month</p>
                        <p className="text-2xl font-bold text-primary">
                            ${earnings?.total.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-xs text-base-content/60 mt-1">
                            {earnings?.deliveries || 0} deliveries
                        </p>
                    </div>
                    <div className="p-4 bg-base-100 rounded-lg">
                        <p className="text-sm text-base-content/60 mb-1">All Time</p>
                        <p className="text-2xl font-bold text-primary">
                            ${earnings?.total.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-xs text-base-content/60 mt-1">
                            Total earnings
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Delivery History Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="card bg-base-200"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Recent Deliveries</h2>
                    <div className="badge badge-primary">
                        {deliveries.length} completed
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={deliveries}
                    itemsPerPage={10}
                    emptyMessage="No completed deliveries yet"
                    EmptyIcon={Package}
                />
            </motion.div>

            {/* Tips Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="card bg-info/10 border-2 border-info/20"
            >
                <h3 className="font-bold text-info mb-3">💡 Tips to Increase Your Earnings</h3>
                <ul className="space-y-2 text-sm text-base-content/70">
                    <li>• Accept deliveries quickly to get more assignments</li>
                    <li>• Maintain a high rating by providing excellent service</li>
                    <li>• Complete deliveries on time to build trust</li>
                    <li>• Be available during peak hours for more opportunities</li>
                    <li>• Keep your profile information up to date</li>
                </ul>
            </motion.div>
        </div>
    )
}
