export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export function validateLogin({ email, password }) {
  const e = {}
  if (!isEmail(email)) e.email = 'Enter a valid email address.'
  if (!password) e.password = 'Password is required.'
  return e
}

export function validateRegister({ name, email, password, confirm }) {
  const e = {}
  if (name.trim().length < 2) e.name = 'Enter your full name.'
  if (!isEmail(email)) e.email = 'Enter a valid email address.'
  if (password.length < 8) e.password = 'Use at least 8 characters.'
  if (confirm !== password) e.confirm = 'Passwords do not match.'
  return e
}

export function validateShipping(f) {
  const e = {}
  if (f.fullName.trim().length < 2) e.fullName = 'Enter the recipient name.'
  if (!/^(\+63|0)9\d{9}$/.test(f.phone.replace(/[\s-]/g, ''))) e.phone = 'Use a PH mobile number, e.g. 09171234567.'
  if (f.address.trim().length < 5) e.address = 'Enter your street address.'
  if (!f.city.trim()) e.city = 'Enter your city.'
  if (!/^\d{4}$/.test(f.postalCode)) e.postalCode = 'Postal code must be 4 digits.'
  return e
}

// Turns backend 422 `details` into { field: message }  (ASSUMPTION: object or [{field,message}])
export function fieldErrorsFromApi(details) {
  if (!details) return {}
  if (Array.isArray(details)) {
    return Object.fromEntries(details.filter((d) => d.field).map((d) => [d.field, d.message]))
  }
  return typeof details === 'object' ? details : {}
}