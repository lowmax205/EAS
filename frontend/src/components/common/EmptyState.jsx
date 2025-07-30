import React from "react";
import Button from "../../components/ui/Button";

/**
 * EmptyState component for displaying when no data is available
 */
const EmptyState = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  iconClassName = "h-16 w-16 text-theme opacity-50 mx-auto mb-4",
  className = "text-center py-12",
}) => {
  return (
    <div className={className}>
      {icon && React.cloneElement(icon, { className: iconClassName })}
      <h3 className="text-lg font-medium text-theme mb-2">{title}</h3>
      <p className="text-theme opacity-70 mb-4">{message}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
};

export default EmptyState;
