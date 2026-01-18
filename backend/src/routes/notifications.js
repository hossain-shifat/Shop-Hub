const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Get user notifications
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 50, unreadOnly = false } = req.query;

        const query = { userId };
        if (unreadOnly === 'true') {
            query.read = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        const unreadCount = await Notification.getUnreadCount(userId);

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

// Get unread count
router.get('/user/:userId/count', async (req, res) => {
    try {
        const { userId } = req.params;
        const count = await Notification.getUnreadCount(userId);

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

// Create notification
router.post('/', async (req, res) => {
    try {
        const { userId, type, title, message, data, link, icon, priority } = req.body;

        if (!userId || !type || !title || !message) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        const notification = await Notification.createNotification({
            userId,
            type,
            title,
            message,
            data,
            link,
            icon,
            priority
        });

        console.log('Notification created:', notification._id);
        res.status(201).json({
            success: true,
            notification
        });
    } catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create notification'
        });
    }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findById(id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }

        await notification.markAsRead();

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

// Mark all notifications as read
router.patch('/user/:userId/read-all', async (req, res) => {
    try {
        const { userId } = req.params;
        const count = await Notification.markAllAsRead(userId);

        res.status(200).json({
            success: true,
            message: `${count} notifications marked as read`,
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

// Delete notification
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndDelete(id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to delete notification'
        });
    }
});

// Delete all read notifications for user
router.delete('/user/:userId/clear-read', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await Notification.deleteMany({ userId, read: true });

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} notifications deleted`,
            count: result.deletedCount
        });
    } catch (error) {
        console.error('Clear read notifications error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to clear notifications'
        });
    }
});

module.exports = router;
