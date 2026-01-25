const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    displayName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    photoURL: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['user', 'seller', 'rider', 'admin'],
        default: 'user'
    },
    provider: {
        type: String,
        enum: ['google', 'email'],
        required: true
    },
    // Rider-specific information
    riderInfo: {
        vehicleType: {
            type: String,
            enum: ['bike', 'bicycle', 'car', 'van']
        },
        vehicleNumber: String,
        licenseNumber: String,
        isAvailable: {
            type: Boolean,
            default: true
        },
        completedDeliveries: {
            type: Number,
            default: 0
        },
        rating: {
            type: Number,
            default: 5.0,
            min: 0,
            max: 5
        },
        earnings: {
            type: Number,
            default: 0
        },
        address: {
            division: String,
            district: String,
            area: String,
            street: String
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
