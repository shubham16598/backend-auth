const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Client, AuthCode } = require('../models/OAuth');
const auth = require('../middleware/authMiddleware');

// @route   GET /oauth/authorize
// @desc    Render consent page
// @access  Private (User must be logged in to grant access)
// Note: In a real app, this would check session/cookie. 
// For this practice, we'll assume the user passes a JWT in query param or header, 
// OR we just simulate the "logged in" state if we want to keep it simple.
// To make it realistic, let's assume this is a browser-based flow where cookies would be used.
// But since we built a JWT API, we'll simulate "Logged In" by requiring a 'token' query param for simplicity in testing.
router.get('/authorize', async (req, res) => {
    const { client_id, redirect_uri, response_type, state, token } = req.query;

    if (!token) {
        return res.status(401).send('Please provide "token" query param to simulate logged-in user.');
    }

    try {
        // Verify user (Simulating session check)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.user.id;

        const client = await Client.findOne({ clientId: client_id });
        if (!client) return res.status(400).send('Invalid Client ID');
        if (!client.redirectUris.includes(redirect_uri)) return res.status(400).send('Invalid Redirect URI');

        // Render a simple HTML consent form
        res.send(`
            <h1>Authorize ${client.name}</h1>
            <p>The application <b>${client.name}</b> wants to access your account.</p>
            <form action="/oauth/authorize" method="POST">
                <input type="hidden" name="client_id" value="${client_id}" />
                <input type="hidden" name="redirect_uri" value="${redirect_uri}" />
                <input type="hidden" name="state" value="${state}" />
                <input type="hidden" name="user_id" value="${userId}" />
                <button type="submit">Allow</button>
            </form>
        `);
    } catch (err) {
        res.status(401).send('Invalid Token/User');
    }
});

// @route   POST /oauth/authorize
// @desc    Handle consent and generate code
router.post('/authorize', express.urlencoded({ extended: false }), async (req, res) => {
    const { client_id, redirect_uri, state, user_id } = req.body;

    // Generate Auth Code
    const code = crypto.randomBytes(20).toString('hex');

    // Save Code
    await AuthCode.create({
        code,
        userId: user_id,
        clientId: client_id,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 mins
    });

    // Redirect back to client
    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.append('code', code);
    if (state) redirectUrl.searchParams.append('state', state);

    res.redirect(redirectUrl.toString());
});

// @route   POST /oauth/token
// @desc    Exchange code for token
router.post('/token', async (req, res) => {
    const { client_id, client_secret, code, grant_type } = req.body;

    if (grant_type !== 'authorization_code') {
        return res.status(400).json({ error: 'unsupported_grant_type' });
    }

    try {
        // Verify Client
        const client = await Client.findOne({ clientId: client_id, clientSecret: client_secret });
        if (!client) return res.status(401).json({ error: 'invalid_client' });

        // Verify Code
        const authCode = await AuthCode.findOne({ code });
        if (!authCode) return res.status(400).json({ error: 'invalid_code' });
        if (authCode.expiresAt < Date.now()) return res.status(400).json({ error: 'expired_code' });
        if (authCode.clientId !== client_id) return res.status(400).json({ error: 'invalid_grant' });

        // Generate Access Token (JWT)
        const payload = {
            user: { id: authCode.userId },
            scope: 'profile' // Simplified
        };

        const accessToken = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 3600 } // 1 hour
        );

        // Delete used code
        await AuthCode.deleteOne({ _id: authCode._id });

        res.json({
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: 3600
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server_error' });
    }
});

// Helper to register a client (for testing)
router.post('/register-client', async (req, res) => {
    const { name, redirect_uri } = req.body;
    const clientId = crypto.randomBytes(10).toString('hex');
    const clientSecret = crypto.randomBytes(20).toString('hex');

    const client = await Client.create({
        name,
        clientId,
        clientSecret,
        redirectUris: [redirect_uri]
    });

    res.json(client);
});

module.exports = router;
