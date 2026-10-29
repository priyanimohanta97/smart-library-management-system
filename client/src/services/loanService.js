/**
 * Athenaeum Library Management System
 * Book Loan and Circulation Service
 * 
 * Interacts with the backend loan APIs (/api/loans).
 * Handles student loan requests, returns, and librarian approvals.
 */

import { getAuthHeaders } from './authService';

/**
 * Submits a new loan request for a book.
 * 
 * @param {Object} params
 * @param {number|string} params.bookId
 * @param {string} [params.notes]
 * @returns {Promise<Object>}
 */
export async function requestLoan({ bookId, notes }) {
  if (!bookId) {
    throw new Error('A valid book ID is required to request a loan.');
  }

  let response;
  try {
    response = await fetch('/api/loans/request', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ bookId, notes: notes || '' }),
    });
  } catch (err) {
    throw new Error('Network error: unable to reach the library borrowing server.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Your session has expired. Please sign in again.');
    }
    if (response.status === 409) {
      throw new Error(data?.message || 'You already have an active loan or pending request for this title.');
    }
    if (response.status === 400) {
      throw new Error(data?.message || 'Loan request cannot be processed at this time.');
    }
    throw new Error(data?.message || `Failed to submit loan request (HTTP ${response.status}).`);
  }

  return data;
}

/**
 * Retrieves all loan records belonging to the currently authenticated student.
 * 
 * @returns {Promise<Array<Object>>}
 */
export async function getMyLoans() {
  let response;
  try {
    response = await fetch('/api/loans/my-loans', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    throw new Error('Network error: unable to load student loans.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to retrieve your loans (HTTP ${response.status}).`);
  }

  return response.json();
}

/**
 * Initiates a return request for an active book loan.
 * 
 * @param {number|string} loanId
 * @returns {Promise<Object>}
 */
export async function requestReturn(loanId) {
  if (!loanId) {
    throw new Error('Loan ID is required to initiate a return request.');
  }

  let response;
  try {
    response = await fetch(`/api/loans/${loanId}/return-request`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    throw new Error('Network error: unable to reach the return desk service.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `Failed to initiate return (HTTP ${response.status}).`);
  }

  return data;
}

/**
 * LIBRARIAN: Retrieves all loans currently in PENDING state awaiting review.
 * 
 * @returns {Promise<Array<Object>>}
 */
export async function getPendingLoans() {
  let response;
  try {
    response = await fetch('/api/loans/pending', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    throw new Error('Network error: unable to fetch pending loan queue.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to fetch pending loans (HTTP ${response.status}).`);
  }

  return response.json();
}

/**
 * LIBRARIAN: Approves a pending loan request and decrements physical inventory.
 * 
 * @param {number|string} loanId
 * @returns {Promise<Object>}
 */
export async function approveLoan(loanId) {
  let response;
  try {
    response = await fetch(`/api/loans/${loanId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    throw new Error('Network error: unable to reach the circulation approval service.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `Failed to approve loan (HTTP ${response.status}).`);
  }

  return data;
}

/**
 * LIBRARIAN: Rejects a pending loan request with a documented reason.
 * 
 * @param {number|string} loanId
 * @param {string} reason
 * @returns {Promise<Object>}
 */
export async function rejectLoan(loanId, reason) {
  if (!reason || !reason.trim()) {
    throw new Error('A reason is required to reject a loan request.');
  }

  let response;
  try {
    response = await fetch(`/api/loans/${loanId}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason: reason.trim() }),
    });
  } catch (err) {
    throw new Error('Network error: unable to reject loan request.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `Failed to reject loan (HTTP ${response.status}).`);
  }

  return data;
}

/**
 * LIBRARIAN: Retrieves loans in RETURN_PENDING state waiting for physical confirmation.
 * 
 * @returns {Promise<Array<Object>>}
 */
export async function getPendingReturns() {
  let response;
  try {
    response = await fetch('/api/loans/return-requests', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    throw new Error('Network error: unable to fetch return requests queue.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to fetch return requests (HTTP ${response.status}).`);
  }

  return response.json();
}

/**
 * LIBRARIAN: Confirms physical return of a book and restores inventory.
 * 
 * @param {number|string} loanId
 * @returns {Promise<Object>}
 */
export async function confirmReturn(loanId) {
  let response;
  try {
    response = await fetch(`/api/loans/${loanId}/confirm-return`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    throw new Error('Network error: unable to reach the return desk.');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `Failed to confirm return (HTTP ${response.status}).`);
  }

  return data;
}

/**
 * LIBRARIAN: Retrieves all active (ISSUED / RETURN_PENDING) loans.
 * 
 * @returns {Promise<Array<Object>>}
 */
export async function getActiveLoans() {
  let response;
  try {
    response = await fetch('/api/loans/active', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    throw new Error('Network error: unable to fetch active circulation loans.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to fetch active loans (HTTP ${response.status}).`);
  }

  return response.json();
}

/**
 * LIBRARIAN: Retrieves authoritative circulation metrics from the database.
 * 
 * @returns {Promise<Object>}
 */
export async function getCirculationStats() {
  let response;
  try {
    response = await fetch('/api/loans/stats', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    throw new Error('Network error: unable to fetch circulation statistics.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to fetch circulation statistics (HTTP ${response.status}).`);
  }

  return response.json();
}

