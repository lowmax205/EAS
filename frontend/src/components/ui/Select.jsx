import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Select - Custom select dropdown component following ShadCN patterns
 */
const Select = ({
  value,
  onValueChange,
  placeholder = "Select an option",
  disabled = false,
  className = "",
  children,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const selectRef = useRef(null);

  useEffect(() => {
    // Find the selected option's label
    const findSelectedLabel = () => {
      React.Children.forEach(children, (child) => {
        if (child?.props?.value === value) {
          const childrenContent = child.props.children;
          if (typeof childrenContent === 'string') {
            setSelectedLabel(childrenContent);
          } else {
            // For complex children, use placeholder if provided
            setSelectedLabel(placeholder);
          }
        }
      });
    };
    if (value) {
      findSelectedLabel();
    } else {
      setSelectedLabel("");
    }
  }, [value, children, placeholder]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const baseClasses = `
    inline-flex items-center justify-between w-full px-3 py-2 text-sm 
    bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
    rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-200
  `;

  const dropdownClasses = `
    absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 
    dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto
  `;

  return (
    <div ref={selectRef} className={`relative ${className}`} {...props}>
      <button
        type="button"
        className={baseClasses}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={!selectedLabel ? "text-gray-500" : ""}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <div className={dropdownClasses}>
          {React.Children.map(children, (child) => 
            React.cloneElement(child, {
              onSelect: (selectedValue) => {
                onValueChange(selectedValue);
                setIsOpen(false);
              },
              isSelected: child.props.value === value
            })
          )}
        </div>
      )}
    </div>
  );
};

/**
 * SelectItem - Individual option within Select dropdown
 */
const SelectItem = ({ 
  value, 
  children, 
  onSelect, 
  isSelected, 
  disabled = false,
  className = ""
}) => {
  const itemClasses = `
    flex items-center justify-between w-full px-3 py-2 text-sm text-left 
    hover:bg-gray-100 dark:hover:bg-gray-700 
    focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none
    disabled:opacity-50 disabled:cursor-not-allowed
    ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : ''}
    ${className}
  `;

  return (
    <button
      type="button"
      className={itemClasses}
      onClick={() => !disabled && onSelect?.(value)}
      disabled={disabled}
      role="option"
      aria-selected={isSelected}
    >
      <span>{children}</span>
      {isSelected && <Check className="w-4 h-4" />}
    </button>
  );
};

/**
 * SelectContent - Container for SelectItem components
 */
const SelectContent = ({ children }) => {
  return <>{children}</>;
};

export { Select, SelectItem, SelectContent };
export default Select;
