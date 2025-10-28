"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const TestEditorAPI_1 = require("./components/Editor/TestEditorAPI");
const ProjectManager_1 = require("./components/Projects/ProjectManager");
const TestCaseList_1 = require("./components/Tests/TestCaseList");
const Recorder_1 = require("./components/Recorder/Recorder");
const TestExecutionRunner_1 = require("./components/Execution/TestExecutionRunner");
const api_service_1 = require("./services/api.service");
const Auth_1 = require("./components/Auth");
const AutonomousTesting_1 = __importDefault(require("../pages/AutonomousTesting"));
const AutonomousTestingMultiPanel_1 = __importDefault(require("../pages/AutonomousTestingMultiPanel"));
require("./App.css");
function App() {
    const [activeView, setActiveView] = (0, react_1.useState)('projects');
    const [selectedProject, setSelectedProject] = (0, react_1.useState)(null);
    const [selectedTest, setSelectedTest] = (0, react_1.useState)(null);
    const [isAuthenticated, setIsAuthenticated] = (0, react_1.useState)(false);
    const [showRegister, setShowRegister] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        // Check authentication on mount
        setIsAuthenticated(api_service_1.ApiService.isAuthenticated());
    }, []);
    const handleProjectSelect = (projectId) => {
        setSelectedProject(projectId);
        setSelectedTest(null); // Reset test selection
        setActiveView('tests'); // Go to tests list, not directly to editor
    };
    const handleTestSelect = (testId) => {
        setSelectedTest(testId === 0 ? null : testId); // 0 means create new
        setActiveView('editor');
    };
    const handleBackToProjects = () => {
        setSelectedProject(null);
        setSelectedTest(null);
        setActiveView('projects');
    };
    const handleBackToTests = () => {
        setSelectedTest(null);
        setActiveView('tests');
    };
    const handleAuthSuccess = () => {
        setIsAuthenticated(true);
        setShowRegister(false);
    };
    if (!isAuthenticated) {
        if (showRegister) {
            return ((0, jsx_runtime_1.jsx)(Auth_1.RegisterForm, { onSuccess: handleAuthSuccess, onSwitchToLogin: () => setShowRegister(false) }));
        }
        else {
            return ((0, jsx_runtime_1.jsx)(Auth_1.LoginForm, { onSuccess: handleAuthSuccess, onSwitchToRegister: () => setShowRegister(true) }));
        }
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "app", children: [(0, jsx_runtime_1.jsxs)("div", { className: "titlebar", children: [(0, jsx_runtime_1.jsx)("h1", { children: "TestMaster IDE" }), (0, jsx_runtime_1.jsx)("button", { className: "logout-btn", onClick: () => {
                            api_service_1.ApiService.clearTokens();
                            setIsAuthenticated(false);
                        }, children: "Logout" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "container", children: [(0, jsx_runtime_1.jsx)("aside", { className: "sidebar", children: (0, jsx_runtime_1.jsxs)("nav", { children: [(0, jsx_runtime_1.jsx)("button", { className: activeView === 'projects' ? 'active' : '', onClick: handleBackToProjects, children: "\uD83D\uDCC1 Projects" }), (0, jsx_runtime_1.jsx)("button", { className: activeView === 'tests' ? 'active' : '', onClick: () => setActiveView('tests'), children: "\uD83D\uDCDD Tests" }), (0, jsx_runtime_1.jsx)("button", { className: activeView === 'editor' ? 'active' : '', onClick: () => setActiveView('editor'), children: "\u270F\uFE0F Editor" }), (0, jsx_runtime_1.jsx)("button", { className: activeView === 'recorder' ? 'active' : '', onClick: () => setActiveView('recorder'), children: "\u23FA\uFE0F Recorder" }), (0, jsx_runtime_1.jsx)("button", { className: activeView === 'objects' ? 'active' : '', onClick: () => setActiveView('objects'), children: "\uD83D\uDCE6 Objects" }), (0, jsx_runtime_1.jsx)("button", { className: activeView === 'execution' ? 'active' : '', onClick: () => setActiveView('execution'), children: "\u25B6\uFE0F Execute" }), (0, jsx_runtime_1.jsx)("button", { className: activeView === 'autonomous' ? 'active' : '', onClick: () => setActiveView('autonomous'), children: "\uD83E\uDD16 Autonomous Testing" }), (0, jsx_runtime_1.jsx)("button", { className: activeView === 'multipanel' ? 'active' : '', onClick: () => setActiveView('multipanel'), children: "\uD83C\uDFAF Multi-Panel Testing" })] }) }), (0, jsx_runtime_1.jsxs)("main", { className: "main-content", children: [activeView === 'projects' && ((0, jsx_runtime_1.jsx)(ProjectManager_1.ProjectManager, { onSelectProject: handleProjectSelect })), activeView === 'tests' && ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: selectedProject ? ((0, jsx_runtime_1.jsx)(TestCaseList_1.TestCaseList, { projectId: selectedProject, onSelectTest: handleTestSelect, onBack: handleBackToProjects })) : ((0, jsx_runtime_1.jsxs)("div", { className: "empty-state", children: [(0, jsx_runtime_1.jsx)("div", { className: "empty-icon", children: "\uD83D\uDCDD" }), (0, jsx_runtime_1.jsx)("h3", { children: "Select a Project First" }), (0, jsx_runtime_1.jsx)("p", { children: "Please select a project from the Projects menu to view its test cases" }), (0, jsx_runtime_1.jsx)("button", { className: "btn-primary", onClick: () => setActiveView('projects'), children: "\uD83D\uDCC1 Go to Projects" })] })) })), activeView === 'editor' && ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: selectedProject ? ((0, jsx_runtime_1.jsx)(TestEditorAPI_1.TestEditorAPI, { projectId: selectedProject, testCaseId: selectedTest || undefined, onBack: handleBackToTests })) : ((0, jsx_runtime_1.jsxs)("div", { className: "empty-state", children: [(0, jsx_runtime_1.jsx)("div", { className: "empty-icon", children: "\u270F\uFE0F" }), (0, jsx_runtime_1.jsx)("h3", { children: "Select a Project First" }), (0, jsx_runtime_1.jsx)("p", { children: "Please select a project and test case to edit" }), (0, jsx_runtime_1.jsx)("button", { className: "btn-primary", onClick: () => setActiveView('projects'), children: "\uD83D\uDCC1 Go to Projects" })] })) })), activeView === 'recorder' && (0, jsx_runtime_1.jsx)(Recorder_1.Recorder, {}), activeView === 'objects' && ((0, jsx_runtime_1.jsxs)("div", { className: "objects-view", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Object Repository" }), (0, jsx_runtime_1.jsx)("p", { children: "Manage test objects and locators" }), (0, jsx_runtime_1.jsx)("div", { className: "coming-soon", children: "\uD83D\uDEA7 Coming Soon" })] })), activeView === 'execution' && (0, jsx_runtime_1.jsx)(TestExecutionRunner_1.TestExecutionRunner, {}), activeView === 'autonomous' && (0, jsx_runtime_1.jsx)(AutonomousTesting_1.default, {}), activeView === 'multipanel' && (0, jsx_runtime_1.jsx)(AutonomousTestingMultiPanel_1.default, {})] })] })] }));
}
exports.default = App;
//# sourceMappingURL=App.js.map