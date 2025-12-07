const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protectSession } = require('../middleware/authSession');

// @route   POST /session/login
// @desc    Authenticate user & start session
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        // Create Session
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email
        };

        res.json({ msg: 'Session started', user: req.session.user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /session/user
// @desc    Get user data from session
// @access  Private (Session)
router.get('/user', protectSession, async (req, res) => {
    try {
        // We could fetch fresh data from DB using req.session.user.id if needed
        // For now, returning session data is enough to prove it works
        res.json({ method: 'Session', user: req.session.user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /session/logout
// @desc    Destroy session
// @access  Public
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ msg: 'Could not log out' });
        }
        res.clearCookie('connect.sid'); // Default cookie name
        res.json({ msg: 'Session destroyed' });
    });
});

module.exports = router;
