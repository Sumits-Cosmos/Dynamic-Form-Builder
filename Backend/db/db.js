const mongoose = require('mongoose');

function connectToDB() {
    mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log('Connected to MongoDB successfully');
    }).catch((err) => {
        console.error('Failed to connect to MongoDB', err);
    })
}

module.exports = connectToDB;