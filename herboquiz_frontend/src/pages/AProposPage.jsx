import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users, CalendarDays, Layers, ArrowRight, Trophy, Swords, Flame,
  HeartHandshake, ShieldCheck, MessageCircleWarning,
} from 'lucide-react'
import { publicService } from '@/services/herboquizService'
import { QUERY_KEYS } from '@/hooks/queryKeys'
import { Apercu } from '@/components/EditeurTexte'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'

const EASE = [0.22, 1, 0.36, 1]

function Monte({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

function EnTeteSection({ eyebrow, titre, sous_titre }) {
  return (
    <Monte className="text-center mb-12">
      {eyebrow && <p className="etiquette text-neon-sourd mb-3">{eyebrow}</p>}
      <h2 className="text-3xl sm:text-4xl font-bold text-neon mb-4">{titre}</h2>
      {sous_titre && <p className="text-lg text-texte-doux max-w-2xl mx-auto">{sous_titre}</p>}
    </Monte>
  )
}

/**
 * Une regle « - **Titre :** description » devient une carte {titre, corps}.
 * Format libre pour l'admin (une ligne = une regle), rendu structure pour le
 * visiteur (une carte par regle, plutot qu'une liste a puces brute).
 */
function parserRegles(texte) {
  return (texte || '')
    .split('\n')
    .map((ligne) => ligne.trim())
    .filter((ligne) => ligne.startsWith('-'))
    .map((ligne) => {
      const m = ligne.match(/^-+\s*\*\*(.+?)\*\*\s*(.*)$/)
      if (!m) return null
      return { titre: m[1].replace(/\s*:\s*$/, ''), corps: m[2].replace(/^:\s*/, '').trim() }
    })
    .filter(Boolean)
}

const ICONES_REGLES = [HeartHandshake, ShieldCheck, MessageCircleWarning]

/**
 * Page « À propos » : présentation éditoriale du tournoi, en sections
 * distinctes (intro, terrain de jeu, règles, appel à l'action) plutôt qu'un
 * seul bloc de texte. Le contenu de chaque section vient des réglages —
 * l'organisateur le réécrit depuis l'admin, sans jamais toucher au code.
 */
export default function AProposPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.public,
    queryFn: publicService.tout,
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <p className="etiquette text-texte-faible anim-pulse">{t('commun.chargement')}</p>
      </div>
    )
  }

  const r = data.reglages
  const titre = r['apropos.titre'] || 'À propos du tournoi'
  const accroche = r['apropos.accroche']
  const regles = parserRegles(r['apropos.regles'])

  const stats = [
    { icone: CalendarDays, valeur: r['tournoi.debut']?.split(' à')[0] || '—', libelle: 'Coup d\'envoi' },
    { icone: Users, valeur: data.nb_inscrits.toLocaleString('fr-FR'), libelle: 'Joueurs inscrits' },
    { icone: Layers, valeur: data.classement.length || '—', libelle: 'Équipes' },
  ]

  const phases = [
    {
      icone: Swords,
      titre: 'Phase de poules',
      canal: r['tournoi.canal_poules'],
      texte: r['apropos.phase_poules'],
    },
    {
      icone: Flame,
      titre: 'Phases finales',
      canal: r['tournoi.canal_finales'],
      texte: r['apropos.phase_finales'],
    },
  ]

  return (
    <div className="min-h-screen bg-fond">
      <SiteNav r={r} />

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 -top-40 h-[520px] opacity-60"
          style={{ background: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(34,211,238,0.14), transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-20 text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="etiquette text-or mb-6"
          >
            À propos
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
            className="titre text-[clamp(2.2rem,5.5vw,3.75rem)] leading-[1.02] font-black text-neon mb-6"
          >
            {titre}
          </motion.h1>

          {accroche && (
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.16 }}
              className="text-lg sm:text-xl text-texte-doux max-w-2xl mx-auto leading-relaxed"
            >
              {accroche}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.26 }}
            className="mt-10 inline-grid grid-cols-3 gap-px bg-bord border border-bord mx-auto"
          >
            {stats.map((s) => (
              <div key={s.libelle} className="bg-fond px-3 sm:px-8 py-4 max-w-[8rem] sm:max-w-none">
                <s.icone size={16} className="text-neon-sourd mx-auto mb-2" />
                <span className="block font-bold text-xs sm:text-lg leading-tight tabular-nums">{s.valeur}</span>
                <span className="block mt-1 text-[0.6rem] sm:text-[0.65rem] uppercase tracking-wide text-muted">{s.libelle}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---------- Introduction ---------- */}
      {r['apropos.intro'] && (
        <section className="pb-16 sm:pb-20">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Monte className="text-center text-lg text-texte-doux leading-relaxed">
              <Apercu texte={r['apropos.intro']} />
            </Monte>
          </div>
        </section>
      )}

      {/* ---------- Le terrain de jeu ---------- */}
      <section className="py-16 sm:py-20 bg-surface/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <EnTeteSection
            eyebrow="Déroulement"
            titre="Le terrain de jeu"
            sous_titre="Deux étapes, deux ambiances bien différentes."
          />

          <div className="grid sm:grid-cols-2 gap-6">
            {phases.map((p, i) => (
              <Monte key={p.titre} delay={i * 0.08} className="carte p-7">
                <div className="w-12 h-12 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center mb-5">
                  <p.icone size={20} className="text-neon" />
                </div>
                <h3 className="text-xl font-bold mb-1.5">{p.titre}</h3>
                {p.canal && (
                  <p className="text-xs uppercase tracking-wide text-neon-sourd font-mono mb-3">{p.canal}</p>
                )}
                <p className="text-texte-doux leading-relaxed">{p.texte}</p>
              </Monte>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Les règles de la maison ---------- */}
      {regles.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <EnTeteSection
              eyebrow="Esprit du jeu"
              titre="Les règles de la maison"
              sous_titre="Pour que la compétition reste conviviale, du début à la fin."
            />

            <div className="grid sm:grid-cols-3 gap-6">
              {regles.map((regle, i) => {
                const Icone = ICONES_REGLES[i % ICONES_REGLES.length]
                return (
                  <Monte key={regle.titre} delay={i * 0.08} className="carte p-6">
                    <Icone size={22} className="text-neon-sourd mb-4" />
                    <h3 className="font-bold mb-2">{regle.titre}</h3>
                    <p className="text-sm text-texte-doux leading-relaxed">{regle.corps}</p>
                  </Monte>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Clôture + appel à l'action ---------- */}
      <section className="py-16 sm:py-24 bg-surface/30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Monte>
            <Trophy size={32} className="text-or mx-auto mb-6" />

            {r['apropos.cloture'] && (
              <p className="text-xl sm:text-2xl font-semibold leading-snug mb-8">
                {r['apropos.cloture']}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3">
              {r['inscriptions.ouvertes'] && (
                <Link
                  to="/inscription"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-neon text-fond rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Rejoindre le tournoi
                  <ArrowRight size={16} />
                </Link>
              )}
              <a
                href="/#classement"
                className="inline-flex items-center gap-2 px-7 py-3.5 border border-bord rounded-lg font-semibold hover:border-neon transition-colors"
              >
                Voir le classement
              </a>
            </div>
          </Monte>
        </div>
      </section>

      <SiteFooter r={r} />
    </div>
  )
}
