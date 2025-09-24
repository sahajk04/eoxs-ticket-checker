# n8n Integration Guide for EOXS Ticket Checker

This guide shows you how to integrate the EOXS Ticket Checker API with n8n for automated email processing and ticket checking workflows.

## 🎯 Use Case

**Scenario**: When you receive an email, automatically check if a ticket with the same subject already exists in EOXS before taking any action.

## 🔗 n8n Workflow Setup

### Step 1: Email Trigger Node
1. **Add Email Trigger Node**
   - Trigger: "Email Trigger (IMAP)"
   - Configure your email settings
   - Set up filters for specific senders or keywords

### Step 2: HTTP Request Node (Ticket Checker)
1. **Add HTTP Request Node**
   - **Method**: `POST`
   - **URL**: `https://your-deployed-url/check-ticket`
   - **Headers**: 
     ```json
     {
       "Content-Type": "application/json"
     }
     ```
   - **Body**:
     ```json
     {
       "subject": "{{ $json.subject }}",
       "project": "Test Support",
       "section": "Resolved"
     }
     ```

### Step 3: IF Node (Conditional Logic)
1. **Add IF Node**
   - **Condition**: `{{ $json.found === true }}`
   - **True Path**: Ticket exists
   - **False Path**: Ticket doesn't exist

### Step 4: Response Actions
1. **If Ticket Exists** (True Path):
   - Add a "Set" node to log the result
   - Optionally send notification
   
2. **If Ticket Doesn't Exist** (False Path):
   - Create new ticket (using another API)
   - Send notification to team
   - Forward email to support queue

## 📋 Complete n8n Workflow Example

```json
{
  "nodes": [
    {
      "name": "Email Trigger",
      "type": "n8n-nodes-base.emailTriggerImap",
      "parameters": {
        "host": "imap.gmail.com",
        "port": 993,
        "secure": true,
        "username": "your-email@gmail.com",
        "password": "your-app-password"
      }
    },
    {
      "name": "Check Ticket",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://eoxs-ticket-checker-production.up.railway.app/check-ticket",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "subject": "{{ $json.subject }}",
          "project": "Test Support",
          "section": "Resolved"
        }
      }
    },
    {
      "name": "Ticket Exists?",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "{{ $json.found }}",
              "operation": "equal",
              "value2": true
            }
          ]
        }
      }
    },
    {
      "name": "Ticket Found",
      "type": "n8n-nodes-base.set",
      "parameters": {
        "values": {
          "string": [
            {
              "name": "status",
              "value": "Ticket already exists"
            },
            {
              "name": "action",
              "value": "No action needed"
            }
          ]
        }
      }
    },
    {
      "name": "Ticket Not Found",
      "type": "n8n-nodes-base.set",
      "parameters": {
        "values": {
          "string": [
            {
              "name": "status",
              "value": "New ticket needed"
            },
            {
              "name": "action",
              "value": "Create ticket"
            }
          ]
        }
      }
    }
  ],
  "connections": {
    "Email Trigger": {
      "main": [
        [
          {
            "node": "Check Ticket",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Check Ticket": {
      "main": [
        [
          {
            "node": "Ticket Exists?",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Ticket Exists?": {
      "main": [
        [
          {
            "node": "Ticket Found",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Ticket Not Found",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## 🔧 Advanced n8n Configurations

### 1. Email Subject Processing
```json
{
  "subject": "{{ $json.subject.replace(/^Re:\s*/i, '').replace(/^Fwd:\s*/i, '') }}"
}
```

### 2. Multiple Project Checking
```json
{
  "subject": "{{ $json.subject }}",
  "project": "{{ $json.from.includes('urgent') ? 'High Priority' : 'Test Support' }}",
  "section": "Resolved"
}
```

### 3. Error Handling
Add an "On Error" node after the HTTP Request:
- **Continue on Error**: `true`
- **Error Message**: `{{ $json.error }}`

## 🚀 Testing Your Integration

### Test with cURL
```bash
curl -X POST https://eoxs-ticket-checker-production.up.railway.app/check-ticket \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Login Issues - Cannot Access Dashboard",
    "project": "Test Support",
    "section": "Resolved"
  }'
```

### Test in n8n
1. Use "Manual Trigger" node for testing
2. Set test data:
   ```json
   {
     "subject": "Test Email Subject",
     "from": "test@example.com",
     "body": "Test email body"
   }
   ```

## 📊 Expected API Responses

### Ticket Found
```json
{
  "success": true,
  "found": true,
  "answer": "Yes",
  "data": {
    "subject": "Login Issues - Cannot Access Dashboard",
    "project": "Test Support",
    "section": "Resolved",
    "ticketExists": true,
    "timestamp": "2025-09-20T08:12:33.995Z"
  }
}
```

### Ticket Not Found
```json
{
  "success": true,
  "found": false,
  "answer": "No",
  "data": {
    "subject": "New Issue",
    "project": "Test Support",
    "section": "Resolved",
    "ticketExists": false,
    "timestamp": "2025-09-20T08:12:33.995Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Subject parameter is required"
}
```

## 🎯 Common n8n Use Cases

### 1. Email Support Automation
- **Trigger**: New email in support inbox
- **Action**: Check if ticket exists
- **Result**: Auto-reply or create new ticket

### 2. Duplicate Prevention
- **Trigger**: Manual ticket creation
- **Action**: Check for existing tickets
- **Result**: Prevent duplicates

### 3. Status Monitoring
- **Trigger**: Scheduled webhook
- **Action**: Check specific tickets
- **Result**: Update external systems

## 🔧 Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if your deployed API is running
   - Verify the URL is correct

2. **Authentication Errors**
   - Ensure EOXS credentials are set in environment variables
   - Check if credentials are still valid

3. **Timeout Errors**
   - The API takes 2-3 minutes to check tickets
   - Increase timeout in n8n HTTP Request node

4. **Invalid JSON Response**
   - Check if the API is returning proper JSON
   - Verify Content-Type header is set correctly

### Debug Mode
Set `NODE_ENV=development` to see detailed logs and run browser in non-headless mode for debugging.

## 📞 Support

For issues with n8n integration:
1. Check n8n execution logs
2. Test API directly with cURL
3. Verify environment variables are set
4. Check browser automation logs

