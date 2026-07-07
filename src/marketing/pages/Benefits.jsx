import { Link } from 'react-router-dom'
import './Benefits.css'

// ── data ─────────────────────────────────────────────────────────────────────

const COST_COMPARISONS = [
  {
    item: 'Custom hardwood cabinet (48" wide)',
    domestic: '$3,500 – $6,000',
    us: '[TODO: confirm real range once rate card is finalized]',
  },
  {
    item: 'Custom dining table (72" solid oak)',
    domestic: '$4,000 – $8,000',
    us: '[TODO: confirm real range once rate card is finalized]',
  },
  {
    item: 'Custom built-in shelving unit',
    domestic: '$2,500 – $5,000+',
    us: '[TODO: confirm real range once rate card is finalized]',
  },
]

const QUALITY_POINTS = [
  {
    heading: 'Real hardwoods, not composites',
    body: 'Solid oak, solid walnut, birch plywood — the same materials used by domestic custom makers. You choose the species and finish; we source to spec.',
  },
  {
    heading: 'Built to your exact dimensions',
    body: "Not \"close enough\" from a catalog. Every piece is made to the millimeter specs we confirm with you before anything goes into production.",
  },
  {
    heading: 'Inspected before it ships',
    body: "Every order is quality-checked at the factory before loading — dimensions, finish, joinery, and overall condition. If something's wrong, it gets fixed there, not after freight.",
  },
  {
    heading: 'Photo and video documentation',
    body: "You see your piece before it leaves the factory. Progress updates during production and final photos before shipment are part of the process, not an upsell.",
  },
]

const CONFIGURATOR_POINTS = [
  'Visualize your piece in 3D before committing to anything',
  'Adjust dimensions and see how the proportions change in real time',
  'Compare materials and get a live price estimate as you design',
  'No account, no quote request required — just explore',
  'When you\'re ready, your configuration becomes the starting point for the real quote',
]

const TRADEOFF_ROWS = [
  { dimension: 'Price', us: 'Significantly lower [TODO: exact range]', domestic: '$3,000–$10,000+ per piece' },
  { dimension: 'Lead time', us: '14–16 weeks', domestic: '8–20 weeks (varies widely)' },
  { dimension: 'Materials', us: 'Same hardwoods and plywoods', domestic: 'Same hardwoods and plywoods' },
  { dimension: 'Customization', us: 'Fully custom to your spec', domestic: 'Fully custom to your spec' },
  { dimension: 'Assembly', us: 'Self-assemble or add-on service', domestic: 'Usually delivered assembled' },
  { dimension: 'Returns', us: 'Not practical once shipped', domestic: 'Varies by maker' },
  { dimension: 'Progress visibility', us: 'Photo/video updates', domestic: 'Varies by maker' },
]

// ── component ─────────────────────────────────────────────────────────────────

export default function Benefits() {
  return (
    <div className="ben">

      {/* ── Header ── */}
      <div className="ben__header">
        <p className="ben__eyebrow">Why [Company Name]</p>
        <h1 className="ben__title">The case for doing this</h1>
        <p className="ben__subtitle">
          Custom furniture at a fraction of domestic pricing, quality-controlled before it ships,
          designed by you in a tool no other custom furniture seller offers.
          Here is what that actually means.
        </p>
      </div>

      {/* ── Cost ── */}
      <section className="ben__section">
        <div className="ben__section-inner">
          <div className="ben__section-label ben__section-label--cost">Cost savings</div>
          <h2 className="ben__section-heading">Significantly less than domestic custom</h2>
          <p className="ben__section-intro">
            US domestic custom furniture is expensive because domestic labor is expensive.
            The manufacturer we work with produces the same quality of hardwood furniture
            at a dramatically lower cost. That savings gets passed to you, minus our fee for
            managing the design, logistics, and quality control.
          </p>
          <p className="ben__section-intro">
            Exact pricing depends on the piece — use the configurator to get a real estimate
            for what you have in mind. The comparison ranges below are illustrative;
            final numbers will be confirmed once our rate card is finalized.
          </p>
          <div className="ben__cost-table-wrap">
            <table className="ben__cost-table">
              <thead>
                <tr>
                  <th>Piece</th>
                  <th>US domestic (est.)</th>
                  <th>[Company Name] (est.)</th>
                </tr>
              </thead>
              <tbody>
                {COST_COMPARISONS.map((row) => (
                  <tr key={row.item}>
                    <td>{row.item}</td>
                    <td>{row.domestic}</td>
                    <td className="ben__cost-us">{row.us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="ben__table-note">
            Domestic estimates based on published pricing from US custom furniture makers.
            [Company Name] estimates are placeholders — real pricing available in the configurator once rate card is confirmed.
          </p>
          <Link to="/configurator" className="ben__section-cta">Get a real estimate in the configurator →</Link>
        </div>
      </section>

      {/* ── Quality ── */}
      <section className="ben__section ben__section--alt">
        <div className="ben__section-inner">
          <div className="ben__section-label ben__section-label--quality">Quality</div>
          <h2 className="ben__section-heading">Not cheaper because it&apos;s lower quality</h2>
          <p className="ben__section-intro">
            The cost difference is labor and overhead, not materials or craft. The manufacturer
            we work with has produced real, high-quality hardwood furniture — the original
            personal order that started this business is proof of concept, and it sits in a real
            home today.
          </p>
          <div className="ben__quality-grid">
            {QUALITY_POINTS.map((point) => (
              <div key={point.heading} className="ben__quality-card">
                <h3>{point.heading}</h3>
                <p>{point.body}</p>
              </div>
            ))}
          </div>
          <Link to="/gallery" className="ben__section-cta">See photos of completed pieces →</Link>
        </div>
      </section>

      {/* ── Configurator ── */}
      <section className="ben__section">
        <div className="ben__section-inner">
          <div className="ben__section-label ben__section-label--config">The configurator</div>
          <h2 className="ben__section-heading">Design and price before you commit</h2>
          <p className="ben__section-intro">
            Most custom furniture sellers want you to fill out a contact form before you
            find out what anything costs. We built a 3D configurator so you can explore
            options and get a real price estimate before talking to anyone.
          </p>
          <ul className="ben__config-list">
            {CONFIGURATOR_POINTS.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <Link to="/configurator" className="btn btn--primary">Open the configurator</Link>
        </div>
      </section>

      {/* ── Honest tradeoff comparison table ── */}
      <section className="ben__section ben__section--alt">
        <div className="ben__section-inner">
          <div className="ben__section-label ben__section-label--tradeoff">The honest comparison</div>
          <h2 className="ben__section-heading">
            [Company Name] vs. domestic custom — side by side
          </h2>
          <p className="ben__section-intro">
            We are not better in every dimension, and we don&apos;t claim to be.
            This is what the actual comparison looks like.
          </p>
          <div className="ben__tradeoff-table-wrap">
            <table className="ben__tradeoff-table">
              <thead>
                <tr>
                  <th></th>
                  <th>[Company Name]</th>
                  <th>US domestic custom</th>
                </tr>
              </thead>
              <tbody>
                {TRADEOFF_ROWS.map((row) => (
                  <tr key={row.dimension}>
                    <td className="ben__tradeoff-dimension">{row.dimension}</td>
                    <td>{row.us}</td>
                    <td>{row.domestic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="ben__table-note">
            This is the right choice if price matters more than speed and you can plan 3–4 months ahead.
            If you need furniture faster, domestic is probably the right call — and we will tell you that.
          </p>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="ben__bottom-cta">
        <div className="ben__bottom-cta__inner">
          <h2>Convinced enough to explore?</h2>
          <p>The configurator is free, takes a few minutes, and gives you a real price — no contact form required.</p>
          <div className="ben__bottom-cta__actions">
            <Link to="/configurator" className="btn btn--primary btn--lg">Design your piece</Link>
            <Link to="/process" className="btn btn--ghost btn--lg">See the full timeline</Link>
          </div>
        </div>
      </section>

    </div>
  )
}
