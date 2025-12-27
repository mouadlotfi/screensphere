/**
 * Shared TypeScript types for the ScreenSphere application
 */

/**
 * Extended Error interface with optional HTTP status code
 * Used for API error handling across the application
 */
export interface ErrorWithStatus extends Error {
  status?: number;
}

/**
 * Favorite movie stored in the database
 */
export interface Favorite {
  id: string;
  tmdbId: number;
  title: string;
  posterPath?: string;
  overview?: string;
  releaseDate?: string;
}

/**
 * User object returned from authentication
 */
export interface User {
  id: string;
  email: string | null;
  name: string;
  metadata?: Record<string, unknown>;
}

/**
 * Base movie data from TMDB API responses
 * Used across components for displaying movie information
 */
export interface Movie {
  id: number;
  title?: string;
  original_title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  release_date?: string;
  vote_average?: number;
}

/**
 * Extended movie item with additional fields for various data sources
 * Supports both TMDB API responses and saved favorites from database
 */
export interface MovieItem extends Movie {
  // Alternative field names from different data sources
  posterPath?: string;
  backdropPath?: string;
  img?: string;
  image?: string;
  poster?: string;
  // Database-specific fields
  tmdb_id?: number;
  tmdbId?: number;
}

/**
 * Detailed movie data including genres, production info, and videos
 * Used on the movie details page
 */
export interface MovieDetails extends Movie {
  status?: string;
  runtime?: number;
  original_language?: string;
  genres?: Genre[];
  production_companies?: ProductionCompany[];
  videos?: Videos;
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
}

export interface Video {
  id: string;
  key: string;
  type: string;
}

export interface Videos {
  results: Video[];
}

/**
 * Standard paginated response from TMDB API
 */
export interface MoviesResponse {
  results: Movie[];
  total_pages?: number;
  page?: number;
  total_results?: number;
}
