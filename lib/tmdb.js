const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const buildUrl = (path, searchParams = {}) => {
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
    url.searchParams.set(key, value);
  });
  return url;
};

export const fetchTmdb = async (path, searchParams = {}) => {
  const url = buildUrl(path, searchParams);
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const error = new Error('Failed to communicate with TMDB');
    error.status = response.status;
    throw error;
  }

  return response.json();
};
