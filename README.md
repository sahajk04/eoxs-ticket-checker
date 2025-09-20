# EOXS Ticket Checker

An automated ticket creation system for EOXS using Playwright and Express.js. This application provides a REST API to create tickets in the EOXS system with automatic log note addition.

## 🎯 Features

- ✅ **Automated Ticket Creation**: Creates tickets in EOXS system via browser automation
- ✅ **REST API**: Easy integration with any system (n8n, Zapier, etc.)
- ✅ **Batch Processing**: Create multiple tickets at once
- ✅ **Log Note Addition**: Automatically adds log notes to created tickets
- ✅ **Docker Support**: Ready for cloud deployment
- ✅ **Health Monitoring**: Built-in health checks and monitoring
- ✅ **Error Handling**: Comprehensive error handling and logging

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone or download the project
cd "Ticket Checker"

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Configure environment (optional)
cp config.env .env
# Edit .env with your EOXS credentials
```

### Running the Application

#### Option 1: Using the startup script (Recommended)
```bash
./start.sh
```

#### Option 2: Manual startup
```bash
export EOXS_EMAIL="your-email@example.com"
export EOXS_PASSWORD="your-password"
export NODE_ENV="production"
export HEADLESS="true"
export PORT="3000"
npm start
```

#### Option 3: Using Docker
```bash
docker build -t eoxs-ticket-checker .
docker run -d -p 3000:3000 \
  -e EOXS_EMAIL="your-email@example.com" \
  -e EOXS_PASSWORD="your-password" \
  eoxs-ticket-checker
```

## 📡 API Endpoints

### Health Check
```bash
GET /health
```
Returns server status and uptime.

### Create Single Ticket
```bash
POST /create-ticket
Content-Type: application/json

{
  "subject": "Login Issues - Cannot Access Dashboard",
  "customer": "Discount Pipe & Steel",
  "body": "Hi Support Team, I'm having trouble logging into my account...",
  "assignedTo": "Sahaj Katiyar"
}
```

### Create Multiple Tickets (Batch)
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

### API Documentation
Visit `http://localhost:3000/` for complete API documentation.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `EOXS_EMAIL` | EOXS login email | Yes | - |
| `EOXS_PASSWORD` | EOXS login password | Yes | - |
| `NODE_ENV` | Environment mode | No | development |
| `HEADLESS` | Run browser headless | No | true |
| `PORT` | Server port | No | 3000 |

### Configuration File
Edit `config.env` to set your environment variables:
```bash
EOXS_EMAIL=your-email@example.com
EOXS_PASSWORD=your-password
NODE_ENV=production
HEADLESS=true
PORT=3000
```

## 🔗 Integration Examples

### n8n Workflow
1. **Email Trigger Node**: Trigger on new emails
2. **Extract Data Node**: Parse email subject and body
3. **HTTP Request Node**: Call this API
   - Method: POST
   - URL: `http://localhost:3000/create-ticket`
   - Body:
     ```json
     {
       "subject": "{{$json.subject}}",
       "customer": "Discount Pipe & Steel",
       "body": "{{$json.body}}",
       "assignedTo": "Sahaj Katiyar"
     }
     ```
4. **Response Node**: Handle API response

### Zapier Integration
1. **Trigger**: Email received
2. **Action**: Webhooks by Zapier
3. **URL**: Your deployed API endpoint
4. **Method**: POST
5. **Data**: Map email fields to API parameters

### Python Script
```python
import requests

def create_ticket(subject, body):
    url = "http://localhost:3000/create-ticket"
    data = {
        "subject": subject,
        "customer": "Discount Pipe & Steel",
        "body": body,
        "assignedTo": "Sahaj Katiyar"
    }
    response = requests.post(url, json=data)
    return response.json()

# Usage
result = create_ticket("Login Issue", "Customer cannot login")
print(result)
```

## 🐳 Docker Deployment

### Build and Run
```bash
# Build image
docker build -t eoxs-ticket-checker .

# Run container
docker run -d \
  --name eoxs-ticket-checker \
  -p 3000:3000 \
  -e EOXS_EMAIL="your-email@example.com" \
  -e EOXS_PASSWORD="your-password" \
  eoxs-ticket-checker
```

### Docker Compose
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

## ☁️ Cloud Deployment

This application is ready for deployment on:
- **Railway** (Recommended - see `railway.json`)
- **Heroku**
- **DigitalOcean App Platform**
- **AWS ECS/Fargate**
- **Google Cloud Run**

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## 🧪 Testing

### Local Testing
```bash
# Start the server
./start.sh

# Test health endpoint
curl http://localhost:3000/health

# Test API documentation
curl http://localhost:3000/

# Test ticket creation
curl -X POST http://localhost:3000/create-ticket \
  -H "Content-Type: application/json" \
  -d '{"subject": "Test Ticket", "customer": "Discount Pipe & Steel", "body": "Test body"}'
```

### Docker Testing
```bash
# Build and test
docker build -t eoxs-ticket-checker .
docker run -p 3000:3000 \
  -e EOXS_EMAIL="your-email@example.com" \
  -e EOXS_PASSWORD="your-password" \
  eoxs-ticket-checker

# Test in another terminal
curl http://localhost:3000/health
```

## 📊 Monitoring

### Health Checks
- **Endpoint**: `GET /health`
- **Response**: Server status, uptime, timestamp
- **Use for**: Load balancer health checks, monitoring

### Logs
- Application logs via `console.log`
- Browser automation logs
- Error tracking with stack traces

### Metrics to Monitor
- Response times
- Success/failure rates
- Resource usage (CPU, memory)
- Ticket creation success rate

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

### Logs Location
- Application logs: Console output
- Screenshots: `screenshot_*.png` files (in development mode)
- Browser logs: Included in console output

## 🔒 Security

### Best Practices
1. **Never commit credentials to Git**
2. **Use environment variables for secrets**
3. **Enable HTTPS in production**
4. **Set up monitoring and alerts**
5. **Regular security updates**

### Production Checklist
- [ ] Environment variables set securely
- [ ] HTTPS enabled
- [ ] Health checks configured
- [ ] Monitoring set up
- [ ] Error tracking configured
- [ ] Rate limiting implemented (if needed)

## 📈 Performance

### Optimization Tips
1. **Use headless mode in production** (`HEADLESS=true`)
2. **Monitor resource usage**
3. **Set appropriate timeouts**
4. **Use connection pooling** (if multiple instances)
5. **Cache browser instances** (advanced)

### Scaling Considerations
- Each ticket creation uses ~2-3 minutes
- Browser automation is CPU intensive
- Consider horizontal scaling for high volume
- Monitor memory usage per instance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review logs for error details
3. Test locally first
4. Verify environment variables
5. Check network connectivity to EOXS

## 🎯 Roadmap

- [ ] Add authentication/API keys
- [ ] Implement rate limiting
- [ ] Add ticket status updates
- [ ] Support for custom fields
- [ ] Bulk operations optimization
- [ ] Webhook notifications
- [ ] Admin dashboard
