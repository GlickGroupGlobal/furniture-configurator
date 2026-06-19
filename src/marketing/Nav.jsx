import { NavLink } from 'react-router-dom'
import './Nav.css'

const NAV_LINKS = [
  { to: '/',               label: 'Home',              end: true },
  { to: '/how-it-works',   label: 'How It Works' },
  { to: '/process',        label: 'Process & Timeline' },
  { to: '/benefits',       label: 'Benefits' },
  { to: '/gallery',        label: 'Gallery' },
  { to: '/testimonials',   label: 'Testimonials' },
  { to: '/pricing',        label: 'Pricing' },
  { to: '/faq',            label: 'FAQ' },
  { to: '/contact',        label: 'Contact' },
]

export default function Nav() {
  return (
    <header className="site-nav">
      <NavLink to="/" className="site-nav__logo">
        [Company Name]
      </NavLink>
      <nav className="site-nav__links">
        {NAV_LINKS.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              'site-nav__link' + (isActive ? ' site-nav__link--active' : '')
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <NavLink to="/configurator" className="site-nav__cta">
        Design your piece
      </NavLink>
    </header>
  )
}
