import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/photos', label: 'Galeri Foto' },
  ]

  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-wide">
            <div className="bg-white/20 rounded-lg p-1.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            SPP Dashboard
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-sm font-medium transition hover:text-white ${
                  location.pathname === l.to ? 'text-white border-b-2 border-white pb-0.5' : 'text-blue-200'
                }`}
              >
                {l.label}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-blue-600">
                <span className="text-sm text-blue-200">
                  {user.name || user.username}
                  {user.role === 'admin' && (
                    <span className="ml-1.5 text-xs bg-yellow-400 text-yellow-900 font-semibold px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm bg-white text-blue-800 font-semibold px-4 py-1.5 rounded-lg hover:bg-blue-50 transition"
              >
                Masuk
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10"
            onClick={() => setMenuOpen(v => !v)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-blue-700 bg-blue-900 px-4 py-3 space-y-2">
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm text-blue-200 hover:text-white transition"
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={() => { setMenuOpen(false); handleLogout() }}
              className="block w-full text-left py-2 text-sm text-red-300 hover:text-red-100 transition"
            >
              Keluar ({user.name || user.username})
            </button>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-white">
              Masuk
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
