import { NextResponse } from 'next/server';
import { fetchTmdb } from '@/lib/tmdb.js';

/**
 * Search API Route
 * 
 * This API endpoint handles movie search requests from the frontend.
 * It integrates with The Movie Database (TMDB) API to provide real-time
 * movie search functionality.
 * 
 * Features:
 * - Query validation and sanitization
 * - TMDB API integration for movie search
 * - Error handling with appropriate HTTP status codes
 * - Adult content filtering for family-friendly results
 * 
 * @param {Request} request - The incoming HTTP request
 * @returns {NextResponse} JSON response with search results or error
 */
export async function GET(request) {
  // Extract search query from URL parameters
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  // Validate query parameter
  if (!query || query.trim().length < 1) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Search movies using TMDB API with adult content filtering
    const data = await fetchTmdb('/search/movie', { 
      query: query.trim(), 
      include_adult: false // Ensure family-friendly results
    });
    
    // Return search results, defaulting to empty array if no results
    return NextResponse.json({ results: data.results ?? [] });
  } catch (error) {
    // Handle errors with appropriate status codes
    const status = error.status ?? 500;
    return NextResponse.json({ 
      error: error.message || 'Search failed.' 
    }, { status });
  }
}
