'use client'

import { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/firebase/config'
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore'
import useFirebaseAuth from './useFirebaseAuth'

export default function useNotifications() {
    const { user } = useFirebaseAuth()
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)

    // Fetch notifications from MongoDB
    const fetchNotifications = useCallback(async () => {
        if (!user) {
            setNotifications([])
            setUnreadCount(0)
            setLoading(false)
            return
        }

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/notifications/user/${user.uid}`
            )
            const data = await response.json()

            if (data.success) {
                setNotifications(data.notifications)
                setUnreadCount(data.unreadCount)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setLoading(false)
        }
    }, [user])

    // Real-time listener using Firestore
    useEffect(() => {
        if (!user?.uid) {
            setLoading(false)
            return
        }

        setLoading(true)

        // Listen to Firestore for real-time updates
        const notificationsRef = collection(db, 'notifications')
        const q = query(
            notificationsRef,
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(50)
        )

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                // When Firestore updates, fetch from MongoDB
                fetchNotifications()
            },
            (error) => {
                console.error('Firestore listener error:', error)
                setLoading(false)
            }
        )

        // Initial fetch
        fetchNotifications()

        return () => unsubscribe()
    }, [user?.uid, fetchNotifications])

    // Mark notification as read
    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}/read`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' }
                }
            )

            const data = await response.json()

            if (data.success) {
                // Update local state
                setNotifications(prev =>
                    prev.map(n =>
                        n._id === notificationId
                            ? { ...n, read: true, readAt: new Date() }
                            : n
                    )
                )
                setUnreadCount(prev => Math.max(0, prev - 1))
                return true
            }
            return false
        } catch (error) {
            console.error('Error marking notification as read:', error)
            return false
        }
    }

    // Mark all as read
    const markAllAsRead = async () => {
        if (!user) return false

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/notifications/user/${user.uid}/read-all`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' }
                }
            )

            const data = await response.json()

            if (data.success) {
                setNotifications(prev =>
                    prev.map(n => ({ ...n, read: true, readAt: new Date() }))
                )
                setUnreadCount(0)
                return true
            }
            return false
        } catch (error) {
            console.error('Error marking all as read:', error)
            return false
        }
    }

    // Delete notification
    const deleteNotification = async (notificationId) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}`,
                {
                    method: 'DELETE'
                }
            )

            const data = await response.json()

            if (data.success) {
                setNotifications(prev => prev.filter(n => n._id !== notificationId))
                return true
            }
            return false
        } catch (error) {
            console.error('Error deleting notification:', error)
            return false
        }
    }

    // Clear all read notifications
    const clearRead = async () => {
        if (!user) return false

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/notifications/user/${user.uid}/clear-read`,
                {
                    method: 'DELETE'
                }
            )

            const data = await response.json()

            if (data.success) {
                setNotifications(prev => prev.filter(n => !n.read))
                return true
            }
            return false
        } catch (error) {
            console.error('Error clearing read notifications:', error)
            return false
        }
    }

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearRead,
        refresh: fetchNotifications
    }
}
