#!/bin/bash

# Deployment Validation Script for Good-Home Backend
# This script validates that all configurations are correct for VPS deployment

set -e

echo "🔍 Validating VPS deployment configuration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required files exist
echo "Checking required files..."

files_to_check=(
    "package.json"
    "src/server.js"
    "ecosystem.config.js"
    ".env.example"
    ".env.production"
    "setup-vps.sh"
    "README-VPS.md"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file exists"
    else
        print_error "$file is missing"
    fi
done

# Validate package.json
echo ""
echo "Validating package.json..."

if [ -f "package.json" ]; then
    # Check if start script exists
    if grep -q '"start"' package.json; then
        print_success "Start script found in package.json"
    else
        print_error "Start script missing in package.json"
    fi

    # Check if required dependencies exist
    deps=("express" "@prisma/client" "dotenv" "cors" "bcrypt" "jsonwebtoken")
    for dep in "${deps[@]}"; do
        if grep -q "\"$dep\"" package.json; then
            print_success "$dep dependency found"
        else
            print_error "$dep dependency missing"
        fi
    done
fi

# Validate ecosystem.config.js
echo ""
echo "Validating PM2 configuration..."

if [ -f "ecosystem.config.js" ]; then
    # Check if production environment exists
    if grep -q "env_production" ecosystem.config.js; then
        print_success "Production environment configuration found"
    else
        print_error "Production environment configuration missing"
    fi

    # Check if log files are configured
    if grep -q "error_file" ecosystem.config.js && grep -q "out_file" ecosystem.config.js; then
        print_success "Log files configured in PM2"
    else
        print_warning "Log files not fully configured in PM2"
    fi
fi

# Validate environment files
echo ""
echo "Validating environment files..."

if [ -f ".env.example" ]; then
    required_vars=("NODE_ENV" "PORT" "DATABASE_URL" "JWT_SECRET")
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env.example; then
            print_success "$var found in .env.example"
        else
            print_error "$var missing in .env.example"
        fi
    done
fi

if [ -f ".env.production" ]; then
    if grep -q "production" .env.production; then
        print_success "Production environment configured"
    else
        print_warning "Production environment might not be properly configured"
    fi
fi

# Check Node.js version
echo ""
echo "Checking Node.js version..."

if command -v node &> /dev/null; then
    node_version=$(node -v | cut -d'v' -f2)
    required_version="18.0.0"
    
    if [ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" = "$required_version" ]; then
        print_success "Node.js version $node_version (>= 18.0.0)"
    else
        print_error "Node.js version $node_version (< 18.0.0) - please upgrade"
    fi
else
    print_error "Node.js not installed"
fi

# Check PM2 installation
echo ""
echo "Checking PM2 installation..."

if command -v pm2 &> /dev/null; then
    pm2_version=$(pm2 -v)
    print_success "PM2 installed ($pm2_version)"
else
    print_error "PM2 not installed"
fi

# Check if directories exist
echo ""
echo "Checking required directories..."

dirs_to_check=("src" "prisma" "logs" "uploads")
for dir in "${dirs_to_check[@]}"; do
    if [ -d "$dir" ]; then
        print_success "$dir directory exists"
    else
        print_warning "$dir directory missing (will be created during setup)"
    fi
done

# Validate setup script
echo ""
echo "Validating setup script..."

if [ -f "setup-vps.sh" ]; then
    if [ -x "setup-vps.sh" ]; then
        print_success "setup-vps.sh is executable"
    else
        print_warning "setup-vps.sh is not executable (run: chmod +x setup-vps.sh)"
    fi
fi

# Check for common security issues
echo ""
echo "Checking security configuration..."

if [ -f ".env.example" ]; then
    if grep -q "your-super-secret" .env.example; then
        print_warning "Default secrets found in .env.example - change in production"
    fi
fi

if [ -f ".env.production" ]; then
    if grep -q "your-super-secret" .env.production; then
        print_error "Default secrets still in .env.production - must be changed"
    fi
fi

# Summary
echo ""
echo "🎯 Validation Summary:"
echo "   - Review any ❌ errors and fix them before deployment"
echo "   - Pay attention to ⚠️ warnings for better security"
echo "   - Run 'chmod +x setup-vps.sh' if not executable"
echo "   - Update .env.production with actual production values"
echo ""
echo "📋 Next Steps:"
echo "   1. Fix any validation errors"
echo "   2. Update production environment variables"
echo "   3. Run: ./setup-vps.sh"
echo "   4. Test the deployment"
echo ""
print_success "Validation completed!"
