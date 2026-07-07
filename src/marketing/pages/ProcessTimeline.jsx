import { Link } from 'react-router-dom'
import './ProcessTimeline.css'

// ── data ─────────────────────────────────────────────────────────────────────

const PHASES = [
  {
    id: 'design',
    label: 'Design & measurement',
    weeks: '~4 weeks',
    weekRange: [1, 4],
    color: '#6366f1',
    steps: [
      'Initial consult — you tell us what you want, we ask the right questions',
      'Measurement review and spec confirmation',
      'Manufacturer spec sheet drafted',
      'Firm quote issued and approved',
      'Deposit paid, order placed',
    ],
    note: "This phase can move faster if you come in with clear measurements and a strong sense of what you want. The configurator is a good way to speed this up.",
  },
  {
    id: 'production',
    label: 'Production',
    weeks: '~4 weeks',
    weekRange: [5, 8],
    color: '#0ea5e9',
    steps: [
      'Raw materials sourced and prepared',
      'Joinery, shaping, and assembly',
      'Finishing (stain, paint, lacquer)',
      'Photo and video updates shared throughout',
      'Final quality control inspection',
    ],
    note: "Production time can vary slightly with the manufacturer's queue. We'll give you a realistic estimate at order time, not a best-case number.",
  },
  {
    id: 'freight',
    label: 'Sea freight & customs',
    weeks: '~6–8 weeks',
    weekRange: [9, 16],
    color: '#f59e0b',
    steps: [
      'Container loading and departure',
      'Trans-Pacific sea freight (~3–4 weeks at sea)',
      'Arrival at US port',
      'Customs clearance (~1–2 weeks)',
      'Domestic freight to your door',
    ],
    note: "Freight timing is the least predictable leg — port congestion and customs can add time. We build buffer into the 6–8 week estimate, but plan for the top of that range.",
  },
]

const TOTAL_WEEKS = { min: 14, max: 16 }

const DOMESTIC_COMPARISON = {
  label: 'US domestic custom furniture',
  note: "Most US custom furniture makers quote 8–16 weeks — sometimes comparable to our timeline, sometimes faster. The difference is price, not necessarily speed. We don't claim to be faster; we claim to be significantly cheaper for the same quality tier.",
}

// ── component ─────────────────────────────────────────────────────────────────

export default function ProcessTimeline() {
  return (
    <div className="pt">

      <div className="pt__header">
        <p className="pt__eyebrow">Honest numbers</p>
        <h1 className="pt__title">Process &amp; timeline</h1>
        <p className="pt__subtitle">
          The total timeline is {TOTAL_WEEKS.min}–{TOTAL_WEEKS.max} weeks from deposit to delivery.
          Here is exactly where that time goes.
        </p>
      </div>

      {/* Visual bar */}
      <div className="pt__bar-section">
        <div className="pt__bar-inner">
          <div className="pt__bar">
            {PHASES.map((phase) => {
              const width = ((phase.weekRange[1] - phase.weekRange[0] + 1) / TOTAL_WEEKS.max) * 100
              return (
                <div
                  key={phase.id}
                  className="pt__bar-segment"
                  style={{ width: `${width}%`, background: phase.color }}
                >
                  <span className="pt__bar-label">{phase.weeks}</span>
                </div>
              )
            })}
          </div>
          <div className="pt__bar-legend">
            {PHASES.map((phase) => (
              <div key={phase.id} className="pt__bar-legend-item">
                <span className="pt__bar-legend-dot" style={{ background: phase.color }} />
                {phase.label}
              </div>
            ))}
          </div>
          <div className="pt__bar-total">
            Total: approximately {TOTAL_WEEKS.min}–{TOTAL_WEEKS.max} weeks from deposit to your door
          </div>
        </div>
      </div>

      {/* Phase detail cards */}
      <div className="pt__phases">
        {PHASES.map((phase, i) => (
          <div key={phase.id} className="pt__phase">
            <div className="pt__phase-header">
              <div className="pt__phase-badge" style={{ background: phase.color }}>
                Phase {i + 1}
              </div>
              <h2 className="pt__phase-title">{phase.label}</h2>
              <span className="pt__phase-duration">{phase.weeks}</span>
            </div>
            <div className="pt__phase-body">
              <ul className="pt__phase-steps">
                {phase.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
              <p className="pt__phase-note">{phase.note}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison with domestic */}
      <div className="pt__comparison">
        <div className="pt__comparison__inner">
          <h2 className="pt__comparison__heading">How this compares to US domestic</h2>
          <div className="pt__comparison__grid">
            <div className="pt__comparison__card pt__comparison__card--us">
              <h3>{DOMESTIC_COMPARISON.label}</h3>
              <p>{DOMESTIC_COMPARISON.note}</p>
            </div>
            <div className="pt__comparison__card pt__comparison__card--us">
              <h3>[Company Name]</h3>
              <p>
                {TOTAL_WEEKS.min}–{TOTAL_WEEKS.max} weeks. Significantly lower cost for equivalent
                quality. The right fit if you can plan ahead and you care more about what you get
                than how fast you get it.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ nudge */}
      <div className="pt__faq-nudge">
        <div className="pt__faq-nudge__inner">
          <p>
            Questions about what happens if something goes wrong, or how the payment schedule works?
          </p>
          <Link to="/faq" className="pt__faq-nudge__link">Read the FAQ →</Link>
          <span className="pt__faq-nudge__sep"> · </span>
          <Link to="/how-it-works" className="pt__faq-nudge__link">See the full step-by-step →</Link>
        </div>
      </div>

    </div>
  )
}
