'use client'

interface SuggestionsBarProps {
  words: Array<{ word: string; icon: string }>
  onWordClick: (word: string, icon: string) => void
}

export default function SuggestionsBar({ words, onWordClick }: SuggestionsBarProps) {
  if (words.length === 0) return null

  return (
    <div style={{
      display: 'flex',
      gap: '16px',
      padding: '24px',
      backgroundColor: '#f8f9fa',
      borderRadius: '16px',
      border: '1px solid #e9ecef',
      flexWrap: 'wrap',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      justifyContent: 'flex-start'
    }}>
      {words.map((item, idx) => (
        <div
          key={`${item.word}-${idx}`}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = 'copy'
            e.dataTransfer.setData('application/json', JSON.stringify({ word: item.word, icon: item.icon }))
            e.dataTransfer.setData('text/plain', item.word)
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = '0.5'
            }
          }}
          onDragEnd={(e) => {
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = '1'
            }
          }}
          onClick={() => onWordClick(item.word, item.icon)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '18px',
            backgroundColor: 'white',
            border: '2px solid #e9ecef',
            borderRadius: '12px',
            width: '120px',
            aspectRatio: '1',
            cursor: 'grab',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f8f9fa'
            e.currentTarget.style.borderColor = '#667eea'
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.cursor = 'grab'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white'
            e.currentTarget.style.borderColor = '#e9ecef'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.cursor = 'grabbing'
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.cursor = 'grab'
          }}
        >
          <img
            src={item.icon}
            alt={item.word}
            style={{
              width: '75px',
              height: '75px',
              marginBottom: '12px',
              objectFit: 'contain',
              pointerEvents: 'none',
              userSelect: 'none',
              display: 'block'
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/acc/unknown.svg'
            }}
            draggable={false}
          />
          <span style={{
            fontSize: '1rem',
            fontWeight: '700',
            color: '#1a1a1a',
            pointerEvents: 'none',
            userSelect: 'none',
            textShadow: '0 1px 2px rgba(255,255,255,0.8)'
          }}>
            {item.word}
          </span>
        </div>
      ))}
    </div>
  )
}
