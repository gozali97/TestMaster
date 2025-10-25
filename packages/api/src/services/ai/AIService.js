"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const axios_1 = __importDefault(require("axios"));
class AIService {
    apiKey;
    provider;
    baseUrl;
    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || '';
        this.provider = process.env.OPENAI_API_KEY ? 'openai' : 'anthropic';
        this.baseUrl = this.provider === 'openai'
            ? 'https://api.openai.com/v1'
            : 'https://api.anthropic.com/v1';
    }
    async generateTestFromDescription(description) {
        try {
            const prompt = `Generate a test case from this description: "${description}"
      
      Return a JSON object with this structure:
      {
        "name": "Test case name",
        "steps": [
          {
            "action": "navigate|click|type|assert",
            "locator": "CSS selector or XPath",
            "value": "value if needed",
            "description": "step description"
          }
        ]
      }
      
      Only return valid JSON, no additional text.`;
            const response = await this.callAI(prompt);
            try {
                const testCase = JSON.parse(response);
                return { success: true, data: testCase };
            }
            catch (parseError) {
                return { success: false, error: 'Failed to parse AI response' };
            }
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async suggestLocatorFix(failedLocator, elementDescription, pageHtml) {
        try {
            const prompt = `A test failed because this locator doesn't work: "${failedLocator}"
      
      Element description: ${elementDescription}
      ${pageHtml ? `\nPage HTML snippet:\n${pageHtml.substring(0, 2000)}` : ''}
      
      Suggest 3 alternative locators that might work better. Consider:
      - CSS selectors
      - XPath expressions
      - Data attributes
      - ARIA roles
      - Text content
      
      Return JSON format:
      {
        "suggestions": [
          {
            "locator": "selector",
            "type": "css|xpath|role|text",
            "confidence": 0.0-1.0,
            "reason": "why this might work"
          }
        ]
      }`;
            const response = await this.callAI(prompt);
            try {
                const suggestions = JSON.parse(response);
                return { success: true, data: suggestions };
            }
            catch (parseError) {
                return { success: false, error: 'Failed to parse AI response' };
            }
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async optimizeTestCase(testSteps) {
        try {
            const prompt = `Analyze these test steps and suggest optimizations:
      
      ${JSON.stringify(testSteps, null, 2)}
      
      Look for:
      - Redundant steps
      - Missing assertions
      - Better wait strategies
      - Potential flakiness
      
      Return JSON format:
      {
        "optimizations": [
          {
            "type": "remove|add|modify",
            "stepIndex": 0,
            "suggestion": "description",
            "reason": "why this helps"
          }
        ],
        "summary": "overall recommendations"
      }`;
            const response = await this.callAI(prompt);
            try {
                const optimizations = JSON.parse(response);
                return { success: true, data: optimizations };
            }
            catch (parseError) {
                return { success: false, error: 'Failed to parse AI response' };
            }
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async identifyElement(screenshot, description) {
        try {
            if (this.provider !== 'openai') {
                return { success: false, error: 'Visual analysis requires OpenAI GPT-4 Vision' };
            }
            const prompt = `Look at this screenshot and identify the element described as: "${description}"
      
      Suggest the best locator to find this element. Return JSON:
      {
        "locator": "suggested selector",
        "type": "css|xpath|role|text",
        "confidence": 0.0-1.0,
        "description": "what you see"
      }`;
            const response = await axios_1.default.post(`${this.baseUrl}/chat/completions`, {
                model: 'gpt-4-vision-preview',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            { type: 'image_url', image_url: { url: `data:image/png;base64,${screenshot}` } }
                        ]
                    }
                ],
                max_tokens: 500
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const content = response.data.choices[0].message.content;
            const parsed = JSON.parse(content);
            return { success: true, data: parsed };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async callAI(prompt) {
        if (!this.apiKey) {
            throw new Error('AI API key not configured');
        }
        if (this.provider === 'openai') {
            return this.callOpenAI(prompt);
        }
        else {
            return this.callAnthropic(prompt);
        }
    }
    async callOpenAI(prompt) {
        const response = await axios_1.default.post(`${this.baseUrl}/chat/completions`, {
            model: 'gpt-4',
            messages: [
                { role: 'system', content: 'You are a test automation expert. Always return valid JSON.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 1000
        }, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data.choices[0].message.content;
    }
    async callAnthropic(prompt) {
        const response = await axios_1.default.post(`${this.baseUrl}/messages`, {
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1000,
            messages: [
                { role: 'user', content: prompt }
            ]
        }, {
            headers: {
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
            }
        });
        return response.data.content[0].text;
    }
}
exports.AIService = AIService;
//# sourceMappingURL=AIService.js.map