'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Lock,
    Bell,
    Shield,
    Eye,
    EyeOff,
    Smartphone,
    Mail,
    Globe,
    Trash2,
    Download
} from 'lucide-react'

export default function SettingsPage() {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [settings, setSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        orderUpdates: true,
        promotions: true,
        newsletter: false,
        twoFactorAuth: false,
        loginAlerts: true
    })

    const handleToggle = (key) => {
        setSettings({
            ...settings,
            [key]: !settings[key]
        })
    }

    const handlePasswordChange = (e) => {
        e.preventDefault()
        alert('Password changed successfully!')
    }

    const handleExportData = () => {
        alert("Your data export has been initiated. You will receive an email when it's ready.")
    }

    const handleDeleteAccount = () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            alert('Account deletion initiated. You will receive a confirmation email.')
        }
    }

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    }

    const ToggleSwitch = ({ enabled, onToggle }) => (
        <button
            onClick={onToggle}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${enabled
                    ? 'bg-gradient-to-r from-primary to-secondary'
                    : 'bg-base-300'
                }`}
        >
            <div
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
            />
        </button>
    )

    return (
        <div className="min-h-screen pt-32">
            <div className="section-padding">
                <div className="container-custom max-w-4xl">

                    {/* Header */}
                    <motion.div {...fadeInUp} className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-2">
                            Settings
                        </h1>
                        <p className="text-base-content/70">
                            Manage your account settings and preferences
                        </p>
                    </motion.div>

                    <div className="space-y-6">

                        {/* Security */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="card bg-base-200"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-base-content">
                                    Security
                                </h2>
                            </div>

                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            className="w-full px-4 py-3 pr-12 rounded-lg bg-base-100 border border-base-300 focus:ring-2 focus:ring-primary"
                                            placeholder="Enter current password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2"
                                        >
                                            {showCurrentPassword ? <EyeOff /> : <Eye />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            className="w-full px-4 py-3 pr-12 rounded-lg bg-base-100 border border-base-300 focus:ring-2 focus:ring-primary"
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2"
                                        >
                                            {showNewPassword ? <EyeOff /> : <Eye />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-primary to-secondary px-6 py-3 rounded-lg font-semibold"
                                >
                                    Update Password
                                </button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-base-300 flex justify-between">
                                <span>Two-Factor Authentication</span>
                                <ToggleSwitch
                                    enabled={settings.twoFactorAuth}
                                    onToggle={() => handleToggle('twoFactorAuth')}
                                />
                            </div>
                        </motion.div>

                        {/* Notifications */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="card bg-base-200"
                        >
                            <h2 className="text-2xl font-bold mb-4">Notifications</h2>

                            {[
                                ['emailNotifications', 'Email Notifications', Mail],
                                ['smsNotifications', 'SMS Notifications', Smartphone],
                                ['pushNotifications', 'Push Notifications', Globe]
                            ].map(([key, label, Icon]) => (
                                <div key={key} className="flex justify-between items-center py-2">
                                    <div className="flex items-center gap-3">
                                        <Icon className="w-5 h-5" />
                                        {label}
                                    </div>
                                    <ToggleSwitch
                                        enabled={settings[key]}
                                        onToggle={() => handleToggle(key)}
                                    />
                                </div>
                            ))}
                        </motion.div>

                        {/* Privacy */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="card bg-base-200"
                        >
                            <button onClick={handleExportData} className="flex gap-2 items-center">
                                <Download /> Export Data
                            </button>

                            <button
                                onClick={handleDeleteAccount}
                                className="flex gap-2 items-center text-error mt-4"
                            >
                                <Trash2 /> Delete Account
                            </button>
                        </motion.div>

                    </div>
                </div>
            </div>
        </div>
    )
}
