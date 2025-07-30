/**
 * Main constants export file
 * Exports all constants from organized modules
 */

// Re-export all constants from organized modules
export * from "./app";
export * from "./events";
export * from "./theme";
export * from "./ui";
export * from "./attendance";
export * from "./auth";
export * from "./university";
export * from "./api";
export * from "./common";

// Legacy exports for backward compatibility - Individual exports
import { APP_CONFIG } from "./app";

// Backward compatibility exports
export const APP_NAME = APP_CONFIG.NAME;
export const APP_DESCRIPTION = APP_CONFIG.DESCRIPTION;
export const UNIVERSITY_NAME = APP_CONFIG.UNIVERSITY.NAME;
export const UNIVERSITY_SHORT = APP_CONFIG.UNIVERSITY.SHORT;
export const UNIVERSITY_EMAIL = APP_CONFIG.UNIVERSITY.EMAIL;
export const UNIVERSITY_ADDRESS = APP_CONFIG.UNIVERSITY.ADDRESS;
