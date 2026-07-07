import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Contact.css'

// Swappable integration point: this currently builds a mailto: link client-side.
// Replace `buildMailtoHref` (or the form's onSubmit) with a real form backend
// (Formspree, a serverless function, etc.) when one is chosen — no other
// markup needs to change.
const CONTACT_EMAIL = 'hello@example.com' // [TODO: confirm real contact address]

const INTEREST_OPTIONS = [
  'Design consult — I want to talk before deciding anything',
  'I used the configurator and want a real quote',
  'General question',
  'Something else',
]

function buildMailtoHref({ name, email, interest, details }) {
  const subject = `[Company Name] consult request — ${name || 'New inquiry'}`
  const bodyLines = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Interested in: ${interest}`,
    '',
    'Details:',
    details,
  ]
  const body = encodeURIComponent(bodyLines.join('\n'))
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', interest: INTEREST_OPTIONS[0], details: '' })
  const [submitted, setSubmitted] = useState(false)

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    window.location.href = buildMailtoHref(form)
    setSubmitted(true)
  }

  return (
    <div className="con">

      <div className="con__header">
        <p className="con__eyebrow">Get in touch</p>
        <h1 className="con__title">Talk to us before you commit</h1>
        <p className="con__subtitle">
          Not ready for the configurator, or want a real person to walk through your project first?
          Send us the details below and we'll follow up by email.
        </p>
      </div>

      <div className="con__body">
        <form className="con__form" onSubmit={handleSubmit}>
          <label className="con__field">
            <span>Name</span>
            <input
              type="text"
              required
              value={form.name}
              onChange={update('name')}
              placeholder="Jane Smith"
            />
          </label>

          <label className="con__field">
            <span>Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={update('email')}
              placeholder="jane@example.com"
            />
          </label>

          <label className="con__field">
            <span>What are you interested in?</span>
            <select value={form.interest} onChange={update('interest')}>
              {INTEREST_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>

          <label className="con__field">
            <span>Tell us more</span>
            <textarea
              required
              rows={6}
              value={form.details}
              onChange={update('details')}
              placeholder="What are you furnishing, roughly what size, any materials in mind..."
            />
          </label>

          <button type="submit" className="btn btn--primary btn--lg con__submit">
            Send via email
          </button>

          {submitted && (
            <p className="con__submitted-note">
              Your email client should have opened with this filled in — just hit send.
              If it didn't open, email us directly at {CONTACT_EMAIL}.
            </p>
          )}
        </form>

        <div className="con__alt">
          <h2>Prefer to just explore first?</h2>
          <p>No form required — design and price your piece directly in the configurator.</p>
          <Link to="/configurator" className="btn btn--ghost">Open the configurator</Link>
        </div>
      </div>

    </div>
  )
}
