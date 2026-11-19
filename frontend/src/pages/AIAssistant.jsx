import { useState } from 'react'
import { Link } from 'react-router-dom'
import { aiApi } from '../api/endpoints'
import { useNetwork } from '../context/NetworkStatusContext'
import PageHeader from '../components/PageHeader'
import FormField from '../components/FormField'
import ProductCard from '../components/ProductCard'
import ErrorAlert from '../components/ErrorAlert'

const MAX_CHARS = 200

export default function AIAssistant() {
  const { isOnline } = useNetwork()
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const text = prompt.trim()
    if (!text || loading) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const { data } = await aiApi.recommend(text)
      setResult(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const unavailable = error?.status === 503 || error?.code === 'AI_UNAVAILABLE'

  return (
    <>
      <PageHeader title="AI Assistant" />
      <form className="stack" onSubmit={handleSubmit} noValidate>
        <FormField
          as="textarea"
          id="prompt"
          label="What are you looking for?"
          rows={3}
          maxLength={MAX_CHARS}
          placeholder="e.g. a gift under ₱1,500 for a gamer"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <p className="muted">{prompt.length}/{MAX_CHARS}</p>
        <button type="submit" className="btn" disabled={!isOnline || loading || !prompt.trim()}>
          {!isOnline ? 'Offline: AI unavailable' : loading ? 'Thinking…' : 'Get recommendations'}
        </button>
      </form>

      {unavailable ? (
        <div className="alert" role="alert">
          <p>The AI assistant is unavailable right now.</p>
          <Link to={`/products?search=${encodeURIComponent(prompt.trim())}`}>Search the catalog instead</Link>
        </div>
      ) : (
        <ErrorAlert error={error} />
      )}

      {result && (
        <section className="stack" aria-label="AI recommendations">
          <span className="tag">AI-Assisted</span>
          {/* Plain text only: React escapes it, never use dangerouslySetInnerHTML */}
          {result.summary && <p>{result.summary}</p>}
          <div className="grid">
            {/* Cards use verified DB records from the API, never prices/stock from AI text */}
            {(result.products ?? []).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </>
  )
}