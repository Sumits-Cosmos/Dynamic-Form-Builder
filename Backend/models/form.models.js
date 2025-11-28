const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const conditionSchema = new Schema({
  questionKey: { 
    type: String, 
    required: true 
  },
  operator: { 
    type: String, 
    enum: ['equals', 'notEquals', 'contains'], 
    required: true 
  },
  value: { 
    type: Schema.Types.Mixed,
    required: true 
  }
}, { _id: false });

const conditionalRulesSchema = new Schema({
  logic: { 
    type: String, 
    enum: ['AND', 'OR'], 
    required: true 
  },
  conditions: [conditionSchema] 
}, { _id: false });


const questionSchema = new Schema({
  questionKey: { 
    type: String, 
    required: true 
  },
  fieldId: { 
    type: String, 
    required: true 
  },
  label: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    required: true,
    enum: [
      'singleLineText', 
      'multilineText',  
      'singleSelect',   
      'multipleSelects',
      'multipleAttachments' 
    ] 
  },
  required: { 
    type: Boolean, 
    default: false 
  },
  
  options: [{
    id: String,
    name: String,
    color: String
  }],
  
  conditionalRules: {
    type: conditionalRulesSchema,
    default: null
  }
});

const formSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  airtableBaseId: {
    type: String,
    required: true
  },
  airtableTableId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'Untitled Form'
  },
  questions: [questionSchema] 
}, {
  timestamps: true
});

module.exports = mongoose.model('Form', formSchema);