import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, CheckCircle, RotateCcw, Sparkles, ArrowRight } from 'lucide-react';

interface QuickGuideItem {
  name: string;
  material: string;
  tip: string;
  status: 'accepted' | 'check' | 'composite';
}

const COMMON_ITEMS: QuickGuideItem[] = [
  {
    name: 'Plastic Beverage Bottles',
    material: 'PET #1 Plastic',
    tip: 'Widely accepted curbside. Empty liquids and replace the cap.',
    status: 'accepted',
  },
  {
    name: 'Clean Cardboard Boxes',
    material: 'Corrugated Paperboard',
    tip: 'Flatten boxes to save bin space. Keep dry and free of greasy food stains.',
    status: 'accepted',
  },
  {
    name: 'Aluminum & Steel Cans',
    material: 'Metal',
    tip: 'Infinitely recyclable. Give them a quick rinse before placing in the bin.',
    status: 'accepted',
  },
  {
    name: 'Coffee Cups & Takeout Containers',
    material: 'Composite / Poly-coated Paper',
    tip: 'Internal plastic lining often requires special processing. Check local rules.',
    status: 'composite',
  },
];

export const DashboardPage: React.FC = () => {
  return (
    <div className="dashboard-canvas flex flex-col w-full relative">
      <div className="max-w-6xl mx-auto w-full px-margin-mobile md:px-margin-desktop pt-space-md pb-space-2xl flex flex-col gap-space-lg">
        
        {/* ========================================================================= */}
        {/* 1. HERO WELCOME SECTION WITH REAL ENVIRONMENTAL VISUAL                    */}
        {/* ========================================================================= */}
        <section className="dashboard-hero rounded-3xl p-space-md md:p-space-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md items-center">
            
            <div className="md:col-span-7 flex flex-col gap-3">
              <span className="dashboard-hero-tag inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold w-fit">
                <Sparkles className="w-3.5 h-3.5" />
                WasteWise Circular Intelligence
              </span>

              <h1 className="dashboard-hero-title font-headline-lg-mobile md:font-headline-lg font-bold tracking-tight">
                Recycle & repurpose with confidence
              </h1>

              <p className="dashboard-hero-copy font-body-md text-[14px] leading-relaxed max-w-xl">
                Scan materials with AI, verify local municipal rules with PIN-code precision, and discover second-life options before throwing anything away.
              </p>

              <div className="flex items-center gap-2.5 pt-1 flex-wrap">
                <Link
                  to="/matterlens"
                  className="dashboard-hero-primary py-2.5 px-space-lg rounded-full active:scale-[0.98] transition-all font-headline-sm text-[13px] font-bold flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Scan an Item</span>
                </Link>

                <Link
                  to="/nextworth"
                  className="dashboard-hero-secondary py-2.5 px-space-md rounded-full font-headline-sm text-[13px] font-bold transition-all flex items-center gap-2 border"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Explore NextWorth</span>
                </Link>
              </div>
            </div>

            <div className="md:col-span-5 relative">
              <div className="dashboard-hero-image relative rounded-2xl overflow-hidden aspect-[16/10] border group">
                <img
                  src="/assets/hero.jpg"
                  alt="Organized recycling station with clean glass, aluminum cans, and paper materials"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent flex items-end p-3">
                  <span className="text-[11px] text-white/90 font-medium bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                    Local waste reduction in practice
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. THE FOUR CORE TOOLS WITH REAL THUMBNAILS (INSTANT ACCESS)              */}
        {/* ========================================================================= */}
        <section className="flex flex-col gap-space-sm">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-headline-sm text-[16px] text-primary font-bold">
              Core Recycling & Reuse Tools
            </h2>
            <span className="text-[12px] text-on-surface-variant">
              Select any tool to start
            </span>
          </div>

          <div className="dashboard-tool-list flex flex-col gap-space-sm">
            
            {/* Tool 1: MatterLens */}
            <div className="dashboard-tool-card bg-surface-container-lowest rounded-2xl p-space-sm border border-surface-container-high/60 flex flex-col md:flex-row md:items-center gap-space-sm hover:border-secondary transition-all group">
              <div className="dashboard-feature-content flex flex-col md:grid md:grid-cols-[240px_minmax(0,1fr)] md:items-center md:gap-space-lg gap-2.5">
                <div className="dashboard-feature-image w-full aspect-[16/10] md:aspect-auto md:h-40 rounded-xl overflow-hidden relative bg-surface-container-low border border-surface-container">
                  <img
                    src="/assets/matterlens.jpg"
                    alt="Smartphone camera scanning a recyclable bottle to detect material composition"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-primary shadow-xs">
                    <Camera className="w-3.5 h-3.5 text-primary" />
                  </div>
                </div>

                <div className="px-1 md:px-0">
                  <h3 className="font-headline-sm text-[15px] text-primary font-bold">
                    MatterLens
                  </h3>
                  <p className="text-[11px] text-secondary font-semibold mt-0.5">
                    Identify Material
                  </p>
                  <p className="font-body-sm text-[12px] text-on-surface-variant mt-1.5 leading-relaxed line-clamp-2">
                    Take or upload a photo to detect material composition, recyclability, and contamination.
                  </p>
                </div>
              </div>

              <Link
                to="/matterlens"
                className="dashboard-feature-action w-full md:w-auto md:min-w-[150px] py-2.5 px-3 rounded-full bg-primary-container hover:bg-primary text-secondary-fixed font-headline-sm text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs mt-1 md:mt-0"
              >
                <span>Scan Item</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Tool 2: EcoVerify */}
            <div className="dashboard-tool-card bg-surface-container-lowest rounded-2xl p-space-sm border border-surface-container-high/60 flex flex-col md:flex-row md:items-center gap-space-sm hover:border-secondary transition-all group">
              <div className="dashboard-feature-content flex flex-col md:grid md:grid-cols-[240px_minmax(0,1fr)] md:items-center md:gap-space-lg gap-2.5">
                <div className="dashboard-feature-image w-full aspect-[16/10] md:aspect-auto md:h-40 rounded-xl overflow-hidden relative bg-surface-container-low border border-surface-container">
                  <img
                    src="/assets/ecoverify.jpg"
                    alt="Municipal color-coded recycling sorting bins in a public area"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-primary shadow-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-primary" />
                  </div>
                </div>

                <div className="px-1 md:px-0">
                  <h3 className="font-headline-sm text-[15px] text-primary font-bold">
                    EcoVerify
                  </h3>
                  <p className="text-[11px] text-secondary font-semibold mt-0.5">
                    Local Rules (PIN Lookup)
                  </p>
                  <p className="font-body-sm text-[12px] text-on-surface-variant mt-1.5 leading-relaxed line-clamp-2">
                    Verify rules for your municipality or Indian 6-digit PIN code with location-isolated guidance.
                  </p>
                </div>
              </div>

              <Link
                to="/ecoverify"
                className="dashboard-feature-action w-full md:w-auto md:min-w-[150px] py-2.5 px-3 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-primary font-headline-sm text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 border border-surface-container-highest mt-1 md:mt-0"
              >
                <span>Check Rules</span>
                <ArrowRight className="w-3.5 h-3.5 text-secondary" />
              </Link>
            </div>

            {/* Tool 3: NextWorth */}
            <div className="dashboard-tool-card bg-surface-container-lowest rounded-2xl p-space-sm border border-surface-container-high/60 flex flex-col md:flex-row md:items-center gap-space-sm hover:border-secondary transition-all group">
              <div className="dashboard-feature-content flex flex-col md:grid md:grid-cols-[240px_minmax(0,1fr)] md:items-center md:gap-space-lg gap-2.5">
                <div className="dashboard-feature-image w-full aspect-[16/10] md:aspect-auto md:h-40 rounded-xl overflow-hidden relative bg-surface-container-low border border-surface-container">
                  <img
                    src="/assets/nextworth.jpg"
                    alt="Creative upcycling workshop with repurposed textiles, glass jars, and repaired wood"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-primary shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-secondary" />
                  </div>
                </div>

                <div className="px-1 md:px-0">
                  <h3 className="font-headline-sm text-[15px] text-primary font-bold">
                    NextWorth
                  </h3>
                  <p className="text-[11px] text-secondary font-semibold mt-0.5">
                    Give Items Second Life
                  </p>
                  <p className="font-body-sm text-[12px] text-on-surface-variant mt-1.5 leading-relaxed line-clamp-2">
                    Discover practical ways to reuse, repair, donate, sell, or compost before discarding.
                  </p>
                </div>
              </div>

              <Link
                to="/nextworth"
                className="dashboard-feature-action w-full md:w-auto md:min-w-[150px] py-2.5 px-3 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-primary font-headline-sm text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 border border-surface-container-highest mt-1 md:mt-0"
              >
                <span>Find Second Life</span>
                <ArrowRight className="w-3.5 h-3.5 text-secondary" />
              </Link>
            </div>

            {/* Tool 4: LoopTrace */}
            <div className="dashboard-tool-card bg-surface-container-lowest rounded-2xl p-space-sm border border-surface-container-high/60 flex flex-col md:flex-row md:items-center gap-space-sm hover:border-secondary transition-all group">
              <div className="dashboard-feature-content flex flex-col md:grid md:grid-cols-[240px_minmax(0,1fr)] md:items-center md:gap-space-lg gap-2.5">
                <div className="dashboard-feature-image w-full aspect-[16/10] md:aspect-auto md:h-40 rounded-xl overflow-hidden relative bg-surface-container-low border border-surface-container">
                  <img
                    src="/assets/looptrace.jpg"
                    alt="Sustainable living journal tracking household recycling and reuse activities"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-primary shadow-xs">
                    <RotateCcw className="w-3.5 h-3.5 text-primary" />
                  </div>
                </div>

                <div className="px-1 md:px-0">
                  <h3 className="font-headline-sm text-[15px] text-primary font-bold">
                    LoopTrace
                  </h3>
                  <p className="text-[11px] text-secondary font-semibold mt-0.5">
                    Track Your Impact
                  </p>
                  <p className="font-body-sm text-[12px] text-on-surface-variant mt-1.5 leading-relaxed line-clamp-2">
                    Record items you reuse, repair, donate, sell, or recycle to view your personal progress.
                  </p>
                </div>
              </div>

              <Link
                to="/looptrace"
                className="dashboard-feature-action w-full md:w-auto md:min-w-[150px] py-2.5 px-3 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-primary font-headline-sm text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 border border-surface-container-highest mt-1 md:mt-0"
              >
                <span>Track Impact</span>
                <ArrowRight className="w-3.5 h-3.5 text-secondary" />
              </Link>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. HOW IT WORKS (SIMPLE 3 STEPS)                                          */}
        {/* ========================================================================= */}
        <section className="dashboard-info-card bg-surface-container-lowest rounded-3xl p-space-md md:p-space-lg border border-surface-container-high/60 flex flex-col gap-space-md">
          <div className="flex flex-col gap-1">
            <h2 className="font-headline-sm text-[16px] text-primary font-bold">
              How WasteWise Works
            </h2>
            <p className="text-[13px] text-on-surface-variant">
              Simple steps to keep materials circulating and avoid contamination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md pt-1">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-container text-secondary-fixed font-bold text-[14px] flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[14px] text-primary">Identify</span>
                <p className="text-[12px] text-on-surface-variant mt-0.5 leading-snug">
                  Photograph your container or packaging to detect its material type.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-container text-secondary-fixed font-bold text-[14px] flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[14px] text-primary">Verify Rules</span>
                <p className="text-[12px] text-on-surface-variant mt-0.5 leading-snug">
                  Match with official municipal guidelines for your city or 6-digit Indian PIN.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-container text-secondary-fixed font-bold text-[14px] flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[14px] text-primary">Circulate</span>
                <p className="text-[12px] text-on-surface-variant mt-0.5 leading-snug">
                  Reuse, repair, donate, or recycle cleanly with clear checklists.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. EVERYDAY RECYCLING GUIDANCE                                            */}
        {/* ========================================================================= */}
        <section className="flex flex-col gap-space-sm">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-headline-sm text-[16px] text-primary font-bold">
              Common Everyday Items
            </h2>
            <Link to="/ecoverify" className="text-[12px] text-secondary font-bold hover:underline">
              Check specific item →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
            {COMMON_ITEMS.map((item, index) => (
              <div
                key={index}
                className="dashboard-info-card p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[14px] text-primary">{item.name}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium">
                    {item.material}
                  </span>
                </div>
                <p className="text-[12px] text-on-surface-variant leading-snug">
                  {item.tip}
                </p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
