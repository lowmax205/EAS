# 🚀 Deployment Strategy - Panel Requirements Integration

## Enhanced Deployment Architecture for Panel-Required Features

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Production Environment with Panel Features             │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Nginx     │  │   Gunicorn  │  │ PostgreSQL  │  │  File Store │     │
│  │ (Reverse    │◄─│  (Django    │◄─│ (Database)  │  │ (Photos/    │     │
│  │  Proxy +    │  │   Server)   │  │             │  │ Signatures) │     │
│  │ Static)     │  │             │  │             │  │             │     │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │
│         │                                  ▲                ▲            │
│  ┌─────────────┐                  ┌─────────────┐  ┌─────────────┐     │
│  │   React     │                  │    Redis    │  │  WebSocket  │     │
│  │  (Static    │                  │  (Cache/    │  │ (Real-time  │     │
│  │   Files +   │                  │ Sessions)   │  │ Dashboard)  │     │
│  │ PWA Cache)  │                  │             │  │             │     │
│  └─────────────┘                  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

### Enhanced Development Setup for Panel Features
```bash
# Prerequisites for panel requirements
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- ImageMagick (for photo processing)
- Canvas support libraries

# Backend Development Setup with panel dependencies
cd backend/
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install enhanced requirements for panel features
pip install -r requirements.txt
pip install Pillow opencv-python-headless  # Photo processing
pip install channels channels-redis        # WebSocket support
pip install reportlab                       # PDF generation with photos

# Environment configuration with panel settings
cp .env.example .env.local
# Edit .env.local with development settings + file storage paths

# Database setup with panel-required models
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput

# Create media directories for panel features
mkdir -p media/photos/front media/photos/back media/signatures

# Start development server with WebSocket support
python manage.py runserver
# In separate terminal for WebSocket
python manage.py runworker

# Frontend Development Setup with panel packages
cd frontend/
npm install

# Install panel-required packages
npm install @react-signature-canvas/react-signature-canvas
npm install html2canvas react-camera-pro
npm install socket.io-client  # Real-time dashboard

# Environment configuration with camera permissions
cp .env.example .env.local
# Edit .env.local with API endpoints + camera/signature settings

# Start development server with HTTPS (required for camera)
npm run dev:https

# Redis for development with WebSocket support
docker run -d --name redis-dev -p 6379:6379 redis:6-alpine
```

### Enhanced Docker Configuration for Panel Features

#### 1. Backend Dockerfile with Panel Dependencies
```dockerfile
# backend/Dockerfile - Enhanced for Panel Requirements
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=app.settings.production

# Set work directory
WORKDIR /app

# Install system dependencies for panel features
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
        imagemagick \
        libmagickwand-dev \
        libopencv-dev \
        python3-opencv \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies with panel requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install additional panel-required packages
RUN pip install --no-cache-dir \
    Pillow \
    opencv-python-headless \
    channels \
    channels-redis \
    reportlab

# Copy project
COPY . .

# Create media directories for panel features
RUN mkdir -p media/photos/front media/photos/back media/signatures

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

# Collect static files
RUN python manage.py collectstatic --noinput

# Run gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "app.wsgi:application"]
```

#### 2. Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
# Multi-stage build for optimized production image

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy SSL certificates (if using HTTPS)
# COPY ssl/ /etc/nginx/ssl/

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

#### 3. Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:14-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    environment:
      - POSTGRES_DB=easdb
      - POSTGRES_USER=easuser
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U easuser -d easdb"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - media_files:/app/media
    environment:
      - DATABASE_URL=postgresql://easuser:${DB_PASSWORD}@db:5432/easdb
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=${SECRET_KEY}
      - DEBUG=False
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health/"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./frontend/nginx.conf:/etc/nginx/nginx.conf:ro
      # - ./ssl:/etc/nginx/ssl:ro  # Uncomment for HTTPS
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
  media_files:
```

### Production Deployment

#### 1. Server Requirements
```bash
# Minimum Production Requirements
- CPU: 2 cores (4 recommended)
- RAM: 4GB (8GB recommended)
- Storage: 50GB SSD
- OS: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+

# Recommended Production Setup
- CPU: 4 cores
- RAM: 8GB
- Storage: 100GB SSD with automated backups
- Load Balancer: Nginx/HAProxy
- CDN: CloudFlare/AWS CloudFront
```

#### 2. Server Setup Script
```bash
#!/bin/bash
# setup-production.sh

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install nginx (as reverse proxy)
sudo apt install nginx -y

# Install certbot for SSL
sudo apt install certbot python3-certbot-nginx -y

# Create application directory
sudo mkdir -p /opt/eas
sudo chown $USER:$USER /opt/eas

# Firewall configuration
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo "Production server setup complete!"
```

#### 3. Production Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  db:
    image: postgres:14-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data/
      - ./backups:/backups
    environment:
      - POSTGRES_DB=easdb
      - POSTGRES_USER=easuser
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    restart: unless-stopped
    networks:
      - backend
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U easuser -d easdb"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    restart: unless-stopped
    networks:
      - backend

  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile.prod
    volumes:
      - media_files:/app/media
      - static_files:/app/static
    environment:
      - DATABASE_URL=postgresql://easuser:${DB_PASSWORD}@db:5432/easdb
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
      - SECRET_KEY=${SECRET_KEY}
      - DEBUG=False
      - ALLOWED_HOSTS=${ALLOWED_HOSTS}
      - CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - backend
      - frontend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health/"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - static_files:/var/www/static:ro
      - media_files:/var/www/media:ro
      - ./frontend/dist:/var/www/html:ro
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - frontend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  media_files:
  static_files:
```

#### 4. Nginx Production Configuration
```nginx
# nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                   '$status $body_bytes_sent "$http_referer" '
                   '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;
    
    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    # Upstream backend
    upstream backend {
        server backend:8000;
        keepalive 32;
    }

    # HTTP redirect to HTTPS
    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;
        ssl_dhparam /etc/nginx/ssl/dhparam.pem;

        # Security headers
        add_header Strict-Transport-Security "max-age=63072000" always;
        add_header X-Frame-Options DENY always;
        add_header X-Content-Type-Options nosniff always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss:; media-src 'self';" always;

        # Frontend static files
        location / {
            root /var/www/html;
            try_files $uri $uri/ /index.html;
            
            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }

        # API endpoints
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # Authentication endpoints (stricter rate limiting)
        location /api/auth/ {
            limit_req zone=login burst=5 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Django static files
        location /static/ {
            alias /var/www/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Django media files
        location /media/ {
            alias /var/www/media/;
            expires 1d;
            add_header Cache-Control "public";
        }

        # Health check
        location /health/ {
            proxy_pass http://backend;
            access_log off;
        }
    }
}
```

### CI/CD Pipeline

#### 1. GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_easdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:6
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install Python dependencies
      run: |
        cd backend
        pip install -r requirements.txt
    
    - name: Install Node dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Run backend tests
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_easdb
        REDIS_URL: redis://localhost:6379/0
      run: |
        cd backend
        python manage.py test
    
    - name: Run frontend tests
      run: |
        cd frontend
        npm run test
    
    - name: Build frontend
      run: |
        cd frontend
        npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to production server
      uses: appleboy/ssh-action@v0.1.7
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /opt/eas
          git pull origin main
          docker-compose -f docker-compose.prod.yml down
          docker-compose -f docker-compose.prod.yml build
          docker-compose -f docker-compose.prod.yml up -d
          
          # Health check
          sleep 30
          curl -f http://localhost/health/ || exit 1
```

### Monitoring & Maintenance

#### 1. Backup Strategy
```bash
#!/bin/bash
# backup.sh - Database backup script

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="easdb"
DB_USER="easuser"

# Create backup
docker exec eas_db_1 pg_dump -U $DB_USER -d $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql.gz s3://your-backup-bucket/
```

#### 2. Health Monitoring
```python
# backend/apps/core/views.py
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
import redis

def health_check(request):
    """System health check endpoint"""
    health_status = {
        'status': 'healthy',
        'timestamp': timezone.now(),
        'services': {}
    }
    
    # Database check
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        health_status['services']['database'] = 'healthy'
    except Exception as e:
        health_status['services']['database'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'degraded'
    
    # Redis check
    try:
        cache.set('health_check', 'ok', 30)
        if cache.get('health_check') == 'ok':
            health_status['services']['redis'] = 'healthy'
        else:
            health_status['services']['redis'] = 'unhealthy'
            health_status['status'] = 'degraded'
    except Exception as e:
        health_status['services']['redis'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'degraded'
    
    return JsonResponse(
        health_status,
        status=200 if health_status['status'] == 'healthy' else 503
    )
```

### Environment Configuration

#### 1. Environment Variables
```bash
# .env.production
# Database
DATABASE_URL=postgresql://easuser:secure_password@db:5432/easdb
DB_PASSWORD=secure_password

# Redis
REDIS_URL=redis://:redis_password@redis:6379/0
REDIS_PASSWORD=redis_password

# Django
SECRET_KEY=your-super-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Security
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True

# Email (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Cloud Storage (optional)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=eas-media-files
AWS_S3_REGION_NAME=us-east-1
```

---

**Document Status:** ✅ COMPLETE - Production Ready  
**Next Phase:** Implementation & Testing  
**Priority:** CRITICAL - Deployment Strategy Established
