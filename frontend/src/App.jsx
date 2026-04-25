import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import OptimizerApp from './pages/OptimizerApp.jsx';
import AuthPage from './pages/AuthPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';

/**
 * App — Main ThermalJustice Router application.
 */
export default function App() {
  return (
    <div id="thermal-justice-app">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/app" element={<OptimizerApp />} />
      </Routes>
    </div>
  );
}
