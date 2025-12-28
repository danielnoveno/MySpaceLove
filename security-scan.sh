#!/bin/bash

# Security Scan Script for LoveSpace
# This script performs automated security checks

echo "🔒 LoveSpace Security Scanner"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
ISSUES=0
WARNINGS=0
PASSED=0

# Function to print colored output
print_error() {
    echo -e "${RED}✗ $1${NC}"
    ((ISSUES++))
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    ((WARNINGS++))
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((PASSED++))
}

# Check if running in project directory
if [ ! -f "artisan" ]; then
    echo "Error: This script must be run from the Laravel project root directory"
    exit 1
fi

echo "1. Checking Environment Configuration..."
echo "----------------------------------------"

# Check APP_DEBUG
if grep -q "APP_DEBUG=true" .env 2>/dev/null; then
    print_error "APP_DEBUG is enabled (should be false in production)"
else
    print_success "APP_DEBUG is disabled"
fi

# Check APP_ENV
if grep -q "APP_ENV=production" .env 2>/dev/null; then
    print_success "APP_ENV is set to production"
else
    print_warning "APP_ENV is not set to production"
fi

# Check APP_KEY
if grep -q "APP_KEY=base64:" .env 2>/dev/null; then
    print_success "APP_KEY is set"
else
    print_error "APP_KEY is not set"
fi

echo ""
echo "2. Checking File Permissions..."
echo "--------------------------------"

# Check .env permissions
if [ -f ".env" ]; then
    PERMS=$(stat -c "%a" .env 2>/dev/null || stat -f "%OLp" .env 2>/dev/null)
    if [ "$PERMS" = "644" ] || [ "$PERMS" = "600" ]; then
        print_success ".env has correct permissions ($PERMS)"
    else
        print_warning ".env has permissions $PERMS (should be 644 or 600)"
    fi
else
    print_error ".env file not found"
fi

# Check storage permissions
if [ -w "storage" ]; then
    print_success "storage directory is writable"
else
    print_error "storage directory is not writable"
fi

echo ""
echo "3. Checking for Sensitive Files in Public..."
echo "---------------------------------------------"

# Check for sensitive files in public directory
SENSITIVE_FILES=(".env" "composer.json" "composer.lock" ".git")
for file in "${SENSITIVE_FILES[@]}"; do
    if [ -e "public/$file" ]; then
        print_error "Sensitive file found in public: $file"
    else
        print_success "No $file in public directory"
    fi
done

echo ""
echo "4. Checking Dependencies..."
echo "---------------------------"

# Check for composer.lock
if [ -f "composer.lock" ]; then
    print_success "composer.lock exists"
else
    print_warning "composer.lock not found"
fi

# Run composer audit if available
if command -v composer &> /dev/null; then
    echo "Running composer audit..."
    if composer audit --format=plain 2>&1 | grep -q "No security vulnerability advisories found"; then
        print_success "No composer security vulnerabilities found"
    else
        print_warning "Composer security vulnerabilities detected"
    fi
fi

# Run npm audit if available
if command -v npm &> /dev/null && [ -f "package.json" ]; then
    echo "Running npm audit..."
    NPM_AUDIT=$(npm audit --audit-level=high 2>&1)
    if echo "$NPM_AUDIT" | grep -q "found 0 vulnerabilities"; then
        print_success "No npm security vulnerabilities found"
    else
        print_warning "NPM security vulnerabilities detected"
    fi
fi

echo ""
echo "5. Checking Security Headers..."
echo "--------------------------------"

# Check if SecurityHeaders middleware exists
if [ -f "app/Http/Middleware/SecurityHeaders.php" ]; then
    print_success "SecurityHeaders middleware exists"
else
    print_error "SecurityHeaders middleware not found"
fi

echo ""
echo "6. Checking for Hardcoded Secrets..."
echo "-------------------------------------"

# Search for potential hardcoded secrets
echo "Scanning for potential secrets..."
SECRETS_FOUND=0

# Check for common secret patterns
if grep -r -i "password.*=.*['\"].*['\"]" app/ --include="*.php" | grep -v "password_confirmation" | grep -v "old_password" | grep -q .; then
    print_warning "Potential hardcoded passwords found in code"
    SECRETS_FOUND=1
fi

if grep -r "api_key.*=.*['\"][a-zA-Z0-9]\{20,\}['\"]" app/ --include="*.php" | grep -q .; then
    print_warning "Potential hardcoded API keys found in code"
    SECRETS_FOUND=1
fi

if [ $SECRETS_FOUND -eq 0 ]; then
    print_success "No obvious hardcoded secrets found"
fi

echo ""
echo "7. Checking Database Configuration..."
echo "--------------------------------------"

# Check for default database credentials
if grep -q "DB_USERNAME=root" .env 2>/dev/null; then
    print_warning "Using 'root' as database username"
fi

if grep -q "DB_PASSWORD=$" .env 2>/dev/null || grep -q "DB_PASSWORD=\"\"" .env 2>/dev/null; then
    print_error "Database password is empty"
fi

echo ""
echo "8. Checking Git Configuration..."
echo "---------------------------------"

# Check if .env is in .gitignore
if grep -q "^\.env$" .gitignore 2>/dev/null; then
    print_success ".env is in .gitignore"
else
    print_error ".env is not in .gitignore"
fi

# Check if vendor is in .gitignore
if grep -q "^/vendor" .gitignore 2>/dev/null; then
    print_success "vendor directory is in .gitignore"
else
    print_warning "vendor directory should be in .gitignore"
fi

echo ""
echo "9. Checking SSL/HTTPS Configuration..."
echo "---------------------------------------"

if grep -q "FORCE_HTTPS=true" .env 2>/dev/null; then
    print_success "HTTPS enforcement is enabled"
else
    print_warning "HTTPS enforcement is not enabled"
fi

echo ""
echo "10. Running Laravel Security Audit..."
echo "--------------------------------------"

# Run Laravel security audit command if available
if php artisan list | grep -q "security:audit"; then
    php artisan security:audit --no-interaction
else
    print_warning "security:audit command not available"
fi

echo ""
echo "=============================="
echo "Security Scan Summary"
echo "=============================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${RED}Issues: $ISSUES${NC}"
echo ""

if [ $ISSUES -gt 0 ]; then
    echo "⚠️  Critical issues found! Please fix before deploying to production."
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo "⚠️  Warnings found. Review and fix if necessary."
    exit 0
else
    echo "✅ All security checks passed!"
    exit 0
fi
