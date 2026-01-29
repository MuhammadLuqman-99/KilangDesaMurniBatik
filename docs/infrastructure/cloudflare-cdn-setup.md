# Cloudflare CDN Setup Guide
## Kilang Desa Murni Batik - store.kilangdesamurnibatik.com

This guide provides step-by-step instructions to configure Cloudflare CDN for your storefront.

---

## Why Cloudflare?

| Benefit | Impact |
|---------|--------|
| **Global CDN** | 300+ edge locations worldwide, faster load times |
| **Free SSL** | Automatic HTTPS with Universal SSL |
| **DDoS Protection** | Always-on attack mitigation |
| **Caching** | Reduces origin server load by 60-80% |
| **Web Analytics** | Free privacy-focused analytics |
| **Page Rules** | Fine-grained cache control |

---

## Step 1: Create Cloudflare Account

1. Go to [cloudflare.com](https://cloudflare.com)
2. Click "Sign Up"
3. Enter email and create password
4. Verify your email

---

## Step 2: Add Your Domain

1. In Cloudflare dashboard, click **"Add a Site"**
2. Enter: `kilangdesamurnibatik.com`
3. Select **Free plan** (sufficient for your needs)
4. Click **"Continue"**

Cloudflare will scan your existing DNS records.

---

## Step 3: Update DNS Records

After scan, verify these records exist (add if missing):

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| A | `@` | `72.62.67.167` | Proxied (orange cloud) |
| A | `store` | `72.62.67.167` | Proxied (orange cloud) |
| A | `admin` | `72.62.67.167` | Proxied (orange cloud) |
| CNAME | `www` | `kilangdesamurnibatik.com` | Proxied (orange cloud) |

**Important:** Enable the orange cloud (Proxied) for CDN benefits.

---

## Step 4: Update Nameservers

Cloudflare will provide 2 nameservers like:
```
aria.ns.cloudflare.com
omar.ns.cloudflare.com
```

Update at your domain registrar:

### For Namecheap:
1. Login to Namecheap
2. Domain List → Manage → Nameservers
3. Select "Custom DNS"
4. Enter Cloudflare nameservers
5. Save

### For GoDaddy:
1. Login to GoDaddy
2. My Products → DNS → Manage
3. Change Nameservers → Enter my own
4. Add Cloudflare nameservers

**Wait time:** 24-48 hours for propagation (usually faster)

---

## Step 5: Configure SSL/TLS

1. Go to **SSL/TLS** in Cloudflare dashboard
2. Set encryption mode to **"Full (strict)"**
3. Enable these options:
   - ✅ Always Use HTTPS
   - ✅ Automatic HTTPS Rewrites
   - ✅ TLS 1.3
   - ✅ Minimum TLS Version: 1.2

---

## Step 6: Configure Caching

### Cache Rules (Settings → Caching → Configuration)

1. **Caching Level:** Standard
2. **Browser Cache TTL:** Respect Existing Headers
3. **Always Online:** Enable

### Page Rules (Rules → Page Rules)

Create these 3 rules:

**Rule 1: Static Assets (High Priority)**
```
URL: store.kilangdesamurnibatik.com/_next/static/*
Setting: Cache Level → Cache Everything
         Edge Cache TTL → 1 month
         Browser Cache TTL → 1 year
```

**Rule 2: Images**
```
URL: store.kilangdesamurnibatik.com/storage/*
Setting: Cache Level → Cache Everything
         Edge Cache TTL → 1 week
         Browser Cache TTL → 1 day
```

**Rule 3: API (No Cache)**
```
URL: store.kilangdesamurnibatik.com/api/*
Setting: Cache Level → Bypass
         Disable Performance
```

---

## Step 7: Configure Speed Settings

Go to **Speed → Optimization**:

### Auto Minify
- ✅ JavaScript
- ✅ CSS
- ✅ HTML

### Brotli Compression
- ✅ Enable

### Early Hints
- ✅ Enable

### HTTP/2 & HTTP/3
- ✅ Enable both

### Rocket Loader
- ❌ Disable (can conflict with Next.js)

---

## Step 8: Security Settings

Go to **Security → Settings**:

1. **Security Level:** Medium
2. **Challenge Passage:** 30 minutes
3. **Browser Integrity Check:** Enable

Go to **Security → WAF**:
1. Enable **Managed Rules** (free tier available)
2. Enable **Rate Limiting** if needed for flash sales

---

## Step 9: Update Nginx Configuration

After Cloudflare is active, update Nginx to trust Cloudflare IPs:

```nginx
# /infra-platform/nginx/nginx.conf

# Trust Cloudflare IPs for real visitor IP
set_real_ip_from 173.245.48.0/20;
set_real_ip_from 103.21.244.0/22;
set_real_ip_from 103.22.200.0/22;
set_real_ip_from 103.31.4.0/22;
set_real_ip_from 141.101.64.0/18;
set_real_ip_from 108.162.192.0/18;
set_real_ip_from 190.93.240.0/20;
set_real_ip_from 188.114.96.0/20;
set_real_ip_from 197.234.240.0/22;
set_real_ip_from 198.41.128.0/17;
set_real_ip_from 162.158.0.0/15;
set_real_ip_from 104.16.0.0/13;
set_real_ip_from 104.24.0.0/14;
set_real_ip_from 172.64.0.0/13;
set_real_ip_from 131.0.72.0/22;

# Use CF-Connecting-IP header
real_ip_header CF-Connecting-IP;
```

---

## Step 10: Verify Setup

### Check DNS Propagation
```bash
# Should return Cloudflare IP, not your VPS IP
nslookup store.kilangdesamurnibatik.com
```

### Check Headers
```bash
curl -I https://store.kilangdesamurnibatik.com
# Look for: cf-ray, cf-cache-status headers
```

### Expected Response Headers
```
cf-ray: 8abc123-SIN
cf-cache-status: HIT  # or MISS, DYNAMIC
server: cloudflare
```

---

## Step 11: Monitor Performance

### Cloudflare Analytics
1. Go to **Analytics & Logs → Traffic**
2. Monitor:
   - Requests saved by caching
   - Bandwidth saved
   - Threats blocked

### Web Analytics (Optional)
1. Go to **Analytics → Web Analytics**
2. Add tracking script (already have GA4, so optional)

---

## Troubleshooting

### Issue: Site not loading after DNS change
- **Wait:** DNS propagation can take up to 48 hours
- **Check:** Use [whatsmydns.net](https://whatsmydns.net) to verify propagation

### Issue: Mixed content warnings
- Enable "Automatic HTTPS Rewrites" in SSL/TLS settings
- Check your site for hard-coded `http://` URLs

### Issue: Slow dynamic content
- Ensure API routes have "Bypass Cache" rule
- Check origin server performance

### Issue: Cart/Login issues
- Disable Rocket Loader
- Check cookie settings in Page Rules

---

## Recommended Cloudflare Apps (Free)

1. **Google Analytics** - If not using code-based
2. **HSTS** - Automatic via Cloudflare
3. **HTTP/3** - Already included

---

## Cost Estimate

| Plan | Cost | Features |
|------|------|----------|
| **Free** | $0/month | CDN, SSL, DDoS, Basic WAF |
| **Pro** | $20/month | Image optimization, Mobile redirect, WAF rules |
| **Business** | $200/month | Custom SSL, 100% uptime SLA |

**Recommendation:** Start with Free plan. Upgrade to Pro when you need image optimization (Cloudflare Polish).

---

## Quick Checklist

- [ ] Created Cloudflare account
- [ ] Added domain to Cloudflare
- [ ] Updated nameservers at registrar
- [ ] Waited for DNS propagation
- [ ] Set SSL mode to "Full (strict)"
- [ ] Enabled "Always Use HTTPS"
- [ ] Created Page Rules for caching
- [ ] Configured speed settings
- [ ] Updated Nginx to trust Cloudflare IPs
- [ ] Verified cf-ray header in responses

---

## Support Resources

- [Cloudflare Learning Center](https://www.cloudflare.com/learning/)
- [Cloudflare Community](https://community.cloudflare.com/)
- [Status Page](https://www.cloudflarestatus.com/)

---

**Estimated Setup Time:** 30-60 minutes (excluding DNS propagation)
**Impact:** 40-60% improvement in page load times for users outside Malaysia
