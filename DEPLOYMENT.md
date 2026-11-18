# Deployment Guide — Javitri Trading Service

## Hostinger Node.js Deployment (GitHub Connect)

### Project Structure Samajhna
Yeh project ek **monorepo** hai:
- **Root (`/`)** → Express backend (Node.js app)
- **`frontend/`** → React + Vite frontend

Express server production mein `frontend/dist` ko static files ke roop mein serve karta hai, isliye sirf **ek hi deployment** chahiye.

---

### Step 1 — GitHub Repository Prepare Karo

`.gitignore` check karo ki yeh sab commit na ho:
```
node_modules/
frontend/node_modules/
frontend/dist/
.env
```

**Important:** `frontend/dist/` git mein mat daalo — Hostinger khud build karega.

---

### Step 2 — Hostinger mein GitHub Connect karo

1. Hostinger hPanel → **Hosting** → apna plan open karo
2. Left sidebar → **Node.js** section
3. **"Connect Git repository"** ya **"Import from GitHub"** click karo
4. GitHub account authorize karo
5. Apni repository select karo

**Deployment settings exactly yeh bharo:**

| Field | Value |
|-------|-------|
| **Root directory** | *(blank — root hi rakho)* |
| **Framework** | `Other` ya `Node.js` select karo |
| **Build command** | `npm run build` |
| **Start command** | `npm start` |
| **Node.js version** | `18.x` ya `20.x` |

---

### Step 3 — Environment Variables Set Karo

Hostinger hPanel → Node.js → **Environment Variables** section mein yeh sab add karo:

```
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=javitri_trading
DB_USER=your_db_user
DB_PASSWORD=strong_password_here

JWT_SECRET=<64-char hex — neeche command se generate karo>
JWT_REFRESH_SECRET=<alag 64-char hex>
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

KYC_ENCRYPTION_KEY=<64-char hex>

RAZORPAY_KEY_ID=rzp_live_XXXXXXXX
RAZORPAY_KEY_SECRET=your_live_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

FRONTEND_URL=https://javitritrading.com
ADMIN_SIGNUP_TOKEN=<random token>
BCRYPT_ROUNDS=12
```

**Note:** Hostinger managed Node.js mein PORT usually `3000` hota hai — Hostinger khud reverse proxy karta hai.

Secure keys generate karne ke liye locally run karo:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Har key ke liye alag value generate karo (4 baar run karo).

---

### Step 4 — MySQL Database Banao

1. hPanel → **Databases** → **MySQL Databases**
2. Naya database banao: `javitri_trading`
3. User banao aur us database se assign karo (sabhi permissions do)
4. Wahi credentials env variables mein daalo

**DB_HOST** Hostinger shared/VPS mein `localhost` hota hai.

---

### Step 5 — Deploy karo

1. Hostinger Node.js panel mein **"Deploy"** button dabao
2. Build logs mein dekho — `npm run build` chal ke `frontend/dist/` generate karega
3. Build complete hone ke baad app automatically start hoga

---

### Step 6 — Database Migrate karo

Deploy ke baad **ek baar** migration run karni hogi. Hostinger SSH terminal se:

```bash
npm run migrate
```

SSH access: hPanel → **Advanced** → **SSH Access**

---

### Step 7 — Verify karo

```
https://javitritrading.com/api/health
```
Yeh response aana chahiye:
```json
{ "success": true, "message": "Javitri Trading Service API is running" }
```

---

## Secure Keys Generate Karo (locally run karo)

```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# JWT Refresh Secret (alag value generate karo)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# KYC Encryption Key (64-char hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Admin Signup Token
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Razorpay Live Mode

- Razorpay Dashboard → Live mode switch karo
- `rzp_live_*` Key ID aur Secret copy karo
- Webhook URL: `https://javitritrading.com/api/v1/payments/webhook`
- Events enable karo: `payment.captured`, `payment.failed`, `refund.processed`

---

## VPS / Dedicated Server (Advanced)

```bash
npm ci --omit=dev
npm run build
npm run migrate
pm2 start src/server.js --name "javitri-api" --env production
pm2 save && pm2 startup
```

---

## Security Notes

- `.env` file kabhi git mein commit mat karo
- `JWT_SECRET` rotate karne se sab users logout ho jayenge
- `KYC_ENCRYPTION_KEY` deploy ke baad **kabhi mat badlo** — data unreadable ho jayega
- `ADMIN_SIGNUP_TOKEN` — admin account banane ke baad rotate kar sakte ho
