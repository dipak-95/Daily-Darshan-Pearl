# 🚀 Deploying to Hostinger VPS (Ubuntu)

Follow these steps to deploy your Admin Panel to your VPS

## Prerequisites on VPS
Run these commands on your VPS (via SSH or Terminal):

1. **Update System:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Node.js (v18+):**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

3. **Install PM2 (Process Manager):**
   ```bash
   sudo npm install -g pm2
   ```

4. **Install Git (if not installed):**
   ```bash
   sudo apt install git -y
   ```

---

## Deployment Steps

1. **Upload Code:**
   - Option A: Push your code to GitHub and clone it on VPS.
     ```bash
     git clone <your-repo-url>
     cd spectral-hubble/admin-panel
     ```
   - Option B: Upload the project folder via FileZilla (SFTP).

2. **Setup Environment Variables:**
   Create a `.env.local` file in the `admin-panel` folder on VPS:
   ```bash
   nano .env.local
   ```
   Paste your MongoDB URI:
   ```env
   MONGODB_URI=mongodb+srv://dailydarshan06_db_user:DailyDarshan%4006@cluster0.zkmglpx.mongodb.net/daily_darshan_db?retryWrites=true&w=majority&appName=Cluster0
   ```
   Save and Exit (Ctrl+O, Enter, Ctrl+X).

3. **Install Dependencies & Build:**
   ```bash
   npm install
   npm run build
   ```

4. **Start Server with PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## Live URL
Your Admin Panel will be live at: `http://<YOUR_VPS_IP>:3000`

## Updating Mobile App
Update `mobile-app/src/constants/Config.ts` with your VPS IP:
```typescript
API_BASE_URL: 'http://<YOUR_VPS_IP>:3000/api',
BASE_URL: 'http://<YOUR_VPS_IP>:3000',
```
