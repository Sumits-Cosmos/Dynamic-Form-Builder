const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectToDB = require('./db/db');
const authRoutes = require('./routes/user.auth.routes');
const formRoutes = require('./routes/form.routes');
const webhookRoutes = require('./routes/webhook.routes');

dotenv.config();
connectToDB();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// FIX: Keep ONLY this specific CORS config
app.use(cors({
    origin: 'http://localhost:5173', // Allow your React frontend
    credentials: true 
}));

app.get('/', (req, res) => {
     res.send('Airtable Form Builder Backend is Running');
});



app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/webhooks', webhookRoutes);

module.exports = app;