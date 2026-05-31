import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
})

export async function predictImage(file) {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post('/predict', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function predictBatch(files) {
  const form = new FormData()
  files.forEach(f => form.append('files', f))
  const res = await api.post('/predict-batch', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function getHealth() {
  const res = await api.get('/health')
  return res.data
}

export async function getModelInfo() {
  const res = await api.get('/model-info')
  return res.data
}
