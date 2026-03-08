import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { FirebaseService } from '../services/firebaseService';
import LoadingModal from '../components/LoadingModal';

interface AuthContextType {
  user: User | null;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  isInitialized: false,
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = FirebaseService.onAuthStateChange((userData) => {
      setUser(userData);
      if (!isInitialized) {
        setIsInitialized(true);
      }
    });

    return () => unsubscribe();
  }, [isInitialized]);

  return (
    <AuthContext.Provider value={{ user, isInitialized, setUser }}>
      {!isInitialized ? (
        <LoadingModal isOpen={true} message="Carregando..." />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
