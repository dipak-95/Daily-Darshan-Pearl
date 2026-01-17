# 🚀 Daily Darshan - VPS Deployment Guide (Multiple Projects)

Since you already have a project running on Port 3000, we will run **Daily Darshan** on different ports to avoid conflicts.

---

## 🛠️ Step 1: Login & Clone

1.  Login to your VPS.
2.  Navigate to your projects folder (e.g., `/var/www` or `/home`).
3.  Clone the repository:
    ```bash
    git clone https://github.com/dipak-95/Daily-Darshan-Pearl.git Daily-Darshan
    cd Daily-Darshan
    ```

---

## ⚙️ Step 2: Deploy Backend (API)

1.  Navigate to folder:
    ```bash
    cd backend
    ```
2.  Install:
    ```bash
    npm install
    ```
3.  **Start on Port 5000** (Default):
    ```bash
    pm2 start server.js --name dd-api -- --port 5000
    ```
    *(If 5000 is also busy, change it in `.env` or pass `--port 5001`)*

---

## 🖥️ Step 3: Deploy Admin Panel (Port 5173 or 4000)

Since Port 3000 is taken, we will serve the Admin Panel on **Port 5173** (Standard Vite port) or **4000**.

1.  Navigate to admin folder:
    ```bash
    cd ../admin
    ```
2.  Install:
    ```bash
    npm install
    ```
3.  **Set API URL for Production:**
    ```bash
    export VITE_API_URL=http://YOUR_VPS_IP:5000
    ```
4.  Build:
    ```bash
    npm run build
    ```
5.  **Start on Port 5173**:
    ```bash
    pm2 start "serve -s dist -l 5173" --name dd-admin
    ```
    *If you want Port 4000 instead, change `5173` to `4000` in the command above.*

6.  Save PM2:
    ```bash
    pm2 save
    ```

---

## 📱 Step 4: Final Checks

-   **Backend**: `http://YOUR_VPS_IP:5000`
-   **Admin Panel**: `http://YOUR_VPS_IP:5173` (or 4000)
-   **Old Project**: `http://YOUR_VPS_IP:3000` (Unharmed ✅)

---

## 📲 Step 5: Update Mobile App

In your local VS Code:
1.  Open `mobile-app/src/constants/Config.ts`.
2.  Update the URL to match your VPS IP:
    ```typescript
    export const Config = {
        API_BASE_URL: 'http://YOUR_VPS_IP:5000/api',
        IMAGE_BASE_URL: 'http://YOUR_VPS_IP:5000'
    };
    ```
3.  Build your APK.
