'use client'

import { useState } from 'react'
import ImageUpload from '@/components/ImageUpload'
import CoreWordBar from '@/components/CoreWordBar'
import SuggestionsBar from '@/components/SuggestionsBar'
import SentenceStrip from '@/components/SentenceStrip'
import SpeakButton from '@/components/SpeakButton'

export default function Home() {
  const [sentenceWords, setSentenceWords] = useState<Array<{word: string, icon: string}>>([])
  const [detectedNouns, setDetectedNouns] = useState<Array<{word: string, icon: string}>>([])
  const [suggestedWords, setSuggestedWords] = useState<Array<{word: string, icon: string}>>([])

  const handleImageAnalysis = (data: {
    detected: string[]
    detectedTiles?: Array<{word: string, icon: string}>
    suggested_words: string[]
    icons: string[]
    sentence: string
  }) => {
    // Update detected nouns (fringe words) - use detectedTiles if available
    if (data.detectedTiles && data.detectedTiles.length > 0) {
      setDetectedNouns(data.detectedTiles)
    } else {
      // Fallback to old format
      const nouns = data.detected.map((word) => {
        const iconIndex = data.suggested_words.findIndex(sw => sw === word)
        const icon = iconIndex >= 0 ? data.icons[iconIndex] : `/acc/unknown.svg`
        return { word, icon }
      })
      setDetectedNouns(nouns)
    }

    // Update suggested words (full sentence suggestion)
    const suggested = data.suggested_words.map((word, idx) => ({
      word,
      icon: data.icons[idx] || `/acc/unknown.svg`
    }))
    setSuggestedWords(suggested)
  }

  const addWordToSentence = (word: string, icon: string) => {
    // Check if word already exists to avoid duplicates when clicking
    // (dragging will handle its own addition)
    setSentenceWords([...sentenceWords, { word, icon }])
  }

  const removeWordFromSentence = (index: number) => {
    setSentenceWords(sentenceWords.filter((_, i) => i !== index))
  }

  const reorderSentenceWords = (newOrder: Array<{word: string, icon: string}>) => {
    setSentenceWords(newOrder)
  }

  const clearSentence = () => {
    setSentenceWords([])
  }

  const handleSuggest = () => {
    // Add all suggested words to sentence
    setSentenceWords(suggestedWords.map(sw => ({ word: sw.word, icon: sw.icon })))
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '30px 20px',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      <header style={{
        textAlign: 'center',
        marginBottom: '50px',
        padding: '50px 30px',
        background: 'rgba(255, 255, 255, 0.98)',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '70px',
            height: '70px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
          }}>
            <span style={{
              fontSize: '2.5rem',
              fontWeight: '900',
              color: 'white',
              letterSpacing: '-2px'
            }}>A</span>
          </div>
          <h1 style={{
            fontSize: '4rem',
            fontWeight: '900',
            margin: 0,
            letterSpacing: '-2px',
            lineHeight: '1',
            display: 'flex',
            alignItems: 'baseline',
            gap: '0'
          }}>
            <span style={{
              color: '#667eea',
              fontWeight: '900'
            }}>AAC</span>
            <span style={{
              color: '#00d4ff',
              fontWeight: '900'
            }}>TION</span>
          </h1>
        </div>
        <p style={{
          color: '#333',
          fontSize: '1.3rem',
          fontWeight: '500',
          marginTop: '15px',
          letterSpacing: '0.2px'
        }}>
          AI-Powered Communication for Everyone
        </p>
        <div style={{
          marginTop: '20px',
          display: 'inline-flex',
          gap: '12px',
          padding: '12px 24px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          fontSize: '0.9rem',
          color: '#495057',
          fontWeight: '600',
          border: '1px solid #e9ecef'
        }}>
          <span>Accessible</span>
          <span style={{ color: '#dee2e6' }}>•</span>
          <span>Intelligent</span>
          <span style={{ color: '#dee2e6' }}>•</span>
          <span>Empowering</span>
        </div>
      </header>

      {/* Image Upload Section */}
      <section style={{ marginBottom: '40px' }} className="fade-in">
        <ImageUpload onAnalysis={handleImageAnalysis} />
      </section>

      {/* Suggestions Bar (shown after image analysis) */}
      {suggestedWords.length > 0 && (
        <section style={{ marginBottom: '30px' }} className="slide-in">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '15px',
            padding: '0 5px'
          }}>
            <h2 style={{ 
              fontSize: '1.4rem', 
              color: '#212529',
              fontWeight: '700',
              display: 'inline-block',
              backgroundColor: 'white',
              padding: '10px 20px',
              borderRadius: '10px',
              border: '2px solid #e9ecef',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              margin: 0
            }}>
              Suggested Sentence
            </h2>
            <button
              onClick={handleSuggest}
              style={{
                padding: '12px 24px',
                backgroundColor: '#667eea',
                color: 'white',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                border: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#5568d3'
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#667eea'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            >
              Use This
            </button>
          </div>
          <SuggestionsBar words={suggestedWords} onWordClick={addWordToSentence} />
        </section>
      )}

      {/* Core Word Bar (always visible) */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ 
          fontSize: '1.4rem', 
          color: '#212529',
          marginBottom: '15px',
          padding: '10px 20px',
          fontWeight: '700',
          display: 'inline-block',
          backgroundColor: 'white',
          borderRadius: '10px',
          border: '2px solid #e9ecef',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          Core Words
        </h2>
        <CoreWordBar onWordClick={addWordToSentence} />
      </section>

      {/* Things I See (Dynamic Nouns) */}
      <section style={{ marginBottom: '40px' }} className="slide-in">
        <h2 style={{ 
          fontSize: '1.4rem', 
          color: '#212529',
          marginBottom: '15px',
          padding: '10px 20px',
          fontWeight: '700',
          display: 'inline-block',
          backgroundColor: 'white',
          borderRadius: '10px',
          border: '2px solid #e9ecef',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          Things I See
        </h2>
        {detectedNouns.length > 0 ? (
          <SuggestionsBar words={detectedNouns} onWordClick={addWordToSentence} />
        ) : (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: '16px',
            border: '2px dashed #dee2e6',
            color: '#6c757d',
            fontSize: '1rem',
            fontWeight: '500'
          }}>
            Upload a photo to detect objects
          </div>
        )}
      </section>

      {/* Sentence Strip */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '15px',
          padding: '0 5px'
        }}>
          <div>
            <div>
              <h2 style={{ 
                fontSize: '1.4rem', 
                color: '#212529',
                fontWeight: '700', 
                marginBottom: '8px',
                display: 'inline-block',
                backgroundColor: 'white',
                padding: '10px 20px',
                borderRadius: '10px',
                border: '2px solid #e9ecef',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                Your Sentence
              </h2>
              <p style={{ 
                fontSize: '0.85rem', 
                color: '#6c757d', 
                margin: '10px 0 0 0',
                fontWeight: '500'
              }}>
                Drag words to reorder • Tap X to remove
              </p>
            </div>
          </div>
          {sentenceWords.length > 0 && (
            <button
              onClick={clearSentence}
              style={{
                padding: '12px 24px',
                backgroundColor: 'rgba(220, 53, 69, 0.9)',
                color: 'white',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)',
                border: 'none',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(200, 35, 51, 0.95)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.9)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(220, 53, 69, 0.3)'
              }}
            >
              Clear
            </button>
          )}
        </div>
        <SentenceStrip 
          words={sentenceWords} 
          onWordRemove={removeWordFromSentence}
          onReorder={reorderSentenceWords}
        />
      </section>

      {/* Speak Button */}
      <section style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '40px',
        padding: '0 20px'
      }}>
        <SpeakButton words={sentenceWords} />
      </section>
    </main>
  )
}
