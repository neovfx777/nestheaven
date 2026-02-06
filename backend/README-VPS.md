# Good-Home Backend VPS Deployment Guide

This guide provides comprehensive instructions for deploying the Good-Home backend application on a VPS server using PM2, Nginx, and PostgreSQL.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Setup](#quick-setup)
3. [Manual Setup](#manual-setup)
4. [Configuration](#configuration)
5. [Deployment Commands](#deployment-commands)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)
8. [Security Considerations](#security-considerations)

## 🔧 Prerequisites

### Server Requirements
- **OS**: Ubuntu 20.04/22.04 LTS (recommended)
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: Minimum 20GB SSD
- **CPU**: Minimum 1 core, Recommended 2+ cores

### Software Requirements
- Node.js 18.x+
- PostgreSQL 12+
- Nginx
- PM2
- Git

### Domain & SSL
- Registered domain name
- SSL certificate (Let's Encrypt recommended)

## 🚀 Quick Setup

### Automated Setup (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd backend
   ```

2. **Make setup script executable:**
   ```bash
   chmod +x setup-vps.sh
   ```

3. **Run the setup script:**
   ```bash
   ./setup-vps.sh
   ```

4. **Complete post-setup tasks:**
   - Update domain in Nginx configuration
   - Update `.env` file with production values
   - Set up SSL certificate
   - Restart the application

### Manual Setup

If you prefer manual setup, follow these steps:

#### 1. System Update
```bash
sudo apt update && sudo apt upgrade -y
```

#### 2. Install Dependencies
```bash
# Install basic packages
sudo apt install -y curl wget git nginx postgresql postgresql-contrib build-essential

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2
```

#### 3. Database Setup
```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE good_home;"
sudo -u postgres psql -c "CREATE USER good_home_user WITH PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE good_home TO good_home_user;"
```

#### 4. Application Setup
```bash
# Create application directory
sudo mkdir -p /var/www/good-home
sudo chown $USER:$USER /var/www/good-home

# Clone and setup application
cd /var/www/good-home
git clone <your-repository-url> backend
cd backend

# Install dependencies
npm ci --production

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Create necessary directories
mkdir -p logs uploads
```

## ⚙️ Configuration

### Environment Variables

Copy the production environment template:
```bash
cp .env.production .env
```

Update the following variables in `.env`:

```env
# Database
DATABASE_URL="postgresql://good_home_user:your_secure_password@localhost:5432/good_home"

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-generated-jwt-secret

# CORS
CORS_ORIGINS=https://your-domain.com

# Admin credentials
OWNER_ADMIN_EMAIL=admin@your-domain.com
OWNER_ADMIN_PASSWORD=secure_admin_password
```

### Nginx Configuration

Create `/etc/nginx/sites-available/good-home`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        alias /var/www/good-home/backend/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/good-home /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### SSL Certificate Setup

Install Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
```

Get certificate:
```bash
sudo certbot --nginx -d your-domain.com
```

## 📦 Deployment Commands

### Starting the Application
```bash
# Start with PM2 in production mode
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### Common PM2 Commands
```bash
# View application status
pm2 status

# View logs
pm2 logs good-home

# Restart application
pm2 restart good-home

# Stop application
pm2 stop good-home

# Reload application (zero downtime)
pm2 reload good-home

# Monitor application
pm2 monit
```

### Database Operations
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (if needed)
npx prisma db seed

# View database
npx prisma studio
```

## 🔍 Monitoring & Maintenance

### Log Management
```bash
# View PM2 logs
pm2 logs good-home

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### System Monitoring
```bash
# Check system resources
htop
df -h
free -h

# Check service status
sudo systemctl status nginx
sudo systemctl status postgresql
pm2 status
```

### Backup Strategy

#### Database Backup
```bash
# Create backup script
sudo nano /usr/local/bin/backup-db.sh
```

Add this content:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/good-home"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Database backup
pg_dump good_home > $BACKUP_DIR/db_backup_$DATE.sql

# File backup
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz uploads/

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

Make it executable and add to cron:
```bash
sudo chmod +x /usr/local/bin/backup-db.sh
# Add to cron: 0 2 * * * /usr/local/bin/backup-db.sh
```

## 🐛 Troubleshooting

### Common Issues

#### Application Not Starting
```bash
# Check PM2 logs
pm2 logs good-home

# Check if port is in use
sudo netstat -tlnp | grep :3000

# Check environment variables
pm2 env good-home
```

#### Database Connection Issues
```bash
# Test database connection
psql -h localhost -U good_home_user -d good_home

# Check PostgreSQL status
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

#### Nginx Issues
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Performance Issues

#### High Memory Usage
```bash
# Check memory usage
pm2 monit

# Restart application if needed
pm2 restart good-home

# Adjust max_memory_restart in ecosystem.config.js
```

#### Slow Database Queries
```bash
# Connect to database
psql -h localhost -U good_home_user -d good_home

# Check active connections
SELECT * FROM pg_stat_activity;

# Check slow queries (requires pg_stat_statements)
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## 🔒 Security Considerations

### Firewall Setup
```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

### Security Updates
```bash
# Install security updates automatically
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### Application Security
- Use strong, unique passwords
- Rotate JWT secrets regularly
- Keep dependencies updated
- Use HTTPS only
- Implement rate limiting
- Regular security audits

### Database Security
- Use strong database passwords
- Limit database user permissions
- Regular backups
- Enable PostgreSQL logging
- Consider connection pooling

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review application logs
3. Check system resources
4. Verify configuration files
5. Test database connectivity

## 🔄 Updates

To update the application:

```bash
# Navigate to application directory
cd /var/www/good-home/backend

# Pull latest changes
git pull origin main

# Install new dependencies
npm ci --production

# Run migrations
npx prisma migrate deploy

# Restart application
pm2 restart good-home
```

## 📊 Performance Optimization

### PM2 Optimization
- Use cluster mode for multi-core servers
- Set appropriate memory limits
- Configure graceful shutdown
- Monitor with PM2 monitoring

### Database Optimization
- Add database indexes
- Use connection pooling
- Optimize queries
- Regular vacuum and analyze

### Nginx Optimization
- Enable gzip compression
- Set up caching headers
- Configure worker processes
- Use HTTP/2

---

**Last Updated**: $(date)
**Version**: 1.0.0
