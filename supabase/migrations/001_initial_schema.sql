-- =====================================================
-- MySpaceLove Database Schema for Supabase (PostgreSQL)
-- Converted from Laravel MySQL Migrations
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    profile_image VARCHAR(255),
    email_verified_at TIMESTAMPTZ,
    tour_completed_at TIMESTAMPTZ,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    partner_code VARCHAR(255),
    auth_provider VARCHAR(32),
    provider_id VARCHAR(191),
    provider_avatar VARCHAR(255),
    remember_token VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT users_auth_provider_provider_id_unique UNIQUE (auth_provider, provider_id)
);

CREATE INDEX idx_users_profile_image ON users(profile_image);
CREATE INDEX idx_users_auth_provider ON users(auth_provider);

-- =====================================================
-- 2. THEMES TABLE
-- =====================================================
CREATE TABLE themes (
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
-- 3. SPACES TABLE (Central Hub)
-- =====================================================
CREATE TABLE spaces (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    user_one_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_two_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    theme_id BIGINT REFERENCES themes(id) ON DELETE SET NULL,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_spaces_slug ON spaces(slug);
CREATE INDEX idx_spaces_user_one_id ON spaces(user_one_id);
CREATE INDEX idx_spaces_user_two_id ON spaces(user_two_id);

-- =====================================================
-- 4. DAILY MESSAGES TABLE
-- =====================================================
CREATE TABLE daily_messages (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    message TEXT NOT NULL,
    generated_by VARCHAR(10) NOT NULL DEFAULT 'ai' CHECK (generated_by IN ('ai', 'manual', 'fallback')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT daily_messages_space_user_date_unique UNIQUE (space_id, user_id, date)
);

CREATE INDEX idx_daily_messages_space_date ON daily_messages(space_id, date);

-- =====================================================
-- 5. TIMELINES TABLE
-- =====================================================
CREATE TABLE timelines (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media VARCHAR(255),
    tag VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. COUNTDOWNS TABLE
-- =====================================================
CREATE TABLE countdowns (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    event_name VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    description TEXT,
    image VARCHAR(255),
    activities JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_countdowns_image ON countdowns(image);
CREATE INDEX idx_countdowns_space_event_date ON countdowns(space_id, event_date);

-- =====================================================
-- 7. LOVE JOURNALS TABLE
-- =====================================================
CREATE TABLE love_journals (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    mood VARCHAR(20) CHECK (mood IN ('happy', 'sad', 'miss', 'excited', 'grateful')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_love_journals_space_id ON love_journals(space_id);

-- =====================================================
-- 8. SURPRISE NOTES TABLE
-- =====================================================
CREATE TABLE surprise_notes (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    message TEXT NOT NULL,
    unlock_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_surprise_notes_space_id ON surprise_notes(space_id);

-- =====================================================
-- 9. MEDIA GALLERIES TABLE
-- =====================================================
CREATE TABLE media_galleries (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    file_path VARCHAR(255) NOT NULL,
    type VARCHAR(255),
    collection_key UUID,
    collection_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_galleries_space_id ON media_galleries(space_id);
CREATE INDEX idx_media_galleries_file_path ON media_galleries(file_path);
CREATE INDEX idx_media_galleries_collection_key ON media_galleries(collection_key);
CREATE INDEX idx_media_galleries_collection_key_index ON media_galleries(collection_key, collection_index);
CREATE INDEX idx_media_galleries_space_created ON media_galleries(space_id, created_at);

-- =====================================================
-- 10. LOVE TIMELINES TABLE
-- =====================================================
CREATE TABLE love_timelines (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
    space_id BIGINT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    media_path VARCHAR(255),
    media_paths JSONB,
    thumbnail_path VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_love_timelines_space_id ON love_timelines(space_id);
CREATE INDEX idx_love_timelines_date ON love_timelines(date);
CREATE INDEX idx_love_timelines_space_created ON love_timelines(space_id, created_at);

-- =====================================================
-- 11. WISHLIST ITEMS TABLE
-- =====================================================
CREATE TABLE wishlist_items (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wishlist_items_space_id ON wishlist_items(space_id);

-- =====================================================
-- 12. DOCS TABLE
-- =====================================================
CREATE TABLE docs (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    file_path VARCHAR(255) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_docs_space_id ON docs(space_id);
CREATE INDEX idx_docs_file_path ON docs(file_path);

-- =====================================================
-- 13. GAMES TABLE
-- =====================================================
CREATE TABLE games (
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
-- 14. GAME SCORES TABLE
-- =====================================================
CREATE TABLE game_scores (
    id BIGSERIAL PRIMARY KEY,
    game_id BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    space_id BIGINT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0),
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_game_scores_user_id ON game_scores(user_id);
CREATE INDEX idx_game_scores_game_id ON game_scores(game_id);
CREATE INDEX idx_game_scores_space_game ON game_scores(space_id, game_id);
CREATE INDEX idx_game_scores_space_game_created ON game_scores(space_id, game_id, created_at);

-- =====================================================
-- 15. SPACE GOALS TABLE
-- =====================================================
CREATE TABLE space_goals (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
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

CREATE INDEX idx_space_goals_space_id ON space_goals(space_id);
CREATE INDEX idx_space_goals_space_active ON space_goals(space_id, is_active);
CREATE INDEX idx_space_goals_completed_at ON space_goals(completed_at);

-- =====================================================
-- 16. GAME SESSIONS TABLE
-- =====================================================
CREATE TABLE game_sessions (
    id BIGSERIAL PRIMARY KEY,
    game_id BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    space_id BIGINT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    created_by_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_turn_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(255) NOT NULL DEFAULT 'active',
    state JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT game_sessions_game_space_session_unique UNIQUE (game_id, space_id, session_id)
);

CREATE INDEX idx_game_sessions_space_game ON game_sessions(space_id, game_id);
CREATE INDEX idx_game_sessions_game_id ON game_sessions(game_id);
CREATE INDEX idx_game_sessions_status ON game_sessions(status);

-- =====================================================
-- 17. SPOTIFY TOKENS TABLE
-- =====================================================
CREATE TABLE spotify_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    space_id BIGINT REFERENCES spaces(id) ON DELETE CASCADE,
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
-- 18. SPOTIFY SURPRISE DROPS TABLE
-- =====================================================
CREATE TABLE spotify_surprise_drops (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    spotify_track_id VARCHAR(255) NOT NULL,
    track_name VARCHAR(255) NOT NULL,
    artists VARCHAR(255) NOT NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    note TEXT,
    curator_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_spotify_surprise_drops_space_scheduled ON spotify_surprise_drops(space_id, scheduled_for);

-- =====================================================
-- 19. SPOTIFY CAPSULES TABLE
-- =====================================================
CREATE TABLE spotify_capsules (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

CREATE INDEX idx_spotify_capsules_space_saved ON spotify_capsules(space_id, saved_at);

-- =====================================================
-- 20. MEMORY LANE CONFIGS TABLE
-- =====================================================
CREATE TABLE memory_lane_configs (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL UNIQUE REFERENCES spaces(id) ON DELETE CASCADE,
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
-- 21. LOCATIONS TABLE
-- =====================================================
CREATE TABLE locations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 22. SPACE INVITATIONS TABLE
-- =====================================================
CREATE TABLE space_invitations (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    inviter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invitee_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    invitee_email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
    accepted_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_space_invitations_space_id ON space_invitations(space_id);
CREATE INDEX idx_space_invitations_invitee_id ON space_invitations(invitee_id);
CREATE INDEX idx_space_invitations_invitee_email ON space_invitations(invitee_email);
CREATE INDEX idx_space_invitations_status ON space_invitations(status);

-- =====================================================
-- 23. SPACE SEPARATION REQUESTS TABLE
-- =====================================================
CREATE TABLE space_separation_requests (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    initiator_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    partner_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
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
-- 24. NOBAR SCHEDULES TABLE
-- =====================================================
CREATE TABLE nobar_schedules (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_for TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 25. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(255) NOT NULL,
    notifiable_type VARCHAR(255) NOT NULL,
    notifiable_id BIGINT NOT NULL,
    data TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_read_at ON notifications(read_at);

-- =====================================================
-- 26. LISTENING PLANS TABLE
-- =====================================================
CREATE TABLE listening_plans (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMPTZ,
    spotify_playlist_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 27. MESSAGES TABLE
-- =====================================================
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    sender_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL DEFAULT 'text',
    body TEXT,
    meta_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_space_id ON messages(space_id);
CREATE INDEX idx_messages_space_created ON messages(space_id, created_at);
CREATE INDEX idx_messages_space_sender ON messages(space_id, sender_user_id);

-- =====================================================
-- 28. MESSAGE READS TABLE
-- =====================================================
CREATE TABLE message_reads (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT message_reads_message_user_unique UNIQUE (message_id, user_id)
);

CREATE INDEX idx_message_reads_message_id ON message_reads(message_id);
CREATE INDEX idx_message_reads_user_id ON message_reads(user_id);
CREATE INDEX idx_message_reads_user_read_at ON message_reads(user_id, read_at);

-- =====================================================
-- 29. NOBAR PARTICIPANTS TABLE
-- =====================================================
CREATE TABLE nobar_participants (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

CREATE INDEX idx_nobar_participants_space_last_seen ON nobar_participants(space_id, last_seen_at);

-- =====================================================
-- 30. NOBAR SIGNALING MESSAGES TABLE
-- =====================================================
CREATE TABLE nobar_signaling_messages (
    id BIGSERIAL PRIMARY KEY,
    space_id BIGINT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    sender_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_nobar_signaling_space_id ON nobar_signaling_messages(space_id, id);
CREATE INDEX idx_nobar_signaling_space_created ON nobar_signaling_messages(space_id, created_at);

-- =====================================================
-- SEED DATA: Default Themes
-- =====================================================
INSERT INTO themes (name, primary_color, secondary_color, background_color, font_family) VALUES
('Romantic Pink', '#E91E63', '#F8BBD0', '#FFF0F5', 'Playfair Display'),
('Ocean Blue', '#1976D2', '#BBDEFB', '#E3F2FD', 'Roboto'),
('Forest Green', '#388E3C', '#C8E6C9', '#E8F5E9', 'Lato'),
('Sunset Orange', '#F57C00', '#FFE0B2', '#FFF3E0', 'Poppins'),
('Royal Purple', '#7B1FA2', '#E1BEE7', '#F3E5F5', 'Montserrat');

-- =====================================================
-- SEED DATA: Default Games
-- =====================================================
INSERT INTO games (slug, name, description, is_enabled, supports_multiplayer) VALUES
('tetris', 'Tetris', 'Classic block-stacking game', TRUE, FALSE),
('snake', 'Snake', 'Classic snake game', TRUE, FALSE),
('tetris-online', 'Tetris Online', 'Multiplayer Tetris', TRUE, TRUE),
('snake-online', 'Snake Online', 'Multiplayer Snake', TRUE, TRUE),
('slither', 'Slither', 'Snake battle royale', TRUE, TRUE),
('space-invaders', 'Space Invaders', 'Classic arcade shooter', TRUE, FALSE),
('memory', 'Memory', 'Card matching game', TRUE, FALSE);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spaces_updated_at BEFORE UPDATE ON spaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_messages_updated_at BEFORE UPDATE ON daily_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timelines_updated_at BEFORE UPDATE ON timelines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_countdowns_updated_at BEFORE UPDATE ON countdowns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_love_journals_updated_at BEFORE UPDATE ON love_journals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_surprise_notes_updated_at BEFORE UPDATE ON surprise_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_galleries_updated_at BEFORE UPDATE ON media_galleries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_love_timelines_updated_at BEFORE UPDATE ON love_timelines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wishlist_items_updated_at BEFORE UPDATE ON wishlist_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_docs_updated_at BEFORE UPDATE ON docs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_game_scores_updated_at BEFORE UPDATE ON game_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_space_goals_updated_at BEFORE UPDATE ON space_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_game_sessions_updated_at BEFORE UPDATE ON game_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spotify_tokens_updated_at BEFORE UPDATE ON spotify_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spotify_surprise_drops_updated_at BEFORE UPDATE ON spotify_surprise_drops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spotify_capsules_updated_at BEFORE UPDATE ON spotify_capsules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_memory_lane_configs_updated_at BEFORE UPDATE ON memory_lane_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_space_invitations_updated_at BEFORE UPDATE ON space_invitations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_space_separation_requests_updated_at BEFORE UPDATE ON space_separation_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nobar_schedules_updated_at BEFORE UPDATE ON nobar_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listening_plans_updated_at BEFORE UPDATE ON listening_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_message_reads_updated_at BEFORE UPDATE ON message_reads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nobar_participants_updated_at BEFORE UPDATE ON nobar_participants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nobar_signaling_messages_updated_at BEFORE UPDATE ON nobar_signaling_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
