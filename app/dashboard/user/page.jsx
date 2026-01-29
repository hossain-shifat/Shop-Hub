'use client'

import { useEffect, useState } from 'react'
import { ShoppingBag, Package, DollarSign, TrendingUp } from 'lucide-react'
import { LineChart, AreaChart, PieChart, StatsCard } from '../components/charts/Index'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'

export default function UserDashboardHome() {
    const [loading, setLoading] = useState(true)
    const { user, userData } = useFirebaseAuth()
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalSpent: 0
    })
    const [chartData, setChartData] = useState({
        spendingOverTime: [],
        ordersByStatus: [],
        monthlySpending: []
    })

    useEffect(() => {
        if (userData) {
            fetchDashboardData()
        }
    }, [userData])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            // Fetch user's orders
            const ordersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/user/${userData.uid}`)
            const ordersData = await ordersRes.json()
            const orders = ordersData.orders || []

            // Calculate stats
            const totalSpent = orders
                .filter(o => o.paymentStatus === 'completed')
                .reduce((sum, o) => sum + o.total, 0)

            const pendingOrders = orders.filter(o =>
                o.status === 'pending' || o.status === 'processing'
            ).length

            const completedOrders = orders.filter(o =>
                o.status === 'delivered'
            ).length

            // Generate spending over time (last 7 days)
            const now = new Date()
            const spendingOverTime = []
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

                const dayOrders = orders.filter(o => {
                    const oDate = new Date(o.createdAt)
                    return oDate.toDateString() === date.toDateString()
                })

                const daySpending = dayOrders
                    .filter(o => o.paymentStatus === 'completed')
                    .reduce((sum, o) => sum + o.total, 0)

                spendingOverTime.push({
                    name: dateStr,
                    spent: daySpending,
                    orders: dayOrders.length
                })
            }

            // Orders by status
            const statusCounts = orders.reduce((acc, order) => {
                const status = order.status || 'pending'
                acc[status] = (acc[status] || 0) + 1
                return acc
            }, {})

            const ordersByStatus = Object.entries(statusCounts).map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value
            }))

            // Monthly spending (last 6 months)
            const monthlySpending = []
            for (let i = 5; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
                const monthStr = date.toLocaleDateString('en-US', { month: 'short' })

                const monthOrders = orders.filter(o => {
                    const oDate = new Date(o.createdAt)
                    return oDate.getMonth() === date.getMonth() &&
                        oDate.getFullYear() === date.getFullYear()
                })

                const monthSpending = monthOrders
                    .filter(o => o.paymentStatus === 'completed')
                    .reduce((sum, o) => sum + o.total, 0)

                monthlySpending.push({
                    name: monthStr,
                    amount: monthSpending
                })
            }

            setStats({
                totalOrders: orders.length,
                pendingOrders,
                completedOrders,
                totalSpent
            })

            setChartData({
                spendingOverTime,
                ordersByStatus,
                monthlySpending
            })
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-base-content/70">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, {userData?.displayName}!</h1>
                <p className="text-base-content/70">Track your orders and manage your account</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Orders"
                    value={stats.totalOrders.toLocaleString()}
                    icon={ShoppingBag}
                    trend="up"
                />
                <StatsCard
                    title="Pending Orders"
                    value={stats.pendingOrders.toLocaleString()}
                    icon={TrendingUp}
                    trend="up"
                />
                <StatsCard
                    title="Completed Orders"
                    value={stats.completedOrders.toLocaleString()}
                    icon={Package}
                    trend="up"
                />
                <StatsCard
                    title="Total Spent"
                    value={`$${stats.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={DollarSign}
                    trend="up"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AreaChart
                    data={chartData.spendingOverTime}
                    dataKeys={[
                        { key: 'spent', name: 'Spent ($)' },
                        { key: 'orders', name: 'Orders' }
                    ]}
                    title="Spending Activity (Last 7 Days)"
                    colors={['#8b5cf6', '#ec4899']}
                />
                <PieChart
                    data={chartData.ordersByStatus}
                    title="Orders by Status"
                    colors={['#8b5cf6', '#ec4899', '#06b6d4', '#10b981']}
                />
            </div>

            <div className="grid grid-cols-1 gap-6">
                <LineChart
                    data={chartData.monthlySpending}
                    dataKeys={[{ key: 'amount', name: 'Spending ($)' }]}
                    title="Monthly Spending Trend (Last 6 Months)"
                    colors={['#8b5cf6']}
                />
            </div>
        </div>
    )
}
