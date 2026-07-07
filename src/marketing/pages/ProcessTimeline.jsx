import { Link } from 'react-router-dom'
import './MarketingPage.css'

const PHASES = [
  {
    step: '01',
    title: 'Design and measurement',
    duration: '1-2 weeks',
    body: 'Start in the configurator or send us your room measurements, inspiration, and cabinet goals. We turn the idea into a buildable spec.',
  },
  {
    step: '02',
    title: 'Firm quote and deposit',
    duration: '1 week',
    body: 'You receive an itemized quote with dimensions, materials, finish, freight, and installation assumptions before the order is placed.',
  },
  {
    step: '03',
    title: 'Factory production',
    duration: '4-6 weeks',
    body: 'The cabinets are built to spec. We collect factory photos and videos as proof of progress, especially on custom details and finishes.',
  },
  {
    step: '04',
    title: 'Trial assembly and QC',
    duration: '1 week',
    body: 'Pieces are checked before packing. For larger built-ins, sections may be trial assembled at the factory to confirm fit and lighting.',
  },
  {
    step: '05',
    title: 'Freight and delivery',
    duration: '6-8 weeks',
    body: 'Sea freight keeps bulky cabinetry affordable. We track the shipment and coordinate final delivery once it clears customs.',
  },
  {
    step: '06',
    title: 'Install support',
    duration: 'Final step',
    body: 'You can self-install from instructions or add installation support where available. Finished photos and videos close the loop.',
  },
]

const COMPARISON = [
  ['Speed', 'Plan on roughly 14-16 weeks from deposit to delivery.', 'Domestic custom can be similar or faster depending on the maker.'],
  ['Price', 'Lower manufacturing cost and sea freight make custom cabinetry more accessible.', 'Domestic labor and overhead often drive much higher quotes.'],
  ['Visibility', 'Factory photos, trial assembly images, and installation media are part of the process.', 'Progress visibility varies widely by shop.'],
  ['Best fit', 'Projects where savings matter and the timeline can be planned.', 'Projects where local speed and in-person shop access matter most.'],
]

export default function ProcessTimeline() {
  return (
    <div className="m-page">
      <section className="m-hero">
        <div className="m-hero__inner">
          <div>
            <p className="m-eyebrow">Process</p>
            <h1 className="m-title">A managed cabinet order from first sketch to final install.</h1>
            <p className="m-subtitle">
              The old How It Works and Timeline pages are now one simple process:
              design, quote, production, factory QC, freight, and installation support.
            </p>
          </div>
          <div className="m-hero__aside">
            <div className="m-stat">
              <span className="m-stat__value">14-16 weeks</span>
              <span className="m-stat__label">Typical deposit-to-delivery planning window</span>
            </div>
            <div className="m-stat">
              <span className="m-stat__value">6 steps</span>
              <span className="m-stat__label">One accountable flow, not scattered pages</span>
            </div>
            <div className="m-stat">
              <span className="m-stat__value">Photo + video</span>
              <span className="m-stat__label">Factory and installation evidence during the process</span>
            </div>
          </div>
        </div>
      </section>

      <section className="m-section">
        <div className="m-section__head">
          <p className="m-section__label">Step by step</p>
          <h2 className="m-section__title">What happens after you start.</h2>
          <p className="m-section__copy">
            The process is intentionally plain. You should always know what we are waiting on,
            what has been confirmed, and what happens next.
          </p>
        </div>
        <div className="m-grid">
          {PHASES.map((phase) => (
            <article key={phase.step} className="m-card">
              <span className="m-card__kicker">{phase.step} / {phase.duration}</span>
              <h3>{phase.title}</h3>
              <p>{phase.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="m-section m-section--tinted">
        <div className="m-section__inner">
          <div className="m-section__head">
            <p className="m-section__label">The honest tradeoff</p>
            <h2 className="m-section__title">This is best when price matters more than speed.</h2>
            <p className="m-section__copy">
              The savings come from direct manufacturing and managed logistics. The tradeoff is
              planning ahead and accepting sea-freight timing.
            </p>
          </div>
          <table className="m-table">
            <thead>
              <tr>
                <th>Factor</th>
                <th>Our direct-sourced process</th>
                <th>Domestic custom shop</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map(([factor, ours, domestic]) => (
                <tr key={factor}>
                  <td>{factor}</td>
                  <td>{ours}</td>
                  <td>{domestic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="m-cta">
        <h2>Start with a layout, not a sales call.</h2>
        <p>
          Use the configurator to sketch dimensions and cabinet types, then send it in
          when you are ready for a firm quote.
        </p>
        <div className="m-actions">
          <Link to="/configurator" className="btn btn--primary btn--lg">Open configurator</Link>
          <Link to="/contact" className="btn btn--ghost btn--lg">Talk to us first</Link>
        </div>
      </section>
    </div>
  )
}
