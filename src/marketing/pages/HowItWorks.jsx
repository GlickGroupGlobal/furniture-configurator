import { Link } from 'react-router-dom'
import './HowItWorks.css'

// ── data ─────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: '01',
    phase: 'Discovery & consult',
    duration: '~1–2 weeks',
    description:
      "Tell us what you're looking for — dimensions, materials, function, feel. If you already have a space in mind, share measurements. You can also use the configurator to sketch your piece and get a rough estimate before we ever talk.",
    detail:
      "This step is about us understanding what you want and you understanding what's realistic. We'll push back if something doesn't make sense, and suggest alternatives where we know from experience they work better.",
    cta: { label: 'Start in the configurator', to: '/configurator' },
  },
  {
    number: '02',
    phase: 'Design & firm quote',
    duration: '~1–2 weeks',
    description:
      "We translate your requirements into a production-ready spec and send it to the manufacturer for a firm price. You get a detailed quote showing exactly what you're paying for: materials, dimensions, finish, freight, and our fee.",
    detail:
      "No surprise line items later. The quote is the contract. If you want changes after this point, we can usually accommodate them before the deposit — after the deposit, changes may affect cost and timeline.",
    cta: null,
  },
  {
    number: '03',
    phase: 'Deposit & order placed',
    duration: 'One-time event',
    description:
      "You approve the quote and pay a deposit. That deposit is what locks your spot in the production queue with the manufacturer. Once it's paid, your order is real.",
    detail:
      "The deposit amount and payment schedule are confirmed at quote time. See the FAQ for current policy on deposit size and what happens if you need to cancel.",
    cta: { label: 'Read the payment FAQ', to: '/faq' },
  },
  {
    number: '04',
    phase: 'Production',
    duration: '~4 weeks',
    description:
      "Your piece is built to spec at the factory. This is the longest wait in the process, and the one we work hardest to make feel managed rather than silent.",
    detail:
      "We share photo and video updates from the factory during production — progress shots, material close-ups, assembly stages. You're not guessing whether it's happening. (This update-sharing feature is actively being built out; early orders will get updates via email.)",
    highlight: true,
    highlightLabel: 'Why this matters',
    highlightText:
      "The biggest anxiety in this kind of purchase isn't the price — it's the silence. Knowing your piece exists, is being built correctly, and looks right before it ships is what makes the wait feel acceptable rather than stressful.",
    cta: null,
  },
  {
    number: '05',
    phase: 'Quality control',
    duration: '~1 week',
    description:
      "Before anything goes on a container, we run a quality check. Photos and measurements of the finished piece are reviewed against the original spec.",
    detail:
      "If something is wrong at this stage, it gets fixed here — not after it lands on your doorstep. This is one of the structural reasons the timeline is what it is: fixing a problem in the factory is cheap; fixing it after freight is not.",
    cta: null,
  },
  {
    number: '06',
    phase: 'Freight & customs',
    duration: '~6–8 weeks',
    description:
      "Your piece ships via sea freight. This is the single longest leg of the timeline, and it's mostly out of everyone's hands once the container is loaded.",
    detail:
      "Sea freight is slower than air but dramatically cheaper for bulky items, which is why we use it. We track the shipment and keep you updated at key milestones (departed, arrived at port, cleared customs, out for delivery).",
    cta: null,
  },
  {
    number: '07',
    phase: 'Delivery & optional assembly',
    duration: 'Last mile',
    description:
      "Your order arrives. Pieces ship flat-packed or partially assembled depending on size and type. Self-assembly is straightforward and comes with clear instructions.",
    detail:
      "If you'd rather not assemble yourself, the optional assembly add-on sends a local professional to your home to put everything together and place it. Pricing for this is quoted separately from the furniture itself and depends on your location.",
    cta: null,
  },
]

// ── component ─────────────────────────────────────────────────────────────────

export default function HowItWorks() {
  return (
    <div className="hiw">

      <div className="hiw__header">
        <p className="hiw__eyebrow">The full picture</p>
        <h1 className="hiw__title">How it works</h1>
        <p className="hiw__subtitle">
          Seven steps, one point of contact. The timeline is long — that's honest, not a bug.
          Here's exactly what happens and when.
        </p>
        <div className="hiw__header-links">
          <Link to="/process" className="hiw__timeline-link">
            See the week-by-week timeline breakdown →
          </Link>
        </div>
      </div>

      <div className="hiw__steps">
        {STEPS.map((step, i) => (
          <div key={step.number} className="hiw__step">
            <div className="hiw__step-left">
              <div className="hiw__step-number">{step.number}</div>
              {i < STEPS.length - 1 && <div className="hiw__step-connector" />}
            </div>
            <div className="hiw__step-body">
              <div className="hiw__step-meta">
                <h2 className="hiw__step-phase">{step.phase}</h2>
                <span className="hiw__step-duration">{step.duration}</span>
              </div>
              <p className="hiw__step-desc">{step.description}</p>
              <p className="hiw__step-detail">{step.detail}</p>
              {step.highlight && (
                <div className="hiw__step-highlight">
                  <strong>{step.highlightLabel}:</strong> {step.highlightText}
                </div>
              )}
              {step.cta && (
                <Link to={step.cta.to} className="hiw__step-cta">
                  {step.cta.label} →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="hiw__footer-cta">
        <div className="hiw__footer-cta__inner">
          <h2>Ready to start?</h2>
          <p>The configurator is the fastest way to sketch a piece and see what it would cost.</p>
          <div className="hiw__footer-cta__actions">
            <Link to="/configurator" className="btn btn--primary btn--lg">Design your piece</Link>
            <Link to="/contact" className="btn btn--ghost btn--lg">Talk to us first</Link>
          </div>
        </div>
      </div>

    </div>
  )
}
