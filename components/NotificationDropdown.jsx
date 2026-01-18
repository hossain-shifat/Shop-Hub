'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, Check, Trash2, CheckCheck, ShoppingBag, Package, CreditCard, User, AlertCircle, CheckCircle, XCircle, Truck, Lock, UserCheck, Star, AlertTriangle, UserPlus } from 'lucide-react'
import Link from 'next/link'
import useNotifications from '@/lib/hooks/useNotifications'

const iconMap = {
    Bell,
    ShoppingBag,
    Package,
    CreditCard,
    User,
    AlertCircle,
    CheckCircle,
    XCircle,
    Truck,
    Lock,
    UserCheck,
    Star,
    AlertTriangle,
    UserPlus
}

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearRead
    } = useNotifications()

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await markAsRead(notification._id)
        }
        setIsOpen(false)
    }

    const handleMarkAllRead = async () => {
        await markAllAsRead()
    }

    const handleClearRead = async () => {
        await clearRead()
    }

    const getIcon = (iconName) => {
        const Icon = iconMap[iconName] || Bell
        return Icon
    }

    const getTimeAgo = (date) => {
        const now = new Date()
        const then = new Date(date)
        const seconds = Math.floor((now - then) / 1000)

        if (seconds < 60) return 'Just now'
        const minutes = Math.floor(seconds / 60)
        if (minutes < 60) return `${minutes}m ago`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours}h ago`
        const days = Math.floor(hours / 24)
        if (days < 7) return `${days}d ago`
        const weeks = Math.floor(days / 7)
        if (weeks < 4) return `${weeks}w ago`
        return 'A while ago'
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-lg bg-base-300 hover:bg-base-200 transition-all duration-200 group"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5 text-base-content group-hover:scale-110 transition-transform" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-96 max-w-[calc(100vw-2rem)] bg-base-100 rounded-2xl shadow-2xl border border-base-300 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-base-300 bg-linear-to-r from-primary/10 to-secondary/10">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-base-content flex items-center gap-2">
                                <Bell className="w-5 h-5 text-primary" />
                                Notifications
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="btn btn-ghost btn-sm btn-circle"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        {unreadCount > 0 && (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleMarkAllRead}
                                    className="btn btn-xs btn-primary gap-1"
                                >
                                    <CheckCheck className="w-3 h-3" />
                                    Mark all read
                                </button>
                                <button
                                    onClick={handleClearRead}
                                    className="btn btn-xs btn-ghost gap-1"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Clear read
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="max-h-100 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="loading loading-spinner loading-md text-primary mx-auto"></div>
                                <p className="text-sm text-base-content/60 mt-2">Loading notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-3">
                                    <Bell className="w-8 h-8 text-base-content/30" />
                                </div>
                                <p className="text-base-content/70 font-semibold">No notifications</p>
                                <p className="text-sm text-base-content/50 mt-1">You&apos;re all caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-base-300">
                                {notifications.map((notification) => {
                                    const Icon = getIcon(notification.icon)
                                    const NotificationWrapper = notification.link ? Link : 'div'
                                    const wrapperProps = notification.link
                                        ? { href: notification.link, onClick: () => handleNotificationClick(notification) }
                                        : { onClick: () => handleNotificationClick(notification) }

                                    return (
                                        <NotificationWrapper
                                            key={notification._id}
                                            {...wrapperProps}
                                            className={`block p-4 hover:bg-base-200 transition-colors cursor-pointer group ${!notification.read ? 'bg-primary/5' : ''
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`shrink-0 w-10 h-10 rounded-full ${!notification.read
                                                        ? 'bg-linear-to-br from-primary to-secondary'
                                                        : 'bg-base-300'
                                                    } flex items-center justify-center`}>
                                                    <Icon className={`w-5 h-5 ${!notification.read ? 'text-white' : 'text-base-content/60'
                                                        }`} />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <h4 className={`font-semibold text-sm ${!notification.read ? 'text-base-content' : 'text-base-content/70'
                                                            } line-clamp-1`}>
                                                            {notification.title}
                                                        </h4>
                                                        {!notification.read && (
                                                            <span className="shrink-0 w-2 h-2 rounded-full bg-primary"></span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-base-content/60 line-clamp-2 mb-2">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-base-content/50">
                                                            {getTimeAgo(notification.createdAt)}
                                                        </span>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {!notification.read && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault()
                                                                        e.stopPropagation()
                                                                        markAsRead(notification._id)
                                                                    }}
                                                                    className="btn btn-xs btn-ghost gap-1"
                                                                    title="Mark as read"
                                                                >
                                                                    <Check className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault()
                                                                    e.stopPropagation()
                                                                    deleteNotification(notification._id)
                                                                }}
                                                                className="btn btn-xs btn-ghost gap-1 text-error"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </NotificationWrapper>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-base-300 bg-base-200 text-center">
                            <Link
                                href="/notifications"
                                className="text-sm text-primary hover:text-primary/80 font-semibold"
                                onClick={() => setIsOpen(false)}
                            >
                                View all notifications
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
