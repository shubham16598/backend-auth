const sendTokenResponse = (user, statusCode, res) => {
    const jwt = require('jsonwebtoken');
    const payload = {
        user: {
            id: user.id
        }
    };

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'secret',
        { expiresIn: 360000 } // 1 hour (matches cookie maxAge)
    );

    const options = {
        expires: new Date(Date.now() + 3600000), // 1 hour
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' // Set to true in production
    };

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token // Optional: send token in body too for flexibility, or remove if strict cookie-only
        });
};

module.exports = sendTokenResponse;
