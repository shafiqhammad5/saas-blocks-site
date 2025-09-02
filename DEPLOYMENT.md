# Deployment Guide

This guide covers different deployment options for the SaaSBlocks application.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- Environment variables configured

## Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth.js
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Paddle (Payment Processing)
PADDLE_VENDOR_ID="your-paddle-vendor-id"
PADDLE_API_KEY="your-paddle-api-key"
PADDLE_PUBLIC_KEY="your-paddle-public-key"
PADDLE_ENVIRONMENT="production" # or "sandbox"
PADDLE_WEBHOOK_SECRET="your-webhook-secret"
NEXT_PUBLIC_PADDLE_ENVIRONMENT="production"
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN="your-client-token"
NEXT_PUBLIC_PADDLE_PRO_PRICE_ID="your-pro-price-id"
NEXT_PUBLIC_PADDLE_TEAM_PRICE_ID="your-team-price-id"

# App Configuration
APP_URL="https://yourdomain.com"
```

## Deployment Options

### 1. Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables:**
   - Go to your Vercel dashboard
   - Navigate to your project settings
   - Add all environment variables from `.env.production`

5. **Database Setup:**
   - Use Vercel Postgres or external PostgreSQL service
   - Run migrations: `npx prisma migrate deploy`

### 2. Docker Deployment

1. **Build the Docker image:**
   ```bash
   docker build -t saasblocks .
   ```

2. **Run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

3. **Run database migrations:**
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

### 3. Traditional VPS/Server

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd saasblocks
   ```

2. **Install dependencies:**
   ```bash
   npm ci
   ```

3. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

4. **Run database migrations:**
   ```bash
   npx prisma migrate deploy
   ```

5. **Build the application:**
   ```bash
   npm run build
   ```

6. **Start the application:**
   ```bash
   npm start
   ```

### 4. Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Initialize project:**
   ```bash
   railway init
   ```

4. **Add PostgreSQL:**
   ```bash
   railway add postgresql
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

### 5. Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the application:**
   ```bash
   npm run build
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod --dir=.next
   ```

## Database Setup

### PostgreSQL Setup

1. **Create database:**
   ```sql
   CREATE DATABASE saasblocks;
   ```

2. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

3. **Seed database (optional):**
   ```bash
   npx prisma db seed
   ```

## SSL/HTTPS Setup

### Using Cloudflare (Recommended)

1. Add your domain to Cloudflare
2. Update DNS records to point to your server
3. Enable "Full (strict)" SSL/TLS encryption
4. Enable "Always Use HTTPS"

### Using Let's Encrypt with Nginx

1. **Install Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Get SSL certificate:**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

3. **Nginx configuration:**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

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
   }
   ```

## Performance Optimization

### 1. Enable Caching

- Use Redis for session storage
- Enable Next.js caching
- Use CDN for static assets

### 2. Database Optimization

- Enable connection pooling
- Add database indexes
- Use read replicas for scaling

### 3. Monitoring

- Set up error tracking (Sentry)
- Monitor performance (Vercel Analytics)
- Set up uptime monitoring

## Security Checklist

- [ ] Environment variables are secure
- [ ] HTTPS is enabled
- [ ] Security headers are configured
- [ ] Database credentials are secure
- [ ] OAuth secrets are secure
- [ ] Webhook secrets are configured
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured

## Troubleshooting

### Common Issues

1. **Database connection errors:**
   - Check DATABASE_URL format
   - Verify database is running
   - Check firewall settings

2. **OAuth not working:**
   - Verify redirect URLs
   - Check client IDs and secrets
   - Ensure NEXTAUTH_URL is correct

3. **Build failures:**
   - Check Node.js version
   - Clear node_modules and reinstall
   - Check for TypeScript errors

4. **Paddle webhook issues:**
   - Verify webhook URL is accessible
   - Check webhook secret
   - Ensure HTTPS is enabled

### Logs

- Check application logs: `docker-compose logs app`
- Check database logs: `docker-compose logs postgres`
- Check Vercel function logs in dashboard

## Support

For deployment issues:
1. Check the troubleshooting section
2. Review application logs
3. Check environment variables
4. Verify database connectivity