import React from "react";
import { UI_COMPONENT_STYLES } from "../common/constants/index";

/**
 * Card component for displaying content in a structured container
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card body content
 * @param {string} props.title - Optional card title displayed in header
 * @param {string} props.subtitle - Optional card subtitle displayed below title
 * @param {string} props.className - Additional CSS classes to apply to the card
 * @param {React.ReactNode} props.headerAction - Optional action element displayed in card header (buttons, etc.)
 * @param {Object} props...rest - Additional HTML div attributes
 * @returns {JSX.Element} Card component
 */
const Card = ({
  children,
  title,
  subtitle,
  className = "",
  headerAction,
  ...props
}) => {
  return (
    <div className={`${UI_COMPONENT_STYLES.card.base} ${className}`} {...props}>
      {(title || subtitle || headerAction) && (
        <div className={`px-6 py-4 ${UI_COMPONENT_STYLES.card.headerDivider}`}>
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-theme">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-theme opacity-70 mt-1">{subtitle}</p>
              )}
            </div>
            {headerAction && <div>{headerAction}</div>}
          </div>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;
