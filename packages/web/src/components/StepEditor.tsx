'use client';

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import type { TestStep } from '@/lib/api';

interface StepEditorProps {
  step: TestStep | null;
  onSave: (step: TestStep) => void;
  onCancel: () => void;
  variables?: string[];
}

export const ACTION_CATEGORIES = {
  navigation: {
    label: 'Navigation',
    actions: [
      { value: 'navigate', label: 'Navigate to URL', needsValue: true, needsLocator: false, icon: '🌐', desc: 'Open a web page' },
      { value: 'goBack', label: 'Go Back', needsValue: false, needsLocator: false, icon: '⬅️', desc: 'Navigate back' },
      { value: 'goForward', label: 'Go Forward', needsValue: false, needsLocator: false, icon: '➡️', desc: 'Navigate forward' },
      { value: 'refresh', label: 'Refresh Page', needsValue: false, needsLocator: false, icon: '🔄', desc: 'Reload page' },
    ],
  },
  interactions: {
    label: 'Interactions',
    actions: [
      { value: 'click', label: 'Click', needsValue: false, needsLocator: true, icon: '👆', desc: 'Click an element' },
      { value: 'doubleClick', label: 'Double Click', needsValue: false, needsLocator: true, icon: '👆👆', desc: 'Double click element' },
      { value: 'rightClick', label: 'Right Click', needsValue: false, needsLocator: true, icon: '🖱️', desc: 'Context menu' },
      { value: 'hover', label: 'Hover', needsValue: false, needsLocator: true, icon: '👋', desc: 'Hover over element' },
    ],
  },
  input: {
    label: 'Input',
    actions: [
      { value: 'type', label: 'Type Text', needsValue: true, needsLocator: true, icon: '⌨️', desc: 'Type into field' },
      { value: 'fill', label: 'Fill Input', needsValue: true, needsLocator: true, icon: '📝', desc: 'Fill input field' },
      { value: 'clear', label: 'Clear Input', needsValue: false, needsLocator: true, icon: '🧹', desc: 'Clear field' },
      { value: 'press', label: 'Press Key', needsValue: true, needsLocator: false, icon: '⌨️', desc: 'Press keyboard key' },
      { value: 'select', label: 'Select Option', needsValue: true, needsLocator: true, icon: '📋', desc: 'Select dropdown option' },
      { value: 'check', label: 'Check Checkbox', needsValue: false, needsLocator: true, icon: '☑️', desc: 'Check checkbox' },
      { value: 'uncheck', label: 'Uncheck Checkbox', needsValue: false, needsLocator: true, icon: '⬜', desc: 'Uncheck checkbox' },
      { value: 'upload', label: 'Upload File', needsValue: true, needsLocator: true, icon: '📁', desc: 'Upload file' },
    ],
  },
  assertions: {
    label: 'Assertions',
    actions: [
      { value: 'assert', label: 'Assert Visible', needsValue: false, needsLocator: true, icon: '✅', desc: 'Verify element is visible' },
      { value: 'assertText', label: 'Assert Text', needsValue: true, needsLocator: true, icon: '📄', desc: 'Verify text content' },
      { value: 'assertValue', label: 'Assert Value', needsValue: true, needsLocator: true, icon: '🔤', desc: 'Verify input value' },
      { value: 'assertAttribute', label: 'Assert Attribute', needsValue: true, needsLocator: true, icon: '🏷️', desc: 'Verify attribute' },
      { value: 'assertCount', label: 'Assert Count', needsValue: true, needsLocator: true, icon: '#️⃣', desc: 'Verify element count' },
      { value: 'assertUrl', label: 'Assert URL', needsValue: true, needsLocator: false, icon: '🌐', desc: 'Verify current URL' },
      { value: 'assertTitle', label: 'Assert Title', needsValue: true, needsLocator: false, icon: '📋', desc: 'Verify page title' },
    ],
  },
  waits: {
    label: 'Waits',
    actions: [
      { value: 'wait', label: 'Wait (seconds)', needsValue: true, needsLocator: false, icon: '⏱️', desc: 'Wait for duration' },
      { value: 'waitForElement', label: 'Wait for Element', needsValue: false, needsLocator: true, icon: '⌛', desc: 'Wait for element' },
      { value: 'waitForText', label: 'Wait for Text', needsValue: true, needsLocator: true, icon: '📝', desc: 'Wait for text' },
    ],
  },
  advanced: {
    label: 'Advanced',
    actions: [
      { value: 'executeScript', label: 'Execute JavaScript', needsValue: true, needsLocator: false, icon: '⚡', desc: 'Run JS code' },
      { value: 'screenshot', label: 'Take Screenshot', needsValue: true, needsLocator: false, icon: '📷', desc: 'Capture screenshot' },
      { value: 'scroll', label: 'Scroll', needsValue: true, needsLocator: false, icon: '📜', desc: 'Scroll page' },
      { value: 'scrollToElement', label: 'Scroll to Element', needsValue: false, needsLocator: true, icon: '🎯', desc: 'Scroll to element' },
      { value: 'dragDrop', label: 'Drag and Drop', needsValue: true, needsLocator: true, icon: '🔀', desc: 'Drag and drop' },
      { value: 'switchTab', label: 'Switch Tab', needsValue: true, needsLocator: false, icon: '🔄', desc: 'Switch browser tab' },
      { value: 'switchFrame', label: 'Switch Frame', needsValue: false, needsLocator: true, icon: '🖼️', desc: 'Switch to iframe' },
      { value: 'handleAlert', label: 'Handle Alert', needsValue: true, needsLocator: false, icon: '⚠️', desc: 'Accept/dismiss alert' },
      { value: 'extractText', label: 'Extract Text', needsValue: true, needsLocator: true, icon: '📤', desc: 'Extract text to variable' },
      { value: 'extractAttribute', label: 'Extract Attribute', needsValue: true, needsLocator: true, icon: '🏷️', desc: 'Extract attribute' },
    ],
  },
};

const LOCATOR_STRATEGIES = [
  { value: 'css', label: 'CSS Selector', icon: '🎨' },
  { value: 'xpath', label: 'XPath', icon: '🔍' },
  { value: 'id', label: 'ID', icon: '#️⃣' },
  { value: 'name', label: 'Name', icon: '📛' },
  { value: 'text', label: 'Text Content', icon: '📝' },
  { value: 'dataTestId', label: 'Data Test ID', icon: '🏷️' },
];

function getAllActions() {
  return Object.values(ACTION_CATEGORIES).flatMap((cat) => cat.actions);
}

export function StepEditor({ step, onSave, onCancel, variables = [] }: StepEditorProps) {
  const [formData, setFormData] = useState<TestStep>({ id: '', action: 'navigate', enabled: true });
  const [activeCategory, setActiveCategory] = useState('navigation');

  useEffect(() => {
    if (step) {
      setFormData(step);
      Object.entries(ACTION_CATEGORIES).forEach(([catKey, category]) => {
        if (category.actions.some((a) => a.value === step.action)) {
          setActiveCategory(catKey);
        }
      });
    } else {
      setFormData({ id: Date.now().toString(), action: 'navigate', enabled: true });
    }
  }, [step]);

  const updateField = (field: keyof TestStep, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const currentAction = getAllActions().find((a) => a.value === formData.action);
  const category = ACTION_CATEGORIES[activeCategory as keyof typeof ACTION_CATEGORIES];

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {step ? 'Edit Test Step' : 'Create New Step'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-white/20 rounded-lg">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-[calc(90vh-4rem)]">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Step Description (optional)
              </label>
              <input
                type="text"
                className={inputClass}
                placeholder="e.g., Login with valid credentials"
                value={formData.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>

            {/* Action selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Action</h3>
              <div className="flex gap-2 mb-4 flex-wrap">
                {Object.entries(ACTION_CATEGORIES).map(([key, cat]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveCategory(key)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      activeCategory === key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {category.actions.map((action) => (
                  <button
                    key={action.value}
                    type="button"
                    onClick={() => updateField('action', action.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      formData.action === action.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{action.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900">{action.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{action.desc}</div>
                      </div>
                      {formData.action === action.value && (
                        <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Locator */}
            {currentAction?.needsLocator && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Element Locator</h3>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Locator Strategy
                </label>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {LOCATOR_STRATEGIES.map((strategy) => (
                    <button
                      key={strategy.value}
                      type="button"
                      onClick={() =>
                        updateField('customProperties', {
                          ...formData.customProperties,
                          locatorStrategy: strategy.value,
                        })
                      }
                      className={`p-3 rounded-lg border transition-all ${
                        formData.customProperties?.locatorStrategy === strategy.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-xl mb-1">{strategy.icon}</div>
                        <div className="text-xs font-medium text-gray-700">{strategy.label}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Locator Value</label>
                <input
                  type="text"
                  className={`${inputClass} font-mono text-sm`}
                  placeholder="e.g., #username, //button[@type='submit']"
                  value={formData.locator || ''}
                  onChange={(e) => updateField('locator', e.target.value)}
                  required={currentAction.needsLocator}
                />
              </div>
            )}

            {/* Value */}
            {currentAction?.needsValue && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Value / Input</h3>
                <textarea
                  className={inputClass}
                  rows={3}
                  placeholder="Enter value or input..."
                  value={formData.value || ''}
                  onChange={(e) => updateField('value', e.target.value)}
                  required={currentAction.needsValue}
                />
                {variables.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {variables.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => updateField('value', (formData.value || '') + `{{${v}}}`)}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-gray-700"
                      >
                        {`{{${v}}}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Advanced */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Advanced Options</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timeout (ms)</label>
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="30000"
                    value={formData.timeout || ''}
                    onChange={(e) => updateField('timeout', parseInt(e.target.value) || undefined)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Screenshot Name
                  </label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Optional"
                    value={formData.screenshot || ''}
                    onChange={(e) => updateField('screenshot', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.scrollIntoView || false}
                    onChange={(e) => updateField('scrollIntoView', e.target.checked)}
                  />
                  <span className="text-sm text-gray-700">Scroll element into view</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enabled !== false}
                    onChange={(e) => updateField('enabled', e.target.checked)}
                  />
                  <span className="text-sm text-gray-700">Step enabled</span>
                </label>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 px-6 py-4 bg-white flex items-center justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> {step ? 'Update Step' : 'Add Step'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
