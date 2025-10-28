"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterForm = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const api_service_1 = require("../../services/api.service");
require("./auth.css");
const RegisterForm = ({ onSuccess, onSwitchToLogin }) => {
    const [name, setName] = (0, react_1.useState)('');
    const [email, setEmail] = (0, react_1.useState)('');
    const [password, setPassword] = (0, react_1.useState)('');
    const [confirmPassword, setConfirmPassword] = (0, react_1.useState)('');
    const [error, setError] = (0, react_1.useState)('');
    const [loading, setLoading] = (0, react_1.useState)(false);
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            const result = await api_service_1.ApiService.register({ name, email, password });
            if (result.success) {
                // After successful registration, login automatically
                const loginResult = await api_service_1.ApiService.login(email, password);
                if (loginResult.success && loginResult.data?.tokens) {
                    api_service_1.ApiService.storeTokens(loginResult.data.tokens.accessToken, loginResult.data.tokens.refreshToken);
                    onSuccess();
                }
                else {
                    setError('Registration successful, but auto-login failed. Please login manually.');
                    setTimeout(onSwitchToLogin, 2000);
                }
            }
            else {
                setError(result.error || 'Registration failed');
            }
        }
        catch (err) {
            setError(err.message || 'Registration failed');
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "auth-overlay", children: (0, jsx_runtime_1.jsxs)("div", { className: "auth-modal", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Register for TestMaster" }), error && (0, jsx_runtime_1.jsx)("div", { className: "error-message", children: error }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleRegister, children: [(0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "Name" }), (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Enter your name", value: name, onChange: (e) => setName(e.target.value), required: true, disabled: loading })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "Email" }), (0, jsx_runtime_1.jsx)("input", { type: "email", placeholder: "Enter your email", value: email, onChange: (e) => setEmail(e.target.value), required: true, disabled: loading })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "Password" }), (0, jsx_runtime_1.jsx)("input", { type: "password", placeholder: "Enter your password (min 6 characters)", value: password, onChange: (e) => setPassword(e.target.value), required: true, minLength: 6, disabled: loading })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "Confirm Password" }), (0, jsx_runtime_1.jsx)("input", { type: "password", placeholder: "Confirm your password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), required: true, minLength: 6, disabled: loading })] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", className: "btn-primary", disabled: loading, children: loading ? 'Registering...' : 'Register' })] }), (0, jsx_runtime_1.jsx)("div", { className: "auth-footer", children: (0, jsx_runtime_1.jsxs)("p", { children: ["Already have an account?", ' ', (0, jsx_runtime_1.jsx)("button", { type: "button", className: "link-button", onClick: onSwitchToLogin, disabled: loading, children: "Login here" })] }) })] }) }));
};
exports.RegisterForm = RegisterForm;
//# sourceMappingURL=RegisterForm.js.map