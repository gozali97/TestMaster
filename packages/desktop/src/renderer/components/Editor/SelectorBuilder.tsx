import { useState } from 'react';
import './SelectorBuilder.css';

interface SelectorBuilderProps {
  initialSelector?: string;
  onSave: (selector: string) => void;
  onCancel: () => void;
}

export const SelectorBuilder = ({ initialSelector = '', onSave, onCancel }: SelectorBuilderProps) => {
  const [strategy, setStrategy] = useState<string>('css');
  const [value, setValue] = useState(initialSelector);
  const [attributeName, setAttributeName] = useState('');
  const [attributeValue, setAttributeValue] = useState('');
  const [textContent, setTextContent] = useState('');
  const [role, setRole] = useState('');
  const [preview, setPreview] = useState(initialSelector);

  const generateSelector = () => {
    let selector = '';
    
    switch (strategy) {
      case 'css':
        selector = value;
        break;
      case 'xpath':
        selector = value;
        break;
      case 'id':
        selector = `#${value}`;
        break;
      case 'class':
        selector = `.${value}`;
        break;
      case 'name':
        selector = `[name="${value}"]`;
        break;
      case 'tag':
        selector = value;
        break;
      case 'text':
        selector = `text=${textContent}`;
        break;
      case 'placeholder':
        selector = `[placeholder="${value}"]`;
        break;
      case 'testid':
        selector = `[data-testid="${value}"]`;
        break;
      case 'role':
        selector = `role=${role}`;
        break;
      case 'attribute':
        selector = `[${attributeName}="${attributeValue}"]`;
        break;
      case 'contains':
        selector = `text*=${textContent}`;
        break;
      case 'starts':
        selector = `text^=${textContent}`;
        break;
      case 'ends':
        selector = `text$=${textContent}`;
        break;
    }
    
    setPreview(selector);
  };

  const handleSave = () => {
    onSave(preview || value);
  };

  const commonSelectors = [
    { label: 'Submit Button', value: 'button[type="submit"]' },
    { label: 'First Input', value: 'input:first-of-type' },
    { label: 'Login Form', value: 'form[name="login"]' },
    { label: 'Main Content', value: 'main, #main, [role="main"]' },
    { label: 'Navigation', value: 'nav, [role="navigation"]' },
    { label: 'Modal Dialog', value: '[role="dialog"]' },
  ];

  return (
    <div className="selector-builder-overlay" onClick={onCancel}>
      <div className="selector-builder-modal" onClick={(e) => e.stopPropagation()}>
        <div className="selector-builder-header">
          <h3>Element Selector Builder</h3>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <div className="selector-builder-content">
          <div className="strategy-selector">
            <label>Selector Strategy:</label>
            <select value={strategy} onChange={(e) => setStrategy(e.target.value)}>
              <option value="css">CSS Selector</option>
              <option value="xpath">XPath</option>
              <option value="id">ID</option>
              <option value="class">Class Name</option>
              <option value="name">Name Attribute</option>
              <option value="tag">Tag Name</option>
              <option value="text">Exact Text</option>
              <option value="contains">Contains Text</option>
              <option value="starts">Starts With Text</option>
              <option value="ends">Ends With Text</option>
              <option value="placeholder">Placeholder</option>
              <option value="testid">Test ID (data-testid)</option>
              <option value="role">ARIA Role</option>
              <option value="attribute">Custom Attribute</option>
            </select>
          </div>

          <div className="selector-input-section">
            {(strategy === 'css' || strategy === 'xpath') && (
              <div className="form-group">
                <label>{strategy === 'css' ? 'CSS Selector' : 'XPath'}:</label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={strategy === 'css' ? '#myButton.primary' : '//button[@id="submit"]'}
                />
              </div>
            )}

            {['id', 'class', 'name', 'tag', 'placeholder', 'testid'].includes(strategy) && (
              <div className="form-group">
                <label>
                  {strategy === 'id' && 'Element ID:'}
                  {strategy === 'class' && 'Class Name:'}
                  {strategy === 'name' && 'Name Attribute:'}
                  {strategy === 'tag' && 'Tag Name:'}
                  {strategy === 'placeholder' && 'Placeholder Text:'}
                  {strategy === 'testid' && 'Test ID:'}
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={
                    strategy === 'id' ? 'submit-button' :
                    strategy === 'class' ? 'btn-primary' :
                    strategy === 'name' ? 'username' :
                    strategy === 'tag' ? 'button' :
                    strategy === 'placeholder' ? 'Enter your email' :
                    'user-login-btn'
                  }
                />
              </div>
            )}

            {['text', 'contains', 'starts', 'ends'].includes(strategy) && (
              <div className="form-group">
                <label>Text Content:</label>
                <input
                  type="text"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Click here"
                />
              </div>
            )}

            {strategy === 'role' && (
              <div className="form-group">
                <label>ARIA Role:</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="">Select role...</option>
                  <option value="button">button</option>
                  <option value="link">link</option>
                  <option value="textbox">textbox</option>
                  <option value="checkbox">checkbox</option>
                  <option value="radio">radio</option>
                  <option value="navigation">navigation</option>
                  <option value="main">main</option>
                  <option value="dialog">dialog</option>
                  <option value="alert">alert</option>
                  <option value="menu">menu</option>
                  <option value="menuitem">menuitem</option>
                  <option value="tab">tab</option>
                  <option value="tabpanel">tabpanel</option>
                </select>
              </div>
            )}

            {strategy === 'attribute' && (
              <>
                <div className="form-group">
                  <label>Attribute Name:</label>
                  <input
                    type="text"
                    value={attributeName}
                    onChange={(e) => setAttributeName(e.target.value)}
                    placeholder="data-action"
                  />
                </div>
                <div className="form-group">
                  <label>Attribute Value:</label>
                  <input
                    type="text"
                    value={attributeValue}
                    onChange={(e) => setAttributeValue(e.target.value)}
                    placeholder="submit"
                  />
                </div>
              </>
            )}

            <button className="btn-generate" onClick={generateSelector}>
              Generate Selector
            </button>
          </div>

          <div className="selector-preview">
            <label>Generated Selector:</label>
            <div className="preview-box">
              <code>{preview || 'Click "Generate Selector" to see preview'}</code>
            </div>
          </div>

          <div className="common-selectors">
            <label>Common Selectors:</label>
            <div className="selector-chips">
              {commonSelectors.map((sel, idx) => (
                <button
                  key={idx}
                  className="chip"
                  onClick={() => {
                    setValue(sel.value);
                    setPreview(sel.value);
                  }}
                >
                  {sel.label}
                </button>
              ))}
            </div>
          </div>

          <div className="selector-tips">
            <h4>💡 Tips:</h4>
            <ul>
              <li><strong>CSS:</strong> Use for standard web selectors like #id, .class, tag[attr]</li>
              <li><strong>XPath:</strong> Use for complex DOM navigation like //div[@class="item"][2]</li>
              <li><strong>Text:</strong> Most reliable for buttons and links with stable text</li>
              <li><strong>Test ID:</strong> Best practice - add data-testid to your elements</li>
              <li><strong>Role:</strong> Accessibility-first approach using ARIA roles</li>
            </ul>
          </div>
        </div>

        <div className="selector-builder-footer">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-save" onClick={handleSave}>Use This Selector</button>
        </div>
      </div>
    </div>
  );
};
