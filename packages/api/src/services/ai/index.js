"use strict";
/**
 * AI Services Module
 *
 * Provides AI-powered features for TestMaster:
 * - LLMClient: OpenAI GPT-4 integration
 * - PromptTemplates: Pre-built prompts for common tasks
 * - CostTracker: Track AI API usage and costs
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.costTracker = exports.llmClient = exports.CostTracker = exports.PromptTemplates = exports.LLMClient = void 0;
var LLMClient_1 = require("./LLMClient");
Object.defineProperty(exports, "LLMClient", { enumerable: true, get: function () { return LLMClient_1.LLMClient; } });
var PromptTemplates_1 = require("./PromptTemplates");
Object.defineProperty(exports, "PromptTemplates", { enumerable: true, get: function () { return PromptTemplates_1.PromptTemplates; } });
var CostTracker_1 = require("./CostTracker");
Object.defineProperty(exports, "CostTracker", { enumerable: true, get: function () { return CostTracker_1.CostTracker; } });
// Re-export singleton instances
const LLMClient_2 = __importDefault(require("./LLMClient"));
exports.llmClient = LLMClient_2.default;
const CostTracker_2 = __importDefault(require("./CostTracker"));
exports.costTracker = CostTracker_2.default;
//# sourceMappingURL=index.js.map