'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ImageUploadProps {
  onAnalysis: (data: {
    detected: string[]
    suggested_words: string[]
    icons: string[]
    sentence: string
  }) => void
}

export default function ImageUpload({ onAnalysis }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (jpg, png, etc.)')
      return
    }

    setError(null)
    setUploading(true)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to backend
    const formData = new FormData()
    formData.append('file', file)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/analyze-image`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server error (${response.status}): ${errorText || response.statusText}`)
      }

      const data = await response.json()
      onAnalysis(data)
      setError(null) // Clear any previous errors on success
    } catch (err) {
      let errorMessage = 'Failed to analyze image'
      
      if (err instanceof TypeError && err.message.includes('fetch')) {
        // Network error - backend likely not running
        errorMessage = 'Cannot connect to backend. Make sure the server is running on http://localhost:8000'
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{
      border: '2px dashed #dee2e6',
      borderRadius: '16px',
      padding: '50px 30px',
      textAlign: 'center',
      backgroundColor: 'white',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      transition: 'all 0.3s ease'
    }}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        style={{ display: 'none' }}
        id="image-upload"
      />
      <label
        htmlFor="image-upload"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '16px 32px',
          backgroundColor: uploading ? '#adb5bd' : '#667eea',
          color: 'white',
          borderRadius: '10px',
          cursor: uploading ? 'not-allowed' : 'pointer',
          fontSize: '1.1rem',
          fontWeight: '700',
          marginBottom: '20px',
          boxShadow: uploading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)',
          transition: 'all 0.2s ease',
          border: 'none'
        }}
        onMouseEnter={(e) => {
          if (!uploading) {
            e.currentTarget.style.backgroundColor = '#5568d3'
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)'
          }
        }}
        onMouseLeave={(e) => {
          if (!uploading) {
            e.currentTarget.style.backgroundColor = '#667eea'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
          }
        }}
      >
        <span>{uploading ? 'Analyzing...' : 'Upload Photo'}</span>
      </label>

      {error && (
        <div style={{
          marginTop: '20px',
          padding: '14px 20px',
          background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%)',
          color: '#dc3545',
          borderRadius: '12px',
          fontSize: '0.95rem',
          fontWeight: '600',
          border: '2px solid rgba(220, 53, 69, 0.2)'
        }}>
          {error}
        </div>
      )}

      {preview && (
        <div style={{
          marginTop: '25px',
          borderRadius: '16px',
          overflow: 'hidden',
          maxWidth: '500px',
          margin: '25px auto 0',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          border: '3px solid rgba(255,255,255,0.5)'
        }}>
          <img
            src={preview}
            alt="Uploaded preview"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block'
            }}
          />
        </div>
      )}

      <p style={{
        marginTop: '20px',
        color: '#6c757d',
        fontSize: '0.95rem',
        fontWeight: '500'
      }}>
        Take or upload a photo to detect objects and generate AAC suggestions
      </p>
    </div>
  )
}
