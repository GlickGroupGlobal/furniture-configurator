import { Link } from 'react-router-dom'
import './MarketingPage.css'

const FACTORS = [
  {
    title: 'Cabinet size',
    body: 'Width, height, and depth drive board area, freight volume, and installation complexity.',
  },
  {
    title: 'Board family',
    body: 'Particle board, FOSB board, and plywood each have separate door, body, and backboard rates.',
  },
  {
    title: 'Door fronts',
    body: 'Open carcasses price differently from door panels, drawers, glass fronts, and shaped door profiles.',
  },
  {
    title: 'Counters and lighting',
    body: 'Bars, countertops, internal lighting, and display niches add material and labor.',
  },
  {
    title: 'Freight',
    body: 'Large cabinet runs are bulky, so volume and packing requirements affect shipping.',
  },
  {
    title: 'Installation',
    body: 'Self-install is different from local installation support. We quote that separately when needed.',
  },
]

const BENEFITS = [
  'Real manufacturer pricing editable in the admin backend',
  'Live estimate before a customer submits a quote request',
  'Photo and video proof before finished pieces leave the factory',
  'Lower cost structure for customers who can plan around the timeline',
]

export default function Pricing() {
  return (
    <div className="m-page">
      <section className="m-hero">
        <div className="m-hero__inner">
          <div>
            <p className="m-eyebrow">Pricing</p>
            <h1 className="m-title">Transparent estimates first. Firm quotes when the design is real.</h1>
            <p className="m-subtitle">
              There is no useful flat price list for custom cabinets. The configurator gives an
              estimate from size, material, fronts, counters, and freight. Then we turn the design
              into a firm quote before production begins.
            </p>
          </div>
          <div className="m-hero__aside">
            <div className="m-stat">
              <span className="m-stat__value">$/m2</span>
              <span className="m-stat__label">Supplier board pricing is managed in the backend</span>
            </div>
            <div className="m-stat">
              <span className="m-stat__value">3 boards</span>
              <span className="m-stat__label">Particle board, FOSB board, and plywood</span>
            </div>
            <div className="m-stat">
              <span className="m-stat__value">Live estimate</span>
              <span className="m-stat__label">Customers can explore price before talking to sales</span>
            </div>
          </div>
        </div>
      </section>

      <section className="m-section">
        <div className="m-section__head">
          <p className="m-section__label">What affects cost</p>
          <h2 className="m-section__title">The price follows the cabinet, not a generic package.</h2>
        </div>
        <div className="m-grid">
          {FACTORS.map((factor) => (
            <article key={factor.title} className="m-card">
              <h3>{factor.title}</h3>
              <p>{factor.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="m-section m-section--tinted">
        <div className="m-section__inner m-split">
          <div>
            <p className="m-section__label">Why the model works</p>
            <h2 className="m-section__title">The benefit is lower cost with more visibility.</h2>
            <p className="m-section__copy">
              The old Benefits page is folded here because pricing and value are the same
              conversation. The savings only matter if the customer also trusts the process.
            </p>
          </div>
          <div className="m-card">
            <ul className="m-list">
              {BENEFITS.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="m-cta">
        <h2>Get a realistic starting number.</h2>
        <p>
          Build a cabinet run, choose materials and fronts, then request a firm quote when
          the estimate looks worth pursuing.
        </p>
        <div className="m-actions">
          <Link to="/configurator" className="btn btn--primary btn--lg">Open configurator</Link>
          <Link to="/process" className="btn btn--ghost btn--lg">See the process</Link>
        </div>
      </section>
    </div>
  )
}
