// app/register/page.jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, User, UserCircle, Eye, EyeOff, Upload } from 'lucide-react'
import { registerWithEmail, loginWithGoogle } from '@/lib/firebase/auth'
import { uploadImageToImgBB, validateImage } from '@/utils/imageUpload'
import toast from 'react-hot-toast'

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user'
    })
    const [photoFile, setPhotoFile] = useState(null)
    const [photoPreview, setPhotoPreview] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            const validation = validateImage(file)
            if (!validation.valid) {
                toast.error(validation.error)
                return
            }
            setPhotoFile(file)
            setPhotoPreview(URL.createObjectURL(file))
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        setIsLoading(true)

        try {
            // Upload photo to ImgBB if provided
            let photoURL = ''
            if (photoFile) {
                const uploadResult = await uploadImageToImgBB(photoFile)
                if (uploadResult.success) {
                    photoURL = uploadResult.url
                } else {
                    toast.error('Failed to upload profile photo')
                }
            }

            // Register with Firebase
            const { user, error } = await registerWithEmail(
                formData.email,
                formData.password,
                formData.displayName
            )

            if (error) {
                toast.error(error)
                setIsLoading(false)
                return
            }

            // Save user to MongoDB
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    displayName: formData.displayName,
                    photoURL: photoURL || user.photoURL || '',
                    role: formData.role,
                    provider: 'email'
                })
            })

            const data = await response.json()

            if (data.success) {
                toast.success('Account created successfully!')
                router.push('/products')
            } else {
                toast.error('Failed to save user data')
            }
        } catch (error) {
            toast.error('Registration failed. Please try again.')
            console.error('Registration error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleRegister = async () => {
        setIsLoading(true)
        try {
            const { user, error } = await loginWithGoogle()

            if (error) {
                toast.error(error)
                setIsLoading(false)
                return
            }

            // Check if user exists, if not create with default role
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL || '',
                    role: 'user', // Default role for Google sign-in
                    provider: 'google'
                })
            })

            const data = await response.json()

            if (data.success) {
                toast.success('Signed in with Google successfully!')
                router.push('/products')
            } else {
                toast.error('Failed to save user data')
            }
        } catch (error) {
            toast.error('Google sign-in failed')
            console.error('Google sign-in error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen pt-24 pb-12">
            <div className="section-padding">
                <div className="container-custom max-w-md mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card"
                    >
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-base-content mb-2">
                                Create Account
                            </h1>
                            <p className="text-base-content/70">
                                Join ShopHub today
                            </p>
                        </div>

                        {/* Profile Photo Upload */}
                        <div className="mb-6 flex flex-col items-center">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-base-200 flex items-center justify-center">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserCircle className="w-16 h-16 text-base-content/30" />
                                    )}
                                </div>
                                <label
                                    htmlFor="photo-upload"
                                    className="absolute bottom-0 right-0 bg-primary text-primary-content p-2 rounded-full cursor-pointer hover:opacity-90 transition-opacity"
                                >
                                    <Upload className="w-4 h-4" />
                                    <input
                                        id="photo-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-base-content/60 mt-2">Upload profile photo (optional)</p>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-4">
                            {/* Display Name */}
                            <div>
                                <label className="block text-sm font-semibold text-base-content mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                                    <input
                                        type="text"
                                        name="displayName"
                                        value={formData.displayName}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-base-200 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base-content"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-base-content mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-base-200 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base-content"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-base-content mb-2">
                                    Account Type
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-base-200 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base-content"
                                >
                                    <option value="user">User - Shop and browse products</option>
                                    <option value="seller">Seller - List and sell products</option>
                                </select>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold text-base-content mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-12 py-3 bg-base-200 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base-content"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5 text-base-content/50" />
                                        ) : (
                                            <Eye className="w-5 h-5 text-base-content/50" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-semibold text-base-content mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-12 py-3 bg-base-200 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base-content"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5 text-base-content/50" />
                                        ) : (
                                            <Eye className="w-5 h-5 text-base-content/50" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-linear-to-r from-primary to-secondary text-primary-content py-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-base-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-base-100 text-base-content/60">Or continue with</span>
                            </div>
                        </div>

                        {/* Google Sign Up */}
                        <button
                            onClick={handleGoogleRegister}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 bg-base-200 text-base-content py-3 rounded-lg font-semibold hover:bg-base-300 transition-all duration-300 border-2 border-base-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Sign up with Google
                        </button>

                        {/* Sign In Link */}
                        <p className="text-center mt-6 text-base-content/70">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary hover:underline font-semibold">
                                Sign in
                            </Link>
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
