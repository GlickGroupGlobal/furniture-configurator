import { useState } from 'react'
import { Link } from 'react-router-dom'
import './MarketingPage.css'
import './Contact.css'

const CONTACT_EMAIL = 'hello@example.com'

const INTEREST_OPTIONS = [
  'I want a design consult',
  'I used the configurator and want a firm quote',
  'I have measurements and photos to review',
  'General question',
]

function buildMailtoHref({ name, email, interest, details }) {
  const subject = `[Cabinet project] ${name || 'New inquiry'}`
  const bodyLines = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Interested in: ${interest}`,
    '',
    'Project details:',
    details,
  ]
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`
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
    <div className="m-page">
      <section className="m-hero">
        <div className="m-hero__inner">
          <div>
            <p className="m-eyebrow">Contact</p>
            <h1 className="m-title">Send the project details. We will help make it buildable.</h1>
            <p className="m-subtitle">
              Share measurements, room photos, cabinet type, material preferences, or a configurator
              design. We will respond with the next practical step.
            </p>
          </div>
          <div className="m-hero__aside">
            <div className="m-stat">
              <span className="m-stat__value">Best input</span>
              <span className="m-stat__label">Room measurements, photos, and must-have storage needs</span>
            </div>
            <div className="m-stat">
              <span className="m-stat__value">Next step</span>
              <span className="m-stat__label">Design review or firm quote path</span>
            </div>
          </div>
        </div>
      </section>

      <section className="m-section">
        <div className="m-split">
          <form className="con__form" onSubmit={handleSubmit}>
            <label className="con__field">
              <span>Name</span>
              <input type="text" required value={form.name} onChange={update('name')} placeholder="Jane Smith" />
            </label>

            <label className="con__field">
              <span>Email</span>
              <input type="email" required value={form.email} onChange={update('email')} placeholder="jane@example.com" />
            </label>

            <label className="con__field">
              <span>What are you interested in?</span>
              <select value={form.interest} onChange={update('interest')}>
                {INTEREST_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </label>

            <label className="con__field">
              <span>Project details</span>
              <textarea
                required
                rows={7}
                value={form.details}
                onChange={update('details')}
                placeholder="Room type, approximate dimensions, cabinet style, materials, timeline, and anything you already know."
              />
            </label>

            <button type="submit" className="btn btn--primary btn--lg con__submit">Send via email</button>

            {submitted && (
              <p className="con__submitted-note">
                Your email client should have opened with this filled in. If it did not, email us directly at {CONTACT_EMAIL}.
              </p>
            )}
          </form>

          <aside className="m-card">
            <h3>Want to explore before contacting us?</h3>
            <p>
              The configurator is still the fastest way to turn a vague idea into dimensions,
              cabinet types, materials, and a useful estimate.
            </p>
            <div style={{ marginTop: 18 }}>
              <Link to="/configurator" className="btn btn--ghost">Open configurator</Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
