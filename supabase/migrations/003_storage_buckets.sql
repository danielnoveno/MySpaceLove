-- =====================================================
-- MySpaceLove Supabase Storage Buckets
-- =====================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, '{image/jpeg,image/png,image/webp,image/gif}'),
    ('spaces', 'spaces', false, 52428800, '{image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm}'),
    ('galleries', 'galleries', false, 52428800, '{image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm}'),
    ('documents', 'documents', false, 10485760, '{application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain}'),
    ('love-timelines', 'love-timelines', false, 52428800, '{image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm}'),
    ('memory-lane', 'memory-lane', false, 52428800, '{image/jpeg,image/png,image/webp,image/gif}');

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Avatars: Public read, authenticated write
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload an avatar" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own avatar" ON storage.objects
    FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar" ON storage.objects
    FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Spaces: Private, only space members can access
CREATE POLICY "Space members can view space files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'spaces'
        AND EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id::text = (storage.foldername(name))[1]
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Space members can upload to their space" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'spaces'
        AND EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id::text = (storage.foldername(name))[1]
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Space members can delete from their space" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'spaces'
        AND EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id::text = (storage.foldername(name))[1]
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

-- Galleries: Private, only space members can access
CREATE POLICY "Space members can view gallery files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'galleries'
        AND EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id::text = (storage.foldername(name))[1]
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Space members can upload to their gallery" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'galleries'
        AND EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id::text = (storage.foldername(name))[1]
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

-- Documents: Private, only space members can access
CREATE POLICY "Space members can view documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'documents'
        AND EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id::text = (storage.foldername(name))[1]
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Space members can upload documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'documents'
        AND EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id::text = (storage.foldername(name))[1]
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

-- Love Timelines: Private, only space members can access
CREATE POLICY "Space members can view love timeline files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'love-timelines'
        AND EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id::text = (storage.foldername(name))[1]
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Space members can upload love timeline files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'love-timelines'
        AND EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id::text = (storage.foldername(name))[1]
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

-- Memory Lane: Private, only space members can access
CREATE POLICY "Space members can view memory lane files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'memory-lane'
        AND EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id::text = (storage.foldername(name))[1]
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );

CREATE POLICY "Space members can upload memory lane files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'memory-lane'
        AND EXISTS (
            SELECT 1 FROM spaces
            WHERE spaces.id::text = (storage.foldername(name))[1]
            AND (spaces.user_one_id = auth.uid() OR spaces.user_two_id = auth.uid())
        )
    );
