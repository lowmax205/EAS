/**
 * Campus-Aware Data Types for EAS Multi-Campus Support
 * Story 1.1: Campus Data Model Foundation - JavaScript Implementation
 * 
 * Note: This is a JavaScript file with JSDoc comments for type documentation
 */

/**
 * Campus Migration Mapping for legacy college field to campusId
 * @type {Array<{collegeValue: string, campusId: number, campusName: string}>}
 */
export const CAMPUS_MIGRATION_MAP = [
  { collegeValue: 'main-campus', campusId: 1, campusName: 'Main Campus' },
  { collegeValue: 'malimono', campusId: 2, campusName: 'Malimono Campus' },
  { collegeValue: 'del-carmen', campusId: 3, campusName: 'Del Carmen Campus' },
  { collegeValue: 'mainit', campusId: 4, campusName: 'Mainit Campus' }
];

/**
 * Campus-aware data structure definitions using JSDoc
 * These help with IDE intellisense and documentation
 */

/**
 * @typedef {Object} Campus
 * @property {number} id
 * @property {string} name
 * @property {string} fullName
 * @property {string} address
 * @property {string} email
 * @property {{lat: number, lng: number}} [coordinates]
 * @property {Department[]} departments
 * @property {CampusConfig} [config]
 */

/**
 * @typedef {Object} CampusConfig
 * @property {string} [timezone]
 * @property {string} [locale]
 * @property {{primary: string, secondary: string, accent: string}} [branding]
 * @property {{multiCampusMode: boolean, campusSwitching: boolean, customBranding: boolean}} [features]
 */

/**
 * @typedef {Object} Department
 * @property {number} id
 * @property {string} name
 * @property {string} abbreviation
 * @property {string} description
 * @property {Course[]} courses
 */

/**
 * @typedef {Object} Course
 * @property {number} id
 * @property {string} name
 * @property {string} abbreviation
 * @property {number} duration
 * @property {string} type
 * @property {string} description
 * @property {string} [major]
 * @property {string} [concentration]
 */

/**
 * @typedef {Object} CampusAwareUser
 * @property {number} id
 * @property {string} email
 * @property {string} name
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} [middleName]
 * @property {string} role
 * @property {string} [studentId]
 * @property {string} department
 * @property {string} departmentId
 * @property {string} course
 * @property {string} courseId
 * @property {string} college - Legacy field for backward compatibility
 * @property {number} campusId - Foreign key to Campus
 * @property {string} [campusName] - Computed field for display
 * @property {string} [yearLevel]
 * @property {string} [section]
 * @property {string} gender
 * @property {string} birthDate
 * @property {string} phone
 * @property {string} address
 * @property {string} [avatar]
 * @property {boolean} isActive
 * @property {string} [lastLogin]
 * @property {string} createdAt
 * @property {string} [signature]
 */

/**
 * @typedef {Object} CampusAwareEvent
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {string} date
 * @property {string} time
 * @property {string} endTime
 * @property {boolean} allow_entry
 * @property {string} location
 * @property {{name: string, address: string, capacity: number, coordinates?: {lat: number, lng: number}}} venue
 * @property {string} category
 * @property {string} organizer
 * @property {number} organizerId
 * @property {number} campusId - Foreign key to Campus
 * @property {boolean} isMultiCampus - Allow cross-campus events
 * @property {number[]} allowedCampuses - For multi-campus events
 * @property {number} maxAttendees
 * @property {number} currentAttendees
 * @property {string} status
 * @property {string} qrCode
 * @property {string} [eventBackground]
 * @property {boolean} isPublic
 * @property {string[]} tags
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} CampusAwareAttendance
 * @property {number} id
 * @property {number} eventId
 * @property {number} userId
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} [middleName]
 * @property {string} fullName
 * @property {string} userEmail
 * @property {string} phone
 * @property {string} address
 * @property {string} studentId
 * @property {string} college - Legacy field for backward compatibility
 * @property {number} campusId - Foreign key to Campus (derived from user)
 * @property {boolean} crossCampusAttendance - Flag for analytics
 * @property {string} department
 * @property {string} departmentName
 * @property {string} course
 * @property {string} courseName
 * @property {string} yearLevel
 * @property {string} section
 * @property {string} gender
 * @property {string} dateRegistered
 * @property {string} [dateAttended]
 * @property {string} [timeIn]
 * @property {string} [timeOut]
 * @property {string} status
 * @property {string} method
 * @property {string} [signature]
 * @property {{lat: number, lng: number}} [location]
 * @property {string} eventTitle
 * @property {string} organizerName
 */

/**
 * @typedef {Object} CampusContextState
 * @property {Campus|null} currentCampus
 * @property {Campus[]} availableCampuses
 * @property {UserCampusPermissions} userCampusPermissions
 * @property {boolean} isLoading
 * @property {string|null} error
 */

/**
 * @typedef {Object} UserCampusPermissions
 * @property {boolean} canAccessMultipleCampuses
 * @property {boolean} canSwitchCampuses
 * @property {boolean} isSuperAdmin
 * @property {boolean} isCampusAdmin
 * @property {number[]} accessibleCampusIds
 */

/**
 * @typedef {Object} CampusServiceContext
 * @property {number} userId
 * @property {string} userRole
 * @property {number} userCampusId
 * @property {number} [requestedCampusId]
 */

/**
 * @typedef {Object} CampusFilterOptions
 * @property {number} [campusId]
 * @property {boolean} [includeCrossCampus]
 * @property {boolean} [superAdminMode]
 */
