import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UploadPage from './pages/UploadPage';
import JobsPage from './pages/JobsPage';
import ResultPage from './pages/ResultPage';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main style={{ padding: '24px' }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
          <Route path="/jobs/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
          <Route path="/results/:jobId" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
