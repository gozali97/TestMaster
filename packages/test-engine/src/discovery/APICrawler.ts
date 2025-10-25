import { Page } from 'playwright';
import { APIMap, APIEndpoint, AuthType } from '../autonomous/AutonomousTestingOrchestrator';

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
export class APICrawler {
  private discoveredEndpoints = new Map<string, APIEndpoint>();
  private baseUrl: string = '';

  constructor(
    private page: Page,
    private onProgress?: (progress: APIDiscoveryProgress) => void
  ) {}

  /**
   * Discover API structure
   */
  async discover(apiBaseUrl: string): Promise<APIMap> {
    this.baseUrl = apiBaseUrl;

    console.log(`🔍 Discovering API: ${apiBaseUrl}`);

    // Method 1: Check for OpenAPI/Swagger spec
    const specEndpoints = await this.tryOpenAPISpec();

    // Method 2: Monitor network traffic
    const networkEndpoints = await this.monitorNetworkTraffic();

    // Method 3: Common endpoint patterns
    const commonEndpoints = this.generateCommonEndpoints();

    // Combine all discovered endpoints
    const allEndpoints = [...specEndpoints, ...networkEndpoints, ...commonEndpoints];

    // Deduplicate
    const uniqueEndpoints = this.deduplicateEndpoints(allEndpoints);

    // Detect authentication
    const authType = this.detectAuthType(uniqueEndpoints);

    this.notifyProgress({
      progress: 100,
      message: 'API discovery completed',
      endpointsFound: uniqueEndpoints.length,
    });

    return {
      baseUrl: this.baseUrl,
      endpoints: uniqueEndpoints,
      authentication: authType,
    };
  }

  /**
   * Try to find and parse OpenAPI/Swagger spec
   */
  private async tryOpenAPISpec(): Promise<APIEndpoint[]> {
    const commonSpecUrls = [
      `${this.baseUrl}/swagger.json`,
      `${this.baseUrl}/swagger.yaml`,
      `${this.baseUrl}/openapi.json`,
      `${this.baseUrl}/openapi.yaml`,
      `${this.baseUrl}/api-docs`,
      `${this.baseUrl}/api/docs`,
      `${this.baseUrl}/docs/swagger.json`,
      `${this.baseUrl}/v1/swagger.json`,
      `${this.baseUrl}/v2/swagger.json`,
    ];

    for (const specUrl of commonSpecUrls) {
      try {
        const response = await this.page.request.get(specUrl);
        
        if (response.ok()) {
          const contentType = response.headers()['content-type'] || '';
          
          if (contentType.includes('json')) {
            const spec = await response.json();
            return this.parseOpenAPISpec(spec);
          } else if (contentType.includes('yaml')) {
            // For YAML, we'd need a YAML parser
            // For now, skip YAML parsing
            continue;
          }
        }
      } catch (error) {
        // Spec not found at this URL, try next
        continue;
      }
    }

    return [];
  }

  /**
   * Parse OpenAPI/Swagger specification
   */
  private parseOpenAPISpec(spec: any): APIEndpoint[] {
    const endpoints: APIEndpoint[] = [];

    try {
      // OpenAPI 3.0
      if (spec.paths) {
        for (const [path, pathItem] of Object.entries(spec.paths as any)) {
          for (const [method, operation] of Object.entries(pathItem as any)) {
            if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
              endpoints.push({
                path,
                method: method.toUpperCase() as any,
                parameters: operation.parameters || [],
                requestBody: operation.requestBody?.content?.['application/json']?.schema,
                responseSchema: operation.responses?.['200']?.content?.['application/json']?.schema,
              });
            }
          }
        }
      }

      // Swagger 2.0
      if (spec.swagger === '2.0') {
        const basePath = spec.basePath || '';
        for (const [path, pathItem] of Object.entries(spec.paths as any)) {
          for (const [method, operation] of Object.entries(pathItem as any)) {
            if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
              endpoints.push({
                path: basePath + path,
                method: method.toUpperCase() as any,
                parameters: operation.parameters || [],
                requestBody: operation.parameters?.find((p: any) => p.in === 'body')?.schema,
                responseSchema: operation.responses?.['200']?.schema,
              });
            }
          }
        }
      }

      console.log(`  ✅ Found ${endpoints.length} endpoints from OpenAPI spec`);

    } catch (error) {
      console.error('  ❌ Error parsing OpenAPI spec:', error);
    }

    return endpoints;
  }

  /**
   * Monitor network traffic to discover API endpoints
   */
  private async monitorNetworkTraffic(): Promise<APIEndpoint[]> {
    const endpoints: APIEndpoint[] = [];
    const capturedRequests = new Set<string>();

    // Setup network monitoring
    this.page.on('request', (request) => {
      const url = request.url();
      
      // Check if it's an API call to our base URL
      if (url.startsWith(this.baseUrl)) {
        const method = request.method();
        const path = url.replace(this.baseUrl, '');
        
        const key = `${method}:${path}`;
        
        if (!capturedRequests.has(key)) {
          capturedRequests.add(key);
          
          endpoints.push({
            path,
            method: method as any,
            parameters: this.extractQueryParams(url),
            requestBody: this.extractRequestBody(request),
          });
        }
      }
    });

    // Navigate to main page to trigger API calls
    try {
      await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' });
      
      // Wait a bit to capture more requests
      await this.page.waitForTimeout(3000);

      console.log(`  ✅ Captured ${endpoints.length} endpoints from network traffic`);

    } catch (error) {
      console.error('  ❌ Error monitoring network:', error);
    }

    return endpoints;
  }

  /**
   * Generate common REST API endpoints based on patterns
   */
  private generateCommonEndpoints(): APIEndpoint[] {
    const commonResources = ['users', 'products', 'orders', 'posts', 'items'];
    const endpoints: APIEndpoint[] = [];

    for (const resource of commonResources) {
      // List all
      endpoints.push({
        path: `/api/${resource}`,
        method: 'GET',
      });

      // Get by ID
      endpoints.push({
        path: `/api/${resource}/{id}`,
        method: 'GET',
      });

      // Create
      endpoints.push({
        path: `/api/${resource}`,
        method: 'POST',
        requestBody: { type: 'object' },
      });

      // Update
      endpoints.push({
        path: `/api/${resource}/{id}`,
        method: 'PUT',
        requestBody: { type: 'object' },
      });

      // Delete
      endpoints.push({
        path: `/api/${resource}/{id}`,
        method: 'DELETE',
      });
    }

    // Auth endpoints
    endpoints.push(
      { path: '/api/auth/login', method: 'POST', requestBody: { email: 'string', password: 'string' } },
      { path: '/api/auth/register', method: 'POST', requestBody: { email: 'string', password: 'string' } },
      { path: '/api/auth/logout', method: 'POST' },
      { path: '/api/auth/refresh', method: 'POST' }
    );

    return endpoints;
  }

  /**
   * Deduplicate endpoints
   */
  private deduplicateEndpoints(endpoints: APIEndpoint[]): APIEndpoint[] {
    const unique = new Map<string, APIEndpoint>();

    for (const endpoint of endpoints) {
      const key = `${endpoint.method}:${endpoint.path}`;
      
      if (!unique.has(key)) {
        unique.set(key, endpoint);
      } else {
        // Merge information if endpoint already exists
        const existing = unique.get(key)!;
        
        if (!existing.requestBody && endpoint.requestBody) {
          existing.requestBody = endpoint.requestBody;
        }
        
        if (!existing.responseSchema && endpoint.responseSchema) {
          existing.responseSchema = endpoint.responseSchema;
        }
      }
    }

    return Array.from(unique.values());
  }

  /**
   * Detect authentication type
   */
  private detectAuthType(endpoints: APIEndpoint[]): AuthType {
    // Check for auth-related endpoints
    const hasAuthEndpoint = endpoints.some(e => 
      e.path.includes('/auth/') || 
      e.path.includes('/login')
    );

    if (hasAuthEndpoint) {
      // Assume JWT/Bearer if has auth endpoints
      return 'bearer';
    }

    // Default to none
    return 'none';
  }

  /**
   * Extract query parameters from URL
   */
  private extractQueryParams(url: string): any {
    try {
      const urlObj = new URL(url);
      const params: any = {};
      
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      
      return Object.keys(params).length > 0 ? params : undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Extract request body from request
   */
  private extractRequestBody(request: any): any {
    try {
      const postData = request.postData();
      if (postData) {
        return JSON.parse(postData);
      }
    } catch {
      return undefined;
    }
    return undefined;
  }

  /**
   * Notify progress callback
   */
  private notifyProgress(progress: APIDiscoveryProgress): void {
    if (this.onProgress) {
      this.onProgress(progress);
    }
  }
}

export interface APIDiscoveryProgress {
  progress: number; // 0-100
  message: string;
  endpointsFound?: number;
}
