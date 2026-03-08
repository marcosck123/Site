import { useState, useEffect } from 'react';
import { Product, AppSettings } from '../types';
import { FirebaseService } from '../services/firebaseService';

export function useApp() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    FirebaseService.seedInitialData();

    const unsubscribeProducts = FirebaseService.subscribeToProducts((newProducts) => {
      setProducts(newProducts);
      setIsLoading(false);
    });

    const unsubscribeSettings = FirebaseService.subscribeToSettings(setSettings);

    return () => {
      unsubscribeProducts();
      unsubscribeSettings();
    };
  }, []);

  return { products, settings, isLoading };
}
