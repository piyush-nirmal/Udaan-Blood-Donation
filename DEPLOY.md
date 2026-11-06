# UDAAN Production Deployment Guide

## 1. Server Setup (Ubuntu 22.04 / 24.04)
```bash
sudo apt update && sudo apt install -y curl ufw
curl -fsSL https://get.docker.com | sh
sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw enable
git clone <repo_url> /opt/udaan-app && cd /opt/udaan-app
cp .env.example .env && mkdir -p secrets # place Firebase serviceAccountKey.json into ./secrets/
```

## 2. First Run & Boot
```bash
docker compose up -d --build
docker compose exec backend python manage.py createsuperuser
# Staging/demo seeding only:
docker compose exec backend python manage.py seed_demo
```

## 3. SSL with Certbot & Rollback
```bash
sudo docker compose run --rm --entrypoint "certbot certonly --webroot -w /var/www/certbot -d yourdomain.org --email admin@yourdomain.org --agree-tos --no-eff-email" nginx
# Backup (daily cron): 0 2 * * * docker compose exec -T postgres pg_dump -U udaan_user udaan_db > /backup/udaan_$(date +\%F).sql
# Rollback: git reset --hard <PREV_TAG> && docker compose up -d --build
```
