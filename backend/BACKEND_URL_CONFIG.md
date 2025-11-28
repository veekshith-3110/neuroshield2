# Backend URL Configuration

## 1. Default Settings

- Technology: Node.js + Express
- Default port: `5000` (override with `PORT` in `.env`)

## 2. Finding Your IP Address (Windows)

1. Open Command Prompt.
2. Run: `ipconfig`
3. Look for `IPv4 Address` under your Wi-Fi adapter, e.g. `192.168.1.10`.

Use this IP for Android and React frontend when testing on the same Wi-Fi network.

Example backend URL:

```text
http://192.168.1.10:5000
```

## 3. Android App Configuration

In `RetrofitClient.kt`:

```kotlin
private const val BASE_URL = "http://192.168.1.10:5000/"
```

## 4. Frontend (React) Configuration

In `.env` of your React app:

```env
REACT_APP_BACKEND_URL=http://192.168.1.10:5000
```

Then restart the dev server.
