// Step transformer for local (in-Electron) Playwright execution.
// Ported from packages/api/src/utils/testStepTransformer.ts so the desktop
// app can execute tests without the backend API.

export interface EngineTestStep {
  id: string;
  orderIndex: number;
  actionType: string;
  parameters: Record<string, any>;
  expectedResult?: string;
  timeout?: number;
}

export function transformTestSteps(rawSteps: any[]): EngineTestStep[] {
  if (!rawSteps || !Array.isArray(rawSteps)) {
    throw new Error('Invalid steps: must be an array');
  }
  if (rawSteps.length === 0) {
    throw new Error('Test has no steps to execute');
  }

  return rawSteps.map((step, index) => {
    const actionType = step.actionType || step.action || step.command;
    if (!actionType) {
      throw new Error(`Step ${index} missing actionType/action/command`);
    }

    let parameters: Record<string, any> = {};
    if (step.parameters && typeof step.parameters === 'object') {
      parameters = step.parameters;
    } else {
      const rawLocator = step.locator || step.target || step.selector || step.element;
      parameters = {
        locator: normalizeLocator(rawLocator),
        text: step.text || step.value,
        url: step.url || (actionType === 'navigate' ? step.value : undefined),
        duration: step.duration || step.wait || (actionType === 'wait' ? step.value : undefined),
        script: step.script || step.javascript,
        expected: step.expected || step.expectedValue,
        type: step.assertType || step.verificationType,
        value: step.option || (actionType === 'select' ? step.value : undefined),
      };
      Object.keys(parameters).forEach((key) => {
        if (parameters[key] === undefined || parameters[key] === null) {
          delete parameters[key];
        }
      });
    }

    const normalizedActionType = normalizeActionType(actionType);

    if (normalizedActionType === 'type' && !parameters.text && step.value) {
      parameters.text = step.value;
    }

    if (normalizedActionType === 'wait') {
      if (parameters.duration) {
        parameters.duration =
          typeof parameters.duration === 'string'
            ? parseInt(parameters.duration, 10)
            : parameters.duration;
      } else if (step.value) {
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
  });
}

function normalizeActionType(actionType: string): string {
  const normalized = actionType.toLowerCase().trim();
  const actionMap: Record<string, string> = {
    goto: 'navigate', open: 'navigate', navigateto: 'navigate', openurl: 'navigate', visit: 'navigate',
    clickelement: 'click', clickon: 'click', press: 'click',
    typetext: 'type', input: 'type', fill: 'type', sendkeys: 'type', entertext: 'type', setvalue: 'type',
    selectoption: 'select', choose: 'select',
    checkelement: 'check', uncheckelement: 'uncheck', togglecheckbox: 'check',
    sleep: 'wait', pause: 'wait', delay: 'wait',
    waitfor: 'waitForElement', waitforelement: 'waitForElement', waitforvisible: 'waitForElement',
    verify: 'assert', validate: 'assert',
    executejs: 'executeJs', executescript: 'executeJs', runjs: 'executeJs', javascript: 'executeJs', eval: 'executeJs',
  };
  return actionMap[normalized] || normalized;
}

function normalizeLocator(locator: string | undefined): string | undefined {
  if (!locator) return locator;
  const trimmed = locator.trim();
  if (trimmed.match(/^[a-z]+\[/) && !trimmed.startsWith('//') && !trimmed.startsWith('/')) {
    return '//' + trimmed;
  }
  return trimmed;
}

export function getStepDescription(step: EngineTestStep): string {
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
      return 'Execute JavaScript';
    default:
      return `Execute ${actionType}`;
  }
}
