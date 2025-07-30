/**
 * Profile Components Export File
 * Centralizes all profile-related component exports for easier imports
 */

import ProfilePage from './ProfilePage';
import DocumentUpload from './DocumentUpload';
import SignatureCanvas from './SignatureCanvas';
import { getAvatarUrl, getInitials } from './avatarUtils';

export {
  ProfilePage,
  DocumentUpload,
  SignatureCanvas,
  getAvatarUrl,
  getInitials
};

export default {
  ProfilePage,
  DocumentUpload,
  SignatureCanvas,
  avatarUtils: {
    getAvatarUrl,
    getInitials
  }
};
