import { Link } from 'react-router-dom'
import './Home.css'

const INSTALLATION_MEDIA = {
  hero: '/installations/office-01.jpg',
  kitchen: '/installations/kitchen-02.png',
  wardrobe: '/installations/wardrobe-01.jpg',
  factory: '/installations/factory-trial-01.jpg',
  video: '/installations/video-wardrobe.mp4',
}

// ── data ─────────────────────────────────────────────────────────────────────
// Edit these arrays to update content without touching component code.

const PROCESS_STEPS = [
  {
    number: '01',
    title: 'Design & consult',
    description: 'Use the configurator to sketch your piece, or just tell us what you have in mind. We handle the translation to manufacturer specs.',
  },
  {
    number: '02',
    title: 'Quote & deposit',
    description: 'You get a firm price. A deposit locks your order and kicks off production. No surprises after.',
  },
  {
    number: '03',
    title: 'Production with updates',
    description: "Your piece is built to spec. We send photo and video updates throughout so you're never in the dark during the wait.",
  },
  {
    number: '04',
    title: 'Delivery (+ optional assembly)',
    description: "Freight to your door, roughly 14–16 weeks from order. Add professional assembly if you'd rather not do it yourself.",
  },
]

const TRUST_POINTS = [
  {
    icon: '✦',
    heading: 'Fraction of domestic pricing',
    body: 'Custom furniture from US makers runs $3,000–$10,000+ per piece. We source the same quality direct from the manufacturer.',
  },
  {
    icon: '✦',
    heading: 'Quality-controlled before it ships',
    body: 'Every order is inspected before leaving the factory. You see photos and video of the finished piece before it goes on a boat.',
  },
  {
    icon: '✦',
    heading: 'Design it yourself first',
    body: 'Our configurator lets you size, arrange, and price your pieces before committing to anything — no quote request required to explore.',
  },
]

// ── component ─────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="home">

      {/* ── Hero ── */}
      <section className="home-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(33,28,22,0.82), rgba(33,28,22,0.52) 48%, rgba(33,28,22,0.18)), url(${INSTALLATION_MEDIA.hero})` }}>
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">Custom furniture, sourced direct</p>
          <h1 className="home-hero__headline">
            Beautiful custom furniture.<br />
            A fraction of the price.<br />
            <span className="home-hero__headline-catch">The catch is the wait.</span>
          </h1>
          <p className="home-hero__subhead">
            We source custom-built furniture directly from a vetted manufacturer —
            real hardwoods, made to your exact dimensions, at a small fraction of
            US domestic pricing. The tradeoff is an honest 3–4 month lead time.
            We say that upfront, not in the fine print.
          </p>
          <div className="home-hero__actions">
            <Link to="/configurator" className="btn btn--primary btn--lg">
              Design your piece
            </Link>
            <Link to="/contact" className="btn btn--ghost btn--lg">
              Talk to us first
            </Link>
          </div>
        </div>
        <div className="home-hero__image">
          <div className="home-hero__image-placeholder">
            {/* Replace with <img src={heroPhoto} alt="…" /> when available */}
            <span className="home-hero__image-label">
              [Hero photo of completed piece]
            </span>
          </div>
        </div>
      </section>

      {/* ── The deal, plainly stated ── */}
      <section className="home-proof">
        <div className="home-proof__intro">
          <p className="home-proof__eyebrow">Real production evidence</p>
          <h2 className="home-proof__heading">Installed cabinets and factory trial assembly, not renderings.</h2>
        </div>
        <div className="home-proof__grid">
          <figure className="home-proof__item home-proof__item--wide">
            <img src={INSTALLATION_MEDIA.kitchen} alt="Installed light wood kitchen cabinetry" loading="lazy" />
            <figcaption>Installed kitchen cabinetry</figcaption>
          </figure>
          <figure className="home-proof__item">
            <img src={INSTALLATION_MEDIA.wardrobe} alt="Installed two-tone wardrobe and display cabinetry" loading="lazy" />
            <figcaption>Wardrobe and display wall</figcaption>
          </figure>
          <figure className="home-proof__item">
            <img src={INSTALLATION_MEDIA.factory} alt="Cabinet sections trial assembled in factory before shipping" loading="lazy" />
            <figcaption>Factory trial assembly</figcaption>
          </figure>
          <figure className="home-proof__item home-proof__item--video">
            <video src={INSTALLATION_MEDIA.video} controls preload="metadata" playsInline />
            <figcaption>Installation walkthrough video</figcaption>
          </figure>
        </div>
      </section>

      <section className="home-tradeoff">
        <div className="home-tradeoff__inner">
          <h2 className="home-tradeoff__heading">Here's exactly what you're getting into</h2>
          <div className="home-tradeoff__columns">
            <div className="home-tradeoff__col home-tradeoff__col--get">
              <h3>What you get</h3>
              <ul>
                <li>Custom dimensions — built to your exact measurements, not a catalog size</li>
                <li>Real hardwood and quality materials (solid oak, walnut, painted birch plywood, and more)</li>
                <li>Pricing well below equivalent US custom work</li>
                <li>A single point of contact who manages the entire process for you</li>
                <li>Photo and video updates during production so you're never guessing</li>
              </ul>
            </div>
            <div className="home-tradeoff__col home-tradeoff__col--give">
              <h3>What you give up</h3>
              <ul>
                <li>Speed — this is a ~14–16 week process, not a few weeks</li>
                <li>The ability to see or touch the piece before it's built</li>
                <li>Local returns — once it ships, logistics matter</li>
                <li>Same-day support — we're responsive, but this is a managed process, not a retail transaction</li>
              </ul>
            </div>
          </div>
          <p className="home-tradeoff__cta-nudge">
            The people who are happiest with this trade are furnishing a space they plan to live in for years.
            If you need it fast, this isn't the right fit — and we'll tell you that.
          </p>
        </div>
      </section>

      {/* ── Process (condensed) ── */}
      <section className="home-process">
        <div className="home-process__inner">
          <h2 className="home-process__heading">How it works</h2>
          <p className="home-process__subhead">
            Four steps, clearly managed. <Link to="/how-it-works" className="home-process__detail-link">See the full process →</Link>
          </p>
          <div className="home-process__steps">
            {PROCESS_STEPS.map((step) => (
              <div key={step.number} className="home-process__step">
                <span className="home-process__step-number">{step.number}</span>
                <h3 className="home-process__step-title">{step.title}</h3>
                <p className="home-process__step-desc">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust points ── */}
      <section className="home-trust">
        <div className="home-trust__inner">
          <h2 className="home-trust__heading">Why this works</h2>
          <div className="home-trust__grid">
            {TRUST_POINTS.map((point) => (
              <div key={point.heading} className="home-trust__card">
                <span className="home-trust__icon">{point.icon}</span>
                <h3 className="home-trust__card-heading">{point.heading}</h3>
                <p className="home-trust__card-body">{point.body}</p>
              </div>
            ))}
          </div>
          <div className="home-trust__links">
            <Link to="/benefits" className="home-trust__link">Full breakdown of benefits →</Link>
            <Link to="/process" className="home-trust__link">Detailed timeline →</Link>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="home-bottom-cta">
        <div className="home-bottom-cta__inner">
          <h2 className="home-bottom-cta__heading">
            Ready to see what your piece would cost?
          </h2>
          <p className="home-bottom-cta__sub">
            The configurator lets you design and price before committing to anything.
            No account, no quote request — just a real estimate.
          </p>
          <div className="home-bottom-cta__actions">
            <Link to="/configurator" className="btn btn--primary btn--lg">
              Open the configurator
            </Link>
            <Link to="/faq" className="btn btn--ghost btn--lg">
              Read the FAQ
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
