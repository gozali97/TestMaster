import { useState } from 'react';
import { MonacoEditor } from './MonacoEditor';
import { StepEditor, TestStep } from './StepEditor';
import { VariableManager, Variable } from './VariableManager';
import './TestEditor.css';

export const TestEditor = () => {
  const [view, setView] = useState<'visual' | 'script'>('visual');
  const [steps, setSteps] = useState<TestStep[]>([
    { id: '1', action: 'navigate', value: 'https://example.com', description: 'Navigate to website', enabled: true },
    { id: '2', action: 'click', locator: '#login-button', description: 'Click login button', enabled: true },
  ]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [scriptCode, setScriptCode] = useState(generateScript(steps, variables));
  const [editingStep, setEditingStep] = useState<TestStep | null>(null);
  const [showStepEditor, setShowStepEditor] = useState(false);
  const [showVariableManager, setShowVariableManager] = useState(false);

  function replaceVariables(text: string, vars: Variable[]): string {
    let result = text;
    vars.forEach(v => {
      result = result.replace(new RegExp(`\\{\\{${v.name}\\}\\}`, 'g'), v.value);
    });
    return result;
  }

  function generateScript(steps: TestStep[], vars: Variable[]): string {
    let script = `import { test, expect } from '@playwright/test';\n\n`;
    
    if (vars.length > 0) {
      script += `// Variables\n`;
      vars.forEach(v => {
        if (v.type === 'env') {
          script += `const ${v.name} = process.env.${v.name};\n`;
        } else if (v.type === 'string') {
          script += `const ${v.name} = '${v.value}';\n`;
        } else {
          script += `const ${v.name} = ${v.value};\n`;
        }
      });
      script += `\n`;
    }
    
    script += `test('Test Case', async ({ page }) => {\n`;
    
    steps.filter(s => s.enabled !== false).forEach(step => {
      const value = step.value ? replaceVariables(step.value, vars) : '';
      const locator = step.locator ? replaceVariables(step.locator, vars) : '';
      
      if (step.description) {
        script += `  // ${step.description}\n`;
      }
      
      switch (step.action) {
        case 'navigate':
          script += `  await page.goto('${value}');\n`;
          break;
        case 'click':
          script += `  await page.click('${locator}');\n`;
          break;
        case 'doubleClick':
          script += `  await page.dblclick('${locator}');\n`;
          break;
        case 'rightClick':
          script += `  await page.click('${locator}', { button: 'right' });\n`;
          break;
        case 'hover':
          script += `  await page.hover('${locator}');\n`;
          break;
        case 'type':
        case 'fill':
          script += `  await page.fill('${locator}', '${value}');\n`;
          break;
        case 'clear':
          script += `  await page.fill('${locator}', '');\n`;
          break;
        case 'press':
          script += `  await page.keyboard.press('${value}');\n`;
          break;
        case 'select':
          script += `  await page.selectOption('${locator}', '${value}');\n`;
          break;
        case 'check':
          script += `  await page.check('${locator}');\n`;
          break;
        case 'uncheck':
          script += `  await page.uncheck('${locator}');\n`;
          break;
        case 'upload':
          script += `  await page.setInputFiles('${locator}', '${value}');\n`;
          break;
        case 'wait':
          script += `  await page.waitForTimeout(${value});\n`;
          break;
        case 'waitForElement':
          script += `  await page.waitForSelector('${locator}', { state: '${step.waitCondition || 'visible'}' });\n`;
          break;
        case 'screenshot':
          script += `  await page.screenshot({ path: '${value}.png' });\n`;
          break;
        case 'assert':
          script += `  await expect(page.locator('${locator}')).toBeVisible();\n`;
          break;
        case 'assertText':
          script += `  await expect(page.locator('${locator}')).toHaveText('${value}');\n`;
          break;
        case 'assertValue':
          script += `  await expect(page.locator('${locator}')).toHaveValue('${value}');\n`;
          break;
        case 'executeScript':
          script += `  await page.evaluate(() => { ${value} });\n`;
          break;
        case 'refresh':
          script += `  await page.reload();\n`;
          break;
        case 'goBack':
          script += `  await page.goBack();\n`;
          break;
        case 'goForward':
          script += `  await page.goForward();\n`;
          break;
      }
    });
    
    script += `});\n`;
    return script;
  }

  const openAddStepEditor = () => {
    setEditingStep(null);
    setShowStepEditor(true);
  };

  const openEditStepEditor = (step: TestStep) => {
    setEditingStep(step);
    setShowStepEditor(true);
  };

  const handleSaveStep = (step: TestStep) => {
    if (editingStep) {
      const newSteps = steps.map(s => s.id === step.id ? step : s);
      setSteps(newSteps);
      setScriptCode(generateScript(newSteps, variables));
    } else {
      const newSteps = [...steps, step];
      setSteps(newSteps);
      setScriptCode(generateScript(newSteps, variables));
    }
    setShowStepEditor(false);
    setEditingStep(null);
  };

  const deleteStep = (id: string) => {
    const newSteps = steps.filter(s => s.id !== id);
    setSteps(newSteps);
    setScriptCode(generateScript(newSteps, variables));
  };

  const duplicateStep = (step: TestStep) => {
    const newStep = { ...step, id: Date.now().toString() };
    const index = steps.findIndex(s => s.id === step.id);
    const newSteps = [...steps.slice(0, index + 1), newStep, ...steps.slice(index + 1)];
    setSteps(newSteps);
    setScriptCode(generateScript(newSteps, variables));
  };

  const moveStep = (id: string, direction: 'up' | 'down') => {
    const index = steps.findIndex(s => s.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === steps.length - 1)) {
      return;
    }
    
    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setSteps(newSteps);
    setScriptCode(generateScript(newSteps, variables));
  };

  const toggleStepEnabled = (id: string) => {
    const newSteps = steps.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    setSteps(newSteps);
    setScriptCode(generateScript(newSteps, variables));
  };

  const handleUpdateVariables = (newVars: Variable[]) => {
    setVariables(newVars);
    setScriptCode(generateScript(steps, newVars));
  };

  return (
    <div className="test-editor">
      <div className="editor-toolbar">
        <div className="view-toggle">
          <button
            className={view === 'visual' ? 'active' : ''}
            onClick={() => setView('visual')}
          >
            Visual Editor
          </button>
          <button
            className={view === 'script' ? 'active' : ''}
            onClick={() => setView('script')}
          >
            Script View
          </button>
        </div>
        <div className="actions">
          <button className="btn-primary" onClick={openAddStepEditor}>
            + Add Step
          </button>
          <button className="btn-secondary" onClick={() => setShowVariableManager(true)}>
            Variables ({variables.length})
          </button>
          <button className="btn-secondary">
            Run Test
          </button>
          <button className="btn-secondary">
            Save
          </button>
        </div>
      </div>

      {view === 'visual' ? (
        <div className="visual-editor">
          <div className="steps-list">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`step-item ${step.enabled === false ? 'disabled' : ''}`}
              >
                <div className="step-number">{index + 1}</div>
                <div className="step-content" onClick={() => openEditStepEditor(step)}>
                  <div className="step-header">
                    <span className="step-action">{step.action}</span>
                    {step.enabled === false && <span className="disabled-badge">DISABLED</span>}
                  </div>
                  {step.description && <div className="step-description">{step.description}</div>}
                  {step.locator && <div className="step-locator">🎯 {step.locator}</div>}
                  {step.value && <div className="step-value">📝 {step.value}</div>}
                  {step.timeout && step.timeout !== 30000 && (
                    <div className="step-timeout">⏱️ {step.timeout}ms</div>
                  )}
                </div>
                <div className="step-actions">
                  <button 
                    className="btn-icon" 
                    onClick={(e) => { e.stopPropagation(); moveStep(step.id, 'up'); }}
                    disabled={index === 0}
                    title="Move up"
                  >
                    ⬆️
                  </button>
                  <button 
                    className="btn-icon" 
                    onClick={(e) => { e.stopPropagation(); moveStep(step.id, 'down'); }}
                    disabled={index === steps.length - 1}
                    title="Move down"
                  >
                    ⬇️
                  </button>
                  <button 
                    className="btn-icon" 
                    onClick={(e) => { e.stopPropagation(); duplicateStep(step); }}
                    title="Duplicate"
                  >
                    📋
                  </button>
                  <button 
                    className="btn-icon" 
                    onClick={(e) => { e.stopPropagation(); toggleStepEnabled(step.id); }}
                    title={step.enabled === false ? 'Enable' : 'Disable'}
                  >
                    {step.enabled === false ? '👁️' : '🚫'}
                  </button>
                  <button 
                    className="btn-icon btn-delete" 
                    onClick={(e) => { e.stopPropagation(); deleteStep(step.id); }}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            {steps.length === 0 && (
              <div className="empty-state">
                <p>No steps added yet</p>
                <p>Click "Add Step" to create your first test step</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="script-editor">
          <MonacoEditor
            value={scriptCode}
            onChange={setScriptCode}
            language="javascript"
            theme="vs-dark"
          />
        </div>
      )}

      {showStepEditor && (
        <StepEditor
          step={editingStep}
          onSave={handleSaveStep}
          onCancel={() => {
            setShowStepEditor(false);
            setEditingStep(null);
          }}
          variables={variables.map(v => v.name)}
        />
      )}

      {showVariableManager && (
        <VariableManager
          variables={variables}
          onUpdate={handleUpdateVariables}
          onClose={() => setShowVariableManager(false)}
        />
      )}
    </div>
  );
};
