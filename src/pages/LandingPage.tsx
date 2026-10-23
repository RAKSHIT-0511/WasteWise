import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Compass, Sparkles, Droplets, CheckCircle, Trophy, Zap, Shield, ArrowRight, RotateCcw } from 'lucide-react';


export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col w-full relative overflow-hidden">
      {/* Decorative Ambient Background Blurs */}
      <div className="absolute top-12 -right-16 w-80 h-80 bg-secondary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-96 -left-20 w-80 h-80 bg-surface-container-highest/60 rounded-full blur-3xl pointer-events-none -z-10" />
      
      <div className="max-w-7xl mx-auto w-full px-margin-mobile md:px-margin-desktop pt-space-md pb-space-2xl flex flex-col gap-space-2xl">
        
        {/* ========================================================================= */}
        {/* 1. HERO SECTION & AR CAMERA PREVIEW (RESPONSIVE GRID)                     */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center pt-space-xs">
          
          {/* Left Column: Headlines & CTA Actions */}
          <div className="lg:col-span-6 flex flex-col items-start gap-space-md">
            
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-space-xs px-space-sm py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-label-pill text-label-pill uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-secondary fill-secondary" />
              <span>AI-Powered Waste Intelligence</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-headline-xl-mobile md:font-headline-xl text-headline-xl-mobile md:text-headline-xl text-primary tracking-tight font-bold">
              Give Your Waste a{' '}
              <span className="text-secondary underline decoration-secondary-fixed decoration-4 underline-offset-4">
                Second Life
              </span>.
            </h1>

            {/* Subheadline */}
            <p className="font-body-md md:font-body-lg text-body-md md:text-body-lg text-on-surface-variant leading-relaxed max-w-xl">
              Identify, segregate, and recycle smarter with instant camera detection and hyper-local disposal instructions.
            </p>

            {/* CTA Action Stack */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full sm:w-auto gap-space-xs pt-space-xs">
              <Link
                to="/matterlens"
                className="inline-flex items-center justify-center gap-space-xs bg-primary text-on-primary font-headline-sm text-headline-sm px-7 py-3.5 rounded-full shadow-[0_8px_20px_rgba(20,83,45,0.25)] hover:bg-primary-container active:scale-95 transition-all text-center"
              >
                <Camera className="w-5 h-5 text-secondary-fixed" />
                <span>Scan with MatterLens</span>
              </Link>

              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-space-xs bg-surface-container-low text-secondary font-headline-sm text-headline-sm px-6 py-3.5 rounded-full shadow-xs hover:bg-surface-container active:scale-95 transition-all text-center border border-surface-container-high"
              >
                <span>View Dashboard</span>
                <ArrowRight className="w-4 h-4 text-secondary" />
              </Link>

              <a
                href="#process"
                className="inline-flex items-center justify-center gap-space-xs text-on-surface-variant hover:text-on-surface font-headline-sm text-[15px] px-4 py-3 text-center"
              >
                <Compass className="w-4 h-4 text-secondary" />
                <span>How It Works</span>
              </a>
            </div>

            {/* Trust note */}
            <div className="flex items-center gap-2 pt-1 text-on-surface-variant font-caption text-caption">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>Connected to Google Antigravity &amp; Gemma 4 Intelligence</span>
            </div>

          </div>

          {/* Right Column: Live AI Detection Interactive Preview Card */}
          <div className="lg:col-span-6 w-full" id="scan-demo">
            <div className="w-full relative rounded-2xl overflow-hidden bg-surface-container-lowest shadow-[0_8px_32px_rgba(20,83,45,0.1)] border border-surface-container-high">
              
              {/* Bottle Preview Image with Simulated Lens Feed */}
              <div className="relative w-full h-80 sm:h-96 overflow-hidden bg-surface-container">
                <img
                  className="w-full h-full object-cover"
                  alt="Recyclable clear PET water bottle on clean architectural surface"
                  src="https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80"
                />

                {/* AR Detection Grid Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/75 via-transparent to-primary/40 flex flex-col justify-between p-space-md">
                  
                  {/* Top Camera Status Bar */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-numeric text-label-numeric shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                      <span>VISION v4.2 LIVE</span>
                    </span>
                    <span className="p-2 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-primary shadow-sm">
                      <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
                    </span>
                  </div>

                  {/* AI Bounding Box Graphic */}
                  <div className="relative mx-auto my-auto w-48 h-48 rounded-2xl flex items-center justify-center">
                    {/* Bounding Corner Brackets */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-secondary-fixed rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-secondary-fixed rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-secondary-fixed rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-secondary-fixed rounded-br-lg" />
                    {/* Scanning Pulse Line */}
                    <div className="w-full h-0.5 bg-secondary-fixed shadow-[0_0_12px_#7ffc97] opacity-80 animate-pulse" />
                  </div>

                  {/* Recognition Floating Pill Tag */}
                  <div className="bg-surface-container-lowest/95 backdrop-blur-lg rounded-DEFAULT p-space-sm shadow-md flex items-center justify-between gap-space-xs border border-surface-container-high/60">
                    <div className="flex items-center gap-space-xs min-w-0">
                      <div className="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center flex-shrink-0 text-on-secondary-fixed">
                        <span className="material-symbols-outlined text-[20px]">recycling</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-headline-sm text-[16px] text-primary truncate leading-tight font-bold">
                          Recyclable PET (Cat. 1)
                        </p>
                        <p className="font-caption text-caption text-on-surface-variant flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-secondary" />
                          <span>Bin: Yellow Recyclables</span>
                        </p>
                      </div>
                    </div>
                    <span className="font-label-numeric text-label-numeric font-bold text-secondary bg-secondary-fixed/40 px-3 py-1 rounded-full whitespace-nowrap">
                      98.4%
                    </span>
                  </div>

                </div>
              </div>

              {/* Micro Prep Banner beneath scanner preview */}
              <div className="px-space-md py-space-sm bg-surface-container-low flex items-center justify-between text-on-surface border-t border-surface-container-high/40">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-secondary" />
                  <span className="font-caption text-caption text-on-surface-variant">
                    Rinse clean &amp; compress to save bin space.
                  </span>
                </div>
                <span className="font-label-pill text-label-pill text-secondary font-bold uppercase tracking-wider bg-secondary-container/50 px-2 py-0.5 rounded-full">
                  +15 EcoPts
                </span>
              </div>

            </div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* 2. THREE-STEP PROCESS SECTION                                             */}
        {/* ========================================================================= */}
        <section className="flex flex-col gap-space-md" id="process">
          <div className="flex flex-col gap-1 max-w-xl">
            <span className="font-label-pill text-label-pill text-secondary uppercase tracking-wider font-bold">
              Effortless Action
            </span>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary font-bold">
              Scan → Segregate → Sustain
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Three quick steps from confusion to verified municipal diversion.
            </p>
          </div>

          {/* Step Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            
            {/* Step 1 */}
            <div className="flex md:flex-col items-start gap-space-md p-space-md rounded-2xl bg-surface-container-lowest shadow-xs border border-surface-container-high/60 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0 text-on-primary-fixed font-headline-sm text-[16px] font-bold shadow-xs">
                1
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-space-xs">
                  <Camera className="w-4 h-4 text-secondary" />
                  <h3 className="font-headline-sm text-[16px] text-primary font-bold">Snap or Upload</h3>
                </div>
                <p className="font-body-sm text-[13px] text-on-surface-variant leading-snug">
                  Capture any container, packaging scrap, or broken electronic item.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex md:flex-col items-start gap-space-md p-space-md rounded-2xl bg-surface-container-lowest shadow-xs border border-surface-container-high/60 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center flex-shrink-0 text-on-secondary-fixed font-headline-sm text-[16px] font-bold shadow-xs">
                2
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-space-xs">
                  <CheckCircle className="w-4 h-4 text-secondary" />
                  <h3 className="font-headline-sm text-[16px] text-primary font-bold">Guidance &amp; Prep</h3>
                </div>
                <p className="font-body-sm text-[13px] text-on-surface-variant leading-snug">
                  Get material identification, bin recommendations, and prep advice.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex md:flex-col items-start gap-space-md p-space-md rounded-2xl bg-surface-container-lowest shadow-xs border border-surface-container-high/60 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center flex-shrink-0 text-on-tertiary-fixed font-headline-sm text-[16px] font-bold shadow-xs">
                3
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-space-xs">
                  <Trophy className="w-4 h-4 text-secondary" />
                  <h3 className="font-headline-sm text-[16px] text-primary font-bold">Divert &amp; Earn</h3>
                </div>
                <p className="font-body-sm text-[13px] text-on-surface-variant leading-snug">
                  Divert landfill waste, log carbon impact, and earn Eco-Points.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. ENGINEERED FEATURES: 5 CORE FEATURES ARCHITECTURE                       */}
        {/* ========================================================================= */}
        <section className="flex flex-col gap-space-md">
          <div className="flex flex-col gap-0.5">
            <span className="font-label-pill text-label-pill text-secondary uppercase tracking-wider font-bold">
              Core Platform Architecture
            </span>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-primary font-bold">
              Five Specialized Circular Features
            </h2>
            <p className="font-body-sm text-[13px] text-on-surface-variant max-w-xl">
              Engineered for visual classification, localized rules, uncertainty handling, and circular diversion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
            
            {/* Feature 1: MatterLens */}
            <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-xs border border-surface-container-high/60 flex flex-col justify-between gap-space-sm">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-secondary">
                    <Zap className="w-5 h-5 text-secondary" />
                  </div>
                  <span className="font-label-pill text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-bold">Active</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-[16px] text-primary font-bold">1. MatterLens</h3>
                  <p className="font-body-sm text-[12px] text-on-surface-variant mt-1 leading-snug">
                    AI waste identification and material analysis powered by Gemma multimodal vision.
                  </p>
                </div>
              </div>
              <Link
                to="/matterlens"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-primary-container text-on-primary font-headline-sm text-[12px] font-semibold hover:bg-primary transition-all text-center"
              >
                <span>Launch MatterLens</span>
                <ArrowRight className="w-3.5 h-3.5 text-secondary-fixed" />
              </Link>
            </div>

            {/* Feature 2: EcoVerify */}
            <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-xs border border-surface-container-high/60 flex flex-col justify-between gap-space-sm">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-label-pill text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-bold">Active</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-[16px] text-primary font-bold">2. EcoVerify</h3>
                  <p className="font-body-sm text-[12px] text-on-surface-variant mt-1 leading-snug">
                    Local recycling guideline verification cross-referencing municipal portals.
                  </p>
                </div>
              </div>
              <Link
                to="/ecoverify"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-primary-container text-on-primary font-headline-sm text-[12px] font-semibold hover:bg-primary transition-all text-center"
              >
                <span>Launch EcoVerify</span>
                <ArrowRight className="w-3.5 h-3.5 text-secondary-fixed" />
              </Link>
            </div>

            {/* Feature 3: NextWorth */}
            <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-xs border border-secondary/40 flex flex-col justify-between gap-space-sm hover:border-secondary transition-all">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-primary font-bold">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-label-pill text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-bold">
                    Active
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-[16px] text-primary font-bold">3. NextWorth</h3>
                  <p className="font-body-sm text-[12px] text-on-surface-variant mt-1 leading-snug">
                    Circular hierarchy recommendations for reusing, repairing, donating, reselling, or recycling items.
                  </p>
                </div>
              </div>
              <Link
                to="/nextworth"
                className="inline-flex items-center justify-between text-[12px] text-primary font-bold hover:text-secondary transition-colors py-1 group"
              >
                <span>Find Second Life</span>
                <ArrowRight className="w-3.5 h-3.5 text-secondary group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Feature 4: LoopTrace */}
            <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-xs border border-secondary/40 flex flex-col justify-between gap-space-sm hover:border-secondary transition-all">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-primary font-bold">
                    <RotateCcw className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-label-pill text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-bold">
                    Active
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-[16px] text-primary font-bold">4. LoopTrace</h3>
                  <p className="font-body-sm text-[12px] text-on-surface-variant mt-1 leading-snug">
                    Personal waste journey tracking for items reused, repaired, donated, resold, or recycled.
                  </p>
                </div>
              </div>
              <Link
                to="/looptrace"
                className="inline-flex items-center justify-between text-[12px] text-primary font-bold hover:text-secondary transition-colors py-1 group"
              >
                <span>Track Your Impact</span>
                <ArrowRight className="w-3.5 h-3.5 text-secondary group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. LIVE IMPACT METRICS (DEMONSTRATION STATS BANNER)                       */}
        {/* ========================================================================= */}
        <section className="rounded-3xl bg-primary text-on-primary p-space-lg md:p-space-xl shadow-lg relative overflow-hidden flex flex-col gap-space-lg">
          {/* Watermark Background Decal */}
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[220px]">eco</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 z-10">
            <div className="flex items-center gap-space-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary-fixed animate-ping" />
              <span className="font-label-pill text-label-pill tracking-widest uppercase text-secondary-fixed font-bold">
                Community Telemetry
              </span>
            </div>
            <span className="px-3 py-1 rounded-full bg-on-primary/10 text-on-primary font-caption text-caption border border-on-primary/20">
              Verified Demonstration Statistics
            </span>
          </div>

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md z-10">
            {/* Metric 1 */}
            <div className="p-space-md rounded-2xl bg-primary-container text-on-primary flex items-center justify-between border border-on-primary/10">
              <div>
                <p className="font-display-hero-mobile text-display-hero-mobile font-bold text-secondary-fixed tracking-tight">
                  124,580+
                </p>
                <p className="font-body-sm text-body-sm text-on-primary-container font-medium">
                  Items Classified &amp; Analyzed
                </p>
              </div>
              <span className="material-symbols-outlined text-secondary-fixed text-[36px] opacity-80">
                document_scanner
              </span>
            </div>

            {/* Metric 2 */}
            <div className="p-space-md rounded-2xl bg-primary-container text-on-primary flex items-center justify-between border border-on-primary/10">
              <div>
                <p className="font-display-hero-mobile text-display-hero-mobile font-bold text-primary-fixed tracking-tight">
                  48.2 Tons
                </p>
                <p className="font-body-sm text-body-sm text-on-primary-container font-medium">
                  Waste Diverted from Landfills
                </p>
              </div>
              <span className="material-symbols-outlined text-primary-fixed text-[36px] opacity-80">
                compost
              </span>
            </div>

            {/* Metric 3 */}
            <div className="p-space-md rounded-2xl bg-primary-container text-on-primary flex items-center justify-between border border-on-primary/10">
              <div>
                <p className="font-display-hero-mobile text-display-hero-mobile font-bold text-tertiary-fixed tracking-tight">
                  89.6%
                </p>
                <p className="font-body-sm text-body-sm text-on-primary-container font-medium">
                  Segregation Accuracy Rate
                </p>
              </div>
              <span className="material-symbols-outlined text-tertiary-fixed text-[36px] opacity-80">
                task_alt
              </span>
            </div>
          </div>

          {/* Diversion Rate Mini Progress Meter */}
          <div className="pt-space-xs z-10 flex flex-col gap-2 max-w-2xl">
            <div className="flex justify-between items-center font-caption text-caption text-on-primary-container">
              <span>Global Campus Zero-Waste Goal</span>
              <span className="text-secondary-fixed font-bold">89.6% / 95.0%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-primary-container overflow-hidden p-0.5">
              <div className="h-full bg-gradient-to-r from-secondary to-secondary-fixed rounded-full w-[89.6%]" />
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. BOTTOM CALL-TO-ACTION BANNER                                           */}
        {/* ========================================================================= */}
        <section className="rounded-3xl bg-surface-container p-space-lg md:p-space-2xl text-center flex flex-col items-center gap-space-md shadow-xs border border-surface-container-high/60">
          <div className="w-14 h-14 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shadow-md">
            <span className="material-symbols-outlined text-[32px]">nest_eco_leaf</span>
          </div>

          <div className="flex flex-col gap-1 max-w-lg">
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary font-bold">
              Start Your Zero-Waste Journey Today
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Join thousands making a measurable micro-impact with every single toss. Free for individuals and neighborhood champions.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs bg-primary text-on-primary font-headline-sm text-headline-sm px-8 py-3.5 rounded-full shadow-[0_8px_20px_rgba(20,83,45,0.25)] hover:bg-primary-container active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">rocket_launch</span>
            <span>Launch Dashboard</span>
          </Link>

          <span className="font-caption text-caption text-on-surface-variant flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-secondary">lock</span>
            <span>No subscription required • Works directly in modern browsers</span>
          </span>
        </section>

      </div>
    </div>
  );
};
