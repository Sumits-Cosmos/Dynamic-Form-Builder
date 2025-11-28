import React, { useState } from 'react';

const generateRandomString = (length = 32) => {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};


const generateChallenge = async (verifier) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const Login = () => {
  const [status, setStatus] = useState("Ready");

  const handleLogin = async () => {
    setStatus("Generating Security Keys...");

    try {
      const clientId = import.meta.env.VITE_AIRTABLE_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_AIRTABLE_REDIRECT_URI;

      if (!clientId || !redirectUri) {
        alert("Configuration Error: Missing Client ID or Redirect URI in .env");
        setStatus("Config Error");
        return;
      }

      const state = generateRandomString(16); 
      const verifier = generateRandomString(32); 
      const challenge = await generateChallenge(verifier);

      console.log("--- DEBUG AUTH ---");
      console.log("State:", state);
      console.log("Verifier:", verifier);


      localStorage.setItem('code_verifier', verifier);
      const scope = 'data.records:read data.records:write schema.bases:read user.email:read';
      const params = new URLSearchParams();
      params.append('client_id', clientId);
      params.append('redirect_uri', redirectUri);
      params.append('response_type', 'code');
      params.append('state', state); 
      params.append('code_challenge', challenge);
      params.append('code_challenge_method', 'S256');

    
      const queryString = params.toString() + `&scope=${encodeURIComponent(scope)}`;
      const url = `https://airtable.com/oauth2/v1/authorize?${queryString}`;

      console.log("Redirecting to:", url);
      
      setStatus("Redirecting...");
      window.location.href = url;

    } catch (err) {
      console.error("Generation Error:", err);
      alert("Failed to generate login keys. See console.");
      setStatus("Error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md text-center max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-blue-900">Airtable Form Builder</h1>
        <p className="mb-6 text-gray-600">
          Connect securely using OAuth 2.0 with PKCE protection.
        </p>
        
        <button 
          onClick={handleLogin}
          disabled={status !== "Ready"}
          className={`px-8 py-3 rounded text-white font-medium transition shadow-lg ${
            status === "Ready" 
              ? "bg-blue-600 hover:bg-blue-700 hover:shadow-xl" 
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {status === "Ready" ? "Login with Airtable" : status}
        </button>
      </div>
    </div>
  );
};

export default Login;