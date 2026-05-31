import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Detect from './pages/Detect'
import Results from './pages/Results'
import DiseaseGuide from './pages/DiseaseGuide'
import About from './pages/About'
import { ResultsProvider } from './hooks/useResults'

export default function App() {
  return (
    <BrowserRouter>
      <ResultsProvider>
        <div className="page-wrapper">
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/"             element={<Home />} />
              <Route path="/detect"       element={<Detect />} />
              <Route path="/results"      element={<Results />} />
              <Route path="/disease-guide" element={<DiseaseGuide />} />
              <Route path="/about"        element={<About />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ResultsProvider>
    </BrowserRouter>
  )
}
