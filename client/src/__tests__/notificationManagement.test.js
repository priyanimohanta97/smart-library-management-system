import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  deleteNotification,
  clearAllNotifications,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../services/notificationService.js';

import {
  setStoredAuth,
  clearStoredAuth,
} from '../services/authService.js';

// Helper to construct a valid 3-part test JWT with future expiration
function createTestJwt(payloadObj = {}) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const defaultPayload = {
    sub: 'test@vssut.ac.in',
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...payloadObj,
  };
  const payload = Buffer.from(JSON.stringify(defaultPayload)).toString('base64url');
  const signature = 'test_signature';
  return `${header}.${payload}.${signature}`;
}

describe('Notification Management & Deletion Suite', () => {
  beforeEach(() => {
    clearStoredAuth();
    // Reset global fetch mock
    globalThis.fetch = undefined;
  });

  describe('1. Individual Notification Deletion API Service', () => {
    it('calls DELETE /api/notifications/:id with valid Bearer auth headers', async () => {
      const validJwt = createTestJwt({ sub: 'student@vssut.ac.in' });
      setStoredAuth({
        token: validJwt,
        user: { id: 1, email: 'student@vssut.ac.in', role: 'USER' },
        expiresInMs: 3600000,
      });

      let requestedUrl = '';
      let requestedMethod = '';
      let requestedHeaders = {};

      globalThis.fetch = async (url, options) => {
        requestedUrl = url;
        requestedMethod = options.method;
        requestedHeaders = options.headers;
        return {
          ok: true,
          json: async () => ({ message: 'Notification deleted successfully', id: 42 }),
        };
      };

      const result = await deleteNotification(42);

      assert.equal(requestedUrl, '/api/notifications/42');
      assert.equal(requestedMethod, 'DELETE');
      assert.equal(requestedHeaders['Authorization'], `Bearer ${validJwt}`);
      assert.equal(result.id, 42);
    });

    it('returns null safely without network call if notificationId is null or undefined', async () => {
      let fetchCalled = false;
      globalThis.fetch = async () => {
        fetchCalled = true;
        return { ok: true };
      };

      const resNull = await deleteNotification(null);
      const resUndef = await deleteNotification(undefined);

      assert.equal(resNull, null);
      assert.equal(resUndef, null);
      assert.equal(fetchCalled, false);
    });

    it('throws formatted error if DELETE /api/notifications/:id returns non-200 status', async () => {
      const validJwt = createTestJwt();
      setStoredAuth({ token: validJwt, user: { id: 1 }, expiresInMs: 3600000 });

      globalThis.fetch = async () => ({
        ok: false,
        status: 403,
        json: async () => ({ message: 'Access denied: You cannot delete notifications belonging to another user.' }),
      });

      await assert.rejects(
        async () => {
          await deleteNotification(99);
        },
        {
          name: 'Error',
          message: 'Access denied: You cannot delete notifications belonging to another user.',
        }
      );
    });
  });

  describe('2. Clear All Notifications API Service', () => {
    it('calls DELETE /api/notifications with Bearer auth headers', async () => {
      const validJwt = createTestJwt({ sub: 'reader@library.edu' });
      setStoredAuth({
        token: validJwt,
        user: { id: 2, email: 'reader@library.edu', role: 'USER' },
        expiresInMs: 3600000,
      });

      let requestedUrl = '';
      let requestedMethod = '';
      let requestedHeaders = {};

      globalThis.fetch = async (url, options) => {
        requestedUrl = url;
        requestedMethod = options.method;
        requestedHeaders = options.headers;
        return {
          ok: true,
          json: async () => ({ message: 'All notifications cleared successfully', clearedCount: 5 }),
        };
      };

      const result = await clearAllNotifications();

      assert.equal(requestedUrl, '/api/notifications');
      assert.equal(requestedMethod, 'DELETE');
      assert.equal(requestedHeaders['Authorization'], `Bearer ${validJwt}`);
      assert.equal(result.clearedCount, 5);
    });

    it('handles network failure cleanly during clear-all', async () => {
      setStoredAuth({ token: 'test_token', user: { id: 1 }, expiresInMs: 3600000 });

      globalThis.fetch = async () => {
        throw new Error('Connection refused');
      };

      await assert.rejects(
        async () => {
          await clearAllNotifications();
        },
        {
          name: 'Error',
          message: 'Network error: unable to clear notifications.',
        }
      );
    });
  });

  describe('3. Notification State Management Logic', () => {
    it('deleting an unread notification decrements both list length and unread count', () => {
      const initialNotifications = [
        { id: 1, title: 'Loan Approved', isRead: false },
        { id: 2, title: 'Return Reminder', isRead: true },
        { id: 3, title: 'Due Notice', isRead: false },
      ];
      let unreadCount = 2;

      const targetId = 1;
      const target = initialNotifications.find((n) => n.id === targetId);
      const wasUnread = target && !target.isRead;

      const updatedList = initialNotifications.filter((n) => n.id !== targetId);
      if (wasUnread) {
        unreadCount = Math.max(0, unreadCount - 1);
      }

      assert.equal(updatedList.length, 2);
      assert.equal(unreadCount, 1);
      assert.equal(updatedList.some((n) => n.id === targetId), false);
    });

    it('deleting a read notification decrements list length without altering unread count', () => {
      const initialNotifications = [
        { id: 1, title: 'Loan Approved', isRead: false },
        { id: 2, title: 'Return Reminder', isRead: true },
      ];
      let unreadCount = 1;

      const targetId = 2;
      const target = initialNotifications.find((n) => n.id === targetId);
      const wasUnread = target && !target.isRead;

      const updatedList = initialNotifications.filter((n) => n.id !== targetId);
      if (wasUnread) {
        unreadCount = Math.max(0, unreadCount - 1);
      }

      assert.equal(updatedList.length, 1);
      assert.equal(unreadCount, 1);
      assert.equal(updatedList[0].id, 1);
    });

    it('clearing all notifications resets both list and unread count to empty zero state', () => {
      let notifications = [
        { id: 1, title: 'Loan Approved', isRead: false },
        { id: 2, title: 'Return Reminder', isRead: false },
      ];
      let unreadCount = 2;

      // Simulated clear all
      notifications = [];
      unreadCount = 0;

      assert.equal(notifications.length, 0);
      assert.equal(unreadCount, 0);
    });
  });
});
