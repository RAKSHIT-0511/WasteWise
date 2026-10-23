import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, Sparkles, ShieldCheck, RotateCcw, User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl pt-safe border-b border-surface-container-high/40 shadow-[0_1px_8px_rgba(0,0,0,0.03)] transition-all">
      <div className="max-w-7xl mx-auto h-20 px-margin-mobile md:px-margin-desktop flex items-center justify-between gap-space-sm">
        
        {/* Brand Logo & Title */}
        <NavLink to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-primary-container text-secondary-fixed flex items-center justify-center shadow-[0_6px_18px_rgba(0,59,27,0.22)] group-hover:scale-105 group-hover:rotate-[-4deg] transition-transform">
            <span className="material-symbols-outlined text-[30px]">recycling</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-[21px] leading-6 text-primary tracking-tight font-extrabold group-hover:text-secondary transition-colors">
              WasteWise
            </span>
            <span className="hidden sm:inline-block font-label-pill text-[9px] text-on-surface-variant uppercase tracking-widest -mt-1">
              Recycling Assistant
            </span>
          </div>
        </NavLink>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main navigation" className="app-sidebar-nav flex flex-col items-stretch gap-1">
          <NavLink
            to="/"
            end
            aria-label="Dashboard"
            className={({ isActive }) =>
              `px-4 py-1.5 rounded-full font-headline-sm text-[14px] transition-all ${
                isActive
                  ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`
            }
          >
            <Home className="w-4 h-4 text-secondary" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/matterlens"
            aria-label="MatterLens"
            className={({ isActive }) =>
              `px-4 py-1.5 rounded-full font-headline-sm text-[14px] transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`
            }
          >
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            <span>MatterLens</span>
          </NavLink>
          <NavLink
            to="/ecoverify"
            aria-label="EcoVerify"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-full font-headline-sm text-[13px] transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`
            }
          >
            <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
            <span>EcoVerify</span>
          </NavLink>
          <NavLink
            to="/nextworth"
            aria-label="NextWorth"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-full font-headline-sm text-[13px] transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`
            }
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">autorenew</span>
            <span>NextWorth</span>
          </NavLink>
          <NavLink
            to="/looptrace"
            aria-label="LoopTrace"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-full font-headline-sm text-[13px] transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`
            }
          >
            <RotateCcw className="w-3.5 h-3.5 text-secondary" />
            <span>LoopTrace</span>
          </NavLink>
        </nav>

        {/* Right Action Stack: Notification, Profile */}
        <div className="flex items-center gap-space-xs sm:gap-space-sm relative">
          <ProfileHeaderMenu />
        </div>

      </div>
    </header>
  );
};

const ProfileHeaderMenu: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <Link
        to="/profile"
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary-container hover:bg-primary text-secondary-fixed text-[13px] font-bold shadow-xs transition-colors"
      >
        <User className="w-3.5 h-3.5" />
        <span>Sign In</span>
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User Profile Menu"
        aria-expanded={isOpen}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-container transition-colors ring-2 ring-secondary-fixed/50"
      >
        <div className="w-8 h-8 rounded-full bg-secondary-fixed text-primary flex items-center justify-center font-bold text-xs overflow-hidden">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
          ) : (
            user.displayName.slice(0, 1).toUpperCase()
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-lg p-2 z-50 flex flex-col gap-1 text-[13px] animate-in fade-in duration-100">
          <div className="px-3 py-2 border-b border-surface-container flex flex-col">
            <span className="font-bold text-primary truncate">{user.displayName}</span>
            <span className="text-[11px] text-on-surface-variant truncate">{user.email}</span>
            {user.preferredCity && (
              <span className="text-[10px] text-secondary font-medium mt-0.5">
                📍 {user.preferredCity}{user.preferredPincode ? ` (${user.preferredPincode})` : ''}
              </span>
            )}
          </div>

          <Link
            to="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-container text-on-surface hover:text-primary transition-colors font-medium"
          >
            <User className="w-4 h-4 text-secondary" />
            <span>My Profile</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              signOut();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-error-container/40 text-on-surface hover:text-error transition-colors font-medium text-left w-full"
          >
            <LogOut className="w-4 h-4 text-error" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};

