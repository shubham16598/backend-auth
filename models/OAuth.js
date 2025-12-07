const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    clientId: { type: String, required: true, unique: true },
    clientSecret: { type: String, required: true },
    redirectUris: [{ type: String, required: true }],
    name: { type: String, required: true }
});

const AuthCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: String, required: true },
    expiresAt: { type: Date, required: true }
});

module.exports = {
    Client: mongoose.model('Client', ClientSchema),
    AuthCode: mongoose.model('AuthCode', AuthCodeSchema)
};
