# 🔧 Fix Phone Can't Find Dev Server

**Issue:** Phone can't connect to Expo dev server
**Your IP:** 192.168.4.71
**Metro Port:** 8081 ✅ (Running)

---

## 🚀 Quick Fix Options

### **Option 1: Use Tunnel Mode (Easiest)**

Stop current Expo and restart with tunnel:

```powershell
# Stop current server (Ctrl+C)

cd C:\Users\hharp\pai\friday
npx expo start --tunnel
```

**Why this works:**
- Uses Expo's cloud tunnel
- Bypasses firewall/network issues
- Works even on different networks

**Then on phone:**
- Scan the QR code
- Should connect immediately

---

### **Option 2: Fix Windows Firewall**

Metro is running on port 8081, but Windows firewall might be blocking it.

#### **Add Firewall Rules (Run as Administrator):**

```powershell
# Allow Metro bundler port
New-NetFirewallRule -DisplayName "Expo Metro 8081" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow

# Allow Expo dev server port range
New-NetFirewallRule -DisplayName "Expo Dev Server" -Direction Inbound -LocalPort 19000-19001 -Protocol TCP -Action Allow

# Allow Node.js
New-NetFirewallRule -DisplayName "Node.js" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow
```

**Then restart Expo:**
```powershell
cd C:\Users\hharp\pai\friday
npm start
```

---

### **Option 3: USB Connection (Most Reliable)**

Connect phone via USB and use ADB:

#### **Step 1: Enable USB Debugging on Phone**

1. Settings → About Phone
2. Tap "Build Number" 7 times (enables Developer Options)
3. Settings → Developer Options
4. Enable "USB Debugging"

#### **Step 2: Connect Phone via USB**

Plug phone into computer with USB cable.

#### **Step 3: Setup ADB Port Forwarding**

```powershell
# Check phone is connected
adb devices

# Should show something like:
# List of devices attached
# ABC123456789    device

# Forward ports
adb reverse tcp:8081 tcp:8081
adb reverse tcp:8888 tcp:8888
```

#### **Step 4: Start App**

```powershell
cd C:\Users\hharp\pai\friday
npm run android
```

App will install and run on your connected phone (not emulator).

---

### **Option 4: Manual IP Entry**

If QR code doesn't work:

1. Open **Expo Go** on phone
2. Tap **"Enter URL manually"**
3. Type: `exp://192.168.4.71:8081`
4. Tap Connect

---

## 🧪 Test Connectivity First

### **Test 1: Ping Phone from Computer**

Get your phone's IP from phone WiFi settings, then:

```powershell
ping [phone-ip]
```

Should get replies. If timeout = network issue.

### **Test 2: Access from Phone Browser**

On your phone's browser, visit:

**Test Metro:**
```
http://192.168.4.71:8081
```

Should show Metro bundler status page.

**Test Backend:**
```
http://192.168.4.71:8888/api/health
```

Should show: `{"status":"ok"}`

If either fails = firewall blocking.

---

## 🔍 Diagnosis

**If you see this in terminal:**
```
› Metro waiting on exp://192.168.4.71:8081
```

Metro is running ✅

**If phone can't connect:**
- Network issue (different subnet)
- Firewall blocking
- Metro bound to wrong interface

---

## 🛠️ Advanced Troubleshooting

### **Check Which Network Interface Metro Uses:**

In terminal when you start Expo, look for:
```
› Metro waiting on exp://192.168.4.71:8081
```

If it shows `exp://127.0.0.1:8081` or `exp://192.168.x.x` (different subnet), that's the problem.

### **Force Expo to Use Correct IP:**

```powershell
# Set environment variable
$env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.4.71"
npm start
```

Or add to package.json:
```json
"scripts": {
  "start": "REACT_NATIVE_PACKAGER_HOSTNAME=192.168.4.71 expo start"
}
```

**PowerShell version:**
```json
"start:lan": "set REACT_NATIVE_PACKAGER_HOSTNAME=192.168.4.71 && expo start --lan"
```

---

## 📱 Check Phone WiFi Settings

### **Ensure Same Network:**

**Computer:** 192.168.4.71
**Phone:** Must be 192.168.4.x (same subnet)

**Check phone WiFi:**
1. Settings → WiFi
2. Tap connected network
3. Check IP address
4. Should be like 192.168.4.xxx

**If different subnet:**
- Phone on guest network?
- Computer on Ethernet, phone on WiFi?
- Router has multiple VLANs?

Solution: Connect both to same WiFi network.

---

## 🎯 Recommended Solution

**For fastest results, use Option 3 (USB) or Option 1 (Tunnel):**

### **Tunnel Mode (No USB needed):**
```powershell
cd C:\Users\hharp\pai\friday
npx expo start --tunnel
```

Scan QR code on phone. Done!

### **USB Mode (Most reliable):**
```powershell
# 1. Connect phone via USB
# 2. Enable USB debugging on phone
# 3. Run:
adb devices
adb reverse tcp:8081 tcp:8081
adb reverse tcp:8888 tcp:8888

# 4. Start app:
cd C:\Users\hharp\pai\friday
npm run android
```

App opens on your phone automatically!

---

## 🐛 Common Errors & Fixes

### **Error: "Could not connect to development server"**

**Fix 1:** Use tunnel mode
```powershell
npx expo start --tunnel
```

**Fix 2:** Add firewall rules (see Option 2 above)

**Fix 3:** Use USB (see Option 3 above)

---

### **Error: "Unable to resolve module"**

```powershell
# Clear cache
cd C:\Users\hharp\pai\friday
npm start -- --clear
```

---

### **Error: "Network error" in Expo Go**

**Check:**
- Phone and computer on same WiFi network
- Computer firewall allows port 8081
- Try tunnel mode

---

### **ADB: "No devices found"**

**Fix:**
1. Unplug and replug USB cable
2. On phone: Allow USB debugging popup
3. Try different USB cable/port
4. Install phone manufacturer USB drivers

---

## ✅ Checklist

Before asking for help, verify:

- [ ] Metro running (see `Metro waiting on...` in terminal)
- [ ] Port 8081 listening (`netstat -ano | findstr ":8081"`)
- [ ] Computer IP is 192.168.4.71 (`ipconfig`)
- [ ] Phone on same WiFi network (192.168.4.x)
- [ ] Phone can access backend in browser (http://192.168.4.71:8888/api/health)
- [ ] Firewall rules added OR using tunnel mode
- [ ] Expo Go app installed on phone (or development build)

---

## 🎬 Start Fresh (Nuclear Option)

If nothing works:

```powershell
# 1. Stop all Node processes
Stop-Process -Name "node" -Force

# 2. Clear all caches
cd C:\Users\hharp\pai\friday
Remove-Item -Recurse -Force .expo, node_modules\.cache

# 3. Use tunnel mode
npx expo start --tunnel --clear
```

Scan QR on phone. Should work!

---

## 💡 Best Method for You

**I recommend USB connection because:**
1. ✅ Fastest (no network latency)
2. ✅ Most reliable (no firewall issues)
3. ✅ No tunnel needed (better performance)
4. ✅ Works even without WiFi

**Steps:**
```powershell
# Phone plugged in via USB
adb reverse tcp:8081 tcp:8081
adb reverse tcp:8888 tcp:8888
cd C:\Users\hharp\pai\friday
npm run android
```

Done! App runs on your phone.

---

**Current Status:**
- Metro: ✅ Running on port 8081
- Backend: ✅ Running on port 8888
- Computer IP: ✅ 192.168.4.71
- Issue: Phone can't reach dev server (likely firewall)

**Quick Fix:** Use tunnel mode or USB connection
