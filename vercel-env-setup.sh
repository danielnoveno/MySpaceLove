#!/bin/bash
# ============================================================
# LoveSpace - Setup Vercel Environment Variables
# ============================================================
# Jalankan: bash vercel-env-setup.sh
# ============================================================

echo "🚀 Setting up Vercel Environment Variables..."
echo ""

# APP
vercel env add APP_NAME production <<< 'LoveSpace'
vercel env add APP_ENV production <<< 'production'
vercel env add APP_DEBUG production <<< 'false'
vercel env add APP_URL production <<< 'https://lovespace.vercel.app'
vercel env add APP_KEY production <<< ''

# DATABASE (Supabase PostgreSQL)
vercel env add DB_CONNECTION production <<< 'pgsql'
vercel env add DB_HOST production <<< 'db.eeftpdpqrqvrqkjrcckb.supabase.co'
vercel env add DB_PORT production <<< '5432'
vercel env add DB_DATABASE production <<< 'postgres'
vercel env add DB_USERNAME production <<< 'postgres'
vercel env add DB_PASSWORD production <<< 's{M!i48e5\{wv'

# SESSION
vercel env add SESSION_DRIVER production <<< 'database'
vercel env add SESSION_LIFETIME production <<< '1440'
vercel env add SESSION_ENCRYPT production <<< 'true'
vercel env add SESSION_PATH production <<< '/'
vercel env add SESSION_SECURE_COOKIE production <<< 'true'
vercel env add SESSION_SAME_SITE production <<< 'lax'

# CACHE & QUEUE
vercel env add CACHE_STORE production <<< 'database'
vercel env add QUEUE_CONNECTION production <<< 'database'

# FILESYSTEM (Supabase Storage)
vercel env add FILESYSTEM_DISK production <<< 's3'
vercel env add AWS_ACCESS_KEY_ID production <<< 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlZnRwZHBxcnF2cnFranJjY2tiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDAwMjI3MiwiZXhwIjoyMTA1NTc4MjcyfQ.Ii5WVux5RPgpF3O_RSrtkN43njfYxdb8CxBFUvtdxzY'
vercel env add AWS_SECRET_ACCESS_KEY production <<< 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlZnRwZHBxcnF2cnFranJjY2tiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDAwMjI3MiwiZXhwIjoyMTA1NTc4MjcyfQ.Ii5WVux5RPgpF3O_RSrtkN43njfYxdb8CxBFUvtdxzY'
vercel env add AWS_DEFAULT_REGION production <<< 'ap-southeast-1'
vercel env add AWS_BUCKET production <<< 'eeftpdpqrqvrqkjrcckb'
vercel env add AWS_ENDPOINT production <<< 'https://eeftpdpqrqvrqkjrcckb.supabase.co/storage/v1/s3'
vercel env add AWS_USE_PATH_STYLE_ENDPOINT production <<< 'true'

# SUPABASE
vercel env add SUPABASE_URL production <<< 'https://eeftpdpqrqvrqkjrcckb.supabase.co'
vercel env add SUPABASE_KEY production <<< 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlZnRwZHBxcnF2cnFranJjY2tiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMDIyNzIsImV4cCI6MjEwNTU3ODI3Mn0.hypkYx282aRnWIOM6HXQG9J-PNoy-hPbHL8xzmRdb8U'
vercel env add SUPABASE_SERVICE_KEY production <<< 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlZnRwZHBxcnF2cnFranJjY2tiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDAwMjI3MiwiZXhwIjoyMTA1NTc4MjcyfQ.Ii5WVux5RPgpF3O_RSrtkN43njfYxdb8CxBFUvtdxzY'

# LOGGING
vercel env add LOG_CHANNEL production <<< 'stack'
vercel env add LOG_STACK production <<< 'daily'
vercel env add LOG_LEVEL production <<< 'error'

# SECURITY
vercel env add BCRYPT_ROUNDS production <<< '12'
vercel env add APP_MAINTENANCE_DRIVER production <<< 'database'

echo ""
echo "✅ Semua environment variables sudah ditambahkan!"
echo "🚀 Sekarang deploy: vercel --prod"
