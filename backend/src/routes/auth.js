const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register or update user from Firebase (with duplicate prevention)
router.post('/register', async (req, res) => {
    try {
        const { uid, email, displayName, photoURL, role, provider } = req.body;

        // Validate required fields
        if (!uid || !email) {
            return res.status(400).json({
                success: false,
                error: 'UID and email are required'
            });
        }

        // Check if user already exists
        let user = await User.findOne({ uid });

        if (user) {
            // Update existing user (only if data has changed)
            let hasChanges = false;

            if (displayName && user.displayName !== displayName) {
                user.displayName = displayName;
                hasChanges = true;
            }

            if (photoURL && user.photoURL !== photoURL) {
                user.photoURL = photoURL;
                hasChanges = true;
            }

            if (hasChanges) {
                await user.save();
                console.log('User updated:', uid);
            } else {
                console.log('User exists, no changes:', uid);
            }
        } else {
            // Create new user
            user = new User({
                uid,
                email,
                displayName: displayName || email.split('@')[0],
                photoURL: photoURL || '',
                role: role || 'user',
                provider: provider || 'email'
            });
            await user.save();
            console.log('New user created:', uid);
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Register/update user error:', error);

        // Handle duplicate key error (if email is unique in schema)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Failed to register/update user'
        });
    }
});

// Get user by UID
router.get('/user/:uid', async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.params.uid });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get user'
        });
    }
});

// Get user by email (optional endpoint)
router.get('/user-by-email/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Get user by email error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get user'
        });
    }
});

module.exports = router;
