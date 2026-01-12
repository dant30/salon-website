// filepath: frontend/src/hooks/useStaff.js
import { useState, useCallback } from 'react';
import api from '../services/api';

export const useStaff = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getStaffMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/staff/');
      // Ensure we always return an array
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      return data;
    } catch (err) {
      setError(err.response?.data || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPreferredStylist = useCallback(async () => {
    try {
      const response = await api.get('/staff/preferences/primary/');
      return response.data.staff;
    } catch (err) {
      if (err.response?.status === 404) {
        console.log('No primary stylist set for user.');
        return null;
      }
      throw err;
    }
  }, []);

  const setPreferredStylist = useCallback(async (staffId) => {
    try {
      // Check if already exists
      const response = await api.get('/staff/preferences/');
      const existing = response.data.find(pref => pref.staff.id === staffId);
      
      if (existing) {
        // Set as primary
        await api.post(`/staff/preferences/${existing.id}/set_primary/`);
      } else {
        // Create new preference
        await api.post('/staff/preferences/', {
          staff: staffId,
          is_primary: true
        });
      }
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    getStaffMembers,
    getPreferredStylist,
    setPreferredStylist,
    loading,
    error
  };
};