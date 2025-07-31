import React, { useState } from 'react';
import { Building2, ChevronDown, Globe } from 'lucide-react';
import { useCampus } from '../../contexts/CampusContext';
import { Select, SelectItem } from './Select';

/**
 * CampusSelector - Campus selection dropdown component
 */
const CampusSelector = ({
  compact = false,
  disabled = false,
  className = "",
  showIcon = true,
  showSearch = false,
  onCampusChange,
  ...props
}) => {
  const { 
    currentCampus, 
    availableCampuses, 
    userCampusPermissions, 
    switchCampus, 
    isLoading, 
    error 
  } = useCampus();

  const [searchTerm, setSearchTerm] = useState("");
  const [switching, setSwitching] = useState(false);

  // Filter campuses based on search term
  const filteredCampuses = availableCampuses.filter(campus =>
    campus.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campus.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCampusChange = async (campusId) => {
    if (switching || disabled || campusId === currentCampus.id) return;

    try {
      setSwitching(true);
      await switchCampus(parseInt(campusId));
      onCampusChange?.(parseInt(campusId));
    } catch (err) {
      console.error('Failed to switch campus:', err);
    } finally {
      setSwitching(false);
    }
  };

  // Don't show selector if user can't switch campuses or only has access to one
  if (!userCampusPermissions.canSwitchCampuses || availableCampuses.length <= 1) {
    return compact ? (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        {showIcon && <Building2 className="w-4 h-4" />}
        <span className="font-medium">{currentCampus.displayName}</span>
      </div>
    ) : (
      <div className={`flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
        {showIcon && <Building2 className="w-5 h-5 text-gray-500" />}
        <div>
          <div className="font-medium">{currentCampus.displayName}</div>
          <div className="text-sm text-gray-500">{currentCampus.name}</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
        <span className="text-sm text-gray-500">Loading campuses...</span>
      </div>
    );
  }

  const selectClasses = compact 
    ? "min-w-[140px]" 
    : "min-w-[200px]";

  return (
    <div className={`space-y-1 ${className}`} {...props}>
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 mb-2">
          {error}
        </div>
      )}

      <Select
        value={currentCampus.id.toString()}
        onValueChange={handleCampusChange}
        disabled={disabled || switching}
        className={selectClasses}
        placeholder={currentCampus.displayName}
      >
        {filteredCampuses.map((campus) => (
          <SelectItem
            key={campus.id}
            value={campus.id.toString()}
            disabled={switching}
          >
            {campus.displayName}
          </SelectItem>
        ))}

        {userCampusPermissions.isSuperAdmin && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
            <SelectItem value="all" disabled={switching}>
              All Campuses
            </SelectItem>
          </>
        )}
      </Select>

      {switching && (
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <div className="w-3 h-3 border border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
          Switching campus...
        </div>
      )}
    </div>
  );
};

/**
 * CampusSelectorCompact - Compact variant for headers and mobile
 */
const CampusSelectorCompact = (props) => {
  return <CampusSelector compact={true} {...props} />;
};

/**
 * CampusIndicator - Read-only campus display (no switching)
 */
const CampusIndicator = ({ 
  showThemeColor = true, 
  className = "",
  ...props 
}) => {
  const { currentCampus, isLoading } = useCampus();

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"></div>
        <div className="w-16 h-4 bg-gray-300 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`} {...props}>
      {showThemeColor && (
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: currentCampus.theme.primary }}
        />
      )}
      <span className="font-medium text-sm">{currentCampus.displayName}</span>
    </div>
  );
};

export { CampusSelector, CampusSelectorCompact, CampusIndicator };
export default CampusSelector;
