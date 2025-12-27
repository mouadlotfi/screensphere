import type { ErrorWithStatus } from './types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

/**
 * Revalidation time for different content types
 * - Popular/Trending: Changes frequently, shorter cache
 * - Movie details: Changes rarely, longer cache
 * - Search: Real-time, no caching
 */
export const CACHE_TIMES = {
  POPULAR: 5 * 60, // 5 minutes
  TRENDING: 5 * 60, // 5 minutes
  TOP_RATED: 30 * 60, // 30 minutes
  UPCOMING: 30 * 60, // 30 minutes
  MOVIE_DETAILS: 60 * 60, // 1 hour
  SEARCH: 0, // No caching for search
} as const;

interface SearchParams {
  [key: string]: string | number | undefined | null;
}

const buildUrl = (path: string, searchParams: SearchParams = {}): URL => {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error('TMDB_API_KEY environment variable is not set.');
  }
  url.searchParams.set('api_key', apiKey);
  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === 'undefined' || value === null || value === '') {
      return;
    }
    url.searchParams.set(key, String(value));
  });
  return url;
};

/**
 * Fetch data from TMDB API with configurable caching
 * @param path - API endpoint path
 * @param searchParams - Query parameters
 * @param revalidate - Cache revalidation time in seconds (default: 60)
 */
export const fetchTmdb = async <T>(
  path: string,
  searchParams: SearchParams = {},
  revalidate: number = 60
): Promise<T> => {
  const url = buildUrl(path, searchParams);
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
    next: { revalidate },
  });

  if (!response.ok) {
    const error = new Error('Failed to communicate with TMDB') as ErrorWithStatus;
    error.status = response.status;
    throw error;
  }

  return response.json();
};
