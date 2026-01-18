const Notification = require('../models/Notification');

class NotificationService {
    // Create notification helper
    static async create(userId, type, title, message, options = {}) {
        try {
            return await Notification.createNotification({
                userId,
                type,
                title,
                message,
                data: options.data || {},
                link: options.link || null,
                icon: options.icon || 'Bell',
                priority: options.priority || 'medium'
            });
        } catch (error) {
            console.error('Notification service error:', error);
            throw error;
        }
    }

    // Order notifications
    static async notifyOrderPlaced(userId, orderId, total) {
        return this.create(
            userId,
            'order_placed',
            'Order Placed Successfully',
            `Your order #${orderId} for $${total.toFixed(2)} has been placed.`,
            {
                link: `/orders/${orderId}`,
                icon: 'ShoppingBag',
                priority: 'high',
                data: { orderId, total }
            }
        );
    }

    static async notifyOrderConfirmed(userId, orderId) {
        return this.create(
            userId,
            'order_confirmed',
            'Order Confirmed',
            `Your order #${orderId} has been confirmed and is being processed.`,
            {
                link: `/orders/${orderId}`,
                icon: 'CheckCircle',
                priority: 'high',
                data: { orderId }
            }
        );
    }

    static async notifyOrderShipped(userId, orderId, trackingNumber) {
        return this.create(
            userId,
            'order_shipped',
            'Order Shipped',
            `Your order #${orderId} has been shipped. Tracking: ${trackingNumber || 'N/A'}`,
            {
                link: `/orders/${orderId}`,
                icon: 'Truck',
                priority: 'high',
                data: { orderId, trackingNumber }
            }
        );
    }

    static async notifyOrderDelivered(userId, orderId) {
        return this.create(
            userId,
            'order_delivered',
            'Order Delivered',
            `Your order #${orderId} has been delivered successfully!`,
            {
                link: `/orders/${orderId}`,
                icon: 'Package',
                priority: 'high',
                data: { orderId }
            }
        );
    }

    static async notifyOrderCancelled(userId, orderId, reason) {
        return this.create(
            userId,
            'order_cancelled',
            'Order Cancelled',
            `Your order #${orderId} has been cancelled. ${reason || ''}`,
            {
                link: `/orders/${orderId}`,
                icon: 'XCircle',
                priority: 'urgent',
                data: { orderId, reason }
            }
        );
    }

    // Payment notifications
    static async notifyPaymentSuccess(userId, orderId, amount) {
        return this.create(
            userId,
            'payment_success',
            'Payment Successful',
            `Payment of $${amount.toFixed(2)} for order #${orderId} was successful.`,
            {
                link: `/orders/${orderId}`,
                icon: 'CreditCard',
                priority: 'high',
                data: { orderId, amount }
            }
        );
    }

    static async notifyPaymentFailed(userId, orderId, reason) {
        return this.create(
            userId,
            'payment_failed',
            'Payment Failed',
            `Payment for order #${orderId} failed. ${reason || 'Please try again.'}`,
            {
                link: `/checkout`,
                icon: 'AlertCircle',
                priority: 'urgent',
                data: { orderId, reason }
            }
        );
    }

    // Account notifications
    static async notifyAccountCreated(userId, displayName) {
        return this.create(
            userId,
            'account_created',
            'Welcome to ShopHub!',
            `Welcome ${displayName}! Your account has been created successfully.`,
            {
                link: '/profile',
                icon: 'UserCheck',
                priority: 'medium'
            }
        );
    }

    static async notifyPasswordChanged(userId) {
        return this.create(
            userId,
            'password_changed',
            'Password Changed',
            'Your password has been changed successfully. If this wasn\'t you, contact support immediately.',
            {
                link: '/settings',
                icon: 'Lock',
                priority: 'urgent'
            }
        );
    }

    static async notifyProfileUpdated(userId) {
        return this.create(
            userId,
            'profile_updated',
            'Profile Updated',
            'Your profile information has been updated successfully.',
            {
                link: '/profile',
                icon: 'User',
                priority: 'low'
            }
        );
    }

    // Seller notifications
    static async notifyNewOrder(sellerId, orderId, buyerName, total) {
        return this.create(
            sellerId,
            'new_order',
            'New Order Received',
            `You have a new order #${orderId} from ${buyerName} for $${total.toFixed(2)}.`,
            {
                link: `/dashboard/seller/orders/${orderId}`,
                icon: 'ShoppingCart',
                priority: 'urgent',
                data: { orderId, buyerName, total }
            }
        );
    }

    static async notifyLowStock(sellerId, productId, productName, stock) {
        return this.create(
            sellerId,
            'low_stock',
            'Low Stock Alert',
            `Product "${productName}" is low on stock (${stock} remaining).`,
            {
                link: `/dashboard/seller/products/${productId}`,
                icon: 'AlertTriangle',
                priority: 'high',
                data: { productId, productName, stock }
            }
        );
    }

    static async notifyProductApproved(sellerId, productId, productName) {
        return this.create(
            sellerId,
            'product_approved',
            'Product Approved',
            `Your product "${productName}" has been approved and is now live.`,
            {
                link: `/products/${productId}`,
                icon: 'CheckCircle',
                priority: 'medium',
                data: { productId, productName }
            }
        );
    }

    static async notifyProductRejected(sellerId, productId, productName, reason) {
        return this.create(
            sellerId,
            'product_rejected',
            'Product Rejected',
            `Your product "${productName}" was rejected. Reason: ${reason}`,
            {
                link: `/dashboard/seller/products/${productId}`,
                icon: 'XCircle',
                priority: 'high',
                data: { productId, productName, reason }
            }
        );
    }

    static async notifyNewReview(sellerId, productId, productName, rating) {
        return this.create(
            sellerId,
            'new_review',
            'New Product Review',
            `Your product "${productName}" received a ${rating}-star review.`,
            {
                link: `/products/${productId}`,
                icon: 'Star',
                priority: 'medium',
                data: { productId, productName, rating }
            }
        );
    }

    // Admin notifications
    static async notifyUserRegistered(adminId, userName, userEmail) {
        return this.create(
            adminId,
            'user_registered',
            'New User Registration',
            `${userName} (${userEmail}) has registered.`,
            {
                link: '/dashboard/admin/users',
                icon: 'UserPlus',
                priority: 'low',
                data: { userName, userEmail }
            }
        );
    }

    // Bulk notifications
    static async notifyMultipleUsers(userIds, type, title, message, options = {}) {
        const promises = userIds.map(userId =>
            this.create(userId, type, title, message, options)
        );
        return Promise.all(promises);
    }
}

module.exports = NotificationService;
