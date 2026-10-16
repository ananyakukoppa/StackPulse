import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';

interface PinContextType {
  pinnedNames: Set<string>;
  isPinned: (fullName: string) => boolean;
  togglePin: (
    repo: {
      name: string;
      fullName: string;
      htmlUrl: string;
      developerUsername: string;
      description?: string | null;
      stars?: number;
      forks?: number;
      primaryLanguage?: string | null;
    },
    note?: string,
    tags?: string[]
  ) => Promise<boolean>;
  refreshPinned: () => Promise<void>;
}

const PinContext = createContext<PinContextType | undefined>(undefined);

export const PinProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pinnedNames, setPinnedNames] = useState<Set<string>>(new Set());
  const { isAuthenticated } = useAuth();

  const refreshPinned = async () => {
    if (!isAuthenticated) {
      setPinnedNames(new Set());
      return;
    }

    try {
      const names = await apiService.getPinnedRepoNames();
      setPinnedNames(new Set(names));
    } catch {
      // Ignore if unauthenticated or network error
    }
  };

  useEffect(() => {
    refreshPinned();
  }, [isAuthenticated]);

  const isPinned = (fullName: string): boolean => {
    return pinnedNames.has(fullName);
  };

  const togglePin = async (
    repo: {
      name: string;
      fullName: string;
      htmlUrl: string;
      developerUsername: string;
      description?: string | null;
      stars?: number;
      forks?: number;
      primaryLanguage?: string | null;
    },
    note?: string,
    tags?: string[]
  ): Promise<boolean> => {
    if (!isAuthenticated) {
      throw new Error('Please sign in to pin repositories');
    }

    const res = await apiService.togglePin({ repository: repo, note, tags });
    setPinnedNames((prev) => {
      const next = new Set(prev);
      if (res.pinned) {
        next.add(repo.fullName);
      } else {
        next.delete(repo.fullName);
      }
      return next;
    });

    return res.pinned;
  };

  return (
    <PinContext.Provider
      value={{
        pinnedNames,
        isPinned,
        togglePin,
        refreshPinned,
      }}
    >
      {children}
    </PinContext.Provider>
  );
};

export const usePin = (): PinContextType => {
  const context = useContext(PinContext);
  if (!context) {
    throw new Error('usePin must be used within a PinProvider');
  }
  return context;
};

export default PinContext;
