import { Link } from 'react-router-dom'
import './Pricing.css'

const PRICE_FACTORS = [
  { factor: 'Dimensions', detail: 'Larger pieces use more material and cost more — the configurator prices this live as you resize.' },
  { factor: 'Material', detail: 'Solid oak, solid walnut, painted birch plywood, and painted MDF each have a different cost rate.' },
  { factor: 'Piece type', detail: 'Cabinets, tables, sofas, bars, and shelving have different base complexity and labor.' },
  { factor: 'Freight', detail: 'Volume affects shipping cost — bigger or more pieces cost more to freight, factored into your estimate.' },
]

export default function Pricing() {
  return (
    <div className="pri">

      <div className="pri__header">
        <p className="pri__eyebrow">Pricing</p>
        <h1 className="pri__title">Custom pricing, for a custom piece</h1>
        <p className="pri__subtitle">
          There's no fixed price list because there's no fixed piece — every order is sized,
          materialed, and built to your spec. The fastest way to find out what your piece would
          cost is to build it in the configurator.
        </p>
      </div>

      <section className="pri__configurator-cta">
        <div className="pri__configurator-cta__inner">
          <div className="pri__configurator-cta__text">
            <h2>What the configurator does</h2>
            <p>
              Set your room dimensions, drag in furniture pieces (cabinets, tables, sofas, bars,
              shelving), resize and position them, choose a material for each, and see a running
              price estimate update live as you go. No account, no commitment — just a real number
              based on what you actually want.
            </p>
            <p className="pri__configurator-cta__note">
              The estimate you get is a placeholder pricing model for now (see the FAQ for what
              that means) — it will be replaced with real manufacturer rate-card pricing before
              launch, but the mechanics of designing and pricing your piece work the same either way.
            </p>
          </div>
          <Link to="/configurator" className="btn btn--primary btn--lg pri__configurator-cta__button">
            Open the configurator
          </Link>
        </div>
      </section>

      <section className="pri__factors">
        <h2 className="pri__factors-heading">What affects your price</h2>
        <div className="pri__factors-grid">
          {PRICE_FACTORS.map((f) => (
            <div key={f.factor} className="pri__factor-card">
              <h3>{f.factor}</h3>
              <p>{f.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pri__next">
        <div className="pri__next__inner">
          <h2>After you get an estimate</h2>
          <p>
            A configurator estimate isn't a final quote — it's a starting point. When you're ready,
            we turn your configuration into a firm, itemized quote and walk you through the deposit
            and ordering process.
          </p>
          <div className="pri__next__actions">
            <Link to="/how-it-works" className="btn btn--ghost">See how the full process works</Link>
            <Link to="/contact" className="btn btn--ghost">Talk to us first</Link>
          </div>
        </div>
      </section>

    </div>
  )
}
