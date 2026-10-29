/**
 * Athenaeum Library Management System
 * Persistent In-App Notifications Service
 * 
 * Interacts with the backend notification APIs (/api/notifications).
 */

import { getAuthHeaders } from './authService.js';

/**
 * Retrieves notifications for the authenticated user.
 * 
 * @returns {Promise<Array<Object>>}
 */
export async function getNotifications() {
  let response;
  try {
    response = await fetch('/api/notifications', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    throw new Error('Network error: unable to load notifications.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to fetch notifications (HTTP ${response.status}).`);
  }

  return response.json();
}

/**
 * Retrieves the count of unread notifications for the active user badge.
 * 
 * @returns {Promise<number>}
 */
export async function getUnreadCount() {
  let response;
  try {
    response = await fetch('/api/notifications/unread-count', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    return 0;
  }

  if (!response.ok) {
    return 0;
  }

  const data = await response.json().catch(() => ({ unreadCount: 0 }));
  return data.unreadCount || 0;
}

/**
 * Marks a specific notification as read.
 * 
 * @param {number|string} notificationId
 * @returns {Promise<Object>}
 */
export async function markAsRead(notificationId) {
  if (!notificationId) return null;

  let response;
  try {
    response = await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    throw new Error('Network error: unable to mark notification as read.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to update notification (HTTP ${response.status}).`);
  }

  return response.json();
}

/**
 * Marks all notifications as read for the authenticated user.
 * 
 * @returns {Promise<{markedCount: number}>}
 */
export async function markAllAsRead() {
  let response;
  try {
    response = await fetch('/api/notifications/mark-all-read', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    throw new Error('Network error: unable to mark all notifications as read.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to mark notifications (HTTP ${response.status}).`);
  }

  return response.json();
}

/**
 * Deletes a specific notification by ID.
 * 
 * @param {number|string} notificationId
 * @returns {Promise<Object>}
 */
export async function deleteNotification(notificationId) {
  if (!notificationId) return null;

  let response;
  try {
    response = await fetch(`/api/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    throw new Error('Network error: unable to delete notification.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to delete notification (HTTP ${response.status}).`);
  }

  return response.json();
}

/**
 * Clears all circulation notifications for the authenticated user.
 * 
 * @returns {Promise<{message: string, clearedCount: number}>}
 */
export async function clearAllNotifications() {
  let response;
  try {
    response = await fetch('/api/notifications', {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    throw new Error('Network error: unable to clear notifications.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to clear notifications (HTTP ${response.status}).`);
  }

  return response.json();
}

