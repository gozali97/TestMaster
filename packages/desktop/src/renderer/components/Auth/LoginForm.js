"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginForm = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const api_service_1 = require("../../services/api.service");
require("./auth.css");
const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
    const [email, setEmail] = (0, react_1.useState)('');
    const [password, setPassword] = (0, react_1.useState)('');
    const [error, setError] = (0, react_1.useState)('');
    const [loading, setLoading] = (0, react_1.useState)(false);
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await api_service_1.ApiService.login(email, password);
            if (result.success && result.data?.tokens) {
                api_service_1.ApiService.storeTokens(result.data.tokens.accessToken, result.data.tokens.refreshToken);
                onSuccess();
            }
            else {
                setError(result.error || 'Login failed');
            }
        }
        catch (err) {
            setError(err.message || 'Login failed');
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "auth-overlay", children: (0, jsx_runtime_1.jsxs)("div", { className: "auth-modal", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Login to TestMaster" }), error && (0, jsx_runtime_1.jsx)("div", { className: "error-message", children: error }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleLogin, children: [(0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "Email" }), (0, jsx_runtime_1.jsx)("input", { type: "email", placeholder: "Enter your email", value: email, onChange: (e) => setEmail(e.target.value), required: true, disabled: loading })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "Password" }), (0, jsx_runtime_1.jsx)("input", { type: "password", placeholder: "Enter your password", value: password, onChange: (e) => setPassword(e.target.value), required: true, disabled: loading })] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", className: "btn-primary", disabled: loading, children: loading ? 'Logging in...' : 'Login' })] }), (0, jsx_runtime_1.jsx)("div", { className: "auth-footer", children: (0, jsx_runtime_1.jsxs)("p", { children: ["Don't have an account?", ' ', (0, jsx_runtime_1.jsx)("button", { type: "button", className: "link-button", onClick: onSwitchToRegister, disabled: loading, children: "Register here" })] }) })] }) }));
};
exports.LoginForm = LoginForm;
//# sourceMappingURL=LoginForm.js.map