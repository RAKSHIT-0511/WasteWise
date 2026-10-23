import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Upload,
  Heart,
  Wrench,
  RotateCcw,
  ShoppingBag,
  ExternalLink,
  Check,
  ArrowRight
} from 'lucide-react';
import type { NextWorthRecommendation, NextWorthActionStep } from '../../server/nextworthGateway';

const CATEGORIES = [
  'Clothing & Textiles',
  'Electronics & Gadgets',
  'Containers & Glassware',
  'Furniture & Homewares',
  'Books, Toys & Games',
  'General Household Item',
];

const CONDITIONS = [
  'Good / wearable / working',
  'Needs minor repair / torn',
  'Heavily worn / broken',
  'Unopened / like new',
];

const SAMPLE_ITEMS = [
  { name: 'Old Cotton T-Shirt', category: 'Clothing & Textiles', condition: 'Heavily worn / torn' },
  { name: 'Gently Used Winter Jacket', category: 'Clothing & Textiles', condition: 'Good / wearable / working' },
  { name: 'Glass Jam Jar', category: 'Containers & Glassware', condition: 'Good / wearable / working' },
  { name: 'Old Smartphone with Weak Battery', category: 'Electronics & Gadgets', condition: 'Needs minor repair / torn' },
  { name: 'Hardcover Storybook', category: 'Books, Toys & Games', condition: 'Good / wearable / working' },
];

export const NextWorthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state as { itemName?: string; category?: string; condition?: string }) || {};

  const [itemName, setItemName] = useState(navState.itemName || '');
  const [category, setCategory] = useState(navState.category || 'Clothing & Textiles');
  const [condition, setCondition] = useState(navState.condition || 'Good / wearable / working');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedActionIndex, setSelectedActionIndex] = useState<number>(-1); // -1 = bestNextStep, >= 0 = otherOptions

  // Request state
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<NextWorthRecommendation | null>(null);

  // Interactive completed checklist state
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setValidationError('Please select an image file (PNG, JPG, WebP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        setImagePreview(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSampleClick = (sample: typeof SAMPLE_ITEMS[0]) => {
    setItemName(sample.name);
    setCategory(sample.category);
    setCondition(sample.condition);
    setValidationError(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationError(null);
    setApiError(null);

    if (!itemName.trim()) {
      setValidationError('Please enter what the item is (e.g. Cotton T-Shirt, Glass Jar).');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/nextworth/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: itemName.trim(),
          category: category.trim(),
          condition: condition.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to generate second-life recommendation.');
      }

      setRecommendation(json.data);
      setSelectedActionIndex(-1); // Reset to primary recommendation
      setCheckedSteps({});
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Unable to connect to NextWorth.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCheckStep = (stepKey: string) => {
    setCheckedSteps((prev) => ({ ...prev, [stepKey]: !prev[stepKey] }));
  };

  // Determine currently viewed action card
  const activeAction: NextWorthActionStep | null = recommendation
    ? selectedActionIndex === -1
      ? recommendation.bestNextStep
      : recommendation.otherOptions[selectedActionIndex] || recommendation.bestNextStep
    : null;

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'donate':
        return <Heart className="w-5 h-5 text-secondary" />;
      case 'repair':
        return <Wrench className="w-5 h-5 text-tertiary" />;
      case 'resell':
        return <ShoppingBag className="w-5 h-5 text-secondary-fixed" />;
      case 'recycle':
        return <RotateCcw className="w-5 h-5 text-primary" />;
      default:
        return <Sparkles className="w-5 h-5 text-secondary" />;
    }
  };

  return (
    <div className="flex flex-col w-full relative min-h-[calc(100vh-4rem)]">
      <div className="max-w-5xl mx-auto w-full px-margin-mobile md:px-margin-desktop pt-space-md pb-space-2xl flex flex-col gap-space-md">
        
        {/* ========================================================================= */}
        {/* 1. SIMPLE HEADER                                                          */}
        {/* ========================================================================= */}
        <section className="bg-surface-container-lowest rounded-3xl p-space-md md:p-space-lg shadow-xs border border-surface-container-high/60 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-primary font-bold">
              <span className="material-symbols-outlined text-[18px]">autorenew</span>
            </span>
            <span className="text-[12px] font-semibold text-secondary uppercase tracking-wider">
              NextWorth
            </span>
          </div>

          <h1 className="font-headline-lg-mobile md:font-headline-lg text-primary font-bold tracking-tight">
            Give Items a Second Life
          </h1>

          <p className="text-[14px] text-on-surface-variant leading-relaxed">
            Discover practical ways to reuse, repair, donate, resell, or recycle household items instead of throwing them away.
          </p>

          {/* Quick sample chips */}
          <div className="mt-2 pt-2 border-t border-surface-container flex flex-wrap items-center gap-1.5">
            <span className="text-[12px] text-on-surface-variant font-medium mr-1">
              Try an example:
            </span>
            {SAMPLE_ITEMS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSampleClick(item)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                  itemName === item.name
                    ? 'bg-primary-container text-secondary-fixed font-bold'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. ITEM INPUT & SECOND-LIFE RECOMMENDATION RESULTS                        */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-start">
          
          {/* Input Form Column */}
          <div className={`${recommendation ? 'lg:col-span-5' : 'lg:col-span-6 lg:col-start-4'} w-full flex flex-col gap-space-sm transition-all`}>
            <div className="bg-surface-container-lowest rounded-3xl p-space-md md:p-space-lg shadow-xs border border-surface-container-high/60 flex flex-col gap-space-sm">
              
              <div className="flex items-center justify-between border-b border-surface-container pb-2">
                <h2 className="font-headline-sm text-[15px] text-primary font-bold">
                  {recommendation ? 'Check Another Item' : 'Enter Item Details'}
                </h2>
                {recommendation && (
                  <button
                    type="button"
                    onClick={() => setRecommendation(null)}
                    className="text-[12px] text-secondary hover:underline font-bold"
                  >
                    Reset
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-space-sm">
                
                {/* Item Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="nextworth-item-name" className="text-[13px] font-bold text-primary">
                    Item Name *
                  </label>
                  <input
                    id="nextworth-item-name"
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Cotton T-Shirt, Glass Jar, Laptop"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-[14px] placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-secondary font-medium"
                  />
                </div>

                {/* Category Select */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="nextworth-category" className="text-[13px] font-bold text-primary">
                    Item Category
                  </label>
                  <select
                    id="nextworth-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-secondary font-medium"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Condition Selector */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="nextworth-condition" className="text-[13px] font-bold text-primary">
                    Current Condition
                  </label>
                  <select
                    id="nextworth-condition"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-secondary font-medium"
                  >
                    {CONDITIONS.map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Optional Photo Attachment */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="text-[12px] font-bold text-on-surface-variant flex items-center justify-between">
                    <span>Optional Photo</span>
                    <span className="text-[11px] font-normal text-on-surface-variant">Helps verify material</span>
                  </span>

                  {imagePreview ? (
                    <div className="relative w-full h-28 rounded-xl overflow-hidden bg-surface-container border border-surface-container-high">
                      <img src={imagePreview} alt="Item Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImagePreview(null)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-surface-container-lowest/80 text-on-surface text-xs font-bold flex items-center justify-center hover:bg-surface-container-lowest"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="nextworth-file-input"
                      className="w-full py-3 px-4 rounded-xl border border-dashed border-surface-container-highest hover:border-secondary flex items-center justify-center gap-2 cursor-pointer bg-surface-container-low/50 text-[12px] text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <Upload className="w-4 h-4 text-secondary" />
                      <span>Upload an optional photo</span>
                      <input
                        id="nextworth-file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {validationError && (
                  <div className="p-2.5 rounded-xl bg-error-container/30 border border-error/30 text-error flex items-center gap-2 text-[12px]">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  id="nextworth-find-btn"
                  disabled={isLoading}
                  className="w-full py-3 px-5 rounded-full bg-primary-container hover:bg-primary active:scale-[0.99] text-secondary-fixed font-headline-sm text-[14px] font-bold transition-all flex items-center justify-center gap-2 mt-1 shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-secondary" />
                      <span>Exploring Second-Life Options...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-secondary-fixed" />
                      <span>Find Second-Life Options</span>
                    </>
                  )}
                </button>

              </form>

            </div>
          </div>

          {/* Results Column */}
          {recommendation && activeAction && (
            <div className="lg:col-span-7 w-full flex flex-col gap-space-sm animate-in fade-in duration-150">
              <div className="bg-surface-container-lowest rounded-3xl p-space-md md:p-space-lg shadow-xs border border-surface-container-high/60 flex flex-col gap-space-md">
                
                {/* Result Item Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container pb-3">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Item Analyzed
                    </span>
                    <h3 className="text-[18px] font-bold text-primary">
                      {recommendation.itemName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface font-medium">
                      {recommendation.category}
                    </span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium">
                      {recommendation.condition}
                    </span>
                  </div>
                </div>

                {/* Option Selector Pills (Best Next Step + Alternatives) */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Select an Option to View Action Steps
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Primary Option Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedActionIndex(-1)}
                      className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col gap-0.5 ${
                        selectedActionIndex === -1
                          ? 'bg-secondary/15 border-secondary text-primary ring-1 ring-secondary'
                          : 'bg-surface-container-low border-surface-container hover:bg-surface-container text-on-surface'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                          ★ Best Next Step
                        </span>
                        {selectedActionIndex === -1 && <Check className="w-3.5 h-3.5 text-secondary" />}
                      </div>
                      <span className="text-[12px] font-bold truncate">
                        {recommendation.bestNextStep.badge}
                      </span>
                    </button>

                    {/* Other Options Buttons */}
                    {recommendation.otherOptions.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedActionIndex(idx)}
                        className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col gap-0.5 ${
                          selectedActionIndex === idx
                            ? 'bg-secondary/15 border-secondary text-primary ring-1 ring-secondary'
                            : 'bg-surface-container-low border-surface-container hover:bg-surface-container text-on-surface'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                            Alternative {idx + 1}
                          </span>
                          {selectedActionIndex === idx && <Check className="w-3.5 h-3.5 text-secondary" />}
                        </div>
                        <span className="text-[12px] font-bold truncate">
                          {opt.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Action Highlight Card */}
                <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary-fixed/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getActionIcon(activeAction.actionType)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold uppercase text-secondary tracking-wider">
                        {selectedActionIndex === -1 ? 'Recommended Pathway' : 'Alternative Pathway'}
                      </span>
                      <h4 className="text-[16px] font-bold text-primary leading-snug">
                        {activeAction.title}
                      </h4>
                      <p className="text-[13px] text-on-surface-variant mt-1 leading-relaxed">
                        {activeAction.summary}
                      </p>
                    </div>
                  </div>

                  {/* Why section */}
                  <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                      Why this matters
                    </span>
                    <p className="text-[13px] text-on-surface leading-snug">
                      {activeAction.reason}
                    </p>
                  </div>

                  {/* What to do next checklist */}
                  <div className="flex flex-col gap-2 pt-1">
                    <span className="text-[12px] font-bold text-primary uppercase tracking-wider">
                      What To Do Next (Checklist)
                    </span>
                    <ul className="flex flex-col gap-2">
                      {activeAction.checklist.map((step, idx) => {
                        const stepId = `${selectedActionIndex}_${idx}`;
                        const isDone = Boolean(checkedSteps[stepId]);
                        return (
                          <li
                            key={idx}
                            onClick={() => toggleCheckStep(stepId)}
                            className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer select-none transition-colors ${
                              isDone
                                ? 'bg-secondary-fixed/30 border-secondary/40 text-on-surface line-through opacity-80'
                                : 'bg-surface-container-lowest border-surface-container-high hover:border-secondary/60 text-on-surface'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center flex-shrink-0 border transition-colors ${
                                isDone
                                  ? 'bg-secondary border-secondary text-on-secondary'
                                  : 'border-on-surface-variant/40 bg-surface'
                              }`}
                            >
                              {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-[13px] leading-snug">{step}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Track this action in LoopTrace CTA */}
                  <div className="mt-2 p-3.5 rounded-xl bg-secondary-fixed/20 border border-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1">
                        <RotateCcw className="w-3.5 h-3.5 text-secondary" />
                        <span>Ready to take this action?</span>
                      </span>
                      <span className="text-[13px] font-bold text-primary">
                        Record "{activeAction.badge}" in your LoopTrace passport
                      </span>
                    </div>

                    <button
                      type="button"
                      id="track-action-looptrace-btn"
                      onClick={() => {
                        const actionMap: Record<string, 'reused' | 'repaired' | 'donated' | 'resold' | 'recycled'> = {
                          upcycle: 'reused',
                          reuse: 'reused',
                          repair: 'repaired',
                          donate: 'donated',
                          sell: 'resold',
                          recycle: 'recycled',
                        };
                        const mappedAction = actionMap[activeAction.actionType] || 'reused';

                        navigate('/looptrace', {
                          state: {
                            fromNextWorth: true,
                            itemName: recommendation.itemName,
                            category: recommendation.category,
                            suggestedAction: mappedAction,
                            notes: `Action pathway: ${activeAction.title}`,
                          },
                        });
                      }}
                      className="py-2 px-4 rounded-full bg-primary-container text-secondary-fixed hover:bg-primary font-bold text-[12px] flex items-center justify-center gap-1.5 transition-colors shadow-xs whitespace-nowrap self-start sm:self-auto"
                    >
                      <span>Track this action</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Honest condition note & disclaimer */}
                <div className="p-3 rounded-2xl bg-surface-container-high/40 border border-surface-container-highest flex flex-col gap-1 text-[11px] text-on-surface-variant">
                  <p>
                    <strong>Condition Note:</strong> {recommendation.conditionNote}
                  </p>
                  <p className="text-[10px] text-on-surface-variant/80 border-t border-surface-container/60 pt-1">
                    {recommendation.disclaimer}
                  </p>
                </div>

                {/* Cross-navigation to EcoVerify or MatterLens */}
                <div className="flex items-center gap-2 pt-1 border-t border-surface-container">
                  <Link
                    to="/ecoverify"
                    state={{ itemName: recommendation.itemName, category: recommendation.category }}
                    className="flex-1 py-2.5 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-bold text-[12px] text-center flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Check Recycling in EcoVerify</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setRecommendation(null)}
                    className="py-2.5 px-4 rounded-full bg-primary-container text-secondary-fixed font-bold text-[12px] text-center transition-colors"
                  >
                    Done
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Network or Gateway Error */}
          {apiError && !isLoading && (
            <div className="lg:col-span-7 w-full p-4 rounded-2xl bg-error-container/40 border border-error/40 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-error font-bold text-[14px]">
                <AlertTriangle className="w-4 h-4 text-error" />
                <span>NextWorth Error</span>
              </div>
              <p className="text-[13px] text-on-surface">{apiError}</p>
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="w-fit inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-container text-on-primary text-[12px] font-bold mt-1"
              >
                <RefreshCw className="w-3.5 h-3.5 text-secondary-fixed" />
                <span>Try Again</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
