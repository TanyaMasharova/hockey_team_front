'use client';

import { useState, createContext, useContext, ReactNode } from 'react';

export type ErrorType = 'error' | 'warning' | 'info' | 'success';

interface ErrorMessage {
  message: string;
  type: ErrorType;
  id: number;
}

interface ErrorContextType {
  errors: ErrorMessage[];
  setError: (message: string, type?: ErrorType) => void;
  clearError: (id?: number) => void;
  clearAllErrors: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const [errors, setErrors] = useState<ErrorMessage[]>([]);

  const setError = (message: string, type: ErrorType = 'error') => {
    const id = Date.now();
    setErrors(prev => [...prev, { message, type, id }]);
    setTimeout(() => {
      setTimeout(() => {
        clearError(id);
      }, 5000);
    });
  };
  const clearError = (id?: number) => {
    if (id) {
      setErrors(prev => prev.filter(error => error.id != id));
    }
  };

  const clearAllErrors = () => {
    setErrors([]);
  };
  return (
    <ErrorContext.Provider value={{ errors, setError, clearError, clearAllErrors }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};
