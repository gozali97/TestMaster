import { TestStep } from '@testmaster/test-engine';

/**
 * Transform various test step formats to the standard TestStep interface
 * Handles legacy formats and ensures compatibility with StepExecutor
 */
export function transformTestSteps(rawSteps: any[]): TestStep[] {
  if (!rawSteps || !Array.isArray(rawSteps)) {
    throw new Error('Invalid steps: must be an array');
  }

  if (rawSteps.length === 0) {
    throw new Error('Test has no steps to execute');
  }

  return rawSteps.map((step, index) => {
    try {
      // Handle different step formats
      const actionType = step.actionType || step.action || step.command;
      
      if (!actionType) {
        throw new Error(`Step ${index} missing actionType/action/command`);
      }

      // Transform parameters from various formats
      let parameters: Record<string, any> = {};

      if (step.parameters && typeof step.parameters === 'object') {
        // Already in correct format
        parameters = step.parameters;
      } else {
        // Legacy format transformation
        const rawLocator = step.locator || step.target || step.selector || step.element;
        
        parameters = {
          // Locator variations (normalize XPath)
          locator: normalizeLocator(rawLocator),
          
          // Text/Value variations (map based on action type)
          text: step.text || step.value,
          
          // URL variations (for navigate action, use value field if url not present)
          url: step.url || (actionType === 'navigate' ? step.value : undefined),
          
          // Wait/Timeout variations (for wait action, value can be duration)
          duration: step.duration || step.wait || (actionType === 'wait' ? step.value : undefined),
          
          // Script variations
          script: step.script || step.javascript,
          
          // Assertion variations
          expected: step.expected || step.expectedValue,
          type: step.assertType || step.verificationType,
          
          // Select/Option variations
          value: step.option || (actionType === 'select' ? step.value : undefined),
        };

        // Remove undefined/null values
        Object.keys(parameters).forEach(key => {
          if (parameters[key] === undefined || parameters[key] === null) {
            delete parameters[key];
          }
        });
      }

      // Normalize action type BEFORE using it
      const normalizedActionType = normalizeActionType(actionType);
      
      // Special handling for fill/type action
      // If action is fill/type and we have value but no text, use value as text
      if ((normalizedActionType === 'type') && !parameters.text && step.value) {
        parameters.text = step.value;
      }
      
      // Special handling for wait action
      // Ensure duration is always a NUMBER, not string
      if (normalizedActionType === 'wait') {
        if (parameters.duration) {
          // Convert string to number if needed
          parameters.duration = typeof parameters.duration === 'string' 
            ? parseInt(parameters.duration, 10) 
            : parameters.duration;
        } else if (step.value) {
          // Use value as duration and convert to number
          parameters.duration = parseInt(step.value, 10);
        }
      }

      return {
        id: step.id || `step-${index}`,
        orderIndex: step.orderIndex !== undefined ? step.orderIndex : index,
        actionType: normalizedActionType,
        parameters,
        expectedResult: step.expectedResult || step.expected,
        timeout: step.timeout || 30000,
      };
    } catch (error: any) {
      throw new Error(`Failed to transform step ${index}: ${error.message}`);
    }
  });
}

/**
 * Normalize action type to match StepExecutor expectations
 */
function normalizeActionType(actionType: string): string {
  const normalized = actionType.toLowerCase().trim();
  
  // Map common variations to standard action types
  const actionMap: Record<string, string> = {
    // Navigation
    'goto': 'navigate',
    'open': 'navigate',
    'navigateto': 'navigate',
    'openurl': 'navigate',
    'visit': 'navigate',
    
    // Click
    'clickelement': 'click',
    'clickon': 'click',
    'press': 'click',
    
    // Type/Fill
    'typetext': 'type',
    'input': 'type',
    'fill': 'type',            // ✅ Map fill to type
    'sendkeys': 'type',
    'entertext': 'type',
    'setvalue': 'type',
    
    // Select
    'selectoption': 'select',
    'choose': 'select',
    
    // Check/Uncheck
    'checkelement': 'check',
    'uncheckelement': 'uncheck',
    'togglecheckbox': 'check',
    
    // Wait
    'sleep': 'wait',
    'pause': 'wait',
    'delay': 'wait',
    
    // Wait for element
    'waitfor': 'waitForElement',
    'waitforelement': 'waitForElement',
    'waitforvisible': 'waitForElement',
    
    // Assert/Verify
    'verify': 'assert',
    'validate': 'assert',
    
    // Execute JS
    'executejs': 'executeJs',
    'executescript': 'executeJs',
    'runjs': 'executeJs',
    'javascript': 'executeJs',
    'eval': 'executeJs',
  };
  
  return actionMap[normalized] || normalized;
}

/**
 * Normalize locator to handle XPath and other selector formats
 */
function normalizeLocator(locator: string | undefined): string | undefined {
  if (!locator) return locator;
  
  const trimmed = locator.trim();
  
  // If it looks like XPath but missing //, add it
  if (trimmed.match(/^[a-z]+\[/) && !trimmed.startsWith('//') && !trimmed.startsWith('/')) {
    // e.g., "button[@type='submit']" → "//button[@type='submit']"
    return '//' + trimmed;
  }
  
  return trimmed;
}

/**
 * Validate test step structure and parameters
 */
export function validateTestStep(step: TestStep, stepIndex: number): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate basic structure
  if (!step.id) {
    errors.push(`Step ${stepIndex}: Missing step.id`);
  }
  
  if (step.orderIndex === undefined) {
    errors.push(`Step ${stepIndex}: Missing step.orderIndex`);
  }
  
  if (!step.actionType) {
    errors.push(`Step ${stepIndex}: Missing step.actionType`);
  }
  
  if (!step.parameters || typeof step.parameters !== 'object') {
    errors.push(`Step ${stepIndex}: Missing or invalid step.parameters`);
    return { valid: false, errors }; // Early return if parameters is missing
  }

  // Validate action-specific parameters
  switch (step.actionType) {
    case 'navigate':
      if (!step.parameters.url) {
        errors.push(`Step ${stepIndex}: navigate action requires parameters.url`);
      }
      break;
      
    case 'click':
      if (!step.parameters.locator) {
        errors.push(`Step ${stepIndex}: click action requires parameters.locator`);
      }
      break;
      
    case 'type':
      if (!step.parameters.locator) {
        errors.push(`Step ${stepIndex}: type action requires parameters.locator`);
      }
      if (step.parameters.text === undefined && step.parameters.text !== '') {
        errors.push(`Step ${stepIndex}: type action requires parameters.text`);
      }
      break;
      
    case 'select':
      if (!step.parameters.locator) {
        errors.push(`Step ${stepIndex}: select action requires parameters.locator`);
      }
      if (!step.parameters.value) {
        errors.push(`Step ${stepIndex}: select action requires parameters.value`);
      }
      break;
      
    case 'check':
    case 'uncheck':
      if (!step.parameters.locator) {
        errors.push(`Step ${stepIndex}: ${step.actionType} action requires parameters.locator`);
      }
      break;
      
    case 'wait':
      if (!step.parameters.duration) {
        errors.push(`Step ${stepIndex}: wait action requires parameters.duration`);
      }
      break;
      
    case 'waitForElement':
      if (!step.parameters.locator) {
        errors.push(`Step ${stepIndex}: waitForElement action requires parameters.locator`);
      }
      break;
      
    case 'assert':
      if (!step.parameters.type) {
        errors.push(`Step ${stepIndex}: assert action requires parameters.type`);
      }
      if (!step.parameters.expected && step.parameters.type !== 'elementVisible' && step.parameters.type !== 'elementPresent') {
        errors.push(`Step ${stepIndex}: assert action requires parameters.expected for type ${step.parameters.type}`);
      }
      break;
      
    case 'executeJs':
      if (!step.parameters.script) {
        errors.push(`Step ${stepIndex}: executeJs action requires parameters.script`);
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate all test steps
 */
export function validateTestSteps(steps: TestStep[]): { valid: boolean; errors: string[] } {
  const allErrors: string[] = [];
  
  steps.forEach((step, index) => {
    const validation = validateTestStep(step, index);
    if (!validation.valid) {
      allErrors.push(...validation.errors);
    }
  });
  
  return {
    valid: allErrors.length === 0,
    errors: allErrors
  };
}

/**
 * Get human-readable step description
 */
export function getStepDescription(step: TestStep): string {
  const { actionType, parameters } = step;
  
  switch (actionType) {
    case 'navigate':
      return `Navigate to ${parameters.url}`;
    case 'click':
      return `Click on ${parameters.locator}`;
    case 'type':
      return `Type "${parameters.text}" into ${parameters.locator}`;
    case 'select':
      return `Select "${parameters.value}" in ${parameters.locator}`;
    case 'check':
      return `Check ${parameters.locator}`;
    case 'uncheck':
      return `Uncheck ${parameters.locator}`;
    case 'wait':
      return `Wait for ${parameters.duration}ms`;
    case 'waitForElement':
      return `Wait for element ${parameters.locator}`;
    case 'assert':
      return `Assert ${parameters.type}: ${parameters.expected || parameters.locator}`;
    case 'executeJs':
      return `Execute JavaScript`;
    default:
      return `Execute ${actionType}`;
  }
}
