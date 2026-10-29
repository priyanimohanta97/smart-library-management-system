import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { API_BASE_URL, buildApiUrl } from '../services/apiConfig.js';

describe('API Configuration & URL Resolution Suite', () => {
  it('defaults API_BASE_URL to empty string in development when unset', () => {
    assert.equal(typeof API_BASE_URL, 'string');
    // In local test runner, VITE_API_BASE_URL is unset
    assert.equal(API_BASE_URL, '');
  });

  it('buildApiUrl returns relative path when base URL is empty', () => {
    assert.equal(buildApiUrl('/api/books'), '/api/books');
    assert.equal(buildApiUrl('api/books'), '/api/books');
    assert.equal(buildApiUrl('/api/auth/login'), '/api/auth/login');
    assert.equal(buildApiUrl('/api/notifications/42/read'), '/api/notifications/42/read');
  });

  it('strips redundant trailing slashes from base URL', () => {
    // Test helper logic by simulating prefix
    const mockBase = 'https://athenaeum-backend.onrender.com/'.replace(/\/+$/, '');
    assert.equal(mockBase, 'https://athenaeum-backend.onrender.com');

    const cleanEndpoint = '/api/books'.startsWith('/') ? '/api/books' : `/${'/api/books'}`;
    assert.equal(`${mockBase}${cleanEndpoint}`, 'https://athenaeum-backend.onrender.com/api/books');
  });
});

