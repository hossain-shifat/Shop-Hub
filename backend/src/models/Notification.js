const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            'order_placed',
            'order_confirmed',
            'order_shipped',
            'order_delivered',
            'order_cancelled',
            'payment_success',
            'payment_failed',
            'product_approved',
            'product_rejected',
            'new_review',
            'account_created',
            'password_changed',
            'profile_updated',
            'low_stock',
            'new_order', // for sellers
            'user_registered', // for admins
            'general'
        ]
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    read: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    },
    link: {
        type: String,
        default: null
    },
    icon: {
        type: String,
        default: 'Bell'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    expiresAt: {
        type: Date,
        index: { expires: 0 } // TTL index - auto-delete when expiresAt is reached
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Index for efficient querying
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

// Method to mark as read and set expiry
notificationSchema.methods.markAsRead = function () {
    this.read = true;
    this.readAt = new Date();
    // Set expiry to 5 minutes from now
    this.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function (notificationData) {
    const notification = new this(notificationData);
    await notification.save();
    return notification;
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = async function (userId, limit = 50) {
    return this.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit);
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function (userId) {
    return this.countDocuments({ userId, read: false });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function (userId) {
    const notifications = await this.find({ userId, read: false });
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000);

    await this.updateMany(
        { userId, read: false },
        {
            read: true,
            readAt: new Date(),
            expiresAt: expiryTime
        }
    );

    return notifications.length;
};

module.exports = mongoose.model('Notification', notificationSchema);
