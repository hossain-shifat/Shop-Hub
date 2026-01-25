'use client'

import { useEffect, useState } from 'react'
import { Search, Edit, Trash2, UserCog, X, Check, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import DataTable from '../../components/DataTable'
import Loading from '../../loading'

export default function UserManagement() {
    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')
    const [editingUser, setEditingUser] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [pendingRole, setPendingRole] = useState(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    useEffect(() => {
        filterUsers()
    }, [searchQuery, roleFilter, users])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/users`)
            const data = await response.json()

            if (data.success) {
                setUsers(data.users || [])
                setFilteredUsers(data.users || [])
            }
        } catch (error) {
            console.error('Failed to fetch users:', error)
            toast.error('Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    const filterUsers = () => {
        let filtered = users

        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter)
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(user =>
                user.displayName?.toLowerCase().includes(query) ||
                user.email?.toLowerCase().includes(query) ||
                user.uid?.toLowerCase().includes(query)
            )
        }

        setFilteredUsers(filtered)
    }

    const handleEditUser = (user) => {
        setEditingUser({ ...user })
        setShowEditModal(true)
    }

    const handleDeleteUser = async (uid) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/users/${uid}`, {
                method: 'DELETE'
            })

            const data = await response.json()

            if (data.success) {
                toast.success('User deleted successfully')
                setUsers(users.filter(u => u.uid !== uid))
            } else {
                toast.error(data.error || 'Failed to delete user')
            }
        } catch (error) {
            console.error('Failed to delete user:', error)
            toast.error('Failed to delete user')
        }
    }

    const handleInitiateRoleChange = (newRole) => {
        setPendingRole(newRole)
        setShowConfirmModal(true)
    }

    const handleConfirmRoleChange = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/users/${editingUser.uid}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: pendingRole })
            })

            const data = await response.json()

            if (data.success) {
                toast.success(`User role changed to ${pendingRole}`)
                setEditingUser({ ...editingUser, role: pendingRole })
                setUsers(users.map(u => u.uid === editingUser.uid ? data.user : u))
                setShowConfirmModal(false)
                setPendingRole(null)
            } else {
                toast.error(data.error || 'Failed to change role')
            }
        } catch (error) {
            console.error('Failed to change role:', error)
            toast.error('Failed to change role')
        }
    }

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin':
                return 'badge-error'
            case 'seller':
                return 'badge-warning'
            case 'rider':
                return 'badge-success'
            case 'user':
                return 'badge-info'
            default:
                return 'badge-ghost'
        }
    }

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text)
        toast.success(`${label} copied to clipboard!`)
    }

    if (loading) {
        return <Loading />
    }

    const columns = [
        {
            header: 'User',
            accessor: 'displayName',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="avatar">
                        <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                            {row.photoURL ? (
                                <Image
                                    src={row.photoURL}
                                    alt={row.displayName}
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                />
                            ) : (
                                <div className="bg-primary/10 flex items-center justify-center w-full h-full text-primary font-bold">
                                    {row.displayName?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="font-bold">{row.displayName}</div>
                        <div className="text-xs opacity-50">{row.uid.slice(0, 8)}...</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Email',
            accessor: 'email'
        },
        {
            header: 'Role',
            accessor: 'role',
            render: (row) => (
                <span className={`badge badge-sm capitalize ${getRoleBadgeColor(row.role)}`}>
                    {row.role}
                </span>
            )
        },
        {
            header: 'Provider',
            accessor: 'provider',
            render: (row) => (
                <span className="badge badge-sm capitalize">{row.provider}</span>
            )
        },
        {
            header: 'Joined',
            accessor: 'createdAt',
            render: (row) => (
                new Date(row.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })
            )
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleEditUser(row)}
                        className="btn btn-sm btn-primary btn-outline"
                        title="Edit User"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDeleteUser(row.uid)}
                        className="btn btn-sm btn-error btn-outline"
                        title="Delete User"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ]

    const editRole = [
        { role: "admin", class: 'badge-info' },
        { role: "seller", class: 'badge-success' },
        { role: "rider", class: 'badge-accent' },
        { role: "user", class: 'badge-nutral' },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">User Management</h1>
                    <p className="text-base-content/70">Manage all users, roles, and permissions</p>
                </div>
                <div className="badge badge-lg badge-primary">
                    {filteredUsers.length} Users
                </div>
            </div>

            {/* Filters */}
            <div className="card bg-base-100 p-6 border border-base-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                        <div className="input input-bordered flex items-center gap-2">
                            <Search className="w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or ID..."
                                className="flex-1 outline-none bg-transparent"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-control">
                        <select
                            className="select select-bordered"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="seller">Seller</option>
                            <option value="rider">Rider</option>
                            <option value="user">User</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="card bg-base-100 p-6 border border-base-300">
                <DataTable
                    columns={columns}
                    data={filteredUsers}
                    itemsPerPage={5}
                    emptyMessage="No users found"
                    EmptyIcon={UserCog}
                />
            </div>

            {/* Edit User Modal */}
            {showEditModal && editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-base-100 rounded-2xl max-w-lg w-full shadow-2xl border border-base-300">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-base-300 bg-linear-to-r from-primary to-secondary">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                    <Edit className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Edit User</h2>
                            </div>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/20"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-4">
                            {/* User Avatar and Name */}
                            <div className="flex items-center gap-4 max-w-full">
                                <div className="avatar">
                                    <div className="w-14 h-14 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                                        {editingUser.photoURL ? (
                                            <Image
                                                src={editingUser.photoURL}
                                                alt={editingUser.displayName}
                                                width={56}
                                                height={56}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="bg-primary/10 flex items-center justify-center w-full h-full text-primary font-bold text-xl">
                                                {editingUser.displayName?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-base-content/60">Name</p>
                                    <p className="font-semibold text-base-content">{editingUser.displayName}</p>
                                </div>
                            </div>

                            {/* UID, Email, Provider, Joined */}
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-xs text-base-content/60">UID</p>
                                        <p className="font-mono text-base-content break-all">{editingUser.uid}</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(editingUser.uid, 'UID')}
                                        className="btn btn-ghost btn-xs ml-2"
                                        title="Copy UID"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-xs text-base-content/60">Email</p>
                                        <p className="font-mono text-base-content">{editingUser.email}</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(editingUser.email, 'Email')}
                                        className="btn btn-ghost btn-xs ml-2"
                                        title="Copy Email"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-base-content/60">Provider</p>
                                        <p className="capitalize text-base-content">{editingUser.provider}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-base-content/60">Joined</p>
                                        <p className="text-base-content">{new Date(editingUser.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Role Section */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-sm">Current Role</span>
                                    <span className={`badge badge-md capitalize ${getRoleBadgeColor(editingUser.role)}`}>
                                        {editingUser.role}
                                    </span>
                                </div>

                                <div className="grid grid-cols-4 gap-2">
                                    {['user', 'seller', 'rider', 'admin'].map((role) => (
                                        <button
                                            key={role}
                                            onClick={() => {
                                                if (editingUser.role !== role) {
                                                    handleInitiateRoleChange(role)
                                                }
                                            }}
                                            disabled={editingUser.role === role}
                                            className={`btn btn-xs capitalize ${editingUser.role === role
                                                ? 'btn-disabled btn-ghost'
                                                : role === 'admin'
                                                    ? 'btn-error btn-outline'
                                                    : role === 'seller'
                                                        ? 'btn-warning btn-outline'
                                                        : role === 'rider'
                                                            ? 'btn-success btn-outline'
                                                            : 'btn-info btn-outline'
                                                }`}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-3 p-4 border-t border-base-300 bg-base-200">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="btn btn-ghost flex-1 btn-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Role Change Modal */}
            {showConfirmModal && pendingRole && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-base-100 rounded-2xl max-w-md w-full shadow-2xl border border-base-300">
                        <div className="flex items-center justify-between p-6 border-b border-base-300 bg-linear-to-r from-warning to-error">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Confirm Role Change</h2>
                            </div>
                            <button
                                onClick={() => {
                                    setShowConfirmModal(false)
                                    setPendingRole(null)
                                }}
                                className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/20"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-warning/10 border border-warning/20 p-4 rounded-lg">
                                <p className="text-base-content text-sm">
                                    Change <span className="font-bold">{editingUser?.displayName}</span> from <span className={`badge badge-sm capitalize ${getRoleBadgeColor(editingUser?.role)}`}>{editingUser?.role}</span> to <span className={`badge badge-sm capitalize ${getRoleBadgeColor(pendingRole)}`}>{pendingRole}</span>?
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 p-4 border-t border-base-300 bg-base-200">
                            <button
                                onClick={handleConfirmRoleChange}
                                className="btn btn-error flex-1 btn-sm"
                            >
                                <Check className="w-4 h-4" />
                                Confirm
                            </button>
                            <button
                                onClick={() => {
                                    setShowConfirmModal(false)
                                    setPendingRole(null)
                                }}
                                className="btn btn-ghost flex-1 btn-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
