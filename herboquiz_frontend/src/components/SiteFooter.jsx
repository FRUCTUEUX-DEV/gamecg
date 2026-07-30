import { Link } from 'react-router-dom'
import { Trophy, LogIn } from 'lucide-react'
import { session } from '@/services/api'
import IconeFacebook from '@/components/IconeFacebook'

/** Suivi UTM discret sur les liens sortants vers Gextimo / NovafriQ. */
function avecUtm(url, medium) {
  if (!url) return url
  try {
    const u = new URL(url)
    u.searchParams.set('utm_source', 'herboquiz')
    u.searchParams.set('utm_medium', medium)
    u.searchParams.set('utm_campaign', 'tournoi')
    return u.toString()
  } catch {
    return url
  }
}

/** Pied de page partage entre toutes les pages publiques. */
export default function SiteFooter({ r }) {
  return (
    <footer className="border-t border-bord bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Colonne 1 : Branding */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={28} className="text-neon" />
              <span className="font-bold text-xl text-neon">{r['tournoi.nom']}</span>
            </div>
            <p className="text-sm text-texte-doux leading-relaxed">
              {r['textes.pied_page'] || 'Le tournoi de culture générale qui met la rapidité d\'esprit sur le devant de la scène.'}
            </p>
          </div>

          {/* Colonne 2 : Tournoi */}
          <div>
            <h3 className="font-bold text-neon mb-4">Tournoi</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/#categories" className="text-texte-doux hover:text-neon transition-colors">
                  Catégories
                </a>
              </li>
              <li>
                <a href="/#format" className="text-texte-doux hover:text-neon transition-colors">
                  Le format
                </a>
              </li>
              <li>
                <a href="/#classement" className="text-texte-doux hover:text-neon transition-colors">
                  Classement
                </a>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Ressources */}
          <div>
            <h3 className="font-bold text-neon mb-4">Ressources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/#reglement" className="text-texte-doux hover:text-neon transition-colors">
                  Règlement
                </a>
              </li>
              <li>
                <Link to="/a-propos" className="text-texte-doux hover:text-neon transition-colors">
                  À propos
                </Link>
              </li>
              {r['inscriptions.ouvertes'] && (
                <li>
                  <Link to="/inscription" className="text-texte-doux hover:text-neon transition-colors">
                    S'inscrire
                  </Link>
                </li>
              )}
              <li>
                <span className="text-texte-faible text-xs">Organisateurs</span>
              </li>
            </ul>
          </div>

          {/* Colonne 4 : Contact */}
          <div>
            <h3 className="font-bold text-neon mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              {r['promo.lien_facebook'] && (
                <li>
                  <a
                    href={r['promo.lien_facebook']}
                    target="_blank"
                    rel="noreferrer"
                    className="text-texte-doux hover:text-neon transition-colors inline-flex items-center gap-2"
                  >
                    <IconeFacebook size={14} /> Facebook
                  </a>
                </li>
              )}
              <li>
                <Link
                  to={session.jeton() ? '/admin' : '/connexion'}
                  className="text-texte-doux hover:text-neon transition-colors inline-flex items-center gap-2"
                >
                  <LogIn size={14} /> Administration
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-bord flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-texte-faible">
          <p>© 2026 {r['tournoi.nom']} — {r['tournoi.organisateur']}</p>
          {r['signature.active'] && r['signature.texte'] && (
            <a
              href={avecUtm(r['signature.lien'], 'signature') || '#'}
              target="_blank"
              rel="noreferrer"
              className="hover:text-neon transition-colors"
            >
              {r['signature.texte']}
            </a>
          )}
        </div>
      </div>
    </footer>
  )
}
