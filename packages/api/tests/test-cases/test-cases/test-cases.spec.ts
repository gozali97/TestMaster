import { test, expect } from '../../fixtures/base-test';

/**
 * Test Suite: Test Case Management
 * Similar to Katalon's test case operations
 */

test.describe('Test Case Management', () => {
  let authToken: string;
  let projectId: number;

  test.beforeAll(async ({ request }) => {
    // TODO: Create project and get auth token
    // For now, skip these tests until auth is implemented
  });

  test('TC019 - Should create a new test case', async ({ request }) => {
    const testCaseData = {
      name: `Test Case ${Date.now()}`,
      description: 'E2E test case',
      type: 'WEB',
      steps: [
        {
          action: 'Navigate to URL',
          parameters: { url: 'https://example.com' },
        },
        {
          action: 'Click Element',
          parameters: { locator: '#login-button' },
        },
      ],
      tags: ['smoke', 'login'],
      priority: 'HIGH',
      status: 'ACTIVE',
    };

    const response = await request.post(`/api/projects/${projectId}/tests`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: testCaseData,
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.data.name).toBe(testCaseData.name);
    expect(body.data.type).toBe(testCaseData.type);
    expect(body.data.steps.length).toBe(2);
  });

  test('TC020 - Should list all test cases in a project', async ({ request }) => {
    const response = await request.get(`/api/projects/${projectId}/tests`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('TC021 - Should filter test cases by type', async ({ request }) => {
    const response = await request.get(`/api/projects/${projectId}/tests?type=WEB`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    body.data.forEach((testCase: any) => {
      expect(testCase.type).toBe('WEB');
    });
  });

  test('TC022 - Should filter test cases by tags', async ({ request }) => {
    const response = await request.get(`/api/projects/${projectId}/tests?tags=smoke`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    body.data.forEach((testCase: any) => {
      expect(testCase.tags).toContain('smoke');
    });
  });

  test('TC023 - Should update a test case', async ({ request }) => {
    // Create test case first
    const createResponse = await request.post(`/api/projects/${projectId}/tests`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: `Test Case ${Date.now()}`,
        type: 'WEB',
        steps: [],
      },
    });

    const { id } = (await createResponse.json()).data;

    // Update test case
    const updateData = {
      name: 'Updated Test Case Name',
      description: 'Updated description',
      steps: [
        {
          action: 'Click',
          parameters: { locator: '#button' },
        },
      ],
    };

    const response = await request.put(`/api/tests/${id}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: updateData,
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.data.name).toBe(updateData.name);
    expect(body.data.steps.length).toBe(1);
  });

  test('TC024 - Should duplicate a test case', async ({ request }) => {
    // Create test case first
    const createResponse = await request.post(`/api/projects/${projectId}/tests`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: `Original Test Case ${Date.now()}`,
        type: 'WEB',
        steps: [],
      },
    });

    const { id } = (await createResponse.json()).data;

    // Duplicate test case
    const response = await request.post(`/api/tests/${id}/duplicate`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.data.name).toContain('Copy');
  });

  test('TC025 - Should delete a test case', async ({ request }) => {
    // Create test case first
    const createResponse = await request.post(`/api/projects/${projectId}/tests`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: `Test Case ${Date.now()}`,
        type: 'WEB',
        steps: [],
      },
    });

    const { id } = (await createResponse.json()).data;

    // Delete test case
    const response = await request.delete(`/api/tests/${id}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();

    // Verify deletion
    const getResponse = await request.get(`/api/tests/${id}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    expect(getResponse.status()).toBe(404);
  });
});
