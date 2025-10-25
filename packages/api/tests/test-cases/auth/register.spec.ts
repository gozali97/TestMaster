import { test, expect } from '../../fixtures/base-test';

/**
 * Test Suite: Authentication - User Registration
 * Similar to Katalon Test Cases organization
 */

test.describe('Authentication - Register', () => {
  test('TC007 - Should successfully register a new user', async ({ request }) => {
    // Generate unique email for each test run
    const timestamp = Date.now();
    const userData = {
      email: `test${timestamp}@testmaster.com`,
      password: 'Test@123456',
      name: 'Test User',
      organizationName: 'Test Organization',
    };

    const response = await request.post('/api/auth/register', {
      data: userData,
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body).toHaveProperty('success', true);
    expect(body.data.user).toHaveProperty('email', userData.email);
    expect(body.data.user).toHaveProperty('name', userData.name);
  });

  test('TC008 - Should fail registration with existing email', async ({ request }) => {
    const userData = {
      email: 'existing@testmaster.com',
      password: 'Test@123456',
      name: 'Test User',
      organizationName: 'Test Organization',
    };

    // First registration
    await request.post('/api/auth/register', {
      data: userData,
    });

    // Second registration with same email
    const response = await request.post('/api/auth/register', {
      data: userData,
    });

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(409); // Conflict
  });

  test('TC009 - Should fail registration with invalid email format', async ({ request }) => {
    const userData = {
      email: 'invalid-email',
      password: 'Test@123456',
      name: 'Test User',
      organizationName: 'Test Organization',
    };

    const response = await request.post('/api/auth/register', {
      data: userData,
    });

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toContain('email');
  });

  test('TC010 - Should fail registration with weak password', async ({ request }) => {
    const userData = {
      email: 'test@testmaster.com',
      password: '123', // Too short
      name: 'Test User',
      organizationName: 'Test Organization',
    };

    const response = await request.post('/api/auth/register', {
      data: userData,
    });

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toContain('password');
  });

  test('TC011 - Should fail registration with missing required fields', async ({ request }) => {
    const userData = {
      email: 'test@testmaster.com',
      // Missing password, name, organizationName
    };

    const response = await request.post('/api/auth/register', {
      data: userData,
    });

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(400);
  });
});
