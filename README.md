# 🎬 ScreenSphere 

A modern movie discovery and favorites platform built with Next.js 15, Supabase, and TMDB API.

## ✨ Features

- 🎭 **Movie Discovery**: Browse trending, popular, and upcoming movies
- 🔍 **Real-time Search**: Search movies with instant results and release years
- ❤️ **Favorites System**: Save and manage your favorite movies
- 👤 **User Authentication**: Secure sign-up/sign-in with email confirmation
- 📱 **Responsive Design**: Beautiful dark theme that works on all devices
- 🐳 **Docker Ready**: One-command deployment with Docker Compose

## 🚀 Quick Start

### Prerequisites
- Node.js 18.17+
- TMDB API key ([Get one here](https://www.themoviedb.org/settings/api))
- Supabase project ([Create one here](https://supabase.com))

### 1. Clone and Install
```bash
git clone https://github.com/arfadex/screensphere.git
cd screensphere
npm install
```

### 2. Environment Setup
Create `.env.local`:
```bash
TMDB_API_KEY=your_tmdb_api_key_here
AUTH_SECRET=your_auth_secret
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 3. Database Setup
Run this SQL in your Supabase SQL Editor:
```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create trigger function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create favorites table (for app functionality)
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tmdb_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  overview TEXT NOT NULL DEFAULT '',
  release_date TEXT NOT NULL DEFAULT '1900-01-01',
  poster_path TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tmdb_id)
);

-- Indexes for favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_tmdb_id ON public.favorites(tmdb_id);

-- Enable RLS on favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for favorites
CREATE POLICY "Users can manage their own favorites"
  ON public.favorites
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_favorites_updated_at
  BEFORE UPDATE ON public.favorites
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

### 4. Run the App
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000)

## 🐳 Docker Deployment

```bash
# Quick start with Docker
docker-compose up --build

# Access at http://localhost:3000
```

## 📄 License

This project is licensed under the GNU General Public License.

---

**⭐ Star this repository if you found it helpful!**
