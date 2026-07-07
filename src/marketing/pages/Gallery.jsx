import { Link } from 'react-router-dom'
import { GALLERY_ITEMS } from '../data/gallery'
import './Gallery.css'

export default function Gallery() {
  return (
    <div className="gal">

      <div className="gal__header">
        <p className="gal__eyebrow">Proof, not promises</p>
        <h1 className="gal__title">Gallery</h1>
        <p className="gal__subtitle">
          Real cabinet projects from installed homes and factory trial assembly.
          These are the kinds of photos and videos customers receive before and
          after production.
        </p>
      </div>

      <div className="gal__grid">
        {GALLERY_ITEMS.map((item) => (
          <div key={item.id} className="gal__card">
            <div className="gal__image-wrap">
              {item.mediaType === 'video' ? (
                <video className="gal__image" src={item.src} controls preload="metadata" playsInline />
              ) : item.src ? (
                <img src={item.src} alt={item.title} className="gal__image" loading="lazy" />
              ) : (
                <div className="gal__image-placeholder">
                  <span>Photo pending</span>
                </div>
              )}
            </div>
            {item.category && <p className="gal__category">{item.category}</p>}
            <h3 className="gal__card-title">{item.title}</h3>
            <p className="gal__card-caption">{item.caption}</p>
          </div>
        ))}
      </div>

      <div className="gal__cta">
        <p>Want to see what your piece could look like before it's real?</p>
        <Link to="/configurator" className="btn btn--primary">Design your piece</Link>
      </div>

    </div>
  )
}
