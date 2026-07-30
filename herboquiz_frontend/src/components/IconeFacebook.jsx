// lucide-react a retire les icones de marque : on garde un « f » reconnaissable
// pour le bouton Facebook via un SVG inline.
export default function IconeFacebook({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.5-1.5H17V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.2H7.7V13h2.8v8h3z" />
    </svg>
  )
}
