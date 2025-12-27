# ScreenSphere

A modern movie discovery platform built with Next.js 16, React 19, Supabase, and the TMDB API.

## Features

- **Movie Discovery** - Browse trending, popular, top-rated, and upcoming movies
- **Search** - Real-time search with debouncing and instant results
- **Favorites** - Save movies to your personal collection
- **Authentication** - Secure email/password auth with Supabase
- **Responsive** - Mobile-first dark theme design
- **PWA Ready** - Installable progressive web app with service worker

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TailwindCSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| API | TMDB API |
| Language | TypeScript |
| Runtime | Bun |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh)
- [TMDB API Key](https://www.themoviedb.org/settings/api)
- [Supabase Project](https://supabase.com)

### Installation

```bash
git clone https://github.com/mouadlotfi/screensphere.git
cd screensphere
bun install
```

### Environment Variables

Create `.env.local` in the project root:

```env
TMDB_API_KEY=your_tmdb_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Setup

Copy the contents of [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) and run it in the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql).

This creates:
- `profiles` table with RLS policies
- `favorites` table with RLS policies  
- Auto-create profile trigger on user signup
- Auto-update `updated_at` timestamps

### Run Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000)

## Docker

```bash
docker-compose up --build
```

## Project Structure

```
screensphere/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Auth callback handlers
│   ├── genre/[genre]/     # Genre pages (popular, trending, etc.)
│   ├── movie/[movieId]/   # Movie details page
│   └── ...                # Other pages (sign-in, sign-up, settings)
├── components/            # React components
│   ├── Main.tsx          # Hero slider
│   ├── Movie.tsx         # Movie card
│   ├── Navbar.tsx        # Navigation with search
│   ├── Row.tsx           # Horizontal movie row
│   └── ...
├── context/              # React context providers
│   ├── AuthContext.tsx   # Authentication state
│   └── FavoritesContext.tsx
├── lib/                  # Utilities and configurations
│   ├── supabase/        # Supabase client setup
│   ├── types.ts         # Shared TypeScript types
│   ├── tmdb.ts          # TMDB API client
│   └── ...
├── supabase/            # Database migrations
│   └── migrations/
└── public/              # Static assets
```

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/movies/popular` | GET | Popular movies |
| `/api/movies/trending` | GET | Trending movies |
| `/api/movies/upcoming` | GET | Upcoming releases |
| `/api/movies/top_rated` | GET | Top rated movies |
| `/api/movie/[id]` | GET | Movie details |
| `/api/search?q=` | GET | Search movies |
| `/api/add-to-favorites` | POST | Add to favorites |
| `/api/movies` | GET | User's saved movies |

## Scripts

```bash
bun dev      # Start development server
bun build    # Build for production
bun start    # Start production server
bun lint     # Run ESLint
```

## License

[GNU General Public License](LICENSE)
