import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { login, register } from '../services/authService.js';
import {
  isNetworkConnectivityError,
  evaluateCirculationConnectivity,
  resolveLibrarianConnectivityState,
} from '../utils/connectivityUtils.js';
import { CATEGORIES } from '../data/books.js';
import { computeCategoryBookCounts } from '../utils/bookDisplayUtils.js';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('Connectivity & Catalogue Integrity Runtime Suite', () => {
  describe('Authentication Network vs HTTP Error Classification', () => {
    it('marks genuine login fetch network failures as connectivity errors', async () => {
      globalThis.fetch = async () => {
        throw new TypeError('Failed to fetch');
      };

      await assert.rejects(
        () => login({ email: 'student@vssut.ac.in', password: 'secret' }),
        (err) => {
          assert.equal(isNetworkConnectivityError(err), true);
          assert.equal(err.status, undefined);
          return true;
        }
      );
    });

    it('does not treat HTTP 401/403/400 login responses as backend offline errors', async () => {
      for (const status of [401, 403, 400]) {
        globalThis.fetch = async () => ({
          ok: false,
          status,
          json: async () => ({ message: `Auth error ${status}` }),
        });

        await assert.rejects(
          () => login({ email: 'student@vssut.ac.in', password: 'wrong' }),
          (err) => {
            assert.equal(isNetworkConnectivityError(err), false);
            assert.equal(err.status, status);
            return true;
          }
        );
      }
    });

    it('marks genuine registration fetch failures as connectivity errors while keeping 409/400 online', async () => {
      globalThis.fetch = async () => {
        throw new TypeError('NetworkError when attempting to fetch resource.');
      };

      await assert.rejects(
        () => register({ fullName: 'Student User', email: 'new@vssut.ac.in', password: 'password123' }),
        (err) => {
          assert.equal(isNetworkConnectivityError(err), true);
          return true;
        }
      );

      for (const status of [409, 400]) {
        globalThis.fetch = async () => ({
          ok: false,
          status,
          json: async () => ({ message: `Registration error ${status}` }),
        });

        await assert.rejects(
          () => register({ fullName: 'Student User', email: 'dup@vssut.ac.in', password: 'password123' }),
          (err) => {
            assert.equal(isNetworkConnectivityError(err), false);
            assert.equal(err.status, status);
            return true;
          }
        );
      }
    });
  });

  describe('LibrarianDashboard Multi-Endpoint Circulation Evaluation', () => {
    it('evaluates Promise.allSettled results accurately for online, degraded, and offline states', () => {
      assert.equal(
        evaluateCirculationConnectivity([
          { status: 'fulfilled' },
          { status: 'fulfilled' },
          { status: 'fulfilled' },
          { status: 'fulfilled' },
        ]),
        'online'
      );

      assert.equal(
        evaluateCirculationConnectivity([
          { status: 'fulfilled' },
          { status: 'rejected' },
          { status: 'rejected' },
          { status: 'rejected' },
        ]),
        'degraded',
        'Single succeeding endpoint out of four must report degraded, not online'
      );

      assert.equal(
        evaluateCirculationConnectivity([
          { status: 'fulfilled' },
          { status: 'fulfilled' },
          { status: 'fulfilled' },
          { status: 'rejected' },
        ]),
        'degraded'
      );

      assert.equal(
        evaluateCirculationConnectivity([
          { status: 'rejected' },
          { status: 'rejected' },
          { status: 'rejected' },
          { status: 'rejected' },
        ]),
        'offline'
      );

      assert.equal(evaluateCirculationConnectivity([]), 'offline');
    });

    it('resolves connecting, online, degraded, and offline display states reliably', () => {
      assert.equal(
        resolveLibrarianConnectivityState({
          isCheckingBackend: true,
          isLoadingCirculation: false,
          isBackendOnline: false,
          circulationStatus: 'offline',
        }),
        'connecting'
      );

      assert.equal(
        resolveLibrarianConnectivityState({
          isCheckingBackend: false,
          isLoadingCirculation: true,
          isBackendOnline: true,
          circulationStatus: 'online',
        }),
        'connecting'
      );

      assert.equal(
        resolveLibrarianConnectivityState({
          isCheckingBackend: false,
          isLoadingCirculation: false,
          isBackendOnline: true,
          circulationStatus: 'online',
        }),
        'online'
      );

      assert.equal(
        resolveLibrarianConnectivityState({
          isCheckingBackend: false,
          isLoadingCirculation: false,
          isBackendOnline: true,
          circulationStatus: 'degraded',
        }),
        'degraded'
      );

      assert.equal(
        resolveLibrarianConnectivityState({
          isCheckingBackend: false,
          isLoadingCirculation: false,
          isBackendOnline: false,
          circulationStatus: 'online',
        }),
        'degraded'
      );

      assert.equal(
        resolveLibrarianConnectivityState({
          isCheckingBackend: false,
          isLoadingCirculation: false,
          isBackendOnline: true,
          circulationStatus: 'offline',
        }),
        'offline'
      );
    });
  });

  describe('Category Definitions & Dynamic Count Consistency', () => {
    it('aligns computed category counts with exported CATEGORIES ids while excluding archived books', () => {
      const sampleCatalogue = [
        { id: '1', category: 'ai-computing', archived: false },
        { id: '2', category: 'ai-computing', archived: true },
        { id: '3', category: 'philosophy', archived: false },
        { id: '4', category: 'economics-society' },
      ];

      const counts = computeCategoryBookCounts(sampleCatalogue);
      const categoryIds = CATEGORIES.map((c) => c.id);

      assert.ok(categoryIds.includes('ai-computing'));
      assert.ok(categoryIds.includes('philosophy'));
      assert.ok(categoryIds.includes('economics-society'));
      assert.equal(counts['ai-computing'], 1);
      assert.equal(counts['philosophy'], 1);
      assert.equal(counts['economics-society'], 1);
    });
  });
});

