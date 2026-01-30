# Docker Deployment Guide

This guide covers deploying Al-Ghazel using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB of RAM available for Docker

## Quick Start

1. **Copy environment configuration:**
   ```bash
   cp .env.docker.example .env.docker
   ```

2. **Update environment variables:**
   Edit `.env.docker` and change sensitive values like:
   - `POSTGRES_PASSWORD`
   - `PGRST_JWT_SECRET`
   - `JWT_SECRET`

3. **Start all services:**
   ```bash
   docker compose -f docker-compose.yml --env-file .env.docker up -d
   ```

4. **Access the application:**
   - Web App: http://localhost:3000
   - Supabase Studio: http://localhost:54323
   - API: http://localhost:54321

## Services

The Docker Compose setup includes:

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| web | al-ghazel-web | 3000 | Next.js application |
| studio | al-ghazel-studio | 54323 | Supabase dashboard |
| kong | al-ghazel-kong | 54321, 54320 | API Gateway |
| api | al-ghazel-api | - | PostgREST API |
| db | al-ghazel-db | 54322 | PostgreSQL database |
| meta | al-ghazel-meta | - | PostgreSQL meta API |
| realtime | al-ghazel-realtime | - | Realtime subscriptions |
| storage | al-ghazel-storage | - | File storage |
| imgproxy | al-ghazel-imgproxy | 54330 | Image transformation |

## Docker Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f web

# Rebuild and restart
docker compose up -d --build

# Remove volumes (WARNING: deletes data)
docker compose down -v
```

## Production Deployment

For production deployment:

1. Use production Supabase credentials instead of local ones
2. Set up proper secrets management (don't commit `.env.docker`)
3. Use a reverse proxy (nginx, traefik) for SSL
4. Configure proper backup strategy for database volumes
5. Set resource limits in docker-compose.yml

### Production Environment Variables

```bash
# Generate new JWT secrets
openssl rand -base64 32

# Use production Supabase project credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-key
```

## Troubleshooting

### Services fail to start

Check Docker logs:
```bash
docker compose logs
```

### Database connection issues

Ensure the database is healthy:
```bash
docker compose ps db
```

### Build fails

Clean and rebuild:
```bash
docker compose down
docker system prune -a
docker compose up -d --build
```

## Data Persistence

Database data is stored in Docker volumes:
- `db_data`: PostgreSQL data
- `storage_data`: File storage data

Backup your volumes regularly:
```bash
docker run --rm -v al-ghazel_db_data:/data -v $(pwd):/backup alpine tar czf /backup/db-backup.tar.gz -C /data .
```
