const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { createNotification } = require('../utils/notificationService');

// Get all available riders (optionally filter by location)
router.get('/available', async (req, res) => {
    try {
        const { division, district } = req.query;

        let query = {
            role: 'rider',
            'riderInfo.isAvailable': true
        };

        // Filter by location if provided
        if (division) {
            query['riderInfo.address.division'] = division;
        }
        if (district) {
            query['riderInfo.address.district'] = district;
        }

        const riders = await User.find(query)
            .select('uid displayName phoneNumber photoURL riderInfo')
            .sort({ 'riderInfo.rating': -1, 'riderInfo.completedDeliveries': -1 });

        res.status(200).json({
            success: true,
            count: riders.length,
            riders
        });
    } catch (error) {
        console.error('Get available riders error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get riders'
        });
    }
});

// Assign rider to order
router.post('/assign', async (req, res) => {
    try {
        const { orderId, riderId } = req.body;

        if (!orderId || !riderId) {
            return res.status(400).json({
                success: false,
                error: 'Order ID and Rider ID are required'
            });
        }

        // Find order
        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Check if tracking ID exists, if not create one
        if (!order.trackingId) {
            order.trackingId = `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        }

        // Find rider
        const rider = await User.findOne({ uid: riderId, role: 'rider' });
        if (!rider) {
            return res.status(404).json({
                success: false,
                error: 'Rider not found'
            });
        }

        // Update order with rider info
        order.riderId = riderId;
        order.riderInfo = {
            name: rider.displayName,
            phone: rider.phoneNumber,
            vehicleType: rider.riderInfo?.vehicleType || 'N/A',
            vehicleNumber: rider.riderInfo?.vehicleNumber || 'N/A',
            rating: rider.riderInfo?.rating || 5.0
        };
        order.riderStatus = 'pending';
        order.riderAssignedAt = new Date();
        order.status = 'confirmed';

        await order.save();

        // Notify rider about new delivery assignment
        await createNotification({
            userId: riderId,
            type: 'new_order',
            title: '🚚 New Delivery Assignment',
            message: `You have been assigned to deliver order #${orderId}. Check details and accept the delivery.`,
            data: {
                orderId: order.orderId,
                trackingId: order.trackingId,
                customerName: order.shippingAddress?.city || 'Customer',
                deliveryFee: order.deliveryFee || 50
            },
            link: `/dashboard/rider/my-tasks`,
            icon: 'Package',
            priority: 'high'
        });

        console.log('✅ Rider assigned to order:', orderId, 'Rider:', riderId);

        res.status(200).json({
            success: true,
            message: 'Rider assigned successfully',
            order
        });
    } catch (error) {
        console.error('Assign rider error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to assign rider'
        });
    }
});

// Rider accepts delivery
router.post('/accept-delivery', async (req, res) => {
    try {
        const { orderId, riderId } = req.body;

        if (!orderId || !riderId) {
            return res.status(400).json({
                success: false,
                error: 'Order ID and Rider ID are required'
            });
        }

        const order = await Order.findOne({ orderId, riderId });
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found or not assigned to you'
            });
        }

        if (order.riderStatus !== 'pending') {
            return res.status(400).json({
                success: false,
                error: `Cannot accept order with status: ${order.riderStatus}`
            });
        }

        // Update order status
        order.riderStatus = 'accepted';
        order.riderAcceptedAt = new Date();
        order.status = 'shipped';
        await order.save();

        // Get rider info for notification
        const rider = await User.findOne({ uid: riderId });

        // Notify customer that rider accepted
        await createNotification({
            userId: order.userId,
            type: 'order_shipped',
            title: '📦 Your Order is On the Way!',
            message: `${rider.displayName} has accepted your delivery. Track your order with ID: ${order.trackingId}`,
            data: {
                orderId: order.orderId,
                trackingId: order.trackingId,
                riderName: rider.displayName,
                riderPhone: rider.phoneNumber,
                riderVehicle: `${rider.riderInfo?.vehicleType} - ${rider.riderInfo?.vehicleNumber}`,
                riderRating: rider.riderInfo?.rating
            },
            link: `/orders/${order.orderId}`,
            icon: 'Truck',
            priority: 'high'
        });

        // Notify seller (if exists)
        const sellerEmail = order.items?.[0]?.sellerEmail;
        if (sellerEmail) {
            const seller = await User.findOne({ email: sellerEmail });
            if (seller) {
                await createNotification({
                    userId: seller.uid,
                    type: 'order_shipped',
                    title: '✅ Order Picked Up by Rider',
                    message: `${rider.displayName} has accepted delivery for order #${orderId}`,
                    data: {
                        orderId: order.orderId,
                        trackingId: order.trackingId,
                        riderName: rider.displayName,
                        riderPhone: rider.phoneNumber
                    },
                    link: `/dashboard/seller/orders`,
                    icon: 'CheckCircle',
                    priority: 'medium'
                });
            }
        }

        res.status(200).json({
            success: true,
            message: 'Delivery accepted successfully',
            order
        });
    } catch (error) {
        console.error('Accept delivery error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to accept delivery'
        });
    }
});

// Rider rejects delivery
router.post('/reject-delivery', async (req, res) => {
    try {
        const { orderId, riderId, reason } = req.body;

        if (!orderId || !riderId) {
            return res.status(400).json({
                success: false,
                error: 'Order ID and Rider ID are required'
            });
        }

        const order = await Order.findOne({ orderId, riderId });
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found or not assigned to you'
            });
        }

        // Clear rider assignment
        order.riderId = null;
        order.riderInfo = {};
        order.riderStatus = 'pending';
        order.riderAssignedAt = null;
        order.status = 'confirmed';
        await order.save();

        // Get rider info
        const rider = await User.findOne({ uid: riderId });

        // Notify customer about rejection
        await createNotification({
            userId: order.userId,
            type: 'general',
            title: '⚠️ Delivery Assignment Changed',
            message: `The assigned rider declined your delivery. We're finding another rider for you.`,
            data: {
                orderId: order.orderId,
                reason: reason || 'Not specified'
            },
            link: `/orders/${order.orderId}`,
            icon: 'AlertCircle',
            priority: 'medium'
        });

        res.status(200).json({
            success: true,
            message: 'Delivery rejected',
            order
        });
    } catch (error) {
        console.error('Reject delivery error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to reject delivery'
        });
    }
});

// Update delivery status
router.patch('/update-status', async (req, res) => {
    try {
        const { orderId, riderId, status } = req.body;

        if (!orderId || !riderId || !status) {
            return res.status(400).json({
                success: false,
                error: 'Order ID, Rider ID, and status are required'
            });
        }

        const validStatuses = ['picked_up', 'in_transit', 'delivered'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const order = await Order.findOne({ orderId, riderId });
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found or not assigned to you'
            });
        }

        // Update status
        order.riderStatus = status;

        if (status === 'picked_up') {
            order.pickedUpAt = new Date();
            order.status = 'shipped';
        } else if (status === 'in_transit') {
            order.status = 'shipped';
        } else if (status === 'delivered') {
            order.deliveredAt = new Date();
            order.status = 'delivered';

            // Update rider stats
            const rider = await User.findOne({ uid: riderId });
            if (rider && rider.riderInfo) {
                rider.riderInfo.completedDeliveries += 1;
                rider.riderInfo.earnings += (order.deliveryFee || 50);
                await rider.save();
            }

            // Notify customer
            await createNotification({
                userId: order.userId,
                type: 'order_delivered',
                title: '🎉 Order Delivered Successfully!',
                message: `Your order #${orderId} has been delivered. Enjoy your purchase!`,
                data: {
                    orderId: order.orderId,
                    trackingId: order.trackingId
                },
                link: `/orders/${order.orderId}`,
                icon: 'CheckCircle',
                priority: 'high'
            });
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Status updated successfully',
            order
        });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update status'
        });
    }
});

// Get rider's assigned orders
router.get('/:riderId/orders', async (req, res) => {
    try {
        const { riderId } = req.params;
        const { status } = req.query;

        let query = { riderId };
        if (status && status !== 'all') {
            query.riderStatus = status;
        }

        const orders = await Order.find(query)
            .sort({ riderAssignedAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        console.error('Get rider orders error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get orders'
        });
    }
});

// Get rider earnings
router.get('/:riderId/earnings', async (req, res) => {
    try {
        const { riderId } = req.params;

        const rider = await User.findOne({ uid: riderId, role: 'rider' });
        if (!rider) {
            return res.status(404).json({
                success: false,
                error: 'Rider not found'
            });
        }

        // Get completed deliveries
        const completedOrders = await Order.find({
            riderId,
            riderStatus: 'delivered'
        });

        const totalEarnings = completedOrders.reduce((sum, order) => sum + (order.deliveryFee || 50), 0);
        const totalDeliveries = completedOrders.length;

        res.status(200).json({
            success: true,
            earnings: {
                total: totalEarnings,
                deliveries: totalDeliveries,
                average: totalDeliveries > 0 ? (totalEarnings / totalDeliveries).toFixed(2) : 0,
                rating: rider.riderInfo?.rating || 5.0
            },
            recentDeliveries: completedOrders.slice(0, 10)
        });
    } catch (error) {
        console.error('Get earnings error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get earnings'
        });
    }
});

module.exports = router;
