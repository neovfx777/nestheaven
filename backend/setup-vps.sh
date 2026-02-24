#!/bin/bash

# VPS Setup Script for Good-Home Backend (SQLite)
# Run as a regular user with sudo privileges

set -e

echo "Starting VPS setup for Good-Home Backend (SQLite)..."

# Colors
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m'

print_status() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

if [ "$EUID" -eq 0 ]; then
  print_error "Please don't run this script as root."
  exit 1
fi

print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

print_status "Installing required packages..."
sudo apt install -y curl wget git nginx build-essential

print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

print_status "Installing PM2..."
sudo npm install -g pm2

print_status "Creating application directory..."
sudo mkdir -p /var/www/good-home
sudo chown $USER:$USER /var/www/good-home

cd /var/www/good-home

if [ ! -d "backend" ]; then
  print_warning "Repository not found. Clone it into /var/www/good-home/backend"
  print_warning "Example: git clone <YOUR_REPO_URL> backend"
  exit 1
fi

cd backend

print_status "Installing Node.js dependencies..."
npm ci --production

print_status "Generating Prisma client..."
npx prisma generate

print_status "Running database migrations..."
npx prisma migrate deploy

print_status "Creating necessary directories..."
mkdir -p logs uploads

if [ ! -f ".env" ]; then
  print_status "Creating .env file from template..."
  cp .env.production .env
  print_warning "Please update .env with production values (JWT_SECRET, CORS_ORIGINS, etc.)"
fi

print_status "Setting up Nginx configuration..."
sudo tee /etc/nginx/sites-available/good-home > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;

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

    location /uploads/ {
        alias /var/www/good-home/backend/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/good-home /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

print_status "Setting up PM2 startup..."
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

print_status "Starting application with PM2..."
pm2 start ecosystem.config.js --env production
pm2 save

print_status "Setting up firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

print_status "Setup completed."
print_warning "Update /etc/nginx/sites-available/good-home with your domain and run certbot for SSL."
