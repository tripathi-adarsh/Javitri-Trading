# Deployment Guide — Javitri Trading Service

## Pre-Deployment Checklist

### 1. Generate Secure Keys (run these commands locally)

```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# JWT Refresh Secret (generate a DIFFERENT value)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# KYC Encryption Key (64-char hex, 32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Admin Signup Token
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Production .env Values

Update your server's `.env` file:

```
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_NAME=javitri_trading
DB_USER=your_db_user
DB_PASSWORD=strong_password_here

JWT_SECRET=<generated above>
JWT_REFRESH_SECRET=<generated above, different value>
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

KYC_ENCRYPTION_KEY=<64-char hex generated above>

RAZORPAY_KEY_ID=rzp_live_XXXXXXXX       ← Use LIVE keys, not test
RAZORPAY_KEY_SECRET=your_live_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

FRONTEND_URL=https://yourdomain.com
ADMIN_SIGNUP_TOKEN=<generated above>
BCRYPT_ROUNDS=12
```

### 3. Switch Razorpay to Live Mode
- Login to Razorpay Dashboard → Switch to Live mode
- Copy `rzp_live_*` Key ID and Secret
- Set webhook URL: `https://yourdomain.com/api/v1/payments/webhook`
- Enable events: `payment.captured`, `payment.failed`, `refund.processed`

### 4. Build & Deploy

```bash
# On your VPS/server:

# 1. Install dependencies
npm ci --omit=dev
cd frontend && npm ci && npm run build && cd ..

# 2. Run database migrations
npm run migrate

# 3. Start with PM2
pm2 start src/server.js --name "javitri-api" --env production
pm2 save
pm2 startup
```

### 5. Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend (React build)
    location / {
        root /var/www/javitri/frontend/dist;
        try_files $uri $uri/ /index.html;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # Static assets — long cache
    location /assets/ {
        root /var/www/javitri/frontend/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }
}
```

### 6. SSL Certificate

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 7. Health Check

After deployment, verify:
```
https://yourdomain.com/api/health
```
Should return: `{ "success": true, "message": "Javitri Trading Service API is running" }`

---

## Security Notes

- Never expose `.env` file
- Rotate `JWT_SECRET` invalidates all active sessions (all users must re-login)
- `KYC_ENCRYPTION_KEY` must NEVER change after data is stored (data becomes unreadable)
- `ADMIN_SIGNUP_TOKEN` — after creating the admin account, you can rotate this
