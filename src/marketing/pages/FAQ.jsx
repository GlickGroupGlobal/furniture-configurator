import { Link } from 'react-router-dom'
import { FAQ_ITEMS } from '../data/faq'
import './MarketingPage.css'

export default function FAQ() {
  return (
    <div className="m-page">
      <section className="m-hero">
        <div className="m-hero__inner">
          <div>
            <p className="m-eyebrow">FAQ</p>
            <h1 className="m-title">Straight answers before anyone commits.</h1>
            <p className="m-subtitle">
              The big questions are timeline, pricing certainty, materials, installation, and what
              happens if something needs attention. Here is the short version.
            </p>
          </div>
          <div className="m-hero__aside">
            <div className="m-stat">
              <span className="m-stat__value">14-16 weeks</span>
              <span className="m-stat__label">Typical order window</span>
            </div>
            <div className="m-stat">
              <span className="m-stat__value">Estimate first</span>
              <span className="m-stat__label">Firm quote before production</span>
            </div>
            <div className="m-stat">
              <span className="m-stat__value">Proof updates</span>
              <span className="m-stat__label">Photos and videos during the process</span>
            </div>
          </div>
        </div>
      </section>

      <section className="m-section">
        <div className="m-grid">
          {FAQ_ITEMS.map((item) => (
            <article key={item.id} className="m-card">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="m-cta">
        <h2>Still need a specific answer?</h2>
        <p>
          Send the project details, measurements, or photos you already have and we will help
          decide whether the direct-sourced cabinet process is a fit.
        </p>
        <div className="m-actions">
          <Link to="/contact" className="btn btn--primary btn--lg">Contact us</Link>
          <Link to="/configurator" className="btn btn--ghost btn--lg">Try configurator</Link>
        </div>
      </section>
    </div>
  )
}
