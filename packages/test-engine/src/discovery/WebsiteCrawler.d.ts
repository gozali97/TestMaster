import { Page } from 'playwright';
import { WebsiteMap } from '../autonomous/AutonomousTestingOrchestrator';
/**
 * Website Crawler
 *
 * Automatically discovers website structure:
 * - All pages (following internal links)
 * - All interactive elements (buttons, forms, links)
 * - Common user flows (login, checkout, etc.)
 */
export declare class WebsiteCrawler {
    private page;
    private onProgress?;
    private visitedUrls;
    private discoveredPages;
    private baseUrl;
    private maxPages;
    constructor(page: Page, onProgress?: (progress: CrawlerProgress) => void);
    /**
     * Crawl website starting from base URL
     */
    crawl(startUrl: string, depth: 'shallow' | 'deep' | 'exhaustive'): Promise<WebsiteMap>;
    /**
     * Crawl a single page
     */
    private crawlPage;
    /**
     * Extract information from current page
     */
    private extractPageInfo;
    /**
     * Find all interactive elements on page
     */
    private findInteractiveElements;
    /**
     * Generate stable locator for element
     */
    private generateLocator;
    /**
     * Find all links on current page
     */
    private findLinks;
    /**
     * Identify common user flows based on discovered pages
     */
    private identifyUserFlows;
    /**
     * Extract all interactions from discovered pages
     */
    private extractInteractions;
    /**
     * Notify progress callback
     */
    private notifyProgress;
}
export interface CrawlerProgress {
    progress: number;
    message: string;
    pagesFound?: number;
    linksFound?: number;
}
//# sourceMappingURL=WebsiteCrawler.d.ts.map