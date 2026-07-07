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
          Real completed pieces, starting with the order that proved this sourcing
          model works. More photos get added here as new orders complete.
        </p>
      </div>

      <div className="gal__grid">
        {GALLERY_ITEMS.map((item) => (
          <div key={item.id} className="gal__card">
            <div className="gal__image-wrap">
              {item.image ? (
                <img src={item.image} alt={item.title} className="gal__image" />
              ) : (
                <div className="gal__image-placeholder">
                  <span>{item.image === null ? 'Photo pending' : ''}</span>
                </div>
              )}
            </div>
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
