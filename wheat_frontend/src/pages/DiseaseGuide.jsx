import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DISEASES, DISEASE_ORDER } from '../utils/diseaseData'
import './DiseaseGuide.css'

export default function DiseaseGuide() {
  const [active, setActive] = useState('Brown_Rust')
  const disease = DISEASES[active]

  const CLASS_COLORS = {
    Brown_Rust:  'var(--rust-bright)',
    Healthy:     'var(--green-bright)',
    Septoria:    '#b090d8',
    Yellow_Rust: 'var(--amber-bright)',
  }

  return (
    <div className="guide-page">
      <div className="container">

        <div className="guide-header anim-fade-up">
          <span className="section-label">Reference</span>
          <h1 className="display-lg">Disease Guide</h1>
          <p className="guide-subtitle">
            Detailed identification, symptom recognition, and integrated management
            for the four conditions detected by WheatGuard.
          </p>
        </div>

        <div className="guide-layout">

          {/* ── Tab selector ── */}
          <nav className="guide-tabs anim-fade-up delay-1">
            {DISEASE_ORDER.map(key => {
              const d = DISEASES[key]
              return (
                <button
                  key={key}
                  className={`guide-tab ${active === key ? 'guide-tab--active' : ''}`}
                  onClick={() => setActive(key)}
                  style={{ '--tab-accent': CLASS_COLORS[key] }}
                >
                  <span className="guide-tab__icon">{d.icon}</span>
                  <div className="guide-tab__text">
                    <span className="guide-tab__name">{d.label}</span>
                    <span className="guide-tab__latin">{d.latin}</span>
                  </div>
                  <span className={`tag ${d.tagClass} guide-tab__severity`}>{d.severity}</span>
                </button>
              )
            })}
          </nav>

          {/* ── Content panel ── */}
          <div className="guide-content anim-fade-in" key={active}>
            <div
              className="guide-panel-header"
              style={{ '--accent': CLASS_COLORS[active] }}
            >
              <div className="gph-icon">{disease.icon}</div>
              <div>
                <span className={`tag ${disease.tagClass}`}>{disease.severity} Severity</span>
                <h2 className="gph-name">{disease.label}</h2>
                <p className="gph-latin">{disease.latin}</p>
              </div>
            </div>

            <p className="guide-description">{disease.description}</p>

            <div className="guide-grid">

              <div className="guide-section">
                <h3 className="gs-title">
                  <span className="gs-num">01</span> Symptoms
                </h3>
                <ul className="gs-list">
                  {disease.symptoms.map(s => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="guide-section">
                <h3 className="gs-title">
                  <span className="gs-num">02</span> Management
                </h3>
                <ul className="gs-list">
                  {disease.management.map(m => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>

              <div className="guide-section guide-section--wide">
                <h3 className="gs-title">
                  <span className="gs-num">03</span> Environmental Conditions
                </h3>
                <p className="guide-prose">{disease.conditions}</p>
              </div>

              <div className="guide-section guide-section--wide">
                <h3 className="gs-title">
                  <span className="gs-num">04</span> Yield Impact
                </h3>
                <p
                  className="guide-yield"
                  style={{ color: active === 'Healthy' ? 'var(--green-bright)' : 'var(--rust-bright)' }}
                >
                  {disease.yield_loss}
                </p>
              </div>
            </div>

            <div className="guide-cta">
              <Link to="/detect" className="btn btn-primary">
                Detect This Disease →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
