import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Callback from './pages/Callback';
import Dashboard from './pages/Dashboard'; 
import FormBuilder from './pages/FormBuilder';
import FormViewer from './pages/FormViewer';
import ResponseViewer from './pages/ResponseViewer';



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/builder" element={<FormBuilder />} />
          <Route path="/form/:id" element={<FormViewer />} />
          <Route path="/responses/:id" element={<ResponseViewer />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;