const axios = require('axios');
const Form = require('../models/form.models');
const User = require('../models/user.models');


const ALLOWED_TYPES = [
  'singleLineText',
  'multilineText',
  'singleSelect',
  'multipleSelects',
  'multipleAttachments'
];


const getAccessToken = async (userId) => {
  const user = await User.findById(userId).select('accessToken');
  if (!user) throw new Error('User not found');
  return user.accessToken;
};


exports.getAirtableFields = async (req, res) => {
  const { baseId, tableId } = req.query;

  if (!baseId || !tableId) {
    return res.status(400).json({ message: 'baseId and tableId are required' });
  }

  try {
    const accessToken = await getAccessToken(req.user.userId);


    const url = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`;
    
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const table = response.data.tables.find(t => t.id === tableId);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }


    const supportedFields = table.fields
      .filter(field => ALLOWED_TYPES.includes(field.type)) 
      .map(field => ({
        id: field.id,
        name: field.name,
        type: field.type,
        options: field.options ? field.options.choices : null 
      }));

    res.json({ fields: supportedFields });

  } catch (error) {
    console.error('Error fetching Airtable fields:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch fields from Airtable' });
  }
};


exports.createForm = async (req, res) => {
  const { title, baseId, tableId, questions } = req.body;


  if (!baseId || !tableId || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ message: 'Invalid form data' });
  }

  try {
    
    const newForm = new Form({
      owner: req.user.userId, 
      title: title || 'Untitled Form',
      airtableBaseId: baseId, 
      airtableTableId: tableId, 
      questions: questions.map(q => ({
        questionKey: q.questionKey || `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, 
        fieldId: q.fieldId, 
        label: q.label, 
        type: q.type, 
        required: q.required || false, 
        options: q.options || [], 
        conditionalRules: q.conditionalRules || null 
      }))
    });

    const savedForm = await newForm.save();

    res.status(201).json({
      message: 'Form created successfully',
      formId: savedForm._id
    });

  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ message: 'Failed to create form' });
  }
};


exports.getFormById = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    res.json(form);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving form' });
  }
};

exports.getMyForms = async (req, res) => {
  try {
  
    const forms = await Form.find({ owner: req.user.userId })
      .select('title airtableTableId createdAt') 
      .sort({ createdAt: -1 }); 

    res.json(forms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching forms' });
  }
};