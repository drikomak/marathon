'use client';

import { useState, useEffect, ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
}

/**
 * Composant qui ne s'affiche que côté client pour éviter les problèmes d'hydratation
 * Utile pour les composants qui dépendent de valeurs aléatoires, de la fenêtre, etc.
 */
export default function ClientOnly({ children }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // S'assurer que le code est exécuté uniquement côté client
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    // Retourner null lors du rendu côté serveur
    return null;
  }

  return <>{children}</>;
} 