/**
 * DashboardSkeleton - Loading state components for the dashboard
 * Features: Multiple skeleton loaders for various dashboard components
 * Dependencies: None - pure CSS/Tailwind implementation
 * Theme Support: Complete light/dark theme with smooth transitions
 * Accessibility: ARIA labels for loading states
 */

import React from "react";

/**
 * SkeletonCard - Generic skeleton loader for card components
 * @returns {JSX.Element} - Card skeleton component
 */
export const SkeletonCard = ({ className = "" }) => (
  <div
    className={`animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800 p-4 ${className}`}
    aria-label="Loading content"
    role="status"
  >
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
    <div className="space-y-3">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
    </div>
  </div>
);

/**
 * SkeletonEventCard - Skeleton loader for event card items
 * @returns {JSX.Element} - Event card skeleton component
 */
export const SkeletonEventCard = () => (
  <div
    className="animate-pulse bg-gray-100 dark:bg-gray-800 p-4 rounded-lg"
    aria-label="Loading event"
    role="status"
  >
    <div className="flex justify-between">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
    </div>
    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mt-3 mb-2"></div>
    <div className="space-y-2 mt-3">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
    </div>
    <div className="flex space-x-4 mt-3">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
    </div>
    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-3"></div>
    <div className="flex space-x-2 mt-3">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
    </div>
  </div>
);

/**
 * SkeletonWelcome - Skeleton loader for welcome hero section
 * @returns {JSX.Element} - Welcome section skeleton component
 */
export const SkeletonWelcome = () => (
  <div
    className="animate-pulse bg-gray-100 dark:bg-gray-800 p-6 rounded-lg"
    aria-label="Loading welcome section"
    role="status"
  >
    <div className="flex flex-col md:flex-row md:items-center justify-between">
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
      </div>
      <div className="flex space-x-4 mt-4 md:mt-0">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </div>
    </div>
  </div>
);

/**
 * SkeletonQuickActions - Skeleton loader for quick actions section
 * @returns {JSX.Element} - Quick actions skeleton component
 */
export const SkeletonQuickActions = () => (
  <div
    className="animate-pulse bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6"
    aria-label="Loading quick actions"
    role="status"
  >
    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4"></div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-gray-200 dark:bg-gray-700 h-24 rounded-lg"></div>
      ))}
    </div>
  </div>
);

/**
 * DashboardSkeleton - Complete dashboard skeleton with all sections
 * @returns {JSX.Element} - Full dashboard skeleton component
 */
const DashboardSkeleton = () => (
  <div className="min-h-screen bg-background-light dark:bg-background-dark theme-transition">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SkeletonQuickActions />

      <div className="space-y-8">
        {/* Header skeleton */}
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
          </div>
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>

        {/* Welcome section skeleton */}
        <SkeletonWelcome />

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} className="h-24" />
          ))}
        </div>

        {/* Main content grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <SkeletonCard className="h-64" />
            <SkeletonCard className="h-40" />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <SkeletonCard className="h-64" />
            <SkeletonCard className="h-40" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DashboardSkeleton;
