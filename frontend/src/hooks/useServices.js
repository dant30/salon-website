// filepath: c:\Users\dante\salon-website\frontend\src\hooks\useServices.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/services/`);
        // Handle different response structures
        const data = Array.isArray(response.data) ? response.data : response.data.results || [];
        setServices(data);
      } catch (err) {
        setError(err.message);
        setServices([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return { services, loading, error };
};