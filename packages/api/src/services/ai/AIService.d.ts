interface AIResponse {
    success: boolean;
    data?: any;
    error?: string;
}
export declare class AIService {
    private apiKey;
    private provider;
    private baseUrl;
    constructor();
    generateTestFromDescription(description: string): Promise<AIResponse>;
    suggestLocatorFix(failedLocator: string, elementDescription: string, pageHtml?: string): Promise<AIResponse>;
    optimizeTestCase(testSteps: any[]): Promise<AIResponse>;
    identifyElement(screenshot: string, description: string): Promise<AIResponse>;
    private callAI;
    private callOpenAI;
    private callAnthropic;
}
export {};
//# sourceMappingURL=AIService.d.ts.map