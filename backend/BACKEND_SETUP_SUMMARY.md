# Backend Setup Summary

## Step 1 – Install dependencies

```bash
cd backend
npm install
```

## Step 2 – Configure port

**Option 1: Use default port 5000**

No `.env` needed, backend will listen on 5000.

**Option 2: Custom port**

Create `backend/.env`:

```env
PORT=3000
```

Update Android `BASE_URL` accordingly.

## Step 3 – Run backend

```bash
node server.js
```

Server running at:

```
http://0.0.0.0:5000
```

(or your custom port)

## Step 4 – Connect clients

**Android** sends POST requests to:

```
http://<your-ip>:5000/api/health
```

**Website** calls:

- `GET /api/health?userId=...`
- `GET /api/health/latest?userId=...`
- `GET /api/health/stats?userId=...`
- `GET /api/health/today?userId=...`

