const axios = require('axios');
const Form = require('../models/form.models');
const Response = require('../models/response.models');
const User = require('../models/user.models');


const getTokenFromForm = async (formId) => {
  const form = await Form.findById(formId).populate('owner');
  if (!form || !form.owner) throw new Error('Form or Owner not found');
  return form.owner.accessToken;
};


exports.handleAirtableWebhook = async (req, res) => {
  const { formId } = req.query;
  const { cursor } = req.body; 

  if (!formId || !cursor) {

    return res.status(200).send('Ignored');
  }

  try {
    const accessToken = await getTokenFromForm(formId);
    const form = await Form.findById(formId);


    const url = `https://api.airtable.com/v0/bases/${form.airtableBaseId}/webhooks/${req.body.webhook.id}/payloads?cursor=${cursor}`;
    
    const { data } = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });


    for (const payload of data.payloads) {

      const tableEvents = payload.changedTablesById[form.airtableTableId];
      
      if (!tableEvents) continue;

      if (tableEvents.changedRecordsById) {
        for (const [recordId, changes] of Object.entries(tableEvents.changedRecordsById)) {
          if (changes.current && changes.current.fields) {
            await Response.findOneAndUpdate(
              { airtableRecordId: recordId },
              { 
                $set: { 

                  answers: changes.current.fields 
                } 
              }
            );
            console.log(`Updated record ${recordId}`);
          }
        }
      }

      if (tableEvents.destroyedRecordIds) {
        for (const recordId of tableEvents.destroyedRecordIds) {
          await Response.findOneAndUpdate(
            { airtableRecordId: recordId },
            { $set: { deletedInAirtable: true } } 
          );
          console.log(`Soft deleted record ${recordId}`);
        }
      }
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Webhook Error:', error.message);
    res.status(200).send('Error processing'); 
  }
};