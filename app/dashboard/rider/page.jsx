'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, TrendingUp, Clock, CheckCircle, Bike, DollarSign, Star, MapPin } from 'lucide-react'
import { StatsCard, LineChart, AreaChart, PieChart } from '@/app/dashboard/components/charts/Index'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Loading from '../loading'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function RiderDashboard() {
    const { user, userData, loading } = useFirebaseAuth()
    const [stats, setStats] = useState({
        totalDeliveries: 0,
        pendingDeliveries: 0,
        completedToday: 0,
        totalEarnings: 0,
        rating: 5.0
    })
    const [deliveryData, setDeliveryData] = useState([])
    const [earningsData, setEarningsData] = useState([])
    const [statusData, setStatusData] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!loading && user && userData) {
            fetchRiderStats()
        }
    }, [user, userData, loading])

    const fetchRiderStats = async () => {
        try {
            if (!user) return

            // Fetch rider orders
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/rider/${user.uid}`)
            const data = await response.json()

            if (data.success) {
                const orders = data.orders || []

                // Calculate stats
                const completed = orders.filter(o => o.status === 'delivered').length
                const pending = orders.filter(o => ['assigned', 'collected', 'in_transit', 'out_for_delivery'].includes(o.status)).length

                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const completedToday = orders.filter(o => {
                    if (o.status !== 'delivered' || !o.actualDelivery) return false
                    const deliveryDate = new Date(o.actualDelivery)
                    deliveryDate.setHours(0, 0, 0, 0)
                    return deliveryDate.getTime() === today.getTime()
                }).length

                // Calculate earnings: $5 per delivery OR 10% of order total (whichever is higher)
                const earnings = orders
                    .filter(o => o.status === 'delivered')
                    .reduce((sum, order) => {
                        const deliveryFee = Math.max(5, order.total * 0.1)
                        return sum + deliveryFee
                    }, 0)

                setStats({
                    totalDeliveries: completed,
                    pendingDeliveries: pending,
                    completedToday: completedToday,
                    totalEarnings: earnings,
                    rating: userData?.riderInfo?.rating || 5.0
                })

                // Prepare chart data
                prepareChartData(orders)
            } else {
                console.error('Failed to fetch rider stats:', data.error)
            }
        } catch (error) {
            console.error('Error fetching rider stats:', error)
            toast.error('Failed to load statistics')
        } finally {
            setIsLoading(false)
        }
    }

    const prepareChartData = (orders) => {
        const deliveredOrders = orders.filter(o => o.status === 'delivered')

        // Delivery trend data (last 7 days)
        const last7Days = []
        const deliveryTrend = []
        const earningsTrend = []

        for (let i = 6; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            date.setHours(0, 0, 0, 0)

            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            last7Days.push(dateStr)

            const deliveriesOnDate = deliveredOrders.filter(o => {
                if (!o.actualDelivery) return false
                const deliveryDate = new Date(o.actualDelivery)
                deliveryDate.setHours(0, 0, 0, 0)
                return deliveryDate.getTime() === date.getTime()
            })

            const dayDeliveries = deliveriesOnDate.length
            const dayEarnings = deliveriesOnDate.reduce((sum, order) => {
                const deliveryFee = Math.max(5, order.total * 0.1)
                return sum + deliveryFee
            }, 0)

            deliveryTrend.push(dayDeliveries)
            earningsTrend.push(parseFloat(dayEarnings.toFixed(2)))
        }

        setDeliveryData(last7Days.map((date, index) => ({
            name: date,
            deliveries: deliveryTrend[index]
        })))

        setEarningsData(last7Days.map((date, index) => ({
            name: date,
            earnings: earningsTrend[index]
        })))

        // Status distribution
        const statusCounts = {
            assigned: orders.filter(o => o.status === 'assigned').length,
            collected: orders.filter(o => o.status === 'collected').length,
            in_transit: orders.filter(o => o.status === 'in_transit').length,
            out_for_delivery: orders.filter(o => o.status === 'out_for_delivery').length,
            delivered: orders.filter(o => o.status === 'delivered').length
        }

        setStatusData([
            { name: 'Assigned', value: statusCounts.assigned },
            { name: 'Collected', value: statusCounts.collected },
            { name: 'In Transit', value: statusCounts.in_transit },
            { name: 'Out for Delivery', value: statusCounts.out_for_delivery },
            { name: 'Delivered', value: statusCounts.delivered }
        ])
    }

    if (loading || isLoading) {
        return <Loading />
    }

    return (
        <ProtectedRoute allowedRoles={['rider']}>
            <div className="space-y-6">
                {/* Welcome Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-base-content flex items-center gap-3">
                            <Bike className="w-8 h-8 text-primary" />
                            Rider Dashboard
                        </h1>
                        <p className="text-base-content/60 mt-1">
                            Welcome back, {userData?.displayName || 'Rider'}! Track your deliveries and earnings.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="px-4 py-2 bg-success/10 border border-success/20 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-success" />
                                <div>
                                    <div className="text-xs text-success/80">Rating</div>
                                    <div className="font-bold text-success">{stats.rating.toFixed(1)} ⭐</div>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Bike className="w-5 h-5 text-primary" />
                                <div>
                                    <div className="text-xs text-primary/80">Vehicle</div>
                                    <div className="font-bold text-primary capitalize">
                                        {userData?.riderInfo?.vehicleType || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <StatsCard
                            title="Total Deliveries"
                            value={stats.totalDeliveries}
                            change="+12%"
                            icon={Package}
                            trend="up"
                        />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <StatsCard
                            title="Pending Deliveries"
                            value={stats.pendingDeliveries}
                            icon={Clock}
                            trend="up"
                        />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <StatsCard
                            title="Completed Today"
                            value={stats.completedToday}
                            change="+8%"
                            icon={CheckCircle}
                            trend="up"
                        />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <StatsCard
                            title="Total Earnings"
                            value={`$${stats.totalEarnings.toFixed(2)}`}
                            change="+15%"
                            icon={DollarSign}
                            trend="up"
                        />
                    </motion.div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Delivery Trend */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <LineChart
                            data={deliveryData}
                            dataKeys={[
                                { key: 'deliveries', name: 'Deliveries' }
                            ]}
                            title="Delivery Trend (Last 7 Days)"
                            colors={['#7c3aed']}
                        />
                    </motion.div>

                    {/* Earnings Trend */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <AreaChart
                            data={earningsData}
                            dataKeys={[
                                { key: 'earnings', name: 'Earnings ($)' }
                            ]}
                            title="Earnings Trend (Last 7 Days)"
                            colors={['#10b981']}
                        />
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Status Distribution */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="lg:col-span-1"
                    >
                        <PieChart
                            data={statusData}
                            title="Delivery Status Distribution"
                            colors={['#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981']}
                        />
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="card bg-base-200 p-6 lg:col-span-2"
                    >
                        <h3 className="text-xl font-bold text-base-content mb-6">Quick Actions</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link
                                href="/dashboard/rider/my-tasks"
                                className="flex items-center gap-4 p-4 bg-primary/10 border-2 border-primary/20 rounded-lg hover:bg-primary/20 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Package className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-base-content">View My Tasks</div>
                                    <div className="text-sm text-base-content/60">
                                        {stats.pendingDeliveries} pending deliveries
                                    </div>
                                </div>
                            </Link>

                            <Link
                                href="/dashboard/rider/income"
                                className="flex items-center gap-4 p-4 bg-success/10 border-2 border-success/20 rounded-lg hover:bg-success/20 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <DollarSign className="w-6 h-6 text-success" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-base-content">View Earnings</div>
                                    <div className="text-sm text-base-content/60">
                                        ${stats.totalEarnings.toFixed(2)} total earned
                                    </div>
                                </div>
                            </Link>

                            <Link
                                href="/dashboard/rider/settings"
                                className="flex items-center gap-4 p-4 bg-info/10 border-2 border-info/20 rounded-lg hover:bg-info/20 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-lg bg-info/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <MapPin className="w-6 h-6 text-info" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-base-content">Update Location</div>
                                    <div className="text-sm text-base-content/60">Set your availability</div>
                                </div>
                            </Link>

                            <Link
                                href="/orders"
                                className="flex items-center gap-4 p-4 bg-warning/10 border-2 border-warning/20 rounded-lg hover:bg-warning/20 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-lg bg-warning/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Clock className="w-6 h-6 text-warning" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-base-content">Delivery History</div>
                                    <div className="text-sm text-base-content/60">
                                        {stats.totalDeliveries} completed
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Performance Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="card bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20 p-6"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                            <Star className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-base-content mb-2">
                                Excellent Performance! 🎉
                            </h3>
                            <p className="text-base-content/70 mb-4">
                                You&apos;ve completed {stats.completedToday} deliveries today and maintained a {stats.rating.toFixed(1)} star rating.
                                Keep up the great work to unlock bonus rewards!
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <div className="px-4 py-2 bg-base-100 rounded-lg">
                                    <div className="text-xs text-base-content/60">On-Time Rate</div>
                                    <div className="font-bold text-success">98%</div>
                                </div>
                                <div className="px-4 py-2 bg-base-100 rounded-lg">
                                    <div className="text-xs text-base-content/60">Customer Satisfaction</div>
                                    <div className="font-bold text-primary">{stats.rating.toFixed(1)}/5.0</div>
                                </div>
                                <div className="px-4 py-2 bg-base-100 rounded-lg">
                                    <div className="text-xs text-base-content/60">Total Earnings</div>
                                    <div className="font-bold text-accent">${stats.totalEarnings.toFixed(2)}</div>
                                </div>
                                <div className="px-4 py-2 bg-base-100 rounded-lg">
                                    <div className="text-xs text-base-content/60">Vehicle</div>
                                    <div className="font-bold text-info capitalize">
                                        {userData?.riderInfo?.vehicleType || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* No Data State */}
                {stats.totalDeliveries === 0 && stats.pendingDeliveries === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0 }}
                        className="card bg-info/10 border-2 border-info/20 p-8"
                    >
                        <div className="text-center">
                            <Bike className="w-16 h-16 text-info mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-base-content mb-2">
                                Ready to Start Delivering?
                            </h3>
                            <p className="text-base-content/70 mb-4">
                                You don&apos;t have any deliveries yet. Once you&apos;re assigned orders, they&apos;ll appear here.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <Link href="/dashboard/rider/my-tasks" className="btn btn-primary">
                                    View Available Tasks
                                </Link>
                                <Link href="/dashboard/rider/settings" className="btn btn-ghost">
                                    Update Availability
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </ProtectedRoute>
    )
}
