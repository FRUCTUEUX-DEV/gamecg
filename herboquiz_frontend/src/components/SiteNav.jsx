import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Menu, X } from 'lucide-react'

// Ancres partagees entre le menu desktop et le tiroir mobile : une seule
// liste, pour ne jamais les laisser diverger.
const LIENS_ANCRES = [
  { href: '/#format', label: 'Le format' },
  { href: '/#classement', label: 'Classement' },
  { href: '/#reglement', label: 'Règlement' },
]

/**
 * Navigation partagee entre toutes les pages publiques (accueil, à propos...).
 *
 * Les ancres (#format, #classement, #reglement) pointent toujours vers "/" :
 * ca marche depuis n'importe quelle page sans JS special, le navigateur fait
 * juste sauter au bon endroit une fois sur l'accueil.
 */
export default function SiteNav({ r }) {
  const [ouvert, setOuvert] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('herboquiz-theme')
    if (stored) {
      document.documentElement.setAttribute('data-theme', stored)
    }
  }, [])

  const toggleTheme = () => {
    const root = document.documentElement
    const current = root.getAttribute('data-theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const effectiveDark = current ? current === 'dark' : prefersDark
    const next = effectiveDark ? 'light' : 'dark'

    root.setAttribute('data-theme', next)
    localStorage.setItem('herboquiz-theme', next)
  }

  return (
    <nav className="border-b border-bord/50 backdrop-blur-sm bg-fond/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-16">
          {/* min-w-0 + truncate : un nom de tournoi long ne doit jamais faire
              passer le bandeau sur deux lignes (il chevaucherait le contenu
              en dessous, la barre etant sticky et de hauteur fixe). */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0" onClick={() => setOuvert(false)}>
            <Trophy size={22} className="text-neon shrink-0" />
            <div className="min-w-0">
              <h1 className="font-bold text-sm sm:text-lg text-neon leading-tight truncate">{r['tournoi.nom']}</h1>
              <p className="text-[11px] sm:text-xs text-texte-faible truncate">{r['tournoi.organisateur']}</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6 shrink-0">
            {LIENS_ANCRES.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-texte-doux hover:text-neon transition-colors">{l.label}</a>
            ))}
            <Link to="/a-propos" className="text-sm text-texte-doux hover:text-neon transition-colors">À propos</Link>

            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label="Changer de thème"
              title="Basculer entre le thème clair et sombre"
            >
              ◐
            </button>

            {r['inscriptions.ouvertes'] && (
              <Link to="/inscription"
                    className="px-4 py-2 bg-neon text-fond rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity">
                S'inscrire
              </Link>
            )}
          </div>

          {/* Bouton menu mobile : ouvre le tiroir ci-dessous, remplace par
              une croix quand il est ouvert. */}
          <div className="md:hidden flex items-center gap-1.5 shrink-0">
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label="Changer de thème"
            >
              ◐
            </button>
            <button
              onClick={() => setOuvert((v) => !v)}
              className="p-2 text-texte-doux hover:text-neon transition-colors"
              aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={ouvert}
            >
              {ouvert ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Tiroir mobile : memes liens que le menu desktop. Sans lui, un
            visiteur sur telephone n'avait aucun moyen d'atteindre le
            reglement, l'a-propos ou l'inscription sans defiler a la main. */}
        {ouvert && (
          <div className="md:hidden pb-4 flex flex-col gap-1 anim-glisse">
            {LIENS_ANCRES.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOuvert(false)}
                 className="px-3 py-2.5 rounded-lg text-sm text-texte-doux hover:text-neon hover:bg-surface transition-colors">
                {l.label}
              </a>
            ))}
            <Link to="/a-propos" onClick={() => setOuvert(false)}
                  className="px-3 py-2.5 rounded-lg text-sm text-texte-doux hover:text-neon hover:bg-surface transition-colors">
              À propos
            </Link>
            {r['inscriptions.ouvertes'] && (
              <Link to="/inscription" onClick={() => setOuvert(false)}
                    className="mt-2 px-4 py-2.5 bg-neon text-fond rounded-lg font-semibold text-sm text-center hover:opacity-90 transition-opacity">
                S'inscrire
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
