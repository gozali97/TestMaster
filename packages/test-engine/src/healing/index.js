"use strict";
/**
 * Self-Healing Module
 *
 * Exports all healing-related functionality for autonomous test repair
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_HEALING_CONFIG = exports.HistoricalStrategy = exports.VisualMatchStrategy = exports.SimilarityStrategy = exports.FallbackLocatorStrategy = exports.SelfHealingEngine = void 0;
var SelfHealingEngine_1 = require("./SelfHealingEngine");
Object.defineProperty(exports, "SelfHealingEngine", { enumerable: true, get: function () { return SelfHealingEngine_1.SelfHealingEngine; } });
var FallbackLocatorStrategy_1 = require("./FallbackLocatorStrategy");
Object.defineProperty(exports, "FallbackLocatorStrategy", { enumerable: true, get: function () { return FallbackLocatorStrategy_1.FallbackLocatorStrategy; } });
var SimilarityStrategy_1 = require("./SimilarityStrategy");
Object.defineProperty(exports, "SimilarityStrategy", { enumerable: true, get: function () { return SimilarityStrategy_1.SimilarityStrategy; } });
var VisualMatchStrategy_1 = require("./VisualMatchStrategy");
Object.defineProperty(exports, "VisualMatchStrategy", { enumerable: true, get: function () { return VisualMatchStrategy_1.VisualMatchStrategy; } });
var HistoricalStrategy_1 = require("./HistoricalStrategy");
Object.defineProperty(exports, "HistoricalStrategy", { enumerable: true, get: function () { return HistoricalStrategy_1.HistoricalStrategy; } });
var HealingStrategy_interface_1 = require("./HealingStrategy.interface");
Object.defineProperty(exports, "DEFAULT_HEALING_CONFIG", { enumerable: true, get: function () { return HealingStrategy_interface_1.DEFAULT_HEALING_CONFIG; } });
//# sourceMappingURL=index.js.map