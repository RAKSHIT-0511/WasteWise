import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  preferredCountry: string;
  preferredPincode?: string;
  preferredCity: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, displayName?: string, location?: { country?: string; pincode?: string; city?: string }) => Promise<void>;
  signOut: () => void;
  updateProfile: (updates: Partial<Omit<UserProfile, 'id' | 'email' | 'createdAt'>>) => Promise<void>;
}

const STORAGE_KEY = 'wastewise_active_user';
const USERS_DB_KEY = 'wastewise_users_db';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load existing session on initial mount
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem(STORAGE_KEY);
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        if (parsed && parsed.email) {
          setUser(parsed);
        }
      }
    } catch {
      // Ignore JSON parse errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = async (
    email: string,
    displayName?: string,
    location?: { country?: string; pincode?: string; city?: string }
  ) => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 250)); // Realistic micro-delay

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = displayName?.trim() || cleanEmail.split('@')[0] || 'Eco User';

    // Retrieve or initialize users map in local database storage
    let usersDb: Record<string, UserProfile> = {};
    try {
      const dbStr = localStorage.getItem(USERS_DB_KEY);
      if (dbStr) usersDb = JSON.parse(dbStr);
    } catch {
      usersDb = {};
    }

    let existingProfile = usersDb[cleanEmail];

    if (!existingProfile) {
      existingProfile = {
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        email: cleanEmail,
        displayName: cleanName,
        preferredCountry: location?.country || 'India',
        preferredPincode: location?.pincode || '',
        preferredCity: location?.city || '',
        avatarUrl: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${cleanEmail}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else if (displayName || location) {
      existingProfile = {
        ...existingProfile,
        displayName: cleanName || existingProfile.displayName,
        preferredCountry: location?.country || existingProfile.preferredCountry,
        preferredPincode: location?.pincode !== undefined ? location.pincode : existingProfile.preferredPincode,
        preferredCity: location?.city || existingProfile.preferredCity,
        updatedAt: new Date().toISOString(),
      };
    }

    usersDb[cleanEmail] = existingProfile;
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(usersDb));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingProfile));

    setUser(existingProfile);
    setIsLoading(false);
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<Omit<UserProfile, 'id' | 'email' | 'createdAt'>>) => {
    if (!user) throw new Error('No user is currently signed in.');

    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 250));

    const updatedUser: UserProfile = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Update DB
    try {
      const dbStr = localStorage.getItem(USERS_DB_KEY);
      const usersDb = dbStr ? JSON.parse(dbStr) : {};
      usersDb[user.email] = updatedUser;
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(usersDb));
    } catch {
      // Fallback
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
