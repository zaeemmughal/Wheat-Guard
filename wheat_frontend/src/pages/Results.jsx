import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useResults } from '../hooks/useResults'
import { DISEASES } from '../utils/diseaseData'
import './Results.css'

const CLASS_COLORS = {
  Brown_Rust:  'var(--rust-bright)',
  Healthy:     'var(--green-bright)',
  Septoria:    '#b090d8',
  Yellow_Rust: 'var(--amber-bright)',
}

export default function Results() {
  const { results, imagePreview } = useResults()
  const navigate = useNavigate()

  useEffect(() => {
    if (!results) navigate('/detect')
  }, [results, navigate])

  if (!results) return null

  const disease = DISEASES[results.predicted_class]
  const accentColor = CLASS_COLORS[results.predicted_class] || 'var(--green-bright)'
  const confidencePct = (results.confidence * 100).toFixed(1)

  const sortedProbs = Object.entries(results.probabilities)
    .sort((a, b) => b[1] - a[1])

  return (
    <div className="results-page">
      <div className="container">

        {/* ── Header ── */}
        <div className="results-header anim-fade-up">
          <span className="section-label">Analysis Complete</span>
          <h1 className="display-lg">Detection Results</h1>
          <p className="results-subtitle">
            Inference completed in <strong style={{ color: accentColor, fontFamily: 'var(--font-mono)' }}>
              {results.inference_time_ms} ms
            </strong>
          </p>
        </div>

        <div className="results-layout">

          {/* ── Left: image + verdict ── */}
          <div className="results-left">

            {/* Image */}
            {imagePreview && (
              <div className="result-image-card anim-fade-up delay-1">
                <img src={imagePreview} alt="Analysed leaf" className="result-image" />
                <div className="result-image-caption">
                  <span>{results.filename}</span>
                </div>
              </div>
            )}

            {/* Verdict */}
            <div
              className="verdict-card anim-fade-up delay-2"
              style={{ '--accent': accentColor }}
            >
              <div className="verdict-top">
                <span className="verdict-icon">{disease?.icon}</span>
                <div>
                  <span className={`tag ${disease?.tagClass}`}>
                    {disease?.severity} Severity
                  </span>
                  <h2 className="verdict-name">{disease?.label}</h2>
                  <p className="verdict-latin">{disease?.latin}</p>
                </div>
              </div>

              <div className="verdict-confidence">
                <div className="vc-row">
                  <span className="vc-label">Confidence</span>
                  <span className="vc-value" style={{ color: accentColor }}>
                    {confidencePct}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${confidencePct}%`, background: accentColor }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: probabilities + disease info ── */}
          <div className="results-right">

            {/* Probability breakdown */}
            <div className="prob-card card anim-fade-up delay-2">
              <h3 className="prob-title">Probability Breakdown</h3>
              <div className="prob-list">
                {sortedProbs.map(([cls, prob]) => {
                  const pct = (prob * 100).toFixed(2)
                  const color = CLASS_COLORS[cls]
                  const isTop = cls === results.predicted_class
                  return (
                    <div key={cls} className={`prob-row ${isTop ? 'prob-row--top' : ''}`}>
                      <div className="prob-row-header">
                        <span className="prob-class">{DISEASES[cls]?.label || cls}</span>
                        <span className="prob-pct" style={{ color: isTop ? color : undefined }}>
                          {pct}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${pct}%`,
                            background: isTop ? color : 'var(--bg-3)',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Disease info */}
            {disease && (
              <div className="disease-info-card card anim-fade-up delay-3">
                <h3 className="di-title">About {disease.label}</h3>
                <p className="di-desc">{disease.description}</p>

                <div className="di-section">
                  <h4>Key Symptoms</h4>
                  <ul className="di-list">
                    {disease.symptoms.map(s => <li key={s}>{s}</li>)}
                  </ul>
                </div>

                <div className="di-section">
                  <h4>Management</h4>
                  <ul className="di-list">
                    {disease.management.slice(0, 3).map(m => <li key={m}>{m}</li>)}
                  </ul>
                </div>

                <div className="di-meta-row">
                  <div className="di-meta">
                    <span className="di-meta-label">Conditions</span>
                    <span className="di-meta-value">{disease.conditions}</span>
                  </div>
                  <div className="di-meta">
                    <span className="di-meta-label">Yield impact</span>
                    <span className="di-meta-value" style={{ color: results.predicted_class === 'Healthy' ? 'var(--green-bright)' : 'var(--rust-bright)' }}>
                      {disease.yield_loss}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="results-actions anim-fade-up delay-4">
              <Link to="/detect" className="btn btn-outline">
                ← Analyse Another
              </Link>
              <Link to="/disease-guide" className="btn btn-primary">
                Full Disease Guide →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
