// Composant de bouton générique
export default function Button({ children, onClick, className = '', ...props }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
