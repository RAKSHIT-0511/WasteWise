import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="pt-space-xl pb-space-2xl bg-surface-container-low/50 border-t border-surface-container-high/60 mt-auto">
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop flex flex-col items-center gap-space-lg">
        
        {/* Clean Overview & Links */}
        <div className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-surface-container-high/60">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <span className="font-headline-sm text-[16px] text-primary font-bold">WasteWise</span>
            <p className="text-[12px] text-on-surface-variant max-w-md mt-0.5">
              Smart waste identification and localized municipal recycling verification for cleaner communities.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[13px] font-medium text-primary">
            <a href="/matterlens" className="hover:text-secondary transition-colors">MatterLens</a>
            <span className="text-outline-variant text-[10px]">•</span>
            <a href="/ecoverify" className="hover:text-secondary transition-colors">EcoVerify</a>
            <span className="text-outline-variant text-[10px]">•</span>
            <a href="/nextworth" className="hover:text-secondary transition-colors">NextWorth</a>
            <span className="text-outline-variant text-[10px]">•</span>
            <a href="/looptrace" className="hover:text-secondary transition-colors">LoopTrace</a>
          </div>
        </div>

        {/* Footer Navigation Links */}
        <div className="flex flex-wrap justify-center items-center gap-x-space-md gap-y-space-xs">
          <a className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors" href="#about">
            About
          </a>
          <span className="text-outline-variant text-[10px]">•</span>
          <a className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors" href="#campus">
            Campus Programs
          </a>
          <span className="text-outline-variant text-[10px]">•</span>
          <a className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors" href="#facilities">
            Recycling Facilities
          </a>
          <span className="text-outline-variant text-[10px]">•</span>
          <a className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors" href="#privacy">
            Privacy &amp; Terms
          </a>
        </div>

        {/* Copyright & Ethics Tag */}
        <div className="flex items-center gap-1.5 font-caption text-caption text-on-surface-variant/80 text-center">
          <span className="material-symbols-outlined text-[15px] text-secondary">public</span>
          <span>© 2025 WasteWise Inc. Powered by Ethical Computer Vision.</span>
        </div>

      </div>
    </footer>
  );
};
