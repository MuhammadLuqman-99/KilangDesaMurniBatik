# KILANG DESA MURNI BATIK - Production Setup Guide

## ⚠️ IMPORTANT: Production Configuration

This document contains the **OFFICIAL** production setup to prevent configuration conflicts.

---

## 🌐 Production Environment

- **VPS IP**: `72.62.67.167`
- **Base URL**: `http://72.62.67.167`
- **Docker Network**: `infra-platform_kilang-network`

---

## 📁 Service URLs

### Frontend Applications
- **Admin Panel**: `http://72.62.67.167/admin`
- **Storefront**: `http://72.62.67.167/`
- **Warehouse**: `http://72.62.67.167/warehouse`

### API Endpoints
- **Auth Service**: `http://72.62.67.167/api/v1/auth`
- **Catalog Service**: `http://72.62.67.167/api/v1/catalog`
- **Inventory Service**: `http://72.62.67.167/api/v1/inventory`
- **Order Service**: `http://72.62.67.167/api/v1/orders`
- **Customer Service**: `http://72.62.67.167/api/v1/customer`
- **Storage (MinIO)**: `http://72.62.67.167/storage`

---

## 🔐 Default Credentials

### Admin Login
- **URL**: `http://72.62.67.167/admin/login`
- **Email**: `admin@kilang.com`
- **Password**: `Admin1234`

---

## ⚙️ Environment Variables

### For ALL Frontend Applications (.env)
```env
NEXT_PUBLIC_API_URL=http://72.62.67.167/api/v1
NEXT_PUBLIC_MINIO_URL=http://72.62.67.167/storage
NEXT_PUBLIC_USE_MOCK=false
NODE_ENV=production
```

### ❌ NEVER USE THESE IN PRODUCTION:
```env
# WRONG - DO NOT USE
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1
NEXT_PUBLIC_MINIO_URL=http://localhost:9000
```

---

## 🐳 Docker Container Management

### Check Container Status
```bash
ssh root@72.62.67.167 "docker ps | grep kilang"
```

### Restart a Service
```bash
# Frontend services
ssh root@72.62.67.167 "docker restart kilang-admin"
ssh root@72.62.67.167 "docker restart kilang-storefront"
ssh root@72.62.67.167 "docker restart kilang-warehouse"

# Backend services
ssh root@72.62.67.167 "docker restart kilang-auth"
ssh root@72.62.67.167 "docker restart kilang-catalog"
ssh root@72.62.67.167 "docker restart kilang-inventory"
```

### View Logs
```bash
ssh root@72.62.67.167 "docker logs --tail 50 kilang-admin"
```

### CORRECT Docker Network
All containers MUST use: `infra-platform_kilang-network`

```bash
# Example: Starting a container correctly
docker run -d \
  --name kilang-admin \
  --network infra-platform_kilang-network \
  -e NEXT_PUBLIC_API_URL=http://72.62.67.167/api/v1 \
  -e NEXT_PUBLIC_MINIO_URL=http://72.62.67.167/storage \
  --restart unless-stopped \
  infra-platform-frontend-admin
```

---

## 🚀 Deployment Process

### 1. Pull Latest Code
```bash
# In main repository
git pull origin main

# Pull all submodules
./pull-all-repos.ps1  # Windows
./pull-all-repos.sh   # Linux/Mac
```

### 2. Build and Deploy
```bash
# Deploy all services
./deploy-to-vps.sh all

# Deploy specific service
./deploy-to-vps.sh admin
./deploy-to-vps.sh storefront
```

### 3. Verify Deployment
1. Check container status: All should be "healthy" or "running"
2. Test login at `http://72.62.67.167/admin/login`
3. Check API: `curl http://72.62.67.167/api/v1/auth/health`

---

## 🔧 Troubleshooting

### Problem: "Connection Refused" or "localhost:8080" errors

**Cause**: Frontend is using localhost instead of VPS IP

**Solution**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Check container environment:
   ```bash
   ssh root@72.62.67.167 "docker exec kilang-admin env | grep NEXT_PUBLIC"
   ```
3. Should show:
   ```
   NEXT_PUBLIC_API_URL=http://72.62.67.167/api/v1
   NEXT_PUBLIC_MINIO_URL=http://72.62.67.167/storage
   ```
4. If wrong, restart container with correct env vars

### Problem: 502 Bad Gateway

**Cause**: Container not running or on wrong network

**Solution**:
1. Check if container is running
2. Ensure it's on `infra-platform_kilang-network`
3. Restart container if needed

### Problem: Login fails with correct credentials

**Cause**: Auth service issue

**Solution**:
1. Test API directly:
   ```bash
   curl -X POST http://72.62.67.167/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@kilang.com","password":"Admin1234"}'
   ```
2. Check auth service logs:
   ```bash
   ssh root@72.62.67.167 "docker logs --tail 50 kilang-auth"
   ```

---

## 📋 Pre-Deployment Checklist

Before deploying to production:

- [ ] All `.env` files use `http://72.62.67.167` (NOT localhost)
- [ ] No `localhost` references in source code
- [ ] Docker containers use `infra-platform_kilang-network`
- [ ] Build with production environment variables
- [ ] Test login works after deployment
- [ ] Clear browser cache after deployment

---

## 🛑 Common Mistakes to Avoid

1. **DON'T** use `localhost` anywhere in production code
2. **DON'T** create new Docker networks (use existing `infra-platform_kilang-network`)
3. **DON'T** forget to set environment variables when building images
4. **DON'T** use development `.env` files in production
5. **DON'T** deploy without testing the API endpoints first

---

## 📞 Quick Commands

```bash
# SSH to VPS
ssh root@72.62.67.167

# Check all services
curl http://72.62.67.167/nginx-health

# Test auth
curl http://72.62.67.167/api/v1/auth/health

# Restart everything
ssh root@72.62.67.167 "docker restart $(docker ps -q --filter name=kilang)"
```

---

## 📝 Notes

- JWT tokens expire after 15 minutes (access) and 7 days (refresh)
- Auto-refresh is handled by the frontend
- All services must be on the same Docker network for internal communication
- Nginx handles all routing - services don't need external ports except through nginx

---

**Last Updated**: December 2024
**Maintained By**: Kilang Desa Murni Batik Development Team