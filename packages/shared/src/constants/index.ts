export const DEFAULT_TIMEOUT = 30000;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const ACTION_TYPES = {
  NAVIGATE: 'navigate',
  CLICK: 'click',
  TYPE: 'type',
  SELECT: 'select',
  CHECK: 'check',
  UNCHECK: 'uncheck',
  UPLOAD: 'upload',
  WAIT: 'wait',
  ASSERT: 'assert',
  EXECUTE_JS: 'executeJs',
} as const;

export const ASSERTION_TYPES = {
  TEXT_EQUALS: 'textEquals',
  TEXT_CONTAINS: 'textContains',
  ELEMENT_VISIBLE: 'elementVisible',
  ELEMENT_PRESENT: 'elementPresent',
  ELEMENT_ENABLED: 'elementEnabled',
  URL_EQUALS: 'urlEquals',
  TITLE_CONTAINS: 'titleContains',
} as const;
