// Simple API helper for authentication-related requests
// Uses the Fetch API and sends cookies (credentials) with every request

const API_BASE_URL = 'http://localhost:5000';

async function request(path, options = {}) {
  const response = await fetch(API_BASE_URL + path, {
    credentials: 'include', // important so browser sends/receives cookies
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = {};
  try {
    data = await response.json();
  } catch (e) {
    // If response has no JSON body, keep data as empty object
  }

  if (!response.ok) {
    // Throw a simple Error so components can show a toast or inline message
    const message = data.message || 'Something went wrong';
    throw new Error(message);
  }

  return data;
}

// Register a new user with the backend
export function registerUser(payload) {
  // payload: { name, email, password, confirmPassword }
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Log in a user with email and password
export function loginUser(payload) {
  // payload: { email, password }
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Ask backend who the current logged-in user is (based on cookies)
export function getCurrentUser() {
  return request('/api/user/me', {
    method: 'GET',
  });
}

// Log out on the backend (clears cookies)
export function logoutUser() {
  return request('/api/auth/logout', {
    method: 'POST',
  });
}

// Request a password reset link to be sent to the given email
export function requestPasswordReset(email) {
  return request('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

// Reset password using a token from the reset link
export function resetPassword({ token, password, confirmPassword }) {
  return request('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password, confirmPassword }),
  });
}

// Update profile details (name, avatar, bio) for the current user
export function updateProfile(payload) {
  return request('/api/user/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function adminLogin(payload) {
  return request('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
