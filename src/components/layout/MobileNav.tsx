import React from 'react';
import { NavLink } from 'react-router-dom';

export const MobileNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/90 backdrop-blur-xl border-t border-surface-container-high/60 shadow-[0_-4px_20px_rgba(20,83,45,0.06)] md:hidden">
      <div className="relative flex justify-around items-center h-16 px-space-xs max-w-lg mx-auto">
        
        {/* Home Link */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 transition-colors ${
              isActive ? 'text-secondary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
            }`
          }
        >
          <span className="material-symbols-outlined text-[24px]">home</span>
          <span className="font-caption text-[11px] mt-0.5">Home</span>
        </NavLink>

        {/* NextWorth Link */}
        <NavLink
          to="/nextworth"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 transition-colors ${
              isActive ? 'text-secondary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
            }`
          }
        >
          <span className="material-symbols-outlined text-[24px]">autorenew</span>
          <span className="font-caption text-[11px] mt-0.5">NextWorth</span>
        </NavLink>

        {/* Center Floating Action Button (MatterLens Scan trigger) */}
        <div className="relative -top-5 flex flex-col items-center">
          <NavLink
            to="/matterlens"
            aria-label="Scan Item with MatterLens"
            className="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-[0_8px_20px_rgba(20,83,45,0.35)] active:scale-95 hover:bg-primary transition-all ring-4 ring-surface"
          >
            <span className="material-symbols-outlined text-[28px] text-secondary-fixed">photo_camera</span>
          </NavLink>
          <span className="font-caption text-[11px] text-on-surface-variant font-medium mt-1">MatterLens</span>
        </div>

        {/* EcoVerify Link */}
        <NavLink
          to="/ecoverify"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 transition-colors ${
              isActive ? 'text-secondary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
            }`
          }
        >
          <span className="material-symbols-outlined text-[24px]">verified_user</span>
          <span className="font-caption text-[11px] mt-0.5">EcoVerify</span>
        </NavLink>

        {/* LoopTrace Link */}
        <NavLink
          to="/looptrace"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 transition-colors ${
              isActive ? 'text-secondary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
            }`
          }
        >
          <span className="material-symbols-outlined text-[24px]">published_with_changes</span>
          <span className="font-caption text-[11px] mt-0.5">LoopTrace</span>
        </NavLink>

      </div>
    </nav>
  );
};
