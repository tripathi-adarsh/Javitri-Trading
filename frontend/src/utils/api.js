/**
 * Centralized API client for Javitri Trading Service backend.
 * All amounts come from the server — frontend never dictates prices.
 */

const BASE = import.meta.env.VITE_API_URL || '/api/v1'

async function request(path, options = {}) {
  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
    })
  } catch (networkErr) {
    // Server unreachable / CORS / network error
    throw { status: 0, message: 'Cannot reach server. Please check your connection or try again.' }
  }

  // Try to parse JSON — some responses (204, errors from proxies) may be empty
  let data = {}
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    try { data = await res.json() } catch { data = {} }
  } else if (res.status !== 204) {
    // Non-JSON body — read as text for debugging but don't crash
    const text = await res.text().catch(() => '')
    if (!res.ok) {
      throw { status: res.status, message: `Server error ${res.status}${text ? ': ' + text.slice(0, 120) : ''}` }
    }
    return {}
  }

  if (!res.ok) throw { status: res.status, ...(data || {}) }
  return data
}

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const api = {
  auth: {
    login:  (body)  => request('/auth/login',  { method: 'POST', body }),
    logout: (token) => request('/auth/logout', { method: 'POST', headers: authHeader(token) }),
    me:     (token) => request('/auth/me',     { headers: authHeader(token) }),
    refresh:()      => request('/auth/refresh',{ method: 'POST' }),
  },

  // ── Public routes ─────────────────────────────────────────────────────────
  public: {
    // Check if client already exists by mobile or email
    checkClient: (body) => request('/clients/check', { method: 'POST', body }),
    // Register a new client
    registerClient: (body)  => request('/clients', { method: 'POST', body }),
    // Upload KYC documents for a client (called after registration, no auth needed)
    uploadKycDocs: (clientId, formData) => {
      if (!clientId) {
        return Promise.reject({ message: 'clientId is missing — cannot upload documents' })
      }
      return fetch(`${BASE}/clients/${clientId}/kyc-documents`, {
        method: 'POST',
        body: formData,
        // NO Content-Type header — browser sets multipart/form-data boundary automatically
        // NO credentials — this is a public route, no auth cookie needed
      }).then(async res => {
        const contentType = res.headers.get('content-type') || ''
        const data = contentType.includes('application/json')
          ? await res.json().catch(() => ({}))
          : {}
        if (!res.ok) throw { status: res.status, message: data.message || `Upload failed (${res.status})`, ...data }
        return data
      })
    },
    // Get current legal document
    legal:          (type)  => request(`/legal/${type}`),
    // Get active plans
    plans:          ()      => request('/plans'),
    planBySlug:     (slug)  => request(`/plans/${slug}`),
  },

  // ── Legacy plan/order/payment routes (public client flow) ─────────────────
  plans: {
    list:      () => request('/plans'),
    getBySlug: (slug) => request(`/plans/${slug}`),
  },
  legal: {
    get: (type) => request(`/legal/${type}`),
  },
  orders: {
    preview:  (body, token) => request('/orders/preview', { method: 'POST', body, headers: authHeader(token) }),
    create:   (body, token) => request('/orders',         { method: 'POST', body, headers: authHeader(token) }),
    myOrders: (token)       => request('/orders',         { headers: authHeader(token) }),
  },
  payments: {
    verify: (body, token) => request('/payments/verify',      { method: 'POST', body, headers: authHeader(token) }),
    status: (orderId, token) => request(`/payments/status/${orderId}`, { headers: authHeader(token) }),
  },

  // ── Admin routes ──────────────────────────────────────────────────────────
  admin: {
    stats: (token) => request('/payment-reviews/stats', { headers: authHeader(token) }),

    employees: {
      list:       (token, qs = '') => request(`/employees?${qs}`,         { headers: authHeader(token) }),
      get:        (id, token)      => request(`/employees/${id}`,         { headers: authHeader(token) }),
      create:     (body, token)    => request('/employees',               { method: 'POST', body, headers: authHeader(token) }),
      update:     (id, body, token)=> request(`/employees/${id}`,         { method: 'PATCH', body, headers: authHeader(token) }),
      setStatus:  (id, isActive, token) => request(`/employees/${id}/status`, { method: 'PATCH', body: { isActive }, headers: authHeader(token) }),
    },

    clients: {
      list:          (token, qs = '') => request(`/clients?${qs}`,             { headers: authHeader(token) }),
      get:           (id, token)      => request(`/clients/${id}`,             { headers: authHeader(token) }),
      updateKyc:     (id, body, token)=> request(`/clients/${id}/kyc-status`,  { method: 'PATCH', body, headers: authHeader(token) }),
      assign:        (id, body, token)=> request(`/clients/${id}/assign`,      { method: 'PATCH', body, headers: authHeader(token) }),
      uploadDocuments: (id, formData, token) => {
        // FormData — do NOT set Content-Type (browser sets multipart boundary)
        return fetch(`${BASE}/clients/${id}/kyc-documents`, {
          method: 'POST',
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        }).then(async res => {
          const data = await res.json().catch(() => ({}))
          if (!res.ok) throw { status: res.status, ...(data || {}) }
          return data
        })
      },
      // Returns a URL to view an image (goes through authenticated API route)
      documentUrl: (id, docType, token) =>
        `${BASE}/clients/${id}/kyc-documents/${docType}?token=${encodeURIComponent(token || '')}`,
    },

    plans: {
      listAll: (token)            => request('/plans/admin',              { headers: authHeader(token) }),
      update:  (id, body, token)  => request(`/plans/${id}`,              { method: 'PUT', body, headers: authHeader(token) }),
    },

    orders: {
      list: (token, qs = '')      => request(`/orders/admin?${qs}`,       { headers: authHeader(token) }),
    },

    paymentReviews: {
      list:   (token, qs = '')    => request(`/payment-reviews?${qs}`,             { headers: authHeader(token) }),
      get:    (id, token)         => request(`/payment-reviews/${id}`,             { headers: authHeader(token) }),
      decide: (id, body, token)   => request(`/payment-reviews/${id}/decision`,    { method: 'POST', body, headers: authHeader(token) }),
      stats:  (token)             => request('/payment-reviews/stats',             { headers: authHeader(token) }),
    },

    auditLogs: {
      list: (token, qs = '')      => request(`/audit-logs?${qs}`,         { headers: authHeader(token) }),
    },

    planRequests: {
      create:       (body)              => request('/plan-requests', { method: 'POST', body }),
      list:         (token, qs = '')    => request(`/plan-requests?${qs}`, { headers: authHeader(token) }),
      get:          (id, token)         => request(`/plan-requests/${id}`,  { headers: authHeader(token) }),
      markPayment:  (id, body, token)   => request(`/plan-requests/${id}/payment`, { method: 'PATCH', body, headers: authHeader(token) }),
      assign:       (id, body, token)   => request(`/plan-requests/${id}/assign`,  { method: 'PATCH', body, headers: authHeader(token) }),
      addPayout:    (id, body, token)   => request(`/plan-requests/${id}/daily-payouts`, { method: 'POST', body, headers: authHeader(token) }),
      getPayouts:   (id, token)         => request(`/plan-requests/${id}/daily-payouts`, { headers: authHeader(token) }),
      payoutReport: (token, qs = '')    => request(`/plan-requests/reports/payouts?${qs}`, { headers: authHeader(token) }),
    },

    legal: {
      list:    (token)             => request('/legal',              { headers: authHeader(token) }),
      create:  (body, token)       => request('/legal',              { method: 'POST', body, headers: authHeader(token) }),
      publish: (id, token)         => request(`/legal/${id}/publish`,{ method: 'PATCH', headers: authHeader(token) }),
    },
  },
}
