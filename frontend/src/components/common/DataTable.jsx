import React, { memo } from "react";
import Card from "../../components/ui/Card";
import { Pagination } from "../../components/ui";
import { Eye } from "lucide-react";
import Button from "../../components/ui/Button";

/**
 * Enhanced DataTable component with better accessibility and performance
 * @param {Object} props - Component props
 * @param {string} props.title - Table title
 * @param {string} props.subtitle - Table subtitle
 * @param {Array} props.columns - Column definitions
 * @param {Array} props.data - Data array
 * @param {React.ReactNode} props.emptyState - Empty state component
 * @param {Function} props.onRowAction - Row action handler
 * @param {string} props.actionLabel - Action button label
 * @param {boolean} props.showActions - Whether to show action buttons
 * @param {string} props.keyField - Field to use as row key (default: 'id')
 * @param {boolean} props.enablePagination - Whether to enable pagination
 * @param {Object} props.paginationConfig - Pagination configuration
 * @param {number} props.paginationConfig.currentPage - Current page
 * @param {number} props.paginationConfig.itemsPerPage - Items per page
 * @param {number} props.paginationConfig.totalItems - Total items
 * @param {Function} props.paginationConfig.onPageChange - Page change handler
 * @param {Function} props.paginationConfig.onItemsPerPageChange - Items per page change handler
 * @param {Array} props.paginationConfig.itemsPerPageOptions - Items per page options
 * @returns {JSX.Element} DataTable component
 */
const DataTable = memo(
  ({
    title,
    subtitle,
    columns = [],
    data = [],
    emptyState,
    onRowAction,
    actionLabel = "View",
    showActions = false,
    keyField = "id",
    enablePagination = false,
    paginationConfig = {},
  }) => {
    // Show empty state if no data
    if (data.length === 0 && emptyState) {
      return emptyState;
    }

    return (
      <Card title={title} subtitle={subtitle}>
        <div className="overflow-x-auto">
          <table
            className="w-full"
            role="table"
            aria-label={title || "Data table"}
          >
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-theme opacity-70 uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
                {showActions && (
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-theme opacity-70 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {data.map((row, rowIndex) => (
                <tr
                  key={row[keyField] || rowIndex}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  role="row"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-4 whitespace-nowrap"
                      role="cell"
                    >
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                  {showActions && onRowAction && (
                    <td className="px-4 py-4 whitespace-nowrap" role="cell">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => onRowAction(row)}
                          ariaLabel={`${actionLabel} ${
                            row.title || row.name || "item"
                          }`}
                        >
                          <Eye className="h-3 w-3" />
                          {actionLabel}
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {enablePagination && (
          <div className="px-6 py-4 border-t border-border-light dark:border-border-dark">
            <Pagination
              currentPage={paginationConfig.currentPage || 1}
              totalItems={paginationConfig.totalItems || 0}
              itemsPerPage={paginationConfig.itemsPerPage || 10}
              onPageChange={paginationConfig.onPageChange}
              onItemsPerPageChange={paginationConfig.onItemsPerPageChange}
              itemsPerPageOptions={paginationConfig.itemsPerPageOptions || [10, 20, 30, 50]}
              showItemsPerPage={true}
            />
          </div>
        )}
      </Card>
    );
  }
);

DataTable.displayName = "DataTable";

export default DataTable;
