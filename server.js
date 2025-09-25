const express = require('express');
const EOXSTicketChecker = require('./eoxs_ticket_checker');

const app = express();
const PORT = process.env.PORT || 3000;

// Hardcode credentials for Railway deployment (temporary fix)
process.env.EOXS_EMAIL = 'sahajkatiyareoxs@gmail.com';
process.env.EOXS_PASSWORD = 'Eoxs12345!';
process.env.HEADLESS = 'true';
process.env.NODE_ENV = 'production';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'EOXS Ticket Checker API is running',
        version: '1.0.0',
        description: 'API to check if tickets exist in EOXS system',
        endpoints: {
            'POST /check-ticket': 'Check if a ticket exists in EOXS system',
            'GET /health': 'Health check endpoint'
        },
        usage: {
            method: 'POST',
            url: '/check-ticket',
            body: {
                subject: 'Ticket title/subject to search for',
                project: 'Project name (optional, defaults to Test Support)',
                section: 'Section to search in (optional, defaults to Resolved)',
                exact: 'Boolean - if true, requires exact match; if false/omitted, allows partial matches (default: false)'
            },
            example: {
                subject: 'Login Issues - Cannot Access Dashboard',
                project: 'Test Support',
                section: 'Resolved',
                exact: false
            }
        },
        response: {
            success: true,
            found: true,
            answer: 'Yes',
            data: {
                subject: 'Login Issues - Cannot Access Dashboard',
                project: 'Test Support',
                section: 'Resolved',
                ticketExists: true,
                timestamp: '2025-09-20T08:00:00.000Z'
            }
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Debug endpoint to check environment variables
app.get('/debug-env', (req, res) => {
    res.json({
        hasEoxsEmail: !!process.env.EOXS_EMAIL,
        hasEoxsPassword: !!process.env.EOXS_PASSWORD,
        nodeEnv: process.env.NODE_ENV,
        headless: process.env.HEADLESS,
        emailLength: process.env.EOXS_EMAIL ? process.env.EOXS_EMAIL.length : 0,
        passwordLength: process.env.EOXS_PASSWORD ? process.env.EOXS_PASSWORD.length : 0
    });
});

// Ticket checker endpoint - Main functionality
app.post('/check-ticket', async (req, res) => {
    try {
        console.log('🔍 Received ticket check request:', req.body);
        
        const {
            subject = 'Testing',
            project = 'Test Support',
            section = 'Resolved',
            exact = false
        } = req.body;

        if (!subject) {
            return res.status(400).json({
                success: false,
                error: 'Subject parameter is required'
            });
        }

        console.log('🔍 Starting ticket check for:', {
            subject,
            project,
            section,
            exact
        });

        // Set environment variables for the checker script BEFORE creating the checker
        process.env.EMAIL_SUBJECT = subject;
        process.env.HEADLESS = 'true';
        process.env.NODE_ENV = 'production';
        process.env.EXACT_MATCH = exact.toString();

        // Create and run checker (after environment variables are set)
        const checker = new EOXSTicketChecker();
        const result = await checker.run();

        console.log('📊 Ticket check result:', result);

        // Always return the found status, even if there were errors during navigation
        // The script can still determine if a ticket exists even if some steps fail
        res.json({
            success: result.success,
            found: result.found,
            answer: result.answer,
            data: {
                subject,
                project,
                section,
                exact,
                ticketExists: result.found,
                timestamp: new Date().toISOString()
            },
            // Include error details if there were issues, but don't fail the request
            ...(result.error && { warning: result.error })
        });

    } catch (error) {
        console.error('❌ Ticket Check API Error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('❌ Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        availableEndpoints: [
            'GET /',
            'GET /health',
            'GET /debug-env',
            'POST /check-ticket'
        ]
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 EOXS Ticket Checker API server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`🔍 Check ticket: POST http://localhost:${PORT}/check-ticket`);
    console.log(`📧 Environment check:`, {
        hasEmail: !!process.env.EOXS_EMAIL,
        hasPassword: !!process.env.EOXS_PASSWORD,
        nodeEnv: process.env.NODE_ENV || 'development'
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    process.exit(0);
});

module.exports = app;
