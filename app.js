/**
 * ShopWave - Shared API Client & Utilities
 * All pages share this file for consistent API calls, auth, and UI helpers
 */

const API_BASE = 'http://localhost:5000/api';

// ─── Auth Helpers ─────────────────────────────────────────────────────────────
const Auth = {
  getToken: () => localStorage.getItem('sw_token'),
  getUser: () => JSON.parse(localStorage.getItem('sw_user') || 'null'),
  isLoggedIn: () => !!localStorage.getItem('sw_token'),
  save: (token, user) => {
    localStorage.setItem('sw_token', token);
    localStorage.setItem('sw_user', JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem('sw_token');
    localStorage.removeItem('sw_user');
  },
};

// ─── API Request Wrapper ──────────────────────────────────────────────────────
async function apiRequest(endpoint, options = {}) {
  const token = Auth.getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return { ok: false, status: 0, data: { message: 'Network error. Is the backend running?' } };
  }
}

// ─── Toast Notifications ──────────────────────────────────────────────────────
function showToast(message, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const container = document.getElementById('toast-container') || (() => {
    const c = document.createElement('div');
    c.id = 'toast-container';
    c.className = 'toast-container';
    document.body.appendChild(c);
    return c;
  })();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

// ─── Cart Count in Navbar ─────────────────────────────────────────────────────
async function updateCartCount() {
  const badge = document.getElementById('cart-count');
  if (!badge || !Auth.isLoggedIn()) return;

  const { ok, data } = await apiRequest('/cart');
  if (ok && data.cart) {
    const total = data.cart.reduce((sum, i) => sum + i.quantity, 0);
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
  }
}

// ─── Render Navbar State ──────────────────────────────────────────────────────
function renderNavbar() {
  const userZone = document.getElementById('nav-user-zone');
  if (!userZone) return;

  if (Auth.isLoggedIn()) {
    const user = Auth.getUser();
    userZone.innerHTML = `
      <div class="user-badge">👤 <span>${user.name.split(' ')[0]}</span></div>
      <button class="btn-logout" onclick="logout()">Sign Out</button>
    `;
  } else {
    userZone.innerHTML = `<a href="login.html" class="btn-nav-login">Sign In</a>`;
  }
}

function logout() {
  Auth.clear();
  showToast('Signed out successfully.', 'info');
  setTimeout(() => window.location.href = 'login.html', 800);
}

// ─── Active Nav Link ──────────────────────────────────────────────────────────
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

// ─── Generate Star Rating HTML ────────────────────────────────────────────────
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

// ─── Format Price ─────────────────────────────────────────────────────────────
function formatPrice(price) {
  return `$${Number(price).toFixed(2)}`;
}

// ─── Add to Cart ──────────────────────────────────────────────────────────────
async function addToCart(productId, quantity = 1, btnEl = null) {
  if (!Auth.isLoggedIn()) {
    showToast('Please sign in to add items to cart.', 'error');
    setTimeout(() => window.location.href = 'login.html', 1200);
    return;
  }

  if (btnEl) { btnEl.disabled = true; btnEl.textContent = 'Adding…'; }

  const { ok, data } = await apiRequest('/cart/add', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });

  if (ok) {
    showToast(data.message, 'success');
    updateCartCount();
  } else {
    showToast(data.message || 'Failed to add item.', 'error');
  }

  if (btnEl) { btnEl.disabled = false; btnEl.textContent = '🛒 Add to Cart'; }
}

// ─── Init on every page ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  setActiveNav();
  updateCartCount();
});
