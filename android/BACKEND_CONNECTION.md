# Backend Connection Setup

## Port Configuration

The backend server (`backend/server.js`) defaults to **port 5000**, but your Android app is configured to connect to **port 3000**.

### Option 1: Update Backend to Use Port 3000

Create or update `backend/.env`:

```env
PORT=3000
```

Then restart your backend server.

### Option 2: Update Android App to Use Port 5000

In `android/RetrofitClient.kt`, change:

```kotlin
private const val BASE_URL = "http://192.168.1.10:5000/"
```

## Finding Your Local IP Address

### Windows:
```powershell
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

### Mac/Linux:
```bash
ifconfig
# Or
ip addr show
```

### Common IP Patterns:
- `192.168.1.XXX` - Most home routers
- `192.168.0.XXX` - Some routers
- `10.0.0.XXX` - Some networks

## Testing the Connection

### 1. Start Backend Server

```bash
cd backend
npm install  # If not already done
npm start    # Or npm run dev for watch mode
```

The server should show:
```
🚀 Neuroshield backend server running on http://localhost:5000
```

### 2. Test from Android Device/Emulator

Make sure your Android device/emulator is on the **same Wi-Fi network** as your computer.

### 3. Test with curl (Optional)

From your computer, test the endpoint:

```bash
# Test health check
curl http://localhost:5000/api/health

# Test health data endpoint (from Android)
curl -X POST http://192.168.1.10:5000/api/health \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","steps":1000,"heartRate":72,"timestamp":1234567890}'
```

## Common Issues

### "Connection refused" or "Network error"
- ✅ Check backend is running
- ✅ Verify IP address is correct
- ✅ Ensure device/emulator is on same Wi-Fi
- ✅ Check firewall isn't blocking the port
- ✅ For Android emulator, use `10.0.2.2` instead of localhost

### Android Emulator Special Case

If using Android emulator, use this special IP:

```kotlin
private const val BASE_URL = "http://10.0.2.2:5000/"
```

The emulator uses `10.0.2.2` to refer to `localhost` on your host machine.

### Physical Device

For physical Android devices:
- Use your computer's actual IP address (e.g., `192.168.1.10`)
- Both devices must be on the same Wi-Fi network
- Check Windows Firewall allows connections on the port

## Production Setup

For production, update `RetrofitClient.kt`:

```kotlin
private const val BASE_URL = "https://your-production-server.com/"
```

Make sure:
- ✅ Use HTTPS (not HTTP)
- ✅ Update backend CORS settings to allow your domain
- ✅ Configure proper authentication/API keys

