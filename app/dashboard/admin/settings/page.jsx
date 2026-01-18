'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Bell, Shield, Eye, EyeOff, Save, Loader, Camera, AlertCircle, Check } from 'lucide-react'

export default function DashboardSettings() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [activeTab, setActiveTab] = useState('profile')

    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        photoURL: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        orderUpdates: true,
        productUpdates: false,
        newsletter: false
    })

    const [errors, setErrors] = useState({})

    // Load user data from Firebase Auth
    useEffect(() => {
        const loadUserData = async () => {
            try {
                // Simulate Firebase Auth - replace with actual Firebase implementation
                // const auth = window.auth || {}
                // const currentUser = auth.currentUser

                // For demo: Check if user is logged in via your auth system
                const mockUser = {
                    uid: 'demo-user-123',
                    email: 'user@example.com',
                    displayName: 'John Doe',
                    photoURL: '',
                    providerData: [{ providerId: 'password' }]
                }

                setUser(mockUser)
                setFormData({
                    displayName: mockUser.displayName || '',
                    email: mockUser.email || '',
                    photoURL: mockUser.photoURL || '',
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                })

                // Load additional user data from backend
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`)
                    if (response.ok) {
                        const data = await response.json()
                        if (data.success && data.user) {
                            setFormData(prev => ({
                                ...prev,
                                displayName: data.user.displayName || prev.displayName,
                                photoURL: data.user.photoURL || prev.photoURL
                            }))
                        }
                    }
                } catch (error) {
                    console.log('Backend user data not available:', error)
                }
            } catch (error) {
                console.error('Error loading user data:', error)
                showToast('Failed to load user data', 'error')
            } finally {
                setLoading(false)
            }
        }

        loadUserData()
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleNotificationChange = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const validateProfileForm = () => {
        const newErrors = {}

        if (!formData.displayName.trim()) {
            newErrors.displayName = 'Display name is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const validatePasswordForm = () => {
        const newErrors = {}

        if (!formData.currentPassword) {
            newErrors.currentPassword = 'Current password is required'
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required'
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters'
        }

        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const showToast = (message, type = 'success') => {
        const toastId = Date.now()
        const toast = document.createElement('div')
        toast.id = `toast-${toastId}`
        toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl animate-slide-in flex items-center gap-3 ${type === 'success'
                ? 'bg-success text-success-content'
                : 'bg-error text-error-content'
            }`

        toast.innerHTML = `
            <div class="w-6 h-6 rounded-full ${type === 'success' ? 'bg-success-content/20' : 'bg-error-content/20'} flex items-center justify-center">
                ${type === 'success' ? '✓' : '✕'}
            </div>
            <span class="font-medium">${message}</span>
        `

        document.body.appendChild(toast)

        setTimeout(() => {
            toast.style.animation = 'slide-out 0.3s ease-out'
            setTimeout(() => toast.remove(), 300)
        }, 3000)
    }

    const handleUpdateProfile = async () => {
        if (!validateProfileForm()) return

        setSaving(true)
        try {
            if (!user) throw new Error('No user logged in')

            // Update backend database
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    displayName: formData.displayName,
                    photoURL: formData.photoURL
                })
            })

            const data = await response.json()

            if (data.success) {
                showToast('Profile updated successfully!', 'success')
                setUser(prev => ({
                    ...prev,
                    displayName: formData.displayName,
                    photoURL: formData.photoURL
                }))
            } else {
                throw new Error(data.error || 'Failed to update profile')
            }
        } catch (error) {
            console.error('Update error:', error)
            showToast(error.message || 'Failed to update profile', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleChangePassword = async () => {
        if (!validatePasswordForm()) return

        setSaving(true)
        try {
            if (!user) throw new Error('No user logged in')

            // Simulate password change - replace with actual Firebase implementation
            await new Promise(resolve => setTimeout(resolve, 1000))

            showToast('Password changed successfully!', 'success')

            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }))
        } catch (error) {
            console.error('Password change error:', error)
            showToast(error.message || 'Failed to change password', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleSaveNotifications = async () => {
        setSaving(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 500))
            showToast('Notification preferences saved!', 'success')
        } catch (error) {
            showToast('Failed to save preferences', 'error')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-base-100">
                <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-base-content/70">Loading settings...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-base-100">
                <AlertCircle className="w-16 h-16 text-error mb-4" />
                <h2 className="text-2xl font-bold mb-2">Not Authenticated</h2>
                <p className="text-base-content/70">Please log in to access settings</p>
            </div>
        )
    }

    const notificationDetails = {
        emailNotifications: {
            icon: Mail,
            title: 'Email Notifications',
            description: 'Receive email updates about your account'
        },
        orderUpdates: {
            icon: Bell,
            title: 'Order Updates',
            description: 'Get notified when your order status changes'
        },
        productUpdates: {
            icon: Bell,
            title: 'Product Updates',
            description: 'Receive updates about new products and features'
        },
        newsletter: {
            icon: Mail,
            title: 'Newsletter',
            description: 'Subscribe to our weekly newsletter and tips'
        }
    }

    return (
        <div className="min-h-screen bg-base-100">
            <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-base-content mb-2">Account Settings</h1>
                    <p className="text-base-content/70">Manage your account preferences and security</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 mb-8 border-b border-base-300 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-4 sm:px-6 py-3 font-semibold transition-all relative whitespace-nowrap ${activeTab === 'profile'
                                ? 'text-primary'
                                : 'text-base-content/60 hover:text-base-content'
                            }`}
                    >
                        <User className="w-5 h-5 inline-block mr-2" />
                        <span className="hidden sm:inline">Profile</span>
                        {activeTab === 'profile' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`px-4 sm:px-6 py-3 font-semibold transition-all relative whitespace-nowrap ${activeTab === 'security'
                                ? 'text-primary'
                                : 'text-base-content/60 hover:text-base-content'
                            }`}
                    >
                        <Shield className="w-5 h-5 inline-block mr-2" />
                        <span className="hidden sm:inline">Security</span>
                        {activeTab === 'security' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`px-4 sm:px-6 py-3 font-semibold transition-all relative whitespace-nowrap ${activeTab === 'notifications'
                                ? 'text-primary'
                                : 'text-base-content/60 hover:text-base-content'
                            }`}
                    >
                        <Bell className="w-5 h-5 inline-block mr-2" />
                        <span className="hidden sm:inline">Notifications</span>
                        {activeTab === 'notifications' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="max-w-2xl">
                        <div className="bg-base-200 rounded-2xl p-6 sm:p-8 shadow-lg">
                            <h2 className="text-2xl font-bold mb-6">Profile Information</h2>

                            {/* Profile Picture */}
                            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-base-300">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full overflow-hidden bg-base-300 ring-4 ring-primary/10">
                                        {formData.photoURL ? (
                                            <img src={formData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-base-content/30">
                                                {formData.displayName?.charAt(0) || formData.email?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all hover:scale-110"
                                    >
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <h3 className="text-lg font-semibold">{formData.displayName || 'User'}</h3>
                                    <p className="text-sm text-base-content/60">{formData.email}</p>
                                    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                        <Check className="w-3 h-3" />
                                        {user.providerData?.[0]?.providerId === 'google.com' ? 'Google Account' : 'Email Account'}
                                    </div>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-base-content">
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        name="displayName"
                                        value={formData.displayName}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 rounded-xl bg-base-100 border-2 transition-all ${errors.displayName
                                                ? 'border-error focus:border-error'
                                                : 'border-base-300 focus:border-primary'
                                            } focus:outline-none`}
                                        placeholder="Enter your display name"
                                    />
                                    {errors.displayName && (
                                        <p className="text-error text-sm mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.displayName}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-base-content">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        className="w-full px-4 py-3 rounded-xl bg-base-300 border-2 border-base-300 cursor-not-allowed opacity-60"
                                        disabled
                                    />
                                    <p className="text-xs text-base-content/50 mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Email cannot be changed
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-base-content">
                                        Photo URL
                                    </label>
                                    <input
                                        type="url"
                                        name="photoURL"
                                        value={formData.photoURL}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-base-100 border-2 border-base-300 focus:border-primary focus:outline-none transition-all"
                                        placeholder="https://example.com/photo.jpg"
                                    />
                                </div>

                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={saving}
                                    className="w-full bg-gradient-to-r from-primary to-secondary text-primary-content py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                    {saving ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            Saving Changes...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="max-w-2xl">
                        <div className="bg-base-200 rounded-2xl p-6 sm:p-8 shadow-lg">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-error" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">Change Password</h2>
                                    <p className="text-sm text-base-content/60">Update your account password</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-base-content">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 rounded-xl bg-base-100 border-2 transition-all pr-12 ${errors.currentPassword
                                                    ? 'border-error focus:border-error'
                                                    : 'border-base-300 focus:border-primary'
                                                } focus:outline-none`}
                                            placeholder="Enter current password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {errors.currentPassword && (
                                        <p className="text-error text-sm mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.currentPassword}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-base-content">
                                        New Password
                                    </label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 rounded-xl bg-base-100 border-2 transition-all ${errors.newPassword
                                                ? 'border-error focus:border-error'
                                                : 'border-base-300 focus:border-primary'
                                            } focus:outline-none`}
                                        placeholder="Enter new password"
                                    />
                                    {errors.newPassword && (
                                        <p className="text-error text-sm mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.newPassword}
                                        </p>
                                    )}
                                    <p className="text-xs text-base-content/50 mt-1">
                                        Password must be at least 6 characters
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-base-content">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 rounded-xl bg-base-100 border-2 transition-all ${errors.confirmPassword
                                                ? 'border-error focus:border-error'
                                                : 'border-base-300 focus:border-primary'
                                            } focus:outline-none`}
                                        placeholder="Confirm new password"
                                    />
                                    {errors.confirmPassword && (
                                        <p className="text-error text-sm mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.confirmPassword}
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={handleChangePassword}
                                    disabled={saving}
                                    className="w-full bg-error text-error-content py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                    {saving ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            Changing Password...
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="w-5 h-5" />
                                            Change Password
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="max-w-2xl">
                        <div className="bg-base-200 rounded-2xl p-6 sm:p-8 shadow-lg">
                            <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>

                            <div className="space-y-4 mb-6">
                                {Object.entries(notifications).map(([key, value]) => {
                                    const detail = notificationDetails[key]
                                    const Icon = detail.icon

                                    return (
                                        <div
                                            key={key}
                                            className="flex items-center justify-between p-4 bg-base-100 rounded-xl hover:bg-base-100/80 transition-all border border-base-300"
                                        >
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Icon className="w-5 h-5 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-base-content">
                                                        {detail.title}
                                                    </p>
                                                    <p className="text-sm text-base-content/60">
                                                        {detail.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                                                <input
                                                    type="checkbox"
                                                    checked={value}
                                                    onChange={() => handleNotificationChange(key)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-base-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>
                                    )
                                })}
                            </div>

                            <button
                                onClick={handleSaveNotifications}
                                disabled={saving}
                                className="w-full bg-success text-success-content py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                            >
                                {saving ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Saving Preferences...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save Preferences
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slide-out {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
            `}</style>
        </div>
    )
}
