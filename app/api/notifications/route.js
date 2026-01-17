// app/api/notifications/route.js
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Helper function to generate notifications based on user activity
async function generateNotifications(userId, userRole, userEmail) {
    try {
        const notifications = []
        const now = Date.now()

        // Fetch user's orders for notifications
        const ordersResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/orders/user/${userId}`
        )
        const ordersData = await ordersResponse.json()
        const orders = ordersData.orders || []

        // Recent orders (last 7 days)
        const recentOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt).getTime()
            const daysDiff = (now - orderDate) / (1000 * 60 * 60 * 24)
            return daysDiff <= 7
        })

        // Generate notifications based on order status
        recentOrders.forEach(order => {
            const orderDate = new Date(order.createdAt)
            const timeAgo = getTimeAgo(orderDate)

            if (order.status === 'delivered') {
                notifications.push({
                    id: `order-delivered-${order.orderId}`,
                    title: 'Order Delivered',
                    message: `Your order #${order.orderId} has been delivered successfully!`,
                    time: timeAgo,
                    read: false,
                    type: 'success'
                })
            } else if (order.status === 'shipped') {
                notifications.push({
                    id: `order-shipped-${order.orderId}`,
                    title: 'Order Shipped',
                    message: `Your order #${order.orderId} is on the way!`,
                    time: timeAgo,
                    read: false,
                    type: 'info'
                })
            } else if (order.status === 'processing' || order.status === 'confirmed') {
                notifications.push({
                    id: `order-processing-${order.orderId}`,
                    title: 'Order Confirmed',
                    message: `Your order #${order.orderId} is being processed.`,
                    time: timeAgo,
                    read: false,
                    type: 'info'
                })
            }
        })

        // Role-specific notifications
        if (userRole === 'seller') {
            // Fetch all products
            const productsResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/products`
            )
            const productsData = await productsResponse.json()
            const allProducts = productsData.products || []

            // Filter seller's products and check for low stock
            const sellerProducts = allProducts.filter(p => p.sellerEmail === userEmail)
            const lowStockProducts = sellerProducts.filter(p => (p.stock || 0) < 5)

            lowStockProducts.forEach(product => {
                notifications.push({
                    id: `low-stock-${product.id}`,
                    title: 'Low Stock Alert',
                    message: `${product.name} is running low (${product.stock || 0} left)`,
                    time: 'Recent',
                    read: false,
                    type: 'warning'
                })
            })

            // Check for recent orders containing seller's products
            const sellerProductIds = sellerProducts.map(p => p.id)
            const allOrdersResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/orders`
            )
            const allOrdersData = await allOrdersResponse.json()
            const allOrders = allOrdersData.orders || []

            const recentSellerOrders = allOrders.filter(order => {
                const orderDate = new Date(order.createdAt).getTime()
                const daysDiff = (now - orderDate) / (1000 * 60 * 60 * 24)
                return daysDiff <= 1 && order.items.some(item => sellerProductIds.includes(item.id))
            })

            if (recentSellerOrders.length > 0) {
                notifications.push({
                    id: 'new-seller-orders',
                    title: 'New Orders',
                    message: `You have ${recentSellerOrders.length} new order${recentSellerOrders.length > 1 ? 's' : ''}!`,
                    time: 'Today',
                    read: false,
                    type: 'success'
                })
            }
        }

        if (userRole === 'admin') {
            // Admin notifications - new users, pending orders, etc.
            const usersResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/users`
            )
            const usersData = await usersResponse.json()
            const users = usersData.users || []

            const newUsers = users.filter(u => {
                const userDate = new Date(u.createdAt).getTime()
                const daysDiff = (now - userDate) / (1000 * 60 * 60 * 24)
                return daysDiff <= 1
            })

            if (newUsers.length > 0) {
                notifications.push({
                    id: 'new-users',
                    title: 'New Users',
                    message: `${newUsers.length} new user${newUsers.length > 1 ? 's' : ''} registered today!`,
                    time: 'Today',
                    read: false,
                    type: 'success'
                })
            }

            // Pending orders
            const allOrdersResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/orders`
            )
            const allOrdersData = await allOrdersResponse.json()
            const allOrders = allOrdersData.orders || []

            const pendingOrders = allOrders.filter(o =>
                o.status === 'pending' || o.status === 'processing'
            )

            if (pendingOrders.length > 0) {
                notifications.push({
                    id: 'pending-orders',
                    title: 'Pending Orders',
                    message: `${pendingOrders.length} order${pendingOrders.length > 1 ? 's' : ''} need attention`,
                    time: 'Recent',
                    read: false,
                    type: 'warning'
                })
            }
        }

        // Sort by most recent
        notifications.sort((a, b) => {
            if (a.time === 'Today') return -1
            if (b.time === 'Today') return 1
            return 0
        })

        return notifications.slice(0, 10) // Return max 10 notifications

    } catch (error) {
        console.error('Error generating notifications:', error)
        return []
    }
}

// Helper function to get time ago
function getTimeAgo(date) {
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    } else if (hours < 24) {
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    } else if (days === 1) {
        return 'Yesterday'
    } else if (days < 7) {
        return `${days} days ago`
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
}

// GET - Fetch notifications
export async function GET(request) {
    try {
        const headersList = await headers()
        const authHeader = headersList.get('authorization')
        const idToken = authHeader?.replace('Bearer ', '')

        if (!idToken) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Not authenticated',
                    notifications: []
                },
                { status: 401 }
            )
        }

        // Decode token to get user ID
        try {
            const payload = JSON.parse(
                Buffer.from(idToken.split('.')[1], 'base64').toString()
            )

            const userUid = payload.user_id || payload.sub
            const userEmail = payload.email

            // Fetch user to get role
            const userResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/user/${userUid}`
            )
            const userData = await userResponse.json()

            if (!userData.success) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'User not found',
                        notifications: []
                    },
                    { status: 404 }
                )
            }

            const notifications = await generateNotifications(
                userUid,
                userData.user.role,
                userEmail || userData.user.email
            )

            return NextResponse.json({
                success: true,
                notifications
            })

        } catch (decodeError) {
            console.error('Token decode error:', decodeError)
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid token',
                    notifications: []
                },
                { status: 401 }
            )
        }

    } catch (error) {
        console.error('Notifications fetch error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch notifications',
                notifications: []
            },
            { status: 500 }
        )
    }
}
