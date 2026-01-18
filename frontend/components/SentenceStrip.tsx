'use client'

import { useState } from 'react'

interface SentenceStripProps {
  words: Array<{ word: string; icon: string }>
  onWordRemove: (index: number) => void
  onReorder?: (newOrder: Array<{ word: string; icon: string }>) => void
}

export default function SentenceStrip({ words, onWordRemove, onReorder }: SentenceStripProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
    // Don't set opacity here - we'll use CSS opacity instead
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Check if this is a new word being dropped from outside (has JSON data)
    try {
      const jsonData = e.dataTransfer.getData('application/json')
      if (jsonData) {
        const newWord = JSON.parse(jsonData)
        // Insert new word at drop position
        if (onReorder) {
          const newWords = [...words]
          newWords.splice(dropIndex, 0, newWord)
          onReorder(newWords)
        }
        setDragOverIndex(null)
        setDraggedIndex(null)
        return
      }
    } catch (err) {
      // Not JSON data, continue with reorder logic
    }
    
    // Handle reordering existing words within sentence
    const dragIndex = draggedIndex
    
    if (dragIndex === null || dragIndex === dropIndex || !onReorder) {
      setDragOverIndex(null)
      setDraggedIndex(null)
      return
    }

    // Create new array with reordered items
    const newWords = [...words]
    const [draggedItem] = newWords.splice(dragIndex, 1)
    newWords.splice(dropIndex, 0, draggedItem)
    
    // Call the reorder callback
    onReorder(newWords)
    
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  if (words.length === 0) {
    return (
      <div 
        style={{
          padding: '50px 40px',
          backgroundColor: 'white',
          borderRadius: '16px',
          border: '2px dashed #dee2e6',
          textAlign: 'center',
          color: '#6c757d',
          transition: 'all 0.2s ease'
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'copy'
          e.currentTarget.style.borderColor = '#667eea'
          e.currentTarget.style.backgroundColor = '#f8f9fa'
        }}
        onDragLeave={(e) => {
          e.currentTarget.style.borderColor = '#dee2e6'
          e.currentTarget.style.backgroundColor = 'white'
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          try {
            const jsonData = e.dataTransfer.getData('application/json')
            if (jsonData && onReorder) {
              const newWord = JSON.parse(jsonData)
              onReorder([newWord])
            }
          } catch (err) {
            // Ignore
          }
          e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)'
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,248,248,0.9) 100%)'
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        <div style={{ 
          fontSize: '1.1rem', 
          fontWeight: '700', 
          marginBottom: '8px', 
          color: '#1a1a1a',
          textShadow: '0 1px 2px rgba(255,255,255,0.8)'
        }}>
          Drag words here to build your sentence
        </div>
        <div style={{ 
          fontSize: '0.95rem', 
          color: '#1a1a1a',
          fontWeight: '600',
          textShadow: '0 1px 2px rgba(255,255,255,0.8)'
        }}>
          Or tap words above to add them
        </div>
      </div>
    )
  }

  return (
    <div 
      style={{
        display: 'flex',
        gap: '12px',
        padding: '24px',
        backgroundColor: '#fff9e6',
        borderRadius: '16px',
        border: '2px solid #ffd700',
        flexWrap: 'wrap',
        minHeight: '140px',
        alignItems: 'center',
        position: 'relative',
        boxShadow: '0 4px 16px rgba(255, 215, 0, 0.15)'
      }}
      onDragOver={(e) => {
        e.preventDefault()
        e.stopPropagation()
        // Only set dropEffect if dragging from outside (not from within sentence)
        if (draggedIndex === null) {
          e.dataTransfer.dropEffect = 'copy'
        } else {
          e.dataTransfer.dropEffect = 'move'
        }
      }}
      onDrop={(e) => {
        e.preventDefault()
        e.stopPropagation()
        // Handle drop at the end of sentence (when dropping on empty space between words)
        // Only process if we're not already handling a drop on a specific word card
        const target = e.target as HTMLElement
        if (target.closest('[data-word-card]')) {
          // Let the word card handle the drop
          return
        }
        
        try {
          const jsonData = e.dataTransfer.getData('application/json')
          if (jsonData) {
            const newWord = JSON.parse(jsonData)
            if (onReorder) {
              // Only add if it's a new word from outside (not reordering)
              if (draggedIndex === null) {
                onReorder([...words, newWord])
              }
            }
          }
        } catch (err) {
          // Ignore
        }
        setDragOverIndex(null)
        setDraggedIndex(null)
      }}
    >
      {words.map((item, index) => (
        <div
          key={`${item.word}-${index}`}
          data-word-card="true"
          draggable={onReorder !== undefined}
          onDragStart={(e) => {
            handleDragStart(e, index)
            // Store the word data for reordering
            e.dataTransfer.effectAllowed = 'move'
            e.dataTransfer.setData('text/plain', index.toString())
          }}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleDragOver(e, index)
          }}
          onDragLeave={handleDragLeave}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleDrop(e, index)
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            padding: '12px',
            backgroundColor: dragOverIndex === index ? '#fff3cd' : 'white',
            border: dragOverIndex === index 
              ? '3px dashed #ffd700' 
              : '2px solid #ffd700',
            borderRadius: '12px',
            minWidth: '95px',
            cursor: onReorder ? 'grab' : 'pointer',
            transition: 'all 0.2s ease',
            transform: dragOverIndex === index ? 'scale(1.08) translateY(-3px)' : 'scale(1)',
            boxShadow: dragOverIndex === index 
              ? '0 8px 20px rgba(255, 215, 0, 0.3)' 
              : '0 2px 8px rgba(0,0,0,0.08)',
            opacity: draggedIndex === index ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (draggedIndex === null) {
              e.currentTarget.style.backgroundColor = '#fff3cd'
              if (onReorder) {
                e.currentTarget.style.cursor = 'grab'
              }
            }
          }}
          onMouseLeave={(e) => {
            if (dragOverIndex !== index) {
              e.currentTarget.style.backgroundColor = 'white'
            }
          }}
          onMouseDown={(e) => {
            if (onReorder) {
              e.currentTarget.style.cursor = 'grabbing'
            }
          }}
          onMouseUp={(e) => {
            if (onReorder) {
              e.currentTarget.style.cursor = 'grab'
            }
          }}
        >
          <img
            src={item.icon}
            alt={item.word}
            style={{
              width: '65px',
              height: '65px',
              marginBottom: '10px',
              objectFit: 'contain',
              pointerEvents: 'none',
              display: 'block'
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/acc/unknown.svg'
            }}
            draggable={false}
          />
          <span style={{
            fontSize: '0.9rem',
            fontWeight: 'bold',
            color: '#333',
            pointerEvents: 'none' // Prevent text from interfering with drag
          }}>
            {item.word}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onWordRemove(index)
            }}
            onMouseDown={(e) => {
              e.stopPropagation()
            }}
            style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              fontSize: '0.7rem',
              color: '#999',
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #ddd',
              cursor: 'pointer',
              padding: '2px 6px',
              borderRadius: '4px',
              zIndex: 10,
              pointerEvents: 'auto'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fee'
              e.currentTarget.style.color = '#c33'
              e.currentTarget.style.borderColor = '#c33'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
              e.currentTarget.style.color = '#999'
              e.currentTarget.style.borderColor = '#ddd'
            }}
            title="Remove word"
          >
            ✕
          </button>
          {onReorder && (
            <div style={{
              position: 'absolute',
              bottom: '8px',
              fontSize: '0.7rem',
              color: 'rgba(0,0,0,0.3)',
              pointerEvents: 'none',
              fontWeight: 'bold',
              letterSpacing: '2px'
            }}>
              ⋮⋮
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
