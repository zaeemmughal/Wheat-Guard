import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getHealth } from '../utils/api'
import { DISEASES } from '../utils/diseaseData'
import './Home.css'

const STATS = [
  { value: '4',    label: 'Disease Classes' },
  { value: '224²', label: 'Input Resolution' },
  { value: 'ONNX', label: 'Runtime Format' },
  { value: '<50ms',label: 'Avg Inference' },
]

export default function Home() {
  const [apiStatus, setApiStatus] = useState('checking')

  useEffect(() => {
    getHealth()
      .then(() => setApiStatus('online'))
      .catch(() => setApiStatus('offline'))
  }, [])

  return (
    <div className="home">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero__bg-lines" aria-hidden />
        <div className="container hero__content">
          <div className="anim-fade-up">
            <span className="hero__eyebrow">
              <span className={`status-dot status-dot--${apiStatus}`} />
              API {apiStatus === 'checking' ? 'connecting…' : apiStatus}
            </span>
          </div>

          <h1 className="display-xl hero__title anim-fade-up delay-1">
            Diagnose Wheat<br />
            <em>Diseases Instantly</em>
          </h1>

          <p className="hero__subtitle anim-fade-up delay-2">
            Upload a photo of a wheat leaf. Our MobileNetV2 model identifies
            Brown Rust, Septoria, Yellow Rust, and healthy crops in under a second.
          </p>

          <div className="hero__actions anim-fade-up delay-3">
            <Link to="/detect" className="btn btn-primary btn-lg">
              Start Detection →
            </Link>
            <Link to="/disease-guide" className="btn btn-outline btn-lg">
              Disease Guide
            </Link>
          </div>

          <div className="hero__stats anim-fade-up delay-4">
            {STATS.map(s => (
              <div key={s.label} className="hero__stat">
                <span className="hero__stat-value">{s.value}</span>
                <span className="hero__stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero__scroll-hint" aria-hidden>
          <span>scroll</span>
          <span className="hero__scroll-line" />
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="section">
        <div className="divider" />
        <div className="container">
          <div className="section-header">
            <span className="section-label">Process</span>
            <h2 className="display-md">How it works</h2>
          </div>

          <div className="steps">
            {[
              { n: '01', title: 'Upload Image', desc: 'Take or select a photo of a wheat leaf. JPEG, PNG or WebP up to 10 MB.' },
              { n: '02', title: 'AI Analysis',  desc: 'MobileNetV2 preprocesses and classifies the image using ImageNet-normalised inference.' },
              { n: '03', title: 'Get Results',  desc: 'Receive the predicted class, confidence score and full probability breakdown.' },
              { n: '04', title: 'Take Action',  desc: 'Consult the Disease Guide for management recommendations tailored to the diagnosis.' },
            ].map((s, i) => (
              <div key={s.n} className={`step anim-fade-up delay-${i + 1}`}>
                <span className="step__num">{s.n}</span>
                <h3 className="step__title">{s.title}</h3>
                <p className="step__desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Disease cards ── */}
      <section className="section" style={{ background: 'var(--bg-1)' }}>
        <div className="divider" />
        <div className="container">
          <div className="section-header">
            <span className="section-label">Classes</span>
            <h2 className="display-md">What we detect</h2>
          </div>

          <div className="disease-grid">
            {Object.entries(DISEASES).map(([key, d], i) => (
              <Link
                to="/disease-guide"
                key={key}
                className={`disease-card card card-hover anim-fade-up delay-${i + 1}`}
                style={{ '--accent': d.color }}
              >
                <div className="disease-card__icon">{d.icon}</div>
                <div>
                  <span className={`tag ${d.tagClass}`}>{d.severity}</span>
                  <h3 className="disease-card__name">{d.label}</h3>
                  <p className="disease-card__latin">{d.latin}</p>
                  <p className="disease-card__desc">{d.description.slice(0, 110)}…</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section cta-section">
        <div className="container cta-inner">
          <h2 className="display-lg cta-title">
            Ready to analyse<br /><em>your crop?</em>
          </h2>
          <Link to="/detect" className="btn btn-amber btn-lg">
            Upload a Leaf Image →
          </Link>
        </div>
      </section>
    </div>
  )
}
