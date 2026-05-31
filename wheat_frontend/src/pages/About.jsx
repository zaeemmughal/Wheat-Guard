import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getModelInfo } from '../utils/api'
import './About.css'

const TECH_STACK = [
  { layer: 'Model',     tech: 'MobileNetV2',      detail: 'ImageNet pretrained, fine-tuned on wheat dataset' },
  { layer: 'Runtime',   tech: 'ONNX Runtime',      detail: 'CPU + CUDA execution providers' },
  { layer: 'Backend',   tech: 'FastAPI',           detail: 'Python async REST API with Pydantic validation' },
  { layer: 'Frontend',  tech: 'React + Vite',      detail: 'Client-side SPA with React Router' },
  { layer: 'Images',    tech: 'Pillow',            detail: 'Preprocessing: resize to 224×224, ImageNet normalise' },
]

const PIPELINE_STEPS = [
  { label: 'Image Upload',       detail: 'JPEG / PNG / WebP / BMP, max 10 MB' },
  { label: 'PIL Decode',         detail: 'Convert to RGB mode' },
  { label: 'Resize',             detail: '224×224 px with bilinear interpolation' },
  { label: '÷ 255 Normalise',    detail: 'Scale pixel values to [0, 1]' },
  { label: 'ImageNet Normalise', detail: 'mean=[0.485,0.456,0.406] std=[0.229,0.224,0.225]' },
  { label: 'ONNX Inference',     detail: 'Forward pass through MobileNetV2 graph' },
  { label: 'Softmax Output',     detail: '4-class probability vector' },
  { label: 'Top-1 Prediction',   detail: 'argmax → class label + confidence' },
]

export default function About() {
  const [modelInfo, setModelInfo] = useState(null)

  useEffect(() => {
    getModelInfo()
      .then(setModelInfo)
      .catch(() => {})
  }, [])

  return (
    <div className="about-page">
      <div className="container">

        {/* ── Header ── */}
        <div className="about-header anim-fade-up">
          <span className="section-label">About</span>
          <h1 className="display-lg">WheatGuard</h1>
          <p className="about-lead">
            An end-to-end AI system for wheat leaf disease detection, combining a
            MobileNetV2 convolutional neural network with a FastAPI inference
            server and a React web interface.
          </p>
        </div>

        {/* ── Model info live ── */}
        {modelInfo && (
          <div className="model-info-banner anim-fade-up delay-1">
            <span className="mib-label">Live model info</span>
            <div className="mib-chips">
              <span className="mib-chip">{modelInfo.architecture}</span>
              <span className="mib-chip">{modelInfo.framework}</span>
              <span className="mib-chip">{modelInfo.num_classes} classes</span>
              <span className="mib-chip">Input {modelInfo.input_shape.join('×')}</span>
              <span className="mib-chip">{modelInfo.input_dtype}</span>
            </div>
          </div>
        )}

        {/* ── Pipeline ── */}
        <section className="section-sm anim-fade-up delay-2">
          <div className="section-header">
            <span className="section-label">Architecture</span>
            <h2 className="display-md">Inference Pipeline</h2>
          </div>
          <div className="pipeline">
            {PIPELINE_STEPS.map((s, i) => (
              <div key={s.label} className="pipeline-step">
                <div className="pipeline-step__num">{String(i + 1).padStart(2, '0')}</div>
                <div className="pipeline-step__body">
                  <span className="pipeline-step__label">{s.label}</span>
                  <span className="pipeline-step__detail">{s.detail}</span>
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <div className="pipeline-step__arrow">↓</div>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="divider" />

        {/* ── Tech stack ── */}
        <section className="section-sm anim-fade-up">
          <div className="section-header">
            <span className="section-label">Stack</span>
            <h2 className="display-md">Technology</h2>
          </div>
          <div className="tech-table">
            <div className="tech-table__header">
              <span>Layer</span><span>Technology</span><span>Notes</span>
            </div>
            {TECH_STACK.map(t => (
              <div key={t.layer} className="tech-table__row">
                <span className="tt-layer">{t.layer}</span>
                <span className="tt-tech">{t.tech}</span>
                <span className="tt-detail">{t.detail}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="divider" />

        {/* ── Classes ── */}
        <section className="section-sm anim-fade-up">
          <div className="section-header">
            <span className="section-label">Model</span>
            <h2 className="display-md">Detected Classes</h2>
          </div>
          <div className="classes-grid">
            {[
              { key: 'Brown_Rust',  label: 'Brown Rust',  latin: 'Puccinia triticina',     color: 'var(--rust-bright)',   icon: '🟤' },
              { key: 'Healthy',     label: 'Healthy',     latin: 'No pathogen detected',   color: 'var(--green-bright)',  icon: '🌿' },
              { key: 'Septoria',    label: 'Septoria',    latin: 'Zymoseptoria tritici',    color: '#b090d8',              icon: '🟣' },
              { key: 'Yellow_Rust', label: 'Yellow Rust', latin: 'Puccinia striiformis',   color: 'var(--amber-bright)',  icon: '🟡' },
            ].map((c, i) => (
              <div
                key={c.key}
                className={`class-card card card-hover anim-fade-up delay-${i + 1}`}
                style={{ borderTop: `2px solid ${c.color}` }}
              >
                <span className="class-card__icon">{c.icon}</span>
                <span className="class-card__idx" style={{ color: c.color }}>
                  Class {i}
                </span>
                <h3 className="class-card__name">{c.label}</h3>
                <p className="class-card__latin">{c.latin}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="divider" />

        {/* ── API reference ── */}
        <section className="section-sm anim-fade-up">
          <div className="section-header">
            <span className="section-label">API</span>
            <h2 className="display-md">Endpoints</h2>
          </div>
          <div className="api-table">
            {[
              { method: 'GET',  path: '/health',        desc: 'Liveness + readiness probe. Confirms model is loaded.' },
              { method: 'GET',  path: '/model-info',    desc: 'Returns architecture, class names, and input shape.' },
              { method: 'POST', path: '/predict',       desc: 'Single image inference. Accepts multipart/form-data.' },
              { method: 'POST', path: '/predict-batch', desc: 'Batch inference on up to 10 images per request.' },
            ].map(e => (
              <div key={e.path} className="api-row">
                <span className={`api-method api-method--${e.method.toLowerCase()}`}>
                  {e.method}
                </span>
                <span className="api-path">{e.path}</span>
                <span className="api-desc">{e.desc}</span>
              </div>
            ))}
          </div>
          <a
            href="/api/docs"
            target="_blank"
            rel="noopener"
            className="btn btn-outline"
            style={{ marginTop: 20 }}
          >
            Open Swagger UI →
          </a>
        </section>

        {/* ── CTA ── */}
        <div className="about-cta anim-fade-up">
          <Link to="/detect" className="btn btn-primary btn-lg">
            Try it now →
          </Link>
          <Link to="/disease-guide" className="btn btn-outline btn-lg">
            Disease Guide
          </Link>
        </div>

      </div>
    </div>
  )
}
