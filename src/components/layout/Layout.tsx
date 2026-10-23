import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface antialiased selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Top Fixed Header */}
      <Header />

      {/* Main Content Area */}
      <main className="app-main flex-1 w-full pt-20 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <div className="app-main">
        <Footer />
      </div>
    </div>
  );
};
