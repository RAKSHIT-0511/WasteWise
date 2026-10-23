import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { MatterLensPage } from './pages/MatterLensPage';
import { EcoVerifyPage } from './pages/EcoVerifyPage';
import { LoopTracePage } from './pages/LoopTracePage';
import { NextWorthPage } from './pages/NextWorthPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="matterlens" element={<MatterLensPage />} />
            <Route path="ecoverify" element={<EcoVerifyPage />} />
            <Route path="looptrace" element={<LoopTracePage />} />
            <Route path="nextworth" element={<NextWorthPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
