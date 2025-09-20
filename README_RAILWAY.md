# EOXS Automation API - Railway Deployment

This is a REST API wrapper around the EOXS Playwright automation script, designed to be deployed on Railway.

## 🚀 Quick Deploy to Railway

### Step 1: Prepare Repository
1. Create a new GitHub repository
2. Upload all these files to the repository
3. Commit and push to GitHub

### Step 2: Deploy on Railway
1. Go to [Railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect the Dockerfile and deploy

### Step 3: Set Environment Variables
In Railway dashboard, go to your project → Variables tab and add:

```
EOXS_EMAIL=sahajkatiyareoxs@gmail.com
EOXS_PASSWORD=Eoxs12345!
NODE_ENV=production
HEADLESS=true
```

### Step 4: Get Your API Endpoint
After deployment, Railway will provide a URL like:
```
https://your-app-name.up.railway.app
```

## 📡 API Endpoints

### 1. Health Check
```bash
GET https://your-app.up.railway.app/health
```

### 2. Create Single Ticket
```bash
POST https://your-app.up.railway.app/create-ticket
Content-Type: application/json

{
  "subject": "Login Issues - Cannot Access Dashboard",
  "customer": "Discount Pipe & Steel",
  "body": "Hi Support Team, I'm having trouble logging into my account...",
  "assignedTo": "Sahaj Katiyar"
}
```

### 3. Create Multiple Tickets (Batch)
```bash
POST https://your-app.up.railway.app/create-tickets-batch
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
- **URL**: `https://your-app.up.railway.app/create-ticket`
- **Headers**: 
  - `Content-Type: application/json`
- **Body**:
```json
{
  "subject": "{{$json.subject}}",
  "customer": "Discount Pipe & Steel",
  "body": "{{$json.body}}",
  "assignedTo": "Sahaj Katiyar"
}
```

### Example n8n Workflow:
```
Email Trigger → Extract Data → HTTP Request (Railway API) → Process Response
```

## 🛠️ Local Testing

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install chromium
```

3. Set environment variables:
```bash
export EOXS_EMAIL="your-email@example.com"
export EOXS_PASSWORD="your-password"
export HEADLESS=true
```

4. Start server:
```bash
npm start
```

5. Test endpoint:
```bash
curl -X POST http://localhost:3000/create-ticket \
  -H "Content-Type: application/json" \
  -d '{"subject": "Test Ticket", "customer": "Discount Pipe & Steel", "body": "Test body"}'
```

## 📊 Features

- ✅ **Headless Browser**: Runs without GUI in production
- ✅ **REST API**: Easy integration with any system
- ✅ **Batch Processing**: Create multiple tickets at once
- ✅ **Error Handling**: Proper HTTP status codes and error messages
- ✅ **Health Checks**: Monitor service status
- ✅ **Docker Support**: Consistent deployment environment
- ✅ **Railway Optimized**: Auto-scaling and monitoring

## 💰 Cost Analysis

**Railway Free Tier:**
- 500 hours/month execution time
- Each ticket creation: ~2-3 minutes
- **Capacity**: ~150-250 tickets/month for FREE

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `EOXS_EMAIL` | EOXS login email | Required |
| `EOXS_PASSWORD` | EOXS login password | Required |
| `NODE_ENV` | Environment mode | development |
| `HEADLESS` | Run browser headless | true in production |
| `PORT` | Server port | 3000 |

## 🚨 Important Notes

1. **Credentials Security**: Never commit credentials to GitHub. Use Railway environment variables.
2. **Rate Limiting**: The script includes delays to avoid overwhelming EOXS servers.
3. **Browser Resources**: Each request launches a browser instance - suitable for moderate usage.
4. **Monitoring**: Use Railway's built-in monitoring to track performance.

## 📞 Support

If you need help with deployment or integration, the API includes detailed error messages and logging for troubleshooting.
