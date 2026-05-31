import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="divider" />
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="logo-text" style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
            ⟨🌾⟩ WheatGuard
          </span>
          <p className="footer__tagline">
            AI-powered wheat disease detection.<br />
            Built with MobileNetV2 + FastAPI.
          </p>
        </div>

        <div className="footer__links">
          <div className="footer__col">
            <h4>Navigate</h4>
            <Link to="/">Home</Link>
            <Link to="/detect">Detect Disease</Link>
            <Link to="/disease-guide">Disease Guide</Link>
            <Link to="/about">About</Link>
          </div>
          <div className="footer__col">
            <h4>API</h4>
            <a href="/api/docs" target="_blank" rel="noopener">Swagger UI</a>
            <a href="/api/health" target="_blank" rel="noopener">Health Check</a>
            <a href="/api/model-info" target="_blank" rel="noopener">Model Info</a>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <span className="footer__meta">
            MobileNetV2 · 4 classes · ImageNet pretrained · ONNX Runtime
          </span>
          <span className="footer__copy">
            © {new Date().getFullYear()} WheatGuard
          </span>
        </div>
      </div>
    </footer>
  )
}
