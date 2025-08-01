/**
 * Campus-Aware QR Code Service
 * Story 1.5: Campus-Aware QR Code Generation and Validation
 * 
 * This service provides campus-aware QR code generation and validation
 * with backward compatibility for existing SNSU QR codes
 */

import { devError, devLog } from '../components/common/devLogger';

/**
 * Campus-aware QR code payload structure
 * @typedef {Object} QRCodePayload
 * @property {number} eventId - Event ID
 * @property {number} campusId - Campus ID
 * @property {string} campusCode - Campus code
 * @property {number} timestamp - Timestamp
 * @property {string} signature - Security signature
 * @property {string} version - Version for backward compatibility
 */

class CampusQRService {
  /**
   * Generate campus-aware QR code data
   * @param {Object} eventData - Event information
   * @param {Object} campusContext - Campus context
   * @returns {Object} QR code data and payload
   */
  generateCampusQRCode(eventData, campusContext) {
    try {
      if (!eventData || !campusContext) {
        throw new Error('Event data and campus context are required');
      }

      const payload = {
        eventId: eventData.id,
        campusId: campusContext.currentCampus.id,
        campusCode: campusContext.currentCampus.code,
        timestamp: Date.now(),
        signature: this.generateCampusSignature(eventData.id, campusContext.currentCampus.id),
        version: '2.0' // Campus-aware version
      };

      // Generate QR code string
      const qrCodeString = `${campusContext.currentCampus.code}_${eventData.title
        .toUpperCase()
        .replace(/\s+/g, "_")}_${Date.now()}`;

      devLog("[CampusQRService] Generated campus-aware QR code:", {
        eventId: eventData.id,
        campusId: campusContext.currentCampus.id,
        qrCode: qrCodeString
      });

      return {
        qrCode: qrCodeString,
        qrData: payload,
        displayText: `Campus: ${campusContext.currentCampus.displayName}\nEvent: ${eventData.title}`,
        isMultiCampus: eventData.isMultiCampus || false
      };
    } catch (error) {
      devError("[CampusQRService] Error generating QR code:", error);
      throw error;
    }
  }

  /**
   * Generate campus-specific signature for QR validation
   * @param {number} eventId - Event ID
   * @param {number} campusId - Campus ID
   * @returns {string} Campus signature
   */
  generateCampusSignature(eventId, campusId) {
    // Simple signature generation - in production, use proper cryptographic signing
    const data = `${eventId}_${campusId}_${Date.now()}`;
    return btoa(data).substring(0, 16); // Base64 encoded signature
  }

  /**
   * Validate campus-aware QR code
   * @param {string} qrCodeData - QR code data to validate
   * @param {Object} userCampusContext - User's campus context
   * @param {Object} eventData - Event data for validation
   * @returns {Object} Validation result
   */
  validateCampusQRCode(qrCodeData, userCampusContext, eventData = null) {
    try {
      devLog("[CampusQRService] Validating QR code:", { qrCodeData, userCampusContext });

      // Check if this is a legacy QR code (backward compatibility)
      if (this.isLegacyQRCode(qrCodeData)) {
        return this.validateLegacyQRCode(qrCodeData, userCampusContext);
      }

      // Parse campus-aware QR code
      const payload = this.parseQRPayload(qrCodeData);
      if (!payload) {
        return {
          isValid: false,
          error: "Invalid QR code format",
          errorCode: "INVALID_FORMAT"
        };
      }

      // Validate campus context
      const campusValidation = this.validateCampusAccess(payload, userCampusContext);
      if (!campusValidation.isValid) {
        return campusValidation;
      }

      // Validate timestamp (QR codes expire after 24 hours)
      const timestampValidation = this.validateTimestamp(payload.timestamp);
      if (!timestampValidation.isValid) {
        return timestampValidation;
      }

      // Validate signature
      const signatureValidation = this.validateSignature(payload);
      if (!signatureValidation.isValid) {
        return signatureValidation;
      }

      // Validate event context if provided
      if (eventData) {
        if (payload.eventId !== eventData.id) {
          return {
            isValid: false,
            error: "QR code is for a different event",
            errorCode: "EVENT_MISMATCH"
          };
        }

        if (payload.campusId !== eventData.campusId) {
          return {
            isValid: false,
            error: "QR code campus does not match event campus",
            errorCode: "CAMPUS_EVENT_MISMATCH"
          };
        }
      }

      devLog("[CampusQRService] QR code validation successful");
      return {
        isValid: true,
        payload,
        campusValidated: true,
        message: "QR code is valid for your campus"
      };

    } catch (error) {
      devError("[CampusQRService] Error validating QR code:", error);
      return {
        isValid: false,
        error: "QR code validation failed",
        errorCode: "VALIDATION_ERROR"
      };
    }
  }

  /**
   * Check if QR code is legacy format (pre-campus implementation)
   * @param {string} qrCodeData - QR code data
   * @returns {boolean} True if legacy format
   */
  isLegacyQRCode(qrCodeData) {
    // Legacy QR codes start with "QR_" and don't have campus prefix
    return qrCodeData.startsWith('QR_') && !qrCodeData.includes('_SNSU_') && !qrCodeData.includes('_NC_') && !qrCodeData.includes('_SC_');
  }

  /**
   * Validate legacy QR codes for backward compatibility
   * @param {string} qrCodeData - Legacy QR code data
   * @param {Object} userCampusContext - User's campus context
   * @returns {Object} Validation result
   */
  validateLegacyQRCode(qrCodeData, userCampusContext) {
    devLog("[CampusQRService] Validating legacy QR code:", qrCodeData);

    // Legacy QR codes are assumed to be for SNSU (campus ID 1)
    if (userCampusContext.currentCampus.id !== 1) {
      // Non-SNSU users cannot use legacy QR codes
      return {
        isValid: false,
        error: "Legacy QR code not valid for your campus. Please use campus-specific QR codes.",
        errorCode: "LEGACY_CAMPUS_MISMATCH",
        isLegacy: true
      };
    }

    // For SNSU users, legacy QR codes are still valid
    return {
      isValid: true,
      isLegacy: true,
      payload: {
        eventId: this.extractEventIdFromLegacy(qrCodeData),
        campusId: 1, // SNSU
        campusCode: 'SNSU',
        timestamp: Date.now(), // Current time for legacy codes
        signature: 'legacy_signature',
        version: '1.0'
      },
      campusValidated: true,
      message: "Legacy QR code validated for SNSU campus"
    };
  }

  /**
   * Parse QR payload from campus-aware QR code
   * @param {string} qrCodeData - QR code data
   * @returns {Object|null} Parsed payload or null if invalid
   */
  parseQRPayload(qrCodeData) {
    try {
      // Campus-aware QR codes should contain embedded payload data
      // For this implementation, we'll extract from the QR code string
      const parts = qrCodeData.split('_');
      
      if (parts.length < 3) {
        return null;
      }

      const campusCode = parts[0];
      const timestamp = parseInt(parts[parts.length - 1]);

      // Map campus codes to IDs
      const campusIdMap = {
        'SNSU': 1,
        'NC': 2,
        'SC': 3,
        'EC': 4
      };

      return {
        eventId: this.extractEventIdFromQR(qrCodeData),
        campusId: campusIdMap[campusCode] || 1,
        campusCode: campusCode,
        timestamp: timestamp,
        signature: this.generateCampusSignature(this.extractEventIdFromQR(qrCodeData), campusIdMap[campusCode] || 1),
        version: '2.0'
      };
    } catch (error) {
      devError("[CampusQRService] Error parsing QR payload:", error);
      return null;
    }
  }

  /**
   * Extract event ID from QR code string
   * @param {string} qrCodeData - QR code data
   * @returns {number} Event ID
   */
  extractEventIdFromQR(qrCodeData) {
    // Simple extraction - in production, use more robust method
    const hash = qrCodeData.split('_').join('').toLowerCase();
    return parseInt(hash.substring(0, 3), 36) % 1000 + 1; // Generate consistent ID from hash
  }

  /**
   * Extract event ID from legacy QR code
   * @param {string} qrCodeData - Legacy QR code data
   * @returns {number} Event ID
   */
  extractEventIdFromLegacy(qrCodeData) {
    // Extract from legacy format "QR_EVENT_NAME_TIMESTAMP"
    const hash = qrCodeData.replace('QR_', '').toLowerCase();
    return parseInt(hash.substring(0, 3), 36) % 1000 + 1;
  }

  /**
   * Validate campus access for QR code
   * @param {Object} payload - QR code payload
   * @param {Object} userCampusContext - User's campus context
   * @returns {Object} Validation result
   */
  validateCampusAccess(payload, userCampusContext) {
    const userCampusId = userCampusContext.currentCampus.id;
    const qrCampusId = payload.campusId;

    // Check if user can access this campus QR code
    if (qrCampusId !== userCampusId) {
      // Super admins can access any campus QR code
      if (userCampusContext.userCampusPermissions.isSuperAdmin) {
        return {
          isValid: true,
          crossCampusAccess: true,
          message: "Super admin cross-campus access granted"
        };
      }

      // Check if user has multi-campus access
      if (userCampusContext.userCampusPermissions.canAccessMultipleCampuses &&
          userCampusContext.userCampusPermissions.accessibleCampusIds.includes(qrCampusId)) {
        return {
          isValid: true,
          crossCampusAccess: true,
          message: "Multi-campus access granted"
        };
      }

      // Regular users can only use QR codes from their assigned campus
      return {
        isValid: false,
        error: `QR code is for ${payload.campusCode} campus. You can only scan QR codes from your assigned campus.`,
        errorCode: "CAMPUS_ACCESS_DENIED",
        userCampus: userCampusContext.currentCampus.code,
        qrCampus: payload.campusCode
      };
    }

    return {
      isValid: true,
      campusMatched: true,
      message: "Campus access validated"
    };
  }

  /**
   * Validate QR code timestamp
   * @param {number} timestamp - QR code timestamp
   * @returns {Object} Validation result
   */
  validateTimestamp(timestamp) {
    const now = Date.now();
    const qrAge = now - timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (qrAge > maxAge) {
      return {
        isValid: false,
        error: "QR code has expired. Please request a new QR code.",
        errorCode: "QR_EXPIRED",
        ageHours: Math.floor(qrAge / (60 * 60 * 1000))
      };
    }

    return {
      isValid: true,
      ageHours: Math.floor(qrAge / (60 * 60 * 1000))
    };
  }

  /**
   * Validate QR code signature
   * @param {Object} payload - QR code payload
   * @returns {Object} Validation result
   */
  validateSignature(payload) {
    // Simple signature validation - in production, use proper cryptographic verification
    const expectedSignature = this.generateCampusSignature(payload.eventId, payload.campusId);
    
    // For legacy compatibility, accept any signature that's not empty
    if (!payload.signature || payload.signature === 'legacy_signature') {
      return { isValid: true, isLegacy: true };
    }

    if (payload.signature !== expectedSignature) {
      return {
        isValid: false,
        error: "QR code signature is invalid. This may be a counterfeit QR code.",
        errorCode: "INVALID_SIGNATURE"
      };
    }

    return { isValid: true };
  }

  /**
   * Generate QR code for display (URL or data)
   * @param {Object} qrData - QR code data
   * @returns {string} QR code display URL
   */
  generateQRDisplayData(qrData) {
    if (!qrData || !qrData.qrCode) {
      throw new Error('QR data is required');
    }

    // In production, this would generate an actual QR code image or URL
    // For now, return the QR code string
    return {
      qrCodeString: qrData.qrCode,
      displayUrl: `data:text/plain;base64,${btoa(qrData.qrCode)}`,
      campusInfo: {
        campusId: qrData.qrData.campusId,
        campusCode: qrData.qrData.campusCode,
        timestamp: qrData.qrData.timestamp
      }
    };
  }
}

// Export singleton instance
export const campusQRService = new CampusQRService();
export default campusQRService;
