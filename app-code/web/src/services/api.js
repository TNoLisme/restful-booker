const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const adminCredentials = {
  username: 'admin',
  password: 'password123',
}

async function parseResponse(response) {
  const text = await response.text()
  let data = null

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text }
    }
  }

  if (!response.ok) {
    const message = data?.reason || data?.message || `Request failed with ${response.status}`
    throw new Error(`${message} (${response.status})`)
  }

  return data
}

function authHeader(credentials = adminCredentials) {
  const encoded = btoa(`${credentials.username}:${credentials.password}`)
  return { Authorization: `Basic ${encoded}` }
}

export async function login(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  const data = await parseResponse(response)
  if (!data?.token) {
    throw new Error(data?.reason || 'Authentication failed')
  }

  return data
}

export async function pingServer() {
  const response = await fetch(`${API_BASE_URL}/ping`, { method: 'GET' })
  if (!response.ok && response.status !== 201) {
    throw new Error(`Server returned ${response.status}`)
  }

  return true
}

export async function getBookingIds(filters = {}) {
  const params = new URLSearchParams()

  if (filters.firstname) params.set('firstname', filters.firstname)
  if (filters.lastname) params.set('lastname', filters.lastname)
  if (filters.checkin) params.set('checkin', filters.checkin)
  if (filters.checkout) params.set('checkout', filters.checkout)

  const query = params.toString()
  const response = await fetch(`${API_BASE_URL}/booking${query ? `?${query}` : ''}`)
  return parseResponse(response)
}

export async function getBooking(id) {
  const response = await fetch(`${API_BASE_URL}/booking/${id}`, {
    headers: { Accept: 'application/json' },
  })

  return parseResponse(response)
}

export async function createBooking(payload) {
  const response = await fetch(`${API_BASE_URL}/booking`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return parseResponse(response)
}

export async function updateBooking(id, payload, credentials = adminCredentials) {
  const response = await fetch(`${API_BASE_URL}/booking/${id}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...authHeader(credentials),
    },
    body: JSON.stringify(payload),
  })

  return parseResponse(response)
}

export async function patchBooking(id, payload, credentials = adminCredentials) {
  const response = await fetch(`${API_BASE_URL}/booking/${id}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...authHeader(credentials),
    },
    body: JSON.stringify(payload),
  })

  return parseResponse(response)
}

export async function deleteBooking(id, credentials = adminCredentials) {
  const response = await fetch(`${API_BASE_URL}/booking/${id}`, {
    method: 'DELETE',
    headers: authHeader(credentials),
  })

  if (!response.ok && response.status !== 201) {
    throw new Error(`Delete failed with ${response.status}`)
  }

  return true
}
