"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectManager = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const api_service_1 = require("../../services/api.service");
require("./ProjectManager.css");
const ProjectManager = ({ onSelectProject }) => {
    const [projects, setProjects] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [showCreateModal, setShowCreateModal] = (0, react_1.useState)(false);
    const [newProject, setNewProject] = (0, react_1.useState)({ name: '', description: '' });
    const [error, setError] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        loadProjects();
    }, []);
    const loadProjects = async () => {
        setLoading(true);
        setError('');
        const result = await api_service_1.ApiService.getProjects();
        if (result.success && result.data) {
            setProjects(result.data);
        }
        else {
            setError(result.error || 'Failed to load projects');
        }
        setLoading(false);
    };
    const createProject = async (e) => {
        e.preventDefault();
        if (!newProject.name.trim()) {
            alert('Project name is required');
            return;
        }
        const result = await api_service_1.ApiService.createProject(newProject);
        if (result.success && result.data) {
            setShowCreateModal(false);
            setNewProject({ name: '', description: '' });
            loadProjects();
        }
        else {
            alert('Failed to create project: ' + (result.error || 'Unknown error'));
        }
    };
    const deleteProject = async (id, name) => {
        if (!confirm(`Delete project "${name}"? This action cannot be undone.`)) {
            return;
        }
        const result = await api_service_1.ApiService.deleteProject(id);
        if (result.success) {
            loadProjects();
        }
        else {
            alert('Failed to delete project: ' + (result.error || 'Unknown error'));
        }
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "project-manager loading", children: [(0, jsx_runtime_1.jsx)("div", { className: "spinner" }), (0, jsx_runtime_1.jsx)("p", { children: "Loading projects..." })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "project-manager", children: [(0, jsx_runtime_1.jsxs)("div", { className: "header", children: [(0, jsx_runtime_1.jsx)("h2", { children: "My Projects" }), (0, jsx_runtime_1.jsx)("button", { className: "btn-create", onClick: () => setShowCreateModal(true), children: "+ New Project" })] }), error && ((0, jsx_runtime_1.jsxs)("div", { className: "error-message", children: [error, (0, jsx_runtime_1.jsx)("button", { onClick: loadProjects, children: "Retry" })] })), (0, jsx_runtime_1.jsx)("div", { className: "projects-grid", children: projects.map((project) => ((0, jsx_runtime_1.jsxs)("div", { className: "project-card", children: [(0, jsx_runtime_1.jsxs)("div", { className: "project-content", onClick: () => onSelectProject(project.id), children: [(0, jsx_runtime_1.jsx)("h3", { children: project.name }), (0, jsx_runtime_1.jsx)("p", { children: project.description || 'No description' }), (0, jsx_runtime_1.jsx)("div", { className: "project-meta", children: (0, jsx_runtime_1.jsxs)("span", { children: ["Created: ", new Date(project.createdAt).toLocaleDateString()] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "project-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "btn-icon", onClick: () => onSelectProject(project.id), title: "Open project", children: "\uD83D\uDCC2" }), (0, jsx_runtime_1.jsx)("button", { className: "btn-icon btn-delete", onClick: (e) => {
                                        e.stopPropagation();
                                        deleteProject(project.id, project.name);
                                    }, title: "Delete project", children: "\uD83D\uDDD1\uFE0F" })] })] }, project.id))) }), projects.length === 0 && !error && ((0, jsx_runtime_1.jsxs)("div", { className: "empty-state", children: [(0, jsx_runtime_1.jsx)("p", { children: "No projects yet" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setShowCreateModal(true), children: "Create Your First Project" })] })), showCreateModal && ((0, jsx_runtime_1.jsx)("div", { className: "modal-overlay", onClick: () => setShowCreateModal(false), children: (0, jsx_runtime_1.jsxs)("div", { className: "modal", onClick: (e) => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "modal-header", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Create New Project" }), (0, jsx_runtime_1.jsx)("button", { className: "close-btn", onClick: () => setShowCreateModal(false), children: "\u00D7" })] }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: createProject, children: [(0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "Project Name *" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: newProject.name, onChange: (e) => setNewProject({ ...newProject, name: e.target.value }), placeholder: "My Test Project", required: true })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "Description" }), (0, jsx_runtime_1.jsx)("textarea", { value: newProject.description, onChange: (e) => setNewProject({ ...newProject, description: e.target.value }), placeholder: "Optional description", rows: 3 })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-actions", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setShowCreateModal(false), children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", className: "btn-primary", children: "Create Project" })] })] })] }) }))] }));
};
exports.ProjectManager = ProjectManager;
//# sourceMappingURL=ProjectManager.js.map