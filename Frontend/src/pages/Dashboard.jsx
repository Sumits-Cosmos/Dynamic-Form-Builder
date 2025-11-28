import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Dashboard = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await api.get('/forms');
        setForms(res.data);
      } catch (err) {
        console.error("Failed to load forms", err);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  if (loading) return <div className="p-8">Loading forms...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Forms</h1>
        <Link 
          to="/builder" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          + Create New Form
        </Link>
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">You haven't created any forms yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <div key={form._id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition border border-gray-100">
              <h3 className="font-bold text-xl mb-2 text-gray-800">{form.title}</h3>
              <p className="text-sm text-gray-500 mb-4">
                Table: {form.airtableTableId}
              </p>
              
              <div className="flex gap-2 mt-4">
                <Link 
                  to={`/form/${form._id}`}
                  target="_blank"
                  className="flex-1 text-center border border-blue-600 text-blue-600 px-3 py-2 rounded hover:bg-blue-50 text-sm"
                >
                  View Form ↗
                </Link>

            <Link to={`/responses/${form._id}`}
                className="flex-1 text-center border border-gray-300 text-gray-700 px-3 py-2 rounded hover:bg-gray-50 text-sm">
                Responses
            </Link>
              </div>
              <div className="mt-2 text-xs text-gray-400 text-center">
                ID: {form._id}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;