import { useState } from 'react';
import './VariableManager.css';

export interface Variable {
  id: string;
  name: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'env';
  description?: string;
}

interface VariableManagerProps {
  variables: Variable[];
  onUpdate: (variables: Variable[]) => void;
  onClose: () => void;
}

export const VariableManager = ({ variables, onUpdate, onClose }: VariableManagerProps) => {
  const [localVars, setLocalVars] = useState<Variable[]>(variables);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newVar, setNewVar] = useState<Partial<Variable>>({
    name: '',
    value: '',
    type: 'string',
    description: '',
  });

  const addVariable = () => {
    if (!newVar.name || !newVar.value) {
      alert('Name and value are required');
      return;
    }

    if (localVars.some(v => v.name === newVar.name)) {
      alert('Variable name already exists');
      return;
    }

    const variable: Variable = {
      id: Date.now().toString(),
      name: newVar.name,
      value: newVar.value,
      type: newVar.type || 'string',
      description: newVar.description,
    };

    setLocalVars([...localVars, variable]);
    setNewVar({ name: '', value: '', type: 'string', description: '' });
  };

  const deleteVariable = (id: string) => {
    setLocalVars(localVars.filter(v => v.id !== id));
  };

  const updateVariable = (id: string, updates: Partial<Variable>) => {
    setLocalVars(localVars.map(v => v.id === id ? { ...v, ...updates } : v));
    setEditingId(null);
  };

  const handleSave = () => {
    onUpdate(localVars);
    onClose();
  };

  const presetVariables = [
    { name: 'BASE_URL', value: 'https://example.com', type: 'string' as const },
    { name: 'USERNAME', value: 'testuser@example.com', type: 'string' as const },
    { name: 'PASSWORD', value: 'TestPass123!', type: 'string' as const },
    { name: 'TIMEOUT', value: '30000', type: 'number' as const },
    { name: 'API_KEY', value: 'sk_test_...', type: 'env' as const },
  ];

  return (
    <div className="variable-manager-overlay" onClick={onClose}>
      <div className="variable-manager-modal" onClick={(e) => e.stopPropagation()}>
        <div className="variable-manager-header">
          <h3>Variable Manager</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="variable-manager-content">
          <div className="add-variable-section">
            <h4>Add New Variable</h4>
            <div className="add-variable-form">
              <input
                type="text"
                placeholder="Variable name (e.g., USERNAME)"
                value={newVar.name || ''}
                onChange={(e) => setNewVar({ ...newVar, name: e.target.value })}
              />
              <select
                value={newVar.type || 'string'}
                onChange={(e) => setNewVar({ ...newVar, type: e.target.value as any })}
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="env">Environment</option>
              </select>
              <input
                type="text"
                placeholder="Value"
                value={newVar.value || ''}
                onChange={(e) => setNewVar({ ...newVar, value: e.target.value })}
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newVar.description || ''}
                onChange={(e) => setNewVar({ ...newVar, description: e.target.value })}
              />
              <button className="btn-add" onClick={addVariable}>Add Variable</button>
            </div>
          </div>

          <div className="preset-variables">
            <h4>Quick Add Presets:</h4>
            <div className="preset-chips">
              {presetVariables.map((preset, idx) => (
                <button
                  key={idx}
                  className="preset-chip"
                  onClick={() => {
                    if (!localVars.some(v => v.name === preset.name)) {
                      setLocalVars([...localVars, {
                        id: Date.now().toString(),
                        ...preset,
                      }]);
                    }
                  }}
                >
                  + {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="variables-list">
            <h4>Variables ({localVars.length})</h4>
            {localVars.length === 0 ? (
              <div className="empty-state">
                <p>No variables defined yet</p>
                <p>Add variables to reuse values across test steps</p>
              </div>
            ) : (
              <div className="variables-table">
                {localVars.map((variable) => (
                  <div key={variable.id} className="variable-row">
                    {editingId === variable.id ? (
                      <>
                        <input
                          type="text"
                          value={variable.name}
                          onChange={(e) => updateVariable(variable.id, { name: e.target.value })}
                          className="edit-input"
                        />
                        <select
                          value={variable.type}
                          onChange={(e) => updateVariable(variable.id, { type: e.target.value as any })}
                          className="edit-select"
                        >
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                          <option value="env">Environment</option>
                        </select>
                        <input
                          type="text"
                          value={variable.value}
                          onChange={(e) => updateVariable(variable.id, { value: e.target.value })}
                          className="edit-input"
                        />
                        <button 
                          className="btn-save-edit"
                          onClick={() => setEditingId(null)}
                        >
                          ✓
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="var-name">
                          <code>{`{{${variable.name}}}`}</code>
                          <span className="var-type">{variable.type}</span>
                        </div>
                        <div className="var-value">
                          {variable.type === 'env' ? '••••••••' : variable.value}
                        </div>
                        {variable.description && (
                          <div className="var-description">{variable.description}</div>
                        )}
                        <div className="var-actions">
                          <button
                            className="btn-edit"
                            onClick={() => setEditingId(variable.id)}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => deleteVariable(variable.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="variable-usage">
            <h4>📝 How to use variables:</h4>
            <ul>
              <li>Use <code>{`{{VARIABLE_NAME}}`}</code> syntax in step values</li>
              <li>Example: Navigate to <code>{`{{BASE_URL}}/login`}</code></li>
              <li>Example: Type <code>{`{{USERNAME}}`}</code> in username field</li>
              <li>Environment variables are loaded from .env file</li>
            </ul>
          </div>
        </div>

        <div className="variable-manager-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSave}>Save Variables</button>
        </div>
      </div>
    </div>
  );
};
