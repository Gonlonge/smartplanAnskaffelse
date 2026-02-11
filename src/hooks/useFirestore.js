/**
 * Custom React Hooks for Firestore
 * 
 * Provides reactive data fetching with loading and error states
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { docToObject, timestampToDate } from '../services/firestore';

/**
 * Deep comparison helper for query constraints
 * Compares constraints by their serialized representation
 */
const constraintsEqual = (a, b) => {
  if (a.length !== b.length) return false;
  try {
    // Compare by serializing each constraint
    // QueryConstraint objects have type, field, operator, value properties
    return JSON.stringify(a.map(c => ({
      type: c.type,
      field: c.field?.path || c.field,
      operator: c.op || c.operator,
      value: c.value
    }))) === JSON.stringify(b.map(c => ({
      type: c.type,
      field: c.field?.path || c.field,
      operator: c.op || c.operator,
      value: c.value
    })));
  } catch {
    // Fallback to string comparison if serialization fails
    return JSON.stringify(a) === JSON.stringify(b);
  }
};

/**
 * Hook to listen to a single document
 * @param {string} collectionName - Collection name
 * @param {string} docId - Document ID (null/undefined to skip)
 * @returns {{data: object|null, loading: boolean, error: Error|null}}
 */
export const useDocument = (collectionName, docId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!docId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const docRef = doc(db, collectionName, docId);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setData(docToObject(docSnap));
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error(`Error listening to document ${collectionName}/${docId}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, docId]);

  return { data, loading, error };
};

/**
 * Hook to listen to a collection with optional query constraints
 * @param {string} collectionName - Collection name
 * @param {Array} constraints - Array of query constraints (QueryConstraint objects from where, orderBy, limit)
 * @returns {{data: Array, loading: boolean, error: Error|null}}
 */
export const useCollection = (collectionName, constraints = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // FIXED: Use ref to store previous constraints and do deep comparison
  // This prevents unnecessary re-subscriptions when constraints haven't actually changed
  const prevConstraintsRef = useRef(constraints);
  const constraintsKey = useMemo(() => {
    // Only update if constraints actually changed
    if (!constraintsEqual(prevConstraintsRef.current, constraints)) {
      prevConstraintsRef.current = constraints;
    }
    // Create a stable key for the dependency array
    try {
      return JSON.stringify(constraints.map(c => ({
        type: c.type,
        field: c.field?.path || c.field,
        operator: c.op || c.operator,
        value: c.value
      })));
    } catch {
      return JSON.stringify(constraints);
    }
  }, [constraints]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Build query with constraints spread as arguments
    const q = query(collection(db, collectionName), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const docs = querySnapshot.docs.map((docSnap) => docToObject(docSnap));
        setData(docs);
        setLoading(false);
      },
      (err) => {
        console.error(`Error listening to collection ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, constraintsKey]);

  return { data, loading, error };
};

/**
 * Hook to get a single document once (non-reactive)
 * @param {string} collectionName - Collection name
 * @param {string} docId - Document ID
 * @returns {{data: object|null, loading: boolean, error: Error|null}}
 */
export const useDocumentOnce = (collectionName, docId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!docId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const { getDocument } = await import('../services/firestore');
        const docData = await getDocument(collectionName, docId);
        setData(docData);
        setLoading(false);
      } catch (err) {
        console.error(`Error fetching document ${collectionName}/${docId}:`, err);
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, docId]);

  return { data, loading, error };
};

/**
 * Hook to get a collection once (non-reactive)
 * @param {string} collectionName - Collection name
 * @param {Array} constraints - Array of query constraints
 * @returns {{data: Array, loading: boolean, error: Error|null}}
 */
export const useCollectionOnce = (collectionName, constraints = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // FIXED: Use ref to store previous constraints and do deep comparison
  const prevConstraintsRef = useRef(constraints);
  const constraintsKey = useMemo(() => {
    if (!constraintsEqual(prevConstraintsRef.current, constraints)) {
      prevConstraintsRef.current = constraints;
    }
    try {
      return JSON.stringify(constraints.map(c => ({
        type: c.type,
        field: c.field?.path || c.field,
        operator: c.op || c.operator,
        value: c.value
      })));
    } catch {
      return JSON.stringify(constraints);
    }
  }, [constraints]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const { getCollection } = await import('../services/firestore');
        const docs = await getCollection(collectionName, constraints);
        setData(docs);
        setLoading(false);
      } catch (err) {
        console.error(`Error fetching collection ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, constraintsKey]);

  return { data, loading, error };
};

// Export query helpers for use in hooks - these return QueryConstraint objects
export const queryHelpers = {
  where: (field, operator, value) => where(field, operator, value),
  orderBy: (field, direction = 'asc') => orderBy(field, direction),
  limit: (count) => limit(count),
};

