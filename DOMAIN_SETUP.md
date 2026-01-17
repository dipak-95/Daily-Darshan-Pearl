# 🌐 How to Connect a Domain to Your Admin Panel

When you are ready to connect a domain (e.g., `admin.dailydarshan.com`) to your Admin Panel running on Port 5173, follow these steps.

---

## 1. Point DNS to VPS
Go to your Domain Registrar (Godaddy, Namecheap, Hostinger, etc.):
1.  Create an **A Record**.
2.  **Name**: `admin` (or `@` for root domain).
3.  **Value**: Your VPS IP Address (e.g., `123.45.67.89`).
4.  Save and wait 5-10 minutes.

---

## 2. Install Nginx (Reverse Proxy)
Login to your VPS and install Nginx if you haven't already:

```bash
sudo apt update
sudo apt install nginx -y
```

---

## 3. Create Nginx Configuration
Create a config file for your domain:

```bash
sudo nano /etc/nginx/sites-available/daily-darshan
```

Paste this code (Change `your-domain.com` to your actual domain):

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com; # <--- CHANGE THIS

    location / {
        proxy_pass http://localhost:5173; # Proxy to your Admin Panel Port
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
*Press `Ctrl+O`, `Enter`, then `Ctrl+X` to save and exit.*

---

## 4. Enable the Site
Run these commands to enable the config and restart Nginx:

```bash
# Link the config to sites-enabled
sudo ln -s /etc/nginx/sites-available/daily-darshan /etc/nginx/sites-enabled/

# Test for errors
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

🎉 **Now your Admin Panel is live at `http://your-domain.com`!**

---

## 5. (Optional) Add SSL (HTTPS)
To make it secure (Green Lock), run:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

Follow the prompts, and you will have free HTTPS! 🔒
