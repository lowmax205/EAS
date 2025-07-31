import React from 'react';
import { Building2, Globe } from 'lucide-react';
import { useCampus } from '../../contexts/CampusContext';
import { CampusSelector, CampusSelectorCompact, CampusIndicator } from '../ui/CampusSelector';

/**
 * CampusFilter - Campus-aware filter component for event and user listing screens
 * Integrates with existing FilterComponent system
 */
const CampusFilter = ({
  campusFilterValue = "current",
  onCampusFilterChange,
  variant = "default", // 'default', 'compact', 'indicator-only'
  showAllCampusesOption = false,
  disabled = false,
  className = "",
  ...props
}) => {
  const { 
    currentCampus, 
    availableCampuses, 
    userCampusPermissions,
    switchCampus,
    isLoading 
  } = useCampus();

  // Filter options based on user permissions
  const getFilterOptions = () => {
    const options = [
      { value: "current", label: `Current Campus (${currentCampus.displayName})` }
    ];

    // Add individual campus options if user can access multiple campuses
    if (userCampusPermissions.canSwitchCampuses && availableCampuses.length > 1) {
      availableCampuses.forEach(campus => {
        if (campus.id !== currentCampus.id) {
          options.push({
            value: campus.id.toString(),
            label: campus.displayName
          });
        }
      });
    }

    // Add "All Campuses" option for super admins
    if (showAllCampusesOption && userCampusPermissions.isSuperAdmin) {
      options.push({ value: "all", label: "All Campuses" });
    }

    return options;
  };

  const handleFilterChange = (value) => {
    if (disabled) return;
    
    // Handle special cases
    if (value === "current") {
      onCampusFilterChange?.(currentCampus.id.toString());
    } else {
      onCampusFilterChange?.(value);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
        <span className="text-sm text-gray-500">Loading campuses...</span>
      </div>
    );
  }

  // Render different variants
  switch (variant) {
    case 'compact':
      return (
        <div className={`flex items-center gap-2 ${className}`} {...props}>
          <Building2 className="w-4 h-4 text-gray-500" />
          <CampusSelectorCompact 
            onCampusChange={handleFilterChange}
            disabled={disabled}
          />
        </div>
      );

    case 'indicator-only':
      return (
        <div className={`flex items-center gap-2 ${className}`} {...props}>
          <Building2 className="w-4 h-4 text-gray-500" />
          <CampusIndicator showThemeColor={true} />
        </div>
      );

    default:
      // Default filter dropdown for integration with FilterComponent
      const options = getFilterOptions();
      
      return (
        <div className={`space-y-2 ${className}`} {...props}>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Campus Filter
          </label>
          
          <select
            value={campusFilterValue}
            onChange={(e) => handleFilterChange(e.target.value)}
            disabled={disabled || options.length <= 1}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {options.length <= 1 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {userCampusPermissions.canSwitchCampuses 
                ? "Only one campus available" 
                : "Campus switching not available"}
            </p>
          )}
        </div>
      );
  }
};

/**
 * CampusMultiSelectFilter - Multi-select campus filter for admin users
 * Allows filtering by multiple campuses simultaneously
 */
const CampusMultiSelectFilter = ({
  selectedCampuses = [],
  onSelectionChange,
  disabled = false,
  className = "",
  ...props
}) => {
  const { 
    currentCampus, 
    availableCampuses, 
    userCampusPermissions,
    isLoading 
  } = useCampus();

  const handleCampusToggle = (campusId) => {
    if (disabled) return;

    const campusIdStr = campusId.toString();
    const isSelected = selectedCampuses.includes(campusIdStr);
    
    let newSelection;
    if (isSelected) {
      newSelection = selectedCampuses.filter(id => id !== campusIdStr);
    } else {
      newSelection = [...selectedCampuses, campusIdStr];
    }
    
    onSelectionChange?.(newSelection);
  };

  const handleSelectAll = () => {
    if (disabled) return;
    
    const allCampusIds = availableCampuses.map(campus => campus.id.toString());
    onSelectionChange?.(allCampusIds);
  };

  const handleClearAll = () => {
    if (disabled) return;
    onSelectionChange?.([]);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
        <span className="text-sm text-gray-500">Loading campuses...</span>
      </div>
    );
  }

  // Only show multi-select for users who can access multiple campuses
  if (!userCampusPermissions.canSwitchCampuses || availableCampuses.length <= 1) {
    return (
      <CampusFilter 
        variant="indicator-only" 
        className={className}
        {...props}
      />
    );
  }

  return (
    <div className={`space-y-3 ${className}`} {...props}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Campus Selection
        </label>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={handleSelectAll}
            disabled={disabled}
            className="text-xs text-primary-600 hover:text-primary-800 disabled:opacity-50"
          >
            All
          </button>
          <span className="text-xs text-gray-400">|</span>
          <button
            type="button"
            onClick={handleClearAll}
            disabled={disabled}
            className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            None
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {availableCampuses.map((campus) => {
          const isSelected = selectedCampuses.includes(campus.id.toString());
          const isCurrent = campus.id === currentCampus.id;
          
          return (
            <label
              key={campus.id}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                isSelected 
                  ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleCampusToggle(campus.id)}
                disabled={disabled}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <div className="flex items-center gap-2 flex-1">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: campus.theme.primary }}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {campus.displayName}
                    {isCurrent && (
                      <span className="ml-2 text-xs text-primary-600 dark:text-primary-400">
                        (Current)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{campus.name}</div>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        {selectedCampuses.length} of {availableCampuses.length} campuses selected
      </div>
    </div>
  );
};

/**
 * CampusFilterIndicator - Shows current campus filtering status
 * Used in headers and filter summaries
 */
const CampusFilterIndicator = ({
  activeFilter = "current",
  showClearButton = true,
  onClear,
  className = "",
  ...props
}) => {
  const { currentCampus, availableCampuses, userCampusPermissions } = useCampus();

  const getFilterLabel = () => {
    if (activeFilter === "all") return "All Campuses";
    if (activeFilter === "current") return currentCampus.displayName;
    
    const campus = availableCampuses.find(c => c.id.toString() === activeFilter);
    return campus ? campus.displayName : "Unknown Campus";
  };

  const getFilterIcon = () => {
    if (activeFilter === "all") return <Globe className="w-3 h-3" />;
    return <Building2 className="w-3 h-3" />;
  };

  // Don't show indicator for single campus users with current campus
  if (!userCampusPermissions.canSwitchCampuses && activeFilter === "current") {
    return null;
  }

  return (
    <div className={`inline-flex items-center gap-2 px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-md text-sm ${className}`} {...props}>
      {getFilterIcon()}
      <span>{getFilterLabel()}</span>
      {showClearButton && onClear && activeFilter !== "current" && (
        <button
          onClick={onClear}
          className="text-primary-500 hover:text-primary-700 ml-1"
        >
          ×
        </button>
      )}
    </div>
  );
};

export { CampusFilter, CampusMultiSelectFilter, CampusFilterIndicator };
export default CampusFilter;
