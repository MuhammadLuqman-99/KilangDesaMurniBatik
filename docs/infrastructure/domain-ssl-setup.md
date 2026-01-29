# Domain & SSL Setup Guide
## GoDaddy Domain + Hostinger VPS

Step-by-step guide untuk setup domain dan SSL certificate.

---

## Step 1: Dapatkan Hostinger VPS IP Address

1. Login ke [Hostinger hPanel](https://hpanel.hostinger.com)
2. Pilih VPS anda
3. Copy **IP Address** (contoh: `123.456.789.10`)

---

## Step 2: Configure GoDaddy DNS

1. Login ke [GoDaddy](https://dcc.godaddy.com)
2. Pergi ke **My Products** → **Domains**
3. Klik domain anda → **DNS** atau **Manage DNS**

4. **Delete existing A records** (kalau ada)

5. **Add new A records:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `YOUR_VPS_IP` | 600 |
| A | www | `YOUR_VPS_IP` | 600 |
| A | admin | `YOUR_VPS_IP` | 600 |
| A | warehouse | `YOUR_VPS_IP` | 600 |
| A | api | `YOUR_VPS_IP` | 600 |

6. Klik **Save**

7. **Wait 5-30 minutes** untuk DNS propagation

8. **Verify DNS** (run di terminal):
```bash
nslookup yourdomain.com
# Should return your VPS IP
```

---

## Step 3: SSH ke Hostinger VPS

```bash
# Dari Windows (PowerShell)
ssh root@YOUR_VPS_IP

# Atau gunakan PuTTY dengan:
# Host: YOUR_VPS_IP
# Port: 22
# Username: root
```

---

## Step 4: Install Certbot (Let's Encrypt)

```bash
# Update system
apt update && apt upgrade -y

# Install certbot
apt install certbot -y
```

---

## Step 5: Get SSL Certificate

**PENTING**: Stop nginx dulu sebelum run certbot!

```bash
# Stop nginx (kalau running)
docker compose -f /path/to/infra-platform/docker-compose.vps.yml stop nginx

# Get SSL certificate (ganti dengan domain anda)
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certbot akan tanya email - masukkan email anda
# Agree to terms - Y
# Share email - N (optional)
```

**Certificate akan disimpan di:**
- `/etc/letsencrypt/live/yourdomain.com/fullchain.pem`
- `/etc/letsencrypt/live/yourdomain.com/privkey.pem`

---

## Step 6: Copy Certificates ke Project

```bash
# Create SSL directory
mkdir -p /opt/kilang/infra-platform/nginx/ssl

# Copy certificates
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/kilang/infra-platform/nginx/ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /opt/kilang/infra-platform/nginx/ssl/

# Set permissions
chmod 644 /opt/kilang/infra-platform/nginx/ssl/*.pem
```

---

## Step 7: Update Nginx Configuration

Edit `/opt/kilang/infra-platform/nginx/nginx.conf`:

1. Uncomment HTTPS server block
2. Update `server_name` dengan domain anda
3. Pastikan SSL paths betul

---

## Step 8: Update Environment Variables

Edit `/opt/kilang/infra-platform/.env`:

```bash
DOMAIN=yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_MINIO_URL=https://yourdomain.com/storage
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## Step 9: Rebuild & Restart Services

```bash
cd /opt/kilang/infra-platform

# Rebuild frontends with new URLs
docker compose -f docker-compose.vps.yml build frontend-storefront frontend-admin frontend-warehouse

# Restart all services
docker compose -f docker-compose.vps.yml up -d
```

---

## Step 10: Setup Auto-Renewal

```bash
# Test renewal
certbot renew --dry-run

# Add cron job for auto-renewal
crontab -e

# Add this line (renew at 3am every day):
0 3 * * * certbot renew --quiet --pre-hook "docker compose -f /opt/kilang/infra-platform/docker-compose.vps.yml stop nginx" --post-hook "docker compose -f /opt/kilang/infra-platform/docker-compose.vps.yml start nginx"
```

---

## Step 11: Verify Setup

```bash
# Check all services running
docker compose -f docker-compose.vps.yml ps

# Test HTTPS
curl -I https://yourdomain.com

# Should see:
# HTTP/2 200
# ...
```

**Test di browser:**
- https://yourdomain.com (Storefront)
- https://yourdomain.com/admin (Admin Dashboard)
- https://yourdomain.com/warehouse (Warehouse Portal)

---

## Troubleshooting

### DNS not propagated
```bash
# Check DNS
nslookup yourdomain.com

# If still showing old IP, wait more or try:
nslookup yourdomain.com 8.8.8.8
```

### Certbot "port 80 in use" error
```bash
# Find what's using port 80
lsof -i :80

# Stop it first
docker compose -f docker-compose.vps.yml stop nginx
```

### Certificate renewal failed
```bash
# Check certbot logs
cat /var/log/letsencrypt/letsencrypt.log

# Manual renewal
certbot renew --force-renewal
```

### Browser shows "Not Secure"
- Check SSL files exist: `ls -la /opt/kilang/infra-platform/nginx/ssl/`
- Check nginx logs: `docker compose logs nginx`
- Verify nginx config: `docker compose exec nginx nginx -t`

---

## Quick Reference

| What | Where |
|------|-------|
| SSL Certificates | `/etc/letsencrypt/live/yourdomain.com/` |
| Nginx SSL Copy | `/opt/kilang/infra-platform/nginx/ssl/` |
| Nginx Config | `/opt/kilang/infra-platform/nginx/nginx.conf` |
| Environment | `/opt/kilang/infra-platform/.env` |
