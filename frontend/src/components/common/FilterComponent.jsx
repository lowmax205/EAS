import React, { useState, useRef, useEffect } from "react";
import { Search, Filter, ChevronDown, X } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { logUserInteraction } from "./devLogger";

const FilterComponent = ({
  searchTerm,
  setSearchTerm,
  searchPlaceholder = "Search...",
  filters = [],
  onFilterChange,
  onClearFilters,
  showActiveFilters = true,
  showResultsCount = true,
  totalResults = 0,
  filteredResults = 0,
  variant = "dropdown", // 'dropdown' or 'inline'
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const filterDropdownRef = useRef(null);

  // Click outside handler for filter dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target)
      ) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilters]);

  // Helper function to get active filters
  const getActiveFilters = () => {
    return filters.filter((filter) => {
      if (filter.type === "select") {
        return filter.value !== filter.defaultValue;
      }
      return filter.value && filter.value !== "";
    });
  };

  // Helper function to get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    count += getActiveFilters().length;
    return count;
  };

  // Helper function to remove individual filter
  const removeFilter = (filterId) => {
    const filter = filters.find((f) => f.id === filterId);
    if (filter) {
      logUserInteraction("FilterComponent", "removeFilter", {
        filterId,
        filterName: filter.label,
        currentValue: filter.value,
      });
      onFilterChange(
        filterId,
        filter.defaultValue ||
          (filter.type === "select" ? filter.options[0]?.value : "")
      );
    }
  };

  // Helper function to clear all filters
  const handleClearAllFilters = () => {
    logUserInteraction("FilterComponent", "clearAllFilters", {
      filtersCleared: getActiveFiltersCount(),
      activeFilters: getActiveFilters().map((f) => ({
        id: f.id,
        label: f.label,
        value: f.value,
      })),
    });
    setSearchTerm("");
    onClearFilters();
    setShowFilters(false);
  };

  // Enhanced search handler with logging
  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    logUserInteraction("FilterComponent", "search", {
      oldSearchTerm: searchTerm,
      newSearchTerm: newSearchTerm,
    });
    setSearchTerm(newSearchTerm);
  };

  // Enhanced filter change handler with logging
  const handleFilterChange = (filterId, value) => {
    const filter = filters.find((f) => f.id === filterId);
    if (filter) {
      logUserInteraction("FilterComponent", "filterChange", {
        filterId,
        filterName: filter.label,
        oldValue: filter.value,
        newValue: value,
      });
    }
    onFilterChange(filterId, value);
  };

  const renderFilterInput = (filter) => {
    switch (filter.type) {
      case "select":
        return (
          <select
            value={filter.value}
            onChange={(e) => onFilterChange(filter.id, e.target.value)}
            className={
              variant === "inline"
                ? "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                : "input-field w-full"
            }
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case "text":
        return (
          <input
            type="text"
            value={filter.value}
            onChange={(e) => onFilterChange(filter.id, e.target.value)}
            placeholder={filter.placeholder}
            className={
              variant === "inline"
                ? "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                : "input-field w-full"
            }
          />
        );
      default:
        return null;
    }
  };

  if (variant === "inline") {
    return (
      <div className="space-y-4">
        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Filters Row */}
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <div key={filter.id}>{renderFilterInput(filter)}</div>
              ))}
            </div>
          </div>

          {/* Clear Filters Button */}
          {getActiveFiltersCount() > 0 && (
            <Button variant="outline" onClick={handleClearAllFilters}>
              Clear Filters ({getActiveFiltersCount()})
            </Button>
          )}
        </div>{" "}
        {/* Results Summary */}
        {showResultsCount && (
          <div className="text-sm text-gray-600 dark:text-gray-400 my-5">
            Showing {filteredResults} of {totalResults} results
            {searchTerm && ` for "${searchTerm}"`}
          </div>
        )}
      </div>
    );
  }

  // Dropdown variant (default)
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-theme opacity-50" />
              </div>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Filter Button */}
          <div className="relative" ref={filterDropdownRef}>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 whitespace-nowrap h-10 px-4 py-2 text-sm font-medium"
            >
              <Filter className="h-4 w-4" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <span className="bg-primary-600 dark:bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-1">
                  {getActiveFiltersCount()}
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </Button>

            {/* Dropdown Filter Panel */}
            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4">
                <div className="space-y-4">
                  {filters.map((filter) => (
                    <div key={filter.id}>
                      <label className="block text-sm font-medium text-theme mb-2">
                        {filter.label}
                      </label>
                      {renderFilterInput(filter)}
                    </div>
                  ))}

                  {/* Clear Filters Button */}
                  {getActiveFiltersCount() > 0 && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearAllFilters}
                        className="w-full"
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
      {/* Active Filters Display */}
      {showActiveFilters && getActiveFilters().length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-theme">
            Active filters:
          </span>
          {searchTerm && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm rounded-full">
              <span>Search: &quot;{searchTerm}&quot;</span>
              <button
                onClick={() => setSearchTerm("")}
                className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {getActiveFilters().map((filter, index) => (
            <div
              key={`${filter.id}-${index}`}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm rounded-full"
            >
              <span>
                {filter.label}: {getFilterDisplayLabel(filter)}
              </span>
              <button
                onClick={() => removeFilter(filter.id)}
                className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            onClick={handleClearAllFilters}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 font-medium"
          >
            Clear all
          </button>
        </div>
      )}{" "}
      {/* Results Summary */}
      {showResultsCount && (
        <div className="text-theme opacity-70 my-5">
          Showing {filteredResults} of {totalResults} results
          {searchTerm && ` for "${searchTerm}"`}
        </div>
      )}
    </div>
  );
};

export default FilterComponent;
