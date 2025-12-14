'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import { FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext.jsx';

/**
 * Navbar Component
 * 
 * This is the main navigation component for the ScreenSphere application.
 * It provides:
 * - Responsive navigation with mobile hamburger menu
 * - Real-time movie search with debounced API calls
 * - User authentication state management
 * - Dynamic navigation based on user login status
 * 
 * Features:
 * - Desktop and mobile responsive design
 * - Search functionality with TMDB API integration
 * - Debounced search to prevent excessive API calls
 * - Click-outside detection to close search results
 * - Automatic menu closure on navigation
 */

// Configuration constants
const SEARCH_DEBOUNCE_MS = 300; // Debounce delay for search input

// CSS class definitions for consistent styling across desktop and mobile
const desktopLinkClass =
  'text-sm font-heading font-medium transition hover:text-cyan-300';

const mobileLinkClass =
  'w-full rounded-lg px-3 py-2 text-center text-sm font-heading font-semibold text-white transition hover:bg-white/10';

const desktopPrimaryButtonClass =
  'inline-flex h-10 items-center justify-center rounded-full bg-cyan-600 px-4 text-sm font-heading font-semibold leading-none text-black transition hover:bg-cyan-500';

const mobilePrimaryButtonClass =
  'w-full h-12 inline-flex items-center justify-center rounded-lg bg-cyan-600 text-center text-sm font-heading font-semibold leading-none text-black transition hover:bg-cyan-500';

const mobileSecondaryButtonClass =
  'w-full h-12 inline-flex items-center justify-center rounded-lg border border-cyan-500/40 text-center text-sm font-heading font-semibold leading-none text-cyan-200 transition hover:bg-cyan-500/10';

export default function Navbar() {
  // Authentication context and routing
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // Search state management
  const [searchInput, setSearchInput] = useState(''); // Current search input value
  const [searchResults, setSearchResults] = useState([]); // Array of search results from TMDB
  const [isSearching, setIsSearching] = useState(false); // Loading state for search
  const [searchMessage, setSearchMessage] = useState(''); // User feedback messages
  
  // Mobile menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Refs for DOM manipulation and cleanup
  const resultsContainerRef = useRef(null); // Reference to search results container
  const debounceRef = useRef(null); // Reference for debounce timeout
  const requestControllerRef = useRef(null); // Reference for aborting API requests

  // Effect: Handle click outside search results to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsContainerRef.current && !resultsContainerRef.current.contains(event.target)) {
        setSearchInput('');
        setSearchResults([]);
        setSearchMessage('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Effect: Close mobile menu when user changes or navigates
  useEffect(() => {
    setIsMenuOpen(false);
  }, [user, pathname]);

  // Effect: Close mobile menu on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) setIsMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effect: Handle search input with debouncing and API calls
  useEffect(() => {
    const trimmedQuery = searchInput.trim();

    // Clear search if input is empty
    if (!trimmedQuery) {
      if (requestControllerRef.current) requestControllerRef.current.abort();
      setSearchResults([]);
      setIsSearching(false);
      setSearchMessage('');
      return;
    }

    // Require minimum 3 characters for search
    if (trimmedQuery.length < 3) {
      if (requestControllerRef.current) requestControllerRef.current.abort();
      setSearchResults([]);
      setIsSearching(false);
      setSearchMessage('Type at least three characters to search');
      return;
    }

    // Set loading state and clear previous debounce
    setIsSearching(true);
    setSearchMessage('');
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Debounced search execution
    debounceRef.current = setTimeout(async () => {
      // Abort any previous request
      if (requestControllerRef.current) requestControllerRef.current.abort();

      // Create new abort controller for this request
      const controller = new AbortController();
      requestControllerRef.current = controller;

      try {
        // Make API call to search endpoint
        const response = await axios.get('/api/search', {
          params: { q: trimmedQuery },
          signal: controller.signal,
        });

        // Process and set results
        const results = response.data?.results ?? [];
        if (results.length === 0) setSearchMessage('No matches found');
        setSearchResults(results);
      } catch (error) {
        // Handle cancellation gracefully (user typed more)
        if (axios.isCancel?.(error) || error.code === 'ERR_CANCELED' || error.name === 'CanceledError') return;
        setSearchMessage("We couldn't search right now. Please try again.");
      } finally {
        setIsSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    // Cleanup function
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (requestControllerRef.current) requestControllerRef.current.abort();
    };
  }, [searchInput]);

  // Handler: User logout with error handling
  const handleLogOut = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Handler: Clear search when a result is selected
  const handleResultSelect = () => {
    setSearchInput('');
    setSearchResults([]);
    setSearchMessage('');
    setIsMenuOpen(false);
  };

  // Handler: Toggle mobile menu visibility
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  // Render navigation actions based on user authentication state and device type
  const renderActions = (isMobile = false) => {
    const linkClass = isMobile ? mobileLinkClass : desktopLinkClass;
    const primaryButtonClass = isMobile ? mobilePrimaryButtonClass : desktopPrimaryButtonClass;

    // Render authenticated user actions
    if (user) {
      return (
        <>
          <Link href="/account" className={linkClass} onClick={() => setIsMenuOpen(false)}>
            Favorites
          </Link>
          <Link href="/settings" className={linkClass} onClick={() => setIsMenuOpen(false)}>
            Account
          </Link>
          {/* Logout button inherits fixed height + centering on mobile */}
          <button type="button" onClick={handleLogOut} className={primaryButtonClass}>
            Logout
          </button>
        </>
      );
    }

    // Render unauthenticated user actions
    return (
      <>
        <Link href="/sign-in" className={isMobile ? mobileSecondaryButtonClass : desktopPrimaryButtonClass} onClick={() => setIsMenuOpen(false)}>
          Sign In
        </Link>
        <Link href="/sign-up" className={primaryButtonClass} onClick={() => setIsMenuOpen(false)}>
          Sign Up
        </Link>
      </>
    );
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3 text-white sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <span className="bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-xl font-display font-bold tracking-tight text-transparent sm:text-2xl lg:text-3xl">
              ScreenSphere
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-8 lg:flex lg:ml-12">
            <Link href="/" className="text-sm font-heading font-medium text-white/80 transition hover:text-cyan-300">Home</Link>
            <Link href="/genre/popular" className="text-sm font-heading font-medium text-white/80 transition hover:text-cyan-300">Popular</Link>
            <Link href="/genre/trending" className="text-sm font-heading font-medium text-white/80 transition hover:text-cyan-300">Trending</Link>
            <Link href="/genre/upcoming" className="text-sm font-heading font-medium text-white/80 transition hover:text-cyan-300">Upcoming</Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden flex-1 max-w-md mx-6 lg:block">
            <div ref={resultsContainerRef} className="relative">
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search movies..."
                className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-sans text-white placeholder:text-white/50 transition focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
              />
              {(searchResults.length > 0 || searchMessage) && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-white/10 bg-neutral-900/95 p-3 shadow-xl backdrop-blur-sm">
                  {isSearching ? (
                    <p className="py-2 text-sm text-white/70">Searching…</p>
                  ) : searchResults.length === 0 ? (
                    <p className="py-2 text-sm text-white/70">{searchMessage}</p>
                  ) : (
                    <ul className="space-y-2">
                      {searchResults.map((result) => {
                        // Extract movie title and release year for display
                        const title = result.title || result.name || 'Untitled';
                        const releaseYear = result.release_date ? 
                          new Date(result.release_date).getFullYear() : 
                          null;
                        
                        // Format display text with year if available
                        const displayText = releaseYear ? 
                          `${title} (${releaseYear})` : 
                          title;
                        
                        return (
                          <li key={result.id}>
                            <Link
                              href={`/movie/${result.id}`}
                              onClick={handleResultSelect}
                              className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                            >
                              {displayText}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-4 lg:flex">{renderActions(false)}</div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={toggleMenu}
            className="flex items-center rounded-lg border border-white/20 p-2.5 text-white transition hover:border-cyan-400 hover:text-cyan-300 active:scale-95 touch-manipulation lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mt-4 space-y-4 lg:hidden">
            {/* Mobile Search */}
            <div className="px-2">
              <div ref={resultsContainerRef} className="relative">
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search movies..."
                  className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-sans text-white placeholder:text-white/50 transition focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <div className="flex flex-col space-y-2 px-2">
              <Link href="/" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link href="/genre/popular" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Popular</Link>
              <Link href="/genre/trending" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Trending</Link>
              <Link href="/genre/upcoming" className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>Upcoming</Link>
            </div>

            <div className="h-px bg-white/10" />

            <div className="flex flex-col space-y-3 px-2">{renderActions(true)}</div>
          </div>
        )}
      </div>
    </nav>
  );
}