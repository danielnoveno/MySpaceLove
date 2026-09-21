#!/bin/bash
# Vercel Install Script
set -e

echo "📦 Installing npm dependencies..."
npm install

echo "📦 Installing composer dependencies..."
composer install --no-dev --optimize-autoloader

echo "✅ Install complete!"
