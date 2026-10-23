import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  HelpCircle,
  ExternalLink,
  MapPin,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  Check,
  Search
} from 'lucide-react';
import type { EcoVerifyInput, EcoVerifyEvidence } from '@/types';

// Pre-tested authoritative & supported locations
const TESTED_LOCATIONS = [
  { label: 'Bengaluru (BBMP)', value: 'Bengaluru, Karnataka', country: 'India', pincode: '560001' },
  { label: 'Mumbai (BMC)', value: 'Mumbai, Maharashtra', country: 'India', pincode: '400001' },
  { label: 'Delhi (MCD)', value: 'Delhi (NCR)', country: 'India', pincode: '110001' },
  { label: 'Ranchi (RMC)', value: 'Ranchi, Jharkhand', country: 'India', pincode: '834001' },
  { label: 'Seattle (SPU)', value: 'Seattle, WA (98105)', country: 'United States' },
  { label: 'San Francisco (Recology)', value: 'San Francisco, CA (94107)', country: 'United States' },
  { label: 'New York City (DSNY)', value: 'Manhattan, NYC (10001)', country: 'United States' },
  { label: 'Austin (ARR)', value: 'Austin, TX (78705)', country: 'United States' },
  { label: 'Stanford (Campus)', value: 'Stanford University (94305)', country: 'United States' },
  { label: 'Toronto (Waste Wizard)', value: 'Toronto, Ontario (M5V)', country: 'Canada' },
  { label: 'London (Westminster)', value: 'London SW1 (Westminster)', country: 'United Kingdom' },
];

const QUICK_MATERIALS = [
  'PET Plastic #1',
  'Cardboard Box',
  'Aluminum Can',
  'Glass Bottle',
  'Alkaline / Lithium Battery',
  'Plastic Film / Bag',
  'Black Takeout Plastic',
];

interface NavigationState {
  itemName?: string;
  materialType?: string;
  category?: string;
  visibleContamination?: string;
  preparationAdvice?: string;
  reasoning?: string;
  fromMatterLens?: boolean;
}

export const EcoVerifyPage: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const navState = (location.state as NavigationState) || {};

  // Form State — defaults to user preference or India
  const [country, setCountry] = useState<string>(user?.preferredCountry || 'India');
  const [locInput, setLocInput] = useState<string>(user?.preferredCity || '');
  const [pincode, setPincode] = useState<string>(user?.preferredPincode || '');
  const [isFindingPin, setIsFindingPin] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [resolvedOffices, setResolvedOffices] = useState<string[]>([]);
  const [selectedLocality, setSelectedLocality] = useState<string>('');
  const [resolvedDistrict, setResolvedDistrict] = useState<string>('');
  const [resolvedState, setResolvedState] = useState<string>('');
  const [isPinConfirmed, setIsPinConfirmed] = useState<boolean>(Boolean(user?.preferredCity && user?.preferredPincode));
  const [isManualLocationMode, setIsManualLocationMode] = useState<boolean>(false);

  const [itemName, setItemName] = useState<string>(navState.itemName || '');
  const [materialType, setMaterialType] = useState<string>(navState.materialType || '');
  const [condition, setCondition] = useState<string>(
    navState.visibleContamination && navState.visibleContamination.toLowerCase().includes('clean')
      ? 'Clean & empty'
      : navState.visibleContamination
      ? 'Has food/liquid residue'
      : 'Clean & empty'
  );
  const [details] = useState<string>(
    navState.preparationAdvice ? `Prep Note: ${navState.preparationAdvice}` : ''
  );

  // Flow State
  const [isPrefilled, setIsPrefilled] = useState<boolean>(Boolean(navState.fromMatterLens || navState.itemName));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<EcoVerifyEvidence | null>(null);

  const dismissPrefilledNotice = () => setIsPrefilled(false);

  const handleFindPinLocation = async () => {
    setPinError(null);
    const cleanPin = pincode.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      setPinError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setIsFindingPin(true);
    try {
      const res = await fetch(`/api/pincode/lookup?pincode=${cleanPin}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'PIN code lookup failed.');
      }
      setResolvedDistrict(data.district || '');
      setResolvedState(data.state || '');
      const locs: string[] = data.localities || [];
      setResolvedOffices(locs);
      setSelectedLocality(locs[0] || data.district || '');
      setIsPinConfirmed(false);
    } catch (err) {
      setPinError(err instanceof Error ? err.message : 'Unable to find location for this PIN code.');
    } finally {
      setIsFindingPin(false);
    }
  };

  const handleConfirmLocation = () => {
    const fullLoc = `${selectedLocality || resolvedDistrict}, ${resolvedDistrict}, ${resolvedState}`;
    setLocInput(fullLoc);
    setIsPinConfirmed(true);
    setValidationError(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationError(null);
    setNetworkError(null);

    if (!locInput.trim()) {
      setValidationError('Please enter your city, municipality, or campus.');
      return;
    }
    if (!itemName.trim()) {
      setValidationError('Please enter what the item is (e.g. Water Bottle).');
      return;
    }
    if (!materialType.trim()) {
      setValidationError('Please specify the material (e.g. PET Plastic).');
      return;
    }

    setIsLoading(true);

    try {
      const payload: EcoVerifyInput = {
        country: country.trim(),
        location: locInput.trim(),
        itemName: itemName.trim(),
        materialType: materialType.trim(),
        condition: condition.trim(),
        details: details.trim(),
      };

      const response = await fetch('/api/ecoverify/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || `Verification failed (HTTP ${response.status})`);
      }

      setVerificationResult(json.data);
    } catch (err) {
      setNetworkError(err instanceof Error ? err.message : 'Unable to check recycling rules right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setVerificationResult(null);
    setNetworkError(null);
    setValidationError(null);
  };

  const selectQuickLocation = (loc: (typeof TESTED_LOCATIONS)[0]) => {
    setLocInput(loc.value);
    setCountry(loc.country);
    if (loc.pincode) {
      setPincode(loc.pincode);
      setIsPinConfirmed(true);
      setResolvedDistrict(loc.value.split(',')[0] || '');
      setResolvedState(loc.value.split(',')[1] || '');
    } else {
      setIsManualLocationMode(true);
    }
  };

  return (
    <div className="flex flex-col w-full relative">
      <div className="max-w-5xl mx-auto w-full px-margin-mobile md:px-margin-desktop pt-space-md pb-space-2xl flex flex-col gap-space-md">
        
        {/* ========================================================================= */}
        {/* 1. SIMPLE, INTUITIVE HEADER                                               */}
        {/* ========================================================================= */}
        <section className="bg-surface-container-lowest rounded-3xl p-space-md md:p-space-lg shadow-xs border border-surface-container-high/60 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-primary font-bold">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </span>
            <span className="text-[12px] font-semibold text-secondary uppercase tracking-wider">
              EcoVerify
            </span>
          </div>

          <h1 className="font-headline-lg-mobile md:font-headline-lg text-primary font-bold tracking-tight">
            Check Recycling Rules
          </h1>

          <p className="text-[14px] text-on-surface-variant leading-relaxed">
            Find out if this item can be recycled in your area.
          </p>

          {/* Prefilled from MatterLens Banner */}
          {isPrefilled && (
            <div className="mt-2 p-3 rounded-2xl bg-secondary-fixed/30 border border-secondary/30 flex items-center justify-between gap-2 text-[13px]">
              <div className="flex items-center gap-2 truncate">
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="truncate">
                  Loaded from scan: <strong>{itemName}</strong> ({materialType}). Choose your location below.
                </span>
              </div>
              <button
                type="button"
                onClick={dismissPrefilledNotice}
                className="text-on-surface-variant hover:text-on-surface font-bold px-2 py-0.5 rounded"
                aria-label="Dismiss notice"
              >
                ✕
              </button>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 2. FORM & RESULT (CLEAN 2-COLUMN OR STACKED LAYOUT)                       */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-start">
          
          {/* Form Column */}
          <div className={`${verificationResult ? 'lg:col-span-5' : 'lg:col-span-6 lg:col-start-4'} w-full flex flex-col gap-space-sm transition-all`}>
            <div className="bg-surface-container-lowest rounded-3xl p-space-md md:p-space-lg shadow-xs border border-surface-container-high/60 flex flex-col gap-space-sm">
              
              <div className="flex items-center justify-between border-b border-surface-container pb-2">
                <h2 className="font-headline-sm text-[15px] text-primary font-bold">
                  {verificationResult ? 'Search Again' : 'Enter Item & Location'}
                </h2>
                {verificationResult && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[12px] text-secondary hover:underline font-bold"
                  >
                    Edit details
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-space-sm">
                
                {/* Location Selection with Indian PIN Code support */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="country-select" className="text-[13px] font-bold text-primary flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-secondary" />
                      <span>Your Location</span>
                    </label>
                    {country === 'India' && (
                      <button
                        type="button"
                        onClick={() => setIsManualLocationMode(!isManualLocationMode)}
                        className="text-[11px] text-secondary hover:underline font-medium"
                      >
                        {isManualLocationMode ? 'Use PIN Code' : 'Or enter city manually'}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select
                      id="country-select"
                      aria-label="Country"
                      value={country}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCountry(val);
                        if (val !== 'India') {
                          setIsManualLocationMode(true);
                        } else {
                          setIsManualLocationMode(false);
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-secondary font-medium"
                    >
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Other">Other Country</option>
                    </select>

                    {/* If India and not manual mode: 6-digit PIN code + Find Location */}
                    {country === 'India' && !isManualLocationMode ? (
                      <div className="sm:col-span-2 flex gap-1.5">
                        <input
                          type="text"
                          id="pincode-input"
                          aria-label="6-digit Indian PIN Code"
                          placeholder="Enter 6-digit PIN"
                          value={pincode}
                          maxLength={6}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setPincode(val);
                            setIsPinConfirmed(false);
                            setPinError(null);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-[13px] placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-secondary font-mono"
                        />
                        <button
                          type="button"
                          id="find-location-btn"
                          onClick={handleFindPinLocation}
                          disabled={isFindingPin || pincode.length !== 6}
                          className="px-3 py-2 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary font-bold text-[12px] flex items-center gap-1 transition-colors disabled:opacity-50 flex-shrink-0"
                        >
                          {isFindingPin ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Search className="w-3.5 h-3.5" />
                          )}
                          <span>Find Location</span>
                        </button>
                      </div>
                    ) : (
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          id="location-input"
                          aria-label="City or Municipality"
                          placeholder="Enter city or municipality"
                          value={locInput}
                          onChange={(e) => setLocInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-[13px] placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-secondary"
                        />
                      </div>
                    )}
                  </div>

                  {/* PIN Error Message */}
                  {pinError && (
                    <div className="text-[12px] text-error font-medium flex items-center gap-1 bg-error-container/20 px-2.5 py-1.5 rounded-lg border border-error/30">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{pinError}</span>
                    </div>
                  )}

                  {/* PIN Results / Resolution Box */}
                  {country === 'India' && !isManualLocationMode && resolvedOffices.length > 0 && !isPinConfirmed && (
                    <div className="p-3 bg-secondary-fixed/20 border border-secondary/30 rounded-xl flex flex-col gap-2">
                      <div className="text-[12px] font-bold text-primary flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-secondary" />
                        <span>Resolved Location for PIN {pincode}:</span>
                      </div>

                      {resolvedOffices.length > 1 ? (
                        <div className="flex flex-col gap-1">
                          <label htmlFor="locality-select" className="text-[11px] text-on-surface-variant">
                            Multiple localities match. Choose yours:
                          </label>
                          <select
                            id="locality-select"
                            value={selectedLocality}
                            onChange={(e) => setSelectedLocality(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container-high text-[12px] text-on-surface font-medium focus:ring-2 focus:ring-secondary"
                          >
                            {resolvedOffices.map((office) => (
                              <option key={office} value={office}>
                                {office}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <p className="text-[12px] text-on-surface font-medium">
                          {selectedLocality || resolvedOffices[0]}
                        </p>
                      )}

                      <div className="text-[11px] text-on-surface-variant">
                        District: <strong className="text-on-surface">{resolvedDistrict}</strong> | State: <strong className="text-on-surface">{resolvedState}</strong>
                      </div>

                      <button
                        type="button"
                        id="confirm-location-btn"
                        onClick={handleConfirmLocation}
                        className="self-start px-3 py-1.5 rounded-lg bg-primary text-on-primary font-bold text-[12px] hover:bg-primary/90 flex items-center gap-1.5 transition-colors mt-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm Location & Continue</span>
                      </button>
                    </div>
                  )}

                  {/* Confirmed Location Badge */}
                  {country === 'India' && !isManualLocationMode && isPinConfirmed && locInput && (
                    <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between gap-2 text-[12px]">
                      <div className="flex items-center gap-2 truncate">
                        <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0" />
                        <span className="truncate">
                          Confirmed: <strong className="text-primary">{locInput}</strong> {pincode ? `(PIN: ${pincode})` : ''}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsPinConfirmed(false)}
                        className="text-[11px] text-secondary font-bold hover:underline flex-shrink-0"
                      >
                        Change
                      </button>
                    </div>
                  )}

                  {/* Quick Locations */}
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {TESTED_LOCATIONS.map((loc) => (
                      <button
                        key={loc.label}
                        type="button"
                        onClick={() => selectQuickLocation(loc)}
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                          locInput === loc.value
                            ? 'bg-primary-container text-secondary-fixed font-bold'
                            : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface border border-surface-container-high/60'
                        }`}
                      >
                        {loc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Item & Material Inputs */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="item-name-input" className="text-[13px] font-bold text-primary">
                    Item Name
                  </label>
                  <input
                    type="text"
                    id="item-name-input"
                    placeholder="e.g. Water Bottle, Pizza Box, Cereal Box"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-[13px] placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="material-type-input" className="text-[13px] font-bold text-primary">
                    Material
                  </label>
                  <input
                    type="text"
                    id="material-type-input"
                    placeholder="e.g. PET Plastic, Aluminum, Cardboard"
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-[13px] placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-secondary"
                  />

                  {/* Quick Material Presets */}
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {QUICK_MATERIALS.map((mat) => (
                      <button
                        key={mat}
                        type="button"
                        onClick={() => setMaterialType(mat)}
                        className={`px-2 py-0.5 rounded-md text-[11px] transition-colors ${
                          materialType === mat
                            ? 'bg-secondary text-on-secondary font-bold'
                            : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface border border-surface-container-high/60'
                        }`}
                      >
                        {mat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Condition Selector */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="condition-select" className="text-[13px] font-bold text-primary">
                    Item Condition
                  </label>
                  <select
                    id="condition-select"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    <option value="Clean & empty">Clean &amp; empty</option>
                    <option value="Heavily soiled with grease / food">Has food grease or sauce</option>
                    <option value="Contains battery / electronic cell">Contains battery or electronics</option>
                    <option value="Unrinsed with residual liquid">Contains leftover liquid</option>
                    <option value="Crushed / Broken / Shredded">Broken or crushed</option>
                  </select>
                </div>

                {/* Validation Alert */}
                {validationError && (
                  <div className="p-2.5 rounded-xl bg-error-container/30 border border-error/30 text-error flex items-center gap-2 text-[12px]">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Prominent Check Item Button */}
                <button
                  type="submit"
                  id="verify-rules-btn"
                  disabled={isLoading}
                  className={`w-full py-3 px-5 rounded-full font-headline-sm text-[14px] font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                    isLoading
                      ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'
                      : 'bg-primary-container hover:bg-primary active:scale-[0.99] text-secondary-fixed'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-secondary" />
                      <span>Checking Rules...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-secondary-fixed" />
                      <span>Check Item</span>
                    </>
                  )}
                </button>

              </form>

            </div>
          </div>

          {/* Result Column */}
          {verificationResult && (
            <div className="lg:col-span-7 w-full flex flex-col gap-space-sm animate-in fade-in duration-150">
              <div className="bg-surface-container-lowest rounded-3xl p-space-md md:p-space-lg shadow-xs border border-surface-container-high/60 flex flex-col gap-space-md">
                
                {/* 1. Clear Status Label & Simple Icon */}
                <div className="flex items-start justify-between gap-3 border-b border-surface-container pb-4">
                  <div className="flex items-start gap-3">
                    {verificationResult.status === 'ACCEPTED' && (
                      <CheckCircle className="w-9 h-9 text-secondary flex-shrink-0 mt-0.5" />
                    )}
                    {verificationResult.status === 'REJECTED' && (
                      <XCircle className="w-9 h-9 text-error flex-shrink-0 mt-0.5" />
                    )}
                    {verificationResult.status === 'UNVERIFIED' && (
                      <HelpCircle className="w-9 h-9 text-on-surface-variant flex-shrink-0 mt-0.5" />
                    )}

                    <div className="flex flex-col">
                      <span
                        id="result-status-badge"
                        className={`text-[22px] font-bold leading-tight ${
                          verificationResult.status === 'ACCEPTED'
                            ? 'text-secondary'
                            : verificationResult.status === 'REJECTED'
                            ? 'text-error'
                            : 'text-on-surface'
                        }`}
                      >
                        {verificationResult.status === 'ACCEPTED'
                          ? 'Accepted'
                          : verificationResult.status === 'REJECTED'
                          ? 'Not Accepted'
                          : 'Not Verified'}
                      </span>
                      <p className="text-[14px] text-on-surface-variant font-medium mt-0.5">
                        {verificationResult.status === 'ACCEPTED' && 'You can recycle this here.'}
                        {verificationResult.status === 'REJECTED' && 'Do not put this in your recycling bin.'}
                        {verificationResult.status === 'UNVERIFIED' && "We couldn't confirm the local rule yet."}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-medium text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full whitespace-nowrap">
                    {verificationResult.authority}
                  </span>
                </div>

                {/* 2. What to do with the item */}
                <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-surface-container-low border border-surface-container">
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    What to do with this item
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-secondary">
                      {verificationResult.status === 'ACCEPTED' ? 'recycling' : 'delete'}
                    </span>
                    <span className="text-[15px] font-bold text-primary">
                      {verificationResult.binRecommendation?.name || verificationResult.headline}
                    </span>
                  </div>
                </div>

                {/* 3. Preparation instructions */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Preparation Instructions
                  </span>
                  <p className="text-[13px] text-on-surface leading-relaxed">
                    {verificationResult.instructions}
                  </p>
                </div>

                {/* 4. One reliable local authority source link */}
                <div className="p-3 rounded-2xl bg-primary-container text-on-primary flex items-center justify-between gap-3 text-[12px]">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-secondary-fixed uppercase font-bold tracking-wider">
                      Official Source
                    </span>
                    <span className="font-bold text-[13px] text-on-primary">
                      {verificationResult.portalName}
                    </span>
                  </div>
                  <a
                    href={verificationResult.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-fixed text-primary font-bold hover:bg-secondary transition-colors whitespace-nowrap"
                  >
                    <span>Check Source</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* 5. Collapsible More details section */}
                <details className="rounded-2xl bg-surface-container-low border border-surface-container p-3 text-[12px] group">
                  <summary className="font-bold text-primary cursor-pointer select-none flex items-center justify-between">
                    <span>More details</span>
                    <ChevronDown className="w-4 h-4 text-on-surface-variant group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="pt-2 text-on-surface leading-relaxed flex flex-col gap-2 border-t border-surface-container/60 mt-2">
                    <p>{verificationResult.explanation}</p>

                    {verificationResult.conditions.length > 0 && (
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-primary">Conditions:</span>
                        <ul className="list-disc pl-4 space-y-0.5 text-on-surface-variant">
                          {verificationResult.conditions.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {verificationResult.citationQuote && (
                      <p className="italic text-on-surface-variant border-l-2 border-secondary pl-2 my-1">
                        "{verificationResult.citationQuote}"
                      </p>
                    )}

                    {verificationResult.checkDate && (
                      <p className="text-[11px] text-on-surface-variant">
                        Verified on: {verificationResult.checkDate}
                      </p>
                    )}
                  </div>
                </details>

                {/* Bottom navigation action */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 py-2.5 rounded-full bg-surface-container hover:bg-surface-container-high text-primary text-[12px] font-bold text-center transition-colors"
                  >
                    Check Another Item
                  </button>
                  <Link
                    to="/matterlens"
                    className="flex-1 py-2.5 rounded-full bg-primary-container text-secondary-fixed text-[12px] font-bold text-center flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Scan with Camera</span>
                    <ArrowRight className="w-3.5 h-3.5 text-secondary-fixed" />
                  </Link>
                </div>

              </div>
            </div>
          )}

          {/* Network or Error Banner */}
          {networkError && !isLoading && (
            <div className="lg:col-span-7 w-full p-4 rounded-2xl bg-error-container/40 border border-error/40 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-error font-bold text-[14px]">
                <AlertTriangle className="w-4 h-4 text-error" />
                <span>Unable to Verify</span>
              </div>
              <p className="text-[13px] text-on-surface">{networkError}</p>
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
