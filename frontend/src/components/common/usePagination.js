import { useState, useMemo, useCallback } from 'react';

/**
 * Custom hook for pagination logic
 * @param {Array} data - Array of data to paginate
 * @param {number} initialItemsPerPage - Initial items per page (default: 10)
 * @returns {Object} Pagination state and functions
 */
const usePagination = (data = [], initialItemsPerPage = 10) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

    // Reset page when data changes
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Ensure current page is valid
    const validCurrentPage = useMemo(() => {
        if (totalPages === 0) return 1;
        return Math.min(currentPage, totalPages);
    }, [currentPage, totalPages]);

    // Get current page data
    const paginatedData = useMemo(() => {
        const startIndex = (validCurrentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return data.slice(startIndex, endIndex);
    }, [data, validCurrentPage, itemsPerPage]);

    // Page change handler
    const handlePageChange = useCallback((newPage) => {
        setCurrentPage(newPage);
    }, []);

    // Items per page change handler
    const handleItemsPerPageChange = useCallback((newItemsPerPage, newPage = 1) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(newPage);
    }, []);

    // Reset pagination (useful when data changes)
    const resetPagination = useCallback(() => {
        setCurrentPage(1);
    }, []);

    // Get pagination info
    const paginationInfo = useMemo(() => {
        const startItem = totalItems === 0 ? 0 : (validCurrentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(validCurrentPage * itemsPerPage, totalItems);

        return {
            startItem,
            endItem,
            totalItems,
            totalPages,
            currentPage: validCurrentPage,
            itemsPerPage,
            hasNextPage: validCurrentPage < totalPages,
            hasPreviousPage: validCurrentPage > 1,
        };
    }, [validCurrentPage, itemsPerPage, totalItems, totalPages]);

    return {
        // Current page data
        paginatedData,

        // Pagination state
        currentPage: validCurrentPage,
        itemsPerPage,
        totalPages,
        totalItems,

        // Pagination info
        paginationInfo,

        // Handlers
        onPageChange: handlePageChange,
        onItemsPerPageChange: handleItemsPerPageChange,
        resetPagination,
    };
};

export default usePagination;
