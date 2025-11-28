import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const ResponseViewer = () => {
  const { id } = useParams(); 
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const res = await api.get(`/forms/${id}/responses`);
        setResponses(res.data);
      } catch (err) {
        console.error("Failed to fetch responses");
      } finally {
        setLoading(false);
      }
    };
    fetchResponses();
  }, [id]);

  if (loading) return <div className="p-10">Loading Data...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Form Responses</h1>
        <Link to="/dashboard" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4 font-medium">Submission Date</th>
              <th className="p-4 font-medium">Airtable Record ID</th>
              <th className="p-4 font-medium">Answers (Preview)</th>
            </tr>
          </thead>
          <tbody>
            {responses.map((resp) => (
              <tr key={resp._id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-gray-600">
                  {new Date(resp.createdAt).toLocaleString()}
                </td>
                <td className="p-4 font-mono text-xs bg-gray-50 rounded">
                  {resp.airtableRecordId}
                </td>
                <td className="p-4">
                  <pre className="text-xs text-gray-500 whitespace-pre-wrap">
                    {JSON.stringify(resp.answers, null, 2)}
                  </pre>
                </td>
              </tr>
            ))}
            {responses.length === 0 && (
              <tr>
                <td colSpan="3" className="p-8 text-center text-gray-500">
                  No responses received yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResponseViewer;