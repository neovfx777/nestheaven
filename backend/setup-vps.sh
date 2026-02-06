#!/bin/bash

# VPS Setup Script for Good-Home Backend
# This script sets up the backend application on a VPS server

set -e

echo "🚀 Starting VPS setup for Good-Home Backend..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root. Run as regular user with sudo privileges."
    exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y curl wget git nginx postgresql postgresql-contrib build-essential

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
print_status "Installing PM2..."
sudo npm install -g pm2

# Setup PostgreSQL
print_status "Setting up PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
print_status "Creating database and user..."
sudo -u postgres psql -c "CREATE DATABASE good_home;" || print_warning "Database might already exist"
sudo -u postgres psql -c "CREATE USER good_home_user WITH PASSWORD 'your_secure_password_here';" || print_warning "User might already exist"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE good_home TO good_home_user;" || print_warning "Privileges might already be granted"

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p /var/www/good-home
sudo chown $USER:$USER /var/www/good-home

# Navigate to application directory
cd /var/www/good-home

# Clone repository (if not already cloned)
if [ ! -d "backend" ]; then
    print_status "Cloning repository..."
    # You need to replace this with your actual repository URL
    echo "Please replace 'YOUR_REPO_URL' with your actual repository URL in the script"
    # git clone YOUR_REPO_URL .
fi

# Navigate to backend directory
cd backend

# Install dependencies
print_status "Installing Node.js dependencies..."
npm ci --production

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# Run database migrations
print_status "Running database migrations..."
npx prisma migrate deploy

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs uploads

# Set up environment file
if [ ! -f ".env" ]; then
    print_status "Creating .env file from template..."
    cp .env.example .env
    print_warning "Please update .env file with your production values:"
    print_warning "- DATABASE_URL: postgresql://good_home_user:your_secure_password_here@localhost:5432/good_home"
    print_warning "- JWT_SECRET: Generate a secure random string"
    print_warning "- NODE_ENV: production"
    print_warning "- PORT: 3000"
fi

# Setup Nginx configuration
print_status "Setting up Nginx configuration..."
sudo tee /etc/nginx/sites-available/good-home > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com; # Replace with your actual domain

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Serve uploaded files
    location /uploads/ {
        alias /var/www/good-home/backend/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable Nginx site
sudo ln -sf /etc/nginx/sites-available/good-home /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Setup PM2 to start on boot
print_status "Setting up PM2 startup script..."
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

# Start the application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js --env production
pm2 save

# Setup firewall
print_status "Setting up firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

print_status "✅ VPS setup completed!"
echo ""
print_warning "IMPORTANT: Please complete these steps:"
echo "1. Update /etc/nginx/sites-available/good-home with your actual domain"
echo "2. Update .env file with production values"
echo "3. Set up SSL certificate with Let's Encrypt: sudo certbot --nginx"
echo "4. Restart the application: pm2 restart good-home"
echo ""
print_status "Application status:"
pm2 status
