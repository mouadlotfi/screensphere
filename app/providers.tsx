'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import AuthHashHandler from '@/components/AuthHashHandler';
import ToastProvider from '@/components/ToastProvider';
import ErrorBoundary from '@/components/ErrorBoundary';

/**
 * Optimized React Query configuration
 * - Stale time: 5 minutes for movie data (rarely changes)
 * - GC time: 30 minutes to keep data in cache longer
 * - Retry: 2 attempts with exponential backoff
 * - Refetch on window focus disabled for better UX
 */
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 1,
      },
    },
  });

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <FavoritesProvider>
            <AuthHashHandler />
            {children}
            <ToastProvider />
          </FavoritesProvider>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
