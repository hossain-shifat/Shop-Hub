'use client'

import { useState, useEffect, useCallback } from 'react'
import useFirebaseAuth from './useFirebaseAuth'

export default function useNotifications() {
    const { user } = useFirebaseAuth()
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        if (!user) {
            setNotifications([])
            setUnreadCount(0)
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/notifications/user/${user.uid}`
            )

            if (!response.ok) {
                throw new Error('Failed to fetch notifications')
            }

            const data = await response.json()

            if (data.success) {
                setNotifications(data.notifications || [])
                setUnreadCount(data.unreadCount || 0)
            }
        } catch (err) {
            console.error('Fetch notifications error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [user])

    // Mark notification as read
    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}/read`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )

            if (!response.ok) {
                throw new Error('Failed to mark notification as read')
            }

            const data = await response.json()

            if (data.success) {
                // Update local state
                setNotifications(prev =>
                    prev.map(n =>
                        n._id === notificationId ? { ...n, read: true } : n
                    )
                )
                setUnreadCount(prev => Math.max(0, prev - 1))
            }
        } catch (err) {
            console.error('Mark as read error:', err)
        }
    }

    // Mark all notifications as read
    const markAllAsRead = async () => {
        if (!user) return

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/notifications/user/${user.uid}/read-all`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )

            if (!response.ok) {
                throw new Error('Failed to mark all as read')
            }

            const data = await response.json()

            if (data.success) {
                // Update local state
                setNotifications(prev =>
                    prev.map(n => ({ ...n, read: true }))
                )
                setUnreadCount(0)
            }
        } catch (err) {
            console.error('Mark all as read error:', err)
        }
    }

    // Delete notification
    const deleteNotification = async (notificationId) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}`,
                {
                    method: 'DELETE',
                }
            )

            if (!response.ok) {
                throw new Error('Failed to delete notification')
            }

            // Update local state
            setNotifications(prev =>
                prev.filter(n => n._id !== notificationId)
            )

            // Update unread count if the deleted notification was unread
            const deletedNotification = notifications.find(n => n._id === notificationId)
            if (deletedNotification && !deletedNotification.read) {
                setUnreadCount(prev => Math.max(0, prev - 1))
            }
        } catch (err) {
            console.error('Delete notification error:', err)
        }
    }

    // Clear all read notifications
    const clearRead = async () => {
        if (!user) return

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/notifications/user/${user.uid}/clear-read`,
                {
                    method: 'DELETE',
                }
            )

            if (!response.ok) {
                throw new Error('Failed to clear read notifications')
            }

            const data = await response.json()

            if (data.success) {
                // Update local state - remove read notifications
                setNotifications(prev =>
                    prev.filter(n => !n.read)
                )
            }
        } catch (err) {
            console.error('Clear read notifications error:', err)
        }
    }

    // Fetch notifications on mount and when user changes
    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    // Poll for new notifications every 30 seconds
    useEffect(() => {
        if (!user) return

        const interval = setInterval(() => {
            fetchNotifications()
        }, 30000) // 30 seconds

        return () => clearInterval(interval)
    }, [user, fetchNotifications])

    return {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearRead,
        refetch: fetchNotifications,
    }
}
