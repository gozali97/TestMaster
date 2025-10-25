import { test, expect } from '../../fixtures/base-test';
import { APIHelpers } from '../../helpers/api-helpers';

/**
 * Test Suite: Authentication - Login
 * Similar to Katalon Test Cases organization
 */

test.describe('Authentication - Login', () => {
  let apiHelpers: APIHelpers;

  test.beforeEach(async ({ request }) => {
    apiHelpers = new APIHelpers(request);
  });

  test('TC001 - Should successfully login with valid credentials', async ({ request }) => {
    // Test Data
    const credentials = {
      email: 'test@testmaster.com',
      password: 'Test@123',
    };

    // Test Steps
    const response = await request.post('/api/auth/login', {
      data: credentials,
    });

    // Verifications
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('success', true);
    expect(body.data).toHaveProperty('token');
    expect(body.data).toHaveProperty('user');
    expect(body.data.user).toHaveProperty('email', credentials.email);
  });

  test('TC002 - Should fail login with invalid email', async ({ request }) => {
    const credentials = {
      email: 'invalid@email.com',
      password: 'Test@123',
    };

    const response = await request.post('/api/auth/login', {
      data: credentials,
    });

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body).toHaveProperty('success', false);
    expect(body).toHaveProperty('error');
  });

  test('TC003 - Should fail login with invalid password', async ({ request }) => {
    const credentials = {
      email: 'test@testmaster.com',
      password: 'WrongPassword',
    };

    const response = await request.post('/api/auth/login', {
      data: credentials,
    });

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(401);
  });

  test('TC004 - Should fail login with missing email', async ({ request }) => {
    const credentials = {
      password: 'Test@123',
    };

    const response = await request.post('/api/auth/login', {
      data: credentials,
    });

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body).toHaveProperty('error');
  });

  test('TC005 - Should fail login with missing password', async ({ request }) => {
    const credentials = {
      email: 'test@testmaster.com',
    };

    const response = await request.post('/api/auth/login', {
      data: credentials,
    });

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(400);
  });

  test('TC006 - Should fail login with empty credentials', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {},
    });

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(400);
  });
});
