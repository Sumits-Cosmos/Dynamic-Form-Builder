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

const allowedOrigins = [
  'http://localhost:5173',          
  'https://dynamic-form-builder-ten-omega.vercel.app' 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.get('/', (req, res) => {
     res.send('Airtable Form Builder Backend is Running');
});



app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/webhooks', webhookRoutes);

module.exports = app;