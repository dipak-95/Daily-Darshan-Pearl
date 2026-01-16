# 🚀 Daily Darshan - VPS Deployment Guide

This guide will help you deploy your **Daily Darshan** project (Backend + Admin Panel) to a VPS (e.g., Hostinger, DigitalOcean, AWS) running Ubuntu.

---

## 🛠️ Step 1: Prepare Your VPS

Login to your server via SSH and run these commands to install necessary software:

```bash
# 1. Update System
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js (Version 20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install PM2 (Process Manager to keep apps running)
sudo npm install -g pm2

# 4. Install 'serve' (To serve the Admin Panel)
sudo npm install -g serve
```

---

## 📂 Step 2: Upload Your Code

You have two folders to upload:
1. `backend/`
2. `admin/`

**Option A: Using FileZilla (Easiest)**
1. Connect to your VPS using SFTP.
2. Create a folder named `daily-darshan` in `/home/root/` or `/var/www/`.
3. Drag and drop the `backend` and `admin` folders from your computer into this new folder.

**Option B: Using Git**
1. Push your code to GitHub.
2. Clone it on the VPS:
   ```bash
   git clone <your-repo-url> daily-darshan
   cd daily-darshan
   ```

---

## ⚙️ Step 3: Deploy Backend (API)

1. **Navigate to the backend folder:**
   ```bash
   cd daily-darshan/backend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start the Server:**
   ```bash
   # Start with PM2 (Name it 'dd-api')
   pm2 start server.js --name dd-api
   ```

   *Your backend is now running on Port 5000!*

---

## 🖥️ Step 4: Deploy Admin Panel

1. **Navigate to the admin folder:**
   ```bash
   cd ../admin
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure API URL:**
   Before building, you must tell the Admin Panel your VPS IP address. Run this command (replace `YOUR_VPS_IP` with your actual IP, e.g., `123.45.67.89`):

   ```bash
   # Linux/Mac
   export VITE_API_URL=http://YOUR_VPS_IP:5000
   
   # Windows (Powershell) - usually simpler to just edit .env manually if building locally, 
   # but ON VPS, use the export command above.
   ```

   *Or, create a file named `.env` in the `admin` folder with this content:*
   ```env
   VITE_API_URL=http://YOUR_VPS_IP:5000
   ```

4. **Build the Project:**
   ```bash
   npm run build
   ```

   *This creates a `dist` folder.*

5. **Serve the Admin Panel:**
   ```bash
   # Serve the 'dist' folder on Port 5173
   pm2 start "serve -s dist -l 5173" --name dd-admin
   ```

6. **Save PM2 List:**
   ```bash
   pm2 save
   pm2 startup
   ```

---

## 📱 Step 5: Connect Mobile App

Now that your server is live, update your Mobile App code on your laptop:

1. Open `mobile-app/src/constants/Config.ts`.
2. Change `API_BASE_URL` and `IMAGE_BASE_URL` to your VPS IP:
   ```typescript
   export const Config = {
       API_BASE_URL: 'http://YOUR_VPS_IP:5000/api',
       IMAGE_BASE_URL: 'http://YOUR_VPS_IP:5000'
   };
   ```
3. Build your APK!

---

## 🔥 Access Links

- **Backend Status:** `http://YOUR_VPS_IP:5000`
- **Admin Panel:** `http://YOUR_VPS_IP:5173`
