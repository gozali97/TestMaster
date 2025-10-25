"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_HEALING_CONFIG = void 0;
/**
 * Default configuration
 */
exports.DEFAULT_HEALING_CONFIG = {
    enabled: true,
    autoApplyThreshold: 0.9,
    suggestionThreshold: {
        min: 0.7,
        max: 0.9,
    },
    maxHealingTime: 10000, // 10 seconds
    enabledStrategies: ['FALLBACK', 'SIMILARITY', 'VISUAL', 'HISTORICAL'],
    strategyConfig: {
        fallback: {
            maxLocatorsToTry: 10,
        },
        similarity: {
            minSimilarityScore: 0.8,
        },
        visual: {
            matchThreshold: 0.85,
        },
        historical: {
            lookbackDays: 30,
            minSuccessCount: 2,
        },
    },
};
//# sourceMappingURL=HealingStrategy.interface.js.map