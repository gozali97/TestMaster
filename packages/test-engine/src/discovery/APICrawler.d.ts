import { Page } from 'playwright';
import { APIMap } from '../autonomous/AutonomousTestingOrchestrator';
/**
 * API Crawler
 *
 * Automatically discovers API structure:
 * - Endpoint URLs from network traffic
 * - HTTP methods (GET, POST, PUT, DELETE, PATCH)
 * - Request/response schemas
 * - Authentication requirements
 * - OpenAPI/Swagger specs (if available)
 */
export declare class APICrawler {
    private page;
    private onProgress?;
    private discoveredEndpoints;
    private baseUrl;
    constructor(page: Page, onProgress?: (progress: APIDiscoveryProgress) => void);
    /**
     * Discover API structure
     */
    discover(apiBaseUrl: string): Promise<APIMap>;
    /**
     * Try to find and parse OpenAPI/Swagger spec
     */
    private tryOpenAPISpec;
    /**
     * Parse OpenAPI/Swagger specification
     */
    private parseOpenAPISpec;
    /**
     * Monitor network traffic to discover API endpoints
     */
    private monitorNetworkTraffic;
    /**
     * Generate common REST API endpoints based on patterns
     */
    private generateCommonEndpoints;
    /**
     * Deduplicate endpoints
     */
    private deduplicateEndpoints;
    /**
     * Detect authentication type
     */
    private detectAuthType;
    /**
     * Extract query parameters from URL
     */
    private extractQueryParams;
    /**
     * Extract request body from request
     */
    private extractRequestBody;
    /**
     * Notify progress callback
     */
    private notifyProgress;
}
export interface APIDiscoveryProgress {
    progress: number;
    message: string;
    endpointsFound?: number;
}
//# sourceMappingURL=APICrawler.d.ts.map