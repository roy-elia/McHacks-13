'use client'

import { useState } from 'react'

interface SpeakButtonProps {
  words: Array<{ word: string; icon: string }>
}

export default function SpeakButton({ words }: SpeakButtonProps) {
  const [speaking, setSpeaking] = useState(false)

  const handleSpeak = () => {
    if (words.length === 0) return

    const sentence = words.map(w => w.word).join(' ')
    
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(sentence)
      utterance.rate = 0.9 // Slightly slower for clarity
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)
      
      window.speechSynthesis.speak(utterance)
    } else {
      alert('Text-to-speech is not supported in your browser')
    }
  }

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
      <button
        onClick={speaking ? handleStop : handleSpeak}
        disabled={words.length === 0}
        style={{
          padding: '18px 40px',
          fontSize: '1.4rem',
          fontWeight: '700',
          backgroundColor: words.length === 0 ? '#adb5bd' : (speaking ? '#dc3545' : '#28a745'),
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: words.length === 0 ? 'not-allowed' : 'pointer',
          boxShadow: words.length === 0 
            ? 'none'
            : speaking
              ? '0 4px 12px rgba(220, 53, 69, 0.3)'
              : '0 4px 12px rgba(40, 167, 69, 0.3)',
          transition: 'all 0.2s ease',
          minWidth: '200px'
        }}
        onMouseEnter={(e) => {
          if (words.length > 0) {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = speaking
              ? '0 6px 16px rgba(220, 53, 69, 0.4)'
              : '0 6px 16px rgba(40, 167, 69, 0.4)'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = words.length === 0 
            ? 'none'
            : speaking
              ? '0 4px 12px rgba(220, 53, 69, 0.3)'
              : '0 4px 12px rgba(40, 167, 69, 0.3)'
        }}
      >
        {speaking ? 'Stop' : 'Speak'}
      </button>
      
      {words.length > 0 && (
        <div style={{
          padding: '16px 28px',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #e9ecef',
          fontSize: '1.2rem',
          color: '#212529',
          fontWeight: '600',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          "{words.map(w => w.word).join(' ')}"
        </div>
      )}
    </div>
  )
}
