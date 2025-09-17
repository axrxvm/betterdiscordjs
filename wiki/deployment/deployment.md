# Deployment Guide

This guide covers deploying your @axrxvm/betterdiscordjs bot to various platforms and environments.

## Prerequisites

Before deploying your bot, ensure you have:

1. **Discord Application**: Created on [Discord Developer Portal](https://discord.com/developers/applications)
2. **Bot Token**: Generated for your application
3. **Bot Permissions**: Properly configured OAuth2 scopes and permissions
4. **Environment Variables**: Configured for production

## Environment Configuration

### Environment Variables

Create a `.env` file for local development and configure these variables for production:

```env
# Required
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_bot_client_id

# Optional
BOT_OWNER_ID=your_user_id
PREFIX=!
NODE_ENV=production

# Database (if using)
DATABASE_URL=your_database_url
REDIS_URL=your_redis_url

# Logging
LOG_LEVEL=info
LOG_CHANNEL_ID=channel_id_for_error_logs

# API Keys (if needed)
WEATHER_API_KEY=your_weather_api_key
```

### Production Environment Setup

```javascript
// config/production.js
module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  prefix: process.env.PREFIX || '!',
  // your own database configurations
  database: {
    url: process.env.DATABASE_URL,
    options: {
      ssl: true,
      connectionLimit: 10
    }
  },
  redis: {
    url: process.env.REDIS_URL
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    errorChannel: process.env.LOG_CHANNEL_ID
  }
};
```

## Platform Deployment

### Heroku

#### 1. Prepare Your Application

Create necessary files:

**Procfile:**
```
worker: node index.js
```

**package.json scripts:**
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

#### 2. Deploy to Heroku

```bash
# Install Heroku CLI and login
heroku login

# Create Heroku app
heroku create your-bot-name

# Set environment variables
heroku config:set DISCORD_TOKEN=your_token
heroku config:set CLIENT_ID=your_client_id
heroku config:set NODE_ENV=production

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Scale worker dyno
heroku ps:scale worker=1
```

#### 3. Add Database (Optional)

```bash
# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Add Redis
heroku addons:create heroku-redis:hobby-dev

# View config
heroku config
```

### Railway

#### 1. Deploy via GitHub

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

#### 2. Railway Configuration

**railway.json:**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node index.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### DigitalOcean App Platform

#### 1. App Spec Configuration

**.do/app.yaml:**
```yaml
name: discord-bot
services:
- name: bot
  source_dir: /
  github:
    repo: your-username/your-bot-repo
    branch: main
  run_command: node index.js
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: DISCORD_TOKEN
    value: your_token
    type: SECRET
  - key: CLIENT_ID
    value: your_client_id
  - key: NODE_ENV
    value: production
```

### AWS EC2

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Clone your repository
git clone https://github.com/your-username/your-bot.git
cd your-bot

# Install dependencies
npm install --production
```

#### 2. PM2 Configuration

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'discord-bot',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      DISCORD_TOKEN: 'your_token',
      CLIENT_ID: 'your_client_id'
    }
  }]
};
```

#### 3. Start with PM2

```bash
# Start bot
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Monitor
pm2 monit
```

### Docker Deployment

#### 1. Dockerfile

```dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S botuser -u 1001

# Change ownership
RUN chown -R botuser:nodejs /usr/src/app
USER botuser

# Expose port (if needed for health checks)
EXPOSE 3000

# Start the bot
CMD ["node", "index.js"]
```

#### 2. Docker Compose

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  bot:
    build: .
    environment:
      - DISCORD_TOKEN=${DISCORD_TOKEN}
      - CLIENT_ID=${CLIENT_ID}
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    restart: unless-stopped
    depends_on:
      - redis
      - postgres

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=botdb
      - POSTGRES_USER=botuser
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  redis_data:
  postgres_data:
```

#### 3. Deploy with Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f bot

# Update
docker-compose pull
docker-compose up -d
```

### Kubernetes Deployment

#### 1. Deployment Configuration

**k8s/deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: discord-bot
spec:
  replicas: 1
  selector:
    matchLabels:
      app: discord-bot
  template:
    metadata:
      labels:
        app: discord-bot
    spec:
      containers:
      - name: bot
        image: your-registry/discord-bot:latest
        env:
        - name: DISCORD_TOKEN
          valueFrom:
            secretKeyRef:
              name: bot-secrets
              key: discord-token
        - name: CLIENT_ID
          valueFrom:
            configMapKeyRef:
              name: bot-config
              key: client-id
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
```

#### 2. ConfigMap and Secret

**k8s/configmap.yaml:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: bot-config
data:
  client-id: "your_client_id"
  node-env: "production"
```

**k8s/secret.yaml:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: bot-secrets
type: Opaque
data:
  discord-token: base64_encoded_token
```

## Database Setup

### PostgreSQL

```javascript
// database/postgres.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize tables
async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(20) PRIMARY KEY,
      data JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS guilds (
      id VARCHAR(20) PRIMARY KEY,
      data JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

module.exports = { pool, initDatabase };
```

### Redis Setup

```javascript
// database/redis.js
const Redis = require('redis');

const redis = Redis.createClient({
  url: process.env.REDIS_URL,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('Redis server connection refused');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Redis retry time exhausted');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

module.exports = redis;
```

## Monitoring and Logging

### Health Check Endpoint

```javascript
// Add to your bot
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    bot: {
      guilds: bot.client.guilds.cache.size,
      users: bot.client.users.cache.size,
      ping: bot.client.ws.ping
    }
  };
  
  res.json(health);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
});
```

### Logging Configuration

```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'discord-bot' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

## Security Best Practices

### 1. Environment Variables

Never commit sensitive data to version control:

```bash
# .gitignore
.env
.env.local
.env.production
config/secrets.js
```

### 2. Input Validation

```javascript
// Validate all user inputs
function validateInput(input, type, maxLength = 2000) {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input type');
  }
  
  if (input.length > maxLength) {
    throw new Error('Input too long');
  }
  
  // Sanitize based on type
  switch (type) {
    case 'username':
      return input.replace(/[^\w\s-]/g, '').trim();
    case 'message':
      return input.replace(/<@[!&]?\d+>/g, '[mention]').trim();
    default:
      return input.trim();
  }
}
```

### 3. Rate Limiting

```javascript
// Implement rate limiting
const rateLimits = new Map();

function checkRateLimit(userId, action, limit = 5, window = 60000) {
  const key = `${userId}:${action}`;
  const now = Date.now();
  
  if (!rateLimits.has(key)) {
    rateLimits.set(key, []);
  }
  
  const attempts = rateLimits.get(key);
  const validAttempts = attempts.filter(time => now - time < window);
  
  if (validAttempts.length >= limit) {
    return false;
  }
  
  validAttempts.push(now);
  rateLimits.set(key, validAttempts);
  return true;
}
```

## Performance Optimization

### 1. Connection Pooling

```javascript
// Database connection pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

### 2. Caching Strategy

```javascript
// Multi-level caching
class CacheManager {
  constructor() {
    this.memory = new Map();
    this.redis = require('./redis');
  }
  
  async get(key) {
    // Try memory first
    if (this.memory.has(key)) {
      return this.memory.get(key);
    }
    
    // Try Redis
    const cached = await this.redis.get(key);
    if (cached) {
      const data = JSON.parse(cached);
      this.memory.set(key, data);
      return data;
    }
    
    return null;
  }
  
  async set(key, value, ttl = 3600) {
    this.memory.set(key, value);
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
}
```

### 3. Graceful Shutdown

```javascript
// Graceful shutdown handling
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function gracefulShutdown(signal) {
  console.log(`Received ${signal}, shutting down gracefully...`);
  
  // Stop accepting new requests
  server.close(() => {
    console.log('HTTP server closed');
  });
  
  // Close database connections
  await pool.end();
  await redis.quit();
  
  // Destroy Discord client
  bot.client.destroy();
  
  console.log('Shutdown complete');
  process.exit(0);
}
```

## Troubleshooting

### Common Issues

1. **Bot not responding to commands**
   - Check bot permissions
   - Verify token is correct
   - Ensure bot is online

2. **Database connection errors**
   - Check connection string
   - Verify database is accessible
   - Check firewall settings

3. **Memory leaks**
   - Monitor memory usage
   - Clear unused caches
   - Check for event listener leaks

### Debugging

```javascript
// Debug logging
if (process.env.NODE_ENV === 'development') {
  bot.client.on('debug', console.log);
  bot.client.on('warn', console.warn);
}

// Error tracking
bot.client.on('error', (error) => {
  console.error('Discord client error:', error);
  // Send to error tracking service
});
```

## Scaling Considerations

### Horizontal Scaling

For large bots, consider:

1. **Sharding**: Split bot across multiple processes
2. **Load Balancing**: Distribute requests across instances
3. **Database Sharding**: Split data across multiple databases
4. **Microservices**: Break bot into smaller services

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries
- Implement better caching
- Use CDN for static assets

This deployment guide provides a comprehensive overview of deploying @axrxvm/betterdiscordjs bots to various platforms with proper security, monitoring, and scaling considerations.## N
ext Steps

Your bot is now deployed! Continue improving:

1. 📋 [Best Practices](./best-practices.md) - Follow production-ready guidelines
2. 📊 [Advanced Use Cases](../examples/advanced.md) - Scale with advanced patterns
3. 🔧 [Bot Class API](../api/bot.md) - Unlock more bot capabilities
4. 🔌 [Plugin System](../plugins/overview.md) - Add modular functionality






