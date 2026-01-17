'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, LogOut, User, Home, ShoppingBag, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import toast from 'react-hot-toast'

export default function DashboardNavbar({ user, role, notifications = [] }) {
    const [showNotifications, setShowNotifications] = useState(false)
    const [showProfile, setShowProfile] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const router = useRouter()
    const notifRef = useRef(null)
    const profileRef = useRef(null)

    useEffect(() => {
        setUnreadCount(notifications.filter(n => !n.read).length)
    }, [notifications])

    useEffect(() => {
        function handleClickOutside(event) {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false)
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfile(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = async () => {
        try {
            await signOut(auth)
            toast.success('Logged out successfully')
            router.push('/login')
        } catch (error) {
            console.error('Logout error:', error)
            toast.error('Failed to logout')
        }
    }

    const markAsRead = async (notificationId) => {
        try {
            await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`
                }
            })
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Failed to mark notification as read:', error)
        }
    }

    return (
        <nav className="bg-base-100 border-b border-base-300 sticky top-0 z-40 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
                {/* Left Section - Breadcrumbs/Search */}
                <div className="flex items-center gap-4 flex-1">
                    <button className="lg:hidden btn btn-ghost btn-sm">
                        <Search className="w-5 h-5" />
                    </button>
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-base-200 rounded-lg min-w-75">
                        <Search className="w-4 h-4 text-base-content/60" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-transparent outline-none flex-1 text-sm"
                        />
                        <kbd className="kbd kbd-xs">⌘K</kbd>
                    </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex items-center gap-3">
                    {/* Notifications */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="btn btn-ghost btn-circle relative"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 bg-error text-error-content text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-base-100 rounded-xl shadow-2xl border border-base-300 overflow-hidden">
                                <div className="p-4 border-b border-base-300 flex items-center justify-between">
                                    <h3 className="font-bold text-base">Notifications</h3>
                                    <button
                                        onClick={() => setShowNotifications(false)}
                                        className="btn btn-ghost btn-xs btn-circle"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-base-content/60">
                                            <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                            <p className="text-sm">No notifications</p>
                                        </div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                onClick={() => !notif.read && markAsRead(notif.id)}
                                                className={`p-4 border-b border-base-300 cursor-pointer hover:bg-base-200 transition-colors ${!notif.read ? 'bg-primary/5' : ''
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-2 h-2 rounded-full mt-2 ${notif.read ? 'bg-base-300' : 'bg-primary'}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm">{notif.title}</p>
                                                        <p className="text-xs text-base-content/70 mt-1">{notif.message}</p>
                                                        <p className="text-xs text-base-content/50 mt-2">{notif.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {notifications.length > 0 && (
                                    <div className="p-3 border-t border-base-300 text-center">
                                        <button className="text-sm text-primary hover:underline font-semibold">
                                            View All Notifications
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* User Profile Dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setShowProfile(!showProfile)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-base-200 transition-all duration-200"
                        >
                            <div className="hidden md:flex flex-col items-end leading-none">
                                <span className="text-sm font-semibold">{user?.displayName || 'User'}</span>
                                <span className="text-xs text-base-content/60 capitalize badge badge-sm badge-outline mt-1">
                                    {role}
                                </span>
                            </div>
                            <div className="avatar">
                                <div className="w-10 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-base-100">
                                    {user?.photoURL ? (
                                        <Image
                                            src={user.photoURL}
                                            alt={user.displayName || 'User'}
                                            width={40}
                                            height={40}
                                        />
                                    ) : (
                                        <div className="bg-primary/10 flex items-center justify-center w-full h-full">
                                            <User className="w-6 h-6 text-primary" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>

                        {showProfile && (
                            <div className="absolute right-0 mt-2 w-64 bg-base-100 rounded-xl shadow-2xl border border-base-300 overflow-hidden">
                                {/* Profile Header */}
                                <div className="bg-linear-to-br from-primary/10 to-secondary/10 p-4 border-b border-base-300">
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="w-12 rounded-full ring-2 ring-primary">
                                                {user?.photoURL ? (
                                                    <Image src={user.photoURL} alt={user.displayName} width={48} height={48} />
                                                ) : (
                                                    <div className="bg-primary/10 flex items-center justify-center w-full h-full">
                                                        <User className="w-6 h-6 text-primary" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate">{user?.displayName || 'User'}</p>
                                            <p className="text-xs text-base-content/60 truncate">{user?.email}</p>
                                            <div className="badge badge-primary badge-sm mt-1 capitalize">{role}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="py-2">
                                    <Link
                                        href="/"
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors"
                                        onClick={() => setShowProfile(false)}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Home className="text-primary w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium">Home</span>
                                    </Link>

                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-info/10 transition-colors"
                                        onClick={() => setShowProfile(false)}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                                            <User className="text-info w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium">Profile</span>
                                    </Link>

                                    {(role === 'user' || role === 'seller') && (
                                        <Link
                                            href="/orders"
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-success/10 transition-colors"
                                            onClick={() => setShowProfile(false)}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                                                <ShoppingBag className="text-success w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium">My Orders</span>
                                        </Link>
                                    )}
                                </div>

                                {/* Logout */}
                                <div className="border-t border-base-300">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-error/10 transition-colors text-error"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center">
                                            <LogOut className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium">Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
