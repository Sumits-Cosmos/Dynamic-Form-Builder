const axios = require('axios');
const Form = require('../models/form.models');
const Response = require('../models/response.models');
const User = require('../models/user.models');
const { shouldShowQuestion } = require('../utils/logicEngine'); 

const getOwnerToken = async (userId) => {
  const user = await User.findById(userId).select('accessToken');
  if (!user) throw new Error('Form owner not found');
  return user.accessToken;
};


exports.submitResponse = async (req, res) => {
  const { formId } = req.params;
  const { answers } = req.body; 

  if (!answers) {
    return res.status(400).json({ message: 'No answers provided' });
  }

  try {

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

   
    const airtableFields = {}; 
    const errors = [];

    
    for (const question of form.questions) {
      const { questionKey, label, required, conditionalRules, type, options } = question;
      const userAnswer = answers[questionKey];


      const isVisible = shouldShowQuestion(conditionalRules, answers);

      if (!isVisible) {
        continue;
      }

      if (required && (userAnswer === undefined || userAnswer === null || userAnswer === '')) {
        errors.push(`Field "${label}" is required.`);
        continue;
      }

      if (userAnswer === undefined || userAnswer === null || userAnswer === '') continue;


      if (type === 'singleSelect') {
        const validOption = options.find(opt => opt.name === userAnswer);
        if (!validOption) {
          errors.push(`Invalid option for "${label}": ${userAnswer}`);
        }
      } else if (type === 'multipleSelects' && Array.isArray(userAnswer)) {
        const invalidOptions = userAnswer.filter(ans => !options.find(opt => opt.name === ans));
        if (invalidOptions.length > 0) {
          errors.push(`Invalid options for "${label}": ${invalidOptions.join(', ')}`);
        }
      }


      airtableFields[label] = userAnswer;
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation Failed', errors });
    }

    const accessToken = await getOwnerToken(form.owner);
    const airtableUrl = `https://api.airtable.com/v0/${form.airtableBaseId}/${form.airtableTableId}`;

    const airtableResponse = await axios.post(
      airtableUrl,
      { fields: airtableFields, typecast: true }, 
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const newRecordId = airtableResponse.data.id;

  
    const newResponse = new Response({
      formId: form._id,
      airtableRecordId: newRecordId,
      answers: answers 
    });

    await newResponse.save();

    res.status(201).json({
      message: 'Response submitted successfully',
      submissionId: newResponse._id
    });

  } catch (error) {
    console.error('Submission Error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Submission failed', 
      error: error.response?.data?.error || error.message 
    });
  }
};


exports.getFormResponses = async (req, res) => {
  const { formId } = req.params;

  try {
    
    const responses = await Response.find({ formId })
      .sort({ createdAt: -1 })
      .select('answers createdAt airtableRecordId'); 

    res.json(responses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching responses' });
  }
};