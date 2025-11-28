import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const FormBuilder = () => {
  const navigate = useNavigate();
  const [baseId, setBaseId] = useState('');
  const [tableId, setTableId] = useState('');
  const [fetchedFields, setFetchedFields] = useState([]);
  

  const [formTitle, setFormTitle] = useState('');
  const [selectedFields, setSelectedFields] = useState([]);


  const handleFetchFields = async () => {
    try {
      const res = await api.get(`/forms/airtable-fields?baseId=${baseId}&tableId=${tableId}`);
      setFetchedFields(res.data.fields);
    } catch (err) {
      alert("Failed to fetch fields. Check IDs.");
    }
  };


  const addFieldToForm = (field) => {
    setSelectedFields([...selectedFields, {
      questionKey: field.id,
      fieldId: field.id,
      label: field.name,
      type: field.type,
      options: field.options || [],
      required: false,
      conditionalRules: null 
    }]);
  };


  const handleSave = async () => {
    try {
      await api.post('/forms', {
        title: formTitle,
        baseId,
        tableId,
        questions: selectedFields
      });
      alert("Form Created!");
      navigate('/dashboard');
    } catch (err) {
      alert("Error saving form");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create New Form</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <input placeholder="Form Title" className="border p-2" onChange={e => setFormTitle(e.target.value)} />
        <input placeholder="Base ID (app...)" className="border p-2" onChange={e => setBaseId(e.target.value)} />
        <input placeholder="Table ID (tbl...)" className="border p-2" onChange={e => setTableId(e.target.value)} />
        <button onClick={handleFetchFields} className="bg-green-600 text-white p-2 rounded">
          Fetch Fields
        </button>
      </div>

      <div className="flex gap-8">
        <div className="w-1/3 border-r pr-4">
          <h3 className="font-bold mb-2">Available Fields</h3>
          {fetchedFields.map(f => (
            <div key={f.id} className="border p-2 mb-2 flex justify-between">
              <span>{f.name} ({f.type})</span>
              <button onClick={() => addFieldToForm(f)} className="text-blue-600">+</button>
            </div>
          ))}
        </div>


        <div className="w-2/3">
          <h3 className="font-bold mb-2">Form Preview</h3>
          {selectedFields.map((q, idx) => (
            <div key={idx} className="border p-4 mb-2 bg-gray-50">
              <label className="block font-bold">{q.label}</label>
              <div className="text-xs text-gray-500">Type: {q.type}</div>

            </div>
          ))}
          {selectedFields.length > 0 && (
            <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 mt-4 rounded w-full">
              Save Form
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;