const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const NotificationService = require('../utils/notificationService');

// Get all notifications for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 50, read } = req.query;

        let query = { userId };

        // Filter by read status if specified
        if (read !== undefined) {
            query.read = read === 'true';
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        const unreadCount = await Notification.countDocuments({
            userId,
            read: false
        });

        res.status(200).json({
            success: true,
            count: notifications.length,
            unreadCount,
            notifications
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get notifications'
        });
    }
});

// Get unread count for a user
router.get('/user/:userId/unread-count', async (req, res) => {
    try {
        const { userId } = req.params;
        const count = await NotificationService.getUnreadCount(userId);

        res.status(200).json({
            success: true,
            count
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get unread count'
        });
    }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await NotificationService.markAsRead(id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            notification
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to mark notification as read'
        });
    }
});

// Mark all notifications as read for a user
router.patch('/user/:userId/read-all', async (req, res) => {
    try {
        const { userId } = req.params;
        const count = await NotificationService.markAllAsRead(userId);

        res.status(200).json({
            success: true,
            message: `Marked ${count} notifications as read`,
            count
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to mark all as read'
        });
    }
});

// Delete a notification
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await NotificationService.deleteNotification(id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to delete notification'
        });
    }
});

// Delete all notifications for a user
router.delete('/user/:userId/all', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await NotificationService.deleteAllUserNotifications(userId);

        res.status(200).json({
            success: true,
            message: `Deleted ${result.deletedCount} notifications`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Delete all notifications error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to delete notifications'
        });
    }
});

// Create a test notification (for testing purposes)
router.post('/test', async (req, res) => {
    try {
        const { userId, type = 'general', title, message } = req.body;

        if (!userId || !title || !message) {
            return res.status(400).json({
                success: false,
                error: 'userId, title, and message are required'
            });
        }

        const notification = await NotificationService.createNotification({
            userId,
            type,
            title,
            message
        });

        res.status(201).json({
            success: true,
            notification
        });
    } catch (error) {
        console.error('Create test notification error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create notification'
        });
    }
});

module.exports = router;
