import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../features/auth/AuthContext';

/**
 * Default Campus Configurations
 */
const CAMPUS_CONFIGURATIONS = {
  snsu: {
    id: 1,
    name: 'SNSU',
    displayName: 'Surigao del Norte State University',
    slug: 'snsu',
    theme: {
      primary: '#22c55e',
      secondary: '#166534',
      accent: '#dcfce7'
    },
    features: {
      multiCampusMode: false,
      campusSwitching: true,
      customBranding: true
    }
  },
  usc: {
    id: 2,
    name: 'USC',
    displayName: 'University of Southern California',
    slug: 'usc',
    theme: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#dbeafe'
    },
    features: {
      multiCampusMode: true,
      campusSwitching: true,
      customBranding: true
    }
  },
  stanford: {
    id: 3,
    name: 'Stanford',
    displayName: 'Stanford University',
    slug: 'stanford',
    theme: {
      primary: '#dc2626',
      secondary: '#991b1b',
      accent: '#fecaca'
    },
    features: {
      multiCampusMode: true,
      campusSwitching: true,
      customBranding: true
    }
  }
};

const CampusContext = createContext(undefined);

/**
 * CampusProvider - Manages campus context and switching functionality
 */
export const CampusProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentCampus, setCurrentCampus] = useState(CAMPUS_CONFIGURATIONS.snsu);
  const [availableCampuses, setAvailableCampuses] = useState([]);
  const [userCampusPermissions, setUserCampusPermissions] = useState({
    canAccessMultipleCampuses: false,
    canSwitchCampuses: false,
    isSuperAdmin: false,
    isCampusAdmin: false,
    accessibleCampusIds: [1]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize campus context based on user
  useEffect(() => {
    if (user) {
      initializeCampusContext();
    }
  }, [user]);

  const initializeCampusContext = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // For now, simulate API call with mock data
      // In real implementation, this would fetch from backend
      const mockUserCampusData = getUserCampusData(user);
      
      setUserCampusPermissions(mockUserCampusData.permissions);
      setAvailableCampuses(mockUserCampusData.availableCampuses);
      
      // Set current campus from user data or default to SNSU
      const userCampusId = user?.campusId || 1;
      const userCampus = CAMPUS_CONFIGURATIONS[
        Object.keys(CAMPUS_CONFIGURATIONS).find(key => 
          CAMPUS_CONFIGURATIONS[key].id === userCampusId
        ) || 'snsu'
      ];
      
      setCurrentCampus(userCampus);
      
      // Apply campus theme
      applyCampusTheme(userCampus);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize campus context');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserCampusData = (user) => {
    // Mock user campus permissions - in real implementation, this comes from backend
    const isSuperAdmin = user?.role === 'super_admin';
    const isCampusAdmin = user?.role === 'campus_admin';
    
    return {
      permissions: {
        canAccessMultipleCampuses: isSuperAdmin,
        canSwitchCampuses: isSuperAdmin || isCampusAdmin,
        isSuperAdmin,
        isCampusAdmin,
        accessibleCampusIds: isSuperAdmin 
          ? [1, 2, 3] 
          : [user?.campusId || 1]
      },
      availableCampuses: isSuperAdmin 
        ? Object.values(CAMPUS_CONFIGURATIONS)
        : [CAMPUS_CONFIGURATIONS.snsu] // Default to SNSU for regular users
    };
  };

  const switchCampus = async (campusId) => {
    try {
      setError(null);
      
      // Validate permission to switch to this campus
      if (!userCampusPermissions.accessibleCampusIds.includes(campusId)) {
        throw new Error('Insufficient permissions to access this campus');
      }

      const targetCampus = getCampusById(campusId);
      if (!targetCampus) {
        throw new Error('Campus not found');
      }

      // Simulate API call for campus switching
      // In real implementation, this would update user session
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentCampus(targetCampus);
      applyCampusTheme(targetCampus);
      
      // Store campus preference in localStorage
      localStorage.setItem('selectedCampusId', campusId.toString());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch campus');
      throw err;
    }
  };

  const getCampusById = (id) => {
    return availableCampuses.find(campus => campus.id === id) || null;
  };

  const applyCampusTheme = (campus) => {
    // Update CSS variables for campus theming
    const root = document.documentElement;
    root.style.setProperty('--campus-primary', campus.theme.primary);
    root.style.setProperty('--campus-secondary', campus.theme.secondary);
    root.style.setProperty('--campus-accent', campus.theme.accent);
    
    // Set data attribute for CSS selectors
    document.documentElement.setAttribute('data-campus', campus.slug);
  };

  const contextValue = {
    currentCampus,
    availableCampuses,
    userCampusPermissions,
    switchCampus,
    getCampusById,
    isLoading,
    error
  };

  return (
    <CampusContext.Provider value={contextValue}>
      {children}
    </CampusContext.Provider>
  );
};

/**
 * useCampus - Hook for accessing campus context
 */
export const useCampus = () => {
  const context = useContext(CampusContext);
  if (context === undefined) {
    throw new Error('useCampus must be used within a CampusProvider');
  }
  return context;
};

export default CampusProvider;
