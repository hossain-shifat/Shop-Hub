'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, TrendingUp, Clock, CheckCircle, Bike, DollarSign, Star, MapPin, Calendar } from 'lucide-react'
import { StatsCard, LineChart, AreaChart, PieChart } from '@/app/dashboard/components/charts/Index'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Loading from '../loading'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function RiderDashboard() {
    const { user, userData, loading } = useFirebaseAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState({
        totalDeliveries: 0,
        pendingDeliveries: 0,
        completedToday: 0,
        totalEarnings: 0,
        rating: 5.0,
        deliveryGrowth: '0%',
        earningsGrowth: '0%'
    })
    const [chartData, setChartData] = useState({
        deliveryTrend: [],
        earningsTrend: [],
        statusDistribution: []
    })

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
                calculateStats(orders)
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

    const calculateStats = (orders) => {
        const now = new Date()
        const deliveredOrders = orders.filter(o => o.status === 'delivered')

        // Total deliveries
        const totalDeliveries = deliveredOrders.length

        // Pending deliveries
        const pendingDeliveries = orders.filter(o =>
            ['assigned', 'collected', 'in_transit', 'out_for_delivery'].includes(o.status)
        ).length

        // Completed today
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const completedToday = deliveredOrders.filter(o => {
            if (!o.actualDelivery) return false
            const deliveryDate = new Date(o.actualDelivery)
            deliveryDate.setHours(0, 0, 0, 0)
            return deliveryDate.getTime() === today.getTime()
        }).length

        // Total earnings
        const totalEarnings = deliveredOrders.reduce((sum, order) => {
            const deliveryFee = Math.max(5, order.total * 0.1)
            return sum + deliveryFee
        }, 0)

        // Calculate growth rates (last 7 days vs previous 7 days)
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const previous7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

        const deliveriesLast7 = deliveredOrders.filter(o =>
            o.actualDelivery && new Date(o.actualDelivery) >= last7Days
        ).length

        const deliveriesPrevious7 = deliveredOrders.filter(o =>
            o.actualDelivery &&
            new Date(o.actualDelivery) >= previous7Days &&
            new Date(o.actualDelivery) < last7Days
        ).length

        const deliveryGrowth = deliveriesPrevious7 > 0
            ? ((deliveriesLast7 - deliveriesPrevious7) / deliveriesPrevious7 * 100).toFixed(1)
            : 0

        const earningsLast7 = deliveredOrders
            .filter(o => o.actualDelivery && new Date(o.actualDelivery) >= last7Days)
            .reduce((sum, order) => sum + Math.max(5, order.total * 0.1), 0)

        const earningsPrevious7 = deliveredOrders
            .filter(o =>
                o.actualDelivery &&
                new Date(o.actualDelivery) >= previous7Days &&
                new Date(o.actualDelivery) < last7Days
            )
            .reduce((sum, order) => sum + Math.max(5, order.total * 0.1), 0)

        const earningsGrowth = earningsPrevious7 > 0
            ? ((earningsLast7 - earningsPrevious7) / earningsPrevious7 * 100).toFixed(1)
            : 0

        setStats({
            totalDeliveries,
            pendingDeliveries,
            completedToday,
            totalEarnings,
            rating: userData?.riderInfo?.rating || 5.0,
            deliveryGrowth: `${deliveryGrowth}%`,
            earningsGrowth: `${earningsGrowth}%`
        })
    }

    const prepareChartData = (orders) => {
        const deliveredOrders = orders.filter(o => o.status === 'delivered')
        const now = new Date()

        // Delivery & Earnings trend (last 7 days)
        const deliveryTrend = []
        const earningsTrend = []

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
            date.setHours(0, 0, 0, 0)
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

            const dayOrders = deliveredOrders.filter(o => {
                if (!o.actualDelivery) return false
                const deliveryDate = new Date(o.actualDelivery)
                deliveryDate.setHours(0, 0, 0, 0)
                return deliveryDate.getTime() === date.getTime()
            })

            const dayDeliveries = dayOrders.length
            const dayEarnings = dayOrders.reduce((sum, order) => {
                const deliveryFee = Math.max(5, order.total * 0.1)
                return sum + deliveryFee
            }, 0)

            deliveryTrend.push({
                name: dateStr,
                deliveries: dayDeliveries,
                earnings: parseFloat(dayEarnings.toFixed(2))
            })

            earningsTrend.push({
                name: dateStr,
                earnings: parseFloat(dayEarnings.toFixed(2))
            })
        }

        // Status distribution
        const statusCounts = {
            assigned: orders.filter(o => o.status === 'assigned').length,
            collected: orders.filter(o => o.status === 'collected').length,
            in_transit: orders.filter(o => o.status === 'in_transit').length,
            out_for_delivery: orders.filter(o => o.status === 'out_for_delivery').length,
            delivered: orders.filter(o => o.status === 'delivered').length
        }

        const statusDistribution = [
            { name: 'Assigned', value: statusCounts.assigned },
            { name: 'Collected', value: statusCounts.collected },
            { name: 'In Transit', value: statusCounts.in_transit },
            { name: 'Out for Delivery', value: statusCounts.out_for_delivery },
            { name: 'Delivered', value: statusCounts.delivered }
        ]

        setChartData({
            deliveryTrend,
            earningsTrend,
            statusDistribution
        })
    }

    if (loading || isLoading) {
        return <Loading />
    }

    return (
        <ProtectedRoute allowedRoles={['rider']}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <Bike className="w-8 h-8 text-primary" />
                            Rider Dashboard
                        </h1>
                        <p className="text-base-content/70">
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
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Deliveries"
                        value={stats.totalDeliveries.toLocaleString()}
                        change={stats.deliveryGrowth}
                        icon={Package}
                        trend={parseFloat(stats.deliveryGrowth) >= 0 ? 'up' : 'down'}
                    />
                    <StatsCard
                        title="Pending Deliveries"
                        value={stats.pendingDeliveries.toLocaleString()}
                        icon={Clock}
                        trend="up"
                    />
                    <StatsCard
                        title="Completed Today"
                        value={stats.completedToday.toLocaleString()}
                        icon={CheckCircle}
                        trend="up"
                    />
                    <StatsCard
                        title="Total Earnings"
                        value={`$${stats.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        change={stats.earningsGrowth}
                        icon={DollarSign}
                        trend={parseFloat(stats.earningsGrowth) >= 0 ? 'up' : 'down'}
                    />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 gap-6">
                    <AreaChart
                        data={chartData.deliveryTrend}
                        dataKeys={[
                            { key: 'deliveries', name: 'Deliveries' },
                            { key: 'earnings', name: 'Earnings ($)' }
                        ]}
                        title="Deliveries & Earnings Over Time (Last 7 Days)"
                        colors={['#8b5cf6', '#10b981']}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <LineChart
                        data={chartData.earningsTrend}
                        dataKeys={[{ key: 'earnings', name: 'Earnings ($)' }]}
                        title="Earnings Trend (Last 7 Days)"
                        colors={['#10b981']}
                    />
                    <PieChart
                        data={chartData.statusDistribution}
                        title="Delivery Status Distribution"
                        colors={['#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981']}
                    />
                </div>

                {/* Quick Actions Section */}
                <div className="card bg-base-200">
                    <div className="card-body">
                        <h2 className="card-title text-2xl mb-4">
                            <MapPin className="w-6 h-6" />
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Link
                                href="/dashboard/rider/my-tasks"
                                className="flex items-center gap-4 p-4 bg-primary/10 border-2 border-primary/20 rounded-lg hover:bg-primary/20 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Package className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-base-content">My Tasks</div>
                                    <div className="text-sm text-base-content/60">
                                        {stats.pendingDeliveries} pending
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
                                    <div className="font-bold text-base-content">Earnings</div>
                                    <div className="text-sm text-base-content/60">
                                        ${stats.totalEarnings.toFixed(2)}
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
                                    <div className="font-bold text-base-content">Location</div>
                                    <div className="text-sm text-base-content/60">Update status</div>
                                </div>
                            </Link>

                            <Link
                                href="/orders"
                                className="flex items-center gap-4 p-4 bg-warning/10 border-2 border-warning/20 rounded-lg hover:bg-warning/20 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-lg bg-warning/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Calendar className="w-6 h-6 text-warning" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-base-content">History</div>
                                    <div className="text-sm text-base-content/60">
                                        {stats.totalDeliveries} completed
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Performance Summary */}
                <div className="card bg-linear-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
                    <div className="card-body">
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
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="px-4 py-2 bg-base-100 rounded-lg">
                                        <div className="text-xs text-base-content/60">On-Time Rate</div>
                                        <div className="font-bold text-success">98%</div>
                                    </div>
                                    <div className="px-4 py-2 bg-base-100 rounded-lg">
                                        <div className="text-xs text-base-content/60">Customer Rating</div>
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
                    </div>
                </div>

                {/* No Data State */}
                {stats.totalDeliveries === 0 && stats.pendingDeliveries === 0 && (
                    <div className="card bg-info/10 border-2 border-info/20">
                        <div className="card-body text-center py-12">
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
                    </div>
                )}
            </div>
        </ProtectedRoute>
    )
}
