const Notification = require('../models/Notification');

class NotificationService {
    /**
     * Create a notification for a user
     * @param {Object} params - Notification parameters
     * @param {String} params.userId - User ID to receive notification
     * @param {String} params.type - Type of notification
     * @param {String} params.title - Notification title
     * @param {String} params.message - Notification message
     * @param {Object} params.data - Additional data
     * @param {String} params.link - Link to redirect
     * @param {String} params.icon - Icon name
     * @param {String} params.priority - Priority level
     */
    static async createNotification({
        userId,
        type,
        title,
        message,
        data = {},
        link = null,
        icon = 'Bell',
        priority = 'medium'
    }) {
        try {
            const notification = await Notification.create({
                userId,
                type,
                title,
                message,
                data,
                link,
                icon,
                priority
            });

            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    /**
     * Create notification for order placed (User)
     */
    static async notifyOrderPlaced(userId, order) {
        return this.createNotification({
            userId,
            type: 'order_placed',
            title: 'Order Placed Successfully',
            message: `Your order #${order.orderId} has been placed successfully. Total: $${order.total.toFixed(2)}`,
            data: { orderId: order.orderId, total: order.total },
            link: `/orders/${order.orderId}`,
            icon: 'ShoppingBag',
            priority: 'high'
        });
    }

    /**
     * Create notification for order confirmed (User)
     */
    static async notifyOrderConfirmed(userId, order) {
        return this.createNotification({
            userId,
            type: 'order_confirmed',
            title: 'Order Confirmed',
            message: `Your order #${order.orderId} has been confirmed and is being processed.`,
            data: { orderId: order.orderId },
            link: `/orders/${order.orderId}`,
            icon: 'CheckCircle',
            priority: 'high'
        });
    }

    /**
     * Create notification for order shipped (User)
     */
    static async notifyOrderShipped(userId, order) {
        return this.createNotification({
            userId,
            type: 'order_shipped',
            title: 'Order Shipped',
            message: `Your order #${order.orderId} has been shipped and is on its way!`,
            data: { orderId: order.orderId },
            link: `/orders/${order.orderId}`,
            icon: 'Truck',
            priority: 'high'
        });
    }

    /**
     * Create notification for order delivered (User)
     */
    static async notifyOrderDelivered(userId, order) {
        return this.createNotification({
            userId,
            type: 'order_delivered',
            title: 'Order Delivered',
            message: `Your order #${order.orderId} has been delivered successfully!`,
            data: { orderId: order.orderId },
            link: `/orders/${order.orderId}`,
            icon: 'Package',
            priority: 'high'
        });
    }

    /**
     * Create notification for order cancelled (User)
     */
    static async notifyOrderCancelled(userId, order) {
        return this.createNotification({
            userId,
            type: 'order_cancelled',
            title: 'Order Cancelled',
            message: `Your order #${order.orderId} has been cancelled.`,
            data: { orderId: order.orderId },
            link: `/orders/${order.orderId}`,
            icon: 'XCircle',
            priority: 'medium'
        });
    }

    /**
     * Create notification for payment success (User)
     */
    static async notifyPaymentSuccess(userId, payment, order) {
        return this.createNotification({
            userId,
            type: 'payment_success',
            title: 'Payment Successful',
            message: `Payment of $${payment.amount.toFixed(2)} received for order #${order.orderId}`,
            data: {
                orderId: order.orderId,
                transactionId: payment.transactionId,
                amount: payment.amount
            },
            link: `/orders/${order.orderId}`,
            icon: 'CreditCard',
            priority: 'high'
        });
    }

    /**
     * Create notification for payment failed (User)
     */
    static async notifyPaymentFailed(userId, orderId, reason = '') {
        return this.createNotification({
            userId,
            type: 'payment_failed',
            title: 'Payment Failed',
            message: `Payment for order #${orderId} failed. ${reason}`,
            data: { orderId, reason },
            link: `/checkout?orderId=${orderId}`,
            icon: 'AlertCircle',
            priority: 'urgent'
        });
    }

    /**
     * Create notification for new order (Seller/Admin)
     */
    static async notifyNewOrder(userId, order) {
        return this.createNotification({
            userId,
            type: 'new_order',
            title: 'New Order Received',
            message: `New order #${order.orderId} received. Total: $${order.total.toFixed(2)}`,
            data: { orderId: order.orderId, total: order.total },
            link: `/dashboard/admin/orders`,
            icon: 'ShoppingCart',
            priority: 'high'
        });
    }

    /**
     * Create notification for product approved (Seller)
     */
    static async notifyProductApproved(userId, product) {
        return this.createNotification({
            userId,
            type: 'product_approved',
            title: 'Product Approved',
            message: `Your product "${product.name}" has been approved and is now live.`,
            data: { productId: product._id || product.id },
            link: `/products/${product._id || product.id}`,
            icon: 'CheckCircle',
            priority: 'medium'
        });
    }

    /**
     * Create notification for product rejected (Seller)
     */
    static async notifyProductRejected(userId, product, reason) {
        return this.createNotification({
            userId,
            type: 'product_rejected',
            title: 'Product Rejected',
            message: `Your product "${product.name}" was rejected. Reason: ${reason}`,
            data: { productId: product._id || product.id, reason },
            link: `/dashboard/seller/products`,
            icon: 'XCircle',
            priority: 'high'
        });
    }

    /**
     * Create notification for new review (Seller)
     */
    static async notifyNewReview(userId, product, review) {
        return this.createNotification({
            userId,
            type: 'new_review',
            title: 'New Product Review',
            message: `${review.userName} left a ${review.rating}-star review on "${product.name}"`,
            data: {
                productId: product._id || product.id,
                reviewId: review._id,
                rating: review.rating
            },
            link: `/products/${product._id || product.id}`,
            icon: 'Star',
            priority: 'low'
        });
    }

    /**
     * Create notification for low stock (Seller/Admin)
     */
    static async notifyLowStock(userId, product) {
        return this.createNotification({
            userId,
            type: 'low_stock',
            title: 'Low Stock Alert',
            message: `Product "${product.name}" is running low on stock (${product.stock} remaining)`,
            data: { productId: product._id || product.id, stock: product.stock },
            link: `/dashboard/seller/products`,
            icon: 'AlertTriangle',
            priority: 'medium'
        });
    }

    /**
     * Create notification for user registration (Admin)
     */
    static async notifyUserRegistered(adminUserId, user) {
        return this.createNotification({
            userId: adminUserId,
            type: 'user_registered',
            title: 'New User Registered',
            message: `${user.displayName} (${user.email}) registered as ${user.role}`,
            data: { userId: user.uid, email: user.email, role: user.role },
            link: `/dashboard/admin/users`,
            icon: 'UserPlus',
            priority: 'low'
        });
    }

    /**
     * Create notification for account created (User)
     */
    static async notifyAccountCreated(userId, user) {
        return this.createNotification({
            userId,
            type: 'account_created',
            title: 'Welcome to ShopHub!',
            message: `Your account has been created successfully. Start shopping now!`,
            data: { email: user.email },
            link: '/products',
            icon: 'UserCheck',
            priority: 'medium'
        });
    }

    /**
     * Create notification for profile updated (User)
     */
    static async notifyProfileUpdated(userId) {
        return this.createNotification({
            userId,
            type: 'profile_updated',
            title: 'Profile Updated',
            message: 'Your profile has been updated successfully.',
            data: {},
            link: '/profile',
            icon: 'User',
            priority: 'low'
        });
    }

    /**
     * Get notifications for a specific user
     */
    static async getUserNotifications(userId, limit = 50) {
        return Notification.getUserNotifications(userId, limit);
    }

    /**
     * Get unread count for a user
     */
    static async getUnreadCount(userId) {
        return Notification.getUnreadCount(userId);
    }

    /**
     * Mark notification as read
     */
    static async markAsRead(notificationId) {
        const notification = await Notification.findById(notificationId);
        if (notification) {
            return notification.markAsRead();
        }
        return null;
    }

    /**
     * Mark all notifications as read for a user
     */
    static async markAllAsRead(userId) {
        return Notification.markAllAsRead(userId);
    }

    /**
     * Delete notification
     */
    static async deleteNotification(notificationId) {
        return Notification.findByIdAndDelete(notificationId);
    }

    /**
     * Delete all notifications for a user
     */
    static async deleteAllUserNotifications(userId) {
        return Notification.deleteMany({ userId });
    }
}

module.exports = NotificationService;
