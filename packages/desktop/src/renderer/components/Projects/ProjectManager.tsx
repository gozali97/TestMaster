import { useState, useEffect } from 'react';
import { ApiService, Project } from '../../services/api.service';
import './ProjectManager.css';

interface ProjectManagerProps {
  onSelectProject: (projectId: number) => void;
}

export const ProjectManager = ({ onSelectProject }: ProjectManagerProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    setError('');

    const result = await ApiService.getProjects();

    if (result.success && result.data) {
      setProjects(result.data);
    } else {
      setError(result.error || 'Failed to load projects');
    }

    setLoading(false);
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProject.name.trim()) {
      alert('Project name is required');
      return;
    }

    const result = await ApiService.createProject(newProject);

    if (result.success && result.data) {
      setShowCreateModal(false);
      setNewProject({ name: '', description: '' });
      loadProjects();
    } else {
      alert('Failed to create project: ' + (result.error || 'Unknown error'));
    }
  };

  const deleteProject = async (id: number, name: string) => {
    if (!confirm(`Delete project "${name}"? This action cannot be undone.`)) {
      return;
    }

    const result = await ApiService.deleteProject(id);

    if (result.success) {
      loadProjects();
    } else {
      alert('Failed to delete project: ' + (result.error || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="project-manager loading">
        <div className="spinner"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="project-manager">
      <div className="header">
        <h2>My Projects</h2>
        <button className="btn-create" onClick={() => setShowCreateModal(true)}>
          + New Project
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={loadProjects}>Retry</button>
        </div>
      )}

      <div className="projects-grid">
        {projects.map((project) => (
          <div
            key={project.id}
            className="project-card"
          >
            <div 
              className="project-content"
              onClick={() => onSelectProject(project.id)}
            >
              <h3>{project.name}</h3>
              <p>{project.description || 'No description'}</p>
              <div className="project-meta">
                <span>Created: {new Date(project.createdAt!).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="project-actions">
              <button
                className="btn-icon"
                onClick={() => onSelectProject(project.id)}
                title="Open project"
              >
                📂
              </button>
              <button
                className="btn-icon btn-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteProject(project.id, project.name);
                }}
                title="Delete project"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && !error && (
        <div className="empty-state">
          <p>No projects yet</p>
          <button onClick={() => setShowCreateModal(true)}>
            Create Your First Project
          </button>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Project</h3>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={createProject}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="My Test Project"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
