import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNetwork } from '../context/NetworkStatusContext'
import { validateLogin, fieldErrorsFromApi } from '../utils/validators'
import PageHeader from '../components/PageHeader'
import FormField from '../components/FormField'
import ErrorAlert from '../components/ErrorAlert'

export default function Login() {
  const { login } = useAuth()
  const { isOnline } = useNetwork()
  const navigate = useNavigate()
  const from = useLocation().state?.from ?? '/'
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    const v = validateLogin(form)
    setErrors(v)
    setApiError(null)
    if (Object.keys(v).length) return
    setSubmitting(true)
    try {
      await login(form)
      navigate(from, { replace: true })
    } catch (err) {
      setApiError(err)
      if (err.status === 422) setErrors(fieldErrorsFromApi(err.details))
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader title="Log in" />
      <form className="stack" onSubmit={onSubmit} noValidate>
        <FormField id="email" type="email" label="Email" autoComplete="email" value={form.email} onChange={onChange} error={errors.email} />
        <FormField id="password" type="password" label="Password" autoComplete="current-password" value={form.password} onChange={onChange} error={errors.password} />
        <ErrorAlert error={apiError} />
        {!isOnline && <p className="muted">Login needs an internet connection.</p>}
        <button type="submit" className="btn" disabled={!isOnline || submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
        <p>No account? <Link to="/register">Create one</Link></p>
      </form>
    </>
  )
}