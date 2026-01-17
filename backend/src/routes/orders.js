// backend/src/routes/orders.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { v4: uuidv4 } = require('uuid');

// Create order (with duplicate prevention)
router.post('/', async (req, res) => {
    try {
        const { userId, items, paymentMethod } = req.body;

        // Validate required fields
        if (!userId || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Generate unique order ID
        const orderId = `ORD-${uuidv4().slice(0, 8).toUpperCase()}`;

        // IMPORTANT: Check for recent pending orders (within last 5 minutes)
        // This prevents duplicate orders when payment is being processed
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const recentOrder = await Order.findOne({
            userId,
            createdAt: { $gte: fiveMinutesAgo },
            paymentStatus: 'pending',
            status: 'processing'
        }).sort({ createdAt: -1 });

        if (recentOrder) {
            // Compare items to check if it's truly a duplicate
            const itemsMatch = JSON.stringify(recentOrder.items.map(i => ({
                productId: i.productId,
                quantity: i.quantity
            })).sort((a, b) => a.productId.localeCompare(b.productId))) ===
                JSON.stringify(items.map(i => ({
                    productId: i.productId,
                    quantity: i.quantity
                })).sort((a, b) => a.productId.localeCompare(b.productId)));

            if (itemsMatch) {
                console.log('Duplicate order detected, returning existing order:', recentOrder.orderId);
                return res.status(200).json({
                    success: true,
                    order: recentOrder,
                    message: 'Using existing pending order'
                });
            }
        }

        // Create new order with ISO date
        const orderData = {
            ...req.body,
            orderId,
            paymentStatus: paymentMethod === 'Cash on Delivery' ? 'completed' : 'pending',
            status: 'processing',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const order = new Order(orderData);
        await order.save();

        console.log('New order created:', orderId, 'Payment Status:', order.paymentStatus);
        res.status(201).json({ success: true, order });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create order'
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 });

        console.log(`✅ Found ${orders.length} orders`);

        res.status(200).json({
            success: true,
            count: orders.length,
            orders: orders
        });
    } catch (error) {
        console.error('❌ Get orders error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            orders: []
        });
    }
});

// Get user orders by userId (Firebase UID)
router.get('/user/:userId', async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId })
            .sort({ createdAt: -1 });

        console.log(`Found ${orders.length} orders for user:`, req.params.userId);
        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get orders'
        });
    }
});

// Get single order by orderId
router.get('/:orderId', async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get order'
        });
    }
});

// Update order status
router.patch('/:orderId/status', async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'Status is required'
            });
        }

        // Validate status values
        const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const order = await Order.findOne({ orderId: req.params.orderId });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Prevent updating completed/cancelled orders
        if (order.status === 'delivered' || order.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                error: 'Cannot update completed or cancelled orders'
            });
        }

        order.status = status;
        order.updatedAt = new Date().toISOString(); // Add ISO timestamp
        await order.save();

        console.log('Order status updated:', order.orderId, 'to', status);
        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update order status'
        });
    }
});

// Update payment status (called after successful payment)
router.patch('/:orderId/payment-status', async (req, res) => {
    try {
        const { paymentStatus, transactionId } = req.body;

        if (!paymentStatus) {
            return res.status(400).json({
                success: false,
                error: 'Payment status is required'
            });
        }

        const order = await Order.findOne({ orderId: req.params.orderId });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Only update if payment was pending
        if (order.paymentStatus === 'completed') {
            console.log('Payment already completed for order:', order.orderId);
            return res.status(200).json({
                success: true,
                order,
                message: 'Payment already completed'
            });
        }

        order.paymentStatus = paymentStatus;
        if (transactionId) {
            order.transactionId = transactionId;
        }
        if (paymentStatus === 'completed') {
            order.status = 'confirmed';
        }
        order.updatedAt = new Date().toISOString(); // Add ISO timestamp

        await order.save();

        console.log('Order payment status updated:', order.orderId, 'to', paymentStatus);
        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error('Update payment status error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update payment status'
        });
    }
});

// Delete order (admin only - optional)
router.delete('/:orderId', async (req, res) => {
    try {
        const order = await Order.findOneAndDelete({ orderId: req.params.orderId });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        console.log('Order deleted:', req.params.orderId);
        res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to delete order'
        });
    }
});

module.exports = router;
