-- =====================================================
-- MySpaceLove — FULL DATABASE SETUP
-- Copy paste ini ke Supabase SQL Editor lalu jalankan
-- =====================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 0. SYNC AUTH USERS → PUBLIC USERS (CRITICAL)
-- =====================================================
-- This trigger auto-creates a public.users row when
-- someone signs up via Supabase Auth

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, profile_image, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 1. USERS TABLE (UUID to match auth.uid())
-- =====================================================
DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    profile_image VARCHAR(255),
    username VARCHAR(255) UNIQUE,
    partner_code VARCHAR(255) UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
    auth_provider VARCHAR(32),
    provider_id VARCHAR(191),
    provider_avatar VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create user on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 2. THEMES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.themes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    primary_color VARCHAR(255) NOT NULL DEFAULT '#498386',
    secondary_color VARCHAR(255) NOT NULL DEFAULT '#CFCAB5',
    background_color VARCHAR(255) NOT NULL DEFAULT '#FFF7E2',
    font_family VARCHAR(255) NOT NULL DEFAULT 'Montserrat',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. SPACES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.spaces (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    invite_code VARCHAR(16) NOT NULL UNIQUE DEFAULT UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)),
    user_one_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    user_two_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    theme_id BIGINT REFERENCES public.themes(id) ON DELETE SET NULL,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_spaces_slug ON public.spaces(slug);
CREATE INDEX IF NOT EXISTS idx_spaces_user_one_id ON public.spaces(user_one_id);
CREATE INDEX IF NOT EXISTS idx_spaces_user_two_id ON public.spaces(user_two_id);
CREATE INDEX IF NOT EXISTS idx_spaces_invite_code ON public.spaces(invite_code);

-- =====================================================
-- 4. DAILY MESSAGES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.daily_messages (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    message TEXT NOT NULL,
    generated_by VARCHAR(10) NOT NULL DEFAULT 'ai',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT daily_messages_space_user_date_unique UNIQUE (space_id, user_id, date)
);

-- =====================================================
-- 5. TIMELINES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.timelines (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media VARCHAR(255),
    tag VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. COUNTDOWNS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.countdowns (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    event_name VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    description TEXT,
    image VARCHAR(255),
    activities JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. LOVE JOURNALS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.love_journals (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    mood VARCHAR(20) CHECK (mood IN ('happy', 'sad', 'miss', 'excited', 'grateful')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. SURPRISE NOTES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.surprise_notes (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    message TEXT NOT NULL,
    unlock_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. MEDIA GALLERIES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.media_galleries (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    file_path VARCHAR(255) NOT NULL,
    type VARCHAR(255),
    collection_key UUID,
    collection_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_galleries_collection_key ON public.media_galleries(collection_key);

-- =====================================================
-- 10. LOVE TIMELINES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.love_timelines (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
    space_id BIGINT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    media_path VARCHAR(255),
    media_paths JSONB,
    thumbnail_path VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 11. WISHLIST ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 12. DOCS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.docs (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    file_path VARCHAR(255) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 13. GAMES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.games (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    supports_multiplayer BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 14. GAME SCORES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.game_scores (
    id BIGSERIAL PRIMARY KEY,
    game_id BIGINT NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    space_id BIGINT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0),
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 15. SPACE GOALS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.space_goals (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_points INTEGER NOT NULL CHECK (target_points > 0),
    current_points INTEGER NOT NULL DEFAULT 0 CHECK (current_points >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    completed_at TIMESTAMPTZ,
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 16. GAME SESSIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id BIGSERIAL PRIMARY KEY,
    game_id BIGINT NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    space_id BIGINT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    created_by_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    current_turn_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(255) NOT NULL DEFAULT 'active',
    state JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT game_sessions_game_space_session_unique UNIQUE (game_id, space_id, session_id)
);

-- =====================================================
-- 17. SPOTIFY TOKENS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.spotify_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    space_id BIGINT REFERENCES public.spaces(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_in INTEGER NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    scope TEXT,
    token_type VARCHAR(255) NOT NULL DEFAULT 'Bearer',
    shared_playlist_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT spotify_tokens_user_space_unique UNIQUE (user_id, space_id)
);

-- =====================================================
-- 18. SPOTIFY SURPRISE DROPS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.spotify_surprise_drops (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    spotify_track_id VARCHAR(255) NOT NULL,
    track_name VARCHAR(255) NOT NULL,
    artists VARCHAR(255) NOT NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    note TEXT,
    curator_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 19. SPOTIFY CAPSULES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.spotify_capsules (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    spotify_track_id VARCHAR(255) NOT NULL,
    track_name VARCHAR(255) NOT NULL,
    artists VARCHAR(255) NOT NULL,
    moment VARCHAR(255),
    description TEXT,
    saved_at DATE,
    preview_url VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 20. MEMORY LANE CONFIGS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.memory_lane_configs (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL UNIQUE REFERENCES public.spaces(id) ON DELETE CASCADE,
    active_levels INTEGER NOT NULL DEFAULT 3,
    level_one_image VARCHAR(255),
    level_two_image VARCHAR(255),
    level_three_image VARCHAR(255),
    level_one_title VARCHAR(255),
    level_one_body TEXT,
    level_two_title VARCHAR(255),
    level_two_body TEXT,
    level_three_title VARCHAR(255),
    level_three_body TEXT,
    pin VARCHAR(255),
    content_set BOOLEAN NOT NULL DEFAULT FALSE,
    custom_rewards JSONB,
    flipbook_pages JSONB,
    flipbook_cover_image VARCHAR(255),
    flipbook_cover_title VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 21. LOCATIONS (shared locations for couples)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.shared_locations (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(255),
    category VARCHAR(50) CHECK (category IN ('restaurant', 'cafe', 'park', 'activity', 'travel', 'other')),
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 22. SPACE INVITATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.space_invitations (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    invitee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    invitee_email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
    source VARCHAR(20) NOT NULL DEFAULT 'email' CHECK (source IN ('email', 'join_request')),
    accepted_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_space_invitations_source ON public.space_invitations(source);
CREATE INDEX IF NOT EXISTS idx_space_invitations_space_status ON public.space_invitations(space_id, status, source);

-- =====================================================
-- 23. SPACE SEPARATION REQUESTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.space_separation_requests (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    initiator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    initiator_reason TEXT,
    partner_reason TEXT,
    initiator_confirmed_at TIMESTAMPTZ,
    partner_confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 24. NOBAR SCHEDULES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.nobar_schedules (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_for TIMESTAMPTZ NOT NULL,
    platform VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 25. NOTIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    space_id BIGINT REFERENCES public.spaces(id) ON DELETE CASCADE,
    type VARCHAR(255) NOT NULL,
    notifiable_type VARCHAR(255) NOT NULL,
    notifiable_id BIGINT NOT NULL,
    data JSONB,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_space_id ON notifications(space_id);

-- =====================================================
-- 26. LISTENING PLANS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.listening_plans (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMPTZ,
    spotify_playlist_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 27. MESSAGES (Chat)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    sender_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL DEFAULT 'text',
    body TEXT,
    meta_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_messages_space_created ON public.messages(space_id, created_at);

-- =====================================================
-- 28. MESSAGE READS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.message_reads (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT message_reads_message_user_unique UNIQUE (message_id, user_id)
);

-- =====================================================
-- 29. NOBAR PARTICIPANTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.nobar_participants (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    display_name VARCHAR(120),
    is_host BOOLEAN NOT NULL DEFAULT FALSE,
    audio_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    video_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    screen_sharing BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(40) NOT NULL DEFAULT 'online',
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT nobar_participants_space_user_unique UNIQUE (space_id, user_id)
);

-- =====================================================
-- 30. NOBAR SIGNALING MESSAGES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.nobar_signaling_messages (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    sender_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 31. ROOMS (per-space real-time room state)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.rooms (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL UNIQUE REFERENCES public.spaces(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    settings JSONB DEFAULT '{"background_music_url": null, "ambient_sound": null, "theme": "default", "font_size": "medium", "showActivity": true}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SEED DATA
-- =====================================================
INSERT INTO public.themes (name, primary_color, secondary_color, background_color, font_family) VALUES
('Romantic Pink', '#E91E63', '#F8BBD0', '#FFF0F5', 'Playfair Display'),
('Ocean Blue', '#1976D2', '#BBDEFB', '#E3F2FD', 'Roboto'),
('Forest Green', '#388E3C', '#C8E6C9', '#E8F5E9', 'Lato'),
('Sunset Orange', '#F57C00', '#FFE0B2', '#FFF3E0', 'Poppins'),
('Royal Purple', '#7B1FA2', '#E1BEE7', '#F3E5F5', 'Montserrat')
ON CONFLICT DO NOTHING;

INSERT INTO public.games (slug, name, description, is_enabled, supports_multiplayer) VALUES
('tetris', 'Tetris', 'Classic block-stacking game', TRUE, FALSE),
('snake', 'Snake', 'Classic snake game', TRUE, FALSE),
('memory', 'Memory', 'Card matching game', TRUE, FALSE),
('tic-tac-toe', 'Tic Tac Toe', 'Classic tic tac toe', TRUE, TRUE),
('2048', '2048', 'Number sliding puzzle', TRUE, FALSE),
('sudoku', 'Sudoku', 'Number puzzle', TRUE, FALSE)
ON CONFLICT DO NOTHING;

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DO $$ BEGIN
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_spaces_updated_at BEFORE UPDATE ON spaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_timelines_updated_at BEFORE UPDATE ON timelines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_countdowns_updated_at BEFORE UPDATE ON countdowns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_love_journals_updated_at BEFORE UPDATE ON love_journals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_surprise_notes_updated_at BEFORE UPDATE ON surprise_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_media_galleries_updated_at BEFORE UPDATE ON media_galleries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_love_timelines_updated_at BEFORE UPDATE ON love_timelines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_wishlist_items_updated_at BEFORE UPDATE ON wishlist_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_docs_updated_at BEFORE UPDATE ON docs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_game_scores_updated_at BEFORE UPDATE ON game_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_spotify_tokens_updated_at BEFORE UPDATE ON spotify_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_spotify_surprise_drops_updated_at BEFORE UPDATE ON spotify_surprise_drops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_spotify_capsules_updated_at BEFORE UPDATE ON spotify_capsules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE countdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE surprise_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spotify_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE spotify_surprise_drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE spotify_capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_lane_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_separation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE nobar_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE nobar_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE nobar_signaling_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE OR REPLACE FUNCTION public.is_user_in_space(space BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM spaces WHERE id = space
        AND (user_one_id = auth.uid() OR user_two_id = auth.uid())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- USERS policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view partner" ON users FOR SELECT USING (
    EXISTS (SELECT 1 FROM spaces WHERE (user_one_id = auth.uid() AND user_two_id = users.id) OR (user_two_id = auth.uid() AND user_one_id = users.id))
);

-- SPACES policies
CREATE POLICY "View own spaces" ON spaces FOR SELECT USING (user_one_id = auth.uid() OR user_two_id = auth.uid());
CREATE POLICY "View public spaces" ON spaces FOR SELECT USING (is_public = TRUE);
CREATE POLICY "Lookup space by invite code" ON spaces FOR SELECT USING (TRUE);
CREATE POLICY "Create spaces" ON spaces FOR INSERT WITH CHECK (user_one_id = auth.uid());
CREATE POLICY "Update own spaces" ON spaces FOR UPDATE USING (user_one_id = auth.uid() OR user_two_id = auth.uid());

-- THEMES (public read)
CREATE POLICY "Anyone can view themes" ON themes FOR SELECT USING (TRUE);

-- GAMES (public read)
CREATE POLICY "Anyone can view games" ON games FOR SELECT USING (TRUE);

-- TIMELINES
CREATE POLICY "View timelines in space" ON timelines FOR SELECT USING (is_user_in_space(space_id));
CREATE POLICY "Create timelines in space" ON timelines FOR INSERT WITH CHECK (user_id = auth.uid() AND is_user_in_space(space_id));
CREATE POLICY "Update own timelines" ON timelines FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Delete own timelines" ON timelines FOR DELETE USING (user_id = auth.uid());

-- DAILY MESSAGES
CREATE POLICY "View daily messages" ON daily_messages FOR SELECT USING (is_user_in_space(space_id));
CREATE POLICY "Users can insert daily messages in their space" ON daily_messages FOR INSERT WITH CHECK (user_id = auth.uid() AND is_user_in_space(space_id));

-- COUNTDOWNS
CREATE POLICY "View countdowns" ON countdowns FOR SELECT USING (is_user_in_space(space_id));
CREATE POLICY "Manage countdowns" ON countdowns FOR ALL USING (is_user_in_space(space_id));

-- LOVE JOURNALS
CREATE POLICY "View journals" ON love_journals FOR SELECT USING (is_user_in_space(space_id));
CREATE POLICY "Create journals" ON love_journals FOR INSERT WITH CHECK (user_id = auth.uid() AND is_user_in_space(space_id));
CREATE POLICY "Update own journals" ON love_journals FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Delete own journals" ON love_journals FOR DELETE USING (user_id = auth.uid());

-- SURPRISE NOTES
CREATE POLICY "View surprise notes" ON surprise_notes FOR SELECT USING (is_user_in_space(space_id));
CREATE POLICY "Create surprise notes" ON surprise_notes FOR INSERT WITH CHECK (user_id = auth.uid() AND is_user_in_space(space_id));

-- MEDIA GALLERIES
CREATE POLICY "View galleries" ON media_galleries FOR SELECT USING (is_user_in_space(space_id));
CREATE POLICY "Manage galleries" ON media_galleries FOR ALL USING (user_id = auth.uid() AND is_user_in_space(space_id));

-- LOVE TIMELINES
CREATE POLICY "View love timelines" ON love_timelines FOR SELECT USING (is_user_in_space(space_id));
CREATE POLICY "Manage love timelines" ON love_timelines FOR ALL USING (is_user_in_space(space_id));

-- WISHLIST
CREATE POLICY "View wishlist" ON wishlist_items FOR SELECT USING (is_user_in_space(space_id));
CREATE POLICY "Manage wishlist" ON wishlist_items FOR ALL USING (is_user_in_space(space_id));

-- DOCS
CREATE POLICY "View docs" ON docs FOR SELECT USING (is_user_in_space(space_id));
CREATE POLICY "Manage docs" ON docs FOR ALL USING (user_id = auth.uid() AND is_user_in_space(space_id));

-- GAME SCORES
CREATE POLICY "View scores" ON game_scores FOR SELECT USING (is_user_in_space(space_id));
CREATE POLICY "Create scores" ON game_scores FOR INSERT WITH CHECK (user_id = auth.uid() AND is_user_in_space(space_id));

-- SPACE GOALS
CREATE POLICY "View goals" ON space_goals FOR SELECT USING (is_user_in_space(space_id));
CREATE POLICY "Manage goals" ON space_goals FOR ALL USING (is_user_in_space(space_id));

-- GAME SESSIONS
CREATE POLICY "View sessions" ON game_sessions FOR SELECT USING (is_user_in_space(space_id));
CREATE POLICY "Manage sessions" ON game_sessions FOR ALL USING (is_user_in_space(space_id));

-- SPOTIFY TOKENS
CREATE POLICY "View own tokens" ON spotify_tokens FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Manage own tokens" ON spotify_tokens FOR ALL USING (user_id = auth.uid());

-- SPOTIFY DROPS
CREATE POLICY "View drops" ON spotify_surprise_drops FOR SELECT USING (is_user_in_space(space_id));
CREATE POLICY "Manage drops" ON spotify_surprise_drops FOR ALL USING (user_id = auth.uid() AND is_user_in_space(space_id));

-- SPOTIFY CAPSULES
CREATE POLICY "View capsules" ON spotify_capsules FOR SELECT USING (is_user_in_space(space_id));
CREATE POLICY "Manage capsules" ON spotify_capsules FOR ALL USING (user_id = auth.uid() AND is_user_in_space(space_id));

-- MEMORY LANE
CREATE POLICY "View memory lane" ON memory_lane_configs FOR SELECT USING (is_user_in_space(space_id));
CREATE POLICY "Manage memory lane" ON memory_lane_configs FOR ALL USING (is_user_in_space(space_id));

-- SHARED LOCATIONS
CREATE POLICY "View locations in space" ON shared_locations FOR SELECT USING (is_user_in_space(space_id));
CREATE POLICY "Manage locations" ON shared_locations FOR ALL USING (user_id = auth.uid() AND is_user_in_space(space_id));

-- INVITATIONS
CREATE POLICY "View sent invitations" ON space_invitations FOR SELECT USING (inviter_id = auth.uid());
CREATE POLICY "View received invitations" ON space_invitations FOR SELECT USING (invitee_id = auth.uid());
CREATE POLICY "Create invitations" ON space_invitations FOR INSERT WITH CHECK (
    inviter_id = auth.uid() 
    AND (
        -- Email invitations: user must be in the space
        (source = 'email' AND is_user_in_space(space_id))
        OR
        -- Join requests: user is the invitee requesting to join
        (source = 'join_request' AND invitee_id = auth.uid())
    )
);
CREATE POLICY "Update invitation status" ON space_invitations FOR UPDATE USING (
    -- Space owner can approve/reject join requests
    (source = 'join_request' AND EXISTS (
        SELECT 1 FROM spaces WHERE spaces.id = space_invitations.space_id AND spaces.user_one_id = auth.uid()
    ))
    OR
    -- Inviter can cancel email invitations
    (inviter_id = auth.uid())
    OR
    -- Invitee can update their own invitation status
    (invitee_id = auth.uid())
);

-- SEPARATION REQUESTS
CREATE POLICY "View separation requests" ON space_separation_requests FOR SELECT USING (initiator_id = auth.uid() OR partner_id = auth.uid());
CREATE POLICY "Create separation requests" ON space_separation_requests FOR INSERT WITH CHECK (initiator_id = auth.uid());
CREATE POLICY "Update separation requests" ON space_separation_requests FOR UPDATE USING (partner_id = auth.uid());

-- NOBAR
CREATE POLICY "View nobar schedules" ON nobar_schedules FOR SELECT USING (is_user_in_space(space_id));
CREATE POLICY "Manage nobar schedules" ON nobar_schedules FOR ALL USING (is_user_in_space(space_id));

-- NOTIFICATIONS
CREATE POLICY "View own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can create own notifications" ON notifications FOR INSERT WITH CHECK (user_id = auth.uid());

-- LISTENING PLANS
CREATE POLICY "View listening plans" ON listening_plans FOR SELECT USING (is_user_in_space(space_id));
CREATE POLICY "Manage listening plans" ON listening_plans FOR ALL USING (user_id = auth.uid() AND is_user_in_space(space_id));

-- MESSAGES
CREATE POLICY "View messages" ON messages FOR SELECT USING (is_user_in_space(space_id));
CREATE POLICY "Send messages" ON messages FOR INSERT WITH CHECK (sender_user_id = auth.uid() AND is_user_in_space(space_id));
CREATE POLICY "Delete own messages" ON messages FOR DELETE USING (sender_user_id = auth.uid());

-- MESSAGE READS
CREATE POLICY "View message reads" ON message_reads FOR SELECT USING (
    EXISTS (SELECT 1 FROM messages m JOIN spaces s ON s.id = m.space_id WHERE m.id = message_reads.message_id AND (s.user_one_id = auth.uid() OR s.user_two_id = auth.uid()))
);
CREATE POLICY "Mark as read" ON message_reads FOR INSERT WITH CHECK (user_id = auth.uid());

-- NOBAR PARTICIPANTS
CREATE POLICY "View nobar participants" ON nobar_participants FOR SELECT USING (is_user_in_space(space_id));
CREATE POLICY "Manage nobar participation" ON nobar_participants FOR ALL USING (user_id = auth.uid());

-- NOBAR SIGNALING
CREATE POLICY "View signaling" ON nobar_signaling_messages FOR SELECT USING (is_user_in_space(space_id));
CREATE POLICY "Send signaling" ON nobar_signaling_messages FOR INSERT WITH CHECK (sender_user_id = auth.uid() AND is_user_in_space(space_id));

-- ROOMS
CREATE POLICY "View room in space" ON rooms FOR SELECT USING (is_user_in_space(space_id));
CREATE POLICY "Manage room in space" ON rooms FOR ALL USING (is_user_in_space(space_id));

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
    ('avatars', 'avatars', true, 5242880, '{image/jpeg,image/png,image/webp,image/gif}'),
    ('spaces', 'spaces', false, 52428800, '{image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm}'),
    ('galleries', 'galleries', false, 52428800, '{image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm}'),
    ('documents', 'documents', false, 10485760, '{application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain}'),
    ('love-timelines', 'love-timelines', false, 52428800, '{image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm}'),
    ('memory-lane', 'memory-lane', false, 52428800, '{image/jpeg,image/png,image/webp,image/gif}')
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Avatar public access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Avatar upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Avatar delete own" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Space files view" ON storage.objects FOR SELECT USING (bucket_id = 'spaces' AND is_user_in_space((storage.foldername(name))[1]::bigint));
CREATE POLICY "Space files upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'spaces' AND is_user_in_space((storage.foldername(name))[1]::bigint));
CREATE POLICY "Space files delete" ON storage.objects FOR DELETE USING (bucket_id = 'spaces' AND is_user_in_space((storage.foldername(name))[1]::bigint));

CREATE POLICY "Gallery view" ON storage.objects FOR SELECT USING (bucket_id = 'galleries' AND is_user_in_space((storage.foldername(name))[1]::bigint));
CREATE POLICY "Gallery upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'galleries' AND is_user_in_space((storage.foldername(name))[1]::bigint));

CREATE POLICY "Docs view" ON storage.objects FOR SELECT USING (bucket_id = 'documents' AND is_user_in_space((storage.foldername(name))[1]::bigint));
CREATE POLICY "Docs upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND is_user_in_space((storage.foldername(name))[1]::bigint));

CREATE POLICY "Timeline view" ON storage.objects FOR SELECT USING (bucket_id = 'love-timelines' AND is_user_in_space((storage.foldername(name))[1]::bigint));
CREATE POLICY "Timeline upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'love-timelines' AND is_user_in_space((storage.foldername(name))[1]::bigint));

CREATE POLICY "Memory view" ON storage.objects FOR SELECT USING (bucket_id = 'memory-lane' AND is_user_in_space((storage.foldername(name))[1]::bigint));
CREATE POLICY "Memory upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'memory-lane' AND is_user_in_space((storage.foldername(name))[1]::bigint));

-- =====================================================
-- ENABLE REALTIME for messages
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE nobar_signaling_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
