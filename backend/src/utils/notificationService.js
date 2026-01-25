const Notification = require('../models/Notification');

/**
 * Create a new notification for a user
 * @param {Object} notificationData - The notification data
 * @param {string} notificationData.userId - User ID to send notification to
 * @param {string} notificationData.type - Type of notification
 * @param {string} notificationData.title - Notification title
 * @param {string} notificationData.message - Notification message
 * @param {Object} notificationData.data - Additional data
 * @param {string} notificationData.link - Link to navigate to
 * @param {string} notificationData.icon - Icon name
 * @param {string} notificationData.priority - Priority level
 * @returns {Promise<Object>} Created notification
 */
async function createNotification(notificationData) {
    try {
        const {
            userId,
            type,
            title,
            message,
            data = {},
            link = null,
            icon = 'Bell',
            priority = 'medium'
        } = notificationData;

        // Validate required fields
        if (!userId || !type || !title || !message) {
            throw new Error('Missing required fields: userId, type, title, message');
        }

        // Create notification
        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            data,
            link,
            icon,
            priority,
            read: false
        });

        console.log(`✅ Notification created for user ${userId}: ${title}`);
        return notification;
    } catch (error) {
        console.error('❌ Error creating notification:', error);
        throw error;
    }
}

/**
 * Create multiple notifications at once
 * @param {Array<Object>} notificationsArray - Array of notification data objects
 * @returns {Promise<Array>} Created notifications
 */
async function createBulkNotifications(notificationsArray) {
    try {
        const notifications = await Promise.all(
            notificationsArray.map(notifData => createNotification(notifData))
        );
        console.log(`✅ Created ${notifications.length} notifications`);
        return notifications;
    } catch (error) {
        console.error('❌ Error creating bulk notifications:', error);
        throw error;
    }
}

/**
 * Get user's unread notification count
 * @param {string} userId - User ID
 * @returns {Promise<number>} Unread count
 */
async function getUnreadCount(userId) {
    try {
        const count = await Notification.countDocuments({
            userId,
            read: false
        });
        return count;
    } catch (error) {
        console.error('❌ Error getting unread count:', error);
        return 0;
    }
}

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
async function markAsRead(notificationId) {
    try {
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            throw new Error('Notification not found');
        }

        await notification.markAsRead();
        return notification;
    } catch (error) {
        console.error('❌ Error marking notification as read:', error);
        throw error;
    }
}

/**
 * Mark all user notifications as read
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of notifications marked as read
 */
async function markAllAsRead(userId) {
    try {
        const count = await Notification.markAllAsRead(userId);
        console.log(`✅ Marked ${count} notifications as read for user ${userId}`);
        return count;
    } catch (error) {
        console.error('❌ Error marking all as read:', error);
        throw error;
    }
}

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteNotification(notificationId) {
    try {
        await Notification.findByIdAndDelete(notificationId);
        return true;
    } catch (error) {
        console.error('❌ Error deleting notification:', error);
        return false;
    }
}

/**
 * Get user notifications with pagination
 * @param {string} userId - User ID
 * @param {number} limit - Number of notifications to return
 * @param {number} skip - Number of notifications to skip
 * @returns {Promise<Array>} Notifications
 */
async function getUserNotifications(userId, limit = 50, skip = 0) {
    try {
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);
        return notifications;
    } catch (error) {
        console.error('❌ Error getting user notifications:', error);
        return [];
    }
}

// Notification type templates
const NOTIFICATION_TEMPLATES = {
    ORDER_PLACED: {
        title: '🛒 New Order Placed',
        type: 'order_placed',
        icon: 'ShoppingCart',
        priority: 'high'
    },
    ORDER_CONFIRMED: {
        title: '✅ Order Confirmed',
        type: 'order_confirmed',
        icon: 'CheckCircle',
        priority: 'high'
    },
    ORDER_SHIPPED: {
        title: '📦 Order Shipped',
        type: 'order_shipped',
        icon: 'Truck',
        priority: 'high'
    },
    ORDER_DELIVERED: {
        title: '🎉 Order Delivered',
        type: 'order_delivered',
        icon: 'CheckCircle',
        priority: 'high'
    },
    RIDER_ASSIGNED: {
        title: '🚚 Rider Assigned',
        type: 'new_order',
        icon: 'Bike',
        priority: 'high'
    },
    PAYMENT_SUCCESS: {
        title: '💳 Payment Successful',
        type: 'payment_success',
        icon: 'CreditCard',
        priority: 'medium'
    },
    PAYMENT_FAILED: {
        title: '❌ Payment Failed',
        type: 'payment_failed',
        icon: 'XCircle',
        priority: 'urgent'
    }
};

/**
 * Create notification from template
 * @param {string} templateName - Template name from NOTIFICATION_TEMPLATES
 * @param {Object} data - Additional data for the notification
 * @returns {Promise<Object>} Created notification
 */
async function createFromTemplate(templateName, data) {
    const template = NOTIFICATION_TEMPLATES[templateName];
    if (!template) {
        throw new Error(`Unknown template: ${templateName}`);
    }

    return createNotification({
        ...template,
        ...data
    });
}

module.exports = {
    createNotification,
    createBulkNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUserNotifications,
    createFromTemplate,
    NOTIFICATION_TEMPLATES
};
