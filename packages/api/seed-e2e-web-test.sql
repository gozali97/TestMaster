-- End-to-end automation test for the TestMaster WEB app itself (localhost:3000).
-- Flow: login (ahmad@gmail.com) -> visit all real features -> logout.
-- Stored under ahmad's project "Recruitment" (project_id = 1, org 2, created_by 2).
--
-- Selector notes:
--   * Quote-free Playwright selectors are used on purpose. The engine's
--     normalizeLocator() turns `tag[attr]` into broken XPath, and quotes would
--     clash with SQL/JSON escaping. `nav >> text=Projects` style avoids both.
INSERT INTO test_cases (project_id, name, description, type, steps, tags, priority, status, created_by)
VALUES (
  1,
  'E2E Web App - Login to Logout Flow',
  'Automation end-to-end aplikasi web TestMaster di localhost:3000: login dengan ahmad@gmail.com, akses Dashboard, Projects, Executions, AI Assistant, lalu logout.',
  'WEB',
  CAST('[
    {"id":"1","action":"navigate","value":"http://localhost:3000/login","description":"Open the login page"},
    {"id":"2","action":"waitForElement","locator":"#email","description":"Wait for email field"},
    {"id":"3","action":"type","locator":"#email","value":"ahmad@gmail.com","description":"Fill email"},
    {"id":"4","action":"type","locator":"#password","value":"multi123A#","description":"Fill password"},
    {"id":"5","action":"click","locator":"button >> text=Sign In","description":"Click Sign In"},
    {"id":"6","action":"waitForElement","locator":"h1 >> text=Dashboard","description":"Dashboard loaded after login"},
    {"id":"7","action":"assert","assertType":"elementVisible","locator":"nav >> text=Projects","description":"Navigation is visible"},
    {"id":"8","action":"click","locator":"nav >> text=Projects","description":"Open Projects"},
    {"id":"9","action":"waitForElement","locator":"h1 >> text=Projects","description":"Projects page loaded"},
    {"id":"10","action":"assert","assertType":"elementVisible","locator":"button >> text=Create Project","description":"Create Project button visible"},
    {"id":"11","action":"click","locator":"nav >> text=Executions","description":"Open Executions"},
    {"id":"12","action":"waitForElement","locator":"h1 >> text=Test Executions","description":"Executions page loaded"},
    {"id":"13","action":"assert","assertType":"elementVisible","locator":"h1 >> text=Test Executions","description":"Executions heading visible"},
    {"id":"14","action":"click","locator":"nav >> text=AI Assistant","description":"Open AI Assistant"},
    {"id":"15","action":"waitForElement","locator":"h1 >> text=AI Assistant","description":"AI Assistant page loaded"},
    {"id":"16","action":"assert","assertType":"elementVisible","locator":"h1 >> text=AI Assistant","description":"AI Assistant heading visible"},
    {"id":"17","action":"click","locator":"nav >> text=Dashboard","description":"Back to Dashboard"},
    {"id":"18","action":"waitForElement","locator":"h1 >> text=Dashboard","description":"Dashboard loaded again"},
    {"id":"19","action":"click","locator":"nav >> text=Logout","description":"Click Logout"},
    {"id":"20","action":"waitForElement","locator":"#email","description":"Back to login page after logout"},
    {"id":"21","action":"assert","assertType":"elementVisible","locator":"button >> text=Sign In","description":"Login form visible again"}
  ]' AS JSON),
  CAST('["e2e","web","smoke","auth"]' AS JSON),
  'CRITICAL',
  'ACTIVE',
  2
);
