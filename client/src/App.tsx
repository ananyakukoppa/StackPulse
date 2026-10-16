import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ComparePage from './pages/ComparePage';
import CurationsPage from './pages/CurationsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-teal-500 selection:text-white">
          <Navbar />
          <main className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/curations" element={<CurationsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
