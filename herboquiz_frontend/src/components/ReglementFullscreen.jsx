import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Users,
  Trophy,
  Clock,
  Target,
  Ban,
  Scale,
  HeartHandshake,
  ChevronDown,
  ChevronUp,
  ScrollText,
  X,
} from 'lucide-react'

/**
 * Composant fullscreen pour afficher le règlement
 * Style "terrain de sport" avec scroll vertical
 * Basé sur le design NEXUS ARENA
 */
export default function ReglementFullscreen({ texte, isOpen, onClose }) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const lockRef = useRef(false)
  const touchStartY = useRef(null)
  const containerRef = useRef(null)

  // Parser le règlement en 7 sections basé sur les numéros (1., 2., 3., etc.)
  const parseRules = (text) => {
    if (!text || text.trim().length === 0) {
      // Règles par défaut si pas de texte
      const icons = [Users, Trophy, Clock, Target, Ban, Scale, HeartHandshake]
      return Array.from({ length: 7 }, (_, i) => ({
        label: `ARTICLE ${i + 1}`,
        title: `Règle ${i + 1}`,
        body: 'Contenu du règlement à venir...',
        icon: icons[i],
        flag: i === 6, // Carton rouge sur la dernière règle (index 6 = règle 7)
      }))
    }
    
    const icons = [Users, Trophy, Clock, Target, Ban, Scale, HeartHandshake]
    
    // Diviser par numéros au début : "1. ", "2. ", etc.
    // Split sur le pattern "\n" suivi de chiffre(s) et point
    const parts = text.split(/\n(?=\d+\.\s)/)
    
    const rules = []
    
    for (const part of parts) {
      const trimmed = part.trim()
      if (!trimmed) continue
      
      // Extraire le numéro de règle
      const match = trimmed.match(/^(\d+)\.\s+(.+)$/s)
      if (match) {
        const ruleNumber = parseInt(match[1])
        const content = match[2].trim()
        
        if (ruleNumber >= 1 && ruleNumber <= 7 && content) {
          // Le contenu complet est le titre + corps
          // Pour l'affichage, on prend les premiers mots comme titre
          const sentences = content.split(/\.\s+/)
          const title = sentences[0] + '.'
          const body = sentences.slice(1).join('. ').trim() || content
          
          rules.push({
            label: `ARTICLE ${ruleNumber}`,
            title: title.length > 150 ? title.substring(0, 147) + '...' : title,
            body: body.substring(0, 400).trim() + (body.length > 400 ? '...' : ''),
            icon: icons[ruleNumber - 1],
            flag: ruleNumber === 7, // Carton rouge sur la règle 7 (dernière)
          })
        }
      }
    }
    
    // Si on n'a pas trouvé 7 règles avec les numéros, essayer headers markdown
    if (rules.length < 7) {
      const markdownSections = text.split(/(?=^#{1,3}\s+)/m).filter(s => s.trim())
      
      if (markdownSections.length >= 7) {
        return markdownSections.slice(0, 7).map((section, i) => {
          const lines = section.split('\n').filter(l => l.trim())
          const titleLine = lines[0].replace(/^#{1,3}\s*/, '').trim()
          const bodyLines = lines.slice(1).filter(l => l.trim())
          const body = bodyLines.join(' ')
          
          return {
            label: `ARTICLE ${i + 1}`,
            title: titleLine || `Règle ${i + 1}`,
            body: body.substring(0, 400).trim() + (body.length > 400 ? '...' : ''),
            icon: icons[i],
            flag: i === 6, // Dernière règle
          }
        })
      }
      
      // Si toujours pas assez, diviser le texte en paragraphes
      if (rules.length < 7) {
        const paragraphs = text.split(/\n\n+/).filter(p => p.trim())
        const parasPerRule = Math.ceil(paragraphs.length / 7)
        
        const newRules = []
        for (let i = 0; i < 7; i++) {
          const start = i * parasPerRule
          const end = start + parasPerRule
          const ruleParas = paragraphs.slice(start, end)
          
          if (ruleParas.length > 0) {
            const fullText = ruleParas.join(' ')
            const sentences = fullText.split(/\.\s+/)
            const title = sentences[0] + '.'
            const body = sentences.slice(1).join('. ')
            
            newRules.push({
              label: `ARTICLE ${i + 1}`,
              title: title.substring(0, 150),
              body: body.substring(0, 400).trim() + (body.length > 400 ? '...' : ''),
              icon: icons[i],
              flag: i === 6, // Dernière règle
            })
          }
        }
        
        if (newRules.length > 0) {
          return newRules
        }
      }
    }
    
    // Compléter jusqu'à 7 règles si nécessaire
    while (rules.length < 7) {
      const i = rules.length
      rules.push({
        label: `ARTICLE ${i + 1}`,
        title: `Règle ${i + 1}`,
        body: 'Cette règle sera définie prochainement.',
        icon: icons[i],
        flag: i === 6, // Dernière règle
      })
    }
    
    // Limiter à 7 règles maximum
    return rules.slice(0, 7)
  }

  const RULES = parseRules(texte)
  const TOTAL = RULES.length + 2 // intro + 7 rules + outro

  const goTo = useCallback(
    (next) => {
      if (next < 0 || next > TOTAL - 1) return
      if (lockRef.current) return
      lockRef.current = true
      setDirection(next > step ? 1 : -1)
      setStep(next)
      setTimeout(() => {
        lockRef.current = false
      }, 700)
    },
    [step, TOTAL]
  )

  useEffect(() => {
    if (!isOpen) return

    const onWheel = (e) => {
      e.preventDefault()
      if (Math.abs(e.deltaY) < 8) return
      goTo(step + (e.deltaY > 0 ? 1 : -1))
    }

    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault()
        goTo(step + 1)
      }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        goTo(step - 1)
      }
    }

    const onTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY
    }

    const onTouchEnd = (e) => {
      if (touchStartY.current === null) return
      const delta = touchStartY.current - e.changedTouches[0].clientY
      if (Math.abs(delta) > 40) goTo(step + (delta > 0 ? 1 : -1))
      touchStartY.current = null
    }

    const node = containerRef.current
    if (!node) return

    node.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    node.addEventListener('touchstart', onTouchStart, { passive: true })
    node.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      node.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      node.removeEventListener('touchstart', onTouchStart)
      node.removeEventListener('touchend', onTouchEnd)
    }
  }, [step, goTo, isOpen, onClose])

  // Reset step when opening
  useEffect(() => {
    if (isOpen) {
      setStep(0)
    }
  }, [isOpen])

  if (!isOpen) return null

  const isIntro = step === 0
  const isOutro = step === TOTAL - 1
  const ruleIndex = step - 1

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 w-full h-screen overflow-hidden select-none"
      style={{
        background:
          'repeating-linear-gradient(115deg, #1c4d34 0px, #1c4d34 64px, #1a4630 64px, #1a4630 128px)',
        fontFamily: "'Inter', sans-serif",
        color: '#f4f1e4',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Space+Mono:wght@400;700&family=Inter:wght@400;500&display=swap');
        .fr { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
        .mono { font-family: 'Space Mono', monospace; letter-spacing: 0.16em; }
        @keyframes cardFlipIn {
          0% { opacity: 0; transform: perspective(1200px) rotateX(10deg) translateY(28px); }
          100% { opacity: 1; transform: perspective(1200px) rotateX(0deg) translateY(0); }
        }
        @keyframes cardFlipInBack {
          0% { opacity: 0; transform: perspective(1200px) rotateX(-10deg) translateY(-28px); }
          100% { opacity: 1; transform: perspective(1200px) rotateX(0deg) translateY(0); }
        }
        .enter-fwd { animation: cardFlipIn 0.6s cubic-bezier(0.22,1,0.36,1) both; transform-origin: top center; }
        .enter-back { animation: cardFlipInBack 0.6s cubic-bezier(0.22,1,0.36,1) both; transform-origin: bottom center; }
        @keyframes redCardSlam {
          0% { opacity: 0; transform: translate(-50%, -60%) rotate(-14deg) scale(0.7); }
          55% { opacity: 1; transform: translate(-50%, -50%) rotate(-6deg) scale(1.06); }
          75% { transform: translate(-50%, -50%) rotate(-9deg) scale(1); }
          100% { opacity: 1; transform: translate(-50%, -50%) rotate(-8deg) scale(1); }
        }
        .red-card { animation: redCardSlam 0.7s 0.15s cubic-bezier(0.34,1.56,0.64,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .enter-fwd, .enter-back, .red-card { animation: none !important; }
        }
      `}</style>

      {/* Chalk boundary lines */}
      <div
        className="absolute inset-3 sm:inset-5 border pointer-events-none z-10"
        style={{ borderColor: 'rgba(244,241,228,0.28)' }}
      />
      <div
        className="absolute left-1/2 top-3 bottom-3 sm:top-5 sm:bottom-5 w-px pointer-events-none z-10 hidden md:block"
        style={{ background: 'rgba(244,241,228,0.16)' }}
      />

      {/* Progress: pitch-marking ticks */}
      <div className="absolute right-4 sm:right-7 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2.5">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <button
            key={i}
            aria-label={`Aller à l'étape ${i + 1}`}
            onClick={() => goTo(i)}
            className="transition-all duration-300 focus:outline-none"
            style={{
              width: i === step ? '16px' : '8px',
              height: '2px',
              background: i === step ? '#e6b800' : 'rgba(244,241,228,0.3)',
            }}
          />
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:right-8 z-40 w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
        style={{ color: 'rgba(244,241,228,0.7)' }}
        aria-label="Fermer"
      >
        <X size={18} />
      </button>

      <div
        key={step}
        className={direction === 1 ? 'enter-fwd' : 'enter-back'}
        style={{ height: '100%' }}
      >
        {isIntro && <IntroScreen onStart={() => goTo(1)} />}
        {!isIntro && !isOutro && (
          <RuleScreen rule={RULES[ruleIndex]} index={ruleIndex} />
        )}
        {isOutro && <OutroScreen onRestart={() => goTo(0)} onClose={onClose} />}
      </div>

      {step > 0 && (
        <button
          onClick={() => goTo(step - 1)}
          className="absolute top-14 left-1/2 -translate-x-1/2 z-30 transition-colors focus:outline-none"
          style={{ color: 'rgba(244,241,228,0.3)' }}
          aria-label="Étape précédente"
        >
          <ChevronUp size={14} />
        </button>
      )}
    </div>
  )
}

function IntroScreen({ onStart }) {
  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center px-4 text-center">
      <span className="mono text-[10px] mb-3" style={{ color: '#e6b800' }}>
        RÈGLEMENT OFFICIEL
      </span>
      <h1
        className="fr font-bold uppercase leading-[0.92] mb-4"
        style={{ fontSize: 'clamp(2rem, 8vw, 5rem)' }}
      >
        Le règlement
        <br />
        du tournoi
      </h1>
      <p
        className="max-w-md text-sm sm:text-base mb-8"
        style={{ color: 'rgba(244,241,228,0.6)' }}
      >
        Sept articles. Un par écran, comme une feuille de match qu'on tourne
        page après page.
      </p>
      <button
        onClick={onStart}
        className="mono text-xs px-5 py-2.5 hover:bg-white/5 transition-colors"
        style={{ border: '1px solid rgba(230,184,0,0.5)', color: '#e6b800' }}
      >
        COUP D'ENVOI →
      </button>
    </div>
  )
}

function RuleScreen({ rule, index }) {
  const Icon = rule.icon
  return (
    <div className="relative h-full w-full flex items-center px-4 sm:px-8 md:px-14">
      {/* Giant jersey-style number */}
      <div
        className="hidden sm:block select-none pointer-events-none fr font-bold flex-shrink-0"
        style={{
          fontSize: 'clamp(7rem, 18vw, 14rem)',
          lineHeight: 1,
          color: 'rgba(244,241,228,0.08)',
          width: '32%',
          textAlign: 'center',
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </div>

      <div className="relative z-10 max-w-xl w-full">
        <div className="flex items-center gap-2 mb-3">
          <Icon size={18} color="#e6b800" />
          <span className="mono text-[10px]" style={{ color: 'rgba(244,241,228,0.55)' }}>
            {rule.label}
          </span>
        </div>

        <h2
          className="fr font-bold leading-[1.02] mb-4"
          style={{ fontSize: 'clamp(1.6rem, 4.5vw, 2.75rem)' }}
        >
          {rule.title}
        </h2>

        <div className="w-12 h-px mb-4" style={{ background: '#e6b800' }} />

        <p
          className="text-sm sm:text-base leading-relaxed"
          style={{ color: 'rgba(244,241,228,0.75)' }}
        >
          {rule.body}
        </p>
      </div>

      {/* Carton rouge - positionné à droite pour ne pas chevaucher le texte */}
      {rule.flag && (
        <div
          className="red-card absolute z-20"
          style={{
            right: 'clamp(20px, 8%, 80px)',
            top: '50%',
            transform: 'translateY(-50%) rotate(-8deg)',
            width: 'clamp(60px, 8vw, 96px)',
            height: 'clamp(84px, 11vw, 132px)',
            background: 'linear-gradient(155deg, #d21f2b 0%, #a3151f 100%)',
            borderRadius: '5px',
            boxShadow: '0 16px 32px rgba(0,0,0,0.4)',
          }}
        />
      )}
    </div>
  )
}

function OutroScreen({ onRestart, onClose }) {
  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center px-4 text-center">
      <Trophy size={32} color="#e6b800" className="mb-4" />
      <h2
        className="fr font-bold leading-[0.95] mb-3"
        style={{ fontSize: 'clamp(1.75rem, 6.5vw, 3.5rem)' }}
      >
        Coup de sifflet,
        <br />
        c'est parti.
      </h2>
      <p
        className="max-w-md text-sm sm:text-base mb-8"
        style={{ color: 'rgba(244,241,228,0.6)' }}
      >
        Sept articles, un seul objectif : que la meilleure équipe remporte le
        tournoi.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onRestart}
          className="mono text-xs px-5 py-2.5 hover:bg-white/5 transition-colors"
          style={{
            border: '1px solid rgba(244,241,228,0.3)',
            color: 'rgba(244,241,228,0.75)',
          }}
        >
          ↑ REVOIR LE RÈGLEMENT
        </button>
        <button
          onClick={onClose}
          className="mono text-xs px-5 py-2.5 hover:bg-white/5 transition-colors"
          style={{ border: '1px solid rgba(230,184,0,0.5)', color: '#e6b800' }}
        >
          FERMER
        </button>
      </div>
    </div>
  )
}
