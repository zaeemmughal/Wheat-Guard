# 🌾 WheatGuard Frontend

React + Vite frontend for the WheatGuard wheat disease detection system.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero, how-it-works, disease cards, CTA |
| `/detect` | Upload page — drag-and-drop leaf image |
| `/results` | Results — verdict, confidence, probability breakdown, disease info |
| `/disease-guide` | Full guide — symptoms, management, conditions for all 4 classes |
| `/about` | Architecture, pipeline, tech stack, API reference |

## Quick Start

```bash
npm install
npm run dev
# → http://localhost:5173
```

The dev server proxies `/api/*` to `http://localhost:8000` automatically.
Make sure the FastAPI backend is running first.

## Production Build

```bash
npm run build
# output in dist/
```

### Serve frontend from FastAPI (single deployment)

Add to `wheat_api/app/main.py`:

```python
from fastapi.staticfiles import StaticFiles

app.mount("/", StaticFiles(directory="../wheat_frontend/dist", html=True), name="frontend")
```

Then install: `pip install aiofiles`

Everything runs on a single port (8000).

## Environment

Copy `.env.example` to `.env.local` and set `VITE_API_URL` if your backend
is not on `localhost:8000`.

## Design System

- **Fonts:** Playfair Display (headings) + DM Sans (body) + DM Mono (code/labels)
- **Theme:** Dark organic-scientific — deep forest greens, warm amber accents
- **CSS variables** defined in `src/index.css`
