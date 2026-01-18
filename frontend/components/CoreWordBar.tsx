'use client'

import { useEffect, useState } from 'react'

interface CoreWordBarProps {
  onWordClick: (word: string, icon: string) => void
}

const CORE_WORDS = [
  "I", "YOU", "ME",
  "GO", "STOP", "LOOK", "SEE", "OPEN", "CLOSE", "EAT", "DRINK", "HELP", "WANT", "NEED", "COME", "LIKE", "PLAY", "FEEL",
  "MORE", "BIG", "LITTLE", "GOOD", "BAD", "HAPPY", "SAD",
  "IN", "OUT", "UP", "DOWN", "ON", "OFF",
  "WHAT", "WHERE",
  "YES", "NO", "PLEASE", "THANK YOU", "ALL DONE",
  "THIS", "THAT",
  "NOT", "NOW", "HERE"
]

export default function CoreWordBar({ onWordClick }: CoreWordBarProps) {
  const [wordIcons, setWordIcons] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch icon mappings - try backend first, fallback to local file
    const fetchIcons = async () => {
      // First, try to load from local JSON file (works without backend)
      try {
        const localResponse = await fetch('/symbol-map.json')
        if (localResponse.ok) {
          const localData = await localResponse.json()
          console.log('✅ Loaded icon mappings from local file')
          setWordIcons(localData)
          setLoading(false)
          return
        }
      } catch (err) {
        console.log('Local symbol map not found, trying backend...')
      }
      
      // Fallback: try backend API
      try {
        console.log('🔄 Fetching core word icons from backend...')
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/api/core-words`)
        if (response.ok) {
          const data = await response.json()
          console.log('✅ Received icon mappings from backend')
          setWordIcons(data.icons || {})
        } else {
          console.error('❌ Backend returned error:', response.status)
          // Use hardcoded fallback
          loadHardcodedIcons()
        }
      } catch (err) {
        console.error('❌ Failed to fetch from backend:', err)
        console.log('   Using hardcoded icon mappings')
        // Use hardcoded fallback
        loadHardcodedIcons()
      } finally {
        setLoading(false)
      }
    }
    
    // Hardcoded icon mappings as final fallback
    const loadHardcodedIcons = () => {
      const icons: Record<string, string> = {
        "I": "/acc/symbols/I.svg",
        "YOU": "/acc/symbols/you.svg",
        "ME": "/acc/symbols/me.svg",
        "GO": "/acc/symbols/go_,_to.svg",
        "STOP": "/acc/symbols/stop.svg",
        "LOOK": "/acc/symbols/look_,_to.svg",
        "SEE": "/acc/symbols/eyes.svg",
        "OPEN": "/acc/symbols/open.svg",
        "CLOSE": "/acc/symbols/close_,_to.svg",
        "EAT": "/acc/symbols/eat_,_to.svg",
        "DRINK": "/acc/symbols/drink.svg",
        "HELP": "/acc/symbols/help_,_to.svg",
        "WANT": "/acc/symbols/want_,_to.svg",
        "NEED": "/acc/symbols/need_toilet.svg",
        "COME": "/acc/symbols/come_,_to.svg",
        "LIKE": "/acc/symbols/like.svg",
        "PLAY": "/acc/symbols/play_,_to.svg",
        "FEEL": "/acc/symbols/feel.svg",
        "MORE": "/acc/symbols/more.svg",
        "BIG": "/acc/symbols/big_mac_switch.svg",
        "LITTLE": "/acc/symbols/little.svg",
        "GOOD": "/acc/symbols/good.svg",
        "BAD": "/acc/symbols/bad.svg",
        "HAPPY": "/acc/symbols/happy_lady.svg",
        "SAD": "/acc/symbols/sad_man.svg",
        "IN": "/acc/symbols/in.svg",
        "OUT": "/acc/symbols/out.svg",
        "UP": "/acc/symbols/up.svg",
        "DOWN": "/acc/symbols/down.svg",
        "ON": "/acc/symbols/on.svg",
        "OFF": "/acc/symbols/off.svg",
        "WHAT": "/acc/symbols/what.svg",
        "WHERE": "/acc/symbols/where_1.svg",
        "YES": "/acc/symbols/correct.svg",
        "NO": "/acc/symbols/mistake_no_wrong.svg",
        "PLEASE": "/acc/symbols/please.svg",
        "THANK YOU": "/acc/symbols/thank_you.svg",
        "ALL DONE": "/acc/symbols/finish.svg",
        "THIS": "/acc/symbols/pointed.svg",
        "THAT": "/acc/symbols/point_,_to.svg",
        "NOT": "/acc/symbols/not.svg",
        "NOW": "/acc/symbols/now.svg",
        "HERE": "/acc/symbols/here.svg"
      }
      // Set unknown for words without symbols
      CORE_WORDS.forEach(word => {
        if (!icons[word]) {
          icons[word] = "/acc/unknown.svg"
        }
      })
      setWordIcons(icons)
    }
    
    fetchIcons()
  }, [])

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
      gap: '14px',
      padding: '24px',
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #e9ecef',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
    }}>
      {CORE_WORDS.map(word => {
        const icon = wordIcons[word] || '/acc/unknown.svg'
        return (
          <div
            key={word}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'copy'
              e.dataTransfer.setData('application/json', JSON.stringify({ word, icon }))
              e.dataTransfer.setData('text/plain', word)
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = '0.5'
              }
            }}
            onDragEnd={(e) => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = '1'
              }
            }}
            onClick={() => onWordClick(word, icon)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 10px',
              backgroundColor: '#f8f9fa',
              border: '2px solid #e9ecef',
              borderRadius: '12px',
              width: '100%',
              aspectRatio: '1',
              maxWidth: '110px',
              cursor: 'grab',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e9ecef'
              e.currentTarget.style.borderColor = '#667eea'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.cursor = 'grab'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa'
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
              src={icon}
              alt={word}
              style={{
                width: '60px',
                height: '60px',
                marginBottom: '10px',
                objectFit: 'contain',
                pointerEvents: 'none',
                userSelect: 'none',
                display: 'block'
              }}
              onError={(e) => {
                console.error(`Failed to load symbol for "${word}": ${icon}`)
                const img = e.target as HTMLImageElement
                if (img.src !== window.location.origin + '/acc/unknown.svg') {
                  img.src = '/acc/unknown.svg'
                }
              }}
              onLoad={() => {
                if (icon && icon !== '/acc/unknown.svg') {
                  console.log(`✅ Loaded symbol for "${word}": ${icon}`)
                }
              }}
              draggable={false}
            />
            <span style={{
              fontSize: '0.85rem',
              fontWeight: '700',
              color: '#1a1a1a',
              textAlign: 'center',
              lineHeight: '1.2',
              pointerEvents: 'none',
              userSelect: 'none',
              textShadow: '0 1px 2px rgba(255,255,255,0.8)'
            }}>
              {word}
            </span>
          </div>
        )
      })}
    </div>
  )
}
