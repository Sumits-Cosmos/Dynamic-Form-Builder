const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  airtableId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  profile: {
    name: { type: String },
    email: { type: String },
    avatarUrl: { type: String }
  },
  accessToken: {
    type: String,
    required: true
  },

  refreshToken: {
    type: String,
    required: false 
  },


  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);