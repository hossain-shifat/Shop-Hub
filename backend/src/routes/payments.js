const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const User = require('../models/User');
const { generateInvoice } = require('../utils/invoice');
const { sendOrderConfirmationEmail } = require('../utils/email');
const NotificationService = require('../utils/notificationService');

// Create Stripe Checkout Session
router.post('/create-checkout-session', async (req, res) => {
    try {
        const { orderId, items, shipping, tax, customerEmail } = req.body;

        if (!orderId || !items || !customerEmail) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        const existingPayment = await Payment.findOne({
            orderId,
            status: 'succeeded'
        });

        if (existingPayment) {
            return res.status(400).json({
                success: false,
                error: 'Payment already completed for this order'
            });
        }

        const lineItems = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    images: item.image ? [item.image] : [],
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        if (shipping > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: { name: 'Shipping' },
                    unit_amount: Math.round(shipping * 100),
                },
                quantity: 1,
            });
        }

        if (tax > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: { name: 'Tax' },
                    unit_amount: Math.round(tax * 100),
                },
                quantity: 1,
            });
        }

        const session = await stripe.checkout.sessions.create({
            line_items: lineItems,
            mode: 'payment',
            customer_email: customerEmail,
            client_reference_id: orderId,
            success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-cancel?order_id=${orderId}`,
        });

        res.status(200).json({
            success: true,
            sessionId: session.id,
            url: session.url
        });
    } catch (error) {
        console.error('Stripe Checkout Session Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create checkout session'
        });
    }
});

// Verify Payment Success (with notifications)
router.post('/verify-session', async (req, res) => {
    try {
        const { sessionId, orderId } = req.body;

        if (!sessionId || !orderId) {
            return res.status(400).json({
                success: false,
                error: 'Missing sessionId or orderId'
            });
        }

        console.log('🔍 Verifying payment for session:', sessionId, 'order:', orderId);

        let session;
        try {
            session = await stripe.checkout.sessions.retrieve(sessionId);
            console.log('✅ Stripe session retrieved:', session.id, 'Payment status:', session.payment_status);
        } catch (err) {
            console.error('❌ Stripe session retrieve error:', err);
            return res.status(400).json({
                success: false,
                error: 'Invalid Stripe session ID'
            });
        }

        if (session.payment_status !== 'paid') {
            return res.status(400).json({
                success: false,
                error: 'Payment not completed'
            });
        }

        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        let payment = await Payment.findOne({ orderId });

        if (payment) {
            console.log('⚠️ Payment already processed for order:', orderId);

            if (order.paymentStatus !== 'completed') {
                order.paymentStatus = 'completed';
                order.status = 'confirmed';
                await order.save();
            }

            return res.status(200).json({
                success: true,
                payment,
                order,
                alreadyProcessed: true,
                message: 'Payment already verified'
            });
        }

        payment = new Payment({
            orderId,
            transactionId: session.payment_intent,
            amount: session.amount_total / 100,
            status: 'succeeded',
            paymentMethod: 'Credit Card',
            currency: session.currency || 'usd'
        });
        await payment.save();

        order.paymentStatus = 'completed';
        order.status = 'confirmed';
        await order.save();

        console.log('✅ Payment verified successfully for order:', orderId);

        // All post-payment tasks (notifications, invoice, email) run in background
        setImmediate(async () => {
            try {
                // NOTIFICATIONS
                await NotificationService.notifyPaymentSuccess(order.userId, payment, order);
                await NotificationService.notifyOrderConfirmed(order.userId, order);
                console.log('✅ Notifications sent');
            } catch (notifError) {
                console.error('❌ Notification error:', notifError);
            }

            // INVOICE GENERATION
            let invoicePDF;
            try {
                invoicePDF = await generateInvoice({ order, payment });
                console.log('✅ Invoice generated');
            } catch (invoiceError) {
                console.error('❌ Invoice generation failed:', invoiceError);
            }

            // EMAIL SENDING
            try {
                const user = await User.findOne({ uid: order.userId });
                if (user && user.email && invoicePDF) {
                    await sendOrderConfirmationEmail({
                        customerEmail: user.email,
                        order,
                        payment,
                        invoicePDF
                    });
                    console.log('✅ Email sent to:', user.email);
                }
            } catch (emailError) {
                console.error('❌ Email sending failed:', emailError);
            }
        });

        res.status(200).json({
            success: true,
            payment,
            order,
            alreadyProcessed: false,
            message: 'Payment verified and processed successfully'
        });

    } catch (error) {
        console.error('❌ Payment Verification Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to verify payment'
        });
    }
});

// Handle payment cancellation (with notifications)
router.post('/cancel-payment', async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                error: 'Missing orderId'
            });
        }

        const order = await Order.findOne({ orderId });
        if (order) {
            if (order.paymentStatus !== 'completed') {
                order.paymentStatus = 'cancelled';
                order.status = 'cancelled';
                await order.save();

                // NOTIFICATION: Order cancelled (non-blocking)
                setImmediate(async () => {
                    try {
                        await NotificationService.notifyOrderCancelled(order.userId, order);
                    } catch (notifError) {
                        console.error('Notification error:', notifError);
                    }
                });
            }
        }

        res.status(200).json({
            success: true,
            message: 'Payment cancelled',
            order
        });
    } catch (error) {
        console.error('Payment Cancellation Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to cancel payment'
        });
    }
});

// Stripe Webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                const orderId = session.client_reference_id;

                if (!orderId) {
                    console.error('No orderId in webhook session');
                    break;
                }

                let payment = await Payment.findOne({ orderId });

                if (!payment) {
                    payment = new Payment({
                        orderId,
                        transactionId: session.payment_intent,
                        amount: session.amount_total / 100,
                        status: 'succeeded',
                        paymentMethod: 'Credit Card',
                        currency: session.currency || 'usd'
                    });
                    await payment.save();
                }

                const order = await Order.findOne({ orderId });
                if (order && order.paymentStatus !== 'completed') {
                    order.paymentStatus = 'completed';
                    order.status = 'confirmed';
                    await order.save();

                    // Notifications (non-blocking)
                    setImmediate(async () => {
                        try {
                            await NotificationService.notifyPaymentSuccess(order.userId, payment, order);
                            await NotificationService.notifyOrderConfirmed(order.userId, order);
                        } catch (notifError) {
                            console.error('Webhook notification error:', notifError);
                        }
                    });
                }
                break;

            case 'payment_intent.payment_failed':
                const failedIntent = event.data.object;
                console.log('Payment failed:', failedIntent.id);

                // Non-blocking notification
                setImmediate(async () => {
                    try {
                        const failedPayment = await Payment.findOne({
                            transactionId: failedIntent.id
                        });
                        if (failedPayment) {
                            const failedOrder = await Order.findOne({
                                orderId: failedPayment.orderId
                            });
                            if (failedOrder) {
                                await NotificationService.notifyPaymentFailed(
                                    failedOrder.userId,
                                    failedOrder.orderId,
                                    failedIntent.last_payment_error?.message || 'Payment processing failed'
                                );
                            }
                        }
                    } catch (notifError) {
                        console.error('Payment failed notification error:', notifError);
                    }
                });
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Get payment by order ID
router.get('/order/:orderId', async (req, res) => {
    try {
        const payment = await Payment.findOne({ orderId: req.params.orderId });
        if (!payment) {
            return res.status(404).json({
                success: false,
                error: 'Payment not found'
            });
        }
        res.status(200).json({ success: true, payment });
    } catch (error) {
        console.error('Get payment error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get payment'
        });
    }
});

// Get all payments
router.get('/', async (req, res) => {
    try {
        const payments = await Payment.find()
            .sort({ createdAt: -1 });

        console.log(`✅ Found ${payments.length} payments`);

        res.status(200).json({
            success: true,
            count: payments.length,
            payments: payments
        });
    } catch (error) {
        console.error('❌ Get payments error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            payments: []
        });
    }
});

module.exports = router;
