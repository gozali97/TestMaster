import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface APITestRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
  auth?: {
    type: 'basic' | 'bearer' | 'apikey';
    username?: string;
    password?: string;
    token?: string;
    apiKey?: string;
  };
}

export interface APITestAssertion {
  type: 'status' | 'header' | 'body' | 'jsonPath' | 'responseTime';
  operator: 'equals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan';
  expected: any;
  actual?: any;
  path?: string; // For JSON path assertions
}

export interface APITestResult {
  success: boolean;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  responseTime: number;
  assertions: Array<APITestAssertion & { passed: boolean }>;
  error?: string;
}

export class APITesting {
  private baseUrl?: string;
  private defaultHeaders: Record<string, string> = {};
  private timeout: number = 30000;

  constructor(config?: { baseUrl?: string; timeout?: number; defaultHeaders?: Record<string, string> }) {
    this.baseUrl = config?.baseUrl;
    this.timeout = config?.timeout || 30000;
    this.defaultHeaders = config?.defaultHeaders || {};
  }

  async executeRequest(request: APITestRequest): Promise<APITestResult> {
    const startTime = Date.now();

    try {
      const config: AxiosRequestConfig = {
        method: request.method,
        url: this.baseUrl ? `${this.baseUrl}${request.url}` : request.url,
        headers: { ...this.defaultHeaders, ...request.headers },
        params: request.params,
        data: request.body,
        timeout: this.timeout,
        validateStatus: () => true, // Don't throw on any status
      };

      // Add authentication
      if (request.auth) {
        switch (request.auth.type) {
          case 'basic':
            config.auth = {
              username: request.auth.username || '',
              password: request.auth.password || '',
            };
            break;
          case 'bearer':
            config.headers!['Authorization'] = `Bearer ${request.auth.token}`;
            break;
          case 'apikey':
            config.headers!['X-API-Key'] = request.auth.apiKey || '';
            break;
        }
      }

      const response: AxiosResponse = await axios(config);
      const responseTime = Date.now() - startTime;

      return {
        success: true,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
        body: response.data,
        responseTime,
        assertions: [],
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;

      if (error.response) {
        return {
          success: false,
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          body: error.response.data,
          responseTime,
          assertions: [],
          error: error.message,
        };
      }

      return {
        success: false,
        status: 0,
        statusText: 'Request Failed',
        headers: {},
        body: null,
        responseTime,
        assertions: [],
        error: error.message,
      };
    }
  }

  async executeWithAssertions(
    request: APITestRequest,
    assertions: APITestAssertion[]
  ): Promise<APITestResult> {
    const result = await this.executeRequest(request);

    const assertionResults = assertions.map(assertion => {
      const passed = this.evaluateAssertion(assertion, result);
      return { ...assertion, passed };
    });

    result.assertions = assertionResults;
    result.success = result.success && assertionResults.every(a => a.passed);

    return result;
  }

  private evaluateAssertion(assertion: APITestAssertion, result: APITestResult): boolean {
    let actual: any;

    switch (assertion.type) {
      case 'status':
        actual = result.status;
        break;
      case 'header':
        actual = result.headers[assertion.path!];
        break;
      case 'body':
        actual = result.body;
        break;
      case 'jsonPath':
        actual = this.getJsonPath(result.body, assertion.path!);
        break;
      case 'responseTime':
        actual = result.responseTime;
        break;
      default:
        return false;
    }

    assertion.actual = actual;

    switch (assertion.operator) {
      case 'equals':
        return actual === assertion.expected;
      case 'contains':
        return JSON.stringify(actual).includes(assertion.expected);
      case 'notContains':
        return !JSON.stringify(actual).includes(assertion.expected);
      case 'greaterThan':
        return actual > assertion.expected;
      case 'lessThan':
        return actual < assertion.expected;
      default:
        return false;
    }
  }

  private getJsonPath(obj: any, path: string): any {
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }

      // Handle array notation
      const arrayMatch = part.match(/(\w+)\[(\d+)\]/);
      if (arrayMatch) {
        const [, key, index] = arrayMatch;
        current = current[key]?.[parseInt(index)];
      } else {
        current = current[part];
      }
    }

    return current;
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  setDefaultHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }
}
