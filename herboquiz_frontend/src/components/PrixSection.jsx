import { useEffect, useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

// SVG Silhouette (personnage abstrait)
function Silhouette({ className }) {
  return (
    <svg viewBox="0 0 120 220" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="sil-metal" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#e6ecf3" />
          <stop offset="60%" stopColor="#b8c2cf" />
          <stop offset="100%" stopColor="#f5f7fa" />
        </linearGradient>
        <linearGradient id="sil-shine" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id="sil-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#sil-glow)">
        <circle cx="60" cy="30" r="18" fill="url(#sil-metal)" />
        <rect x="55" y="46" width="10" height="10" fill="url(#sil-metal)" />
        <path
          d="M32 62 C 40 58, 80 58, 88 62 L 92 130 C 92 138, 78 144, 60 144 C 42 144, 28 138, 28 130 Z"
          fill="url(#sil-metal)"
        />
        <path d="M30 68 C 22 82, 22 110, 28 128 L 34 126 C 30 110, 30 88, 36 74 Z" fill="url(#sil-metal)" />
        <path d="M90 68 C 98 82, 98 110, 92 128 L 86 126 C 90 110, 90 88, 84 74 Z" fill="url(#sil-metal)" />
        <path d="M40 142 L 46 210 L 58 210 L 58 148 Z" fill="url(#sil-metal)" />
        <path d="M80 142 L 74 210 L 62 210 L 62 148 Z" fill="url(#sil-metal)" />
        <path d="M50 20 C 52 14, 68 14, 70 20 L 68 40 C 65 44, 55 44, 52 40 Z" fill="url(#sil-shine)" opacity="0.6" />
      </g>
    </svg>
  )
}

// SVG Couronne (pour le 1er)
function Crown({ className }) {
  return (
    <svg viewBox="0 0 120 70" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="crown-g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fff2b8" />
          <stop offset="50%" stopColor="#f5c451" />
          <stop offset="100%" stopColor="#8a5a10" />
        </linearGradient>
        <filter id="crown-glow">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>
      <g>
        <ellipse cx="60" cy="60" rx="42" ry="6" fill="#f5c451" opacity="0.35" filter="url(#crown-glow)" />
        <path
          d="M10 55 L 22 22 L 38 44 L 60 12 L 82 44 L 98 22 L 110 55 Z"
          fill="url(#crown-g)"
          stroke="#fff2b8"
          strokeWidth="0.8"
        />
        <rect x="10" y="52" width="100" height="8" rx="2" fill="url(#crown-g)" />
        <circle cx="22" cy="22" r="3" fill="#fff" />
        <circle cx="60" cy="12" r="4" fill="#fff" />
        <circle cx="98" cy="22" r="3" fill="#fff" />
      </g>
    </svg>
  )
}

/**
 * Composant CountUp pour animer les nombres
 */
function CountUp({ to, duration = 2.2, delay = 0, start }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const [val, setVal] = useState(0)
  const played = useRef(false)

  useEffect(() => {
    const shouldStart = start ?? inView
    if (!shouldStart || played.current) return
    played.current = true

    const startTime = Date.now() + delay * 1000
    const animate = () => {
      const now = Date.now()
      const elapsed = Math.max(0, now - startTime)
      const progress = Math.min(elapsed / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setVal(Math.round(to * eased))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    const timer = setTimeout(() => {
      requestAnimationFrame(animate)
    }, delay * 1000)

    return () => clearTimeout(timer)
  }, [inView, start, to, duration, delay])

  return <span ref={ref}>{val.toLocaleString('fr-FR')}</span>
}

/**
 * Podium pour une place (1er, 2e, 3e)
 */
function Podium({ rank, label, amount, heightVh, color, colorDeep, glow, delay, active, hovered, setHovered, devise }) {
  const isHovered = hovered === rank
  const dimmed = hovered !== null && hovered !== rank
  const isChampion = rank === 1

  return (
    <motion.div
      className="relative flex flex-col items-center"
      style={{ perspective: 1200 }}
      onHoverStart={() => setHovered(rank)}
      onHoverEnd={() => setHovered(null)}
      animate={{
        opacity: dimmed ? 0.55 : 1,
        z: isHovered ? 40 : 0,
        scale: isHovered ? 1.04 : 1,
      }}
      transition={{ type: 'spring', stiffness: 180, damping: 22 }}
    >
      {/* Spotlight cone above podium */}
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-40 w-[200%] h-56"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${glow} 0%, transparent 65%)`,
          filter: 'blur(6px)',
          opacity: active ? (isHovered ? 1 : 0.75) : 0,
          transition: 'opacity 0.6s ease',
          mixBlendMode: 'screen',
        }}
      />

      {/* Character */}
      <motion.div
        className="relative z-10"
        initial={{ y: -320, opacity: 0 }}
        animate={active ? { y: 0, opacity: 1 } : { y: -320, opacity: 0 }}
        transition={{
          delay: delay + 0.2,
          type: 'spring',
          stiffness: 140,
          damping: 14,
          mass: 0.8,
        }}
      >
        {/* idle breathing */}
        <motion.div
          animate={{
            y: [0, -4, 0],
            rotateZ: isHovered ? [-1.5, 1.5, -1.5] : [-0.4, 0.4, -0.4],
          }}
          transition={{ duration: isHovered ? 3 : 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '50% 90%' }}
        >
          {isChampion && (
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 -top-14"
              animate={{ y: [0, -6, 0], rotateZ: [-2, 2, -2] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Crown className="w-12 sm:w-16 md:w-20 h-auto drop-shadow-[0_0_18px_rgba(245,196,81,0.7)]" />
            </motion.div>
          )}
          <Silhouette className="w-14 sm:w-20 md:w-24 lg:w-28 h-auto drop-shadow-[0_10px_18px_rgba(0,0,0,0.55)]" />
        </motion.div>
      </motion.div>

      {/* Podium block */}
      <motion.div
        className="relative w-20 sm:w-28 md:w-40 lg:w-48"
        style={{ height: `${heightVh}vh`, transformStyle: 'preserve-3d' }}
        initial={{ y: 260, opacity: 0, rotateX: 8 }}
        animate={active ? { y: 0, opacity: 1, rotateX: 0 } : {}}
        transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* top face */}
        <div
          className="absolute inset-x-0 top-0 h-6 rounded-t-sm"
          style={{
            background: `linear-gradient(180deg, ${color}, ${colorDeep})`,
            boxShadow: `0 0 24px ${glow}, inset 0 1px 0 rgba(255,255,255,0.6)`,
          }}
        />
        {/* front face — glass reflective */}
        <div
          className="absolute inset-x-0 top-6 bottom-0 overflow-hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 40%, rgba(0,0,0,0.35) 100%), linear-gradient(180deg, #0b1734 0%, #050b1e 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderTop: 'none',
            boxShadow: `inset 0 40px 60px -30px ${glow}, inset 0 -40px 60px -30px rgba(0,0,0,0.7)`,
          }}
        >
          {/* animated reflection sweep */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background: `linear-gradient(115deg, transparent 40%, ${glow} 50%, transparent 60%)`,
              backgroundSize: '300% 100%',
              animation: 'rw-shimmer 7s linear infinite',
              mixBlendMode: 'screen',
            }}
          />
          {/* rank badge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 sm:gap-2 px-1">
            <span
              className="text-[7px] sm:text-[9px] md:text-[10px] tracking-[0.2em] sm:tracking-[0.4em] font-medium uppercase"
              style={{ color, textShadow: `0 0 12px ${glow}` }}
            >
              {label}
            </span>
            <span
              className="text-sm sm:text-xl md:text-3xl lg:text-4xl font-bold tabular-nums leading-none"
              style={{
                background: `linear-gradient(180deg, #ffffff, ${color})`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                textShadow: isHovered ? `0 0 24px ${glow}` : 'none',
                filter: isHovered ? 'brightness(1.15)' : 'brightness(1)',
                transition: 'all 0.4s ease',
              }}
            >
              <CountUp to={amount} start={active} delay={delay + 0.3} duration={1.1} />
            </span>
            <span className="text-[7px] sm:text-[9px] md:text-[10px] tracking-[0.2em] sm:tracking-[0.35em] text-white/60" style={{ textShadow: `0 0 8px ${glow}` }}>
              {devise}
            </span>
          </div>
          {/* edge lights */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-px"
            style={{ background: `linear-gradient(180deg, ${color}, transparent)`, boxShadow: `0 0 12px ${glow}` }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-px"
            style={{ background: `linear-gradient(180deg, ${color}, transparent)`, boxShadow: `0 0 12px ${glow}` }}
          />
        </div>

        {/* floor reflection */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -bottom-24 w-[110%] h-24"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.06), transparent 70%), linear-gradient(180deg, #0b1734, transparent)',
            transform: 'scaleY(-1)',
            opacity: 0.35,
            filter: 'blur(2px)',
            maskImage: 'linear-gradient(180deg, black, transparent)',
            WebkitMaskImage: 'linear-gradient(180deg, black, transparent)',
          }}
        />
      </motion.div>
    </motion.div>
  )
}

/**
 * Un chiffre qui bascule mécaniquement, façon panneau d'affichage de gare —
 * defile sur quelques valeurs aleatoires avant de se figer sur la bonne.
 * Les caracteres non numeriques (espace des milliers) restent immobiles.
 */
function TuileChiffre({ car, actif, delai }) {
  const estChiffre = /[0-9]/.test(car)
  const [valeur, setValeur] = useState(estChiffre ? '0' : car)
  const joue = useRef(false)

  useEffect(() => {
    if (!estChiffre || !actif || joue.current) return
    joue.current = true

    const sequence = [...Array.from({ length: 3 }, () => String(Math.floor(Math.random() * 10))), car]
    let i = 0
    const t = setTimeout(function tourner() {
      setValeur(sequence[i])
      i++
      if (i < sequence.length) setTimeout(tourner, 85)
    }, delai)

    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actif])

  if (!estChiffre) {
    return <span className="inline-block w-[0.35em] text-center">{car}</span>
  }

  return (
    <span className="relative inline-block w-[0.62em] h-[1.2em] overflow-hidden" style={{ perspective: 200 }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={valeur}
          initial={{ rotateX: -100, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 100, opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformOrigin: '50% 50%' }}
        >
          {valeur}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/**
 * Meilleur marqueur — plaque de tableau d'affichage.
 *
 * Change totalement de registre par rapport au podium (silhouettes/glace) :
 * un panneau de score mecanique, comme un vrai tableau de stade. Volontairement
 * toujours sombre, quel que soit le theme de la page — au meme titre que les
 * blocs podium juste au-dessus, c'est un objet (un panneau), pas un fond de
 * page : il ne doit pas changer de couleur avec la preference du visiteur.
 */
function MeilleurMarqueur({ montant, devise, meilleurMarqueur }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const chiffres = montant.toLocaleString('fr-FR').split('')

  return (
    <motion.div
      ref={ref}
      className="relative mx-auto mt-32 max-w-md"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="etiquette text-center text-neon-sourd mb-4">Bonus d'honneur</p>

      <div
        className="relative overflow-hidden rounded-xl px-6 py-8 sm:px-10 sm:py-10"
        style={{
          background: 'linear-gradient(180deg, #1b2130 0%, #11151f 100%)',
          border: '1px solid rgba(245,196,81,0.25)',
          boxShadow: '0 20px 50px -20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Ruban */}
        <div
          className="absolute -left-11 top-5 w-40 rotate-[-45deg] text-center text-[10px] font-bold tracking-[0.2em] py-1"
          style={{ background: '#f5c451', color: '#191008' }}
        >
          MVP
        </div>

        <p className="text-center text-[10px] tracking-[0.35em] uppercase mb-4" style={{ color: '#f5c451' }}>
          Meilleur marqueur
        </p>

        <div
          className="flex items-center justify-center gap-0.5 font-mono font-bold tabular-nums"
          style={{ color: '#f5c451', fontSize: 'clamp(2.25rem, 6vw, 3rem)', textShadow: '0 0 18px rgba(245,196,81,0.4)' }}
        >
          {chiffres.map((car, i) => (
            <TuileChiffre key={i} car={car} actif={inView} delai={120 + i * 80} />
          ))}
          <span className="ml-2 text-sm sm:text-base tracking-widest" style={{ color: 'rgba(245,196,81,0.7)' }}>
            {devise}
          </span>
        </div>

        {meilleurMarqueur && (
          <motion.p
            className="mt-5 text-center text-sm"
            style={{ color: 'rgba(255,255,255,0.65)' }}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            {meilleurMarqueur.libelle} — {meilleurMarqueur.points} pts
          </motion.p>
        )}
      </div>

      <p className="mt-4 text-center text-sm text-texte-faible leading-relaxed">
        Calculé sur les poules — récompense le joueur qui a su marquer, même sans atteindre la finale.
      </p>
    </motion.div>
  )
}

/**
 * Section Prix avec animation cinématographique
 */
export default function PrixSection({ reglages, meilleurMarqueur }) {
  const sectionRef = useRef(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.25 })
  const [figuresActive, setFiguresActive] = useState(false)
  const [hovered, setHovered] = useState(null)

  const devise = reglages['prix.devise'] || 'FCFA'
  const montant = (v) => Number(v || 0)

  const PODIUMS = [
    {
      rank: 2,
      label: '2e',
      amount: montant(reglages['prix.deuxieme']),
      heightVh: 15,
      color: '#dbe2ea',
      colorDeep: '#8a97a8',
      glow: 'rgba(219,226,234,0.55)',
      delay: 0.15,
    },
    {
      rank: 1,
      label: '1er',
      amount: montant(reglages['prix.premier']),
      heightVh: 22,
      color: '#f5c451',
      colorDeep: '#b8862a',
      glow: 'rgba(245,196,81,0.7)',
      delay: 0,
    },
    {
      rank: 3,
      label: '3e',
      amount: montant(reglages['prix.troisieme']),
      heightVh: 11,
      color: '#d08454',
      colorDeep: '#7a4520',
      glow: 'rgba(208,132,84,0.5)',
      delay: 0.3,
    },
  ]

  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => setFiguresActive(true), 300)
    return () => clearTimeout(t)
  }, [inView])

  return (
    <section ref={sectionRef} className="relative min-h-screen w-full overflow-hidden bg-fond">
      {/* Rayons de lumiere discrets : coherents avec le halo ambiant du reste du site,
          dans les deux themes (pas de fond fige, pas de mix-blend-mode qui vire au gris
          sur un fond clair). */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute top-[-10%] h-[130%] w-[180px] animate-ray"
            style={{
              left: `${15 + i * 22}%`,
              background: 'linear-gradient(180deg, rgba(34,211,238,0.12), transparent 70%)',
              transform: `rotate(${-6 + i * 4}deg)`,
              filter: 'blur(20px)',
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${8 + i * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pt-20 sm:pt-28 pb-24 sm:pb-40">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="text-center"
        >
          <span className="etiquette inline-block text-or mb-6">
            Cérémonie des Champions
          </span>
          <h2 className="text-5xl md:text-7xl font-light tracking-tight text-texte">Récompenses</h2>
          <p className="mt-6 text-texte-doux text-base md:text-lg">
            Les honneurs qui attendent les meilleurs esprits du tournoi.
          </p>
        </motion.div>

        {/* Stage */}
        <div className="relative mt-24" style={{ perspective: 1400, transformStyle: 'preserve-3d' }}>
          {/* Floor */}
          <div
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-0 w-[120%] h-64"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(34,211,238,0.18), transparent 70%)',
              transform: 'translateY(50%)',
              filter: 'blur(10px)',
            }}
          />
          <div className="flex items-end justify-center gap-2 sm:gap-6 md:gap-10 relative">
            {PODIUMS.map((p) => (
              <Podium
                key={p.rank}
                {...p}
                active={figuresActive}
                hovered={hovered}
                setHovered={setHovered}
                devise={devise}
              />
            ))}
          </div>
        </div>

        {/* Meilleur marqueur */}
        {Number(reglages['prix.meilleur_marqueur']) > 0 && (
          <MeilleurMarqueur
            montant={montant(reglages['prix.meilleur_marqueur'])}
            devise={devise}
            meilleurMarqueur={meilleurMarqueur}
          />
        )}

        {/* Note de versement */}
        {reglages['prix.versement'] && (
          <p className="mt-16 text-center text-xs tracking-[0.3em] text-texte-faible uppercase">{reglages['prix.versement']}</p>
        )}
      </div>
    </section>
  )
}
