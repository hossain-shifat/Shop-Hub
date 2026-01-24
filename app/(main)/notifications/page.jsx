'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, CheckCheck, Trash2, X, Package, ShoppingCart, CreditCard, Truck, CheckCircle, XCircle, AlertCircle, Star, UserPlus, UserCheck, AlertTriangle, Filter, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import useNotifications from '@/lib/hooks/useNotifications'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import toast from 'react-hot-toast'

const notificationIcons = {
    'order_placed': ShoppingCart,
    'order_confirmed': CheckCircle,
    'order_shipped': Truck,
    'order_delivered': Package,
    'order_cancelled': XCircle,
    'payment_success': CreditCard,
    'payment_failed': AlertCircle,
    'new_order': ShoppingCart,
    'product_approved': CheckCircle,
    'product_rejected': XCircle,
    'new_review': Star,
    'low_stock': AlertTriangle,
    'user_registered': UserPlus,
    'account_created': UserCheck,
    'profile_updated': UserCheck,
    'general': Bell
}

const priorityColors = {
    'low': 'border-base-300 bg-base-100',
    'medium': 'border-info/30 bg-info/5',
    'high': 'border-warning/30 bg-warning/5',
    'urgent': 'border-error/30 bg-error/5'
}

export default function NotificationsPage() {
    const [filter, setFilter] = useState('all') // 'all', 'unread', 'read'
    const [typeFilter, setTypeFilter] = useState('all') // notification type filter
    const { user } = useFirebaseAuth()

    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
        refresh
    } = useNotifications(user?.uid)

    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000)

        if (seconds < 60) return 'Just now'
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const handleMarkAllAsRead = async () => {
        const success = await markAllAsRead()
        if (success) {
            toast.success('All notifications marked as read')
            refresh()
        } else {
            toast.error('Failed to mark all as read')
        }
    }

    const handleClearAll = async () => {
        if (window.confirm('Are you sure you want to delete all notifications?')) {
            const success = await deleteAllNotifications()
            if (success) {
                toast.success('All notifications deleted')
            } else {
                toast.error('Failed to delete notifications')
            }
        }
    }

    const handleDelete = async (notificationId) => {
        const success = await deleteNotification(notificationId)
        if (success) {
            toast.success('Notification deleted')
        } else {
            toast.error('Failed to delete notification')
        }
    }

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await markAsRead(notification._id)
        }
    }

    // Filter notifications
    let filteredNotifications = notifications

    if (filter === 'unread') {
        filteredNotifications = filteredNotifications.filter(n => !n.read)
    } else if (filter === 'read') {
        filteredNotifications = filteredNotifications.filter(n => n.read)
    }

    if (typeFilter !== 'all') {
        filteredNotifications = filteredNotifications.filter(n => n.type === typeFilter)
    }

    // Get unique notification types
    const notificationTypes = [...new Set(notifications.map(n => n.type))]

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    }

    return (
        <div className="min-h-screen">
            <div className="section-padding">
                <div className="container-custom max-w-5xl">
                    {/* Header */}
                    <motion.div {...fadeInUp} className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-2">
                                    Notifications
                                </h1>
                                <p className="text-base-content/70">
                                    Stay updated with all your activities
                                </p>
                            </div>
                            <button
                                onClick={refresh}
                                disabled={loading}
                                className="btn btn-circle btn-ghost"
                                aria-label="Refresh"
                            >
                                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="card bg-base-200 p-4">
                                <div className="text-sm text-base-content/60">Total</div>
                                <div className="text-2xl font-bold text-base-content">{notifications.length}</div>
                            </div>
                            <div className="card bg-primary/10 p-4">
                                <div className="text-sm text-primary/80">Unread</div>
                                <div className="text-2xl font-bold text-primary">{unreadCount}</div>
                            </div>
                            <div className="card bg-success/10 p-4">
                                <div className="text-sm text-success/80">Read</div>
                                <div className="text-2xl font-bold text-success">{notifications.length - unreadCount}</div>
                            </div>
                            <div className="card bg-info/10 p-4">
                                <div className="text-sm text-info/80">Types</div>
                                <div className="text-2xl font-bold text-info">{notificationTypes.length}</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card bg-base-200 p-6 mb-6"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            {/* Read Status Filter */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${filter === 'all'
                                            ? 'bg-linear-to-r from-primary to-secondary text-primary-content'
                                            : 'bg-base-100 text-base-content hover:bg-base-300'
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilter('unread')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${filter === 'unread'
                                            ? 'bg-linear-to-r from-primary to-secondary text-primary-content'
                                            : 'bg-base-100 text-base-content hover:bg-base-300'
                                        }`}
                                >
                                    Unread
                                </button>
                                <button
                                    onClick={() => setFilter('read')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${filter === 'read'
                                            ? 'bg-linear-to-r from-primary to-secondary text-primary-content'
                                            : 'bg-base-100 text-base-content hover:bg-base-300'
                                        }`}
                                >
                                    Read
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={handleMarkAllAsRead}
                                    disabled={unreadCount === 0}
                                    className="btn btn-sm bg-primary text-primary-content hover:opacity-90 disabled:opacity-50"
                                >
                                    <CheckCheck size={16} />
                                    Mark all read
                                </button>
                                <button
                                    onClick={handleClearAll}
                                    disabled={notifications.length === 0}
                                    className="btn btn-sm bg-error text-error-content hover:opacity-90 disabled:opacity-50"
                                >
                                    <Trash2 size={16} />
                                    Clear all
                                </button>
                            </div>
                        </div>

                        {/* Type Filter */}
                        {notificationTypes.length > 1 && (
                            <div className="mt-4 pt-4 border-t border-base-300">
                                <div className="flex items-center gap-2 mb-2">
                                    <Filter size={16} className="text-base-content/60" />
                                    <span className="text-sm font-semibold text-base-content/80">Filter by type:</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setTypeFilter('all')}
                                        className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${typeFilter === 'all'
                                                ? 'bg-primary text-primary-content'
                                                : 'bg-base-100 text-base-content hover:bg-base-300'
                                            }`}
                                    >
                                        All types
                                    </button>
                                    {notificationTypes.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setTypeFilter(type)}
                                            className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all capitalize ${typeFilter === type
                                                    ? 'bg-primary text-primary-content'
                                                    : 'bg-base-100 text-base-content hover:bg-base-300'
                                                }`}
                                        >
                                            {type.replace(/_/g, ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Notifications List */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="card bg-base-200 p-12 text-center">
                                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-base-content/70">Loading notifications...</p>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="card bg-base-200 p-12 text-center"
                            >
                                <Bell className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-base-content mb-2">
                                    {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                                </h3>
                                <p className="text-base-content/60">
                                    {filter === 'unread' ? "You're all caught up!" : "Notifications will appear here when you have updates"}
                                </p>
                            </motion.div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {filteredNotifications.map((notification, index) => {
                                    const IconComponent = notificationIcons[notification.type] || Bell
                                    const priorityClass = priorityColors[notification.priority] || priorityColors.medium

                                    return (
                                        <motion.div
                                            key={notification._id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`card border-2 ${priorityClass} hover:shadow-xl transition-all duration-300 group relative overflow-hidden`}
                                        >
                                            {/* Unread indicator bar */}
                                            {!notification.read && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                                            )}

                                            <div className="flex gap-4 p-6">
                                                {/* Icon */}
                                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${notification.priority === 'urgent' ? 'bg-error/10 text-error' :
                                                        notification.priority === 'high' ? 'bg-warning/10 text-warning' :
                                                            notification.priority === 'medium' ? 'bg-info/10 text-info' :
                                                                'bg-base-300 text-base-content'
                                                    }`}>
                                                    <IconComponent size={24} />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    {notification.link ? (
                                                        <Link
                                                            href={notification.link}
                                                            onClick={() => handleNotificationClick(notification)}
                                                            className="block"
                                                        >
                                                            <NotificationContent
                                                                notification={notification}
                                                                formatTimeAgo={formatTimeAgo}
                                                            />
                                                        </Link>
                                                    ) : (
                                                        <div onClick={() => handleNotificationClick(notification)}>
                                                            <NotificationContent
                                                                notification={notification}
                                                                formatTimeAgo={formatTimeAgo}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!notification.read && (
                                                        <button
                                                            onClick={() => markAsRead(notification._id)}
                                                            className="btn btn-sm btn-ghost"
                                                            title="Mark as read"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(notification._id)}
                                                        className="btn btn-sm btn-ghost text-error"
                                                        title="Delete"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function NotificationContent({ notification, formatTimeAgo }) {
    return (
        <>
            <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className={`font-bold text-base ${!notification.read ? 'text-base-content' : 'text-base-content/70'}`}>
                    {notification.title}
                </h3>
                {notification.priority === 'urgent' && (
                    <span className="badge badge-error badge-sm">Urgent</span>
                )}
            </div>
            <p className="text-sm text-base-content/70 mb-3 line-clamp-2">
                {notification.message}
            </p>
            <div className="flex items-center gap-4 text-xs text-base-content/50">
                <span className="flex items-center gap-1">
                    {formatTimeAgo(notification.createdAt)}
                </span>
                <span className="capitalize">
                    {notification.type.replace(/_/g, ' ')}
                </span>
                {notification.read && (
                    <span className="flex items-center gap-1 text-success">
                        <Check size={12} />
                        Read
                    </span>
                )}
            </div>
        </>
    )
}
