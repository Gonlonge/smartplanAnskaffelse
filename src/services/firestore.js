/**
 * Firestore Service Layer
 * 
 * Provides clean, reusable functions for Firestore CRUD operations
 * Handles data transformation, error handling, and date conversions
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Convert Firestore Timestamp to JavaScript Date
 */
export const timestampToDate = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  // If it's already a date string, parse it
  return new Date(timestamp);
};

/**
 * Convert JavaScript Date to Firestore Timestamp
 */
export const dateToTimestamp = (date) => {
  if (!date) return null;
  if (date instanceof Date) {
    return Timestamp.fromDate(date);
  }
  if (typeof date === 'string') {
    return Timestamp.fromDate(new Date(date));
  }
  return date; // Assume it's already a Timestamp
};

/**
 * Convert Firestore document to plain object with Date objects
 */
export const docToObject = (docSnapshot) => {
  if (!docSnapshot.exists()) return null;
  
  const data = docSnapshot.data();
  const result = { id: docSnapshot.id, ...data };
  
  // Convert all Timestamp fields to Date objects
  Object.keys(result).forEach((key) => {
    if (result[key] instanceof Timestamp) {
      result[key] = result[key].toDate();
    } else if (result[key]?.toDate) {
      result[key] = result[key].toDate();
    } else if (result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
      // Recursively convert nested objects
      result[key] = convertTimestampsInObject(result[key]);
    } else if (Array.isArray(result[key])) {
      // Convert timestamps in arrays
      result[key] = result[key].map((item) => {
        if (item instanceof Timestamp) {
          return item.toDate();
        }
        if (item?.toDate) {
          return item.toDate();
        }
        if (item && typeof item === 'object') {
          return convertTimestampsInObject(item);
        }
        return item;
      });
    }
  });
  
  return result;
};

/**
 * Helper to recursively convert Timestamps in nested objects
 */
const convertTimestampsInObject = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }
  
  const converted = { ...obj };
  Object.keys(converted).forEach((key) => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    } else if (converted[key]?.toDate) {
      converted[key] = converted[key].toDate();
    } else if (converted[key] && typeof converted[key] === 'object' && !Array.isArray(converted[key])) {
      converted[key] = convertTimestampsInObject(converted[key]);
    } else if (Array.isArray(converted[key])) {
      converted[key] = converted[key].map((item) => {
        if (item instanceof Timestamp) {
          return item.toDate();
        }
        if (item?.toDate) {
          return item.toDate();
        }
        if (item && typeof item === 'object') {
          return convertTimestampsInObject(item);
        }
        return item;
      });
    }
  });
  
  return converted;
};

/**
 * Convert object with Date objects to Firestore-compatible format
 */
export const objectToFirestore = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  const converted = { ...obj };
  
  // List of date fields that should be converted
  const dateFields = [
    'createdAt', 'updatedAt', 'deadline', 'publishDate', 'questionDeadline',
    'invitedAt', 'viewedAt', 'submittedAt', 'askedAt', 'answeredAt',
    'signedAt', 'changedAt', 'awardedAt'
  ];
  
  Object.keys(converted).forEach((key) => {
    // Convert known date fields
    if (dateFields.includes(key) && converted[key]) {
      converted[key] = dateToTimestamp(converted[key]);
    }
    // Convert nested objects
    else if (converted[key] && typeof converted[key] === 'object' && !Array.isArray(converted[key])) {
      converted[key] = objectToFirestore(converted[key]);
    }
    // Convert arrays with objects
    else if (Array.isArray(converted[key])) {
      converted[key] = converted[key].map((item) => {
        if (item && typeof item === 'object') {
          return objectToFirestore(item);
        }
        return item;
      });
    }
  });
  
  return converted;
};

/**
 * Generic function to get a document by ID
 */
export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return docToObject(docSnap);
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Generic function to get all documents from a collection
 */
export const getCollection = async (collectionName, constraints = []) => {
  try {
    // Build query with all constraints spread as arguments
    const q = query(collection(db, collectionName), ...constraints);
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnap) => docToObject(docSnap));
  } catch (error) {
    console.error(`Error getting collection ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Generic function to create a document
 */
export const createDocument = async (collectionName, data) => {
  try {
    // Convert dates to timestamps
    const firestoreData = objectToFirestore(data);
    
    // Add server timestamp for createdAt if not provided
    if (!firestoreData.createdAt) {
      firestoreData.createdAt = serverTimestamp();
    }
    
    const docRef = await addDoc(collection(db, collectionName), firestoreData);
    
    // Return the created document
    const createdDoc = await getDoc(docRef);
    return docToObject(createdDoc);
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Create a document with a specific ID
 * Used when you need to control the document ID (e.g., user profiles with Firebase Auth UID)
 */
export const createDocumentWithId = async (collectionName, docId, data) => {
  try {
    // Convert dates to timestamps
    const firestoreData = objectToFirestore(data);
    
    // Add server timestamp for createdAt if not provided
    if (!firestoreData.createdAt) {
      firestoreData.createdAt = serverTimestamp();
    }
    
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, firestoreData);
    
    // Return the created document
    const createdDoc = await getDoc(docRef);
    return docToObject(createdDoc);
  } catch (error) {
    console.error(`Error creating document with ID in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Generic function to update a document
 */
export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const firestoreData = objectToFirestore(data);
    
    // Add server timestamp for updatedAt
    firestoreData.updatedAt = serverTimestamp();
    
    await updateDoc(docRef, firestoreData);
    
    // Return the updated document
    const updatedDoc = await getDoc(docRef);
    return docToObject(updatedDoc);
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Generic function to delete a document
 */
export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Generic function to update a nested field in a document
 */
export const updateNestedField = async (collectionName, docId, fieldPath, value) => {
  try {
    const docRef = doc(db, collectionName, docId);
    
    // Convert value if it's a date
    let convertedValue = value;
    if (value instanceof Date) {
      convertedValue = dateToTimestamp(value);
    }
    
    await updateDoc(docRef, {
      [fieldPath]: convertedValue,
      updatedAt: serverTimestamp(),
    });
    
    // Return the updated document
    const updatedDoc = await getDoc(docRef);
    return docToObject(updatedDoc);
  } catch (error) {
    console.error(`Error updating nested field in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Batch write operations
 */
export const batchWrite = async (operations) => {
  try {
    const batch = writeBatch(db);
    
    operations.forEach((op) => {
      const { type, collectionName, docId, data } = op;
      const docRef = doc(db, collectionName, docId || null);
      
      switch (type) {
        case 'create':
          batch.set(docRef, objectToFirestore(data));
          break;
        case 'update':
          batch.update(docRef, objectToFirestore(data));
          break;
        case 'delete':
          batch.delete(docRef);
          break;
        default:
          throw new Error(`Unknown batch operation type: ${type}`);
      }
    });
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error in batch write:', error);
    throw error;
  }
};

// Export query helpers - these return QueryConstraint objects
export const queryHelpers = {
  where: (field, operator, value) => where(field, operator, value),
  orderBy: (field, direction = 'asc') => orderBy(field, direction),
  limit: (count) => limit(count),
};

