import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { shouldShowQuestion } from '../utils/logicEngine';

const FormViewer = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    api.get(`/forms/${id}`).then(res => setForm(res.data));
  }, [id]);

  const handleChange = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/forms/${id}/submit`, { answers });
      alert("Submitted successfully!");
    } catch (err) {
      alert("Submission failed: " + (err.response?.data?.message || err.message));
    }
  };

  if (!form) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow mt-10">
      <h1 className="text-3xl font-bold mb-6">{form.title}</h1>
      <form onSubmit={handleSubmit}>
        {form.questions.map(q => {
          const isVisible = shouldShowQuestion(q.conditionalRules, answers);
          if (!isVisible) return null;

          return (
            <div key={q.questionKey} className="mb-4">
              <label className="block font-medium mb-1">
                {q.label} {q.required && <span className="text-red-500">*</span>}
              </label>
              
              {q.type === 'singleLineText' && (
                <input 
                  className="w-full border p-2 rounded"
                  required={q.required}
                  onChange={e => handleChange(q.questionKey, e.target.value)}
                />
              )}

              {q.type === 'singleSelect' && (
                <select 
                  className="w-full border p-2 rounded"
                  required={q.required}
                  onChange={e => handleChange(q.questionKey, e.target.value)}
                >
                  <option value="">Select...</option>
                  {q.options?.map(opt => (
                    <option key={opt.id} value={opt.name}>{opt.name}</option>
                  ))}
                </select>
              )}
              {q.type === 'multipleSelects' && (
                <div className="p-2 border rounded bg-gray-50">
                <p className="text-xs text-gray-500 mb-2">Select all that apply:</p>
                <div className="flex flex-wrap gap-2">
                {q.options?.map((opt) => (
                <label key={opt.id} className="flex items-center space-x-2 cursor-pointer">
            <input
            type="checkbox"
            value={opt.name}
            onChange={(e) => {
              const current = answers[q.questionKey] || [];
              let updated;
              if (e.target.checked) {
                updated = [...current, opt.name];
              } else {
                updated = current.filter(item => item !== opt.name);
              }
              handleChange(q.questionKey, updated);
            }}
                            className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{opt.name}</span>
                        </label>
                    ))}
                    </div>
                </div>
                )}
            </div>
          );
        })}
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
          Submit
        </button>
      </form>
    </div>
  );
};

export default FormViewer;