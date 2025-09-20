# EOXS Ticket Checker - Deployment Guide

This guide provides comprehensive instructions for hosting the EOXS Ticket Checker application on various platforms.

## 📁 Project Structure

```
Ticket Checker/
├── server.js                           # Main Express server
├── eoxs_playwright_automation_with_log.js  # Core automation script
├── package.json                        # Node.js dependencies
├── package-lock.json                   # Dependency lock file
├── Dockerfile                          # Docker configuration
├── .dockerignore                       # Docker ignore file
├── railway.json                        # Railway deployment config
├── config.env                          # Environment variables template
├── README_RAILWAY.md                   # Railway-specific instructions
└── DEPLOYMENT_GUIDE.md                 # This file
```

## 🚀 Quick Start - Local Development

### 1. Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### 2. Setup
```bash
cd "Ticket Checker"
npm install
npx playwright install chromium
```

### 3. Configuration
```bash
# Copy and edit environment variables
cp config.env .env
# Edit .env with your credentials
```

### 4. Run Locally
```bash
export EOXS_EMAIL="your-email@example.com"
export EOXS_PASSWORD="your-password"
export NODE_ENV="production"
export HEADLESS="true"
export PORT="3000"
npm start
```

### 5. Test
```bash
curl http://localhost:3000/health
curl http://localhost:3000/
```

## 🐳 Docker Deployment

### Build Docker Image
```bash
docker build -t eoxs-ticket-checker .
```

### Run Docker Container
```bash
docker run -d \
  --name eoxs-ticket-checker \
  -p 3000:3000 \
  -e EOXS_EMAIL="your-email@example.com" \
  -e EOXS_PASSWORD="your-password" \
  -e NODE_ENV="production" \
  -e HEADLESS="true" \
  eoxs-ticket-checker
```

### Docker Compose
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  eoxs-ticket-checker:
    build: .
    ports:
      - "3000:3000"
    environment:
      - EOXS_EMAIL=your-email@example.com
      - EOXS_PASSWORD=your-password
      - NODE_ENV=production
      - HEADLESS=true
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

## ☁️ Cloud Deployment Options

### 1. Railway (Recommended)

Railway is the easiest option with built-in Docker support.

#### Steps:
1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/eoxs-ticket-checker.git
   git push -u origin main
   ```

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway auto-detects Dockerfile

3. **Set Environment Variables**
   In Railway dashboard → Variables:
   ```
   EOXS_EMAIL=sahajkatiyareoxs@gmail.com
   EOXS_PASSWORD=Eoxs12345!
   NODE_ENV=production
   HEADLESS=true
   PORT=3000
   ```

4. **Get Your URL**
   Railway provides: `https://your-app-name.up.railway.app`

### 2. Heroku

#### Steps:
1. **Install Heroku CLI**
   ```bash
   # Ubuntu/Debian
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Login and Create App**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set EOXS_EMAIL="your-email@example.com"
   heroku config:set EOXS_PASSWORD="your-password"
   heroku config:set NODE_ENV="production"
   heroku config:set HEADLESS="true"
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### 3. DigitalOcean App Platform

#### Steps:
1. **Create App**
   - Go to DigitalOcean App Platform
   - Connect GitHub repository
   - Select "Docker" as source type

2. **Configure Environment**
   - Set environment variables in dashboard
   - Use same variables as Railway

3. **Deploy**
   - DigitalOcean auto-builds from Dockerfile

### 4. AWS ECS/Fargate

#### Steps:
1. **Push to ECR**
   ```bash
   aws ecr create-repository --repository-name eoxs-ticket-checker
   docker tag eoxs-ticket-checker:latest your-account.dkr.ecr.region.amazonaws.com/eoxs-ticket-checker:latest
   docker push your-account.dkr.ecr.region.amazonaws.com/eoxs-ticket-checker:latest
   ```

2. **Create ECS Task Definition**
   - Use the pushed image
   - Set environment variables
   - Configure port 3000

3. **Create ECS Service**
   - Use Application Load Balancer
   - Set up auto-scaling

### 5. Google Cloud Run

#### Steps:
1. **Build and Push**
   ```bash
   gcloud builds submit --tag gcr.io/your-project/eoxs-ticket-checker
   ```

2. **Deploy**
   ```bash
   gcloud run deploy eoxs-ticket-checker \
     --image gcr.io/your-project/eoxs-ticket-checker \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars EOXS_EMAIL="your-email",EOXS_PASSWORD="your-password"
   ```

## 🔧 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `EOXS_EMAIL` | EOXS login email | Yes | - |
| `EOXS_PASSWORD` | EOXS login password | Yes | - |
| `NODE_ENV` | Environment mode | No | development |
| `HEADLESS` | Run browser headless | No | true |
| `PORT` | Server port | No | 3000 |

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

### Create Single Ticket
```bash
POST /create-ticket
Content-Type: application/json

{
  "subject": "Login Issues",
  "customer": "Discount Pipe & Steel",
  "body": "Customer cannot access dashboard",
  "assignedTo": "Sahaj Katiyar"
}
```

### Create Multiple Tickets
```bash
POST /create-tickets-batch
Content-Type: application/json

{
  "tickets": [
    {
      "subject": "Login Issues",
      "customer": "Discount Pipe & Steel",
      "body": "Cannot access dashboard"
    },
    {
      "subject": "Password Reset",
      "customer": "Discount Pipe & Steel",
      "body": "Need password reset"
    }
  ]
}
```

## 🔗 n8n Integration

### HTTP Request Node Configuration:
- **Method**: POST
- **URL**: `https://your-deployed-url/create-ticket`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "subject": "{{$json.subject}}",
  "customer": "Discount Pipe & Steel",
  "body": "{{$json.body}}",
  "assignedTo": "Sahaj Katiyar"
}
```

## 💰 Cost Comparison

| Platform | Free Tier | Paid Plans | Best For |
|----------|-----------|------------|----------|
| Railway | 500 hours/month | $5/month | Quick deployment |
| Heroku | 550 hours/month | $7/month | Established platform |
| DigitalOcean | $5/month | $5/month | Simple pricing |
| AWS ECS | Pay per use | Pay per use | Enterprise |
| Google Cloud Run | 2M requests/month | Pay per use | Serverless |

## 🚨 Security Best Practices

1. **Never commit credentials to Git**
2. **Use environment variables for secrets**
3. **Enable HTTPS in production**
4. **Set up monitoring and alerts**
5. **Regular security updates**

## 📊 Monitoring

### Health Checks
- Built-in `/health` endpoint
- Returns uptime and timestamp
- Use for load balancer health checks

### Logs
- Application logs via console.log
- Browser automation logs
- Error tracking with stack traces

### Metrics
- Response times
- Success/failure rates
- Resource usage (CPU, memory)

## 🛠️ Troubleshooting

### Common Issues

1. **Browser Installation Failed**
   ```bash
   npx playwright install chromium --force
   ```

2. **Port Already in Use**
   ```bash
   # Find process using port 3000
   lsof -i :3000
   # Kill process
   kill -9 PID
   ```

3. **Environment Variables Not Set**
   ```bash
   # Check if variables are set
   echo $EOXS_EMAIL
   ```

4. **Docker Build Fails**
   ```bash
   # Clear Docker cache
   docker system prune -a
   ```

### Debug Mode
Set `NODE_ENV=development` to see detailed logs and run browser in non-headless mode.

## 📞 Support

For deployment issues:
1. Check logs in your hosting platform
2. Test locally first
3. Verify environment variables
4. Check network connectivity to EOXS

## 🎯 Next Steps

After deployment:
1. Test all API endpoints
2. Set up monitoring
3. Configure domain name (optional)
4. Set up CI/CD pipeline
5. Document your specific deployment
