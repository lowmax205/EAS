/**
 * File Upload Utilities for EAS System
 * Handles ImageKit.io for images and Mega Cloud for documents
 */

/**
 * ImageKit Configuration
 * For profile images, event banners, and other image assets
 */
export const IMAGEKIT_CONFIG = {
    publicKey: process.env.REACT_APP_IMAGEKIT_PUBLIC_KEY || '',
    urlEndpoint: process.env.REACT_APP_IMAGEKIT_URL_ENDPOINT || '',
    authenticatorEndpoint: process.env.REACT_APP_IMAGEKIT_AUTH_ENDPOINT || '',
};

/**
 * Mega Cloud Configuration
 * For documents, clearances, and file uploads
 */
export const MEGA_CONFIG = {
    apiKey: process.env.REACT_APP_MEGA_API_KEY || '',
    baseUrl: process.env.REACT_APP_MEGA_BASE_URL || '',
};

/**
 * File type validation
 */
export const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
];

export const ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/jpg',
    'image/png'
];

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
    image: 5 * 1024 * 1024, // 5MB
    document: 10 * 1024 * 1024, // 10MB
};

/**
 * Validate file type and size
 * @param {File} file - File to validate
 * @param {string} type - 'image' or 'document'
 * @returns {Object} - Validation result
 */
export function validateFile(file, type = 'image') {
    const allowedTypes = type === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_DOCUMENT_TYPES;
    const sizeLimit = FILE_SIZE_LIMITS[type];

    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
        };
    }

    if (file.size > sizeLimit) {
        return {
            valid: false,
            error: `File size too large. Maximum size: ${(sizeLimit / 1024 / 1024).toFixed(1)}MB`
        };
    }

    return { valid: true };
}

/**
 * Generate file preview URL
 * @param {File} file - File to preview
 * @returns {string} - Preview URL
 */
export function generatePreviewUrl(file) {
    return URL.createObjectURL(file);
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size string
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * ImageKit upload function (placeholder)
 * @param {File} file - File to upload
 * @param {Object} options - Upload options
 * @returns {Promise} - Upload promise
 */
export async function uploadToImageKit(file, options = {}) {
    // TODO: Implement ImageKit SDK integration
    console.log('ImageKit upload:', file.name, options);

    // Mock implementation for now
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                url: `https://ik.imagekit.io/easuniversity/${file.name}`,
                fileId: Date.now().toString(),
            });
        }, 2000);
    });
}

/**
 * Mega Cloud upload function (placeholder)
 * @param {File} file - File to upload
 * @param {Object} options - Upload options
 * @returns {Promise} - Upload promise
 */
export async function uploadToMega(file, options = {}) {
    // TODO: Implement Mega SDK integration
    console.log('Mega upload:', file.name, options);

    // Mock implementation for now
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                url: `https://mega.nz/file/${Date.now()}`,
                fileId: Date.now().toString(),
            });
        }, 3000);
    });
}

/**
 * Generic upload function that routes to appropriate service
 * @param {File} file - File to upload
 * @param {string} type - 'image' or 'document'
 * @param {Object} options - Upload options
 * @returns {Promise} - Upload promise
 */
export async function uploadFile(file, type = 'image', options = {}) {
    const validation = validateFile(file, type);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    if (type === 'image') {
        return uploadToImageKit(file, options);
    } else {
        return uploadToMega(file, options);
    }
}
