# Good-Home Backend VPS Deployment Guide (SQLite)

This guide shows how to deploy the backend on a VPS with PM2 and Nginx using SQLite (current Prisma provider).

## Prerequisites

- Ubuntu 20.04/22.04 LTS
- Node.js 18+
- Nginx
- PM2
- Git

## Quick Setup

1) Clone the repo
```bash
mkdir -p /var/www/good-home
cd /var/www/good-home
git clone <your-repo-url> backend
cd backend
```

2) Install dependencies
```bash
npm ci --production
```

3) Configure environment
```bash
cp .env.production .env
# Update JWT_SECRET, CORS_ORIGINS, OWNER_ADMIN_* as needed
```

4) Generate Prisma client + migrate
```bash
npx prisma generate
npx prisma migrate deploy
```

5) Start with PM2
```bash
pm2 start ecosystem.config.js --env production
pm2 save
```

## Nginx (reverse proxy + uploads)

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

Enable and reload:
```bash
sudo ln -s /etc/nginx/sites-available/good-home /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## SSL (optional)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Notes

- SQLite DB file lives at `backend/prisma/dev.db` by default.
- For backups, copy that file periodically.
- Keep `uploads/` backed up as well.
