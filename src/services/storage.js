/**
 * Firebase Storage Service
 * 
 * Handles file uploads and downloads for documents
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Upload a file to Firebase Storage
 * @param {File} file - File to upload
 * @param {string} path - Storage path (e.g., 'tenders/tender1/documents/doc.pdf')
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<{url: string, path: string, name: string, size: number, type: string}>}
 */
export const uploadFile = async (file, path, onProgress = null) => {
  try {
    const storageRef = ref(storage, path);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Get file metadata
    const metadata = snapshot.metadata;
    
    return {
      url: downloadURL,
      path: snapshot.ref.fullPath,
      name: file.name,
      size: file.size,
      type: file.type || metadata.contentType || 'application/octet-stream',
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(`Kunne ikke laste opp fil: ${error.message}`);
  }
};

/**
 * Delete a file from Firebase Storage
 * @param {string} path - Storage path to delete
 * @returns {Promise<{success: boolean}>}
 */
export const deleteFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error(`Kunne ikke slette fil: ${error.message}`);
  }
};

/**
 * Get download URL for a file
 * @param {string} path - Storage path
 * @returns {Promise<string>} Download URL
 */
export const getFileURL = async (path) => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw new Error(`Kunne ikke hente fil: ${error.message}`);
  }
};

/**
 * Generate a storage path for a tender document
 * @param {string} tenderId - Tender ID
 * @param {string} fileName - File name
 * @returns {string} Storage path
 */
export const getTenderDocumentPath = (tenderId, fileName) => {
  return `tenders/${tenderId}/documents/${Date.now()}_${fileName}`;
};

/**
 * Generate a storage path for a bid document
 * @param {string} tenderId - Tender ID
 * @param {string} bidId - Bid ID
 * @param {string} fileName - File name
 * @returns {string} Storage path
 */
export const getBidDocumentPath = (tenderId, bidId, fileName) => {
  return `tenders/${tenderId}/bids/${bidId}/documents/${Date.now()}_${fileName}`;
};

