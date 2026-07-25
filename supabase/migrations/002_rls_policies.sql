-- =====================================================
-- MySpaceLove Row Level Security (RLS) Policies
-- Supabase Security Layer
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_separation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE nobar_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE nobar_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE nobar_signaling_messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTION: Check if user is in space
-- =====================================================
CREATE OR REPLACE FUNCTION is_user_in_space(space_uuid BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM spaces
        WHERE id = space_uuid
        AND (user_one_id = auth.uid() OR user_two_id = auth.uid())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- USERS POLICIES
-- =====================================================
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view partner profile" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE (user_one_id = auth.uid() AND user_two_id = users.id)
            OR (user_two_id = auth.uid() AND user_one_id = users.id)
        )
    );

-- =====================================================
-- SPACES POLICIES
-- =====================================================
CREATE POLICY "Users can view own spaces" ON spaces
    FOR SELECT USING (
        user_one_id = auth.uid() OR user_two_id = auth.uid()
    );

CREATE POLICY "Users can view public spaces" ON spaces
    FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can create spaces" ON spaces
    FOR INSERT WITH CHECK (user_one_id = auth.uid());

CREATE POLICY "Users can update own spaces" ON spaces
    FOR UPDATE USING (
        user_one_id = auth.uid() OR user_two_id = auth.uid()
    );

-- =====================================================
-- TIMELINES POLICIES
-- =====================================================
CREATE POLICY "Users can view timelines in their space" ON timelines
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = timelines.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Users can create timelines in their space" ON timelines
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = timelines.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Users can update own timelines" ON timelines
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own timelines" ON timelines
    FOR DELETE USING (user_id = auth.uid());

-- =====================================================
-- DAILY MESSAGES POLICIES
-- =====================================================
CREATE POLICY "Users can view daily messages in their space" ON daily_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = daily_messages.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "System can insert daily messages" ON daily_messages
    FOR INSERT WITH CHECK (TRUE);

-- =====================================================
-- COUNTDOWNS POLICIES
-- =====================================================
CREATE POLICY "Users can view countdowns in their space" ON countdowns
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = countdowns.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage countdowns in their space" ON countdowns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = countdowns.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

-- =====================================================
-- LOVE JOURNALS POLICIES
-- =====================================================
CREATE POLICY "Users can view journals in their space" ON love_journals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = love_journals.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Users can create journals in their space" ON love_journals
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = love_journals.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Users can update own journals" ON love_journals
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own journals" ON love_journals
    FOR DELETE USING (user_id = auth.uid());

-- =====================================================
-- SURPRISE NOTES POLICIES
-- =====================================================
CREATE POLICY "Users can view surprise notes in their space" ON surprise_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = surprise_notes.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Users can create surprise notes in their space" ON surprise_notes
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = surprise_notes.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

-- =====================================================
-- MEDIA GALLERIES POLICIES
-- =====================================================
CREATE POLICY "Users can view galleries in their space" ON media_galleries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = media_galleries.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage galleries in their space" ON media_galleries
    FOR ALL USING (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = media_galleries.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

-- =====================================================
-- LOVE TIMELINES POLICIES
-- =====================================================
CREATE POLICY "Users can view love timelines in their space" ON love_timelines
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = love_timelines.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage love timelines in their space" ON love_timelines
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = love_timelines.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

-- =====================================================
-- WISHLIST ITEMS POLICIES
-- =====================================================
CREATE POLICY "Users can view wishlist in their space" ON wishlist_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = wishlist_items.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage wishlist in their space" ON wishlist_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = wishlist_items.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

-- =====================================================
-- DOCS POLICIES
-- =====================================================
CREATE POLICY "Users can view docs in their space" ON docs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = docs.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage docs in their space" ON docs
    FOR ALL USING (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = docs.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

-- =====================================================
-- GAMES POLICIES (Public read)
-- =====================================================
CREATE POLICY "Anyone can view games" ON games
    FOR SELECT USING (TRUE);

-- =====================================================
-- GAME SCORES POLICIES
-- =====================================================
CREATE POLICY "Users can view scores in their space" ON game_scores
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = game_scores.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Users can create scores in their space" ON game_scores
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = game_scores.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

-- =====================================================
-- SPACE GOALS POLICIES
-- =====================================================
CREATE POLICY "Users can view goals in their space" ON space_goals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = space_goals.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage goals in their space" ON space_goals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = space_goals.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

-- =====================================================
-- GAME SESSIONS POLICIES
-- =====================================================
CREATE POLICY "Users can view sessions in their space" ON game_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = game_sessions.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage sessions in their space" ON game_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = game_sessions.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

-- =====================================================
-- SPOTIFY TOKENS POLICIES
-- =====================================================
CREATE POLICY "Users can view own spotify tokens" ON spotify_tokens
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own spotify tokens" ON spotify_tokens
    FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- SPOTIFY SURPRISE DROPS POLICIES
-- =====================================================
CREATE POLICY "Users can view drops in their space" ON spotify_surprise_drops
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = spotify_surprise_drops.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage drops in their space" ON spotify_surprise_drops
    FOR ALL USING (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = spotify_surprise_drops.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

-- =====================================================
-- SPOTIFY CAPSULES POLICIES
-- =====================================================
CREATE POLICY "Users can view capsules in their space" ON spotify_capsules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = spotify_capsules.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage capsules in their space" ON spotify_capsules
    FOR ALL USING (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = spotify_capsules.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

-- =====================================================
-- MEMORY LANE CONFIGS POLICIES
-- =====================================================
CREATE POLICY "Users can view memory lane in their space" ON memory_lane_configs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = memory_lane_configs.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage memory lane in their space" ON memory_lane_configs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = memory_lane_configs.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

-- =====================================================
-- LOCATIONS POLICIES
-- =====================================================
CREATE POLICY "Users can view own location" ON locations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view partner location" ON locations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE (spaces.user_one_id = auth.uid() AND spaces.user_two_id = locations.user_id)
            OR (spaces.user_two_id = auth.uid() AND spaces.user_one_id = locations.user_id)
        )
    );

CREATE POLICY "Users can update own location" ON locations
    FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- SPACE INVITATIONS POLICIES
-- =====================================================
CREATE POLICY "Users can view invitations they sent" ON space_invitations
    FOR SELECT USING (inviter_id = auth.uid());

CREATE POLICY "Users can view invitations they received" ON space_invitations
    FOR SELECT USING (invitee_id = auth.uid());

CREATE POLICY "Users can create invitations" ON space_invitations
    FOR INSERT WITH CHECK (
        inviter_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = space_invitations.space_id
            AND spaces.user_one_id = auth.uid()
        )
    );

CREATE POLICY "Invitees can update invitation status" ON space_invitations
    FOR UPDATE USING (invitee_id = auth.uid());

-- =====================================================
-- SPACE SEPARATION REQUESTS POLICIES
-- =====================================================
CREATE POLICY "Users can view separation requests in their space" ON space_separation_requests
    FOR SELECT USING (
        initiator_id = auth.uid() OR partner_id = auth.uid()
    );

CREATE POLICY "Users can create separation requests" ON space_separation_requests
    FOR INSERT WITH CHECK (initiator_id = auth.uid());

CREATE POLICY "Partners can update separation requests" ON space_separation_requests
    FOR UPDATE USING (partner_id = auth.uid());

-- =====================================================
-- NOBAR SCHEDULES POLICIES
-- =====================================================
CREATE POLICY "Users can view nobar schedules in their space" ON nobar_schedules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = nobar_schedules.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage nobar schedules in their space" ON nobar_schedules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = nobar_schedules.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (TRUE);

-- =====================================================
-- LISTENING PLANS POLICIES
-- =====================================================
CREATE POLICY "Users can view listening plans in their space" ON listening_plans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = listening_plans.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage listening plans in their space" ON listening_plans
    FOR ALL USING (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = listening_plans.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

-- =====================================================
-- MESSAGES POLICIES
-- =====================================================
CREATE POLICY "Users can view messages in their space" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = messages.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages in their space" ON messages
    FOR INSERT WITH CHECK (
        sender_user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = messages.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Users can delete own messages" ON messages
    FOR DELETE USING (sender_user_id = auth.uid());

-- =====================================================
-- MESSAGE READS POLICIES
-- =====================================================
CREATE POLICY "Users can view message reads in their space" ON message_reads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM messages m
            JOIN spaces s ON s.id = m.space_id
            WHERE m.id = message_reads.message_id
            AND (s.user_one_id = auth.uid() OR s.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Users can mark messages as read" ON message_reads
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- =====================================================
-- NOBAR PARTICIPANTS POLICIES
-- =====================================================
CREATE POLICY "Users can view nobar participants in their space" ON nobar_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = nobar_participants.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage own nobar participation" ON nobar_participants
    FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- NOBAR SIGNALING MESSAGES POLICIES
-- =====================================================
CREATE POLICY "Users can view signaling in their space" ON nobar_signaling_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = nobar_signaling_messages.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Users can send signaling in their space" ON nobar_signaling_messages
    FOR INSERT WITH CHECK (
        sender_user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id = nobar_signaling_messages.space_id
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

-- =====================================================
-- THEMES POLICIES (Public read)
-- =====================================================
CREATE POLICY "Anyone can view themes" ON themes
    FOR SELECT USING (TRUE);
