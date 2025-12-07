const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const passport = require('passport');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(passport.initialize());

// Passport Config
require('./config/passport')(passport);

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/auth-practice', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/oauth', require('./routes/oauthProvider'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
