#!/bin/bash
# 📦 Dependency Installation Script
# Installs all project dependencies with proper memory allocation

set -e  # Exit on any error

echo "🚀 Starting dependency installation with memory optimization..."
echo "📋 This script will install dependencies for all project components"
echo ""

# Set memory options
export NODE_OPTIONS="--max-old-space-size=6144"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m' 
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}🔧 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to install dependencies in a directory
install_deps() {
    local dir=$1
    local use_legacy=${2:-false}
    
    print_step "Installing dependencies in $dir"
    
    if [ "$dir" != "." ]; then
        cd "$dir"
    fi
    
    # Clean existing node_modules and lockfile if they exist
    if [ -d "node_modules" ] || [ -f "package-lock.json" ]; then
        print_warning "Cleaning existing node_modules and lockfiles in $dir"
        rm -rf node_modules package-lock.json
    fi
    
    # Install with appropriate flags
    if [ "$use_legacy" = "true" ]; then
        if ! npm install --legacy-peer-deps --no-audit --progress=false; then
            print_error "Failed to install dependencies in $dir"
            exit 1
        fi
    else
        if ! npm install --no-audit --progress=false; then
            print_error "Failed to install dependencies in $dir"
            exit 1
        fi
    fi
    
    print_success "Dependencies installed in $dir"
    
    if [ "$dir" != "." ]; then
        cd ..
    fi
}

# Main installation sequence
echo "📍 Starting from: $(pwd)"

# Install root dependencies
print_step "Installing root dependencies (React Native project)"
install_deps "." true

# Install backend dependencies  
if [ -d "backend" ]; then
    print_step "Installing backend dependencies"
    install_deps "backend" true
else
    print_warning "Backend directory not found, skipping"
fi

# Install functions dependencies
if [ -d "functions" ]; then
    print_step "Installing functions dependencies"  
    install_deps "functions" true
else
    print_warning "Functions directory not found, skipping"
fi

# Install demo-web dependencies
if [ -d "apps/demo-web" ]; then
    print_step "Installing demo-web dependencies"
    install_deps "apps/demo-web" false
else
    print_warning "Demo-web directory not found, skipping"
fi

echo ""
print_success "🎉 All dependencies installed successfully!"
echo ""

# Run quality checks
print_step "Running quality gate checks..."

echo ""
print_step "🔍 Running ESLint..."
if npm run lint; then
    print_success "ESLint passed"
else
    print_error "ESLint failed - check output above"
    exit 1
fi

echo ""
print_step "🔧 Running TypeScript check..."
if npm run typecheck; then
    print_success "TypeScript check passed"
else
    print_error "TypeScript check failed - check output above"  
    exit 1
fi

echo ""
print_step "🧪 Running tests..."
if npm run test:ci; then
    print_success "Tests passed"
else
    print_error "Tests failed - check output above"
    exit 1
fi

echo ""
print_step "💅 Running format check..."
if npm run format:ci; then
    print_success "Format check passed"
else
    print_error "Format check failed - run 'npm run format' to fix"
    exit 1
fi

echo ""
print_success "🎊 All quality gates passed!"
echo ""
print_step "📝 Next steps:"
echo "   1. Commit the generated package-lock.json files"
echo "   2. Push to trigger CI builds"  
echo "   3. Monitor GitHub Actions for successful completion"
echo ""
print_success "✨ Setup complete! The original ESLint minimatch error should now be resolved."