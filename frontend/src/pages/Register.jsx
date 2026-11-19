import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNetwork } from '../context/NetworkStatusContext'
import { validateRegister, fieldErrorsFromApi } from '../utils/validators'
import PageHeader from '../components/PageHeader'
import FormField from '../components/FormField'
import ErrorAlert from '../components/ErrorAlert'

export default function Register() {
  const { register } = useAuth()
  const { isOnline } = useNetwork()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    const v = validateRegister(form)
    setErrors(v)
    setApiError(null)
    if (Object.keys(v).length) return
    setSubmitting(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password })
      navigate('/', { replace: true })
    } catch (err) {
      setApiError(err)
      if (err.status === 422) setErrors(fieldErrorsFromApi(err.details))
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader title="Create account" />
      <form className="stack" onSubmit={onSubmit} noValidate>
        <FormField id="name" label="Full name" autoComplete="name" value={form.name} onChange={onChange} error={errors.name} />
        <FormField id="email" type="email" label="Email" autoComplete="email" value={form.email} onChange={onChange} error={errors.email} />
        <FormField id="password" type="password" label="Password" autoComplete="new-password" value={form.password} onChange={onChange} error={errors.password} />
        <FormField id="confirm" type="password" label="Confirm password" autoComplete="new-password" value={form.confirm} onChange={onChange} error={errors.confirm} />
        <ErrorAlert error={apiError} />
        {!isOnline && <p className="muted">Registration needs an internet connection.</p>}
        <button type="submit" className="btn" disabled={!isOnline || submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
        <p>Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </>
  )
}