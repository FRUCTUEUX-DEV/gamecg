import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Trophy, CalendarDays, Users, ScrollText, Medal, Radio, Sparkles, Target,
  Share2, Copy, Check, MessageCircle, Rocket, ExternalLink, BookOpen, Map, Palette,
  Dumbbell, Globe, Clock, Award, ChevronLeft, ChevronRight, Plus,
} from 'lucide-react'
import { publicService } from '@/services/herboquizService'
import { QUERY_KEYS } from '@/hooks/queryKeys'
import { Apercu } from '@/components/EditeurTexte'
import { cn } from '@/utils/cn'
import ReglementFullscreen from '@/components/ReglementFullscreen'
import PrixSection from '@/components/PrixSection'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import IconeFacebook from '@/components/IconeFacebook'

// Dernier rang connu de chaque equipe, garde cote visiteur pour que la
// tendance du classement survive a un rechargement de page.
const CLE_TENDANCES = 'herboquiz-rangs-precedents'

/**
 * Page publique refondée avec design inspiré d'AGORA
 * Design moderne, élégant et performant pour mobile et desktop
 * Inclut le système de thème clair/sombre
 */
export default function PublicPage() {
  const { t } = useTranslation()
  const [copie, setCopie] = useState(false)
  const [isReglementOpen, setIsReglementOpen] = useState(false)
  // Cartes du hero : au survol du groupe, elles s'ecartent pour se lire en
  // entier ; la carte survolee individuellement passe devant les deux autres.
  const [eventailOuvert, setEventailOuvert] = useState(false)
  const [carteSurvolee, setCarteSurvolee] = useState(null)
  // Tendance du classement : positif = a gagne des rangs depuis le dernier
  // rafraichissement, negatif = en a perdu. Calculee en comparant le rang
  // actuel de chaque equipe (par libelle) a celui memorise au fetch precedent
  // — jamais affichee tant qu'on n'a pas encore un « avant » a comparer.
  const [tendances, setTendances] = useState({})
  const rangPrecedent = useRef({})

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.public,
    queryFn: publicService.tout,
    refetchInterval: 30000,
  })

  useEffect(() => {
    if (!data) return

    const rangActuel = {}
    data.classement.forEach((c, i) => { rangActuel[c.libelle] = i + 1 })

    // Le premier rendu n'a rien en memoire (rangPrecedent.current est vide) :
    // on retombe alors sur le dernier rang connu du visiteur, garde dans son
    // navigateur. Sans ca, un simple F5 remettait tout le monde a « — »,
    // meme si le classement avait vraiment bouge depuis la derniere visite.
    let precedent = rangPrecedent.current
    if (Object.keys(precedent).length === 0) {
      try {
        precedent = JSON.parse(localStorage.getItem(CLE_TENDANCES) || '{}')
      } catch {
        precedent = {}
      }
    }

    if (Object.keys(precedent).length > 0) {
      const calc = {}
      Object.entries(rangActuel).forEach(([nom, rang]) => {
        const avant = precedent[nom]
        calc[nom] = avant === undefined ? 0 : avant - rang
      })
      setTendances(calc)
    }

    rangPrecedent.current = rangActuel
    localStorage.setItem(CLE_TENDANCES, JSON.stringify(rangActuel))
  }, [data])

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <p className="etiquette text-texte-faible anim-pulse">{t('commun.chargement')}</p>
      </div>
    )
  }

  const r = data.reglages
  const devise = r['prix.devise'] ?? ''
  // Montant et devise separes : sur un ecran de 320 px, chaque carte du podium
  // fait environ 90 px et « 10 000 FCFA » d'un seul tenant deborde.
  const montant = (v) => Number(v ?? 0).toLocaleString('fr-FR')
  // Un podium ou tout le monde est a zero ne veut rien dire : il laisse croire
  // que le classement est fige alors que rien n'a encore ete joue.
  const aDesPoints = data.classement.some((c) => c.points > 0)
  const podium = aDesPoints ? data.classement.slice(0, 3) : []
  const suite = aDesPoints ? data.classement.slice(3) : []
  const enDirect = data.manches.some((m) => m.statut === 'en_cours')
  // Calendrier : les manches datees se regroupent par jour (AAAA-MM-JJ), pour
  // etre posees sur la bonne case de la grille. Une manche sans date_prevue
  // reste dans la liste texte plus bas, mais ne peut pas apparaitre sur une
  // grille de jours — rien a y faire de plus precis qu'un « a venir ».
  const manchesDatees = data.manches.filter((m) => m.date_prevue)
  const manchesParJour = manchesDatees.reduce((acc, m) => {
    const cle = String(m.date_prevue).slice(0, 10)
    ;(acc[cle] ??= []).push(m)
    return acc
  }, {})
  const moisCalendrier = [...new Set(manchesDatees.map((m) => String(m.date_prevue).slice(0, 7)))].sort()
  // Une poule sans equipe (creee puis laissee vide) n'a rien a montrer : on ne
  // l'affiche pas plutot que d'exposer un cadre vide.
  const poules = (data.poules ?? []).filter((p) => p.classement.length > 0)
  // Avant le premier point, un rang « 1 » sur toutes les lignes n'a pas de sens :
  // on montre alors une simple composition (qui est avec qui).
  const avecPoints = poules.some((p) => p.classement.some((c) => c.points > 0)) || aDesPoints

  // Message « style groupe » a coller : les poules et leur classement si elles
  // existent, sinon le classement general. Les emojis vivent dans les cles i18n
  // (donnee, pas code) ; ici on n'assemble que des lignes.
  const urlSite = r['tournoi.url'] || window.location.origin
  const messagePartage = () => {
    // Avant le moindre point : on partage la REPARTITION (qui est avec qui),
    // sans « — 0 pts » partout. Des qu'il y a des points : le CLASSEMENT.
    const lignes = [t('public.msg_entete', { tournoi: r['tournoi.nom'] }), '']

    if (poules.length) {
      lignes.push(avecPoints ? t('public.msg_classement') : t('public.msg_repartition'))
      poules.forEach((p) => {
        lignes.push('', t('public.msg_poule', { nom: p.nom }))
        p.classement.forEach((c) => lignes.push(
          avecPoints ? `   ${c.rang}. ${c.libelle} — ${c.points} pts` : `   • ${c.libelle}`,
        ))
      })
      lignes.push('')
    } else if (aDesPoints) {
      lignes.push(t('public.msg_classement'), '')
      data.classement.forEach((c, i) => lignes.push(`   ${i + 1}. ${c.libelle} — ${c.points} pts`))
      lignes.push('')
    }

    lignes.push(t('public.msg_pied', { url: urlSite }))
    return lignes.join('\n')
  }

  const copierMessage = async () => {
    await navigator.clipboard.writeText(messagePartage())
    setCopie(true)
    setTimeout(() => setCopie(false), 2000)
  }

  // WhatsApp accepte le texte pre-rempli ; Facebook, non (il lit les balises Open
  // Graph de la page), on lui passe donc l'URL.
  const lienWhatsapp = `https://wa.me/?text=${encodeURIComponent(messagePartage())}`
  const lienFacebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlSite)}`

  // Suivi UTM sur les liens sortants vers Gextimo / NovafriQ : le proprietaire
  // voit dans SES statistiques combien de visiteurs HerboQuiz lui amene.
  // Invisible pour le visiteur. Une URL invalide n'est pas cassee.
  const avecUtm = (url, medium) => {
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

  return (
    <div className="min-h-screen bg-fond">
      <SiteNav r={r} />

      {/* Hero Section - Exact d'AGORA */}
      <section className="hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="hero-grid grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-14 items-center">
            {/* Hero Copy */}
            <div className="hero-copy">
              <span className="eyebrow inline-flex items-center gap-2 text-xs uppercase tracking-wider text-or font-mono mb-6">
                <span className="w-1.5 h-1.5 bg-ember rounded-full shadow-[0_0_0_3px_rgba(255,75,46,0.22)]"></span>
                {r['tournoi.debut']} — {r['inscriptions.ouvertes'] ? 'Inscriptions ouvertes' : 'Tournoi en cours'}
              </span>

              <h1 className="titre text-[clamp(2.6rem,6.4vw,5rem)] leading-[0.98] font-black mb-6">
                <span className="block">
                  <span className="inline-block">Vite.</span>
                </span>
                <span className="block">
                  <em className="font-serif italic font-semibold not-italic text-ember">Juste.</em> Redoutable.
                </span>
              </h1>

              <p className="text-lg text-texte-doux max-w-[44ch] mb-8">
                {r['tournoi.nom']} réunit joueurs, équipes et spectateurs autour d'un même chronomètre : celui de la réflexion rapide.
                {r['textes.annonce'] ? (
                  <span className="block mt-2">{r['textes.annonce'].substring(0, 150)}{r['textes.annonce'].length > 150 ? '...' : ''}</span>
                ) : (
                  <span className="block mt-2">Des catégories variées, un classement mis à jour en direct, et une finale qui ne laisse aucune place à l'hésitation.</span>
                )}
              </p>

              <div className="hero-actions flex flex-wrap gap-3.5 mb-12">
                {r['inscriptions.ouvertes'] && (
                  <Link 
                    to="/inscription"
                    className="btn btn-primary inline-flex items-center gap-2 px-7 py-4 bg-ember text-[#191008] font-bold rounded hover:translate-y-[-2px] hover:shadow-[0_14px_30px_-12px_rgba(255,75,46,0.55)] transition-all"
                  >
                    Rejoindre le tournoi
                  </Link>
                )}
                <a 
                  href="#classement"
                  className="btn btn-ghost inline-flex items-center gap-2 px-7 py-4 border border-bord text-texte font-bold rounded hover:bg-surface hover:border-texte-doux transition-all"
                >
                  Voir le classement en direct
                </a>
              </div>

              {/* Ticker - Stats */}
              <div className="ticker grid grid-cols-2 sm:grid-cols-4 gap-px bg-bord border border-bord max-w-[520px]">
                <div className="bg-fond p-3.5">
                  <span className="num block font-mono font-bold text-[1.35rem] tabular-nums">
                    {data.nb_inscrits.toLocaleString('fr-FR')}
                  </span>
                  <span className="lbl block mt-1 text-[0.68rem] uppercase tracking-wide text-muted">
                    Joueurs inscrits
                  </span>
                </div>
                <div className="bg-fond p-3.5">
                  <span className="num block font-mono font-bold text-[1.35rem] tabular-nums">
                    {data.classement.length}
                  </span>
                  <span className="lbl block mt-1 text-[0.68rem] uppercase tracking-wide text-muted">
                    Équipes
                  </span>
                </div>
                <div className="bg-fond p-3.5">
                  <span className="num block font-mono font-bold text-[1.35rem] tabular-nums">5+</span>
                  <span className="lbl block mt-1 text-[0.68rem] uppercase tracking-wide text-muted">
                    Catégories
                  </span>
                </div>
                <div className="bg-fond p-3.5">
                  <span className="num block font-mono font-bold text-[1.35rem] tabular-nums">
                    {enDirect ? (
                      <span className="flex items-center gap-1 text-danger">
                        <Radio size={14} className="anim-pulse" /> Live
                      </span>
                    ) : data.manches.find(m => m.phase === 'finale')?.date_prevue ? (
                      new Date(data.manches.find(m => m.phase === 'finale').date_prevue).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                    ) : (
                      r['tournoi.debut']?.split(' ')[0] || '—'
                    )}
                  </span>
                  <span className="lbl block mt-1 text-[0.68rem] uppercase tracking-wide text-muted">
                    {enDirect ? 'En direct' : 'Finale'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Fan - Questions examples dynamiques */}
            <div
              className="card-fan group relative h-[clamp(320px,40vw,440px)] hidden lg:block"
              aria-hidden="true"
              onMouseEnter={() => setEventailOuvert(true)}
              onMouseLeave={() => { setEventailOuvert(false); setCarteSurvolee(null) }}
            >
              {/* On affiche 3 cartes d'exemple avec les manches récentes */}
              {data.manches.slice(0, 3).map((manche, i) => {
                const colors = ['#5b8c6e', '#c1553a', '#3e7c82', '#e8a93c', '#ff4b2e', '#4c6fa5']
                const positions = [
                  { top: '0', left: '0', rotate: '-8deg', zIndex: 10, ecart: 'translate(-34px, -22px) rotate(-14deg)' },
                  { top: '19%', left: '35%', rotate: '5deg', zIndex: 20, ecart: 'translate(38px, 8px) rotate(11deg)' },
                  { top: '38%', left: '11%', rotate: '-3deg', zIndex: 30, ecart: 'translate(-14px, 40px) rotate(-9deg)' },
                ]
                const pos = positions[i] || positions[0]
                const survolee = carteSurvolee === i

                return (
                  <div
                    key={manche.id}
                    className="qcard absolute w-[min(72%,268px)] h-[172px] p-5 bg-fond-2 border border-bord rounded-sm shadow-[0_30px_60px_-25px_rgba(0,0,0,0.65)] overflow-hidden"
                    onMouseEnter={() => setCarteSurvolee(i)}
                    onMouseLeave={() => setCarteSurvolee(null)}
                    style={{
                      borderTopWidth: '5px',
                      borderTopColor: colors[i % colors.length],
                      top: pos.top,
                      left: pos.left,
                      transform: eventailOuvert
                        ? `${pos.ecart} scale(${survolee ? 1.07 : 1})`
                        : `rotate(${pos.rotate})`,
                      zIndex: eventailOuvert ? (survolee ? 100 : 40 + i) : pos.zIndex,
                      transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
                      boxShadow: survolee
                        ? '0 40px 70px -20px rgba(0,0,0,0.75)'
                        : undefined,
                    }}
                  >
                    <span className="code block font-mono text-[0.7rem] tracking-wider text-muted uppercase">
                      {manche.libelle}
                    </span>
                    <h3 className="text-[1.05rem] leading-tight mt-2 font-black">
                      {manche.phase === 'finale' 
                        ? '« Questions pour la victoire finale »' 
                        : manche.phase === 'demi_finale'
                        ? '« Seuls les meilleurs passent »'
                        : '« Toutes catégories confondues »'}
                    </h3>
                    <span className="pts absolute left-5 bottom-[18px] font-mono font-bold text-or">
                      {manche.statut === 'terminee' ? 'Terminée' : 
                       manche.statut === 'en_cours' ? 'En cours' : 
                       'À venir'}
                    </span>
                  </div>
                )
              })}
              
              {/* Si pas assez de manches, on met des cartes par défaut */}
              {data.manches.length === 0 && (
                <>
                  <div className="qcard absolute w-[min(72%,268px)] h-[172px] p-5 bg-fond-2 border-t-[5px] border-t-[#5b8c6e] border border-bord rounded-sm shadow-[0_30px_60px_-25px_rgba(0,0,0,0.65)] overflow-hidden top-0 left-0 rotate-[-8deg] z-10 transition-transform duration-500 ease-out group-hover:-translate-x-[34px] group-hover:-translate-y-[22px] group-hover:rotate-[-14deg] group-hover:z-[100]">
                    <span className="code block font-mono text-[0.7rem] tracking-wider text-muted">
                      SCIENCES & NATURE
                    </span>
                    <h3 className="text-[1.05rem] leading-tight mt-2 font-black">
                      « Prêt pour le défi ? »
                    </h3>
                    <span className="pts absolute left-5 bottom-[18px] font-mono font-bold text-or">
                      Bientôt disponible
                    </span>
                  </div>
                  <div className="qcard absolute w-[min(72%,268px)] h-[172px] p-5 bg-fond-2 border-t-[5px] border-t-[#c1553a] border border-bord rounded-sm shadow-[0_30px_60px_-25px_rgba(0,0,0,0.65)] overflow-hidden top-[19%] left-[35%] rotate-[5deg] z-20 transition-transform duration-500 ease-out group-hover:translate-x-[38px] group-hover:translate-y-[8px] group-hover:rotate-[11deg] group-hover:z-[100]">
                    <span className="code block font-mono text-[0.7rem] tracking-wider text-muted">
                      HISTOIRE & SOCIÉTÉ
                    </span>
                    <h3 className="text-[1.05rem] leading-tight mt-2 font-black">
                      « Culture générale à 360° »
                    </h3>
                    <span className="pts absolute left-5 bottom-[18px] font-mono font-bold text-or">
                      Bientôt disponible
                    </span>
                  </div>
                  <div className="qcard absolute w-[min(72%,268px)] h-[172px] p-5 bg-fond-2 border-t-[5px] border-t-[#3e7c82] border border-bord rounded-sm shadow-[0_30px_60px_-25px_rgba(0,0,0,0.65)] overflow-hidden top-[38%] left-[11%] rotate-[-3deg] z-30 transition-transform duration-500 ease-out group-hover:-translate-x-[14px] group-hover:translate-y-[40px] group-hover:rotate-[-9deg] group-hover:z-[100]">
                    <span className="code block font-mono text-[0.7rem] tracking-wider text-muted">
                      GÉOGRAPHIE & MONDE
                    </span>
                    <h3 className="text-[1.05rem] leading-tight mt-2 font-black">
                      « De nouvelles catégories à chaque manche »
                    </h3>
                    <span className="pts absolute left-5 bottom-[18px] font-mono font-bold text-or">
                      Bientôt disponible
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-20 bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-neon mb-4">Le terrain de jeu</h2>
            <p className="text-xl text-texte-doux max-w-2xl mx-auto">
              Des catégories variées. Aucune préparée d'avance.
            </p>
            <p className="text-base text-texte-faible max-w-2xl mx-auto mt-3">
              Chaque manche pioche dans l'ensemble du savoir humain. Impossible de se spécialiser : il faut être prêt partout.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                titre: 'Histoire & Société',
                desc: 'Des empires antiques aux mutations contemporaines.',
                exemple: '« Quel traité met fin à la guerre de Trente Ans ? »',
                icon: BookOpen,
                color: 'text-or',
              },
              {
                num: '02',
                titre: 'Sciences & Nature',
                desc: 'Physique, biologie, astronomie : la logique du réel.',
                exemple: '« Quel est le seul mammifère volant ? »',
                icon: Sparkles,
                color: 'text-neon',
              },
              {
                num: '03',
                titre: 'Arts & Lettres',
                desc: 'Peinture, littérature, musique, du classique à l\'actuel.',
                exemple: '« Qui a peint "La Nuit étoilée" ? »',
                icon: Palette,
                color: 'text-argent',
              },
              {
                num: '04',
                titre: 'Sport',
                desc: 'Records, palmarès et grands moments de compétition.',
                exemple: '« Quel pays a remporté la première Coupe du monde ? »',
                icon: Dumbbell,
                color: 'text-bronze',
              },
              {
                num: '05',
                titre: 'Géographie & Monde',
                desc: 'Cartes, frontières, capitales et grands équilibres.',
                exemple: '« Quelle capitale est la plus haute du monde ? »',
                icon: Globe,
                color: 'text-neon',
              },
            ].map((cat, i) => (
              <div
                key={i}
                className="groupe carte p-6 hover:border-neon/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-5xl font-bold text-texte-faible/20">{cat.num}</span>
                  <cat.icon className={cn('w-6 h-6', cat.color)} />
                </div>
                <h3 className="text-xl font-bold text-neon mb-2">{cat.titre}</h3>
                <p className="text-sm text-texte-doux mb-3">{cat.desc}</p>
                <p className="text-xs text-texte-faible italic">{cat.exemple}</p>
              </div>
            ))}

            {/* Carte symbolique : la liste n'est jamais fermee a six ou neuf,
                elle s'allonge a chaque tournoi. On le montre plutot que de
                promettre un chiffre qui ne serait plus vrai le mois suivant. */}
            <div className="groupe carte p-6 border-dashed flex flex-col items-center justify-center text-center hover:border-neon/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full border border-dashed border-bord-vif flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-texte-faible" />
              </div>
              <h3 className="text-xl font-bold text-texte-doux mb-2">Et bien d'autres…</h3>
              <p className="text-sm text-texte-faible">
                Chaque manche peut piocher un thème inédit. La liste s'allonge à chaque tournoi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Format Section */}
      <section id="format" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-neon mb-4">Le format</h2>
            <p className="text-xl text-texte-doux max-w-2xl mx-auto">
              Trois manches. Une seule finale.
            </p>
            <p className="text-base text-texte-faible max-w-2xl mx-auto mt-3">
              Le parcours est le même pour tous, du premier quiz en ligne à la scène de la finale.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-neon/10 border border-neon/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-neon">01</span>
              </div>
              <h3 className="text-xl font-bold text-neon mb-2">Inscription</h3>
              <p className="text-texte-doux mb-3">
                Formez une équipe de 1 à 4 joueurs et choisissez votre nom de guerre.
              </p>
              {r['inscriptions.date_limite'] && (
                <p className="text-sm text-texte-faible">
                  Jusqu'au {r['inscriptions.date_limite']}
                </p>
              )}
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-neon/10 border border-neon/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-neon">02</span>
              </div>
              <h3 className="text-xl font-bold text-neon mb-2">Qualifications</h3>
              <p className="text-texte-doux mb-3">
                Trois manches chronométrées en ligne, toutes catégories mélangées.
              </p>
              <p className="text-sm text-texte-faible">
                {data.manches.length > 0 ? `${data.manches.length} manches programmées` : 'Calendrier à venir'}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-neon/10 border border-neon/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-neon">03</span>
              </div>
              <h3 className="text-xl font-bold text-neon mb-2">Finale en direct</h3>
              <p className="text-texte-doux mb-3">
                Les meilleures équipes s'affrontent sur scène, buzzer en main.
              </p>
              <p className="text-sm text-texte-faible">
                {r['tournoi.debut'] || 'Date à confirmer'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Classement Section - Le coeur de la page */}
      <section id="classement" className="py-20 bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              {enDirect && <Radio size={20} className="text-danger anim-pulse" />}
              <h2 className="text-4xl sm:text-5xl font-bold text-neon">
                {enDirect ? 'En direct' : 'Le classement'}
              </h2>
            </div>
            <p className="text-xl text-texte-doux">
              {aDesPoints ? 'Le classement ne dort jamais.' : 'Prêts pour la compétition.'}
            </p>
            {aDesPoints && (
              <p className="text-sm text-texte-faible mt-2">
                Mis à jour il y a quelques instants
              </p>
            )}
          </div>
          {/* Podium moderne */}
          {podium.length > 0 && (
            <div className="max-w-4xl mx-auto mb-12">
              <div className="grid grid-cols-3 gap-4 items-end">
                {/* 2ème place */}
                <div className="pb-8">
                  <div className="carte p-6 text-center hover:border-argent/50 transition-all">
                    <Medal size={32} className="text-argent mx-auto mb-3" />
                    <p className={cn('font-bold text-lg mb-2', podium[1]?.elimine && 'line-through text-texte-faible')}>
                      {podium[1]?.libelle}
                    </p>
                    <p className="text-3xl font-bold text-argent mb-1">{podium[1]?.points}</p>
                    <p className="text-xs text-texte-faible">points</p>
                  </div>
                </div>

                {/* 1ère place - Plus grande */}
                <div className="pb-0">
                  <div className="carte p-8 text-center border-or/50 bg-gradient-to-b from-or/5 to-transparent hover:border-or transition-all">
                    <Medal size={48} className="text-or mx-auto mb-4" />
                    <p className={cn('font-bold text-xl mb-3', podium[0]?.elimine && 'line-through text-texte-faible')}>
                      {podium[0]?.libelle}
                    </p>
                    <p className="text-5xl font-bold text-or mb-2">{podium[0]?.points}</p>
                    <p className="text-sm text-texte-faible">points</p>
                    <div className="mt-4 pt-4 border-t border-bord">
                      <Trophy size={20} className="text-or mx-auto" />
                    </div>
                  </div>
                </div>

                {/* 3ème place */}
                <div className="pb-8">
                  <div className="carte p-6 text-center hover:border-bronze/50 transition-all">
                    <Medal size={32} className="text-bronze mx-auto mb-3" />
                    <p className={cn('font-bold text-lg mb-2', podium[2]?.elimine && 'line-through text-texte-faible')}>
                      {podium[2]?.libelle}
                    </p>
                    <p className="text-3xl font-bold text-bronze mb-1">{podium[2]?.points}</p>
                    <p className="text-xs text-texte-faible">points</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tableau du classement complet — vrai <table>, avec une colonne
              Tendance calculee sur les rafraichissements reels (voir
              l'effet plus haut), pas une fleche decorative figee. */}
          {suite.length > 0 && (
            <div className="max-w-4xl mx-auto">
              <div className="carte overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-surface/50 border-b border-bord text-xs font-semibold text-texte-faible">
                        <th className="px-4 sm:px-6 py-3 text-left font-semibold">Rang</th>
                        <th className="px-4 sm:px-6 py-3 text-left font-semibold">Équipe</th>
                        <th className="px-4 sm:px-6 py-3 text-center font-semibold hidden sm:table-cell">Tendance</th>
                        <th className="px-4 sm:px-6 py-3 text-right font-semibold">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-bord">
                      {suite.map((c, i) => {
                        const tendance = tendances[c.libelle] ?? 0
                        return (
                          <tr key={c.libelle + i} className="hover:bg-surface/50 transition-colors">
                            <td className="px-4 sm:px-6 py-4 text-texte-faible font-bold tabular-nums">
                              {String(i + 4).padStart(2, '0')}
                            </td>
                            <td className="px-4 sm:px-6 py-4 max-w-[8rem] sm:max-w-none truncate">
                              <span className={cn('font-medium', c.elimine && 'line-through text-texte-faible')}>
                                {c.libelle}
                              </span>
                              {c.elimine && (
                                <span className="ml-2 inline-block text-xs px-2 py-0.5 rounded bg-danger/15 text-danger">
                                  {t('public.hors_course')}
                                </span>
                              )}
                            </td>
                            <td className="px-4 sm:px-6 py-4 text-center hidden sm:table-cell">
                              {tendance > 0 ? (
                                <span className="text-succes font-bold" title={`+${tendance} rang(s)`}>▲</span>
                              ) : tendance < 0 ? (
                                <span className="text-danger font-bold" title={`${tendance} rang(s)`}>▼</span>
                              ) : (
                                <span className="text-texte-faible">—</span>
                              )}
                            </td>
                            <td className="px-4 sm:px-6 py-4 text-right font-bold text-neon tabular-nums">
                              {c.penalite < 0 && <span className="text-danger text-xs mr-1 font-normal">{c.penalite}</span>}
                              {c.points}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {!aDesPoints && (
            <div className="max-w-2xl mx-auto text-center carte p-12">
              <Sparkles size={48} className="mx-auto text-neon/50 mb-4" />
              <p className="text-xl text-texte-doux mb-2">
                {t(data.classement.length === 0 ? 'public.aucun_classement' : 'public.podium_bientot')}
              </p>
              <p className="text-sm text-texte-faible">
                Le tournoi n'a pas encore commencé. Revenez bientôt pour suivre le classement en direct.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ---------- Poules ---------- */}
      {poules.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold text-neon mb-4">{t('public.poules')}</h2>
              <p className="text-xl text-texte-doux">Composition et classement par poule</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {poules.map((p) => (
                <div key={p.id} className="carte p-6 hover:border-neon/50 transition-all">
                  <h3 className="text-xl font-bold text-neon mb-4 pb-3 border-b border-bord">{p.nom}</h3>
                  <ol className="space-y-2">
                    {p.classement.map((c, i) => (
                      <li key={c.libelle + i} className="flex items-center gap-3 py-2">
                        <span className="w-6 text-texte-faible font-bold tabular-nums text-sm">
                          {avecPoints ? c.rang : '·'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className={cn('text-sm', c.elimine && 'line-through text-texte-faible')}>
                            {c.libelle}
                          </span>
                          {c.elimine && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-danger/15 text-danger">
                              {t('public.hors_course')}
                            </span>
                          )}
                          {c.departage && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-alerte/15 text-alerte">
                              {t('public.badge_barrage')}
                            </span>
                          )}
                        </div>
                        {avecPoints && (
                          <>
                            {c.penalite < 0 && <span className="text-xs text-danger">{c.penalite}</span>}
                            <span className={cn('font-bold tabular-nums', c.rang === 1 ? 'text-neon' : 'text-texte-doux')}>
                              {c.points}
                            </span>
                          </>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- CTA Inscription ---------- */}
      {r['inscriptions.ouvertes'] && (
        <section className="py-20 bg-gradient-to-br from-neon/10 via-transparent to-neon/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Votre équipe a-t-elle sa place en finale ?
            </h2>
            <p className="text-lg text-texte-doux mb-8">
              {r['inscriptions.date_limite'] && `Inscriptions ouvertes jusqu'au ${r['inscriptions.date_limite']}`}
              {data.classement.length > 0 && ` — places limitées`}
            </p>
            <Link
              to="/inscription"
              className="inline-flex items-center gap-2 px-10 py-5 bg-neon text-fond rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
            >
              <Users size={22} />
              S'inscrire maintenant
            </Link>
          </div>
        </section>
      )}

      {/* ---------- Prix ---------- */}
      <PrixSection reglages={r} meilleurMarqueur={data.meilleur_marqueur} />

      {/* ---------- Calendrier ---------- */}
      <section id="calendrier" className="py-20 bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-neon mb-4">{t('public.calendrier')}</h2>
            <p className="text-xl text-texte-doux">Le programme des manches</p>
          </div>

          {/* Sur grand ecran : la liste des manches a gauche, le calendrier a
              droite (colonne fixe, collee en haut au defilement). Sur mobile,
              l'ordre du DOM reprend le dessus : calendrier d'abord (vue
              d'ensemble rapide), liste detaillee juste apres. */}
          <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
            {/* Vue calendrier : un seul mois a la fois, feuilletable (mois
                precedent/suivant). Chaque jour porte un point par manche
                programmee ce jour-la, colore selon son statut — la meme
                donnee que la liste ci-contre, juste posee sur une grille. */}
            <div className="lg:order-2 mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none lg:sticky lg:top-24">
              <CalendrierManches manchesParJour={manchesParJour} moisInitial={moisCalendrier[0]} />

              {/* Legende : memes couleurs que la liste et que le reste du site
                  (a_venir = neon, en_cours = danger, terminee = texte-faible). */}
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-6 text-sm text-texte-doux">
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-neon" />{t('public.a_venir')}</span>
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-danger" />{t('public.en_cours')}</span>
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-texte-faible" />{t('public.termine')}</span>
              </div>
            </div>

            <div className="lg:order-1">
              {data.manches.length === 0 ? (
                <div className="max-w-2xl mx-auto carte p-12 text-center">
                  <CalendarDays size={48} className="mx-auto text-texte-faible/50 mb-4" />
                  <p className="text-lg text-texte-doux">{t('public.aucune_manche')}</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {data.manches.map((m, index) => (
                    <div
                      key={m.id}
                      className={cn(
                        'carte p-6 flex items-center gap-4 transition-all',
                        m.statut === 'en_cours' && 'border-danger/50 bg-danger/5',
                      )}
                    >
                      <div className="flex-shrink-0">
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center font-bold',
                          m.statut === 'en_cours' ? 'bg-danger/20 text-danger' :
                          m.statut === 'terminee' ? 'bg-surface text-texte-faible' :
                          'bg-neon/20 text-neon'
                        )}>
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-lg mb-1">{m.libelle}</p>
                        <div className="flex items-center gap-2">
                          {m.statut === 'en_cours' ? (
                            <span className="inline-flex items-center gap-1.5 text-sm text-danger">
                              <Radio size={14} className="anim-pulse" />
                              {t('public.en_cours')}
                            </span>
                          ) : m.statut === 'terminee' ? (
                            <span className="text-sm text-texte-faible">{t('public.termine')}</span>
                          ) : (
                            <span className="text-sm text-texte-doux">{t('public.a_venir')}</span>
                          )}
                        </div>
                      </div>
                      <div className={cn(
                        'w-3 h-3 rounded-full',
                        m.statut === 'en_cours' ? 'bg-danger anim-pulse' :
                        m.statut === 'terminee' ? 'bg-texte-faible' :
                        'bg-neon'
                      )} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Partager ---------- */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-neon mb-4">{t('public.partager')}</h2>
            <p className="text-xl text-texte-doux">{t('public.aide_partager')}</p>
          </div>

          <div className="max-w-2xl mx-auto carte p-8">
            <div className="grid gap-4 sm:grid-cols-3">
              <button
                onClick={copierMessage}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl py-4 font-semibold transition-all',
                  copie ? 'bg-succes text-fond' : 'bg-neon text-fond hover:opacity-90'
                )}
              >
                {copie ? <Check size={18} /> : <Copy size={18} />}
                {copie ? t('public.classement_copie') : t('public.copier_classement')}
              </button>
              <a
                href={lienWhatsapp}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl py-4 border-2 border-bord hover:border-neon transition-colors font-semibold"
              >
                <MessageCircle size={18} className="text-succes" />
                {t('public.partage_whatsapp')}
              </a>
              <a
                href={lienFacebook}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl py-4 border-2 border-bord hover:border-neon transition-colors font-semibold"
              >
                <IconeFacebook size={18} className="text-neon" />
                {t('public.partage_facebook')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Règlement ---------- */}
      {r['textes.reglement'] && (
        <section id="reglement" className="py-20 bg-surface/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold text-neon mb-4">{t('public.reglement')}</h2>
              <p className="text-xl text-texte-doux">Les règles du tournoi</p>
            </div>
            
            {/* Bouton pour ouvrir le règlement fullscreen */}
            <div className="text-center">
              <button
                onClick={() => setIsReglementOpen(true)}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-neon text-fond font-bold text-lg hover:opacity-90 transition-opacity"
              >
                <ScrollText size={24} />
                Consulter le règlement
              </button>
              <p className="mt-3 text-sm text-texte-faible">
                Cliquez pour découvrir les 7 articles essentiels du tournoi
              </p>
            </div>
          </div>
        </section>
      )}
      
      {/* Règlement Fullscreen */}
      <ReglementFullscreen
        texte={r['textes.reglement'] || ''}
        isOpen={isReglementOpen}
        onClose={() => setIsReglementOpen(false)}
      />

      {/* ---------- Participants ---------- */}
      {data.participants.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold text-neon mb-4">
                {t('public.participants')}
              </h2>
              <p className="text-xl text-texte-doux">{data.participants.length} joueurs inscrits</p>
            </div>
            <div className="max-w-5xl mx-auto flex flex-wrap gap-3 justify-center">
              {data.participants.map((p, i) => (
                <span
                  key={i}
                  className="px-4 py-2 rounded-lg bg-surface border border-bord text-sm text-texte-doux hover:border-neon/50 transition-colors"
                >
                  {p.nom_affiche}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Promo NovafriQ / Gextimo ---------- */}
      {r['promo.actif'] && r['promo.titre'] && (
        <section className="py-20 bg-gradient-to-br from-neon/5 via-transparent to-neon/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="carte p-10 text-center">
              <div className="inline-flex items-center gap-2 mb-4">
                <Rocket size={20} className="text-neon" />
                <p className="text-lg font-bold text-neon">{r['promo.titre']}</p>
              </div>
              <div className="text-texte-doux mb-6 max-w-2xl mx-auto">
                <Apercu texte={r['promo.texte'] ?? ''} />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {r['promo.lien_gextimo'] && (
                  <a
                    href={avecUtm(r['promo.lien_gextimo'], 'promo')}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-neon text-fond rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    {r['promo.cta']} <ExternalLink size={16} />
                  </a>
                )}
                {r['promo.lien_facebook'] && (
                  <a
                    href={avecUtm(r['promo.lien_facebook'], 'promo')}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-bord rounded-lg hover:border-neon transition-colors"
                  >
                    <IconeFacebook size={16} /> {t('public.promo_facebook')}
                  </a>
                )}
                {r['promo.lien_novafriq'] && (
                  <a
                    href={avecUtm(r['promo.lien_novafriq'], 'promo')}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-bord rounded-lg hover:border-neon transition-colors"
                  >
                    {t('public.promo_novafriq')}
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <SiteFooter r={r} />
    </div>
  )
}

function TitreSection({ icone: Icone, libelle }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icone size={14} className="text-neon-sourd" />
      <h2 className="etiquette text-texte-faible">{libelle}</h2>
      <span className="flex-1 h-px bg-gradient-to-r from-bord to-transparent" />
    </div>
  )
}

const JOURS_SEMAINE = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

/**
 * Grille d'un mois, semaine commencant le lundi. `null` remplit les cases
 * avant le 1er du mois pour que les colonnes restent alignees sur le bon jour
 * de semaine.
 */
function casesDuMois(annee, mois) {
  const decalage = (new Date(annee, mois, 1).getDay() + 6) % 7
  const nbJours = new Date(annee, mois + 1, 0).getDate()
  return [...Array(decalage).fill(null), ...Array.from({ length: nbJours }, (_, i) => i + 1)]
}

/**
 * Calendrier feuilletable : un seul mois affiche a la fois, avec des fleches
 * pour naviguer vers le mois precedent/suivant — plutot que d'empiler
 * plusieurs grilles cote a cote. Chaque jour qui porte une manche affiche un
 * point par manche, colore selon son statut — exactement les memes couleurs
 * que la liste juste en dessous et que le reste du site (a_venir = neon,
 * en_cours = danger, terminee = texte-faible). La position vient uniquement
 * de `date_prevue`, tel que configure dans l'admin : rien n'est fige ici.
 */
function CalendrierManches({ manchesParJour, moisInitial }) {
  // Par defaut, le mois de la premiere manche datee ; sinon le mois en cours.
  const depart = moisInitial
    ? { annee: Number(moisInitial.split('-')[0]), mois: Number(moisInitial.split('-')[1]) - 1 }
    : { annee: new Date().getFullYear(), mois: new Date().getMonth() }
  const [{ annee, mois }, setVue] = useState(depart)

  const changerMois = (delta) => setVue(({ annee, mois }) => {
    const d = new Date(annee, mois + delta, 1)
    return { annee: d.getFullYear(), mois: d.getMonth() }
  })

  const nomMois = new Date(annee, mois, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="carte p-5">
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={() => changerMois(-1)} aria-label="Mois précédent"
                className="p-1.5 rounded-lg text-texte-doux hover:text-neon hover:bg-surface transition-colors">
          <ChevronLeft size={18} />
        </button>
        <p className="titre font-semibold capitalize">{nomMois}</p>
        <button type="button" onClick={() => changerMois(1)} aria-label="Mois suivant"
                className="p-1.5 rounded-lg text-texte-doux hover:text-neon hover:bg-surface transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {JOURS_SEMAINE.map((j, i) => (
          <span key={i} className="text-center text-[10px] text-texte-faible">{j}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {casesDuMois(annee, mois).map((jour, i) => {
          if (jour === null) return <div key={i} />

          const cle = `${annee}-${String(mois + 1).padStart(2, '0')}-${String(jour).padStart(2, '0')}`
          const manches = manchesParJour[cle] || []

          return (
            <div key={i}
                 title={manches.map((m) => m.libelle).join(', ') || undefined}
                 className={cn(
                   'aspect-square rounded-lg flex flex-col items-center justify-center gap-1',
                   manches.length > 0 && 'bg-surface border border-bord',
                 )}>
              <span className={cn('text-xs', manches.length > 0 ? 'font-semibold text-texte' : 'text-texte-faible')}>
                {jour}
              </span>
              {manches.length > 0 && (
                <div className="flex gap-0.5">
                  {manches.slice(0, 4).map((m) => (
                    <span key={m.id} className={cn('w-1.5 h-1.5 rounded-full',
                      m.statut === 'en_cours' ? 'bg-danger anim-pulse'
                        : m.statut === 'terminee' ? 'bg-texte-faible'
                        : 'bg-neon')} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
