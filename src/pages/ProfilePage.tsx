import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, CheckCircle, AlertCircle, RefreshCw, LogOut, LogIn, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, isLoading, signIn, signOut, updateProfile } = useAuth();

  // Sign-in form state
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authCity, setAuthCity] = useState('');
  const [authCountry, setAuthCountry] = useState('India');
  const [authPincode, setAuthPincode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Edit profile form state
  const [displayName, setDisplayName] = useState('');
  const [preferredCountry, setPreferredCountry] = useState('India');
  const [preferredPincode, setPreferredPincode] = useState('');
  const [preferredCity, setPreferredCity] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Populate edit fields when signed-in user changes
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPreferredCountry(user.preferredCountry || 'India');
      setPreferredPincode(user.preferredPincode || '');
      setPreferredCity(user.preferredCity || '');
    }
  }, [user]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!authEmail.trim() || !authEmail.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    try {
      await signIn(authEmail, authName, {
        country: authCountry,
        city: authCity,
        pincode: authPincode,
      });
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Unable to sign in.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError(null);

    if (!displayName.trim()) {
      setSaveError('Display name cannot be empty.');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        preferredCountry: preferredCountry.trim(),
        preferredPincode: preferredPincode.trim(),
        preferredCity: preferredCity.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-full relative min-h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto w-full px-margin-mobile md:px-margin-desktop pt-space-md pb-space-2xl flex flex-col gap-space-md">
        
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-on-surface-variant hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* SIGNED-IN PROFILE VIEW & EDIT                                             */}
        {/* ========================================================================= */}
        {user ? (
          <div className="bg-surface-container-lowest rounded-3xl p-space-md md:p-space-lg shadow-xs border border-surface-container-high/60 flex flex-col gap-space-md">
            
            {/* User Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-container pb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-primary font-bold text-xl ring-2 ring-surface overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-7 h-7 text-primary" />
                  )}
                </div>
                <div className="flex flex-col">
                  <h1 className="font-headline-lg-mobile md:font-headline-sm text-primary font-bold leading-tight">
                    {user.displayName}
                  </h1>
                  <span className="text-[13px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{user.email}</span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container hover:bg-error-container/40 text-on-surface-variant hover:text-error text-[12px] font-bold transition-colors w-fit"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Profile Edit Form */}
            <form onSubmit={handleUpdate} className="flex flex-col gap-space-sm pt-1">
              <h2 className="font-headline-sm text-[16px] text-primary font-bold">
                Edit Preferences
              </h2>

              {/* Display Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="display-name" className="text-[13px] font-bold text-primary">
                  Display Name
                </label>
                <input
                  id="display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="Your Name"
                />
              </div>

              {/* Email (Readonly) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email-readonly" className="text-[13px] font-bold text-primary">
                  Email Address
                </label>
                <input
                  id="email-readonly"
                  type="email"
                  value={user.email}
                  readOnly
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container text-on-surface-variant/80 text-[14px] border border-surface-container cursor-not-allowed"
                />
              </div>

              {/* Location Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="pref-country" className="text-[13px] font-bold text-primary">
                    Preferred Country
                  </label>
                  <select
                    id="pref-country"
                    value={preferredCountry}
                    onChange={(e) => setPreferredCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="pref-pincode" className="text-[13px] font-bold text-primary">
                    PIN / Postal Code
                  </label>
                  <input
                    id="pref-pincode"
                    type="text"
                    maxLength={10}
                    value={preferredPincode}
                    onChange={(e) => setPreferredPincode(e.target.value)}
                    placeholder="e.g. 560034"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="pref-city" className="text-[13px] font-bold text-primary">
                    Preferred City / Town
                  </label>
                  <input
                    id="pref-city"
                    type="text"
                    value={preferredCity}
                    onChange={(e) => setPreferredCity(e.target.value)}
                    placeholder="e.g. Bengaluru, Seattle"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
              </div>

              {/* Status alerts */}
              {saveSuccess && (
                <div className="p-3 rounded-xl bg-secondary-fixed/40 border border-secondary text-primary flex items-center gap-2 text-[13px] font-medium">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Profile updated and saved successfully!</span>
                </div>
              )}

              {saveError && (
                <div className="p-3 rounded-xl bg-error-container/40 border border-error text-error flex items-center gap-2 text-[13px] font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {/* Save Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 px-5 rounded-full bg-primary-container hover:bg-primary active:scale-[0.99] text-secondary-fixed font-headline-sm text-[14px] font-bold transition-all flex items-center justify-center gap-2 mt-2 shadow-sm"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-secondary" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save Profile Preferences</span>
                )}
              </button>
            </form>

          </div>
        ) : (
          /* ========================================================================= */
          /* NOT SIGNED IN: CLEAN SIGN-IN FORM                                         */
          /* ========================================================================= */
          <div className="bg-surface-container-lowest rounded-3xl p-space-md md:p-space-lg shadow-xs border border-surface-container-high/60 flex flex-col gap-space-md">
            <div className="flex flex-col gap-1">
              <div className="w-12 h-12 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-primary mb-1">
                <User className="w-6 h-6 text-primary" />
              </div>
              <h1 className="font-headline-lg-mobile md:font-headline-sm text-primary font-bold">
                Sign In to WasteWise
              </h1>
              <p className="text-[14px] text-on-surface-variant">
                Save your preferred city, postal PIN code, and track your sustainable habits across devices.
              </p>
            </div>

            <form onSubmit={handleSignIn} className="flex flex-col gap-space-sm pt-1">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sign-in-email" className="text-[13px] font-bold text-primary">
                  Email Address *
                </label>
                <input
                  id="sign-in-email"
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="sign-in-name" className="text-[13px] font-bold text-primary">
                  Your Name (Optional)
                </label>
                <input
                  id="sign-in-name"
                  type="text"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="sign-in-country" className="text-[13px] font-bold text-primary">
                    Country
                  </label>
                  <select
                    id="sign-in-country"
                    value={authCountry}
                    onChange={(e) => setAuthCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="sign-in-pin" className="text-[13px] font-bold text-primary">
                    PIN Code
                  </label>
                  <input
                    id="sign-in-pin"
                    type="text"
                    maxLength={10}
                    value={authPincode}
                    onChange={(e) => setAuthPincode(e.target.value)}
                    placeholder="e.g. 560034"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="sign-in-city" className="text-[13px] font-bold text-primary">
                    City / Town
                  </label>
                  <input
                    id="sign-in-city"
                    type="text"
                    value={authCity}
                    onChange={(e) => setAuthCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-error-container/40 border border-error text-error flex items-center gap-2 text-[13px]">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-5 rounded-full bg-primary-container hover:bg-primary active:scale-[0.99] text-secondary-fixed font-headline-sm text-[14px] font-bold transition-all flex items-center justify-center gap-2 mt-2 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-secondary" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-secondary-fixed" />
                    <span>Sign In or Register</span>
                  </>
                )}
              </button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
};
