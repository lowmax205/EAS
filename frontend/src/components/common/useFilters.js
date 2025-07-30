import { useState, useEffect, useCallback, useMemo } from "react";

/**
 * Custom hook for managing filter state with performance optimizations
 * @param {Array} initialFilters - Array of filter configurations
 * @param {Array} data - The data to filter
 * @param {Function} filterFunction - Custom filter function (optional)
 * @returns {Object} Filter state and handlers
 */
const useFilters = (initialFilters = [], data = [], filterFunction = null) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState(initialFilters);

  // Update initial filters when they change
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Memoize the default filter function
  const defaultFilterFunction = useCallback((data, searchTerm, filters) => {
    let filtered = data;

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter((item) => {
        return Object.values(item).some(
          (value) =>
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Apply filters
    filters.forEach((filter) => {
      if (filter.value && filter.value !== filter.defaultValue) {
        filtered = filtered.filter((item) => {
          const itemValue = item[filter.field];

          if (filter.type === "select") {
            if (filter.value === "all") return true;
            return itemValue === filter.value;
          } else if (filter.type === "text") {
            return (
              itemValue &&
              itemValue
                .toString()
                .toLowerCase()
                .includes(filter.value.toLowerCase())
            );
          }

          return true;
        });
      }
    });

    return filtered;
  }, []);

  // Memoize the filter function to use
  const memoizedFilterFunction = useMemo(() => {
    return filterFunction || defaultFilterFunction;
  }, [filterFunction, defaultFilterFunction]);

  // Memoize filtered data
  const filteredData = useMemo(() => {
    return memoizedFilterFunction(data, searchTerm, filters);
  }, [data, searchTerm, filters, memoizedFilterFunction]);

  // Handle filter value change
  const handleFilterChange = useCallback((filterId, value) => {
    setFilters((prevFilters) =>
      prevFilters.map((filter) =>
        filter.id === filterId ? { ...filter, value } : filter
      )
    );
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setFilters((prevFilters) =>
      prevFilters.map((filter) => ({
        ...filter,
        value:
          filter.defaultValue ||
          (filter.type === "select" ? filter.options[0]?.value : ""),
      }))
    );
  }, []);

  // Get active filters
  const getActiveFilters = useCallback(() => {
    return filters.filter((filter) => {
      if (filter.type === "select") {
        return filter.value !== filter.defaultValue;
      }
      return filter.value && filter.value !== "";
    });
  }, [filters]);

  // Get active filters count
  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (searchTerm) count++;
    count += getActiveFilters().length;
    return count;
  }, [searchTerm, getActiveFilters]);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    filteredData,
    handleFilterChange,
    clearAllFilters,
    getActiveFilters,
    getActiveFiltersCount,
  };
};

export default useFilters;
