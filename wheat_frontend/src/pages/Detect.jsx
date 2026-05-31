import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { predictImage } from '../utils/api'
import { useResults } from '../hooks/useResults'
import './Detect.css'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp']

export default function Detect() {
  const [dragging, setDragging]     = useState(false)
  const [file, setFile]             = useState(null)
  const [preview, setPreview]       = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const inputRef                    = useRef(null)
  const navigate                    = useNavigate()
  const { setResults, setImagePreview } = useResults()

  const handleFile = useCallback((f) => {
    if (!f) return
    if (!ACCEPTED.includes(f.type)) {
      setError('Please upload a JPEG, PNG, WebP or BMP image.')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10 MB.')
      return
    }
    setError(null)
    setFile(f)
    const url = URL.createObjectURL(f)
    setPreview(url)
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    handleFile(f)
  }, [handleFile])

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)
  const onInputChange = (e) => handleFile(e.target.files[0])

  const handleSubmit = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const data = await predictImage(file)
      setResults(data)
      setImagePreview(preview)
      navigate('/results')
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Prediction failed.'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="detect-page">
      <div className="container">
        <div className="detect-header anim-fade-up">
          <span className="section-label">Step 1 of 2</span>
          <h1 className="display-lg">Upload Leaf Image</h1>
          <p className="detect-subtitle">
            Take a clear, close-up photo of a single wheat leaf.
            The model works best with natural light and an unobstructed leaf surface.
          </p>
        </div>

        <div className="detect-layout">
          {/* ── Upload zone ── */}
          <div className="detect-main anim-fade-up delay-1">
            {!preview ? (
              <div
                className={`drop-zone ${dragging ? 'drop-zone--dragging' : ''}`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => inputRef.current?.click()}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPTED.join(',')}
                  onChange={onInputChange}
                  hidden
                />
                <div className="drop-zone__icon">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect width="48" height="48" rx="8" fill="rgba(90,158,84,0.08)" />
                    <path d="M24 14v14M17 21l7-7 7 7" stroke="var(--green-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 34c0 2.2 1.8 4 4 4h20c2.2 0 4-1.8 4-4" stroke="var(--green-dim)" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="drop-zone__primary">Drop image here</p>
                <p className="drop-zone__secondary">or click to browse · JPEG, PNG, WebP · max 10 MB</p>
              </div>
            ) : (
              <div className="preview-zone">
                <img src={preview} alt="Preview" className="preview-img" />
                <div className="preview-info">
                  <span className="preview-filename">{file.name}</span>
                  <span className="preview-size">{(file.size / 1024).toFixed(0)} KB</span>
                </div>
                <div className="preview-actions">
                  <button className="btn btn-outline btn-sm" onClick={reset}>
                    ✕ Remove
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading
                      ? <><span className="btn-spinner" /> Analysing…</>
                      : 'Analyse Image →'
                    }
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="detect-error anim-fade-in">
                <span>⚠</span> {error}
              </div>
            )}
          </div>

          {/* ── Tips sidebar ── */}
          <aside className="detect-tips anim-fade-up delay-2">
            <h3 className="tips-title">Tips for best results</h3>
            <ul className="tips-list">
              {[
                { icon: '☀️', tip: 'Use natural daylight, avoid flash glare' },
                { icon: '🔍', tip: 'Fill the frame with the leaf — avoid backgrounds' },
                { icon: '📐', tip: 'Keep the leaf flat and in focus' },
                { icon: '🌿', tip: 'Use the most symptomatic leaf available' },
                { icon: '🚫', tip: 'Avoid blurry, dark, or heavily compressed images' },
              ].map(t => (
                <li key={t.tip} className="tip-item">
                  <span className="tip-icon">{t.icon}</span>
                  <span>{t.tip}</span>
                </li>
              ))}
            </ul>

            <div className="tips-classes">
              <h4>Detectable conditions</h4>
              {[
                { key: 'Brown_Rust',   label: 'Brown Rust',   color: 'var(--rust-bright)' },
                { key: 'Healthy',      label: 'Healthy',      color: 'var(--green-bright)' },
                { key: 'Septoria',     label: 'Septoria',     color: '#b090d8' },
                { key: 'Yellow_Rust',  label: 'Yellow Rust',  color: 'var(--amber-bright)' },
              ].map(c => (
                <div key={c.key} className="class-pill">
                  <span className="class-dot" style={{ background: c.color }} />
                  {c.label}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
