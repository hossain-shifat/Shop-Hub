const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: String,
        required: true
    },
    items: [{
        productId: {
            type: String
        },
        name: String,
        price: Number,
        quantity: Number,
        image: String
    }],
    shippingAddress: {
        street: String,
        city: String,
        district: String,
        division: String,
        zipCode: String,
        country: { type: String, default: 'Bangladesh' }
    },
    paymentMethod: String,
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    status: {
        type: String,
        enum: ['processing', 'confirmed', 'shipped', 'picked_up', 'delivered', 'cancelled'],
        default: 'processing'
    },
    // Tracking and Rider Assignment
    trackingId: {
        type: String,
        required: true,
        unique: true,
        default: function () {
            return `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        }
    },
    riderId: {
        type: String,
        default: null
    },
    riderInfo: {
        name: String,
        phone: String,
        vehicleType: String,
        vehicleNumber: String,
        rating: Number
    },
    riderStatus: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'picked_up', 'in_transit', 'delivered'],
        default: 'pending'
    },
    riderAssignedAt: {
        type: Date,
        default: null
    },
    riderAcceptedAt: {
        type: Date,
        default: null
    },
    pickedUpAt: {
        type: Date,
        default: null
    },
    deliveredAt: {
        type: Date,
        default: null
    },
    // Financials
    subtotal: Number,
    shipping: Number,
    tax: Number,
    total: Number,
    deliveryFee: {
        type: Number,
        default: 0
    },
    transactionId: String
}, { timestamps: true });

// Generate tracking ID before saving
orderSchema.pre('save', function (next) {
    if (!this.trackingId) {
        this.trackingId = `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);
