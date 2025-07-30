import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

/**
 * Pagination component with customizable items per page
 * @param {Object} props - Component props
 * @param {number} props.currentPage - Current page number (1-based)
 * @param {number} props.totalItems - Total number of items
 * @param {number} props.itemsPerPage - Number of items per page
 * @param {Function} props.onPageChange - Callback when page changes
 * @param {Function} props.onItemsPerPageChange - Callback when items per page changes
 * @param {Array} props.itemsPerPageOptions - Options for items per page (default: [10, 20, 30, 50])
 * @param {boolean} props.showItemsPerPage - Whether to show items per page selector (default: true)
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Pagination component
 */
const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 30, 50],
  showItemsPerPage = true,
  className = ''
}) => {
  // Calculate pagination values
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Don't render if no items or only one page and no items per page selector
  if (totalItems === 0 || (!showItemsPerPage && totalPages <= 1)) {
    return null;
  }

  /**
   * Handle page navigation
   */
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      onPageChange?.(newPage);
    }
  };

  /**
   * Handle items per page change
   */
  const handleItemsPerPageChange = (newItemsPerPage) => {
    if (newItemsPerPage !== itemsPerPage) {
      // Calculate what page the first item of current view should be on with new page size
      const firstItemIndex = (currentPage - 1) * itemsPerPage;
      const newPage = Math.floor(firstItemIndex / newItemsPerPage) + 1;
      
      onItemsPerPageChange?.(newItemsPerPage, newPage);
    }
  };

  /**
   * Generate page numbers to display (with ellipsis for large page counts)
   */
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 7; // Show at most 7 page numbers
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis
      if (currentPage <= 4) {
        // Near beginning
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Near end
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In middle
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${className}`}>
      {/* Items info and per-page selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Items info */}
        <div className="text-sm text-theme opacity-70">
          Showing {startItem}-{endItem} of {totalItems} results
        </div>

        {/* Items per page selector */}
        {showItemsPerPage && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-theme opacity-70">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-1 text-sm border border-border-light dark:border-border-dark rounded-md 
                       bg-white dark:bg-gray-800 text-theme focus:outline-none focus:ring-2 
                       focus:ring-eas-primary focus:border-transparent"
              aria-label="Items per page"
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="text-sm text-theme opacity-70">per page</span>
          </div>
        )}
      </div>

      {/* Page navigation */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Previous button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1"
            ariaLabel="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1 mx-2">
            {getPageNumbers().map((pageNum, index) => {
              if (pageNum === 'ellipsis') {
                return (
                  <span key={`ellipsis-${index}`} className="px-2 py-1 text-theme opacity-50">
                    ...
                  </span>
                );
              }
              
              return (
                <Button
                  key={`page-${pageNum}`}
                  variant={pageNum === currentPage ? "primary" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className="min-w-[2.5rem]"
                  ariaLabel={`Page ${pageNum}`}
                  aria-current={pageNum === currentPage ? 'page' : undefined}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          {/* Next button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1"
            ariaLabel="Next page"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
