"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsiteCrawler = void 0;
/**
 * Website Crawler
 *
 * Automatically discovers website structure:
 * - All pages (following internal links)
 * - All interactive elements (buttons, forms, links)
 * - Common user flows (login, checkout, etc.)
 */
class WebsiteCrawler {
    page;
    onProgress;
    visitedUrls = new Set();
    discoveredPages = [];
    baseUrl = '';
    maxPages;
    constructor(page, onProgress) {
        this.page = page;
        this.onProgress = onProgress;
        this.maxPages = 50; // Default limit
    }
    /**
     * Crawl website starting from base URL
     */
    async crawl(startUrl, depth) {
        this.baseUrl = new URL(startUrl).origin;
        // Set max pages based on depth
        this.maxPages = depth === 'shallow' ? 10 : depth === 'deep' ? 50 : 200;
        console.log(`🕷️  Crawling ${startUrl} (depth: ${depth}, max pages: ${this.maxPages})`);
        // Start crawling from base URL
        await this.crawlPage(startUrl, 0);
        // Identify user flows
        const userFlows = this.identifyUserFlows();
        const websiteMap = {
            baseUrl: this.baseUrl,
            pages: this.discoveredPages,
            userFlows,
            interactions: this.extractInteractions(),
        };
        this.notifyProgress({
            progress: 100,
            message: 'Crawling completed',
            pagesFound: this.discoveredPages.length,
            linksFound: this.visitedUrls.size,
        });
        return websiteMap;
    }
    /**
     * Crawl a single page
     */
    async crawlPage(url, depth) {
        // Check if already visited
        if (this.visitedUrls.has(url)) {
            return;
        }
        // Check max pages limit
        if (this.visitedUrls.size >= this.maxPages) {
            return;
        }
        // Check if same origin
        if (!url.startsWith(this.baseUrl)) {
            return;
        }
        this.visitedUrls.add(url);
        try {
            console.log(`  📄 Crawling: ${url}`);
            // Navigate to page
            await this.page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });
            // Wait for page to be interactive
            await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { });
            // Extract page info
            const pageInfo = await this.extractPageInfo(url);
            this.discoveredPages.push(pageInfo);
            this.notifyProgress({
                progress: Math.min((this.visitedUrls.size / this.maxPages) * 100, 95),
                message: `Crawled ${this.visitedUrls.size}/${this.maxPages} pages`,
                pagesFound: this.discoveredPages.length,
                linksFound: this.visitedUrls.size,
            });
            // Find links on this page
            const links = await this.findLinks();
            // Crawl linked pages (depth-first, limited)
            for (const link of links) {
                if (this.visitedUrls.size >= this.maxPages) {
                    break;
                }
                await this.crawlPage(link, depth + 1);
            }
        }
        catch (error) {
            console.error(`  ❌ Error crawling ${url}:`, error.message);
        }
    }
    /**
     * Extract information from current page
     */
    async extractPageInfo(url) {
        // Get page title
        const title = await this.page.title();
        // Find all interactive elements
        const elements = await this.findInteractiveElements();
        // Capture screenshot (optional)
        let screenshot;
        try {
            const buffer = await this.page.screenshot({ fullPage: false });
            screenshot = buffer.toString('base64');
        }
        catch (error) {
            // Screenshot failed, continue without it
        }
        return {
            url,
            title,
            elements,
            screenshot,
        };
    }
    /**
     * Find all interactive elements on page
     */
    async findInteractiveElements() {
        const elements = [];
        try {
            // Find buttons
            const buttons = await this.page.locator('button, input[type="button"], input[type="submit"]').all();
            for (const button of buttons) {
                const text = await button.textContent().catch(() => '');
                const visible = await button.isVisible().catch(() => false);
                if (visible) {
                    // Generate stable locator
                    const locator = await this.generateLocator(button);
                    elements.push({
                        type: 'button',
                        locator,
                        text: text?.trim() || undefined,
                        visible,
                    });
                }
            }
            // Find links
            const links = await this.page.locator('a[href]').all();
            for (const link of links.slice(0, 50)) { // Limit to first 50 links
                const text = await link.textContent().catch(() => '');
                const visible = await link.isVisible().catch(() => false);
                if (visible) {
                    const locator = await this.generateLocator(link);
                    elements.push({
                        type: 'link',
                        locator,
                        text: text?.trim() || undefined,
                        visible,
                    });
                }
            }
            // Find forms
            const forms = await this.page.locator('form').all();
            for (const form of forms) {
                const visible = await form.isVisible().catch(() => false);
                if (visible) {
                    const locator = await this.generateLocator(form);
                    elements.push({
                        type: 'form',
                        locator,
                        visible,
                    });
                    // Find inputs within form
                    const inputs = await form.locator('input, select, textarea').all();
                    for (const input of inputs) {
                        const inputVisible = await input.isVisible().catch(() => false);
                        if (inputVisible) {
                            const inputLocator = await this.generateLocator(input);
                            const inputType = await input.getAttribute('type').catch(() => 'text');
                            elements.push({
                                type: inputType === 'select' ? 'select' : 'input',
                                locator: inputLocator,
                                visible: inputVisible,
                            });
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error('Error finding interactive elements:', error);
        }
        return elements;
    }
    /**
     * Generate stable locator for element
     */
    async generateLocator(element) {
        try {
            // Try data-testid first
            const testId = await element.getAttribute('data-testid');
            if (testId)
                return `[data-testid="${testId}"]`;
            // Try ID
            const id = await element.getAttribute('id');
            if (id)
                return `#${id}`;
            // Try name
            const name = await element.getAttribute('name');
            if (name)
                return `[name="${name}"]`;
            // Try aria-label
            const ariaLabel = await element.getAttribute('aria-label');
            if (ariaLabel)
                return `[aria-label="${ariaLabel}"]`;
            // Try text content for buttons/links
            const text = await element.textContent();
            if (text && text.trim().length > 0 && text.trim().length < 50) {
                const tag = await element.evaluate((el) => el.tagName.toLowerCase());
                return `${tag}:has-text("${text.trim()}")`;
            }
            // Fallback to CSS selector
            const className = await element.getAttribute('class');
            if (className) {
                const classes = className.split(' ').slice(0, 2).join('.');
                const tag = await element.evaluate((el) => el.tagName.toLowerCase());
                return `${tag}.${classes}`;
            }
            // Last resort: nth-child
            return await element.evaluate((el) => {
                const parent = el.parentElement;
                if (!parent)
                    return el.tagName.toLowerCase();
                const siblings = Array.from(parent.children);
                const index = siblings.indexOf(el) + 1;
                return `${parent.tagName.toLowerCase()} > ${el.tagName.toLowerCase()}:nth-child(${index})`;
            });
        }
        catch (error) {
            return 'unknown';
        }
    }
    /**
     * Find all links on current page
     */
    async findLinks() {
        try {
            const links = await this.page.locator('a[href]').evaluateAll((elements) => {
                return elements
                    .map((el) => el.href)
                    .filter((href) => href && !href.startsWith('#') && !href.startsWith('javascript:'));
            });
            // Filter to same origin only
            return links.filter((link) => link.startsWith(this.baseUrl));
        }
        catch (error) {
            return [];
        }
    }
    /**
     * Identify common user flows based on discovered pages
     */
    identifyUserFlows() {
        const flows = [];
        // Check for login flow
        const loginPages = this.discoveredPages.filter((p) => p.url.toLowerCase().includes('login') ||
            p.title.toLowerCase().includes('login') ||
            p.elements.some((e) => e.text?.toLowerCase().includes('login')));
        if (loginPages.length > 0) {
            flows.push({
                name: 'User Login',
                steps: ['Navigate to login page', 'Enter credentials', 'Submit form'],
                priority: 'critical',
            });
        }
        // Check for registration flow
        const registerPages = this.discoveredPages.filter((p) => p.url.toLowerCase().includes('register') ||
            p.url.toLowerCase().includes('signup') ||
            p.title.toLowerCase().includes('sign up'));
        if (registerPages.length > 0) {
            flows.push({
                name: 'User Registration',
                steps: ['Navigate to register page', 'Fill registration form', 'Submit'],
                priority: 'high',
            });
        }
        // Check for checkout flow
        const checkoutPages = this.discoveredPages.filter((p) => p.url.toLowerCase().includes('checkout') ||
            p.url.toLowerCase().includes('cart'));
        if (checkoutPages.length > 0) {
            flows.push({
                name: 'Checkout Flow',
                steps: ['Add to cart', 'View cart', 'Proceed to checkout', 'Complete purchase'],
                priority: 'critical',
            });
        }
        return flows;
    }
    /**
     * Extract all interactions from discovered pages
     */
    extractInteractions() {
        const interactions = [];
        for (const page of this.discoveredPages) {
            for (const element of page.elements) {
                if (element.type === 'button' || element.type === 'link') {
                    interactions.push({
                        element,
                        action: 'click',
                        page: page.url,
                    });
                }
                else if (element.type === 'input') {
                    interactions.push({
                        element,
                        action: 'fill',
                        page: page.url,
                    });
                }
            }
        }
        return interactions;
    }
    /**
     * Notify progress callback
     */
    notifyProgress(progress) {
        if (this.onProgress) {
            this.onProgress(progress);
        }
    }
}
exports.WebsiteCrawler = WebsiteCrawler;
//# sourceMappingURL=WebsiteCrawler.js.map