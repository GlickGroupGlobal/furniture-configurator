import { Link } from 'react-router-dom'
import { TESTIMONIALS } from '../data/testimonials'
import './Testimonials.css'

export default function Testimonials() {
  return (
    <div className="test">

      <div className="test__header">
        <p className="test__eyebrow">Social proof</p>
        <h1 className="test__title">Testimonials</h1>
        <p className="test__subtitle">
          We're early. Real customer testimonials will appear here as orders complete
          and customers are willing to share their experience — we won't put words in
          anyone's mouth before that happens.
        </p>
      </div>

      <div className="test__grid">
        {TESTIMONIALS.map((t) =>
          t.status === 'real' ? (
            <div key={t.id} className="test__card test__card--real">
              <p className="test__quote">&ldquo;{t.quote}&rdquo;</p>
              <div className="test__author">
                <span className="test__author-name">{t.author}</span>
                <span className="test__author-location">{t.location}</span>
              </div>
              {t.piece && <span className="test__piece">{t.piece}</span>}
            </div>
          ) : (
            <div key={t.id} className="test__card test__card--placeholder">
              <span className="test__placeholder-badge">Testimonial coming soon</span>
              <p className="test__placeholder-text">
                This spot is reserved for a real customer testimonial once an order
                completes and the customer agrees to share it.
              </p>
            </div>
          )
        )}
      </div>

      <div className="test__cta">
        <p>Be one of the first customers — and the first testimonial.</p>
        <Link to="/configurator" className="btn btn--primary">Design your piece</Link>
      </div>

    </div>
  )
}
