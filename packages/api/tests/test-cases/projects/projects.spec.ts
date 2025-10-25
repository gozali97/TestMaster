import { test, expect } from '../../fixtures/base-test';
import { APIHelpers } from '../../helpers/api-helpers';

/**
 * Test Suite: Project Management
 * Similar to Katalon Test Cases for project operations
 */

test.describe('Project Management', () => {
  let apiHelpers: APIHelpers;
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    apiHelpers = new APIHelpers(request);
    // TODO: Login and get token when auth is implemented
    // authToken = await apiHelpers.login('test@testmaster.com', 'Test@123');
  });

  test('TC012 - Should create a new project', async ({ request }) => {
    const projectData = {
      name: `Test Project ${Date.now()}`,
      description: 'A test project for E2E testing',
    };

    const response = await request.post('/api/projects', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: projectData,
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('id');
    expect(body.data.name).toBe(projectData.name);
    expect(body.data.description).toBe(projectData.description);
  });

  test('TC013 - Should list all projects', async ({ request }) => {
    const response = await request.get('/api/projects', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('TC014 - Should get project by ID', async ({ request }) => {
    // Create a project first
    const createResponse = await request.post('/api/projects', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: `Test Project ${Date.now()}`,
        description: 'Test',
      },
    });

    const { id } = (await createResponse.json()).data;

    // Get the project
    const response = await request.get(`/api/projects/${id}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(id);
  });

  test('TC015 - Should update a project', async ({ request }) => {
    // Create a project first
    const createResponse = await request.post('/api/projects', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: `Test Project ${Date.now()}`,
        description: 'Original description',
      },
    });

    const { id } = (await createResponse.json()).data;

    // Update the project
    const updateData = {
      name: 'Updated Project Name',
      description: 'Updated description',
    };

    const response = await request.put(`/api/projects/${id}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: updateData,
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.name).toBe(updateData.name);
    expect(body.data.description).toBe(updateData.description);
  });

  test('TC016 - Should delete a project', async ({ request }) => {
    // Create a project first
    const createResponse = await request.post('/api/projects', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: `Test Project ${Date.now()}`,
        description: 'To be deleted',
      },
    });

    const { id } = (await createResponse.json()).data;

    // Delete the project
    const response = await request.delete(`/api/projects/${id}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    // Verify it's deleted
    const getResponse = await request.get(`/api/projects/${id}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    expect(getResponse.status()).toBe(404);
  });

  test('TC017 - Should fail to create project without authentication', async ({ request }) => {
    const response = await request.post('/api/projects', {
      data: {
        name: 'Test Project',
        description: 'Test',
      },
    });

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(401);
  });

  test('TC018 - Should search projects by name', async ({ request }) => {
    const searchTerm = `Unique${Date.now()}`;

    // Create a project with unique name
    await request.post('/api/projects', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: searchTerm,
        description: 'Searchable project',
      },
    });

    // Search for the project
    const response = await request.get(`/api/projects?search=${searchTerm}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0].name).toContain(searchTerm);
  });
});
