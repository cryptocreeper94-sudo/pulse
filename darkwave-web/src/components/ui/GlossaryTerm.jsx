import { useGlossary } from '../../context/GlossaryContext'

export default function GlossaryTerm({ term, children }) {
  const { showDefinition } = useGlossary()
  
  const handleClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    showDefinition(term, e)
  }
  
  return (
    <span
      onClick={handleClick}
      style={{
        color: '#00D4FF',
        cursor: 'pointer',
        borderBottom: '1px dotted rgba(0, 212, 255, 0.5)',
        transition: 'all 0.2s ease'
      }}
      className="glossary-term"
    >
      {children || term}
    </span>
  )
}
