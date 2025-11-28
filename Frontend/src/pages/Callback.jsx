import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Callback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const calledRef = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      alert("Login Failed: " + error);
      navigate('/');
      return;
    }

    if (code && !calledRef.current) {
      calledRef.current = true;
      
      const codeVerifier = localStorage.getItem('code_verifier');
      
      if (!codeVerifier) {
        console.error("Missing code_verifier in localStorage");
        navigate('/'); 
        return;
      }

      console.log("Sending Code + Verifier to Backend...");


      api.post('/auth/login', { code, codeVerifier })
        .then(res => {
          localStorage.removeItem('code_verifier');
          login(res.data.token, res.data.user);
          navigate('/dashboard');
        })
        .catch(err => {
          console.error("Backend Exchange Failed:", err.response?.data || err.message);
          navigate('/');
        });
    }
  }, [searchParams]);

  return <div className="p-10 text-center text-xl">Authenticating with Airtable...</div>;
};

export default Callback;