import { useState, useEffect } from 'react';
import { TestEditorAPI } from './components/Editor/TestEditorAPI';
import { ProjectManager } from './components/Projects/ProjectManager';
import { TestCaseList } from './components/Tests/TestCaseList';
import { Recorder } from './components/Recorder/Recorder';
import { TestExecutionRunner } from './components/Execution/TestExecutionRunner';
import { ApiService } from './services/api.service';
import AutonomousTestingPage from '../pages/AutonomousTesting';
import AutonomousTestingMultiPanel from '../pages/AutonomousTestingMultiPanel';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState<'projects' | 'tests' | 'editor' | 'recorder' | 'objects' | 'execution' | 'autonomous' | 'multipanel'>('projects');
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    // Check authentication on mount
    setIsAuthenticated(ApiService.isAuthenticated());
  }, []);

  const handleProjectSelect = (projectId: number) => {
    setSelectedProject(projectId);
    setSelectedTest(null); // Reset test selection
    setActiveView('tests'); // Go to tests list, not directly to editor
  };

  const handleTestSelect = (testId: number) => {
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

  // Simple login form (inline)
  const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      const result = await ApiService.login(email, password);
      if (result.success && result.data?.tokens) {
        ApiService.storeTokens(result.data.tokens.accessToken, result.data.tokens.refreshToken);
        setIsAuthenticated(true);
        setShowLogin(false);
      } else {
        setError(result.error || 'Login failed');
      }
    };

    return (
      <div className="login-overlay">
        <div className="login-modal">
          <h2>Login to TestMaster</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>
          <p className="login-hint">
            Tip: Login with your web credentials or register at http://localhost:3000/register
          </p>
        </div>
      </div>
    );
  };

  if (!isAuthenticated || showLogin) {
    return <LoginForm />;
  }

  return (
    <div className="app">
      <div className="titlebar">
        <h1>TestMaster IDE</h1>
        <button 
          className="logout-btn"
          onClick={() => {
            ApiService.clearTokens();
            setIsAuthenticated(false);
          }}
        >
          Logout
        </button>
      </div>
      
      <div className="container">
        <aside className="sidebar">
          <nav>
            <button 
              className={activeView === 'projects' ? 'active' : ''}
              onClick={handleBackToProjects}
            >
              📁 Projects
            </button>
            <button 
              className={activeView === 'tests' ? 'active' : ''}
              onClick={() => setActiveView('tests')}
            >
              📝 Tests
            </button>
            <button 
              className={activeView === 'editor' ? 'active' : ''}
              onClick={() => setActiveView('editor')}
            >
              ✏️ Editor
            </button>
            <button 
              className={activeView === 'recorder' ? 'active' : ''}
              onClick={() => setActiveView('recorder')}
            >
              ⏺️ Recorder
            </button>
            <button 
              className={activeView === 'objects' ? 'active' : ''}
              onClick={() => setActiveView('objects')}
            >
              📦 Objects
            </button>
            <button 
              className={activeView === 'execution' ? 'active' : ''}
              onClick={() => setActiveView('execution')}
            >
              ▶️ Execute
            </button>
            <button 
              className={activeView === 'autonomous' ? 'active' : ''}
              onClick={() => setActiveView('autonomous')}
            >
              🤖 Autonomous Testing
            </button>
            <button 
              className={activeView === 'multipanel' ? 'active' : ''}
              onClick={() => setActiveView('multipanel')}
            >
              🎯 Multi-Panel Testing
            </button>
          </nav>
        </aside>
        
        <main className="main-content">
          {activeView === 'projects' && (
            <ProjectManager onSelectProject={handleProjectSelect} />
          )}
          
          {activeView === 'tests' && (
            <>
              {selectedProject ? (
                <TestCaseList 
                  projectId={selectedProject}
                  onSelectTest={handleTestSelect}
                  onBack={handleBackToProjects}
                />
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>Select a Project First</h3>
                  <p>Please select a project from the Projects menu to view its test cases</p>
                  <button 
                    className="btn-primary"
                    onClick={() => setActiveView('projects')}
                  >
                    📁 Go to Projects
                  </button>
                </div>
              )}
            </>
          )}
          
          {activeView === 'editor' && (
            <>
              {selectedProject ? (
                <TestEditorAPI 
                  projectId={selectedProject} 
                  testCaseId={selectedTest || undefined}
                  onBack={handleBackToTests}
                />
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">✏️</div>
                  <h3>Select a Project First</h3>
                  <p>Please select a project and test case to edit</p>
                  <button 
                    className="btn-primary"
                    onClick={() => setActiveView('projects')}
                  >
                    📁 Go to Projects
                  </button>
                </div>
              )}
            </>
          )}
          
          {activeView === 'recorder' && <Recorder />}
          
          {activeView === 'objects' && (
            <div className="objects-view">
              <h2>Object Repository</h2>
              <p>Manage test objects and locators</p>
              <div className="coming-soon">🚧 Coming Soon</div>
            </div>
          )}
          
          {activeView === 'execution' && <TestExecutionRunner />}
          
          {activeView === 'autonomous' && <AutonomousTestingPage />}
          
          {activeView === 'multipanel' && <AutonomousTestingMultiPanel />}
        </main>
      </div>
    </div>
  );
}

export default App;
