'use client'

import { useEffect, useState } from 'react'
import { Activity, User, Package, ShoppingCart, CreditCard, Calendar, Search } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Loading from '../../loading'

export default function AdminSystemLogs() {
    const [logs, setLogs] = useState([])
    const [filteredLogs, setFilteredLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionFilter, setActionFilter] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchLogs()
    }, [])

    useEffect(() => {
        filterLogs()
    }, [actionFilter, searchQuery, logs])

    const fetchLogs = async () => {
        try {
            setLoading(true)

            const [ordersRes, productsRes, usersRes, paymentsRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/users`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`)
            ])

            const [ordersData, productsData, usersData, paymentsData] = await Promise.all([
                ordersRes.json(),
                productsRes.json(),
                usersRes.json(),
                paymentsRes.json()
            ])

            const activityLogs = [
                ...(ordersData.orders || []).map(o => ({
                    id: `order-${o.orderId}`,
                    action: 'Order Placed',
                    actionType: 'order',
                    userId: o.userId,
                    details: `Order #${o.orderId} - $${o.total.toFixed(2)}`,
                    status: o.status,
                    timestamp: new Date(o.createdAt).getTime(),
                    date: o.createdAt
                })),
                ...(productsData.products || []).map(p => ({
                    id: `product-${p.id}`,
                    action: 'Product Added',
                    actionType: 'product',
                    userId: p.userId || 'system',
                    details: `${p.name} - ${p.category}`,
                    status: 'active',
                    timestamp: new Date(p.createdAt || Date.now()).getTime(),
                    date: p.createdAt || new Date().toISOString()
                })),
                ...(usersData.users || []).map(u => ({
                    id: `user-${u.uid}`,
                    action: 'User Registered',
                    actionType: 'user',
                    userId: u.uid,
                    details: `${u.displayName} (${u.email}) - Role: ${u.role}`,
                    status: 'active',
                    timestamp: new Date(u.createdAt).getTime(),
                    date: u.createdAt
                })),
                ...(paymentsData.payments || []).map(p => ({
                    id: `payment-${p._id}`,
                    action: 'Payment Processed',
                    actionType: 'payment',
                    userId: 'system',
                    details: `${p.orderId} - $${p.amount.toFixed(2)} - ${p.status}`,
                    status: p.status,
                    timestamp: new Date(p.createdAt).getTime(),
                    date: p.createdAt
                }))
            ].sort((a, b) => b.timestamp - a.timestamp)

            setLogs(activityLogs)
            setFilteredLogs(activityLogs)
        } catch (error) {
            console.error('Failed to fetch logs:', error)
        } finally {
            setLoading(false)
        }
    }

    const filterLogs = () => {
        let filtered = logs

        if (actionFilter !== 'all') {
            filtered = filtered.filter(log => log.actionType === actionFilter)
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(log =>
                log.details?.toLowerCase().includes(query) ||
                log.userId?.toLowerCase().includes(query) ||
                log.action?.toLowerCase().includes(query)
            )
        }

        setFilteredLogs(filtered)
    }

    const getActionIcon = (actionType) => {
        const icons = {
            user: User,
            product: Package,
            order: ShoppingCart,
            payment: CreditCard
        }
        const Icon = icons[actionType] || Activity
        return <Icon className="w-5 h-5" />
    }

    const getActionColor = (actionType) => {
        const colors = {
            user: 'bg-info/10 text-info',
            product: 'bg-success/10 text-success',
            order: 'bg-primary/10 text-primary',
            payment: 'bg-warning/10 text-warning'
        }
        return colors[actionType] || 'bg-base-300 text-base-content'
    }

    const actionFilters = [
        { value: 'all', label: 'All Activities', count: logs.length },
        { value: 'user', label: 'User Activity', count: logs.filter(l => l.actionType === 'user').length },
        { value: 'product', label: 'Products', count: logs.filter(l => l.actionType === 'product').length },
        { value: 'order', label: 'Orders', count: logs.filter(l => l.actionType === 'order').length },
        { value: 'payment', label: 'Payments', count: logs.filter(l => l.actionType === 'payment').length }
    ]

    const columns = [
        {
            header: 'Action',
            accessor: 'action',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getActionColor(row.actionType)}`}>
                        {getActionIcon(row.actionType)}
                    </div>
                    <div>
                        <div className="font-semibold">{row.action}</div>
                        <div className="text-xs text-base-content/60">{row.actionType}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Details',
            accessor: 'details',
            render: (row) => <span className="text-sm">{row.details}</span>
        },
        {
            header: 'User ID',
            accessor: 'userId',
            render: (row) => <span className="font-mono text-xs">{row.userId.slice(0, 12)}...</span>
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <span className={`badge ${row.status === 'active' || row.status === 'delivered' || row.status === 'succeeded' || row.status === 'completed'
                    ? 'badge-success'
                    : row.status === 'pending' || row.status === 'processing'
                        ? 'badge-warning'
                        : 'badge-error'
                    }`}>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Date & Time',
            accessor: 'date',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-base-content/60" />
                    <div className="text-sm">
                        <div>{new Date(row.date).toLocaleDateString()}</div>
                        <div className="text-xs text-base-content/60">
                            {new Date(row.date).toLocaleTimeString()}
                        </div>
                    </div>
                </div>
            )
        }
    ]

    if (loading) {
        return (
            <Loading />
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">System Logs</h1>
                <p className="text-base-content/70">Track all system activities and user actions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{logs.length}</p>
                            <p className="text-sm text-base-content/70">Total Activities</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
                            <User className="w-6 h-6 text-info" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{logs.filter(l => l.actionType === 'user').length}</p>
                            <p className="text-sm text-base-content/70">User Actions</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-success" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{logs.filter(l => l.actionType === 'order').length}</p>
                            <p className="text-sm text-base-content/70">Orders</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-warning" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{logs.filter(l => l.actionType === 'payment').length}</p>
                            <p className="text-sm text-base-content/70">Payments</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
                {actionFilters.map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => setActionFilter(filter.value)}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap ${actionFilter === filter.value
                            ? 'bg-linear-to-r from-primary to-secondary text-primary-content shadow-lg'
                            : 'bg-base-200 text-base-content hover:bg-base-300'
                            }`}
                    >
                        {filter.label} ({filter.count})
                    </button>
                ))}
            </div>

            <div className="card bg-base-200 p-6">
                <div className="form-control">
                    <div className="input">
                        <span className="">
                            <Search className="w-5 h-5" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search logs..."
                            className="flex-1"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="card bg-base-200 p-6">
                <DataTable
                    columns={columns}
                    data={filteredLogs}
                    itemsPerPage={5}
                    emptyMessage="No logs found"
                    EmptyIcon={Activity}
                />
            </div>
        </div>
    )
}
