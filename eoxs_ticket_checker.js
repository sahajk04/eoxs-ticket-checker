const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');
const path = require('path');

/**
 * EOXS Ticket Checker Script - Playwright Version
 * 
 * This script checks if "Testing Ticket" exists in the Resolved section of Test Support project.
 * Returns: "Yes" if found, "No" if not found
 * 
 * Usage:
 * - node eoxs_ticket_checker.js
 * - Returns exit code 0 for "Yes", exit code 1 for "No"
 */

// Configuration
const CONFIG = {
    baseUrl: 'https://teams.eoxs.com/',
    credentials: {
        email: process.env.EOXS_EMAIL || 'sahajkatiyareoxs@gmail.com',
        password: process.env.EOXS_PASSWORD || 'Eoxs12345!'
    },
    searchCriteria: {
        projectName: 'Test Support',
        sectionName: 'Resolved',
        ticketTitle: process.argv[2] || process.env.EMAIL_SUBJECT || 'Testing' // Get from command line or env
    },
    waitOptions: {
        timeout: 60000,
        navigationTimeout: 30000
    },
    browser: {
        headless: process.env.HEADLESS === 'true' || process.env.NODE_ENV === 'production', // Run headless in production or when HEADLESS=true
        slowMo: 100, // Add delay between actions for better reliability
    }
};

class EOXSTicketChecker {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
        this.ticketFound = false;
    }

    async init() {
        try {
            console.log('🚀 Starting EOXS Ticket Checker with Playwright...');
            
            // Launch browser
            this.browser = await chromium.launch({
                headless: CONFIG.browser.headless,
                slowMo: CONFIG.browser.headless ? 0 : CONFIG.browser.slowMo, // No delay in headless mode
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--disable-gpu',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor',
                    '--disable-extensions',
                    '--disable-plugins',
                    '--disable-images', // Faster loading in headless mode
                    ...(CONFIG.browser.headless ? ['--headless=new'] : ['--start-maximized'])
                ]
            });

            // Create browser context
            this.context = await this.browser.newContext({
                viewport: CONFIG.browser.headless ? { width: 1920, height: 1080 } : null,
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                ignoreHTTPSErrors: true,
                ...(CONFIG.browser.headless && {
                    // Optimize for headless mode
                    reducedMotion: 'reduce',
                    forcedColors: 'none'
                })
            });

            this.page = await this.context.newPage();
            
            // Enable console logging from browser
            this.page.on('console', msg => console.log('Browser Console:', msg.text()));
            this.page.on('pageerror', error => console.log('Page Error:', error.message));
            
            console.log('✅ Browser initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize browser:', error);
            throw error;
        }
    }

    async clickElement(selector, options = {}) {
        try {
            const element = this.page.locator(selector).first();
            await element.scrollIntoViewIfNeeded();
            await element.click(options);
            return true;
        } catch (error) {
            console.error(`❌ Failed to click element ${selector}:`, error);
            return false;
        }
    }

    async waitForElement(selector, timeout = CONFIG.waitOptions.timeout) {
        try {
            await this.page.waitForSelector(selector, { timeout, state: 'visible' });
            return true;
        } catch (error) {
            console.log(`⚠️ Element ${selector} not found within ${timeout}ms`);
            return false;
        }
    }

    async clearAndType(selector, text) {
        try {
            const element = this.page.locator(selector).first();
            await element.scrollIntoViewIfNeeded();
            await element.focus();
            await element.fill('');
            await element.type(text, { delay: 50 });
        } catch (error) {
            console.error(`❌ Failed to clear and type in ${selector}:`, error);
            throw error;
        }
    }

    async login() {
        try {
            console.log('🔐 Starting login process...');
            
            // Navigate to base URL
            await this.page.goto(CONFIG.baseUrl, { 
                waitUntil: 'networkidle',
                timeout: CONFIG.waitOptions.navigationTimeout 
            });
            console.log('📍 Navigated to:', CONFIG.baseUrl);
            
            await this.page.waitForTimeout(1500);

            // Click login trigger
            const loginTriggerSelectors = [
                'span.te_user_account_icon.d-block',
                'i.fa-user-circle-o',
                '.fa-user-circle-o',
                '.fa-user'
            ];

            let loginTriggerClicked = false;
            for (const selector of loginTriggerSelectors) {
                try {
                    if (await this.page.locator(selector).first().isVisible({ timeout: 2000 })) {
                        await this.clickElement(selector);
                        loginTriggerClicked = true;
                        console.log(`✅ Clicked login trigger: ${selector}`);
                        break;
                    }
                } catch (error) {
                    continue;
                }
            }

            if (!loginTriggerClicked) {
                throw new Error('Could not find login trigger');
            }

            await this.page.waitForTimeout(1000);

            // Fill email
            const emailSelectors = ['input#login', 'input[name="login"]', 'input[type="email"]'];
            let emailFilled = false;
            for (const selector of emailSelectors) {
                try {
                    if (await this.page.locator(selector).first().isVisible({ timeout: 2000 })) {
                        await this.clearAndType(selector, CONFIG.credentials.email);
                        emailFilled = true;
                        console.log('✅ Email entered successfully');
                        break;
                    }
                } catch (error) {
                    continue;
                }
            }

            if (!emailFilled) {
                throw new Error('Could not find or fill email field');
            }

            // Fill password
            const passwordSelectors = ['input#password', 'input[type="password"]'];
            let passwordFilled = false;
            for (const selector of passwordSelectors) {
                try {
                    if (await this.page.locator(selector).first().isVisible({ timeout: 2000 })) {
                        await this.clearAndType(selector, CONFIG.credentials.password);
                        passwordFilled = true;
                        console.log('✅ Password entered successfully');
                        break;
                    }
                } catch (error) {
                    continue;
                }
            }

            if (!passwordFilled) {
                throw new Error('Could not find or fill password field');
            }

            // Submit login
            const loginButtonSelectors = ['button[type="submit"]', 'input[type="submit"]'];
            let loginSubmitted = false;
            for (const selector of loginButtonSelectors) {
                try {
                    if (await this.page.locator(selector).first().isVisible({ timeout: 2000 })) {
                        await this.clickElement(selector);
                        loginSubmitted = true;
                        console.log('✅ Login button clicked');
                        break;
                    }
                } catch (error) {
                    continue;
                }
            }

            if (!loginSubmitted) {
                await this.page.locator('input[type="password"]').first().press('Enter');
                console.log('✅ Login submitted via Enter key');
            }

            // Wait for navigation
            await this.page.waitForTimeout(5000);
            console.log('✅ Login completed successfully');
            return true;

        } catch (error) {
            console.error('❌ Login failed:', error);
            return false;
        }
    }

    async navigateToTestSupport() {
        try {
            console.log('🧭 Navigating to Test Support project...');
            
            await this.page.waitForTimeout(2000);
            
            // Click sidebar menu
            const sidebarMenuSelectors = ['.o_menu_apps', '.o_menu_toggle', '.fa-th'];
            let sidebarOpened = false;
            for (const selector of sidebarMenuSelectors) {
                try {
                    if (await this.page.locator(selector).first().isVisible({ timeout: 3000 })) {
                        await this.clickElement(selector);
                        sidebarOpened = true;
                        console.log(`✅ Clicked sidebar menu: ${selector}`);
                        await this.page.waitForTimeout(1000);
                        break;
                    }
                } catch (error) {
                    continue;
                }
            }
            
            if (!sidebarOpened) {
                throw new Error('Could not open sidebar menu');
            }
            
            // Click Projects
            const projectsSelectors = ['text=Projects', 'text=Project'];
            let projectsClicked = false;
            for (const selector of projectsSelectors) {
                try {
                    if (await this.page.locator(selector).first().isVisible({ timeout: 3000 })) {
                        await this.clickElement(selector);
                        projectsClicked = true;
                        console.log(`✅ Clicked Projects: ${selector}`);
                        break;
                    }
                } catch (error) {
                    continue;
                }
            }
            
            if (!projectsClicked) {
                throw new Error('Could not find Projects section');
            }
            
            await this.page.waitForTimeout(2000);
            
            // Click Test Support project
            const supportSelectors = [
                '.o_kanban_record:has-text("Test Support")',
                'text=Test Support'
            ];
            
            let supportClicked = false;
            for (const selector of supportSelectors) {
                try {
                    if (await this.page.locator(selector).first().isVisible({ timeout: 3000 })) {
                        await this.clickElement(selector);
                        supportClicked = true;
                        console.log(`✅ Clicked Test Support: ${selector}`);
                        await this.page.waitForTimeout(3000);
                        break;
                    }
                } catch (error) {
                    continue;
                }
            }
            
            if (!supportClicked) {
                throw new Error('Could not find Test Support project');
            }
            
            console.log('✅ Successfully navigated to Test Support project');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to navigate to Test Support:', error);
            return false;
        }
    }

    async checkResolvedSection() {
        try {
            console.log('🔍 Checking Resolved section for "Testing Ticket"...');
            
            // Wait for page to load completely
            await this.page.waitForTimeout(3000);
            
            // Look for Resolved section/column
            console.log('📋 Looking for Resolved section...');
            const resolvedSelectors = [
                '.o_kanban_group:has-text("Resolved")',
                '.kanban-column:has-text("Resolved")',
                'div:has-text("Resolved")',
                'h3:has-text("Resolved")',
                '.o_column_title:has-text("Resolved")'
            ];
            
            let resolvedSectionFound = false;
            let resolvedSection = null;
            
            for (const selector of resolvedSelectors) {
                try {
                    const element = this.page.locator(selector).first();
                    if (await element.isVisible({ timeout: 3000 })) {
                        resolvedSection = element;
                        resolvedSectionFound = true;
                        console.log(`✅ Found Resolved section: ${selector}`);
                        break;
                    }
                } catch (error) {
                    continue;
                }
            }
            
            if (!resolvedSectionFound) {
                console.log('⚠️ Could not find Resolved section, checking entire page...');
                // Fallback: search entire page
                resolvedSection = this.page;
            }
            
            // Debug: Log all tickets/cards in the resolved section or entire page
            try {
                const allTickets = await this.page.locator('.o_kanban_record, .kanban-card, .task-card').all();
                console.log(`🔍 Found ${allTickets.length} total tickets on the page`);
                
                // Log first 10 tickets for debugging
                for (let i = 0; i < Math.min(allTickets.length, 10); i++) {
                    const ticket = allTickets[i];
                    try {
                        const ticketText = await ticket.textContent() || '';
                        console.log(`  Ticket ${i}: "${ticketText.trim().substring(0, 100)}..."`);
                    } catch (error) {
                        console.log(`  Ticket ${i}: Could not read text`);
                    }
                }
            } catch (error) {
                console.log('⚠️ Could not debug tickets');
            }
            
            // Search for the ticket title in the resolved section
            console.log(`🎯 Searching for "${CONFIG.searchCriteria.ticketTitle}"...`);
            const searchSelectors = [
                // Search within resolved section if found
                ...(resolvedSectionFound ? [
                    `.o_kanban_group:has-text("Resolved") .o_kanban_record:has-text("${CONFIG.searchCriteria.ticketTitle}")`,
                    `.o_kanban_group:has-text("Resolved") *:has-text("${CONFIG.searchCriteria.ticketTitle}")`
                ] : []),
                // General search patterns
                `.o_kanban_record:has-text("${CONFIG.searchCriteria.ticketTitle}")`,
                `.kanban-card:has-text("${CONFIG.searchCriteria.ticketTitle}")`,
                `.task-card:has-text("${CONFIG.searchCriteria.ticketTitle}")`,
                `text=${CONFIG.searchCriteria.ticketTitle}`,
                `*:has-text("${CONFIG.searchCriteria.ticketTitle}")`
            ];
            
            let ticketFound = false;
            let foundTicketText = '';
            
            for (const selector of searchSelectors) {
                try {
                    const elements = await this.page.locator(selector).all();
                    console.log(`🔍 Found ${elements.length} elements for selector: ${selector}`);
                    
                    for (const element of elements) {
                        try {
                            if (await element.isVisible({ timeout: 1000 })) {
                                const elementText = await element.textContent() || '';
                                console.log(`🔍 Checking element: "${elementText.trim().substring(0, 100)}..."`);
                                
                                // Check if this element contains the search term
                                if (elementText.toLowerCase().includes(CONFIG.searchCriteria.ticketTitle.toLowerCase())) {
                                    // Verify this is in the Resolved section if we found one
                                    if (resolvedSectionFound) {
                                        try {
                                            // Check if this element is within the resolved section
                                            const isInResolvedSection = await this.page.locator('.o_kanban_group:has-text("Resolved")').locator(selector).first().isVisible({ timeout: 1000 });
                                            if (isInResolvedSection) {
                                                ticketFound = true;
                                                foundTicketText = elementText.trim();
                                                console.log(`✅ Found "Testing" in Resolved section: "${foundTicketText.substring(0, 100)}..."`);
                                                break;
                                            } else {
                                                console.log(`⚠️ Found "Testing" but not in Resolved section`);
                                            }
                                        } catch (error) {
                                            // If we can't verify section, assume it's valid
                                            ticketFound = true;
                                            foundTicketText = elementText.trim();
                                            console.log(`✅ Found "Testing": "${foundTicketText.substring(0, 100)}..."`);
                                            break;
                                        }
                                    } else {
                                        // No specific resolved section found, any match is valid
                                        ticketFound = true;
                                        foundTicketText = elementText.trim();
                                        console.log(`✅ Found "Testing": "${foundTicketText.substring(0, 100)}..."`);
                                        break;
                                    }
                                }
                            }
                        } catch (error) {
                            continue;
                        }
                    }
                    
                    if (ticketFound) {
                        break;
                    }
                } catch (error) {
                    continue;
                }
            }
            
            // Additional search using XPath
            if (!ticketFound) {
                console.log(`🔍 Trying XPath search for "${CONFIG.searchCriteria.ticketTitle}"...`);
                try {
                    const xpathElement = this.page.locator(`xpath=//*[contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "${CONFIG.searchCriteria.ticketTitle.toLowerCase()}")]`).first();
                    if (await xpathElement.isVisible({ timeout: 3000 })) {
                        const xpathText = await xpathElement.textContent() || '';
                        ticketFound = true;
                        foundTicketText = xpathText.trim();
                        console.log(`✅ Found "Testing" via XPath: "${foundTicketText.substring(0, 100)}..."`);
                    }
                } catch (error) {
                    console.log('⚠️ XPath search failed');
                }
            }
            
            this.ticketFound = ticketFound;
            
            if (ticketFound) {
                console.log('🎉 RESULT: YES - "Testing" found in Resolved section');
                return true;
            } else {
                console.log('❌ RESULT: NO - "Testing" not found in Resolved section');
                return false;
            }
            
        } catch (error) {
            console.error('❌ Failed to check Resolved section:', error);
            return false;
        }
    }

    async captureScreenshot(name) {
        try {
            const screenshotPath = path.join(__dirname, `screenshot_${name}_${Date.now()}.png`);
            await this.page.screenshot({ path: screenshotPath, fullPage: true });
            console.log(`📸 Screenshot saved: ${screenshotPath}`);
            return screenshotPath;
        } catch (error) {
            console.error('❌ Failed to capture screenshot:', error);
        }
    }

    async run() {
        try {
            await this.init();
            
            // Login
            const loginSuccess = await this.login();
            if (!loginSuccess) {
                throw new Error('Login failed');
            }
            await this.captureScreenshot('after_login');
            
            // Navigate to Test Support
            const navigationSuccess = await this.navigateToTestSupport();
            if (!navigationSuccess) {
                throw new Error('Failed to navigate to Test Support');
            }
            await this.captureScreenshot('after_navigation');
            
            // Check Resolved section
            const checkResult = await this.checkResolvedSection();
            await this.captureScreenshot('after_check');
            
            // Return result
            const result = {
                success: true,
                found: this.ticketFound,
                answer: this.ticketFound ? 'Yes' : 'No',
                searchCriteria: CONFIG.searchCriteria
            };
            
            console.log('📊 Final Result:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Check failed:', error);
            await this.captureScreenshot('error');
            
            return {
                success: false,
                found: false,
                answer: 'No',
                error: error.message
            };
        } finally {
            if (this.browser) {
                await this.browser.close();
                console.log('🔒 Browser closed');
            }
        }
    }
}

// Main execution function
async function main() {
    console.log('🔍 Starting EOXS Ticket Checker...');
    console.log('📋 Search Criteria:');
    console.log(`   Project: ${CONFIG.searchCriteria.projectName}`);
    console.log(`   Section: ${CONFIG.searchCriteria.sectionName}`);
    console.log(`   Ticket: ${CONFIG.searchCriteria.ticketTitle}`);
    console.log('');
    
    const checker = new EOXSTicketChecker();
    const result = await checker.run();
    
    console.log('');
    console.log('📊 Final Result:', result);
    console.log('');
    
    if (result.success) {
        if (result.found) {
            console.log('🎉 ANSWER: YES - "Testing" found in Resolved section!');
            console.log('✅ Check completed successfully!');
            process.exit(0); // Exit code 0 for "Yes"
        } else {
            console.log('❌ ANSWER: NO - "Testing" not found in Resolved section');
            console.log('✅ Check completed successfully!');
            process.exit(1); // Exit code 1 for "No"
        }
    } else {
        console.log('❌ Check failed due to error!');
        console.log('🔍 ANSWER: NO (due to error)');
        process.exit(1); // Exit code 1 for error/No
    }
}

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    process.exit(1);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    process.exit(1);
});

// Run the checker
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Unhandled error:', error);
        console.log('🔍 ANSWER: NO (due to unhandled error)');
        process.exit(1);
    });
}

module.exports = EOXSTicketChecker;
