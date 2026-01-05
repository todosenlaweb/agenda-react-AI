
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

interface LoadingContextType {
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(config => {
      setRequestCount(prev => {
        if (prev === 0) {
          setLoading(true);
        }
        return prev + 1;
      });
      return config;
    });

    const responseInterceptor = axios.interceptors.response.use(
      response => {
        setRequestCount(prev => {
          const newCount = prev - 1;
          if (newCount === 0) {
            setLoading(false);
          }
          return newCount;
        });
        return response;
      },
      error => {
        setRequestCount(prev => {
          const newCount = prev - 1;
          if (newCount === 0) {
            setLoading(false);
          }
          return newCount;
        });
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading: loading }}>
      {loading && <LoadingSpinner />}
      {children}
    </LoadingContext.Provider>
  );
};
