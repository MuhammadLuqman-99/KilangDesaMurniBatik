# SSL Certificates Directory

Place your SSL certificates here:
- `fullchain.pem` - Full certificate chain
- `privkey.pem` - Private key

## Using Let's Encrypt

```bash
# Install certbot
sudo apt install certbot

# Get certificate (standalone mode - stop nginx first)
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./
```

## Using custom certificates

Simply place your certificate files here with the names above.

## After adding certificates

1. Uncomment the HTTPS server block in `nginx.conf`
2. Update `server_name` with your domain
3. Restart nginx: `docker compose restart nginx`
