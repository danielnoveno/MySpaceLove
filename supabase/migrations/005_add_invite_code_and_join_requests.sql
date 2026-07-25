-- =====================================================
-- Migration: Add invite_code to spaces and source to space_invitations
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add invite_code column to spaces table
ALTER TABLE public.spaces ADD COLUMN IF NOT EXISTS invite_code VARCHAR(16) UNIQUE;

-- Generate invite codes for existing spaces
UPDATE public.spaces 
SET invite_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
WHERE invite_code IS NULL;

-- Make invite_code NOT NULL after populating
ALTER TABLE public.spaces ALTER COLUMN invite_code SET NOT NULL;

-- Add source column to space_invitations table
ALTER TABLE public.space_invitations ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'email';

-- Update RLS policies for spaces to allow reading invite_code
-- Drop existing policies and recreate with invite_code visibility
DROP POLICY IF EXISTS "View own spaces" ON spaces;
CREATE POLICY "View own spaces" ON spaces FOR SELECT USING (user_one_id = auth.uid() OR user_two_id = auth.uid());

-- Allow anyone to look up space by invite_code (for joining)
-- This is needed so the joinSpace function can find spaces
DROP POLICY IF EXISTS "View public spaces" ON spaces;
CREATE POLICY "View public spaces" ON spaces FOR SELECT USING (is_public = TRUE);

-- Add policy for invite_code lookup (read-only, no user auth needed for lookup)
CREATE POLICY "Lookup space by invite code" ON spaces FOR SELECT USING (TRUE);

-- Update RLS policies for space_invitations to support join requests
DROP POLICY IF EXISTS "View sent invitations" ON space_invitations;
CREATE POLICY "View sent invitations" ON space_invitations FOR SELECT USING (inviter_id = auth.uid());

DROP POLICY IF EXISTS "View received invitations" ON space_invitations;
CREATE POLICY "View received invitations" ON space_invitations FOR SELECT USING (invitee_id = auth.uid());

DROP POLICY IF EXISTS "Create invitations" ON space_invitations;
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

DROP POLICY IF EXISTS "Update invitation status" ON space_invitations;
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

-- Add index for invite_code lookups
CREATE INDEX IF NOT EXISTS idx_spaces_invite_code ON public.spaces(invite_code);

-- Add index for join request lookups
CREATE INDEX IF NOT EXISTS idx_space_invitations_source ON public.space_invitations(source);
CREATE INDEX IF NOT EXISTS idx_space_invitations_space_status ON public.space_invitations(space_id, status, source);
