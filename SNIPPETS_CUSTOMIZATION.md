# 🎨 Snippets de Personnalisation

Guide rapide pour personnaliser certains aspects du nouveau design.

## 🎨 Modifier les Couleurs

### Changer le néon principal
```css
/* Dans index.css */
@theme {
  --color-neon: #FF22D3;        /* Rose néon au lieu de bleu */
  --color-neon-fort: #FF7DE7;   /* Rose clair */
  --color-neon-sourd: #90074E;  /* Rose sombre */
}
```

### Ajouter une couleur d'accent
```css
@theme {
  --color-accent: #A78BFA;      /* Violet */
}
```

```jsx
// Dans PublicPage.jsx
<div className="text-[#A78BFA]">Texte violet</div>
```

## 📐 Modifier la Navigation

### Changer la hauteur de la navigation
```jsx
// Dans PublicPage.jsx - section Navigation
<div className="flex items-center justify-between h-20"> {/* était h-16 */}
```

### Ajouter un lien dans la navigation
```jsx
<div className="hidden md:flex items-center gap-6">
  <a href="#categories">Catégories</a>
  <a href="#format">Le format</a>
  <a href="#classement">Classement</a>
  <a href="#reglement">Règlement</a>
  {/* NOUVEAU */}
  <a href="#participants" className="text-sm text-texte-doux hover:text-neon transition-colors">
    Participants
  </a>
  {/* FIN NOUVEAU */}
</div>
```

### Rendre la navigation non-sticky
```jsx
// Remplacer
<nav className="border-b border-bord/50 backdrop-blur-sm bg-fond/80 sticky top-0 z-50">

// Par
<nav className="border-b border-bord/50 bg-fond">
```

## 🏆 Personnaliser le Hero

### Changer les couleurs du titre
```jsx
<h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
  <span className="block text-texte-doux mb-2">
    <span className="text-danger">Rapide.</span> {/* Rouge au lieu de néon */}
  </span>
  <span className="block bg-gradient-to-r from-or to-argent bg-clip-text text-transparent">
    Intelligent. Victorieux. {/* Or vers argent */}
  </span>
</h2>
```

### Modifier les stats affichées
```jsx
<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
  <div className="text-center">
    <div className="text-3xl sm:text-4xl font-bold text-neon mb-1">
      {data.nb_inscrits}
    </div>
    <div className="text-sm text-texte-faible">Joueurs inscrits</div>
  </div>
  {/* NOUVEAU STAT */}
  <div className="text-center">
    <div className="text-3xl sm:text-4xl font-bold text-neon mb-1">
      {poules.length}
    </div>
    <div className="text-sm text-texte-faible">Poules</div>
  </div>
  {/* FIN NOUVEAU */}
</div>
```

### Ajouter un fond vidéo (optionnel)
```jsx
<section className="relative overflow-hidden">
  {/* NOUVEAU: Vidéo de fond */}
  <video
    autoPlay
    loop
    muted
    playsInline
    className="absolute inset-0 w-full h-full object-cover opacity-20"
  >
    <source src="/hero-background.mp4" type="video/mp4" />
  </video>
  {/* FIN NOUVEAU */}
  
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 relative z-10">
    {/* Contenu du hero */}
  </div>
</section>
```

## 🎴 Personnaliser les Catégories

### Changer les icônes des catégories
```jsx
import { Brain, Atom, Music, Soccer, Mountain, Tv } from 'lucide-react'

// Puis remplacer dans le tableau:
{
  icon: Brain,  // Au lieu de BookOpen
  // ...
}
```

### Ajouter une 7ème catégorie
```jsx
[
  // ... les 6 existantes
  {
    num: '07',
    titre: 'Technologie',
    desc: 'Informatique, IA et innovations numériques.',
    exemple: '« Qui a fondé Apple Computer ? »',
    icon: Cpu,
    color: 'text-neon',
  },
]
```

### Modifier la grille (4 colonnes au lieu de 3)
```jsx
<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"> {/* était lg:grid-cols-3 */}
```

## 🥇 Personnaliser le Podium

### Modifier les tailles des médailles
```jsx
{/* 1ère place */}
<Medal size={64} className="text-or mx-auto mb-4" /> {/* était 48 */}

{/* 2e et 3e places */}
<Medal size={40} className="text-argent mx-auto mb-3" /> {/* était 32 */}
```

### Changer l'ordre du podium (1-2-3 au lieu de 2-1-3)
```jsx
<div className="max-w-4xl mx-auto mb-12">
  <div className="grid grid-cols-3 gap-4 items-end">
    {/* 1ère place À GAUCHE */}
    <div className="pb-0">
      {/* Carte 1ère place */}
    </div>

    {/* 2ème place AU CENTRE */}
    <div className="pb-8">
      {/* Carte 2ème place */}
    </div>

    {/* 3ème place À DROITE */}
    <div className="pb-16">
      {/* Carte 3ème place */}
    </div>
  </div>
</div>
```

### Ajouter un effet de confettis (simple)
```jsx
// Après l'import des icônes
import Confetti from 'react-confetti'

// Dans le component, ajouter un state
const [showConfetti, setShowConfetti] = useState(false)

// Puis dans le JSX, au-dessus du podium
{showConfetti && (
  <Confetti
    width={window.innerWidth}
    height={window.innerHeight}
    recycle={false}
    numberOfPieces={200}
  />
)}
```

## 📊 Personnaliser le Tableau de Classement

### Ajouter une colonne
```jsx
{/* Dans le header */}
<div className="flex items-center gap-4 text-sm font-semibold text-texte-faible">
  <span className="w-12">Rang</span>
  <span className="flex-1">Équipe</span>
  {/* NOUVEAU */}
  <span className="w-20 text-right">Matches</span>
  {/* FIN NOUVEAU */}
  <span className="w-20 text-right">Tendance</span>
  <span className="w-24 text-right">Points</span>
</div>

{/* Dans chaque ligne */}
{suite.map((c, i) => (
  <div className="px-6 py-4 hover:bg-surface/50 transition-colors flex items-center gap-4">
    <span className="w-12">...</span>
    <div className="flex-1">...</div>
    {/* NOUVEAU */}
    <span className="w-20 text-right text-texte-doux">{c.nb_matches || 0}</span>
    {/* FIN NOUVEAU */}
    <span className="w-20">...</span>
    <span className="w-24">...</span>
  </div>
))}
```

### Changer le nombre de lignes affichées
```jsx
// Dans le component
const LINES_TO_SHOW = 10
const suite = aDesPoints ? data.classement.slice(3, 3 + LINES_TO_SHOW) : []
```

### Ajouter un bouton "Voir tout"
```jsx
const [showAll, setShowAll] = useState(false)
const suite = aDesPoints 
  ? (showAll ? data.classement.slice(3) : data.classement.slice(3, 13))
  : []

// Après le tableau
{!showAll && data.classement.length > 13 && (
  <button
    onClick={() => setShowAll(true)}
    className="mt-4 mx-auto block px-6 py-2 border border-neon rounded-lg hover:bg-neon/10"
  >
    Voir tout le classement ({data.classement.length - 13} de plus)
  </button>
)}
```

## 🎯 Personnaliser les Animations

### Désactiver toutes les animations
```css
/* Dans index.css */
* {
  animation: none !important;
  transition: none !important;
}
```

### Ralentir les animations
```css
/* Dans index.css */
.anim-monte {
  animation: monte 1s ease both; /* était 0.35s */
}

.carte, .groupe, .tape {
  transition-duration: 300ms; /* était implicite 150ms */
}
```

### Ajouter une animation de flottement
```css
/* Dans index.css */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.anim-float {
  animation: float 3s ease-in-out infinite;
}
```

```jsx
// Appliquer sur le trophy du hero
<Trophy size={24} className="text-neon anim-float" />
```

## 🔤 Personnaliser les Textes

### Changer les titres de sections
```jsx
// Au lieu de
<h2 className="text-4xl sm:text-5xl font-bold text-neon mb-4">
  Le terrain de jeu
</h2>

// Utiliser
<h2 className="text-4xl sm:text-5xl font-bold text-neon mb-4">
  {r['textes.titre_categories'] || 'Les Catégories'}
</h2>
```

### Ajouter des sous-titres
```jsx
<div className="text-center mb-16">
  <h2 className="text-4xl sm:text-5xl font-bold text-neon mb-4">
    Le terrain de jeu
  </h2>
  <p className="text-xl text-texte-doux max-w-2xl mx-auto">
    Six catégories. Aucune préparée d'avance.
  </p>
  {/* NOUVEAU */}
  <p className="text-sm text-texte-faible mt-2">
    Chaque question vaut entre 50 et 300 points selon la difficulté
  </p>
  {/* FIN NOUVEAU */}
</div>
```

## 📱 Ajustements Mobile

### Modifier le breakpoint mobile
```jsx
// Au lieu de sm:grid-cols-2
<div className="grid md:grid-cols-2 gap-6"> {/* Mobile à 768px au lieu de 640px */}
```

### Cacher un élément sur mobile uniquement
```jsx
<div className="hidden sm:block">
  {/* Visible seulement sur desktop */}
</div>
```

### Afficher différemment sur mobile
```jsx
{/* Version desktop */}
<div className="hidden sm:block">
  <ComplexComponent />
</div>

{/* Version mobile simplifiée */}
<div className="block sm:hidden">
  <SimpleComponent />
</div>
```

## 🎨 Thèmes Alternatifs

### Thème sombre plus doux
```css
@theme {
  --color-fond: #1A1A2E;       /* Bleu marine au lieu de noir */
  --color-surface: #16213E;
  --color-neon: #0F3460;        /* Bleu plus calme */
}
```

### Thème clair (jour)
```css
@theme {
  --color-fond: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-texte: #0F172A;
  --color-texte-doux: #475569;
  --color-neon: #0EA5E9;
  --color-bord: #E2E8F0;
}
```

## 🔧 Optimisations Performance

### Lazy load des images
```jsx
<img 
  src="/hero-image.jpg" 
  alt="Hero"
  loading="lazy"
  className="..."
/>
```

### Désactiver le refresh auto
```jsx
// Dans useQuery, retirer :
refetchInterval: 30000,
```

### Pagination du classement
```jsx
const PAGE_SIZE = 20
const [page, setPage] = useState(1)
const suite = aDesPoints 
  ? data.classement.slice(3, 3 + (page * PAGE_SIZE))
  : []

// Bouton "Charger plus"
<button onClick={() => setPage(p => p + 1)}>
  Charger plus
</button>
```

## 📊 Analytics & Tracking

### Ajouter Google Analytics
```jsx
// Dans PublicPage.jsx, après les imports
import ReactGA from 'react-ga4'

// Dans le component
useEffect(() => {
  ReactGA.send({ hitType: 'pageview', page: '/', title: 'Public Page' })
}, [])
```

### Tracker les clics sur CTA
```jsx
<Link 
  to="/inscription"
  onClick={() => {
    ReactGA.event({
      category: 'User',
      action: 'Click CTA Inscription',
      label: 'Hero Section'
    })
  }}
  className="..."
>
  S'inscrire
</Link>
```

---

**Note**: Ces snippets sont des exemples. Adaptez-les selon vos besoins spécifiques.
