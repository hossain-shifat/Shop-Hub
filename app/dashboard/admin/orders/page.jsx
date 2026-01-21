'use client'

import { useEffect, useState } from 'react'
import { Search, Package, Clock, CheckCircle, Calendar } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import DataTable from '../../components/DataTable'
import Loading from '../../loading'

export default function AdminOrders() {
    const [orders, setOrders] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        fetchOrders()
    }, [])

    useEffect(() => {
        filterOrders()
    }, [searchQuery, statusFilter, orders])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`)
            const data = await response.json()

            if (data.success) {
                setOrders(data.orders || [])
                setFilteredOrders(data.orders || [])
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error)
            toast.error('Failed to load orders')
        } finally {
            setLoading(false)
        }
    }

    const filterOrders = () => {
        let filtered = orders

        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter)
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(order =>
                order.orderId?.toLowerCase().includes(query) ||
                order.userId?.toLowerCase().includes(query)
            )
        }

        setFilteredOrders(filtered)
    }

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                }
            )

            const data = await response.json()

            if (data.success) {
                toast.success('Order status updated')
                setOrders(orders.map(o =>
                    o.orderId === orderId ? { ...o, status: newStatus } : o
                ))
            } else {
                toast.error(data.error || 'Failed to update status')
            }
        } catch (error) {
            console.error('Failed to update status:', error)
            toast.error('Failed to update status')
        }
    }

    const statusFilters = [
        { value: 'all', label: 'All Orders', count: orders.length },
        { value: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
        { value: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing' || o.status === 'confirmed').length },
        { value: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
        { value: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length }
    ]

    const totalRevenue = orders
        .filter(o => o.paymentStatus === 'completed')
        .reduce((sum, o) => sum + o.total, 0)

    const columns = [
        {
            header: 'Order ID',
            accessor: 'orderId',
            render: (row) => <span className="font-mono text-sm">{row.orderId}</span>
        },
        {
            header: 'Date',
            accessor: 'createdAt',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-base-content/60" />
                    <span className="text-sm">{new Date(row.createdAt).toLocaleDateString()}</span>
                </div>
            )
        },
        {
            header: 'Items',
            accessor: 'items',
            render: (row) => (
                <div className="flex items-center gap-2">
                    {row.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="avatar">
                            <div className="w-8 h-8 rounded">
                                {item.image ? (
                                    <Image src={item.image} alt={item.name} width={32} height={32} className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-base-300 flex items-center justify-center">
                                        <Package className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {row.items.length > 3 && (
                        <span className="text-xs text-base-content/60">+{row.items.length - 3}</span>
                    )}
                </div>
            )
        },
        {
            header: 'Total',
            accessor: 'total',
            render: (row) => <span className="font-bold text-primary">${row.total.toFixed(2)}</span>
        },
        {
            header: 'Payment',
            accessor: 'paymentStatus',
            render: (row) => (
                <span className={`badge ${row.paymentStatus === 'completed' ? 'badge-success' : 'badge-warning'
                    }`}>
                    {row.paymentStatus}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <select
                    className="select select-sm select-bordered"
                    value={row.status}
                    onChange={(e) => handleUpdateStatus(row.orderId, e.target.value)}
                >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            )
        }
    ]

    if (loading) {
        return (
           <Loading/>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">All Orders</h1>
                <p className="text-base-content/70">Manage and track all customer orders</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Package className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{orders.length}</p>
                            <p className="text-sm text-base-content/70">Total Orders</p>
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
                                {orders.filter(o => o.status === 'pending' || o.status === 'processing').length}
                            </p>
                            <p className="text-sm text-base-content/70">Pending</p>
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
                                {orders.filter(o => o.status === 'delivered').length}
                            </p>
                            <p className="text-sm text-base-content/70">Delivered</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-200 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
                            <Package className="w-6 h-6 text-info" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                            <p className="text-sm text-base-content/70">Revenue</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
                {statusFilters.map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => setStatusFilter(filter.value)}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap ${statusFilter === filter.value
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
                            placeholder="Search by order ID or user ID..."
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
                    data={filteredOrders}
                    itemsPerPage={5}
                    emptyMessage="No orders found"
                    EmptyIcon={Package}
                />
            </div>
        </div>
    )
}
