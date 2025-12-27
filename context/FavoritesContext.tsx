'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

interface Favorite {
  id: string;
  tmdbId: number;
  title: string;
  posterPath?: string;
}

interface FavoritesContextValue {
  favorites: Favorite[];
  isLoading: boolean;
  isFavorite: (tmdbId: number) => boolean;
  getFavoriteId: (tmdbId: number) => string | null;
  addFavorite: (favorite: Favorite) => void;
  removeFavorite: (tmdbId: number) => void;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user || !session?.access_token) {
      setFavorites([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/authenticated-user', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userFavorites = data.user?.favorites || [];
        setFavorites(
          userFavorites.map((fav: { id: string; tmdbId: number; title: string; posterPath?: string }) => ({
            id: fav.id,
            tmdbId: fav.tmdbId,
            title: fav.title,
            posterPath: fav.posterPath,
          }))
        );
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, [user, session?.access_token]);

  // Fetch favorites when user/session changes
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback(
    (tmdbId: number) => favorites.some((fav) => fav.tmdbId === tmdbId),
    [favorites]
  );

  const getFavoriteId = useCallback(
    (tmdbId: number) => favorites.find((fav) => fav.tmdbId === tmdbId)?.id ?? null,
    [favorites]
  );

  const addFavorite = useCallback((favorite: Favorite) => {
    setFavorites((prev) => [...prev, favorite]);
  }, []);

  const removeFavorite = useCallback((tmdbId: number) => {
    setFavorites((prev) => prev.filter((fav) => fav.tmdbId !== tmdbId));
  }, []);

  const value = useMemo(
    () => ({
      favorites,
      isLoading,
      isFavorite,
      getFavoriteId,
      addFavorite,
      removeFavorite,
      refreshFavorites: fetchFavorites,
    }),
    [favorites, isLoading, isFavorite, getFavoriteId, addFavorite, removeFavorite, fetchFavorites]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
