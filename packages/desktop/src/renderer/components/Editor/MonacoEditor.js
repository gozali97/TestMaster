"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonacoEditor = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const monaco = __importStar(require("monaco-editor"));
const MonacoEditor = ({ value, onChange, language = 'javascript', theme = 'vs-dark', readOnly = false, }) => {
    const editorRef = (0, react_1.useRef)(null);
    const monacoRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (!editorRef.current)
            return;
        monacoRef.current = monaco.editor.create(editorRef.current, {
            value,
            language,
            theme,
            readOnly,
            minimap: { enabled: true },
            automaticLayout: true,
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
        });
        monacoRef.current.onDidChangeModelContent(() => {
            if (monacoRef.current) {
                onChange(monacoRef.current.getValue());
            }
        });
        return () => {
            monacoRef.current?.dispose();
        };
    }, []);
    (0, react_1.useEffect)(() => {
        if (monacoRef.current && value !== monacoRef.current.getValue()) {
            monacoRef.current.setValue(value);
        }
    }, [value]);
    return (0, jsx_runtime_1.jsx)("div", { ref: editorRef, style: { width: '100%', height: '100%' } });
};
exports.MonacoEditor = MonacoEditor;
//# sourceMappingURL=MonacoEditor.js.map