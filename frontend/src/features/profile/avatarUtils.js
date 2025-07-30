/**
 * Avatar utility functions for generating default avatars
 */

/**
 * Generate avatar information based on user name with inline styles for reliable colors
 * @param {string} name - User's full name
 * @param {boolean} isDark - Whether to use dark theme colors
 * @returns {Object} Object containing initial, color class, and inline style
 */
export const generateAvatarWithStyle = (name, isDark = false) => {
  if (!name)
    return {
      initial: "?",
      color: "from-green-500 to-green-700",
      style: {
        background: "linear-gradient(135deg, #22c55e 0%, #166534 100%)",
      },
    };

  const initial = name.charAt(0).toUpperCase();

  // SNSU theme-compliant color combinations with fallback inline styles
  const colorConfigs = [
    {
      classes: "from-green-500 to-green-700",
      lightStyle: "linear-gradient(135deg, #22c55e 0%, #166534 100%)",
      darkStyle: "linear-gradient(135deg, #16a34a 0%, #14532d 100%)",
    },
    {
      classes: "from-blue-500 to-blue-700",
      lightStyle: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      darkStyle: "linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)",
    },
    {
      classes: "from-purple-500 to-purple-700",
      lightStyle: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      darkStyle: "linear-gradient(135deg, #7c3aed 0%, #581c87 100%)",
    },
    {
      classes: "from-pink-500 to-pink-700",
      lightStyle: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
      darkStyle: "linear-gradient(135deg, #db2777 0%, #9d174d 100%)",
    },
    {
      classes: "from-indigo-500 to-indigo-700",
      lightStyle: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
      darkStyle: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)",
    },
    {
      classes: "from-teal-500 to-teal-700",
      lightStyle: "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)",
      darkStyle: "linear-gradient(135deg, #0d9488 0%, #134e4a 100%)",
    },
    {
      classes: "from-orange-500 to-orange-700",
      lightStyle: "linear-gradient(135deg, #f97316 0%, #c2410c 100%)",
      darkStyle: "linear-gradient(135deg, #ea580c 0%, #9a3412 100%)",
    },
    {
      classes: "from-red-500 to-red-700",
      lightStyle: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
      darkStyle: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
    },
  ];

  // Use character code to ensure consistent color assignment
  const colorIndex = name.charCodeAt(0) % colorConfigs.length;
  const config = colorConfigs[colorIndex];

  return {
    initial,
    color: config.classes,
    style: { background: isDark ? config.darkStyle : config.lightStyle },
  };
};

/**
 * Check if avatar path is a placeholder/mock path
 * @param {string} avatarPath - Path to avatar image
 * @returns {boolean} True if it's a placeholder path
 */
export const isPlaceholderAvatar = (avatarPath) => {
  return avatarPath && avatarPath.startsWith("/images/avatars/");
};

/**
 * Generate a data URL for an avatar SVG with theme-aware colors
 * @param {string} initial - Initial letter
 * @param {string} bgColor - Background color (hex) - defaults to SNSU primary
 * @param {boolean} isDark - Whether to use dark theme colors
 * @returns {string} Data URL for SVG avatar
 */
export const generateAvatarSVG = (
  initial,
  bgColor = "#22c55e",
  isDark = false
) => {
  const defaultLightColor = "#22c55e"; // eas-light-primary
  const defaultDarkColor = "#16a34a"; // eas-dark-primary

  const finalBgColor =
    bgColor === "#3B82F6"
      ? isDark
        ? defaultDarkColor
        : defaultLightColor
      : bgColor;

  const svg = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${finalBgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${
            isDark ? "#14532d" : "#166534"
          };stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#avatarGradient)" rx="50"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.35em" font-family="Inter, Arial, sans-serif" font-size="40" font-weight="bold" fill="white">
        ${initial}
      </text>
    </svg>
  `;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

/**
 * Generate avatar information based on user name (legacy version for backward compatibility)
 * @param {string} name - User's full name
 * @returns {Object} Object containing initial and color class
 */
export const generateAvatar = (name) => {
  if (!name)
    return {
      initial: "?",
      color: "from-green-500 to-green-700",
    };

  const initial = name.charAt(0).toUpperCase();

  // Simple color classes that should work with most Tailwind configurations
  const colors = [
    "from-green-500 to-green-700",
    "from-blue-500 to-blue-700",
    "from-purple-500 to-purple-700",
    "from-pink-500 to-pink-700",
    "from-indigo-500 to-indigo-700",
    "from-teal-500 to-teal-700",
    "from-orange-500 to-orange-700",
    "from-red-500 to-red-700",
  ];

  // Use character code to ensure consistent color assignment
  const colorIndex = name.charCodeAt(0) % colors.length;
  return { initial, color: colors[colorIndex] };
};
