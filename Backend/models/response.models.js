const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  airtableRecordId: {
    type: String,
    required: true 
  },
  answers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  deletedInAirtable: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Response', responseSchema);