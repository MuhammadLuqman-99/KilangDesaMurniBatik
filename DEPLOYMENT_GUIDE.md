# Deployment Guide - Kilang Desa Murni Batik

## Git Config (PENTING!)

Sebelum push ke GitHub, pastikan git config guna email yang betul:

```bash
# Check current config
git config --global user.name
git config --global user.email

# Set correct email (jika belum set)
git config --global user.name "Luqman"
git config --global user.email "Luqmandevops99@gmail.com"
```

---

## Server Info

| Item | Value |
|------|-------|
| VPS IP | `72.62.67.167` |
| Code Path | `/opt/kilang` |
| Container Prefix | `kilang-*` |
| Database | PostgreSQL (`kilang-postgres`) |

---

## Quick Deploy Commands

### Deploy Frontend Storefront (kilangdesamurnibatik.com)
```bash
ssh root@72.62.67.167 "cd /opt/kilang/frontend-storefront && git pull origin main && cd ../infra-platform && docker compose build frontend-storefront && docker compose up -d --no-deps frontend-storefront"
```

### Deploy Frontend Admin (admin.kilangdesamurnibatik.com)
```bash
ssh root@72.62.67.167 "cd /opt/kilang/frontend-admin && git pull origin main && cd ../infra-platform && docker compose build frontend-admin && docker compose up -d --no-deps frontend-admin"
```

### Deploy Service Catalog
```bash
ssh root@72.62.67.167 "cd /opt/kilang/service-catalog && git pull origin main && cd ../infra-platform && docker compose build service-catalog && docker compose up -d --no-deps service-catalog"
```

### Deploy Service Order
```bash
ssh root@72.62.67.167 "cd /opt/kilang/service-order && git pull origin main && cd ../infra-platform && docker compose build service-order && docker compose up -d --no-deps service-order"
```

### Deploy Service Inventory
```bash
ssh root@72.62.67.167 "cd /opt/kilang/service-inventory && git pull origin main && cd ../infra-platform && docker compose build service-inventory && docker compose up -d --no-deps service-inventory"
```

### Deploy All Services
```bash
ssh root@72.62.67.167 "cd /opt/kilang/infra-platform && docker compose build && docker compose up -d"
```

---

## Step-by-Step Deployment

### 1. SSH ke VPS
```bash
ssh root@72.62.67.167
```

### 2. Navigate ke service yang nak update
```bash
cd /opt/kilang/<service-name>
# contoh: cd /opt/kilang/frontend-storefront
```

### 3. Pull latest code
```bash
git pull origin main
```

### 4. Build dan restart container
```bash
cd /opt/kilang/infra-platform
docker compose build <service-name>
docker compose up -d --no-deps <service-name>
```

### 5. Check status
```bash
docker compose ps <service-name>
docker compose logs --tail=50 <service-name>
```

---

## Services List

| Service | Container | Port | URL |
|---------|-----------|------|-----|
| frontend-storefront | kilang-storefront | 3000 | kilangdesamurnibatik.com |
| frontend-admin | kilang-admin | 3001 | admin.kilangdesamurnibatik.com |
| frontend-warehouse | kilang-warehouse | 3002 | warehouse.kilangdesamurnibatik.com |
| service-auth | kilang-auth | 8001 | /api/v1/auth |
| service-catalog | kilang-catalog | 8002 | /api/v1/catalog |
| service-inventory | kilang-inventory | 8003 | /api/v1/inventory |
| service-order | kilang-order | 8005 | /api/v1/orders |
| service-customer | kilang-customer | 8004 | /api/v1/customers |
| service-agent | kilang-agent | 8006 | /api/v1/agent |
| service-notification | kilang-notification | 8007 | - |
| service-reporting | kilang-reporting | 8008 | /api/v1/reports |
| service-marketplace | kilang-marketplace | 8009 | /api/v1/marketplace |
| service-support | kilang-support | 8010 | /api/v1/support |

---

## Check Service Health

```bash
# SSH dulu
ssh root@72.62.67.167

# Check semua containers
cd /opt/kilang/infra-platform
docker compose ps

# Check specific service logs
docker compose logs --tail=100 frontend-storefront
docker compose logs --tail=100 service-catalog

# Restart specific service
docker compose restart frontend-storefront
```

---

## Database Backup

```bash
# Backup database
ssh root@72.62.67.167 "docker exec kilang-postgres pg_dump -U kilang kilang_batik > /root/backup_$(date +%Y%m%d).sql"

# Download backup ke local
scp root@72.62.67.167:/root/backup_*.sql ./
```

---

## Rollback

Kalau ada masalah:

```bash
ssh root@72.62.67.167

cd /opt/kilang/<service-name>
# Check previous commits
git log --oneline -10

# Rollback ke commit sebelum
git checkout <commit-hash>

# Rebuild
cd ../infra-platform
docker compose build <service-name>
docker compose up -d --no-deps <service-name>
```

---

## Troubleshooting

### Container tak start
```bash
docker compose logs --tail=100 <service-name>
```

### Out of disk space
```bash
# Clear unused Docker images
docker system prune -a

# Check disk usage
df -h
```

### Database connection issue
```bash
# Restart postgres
docker compose restart postgres

# Check postgres logs
docker compose logs --tail=50 postgres
```
