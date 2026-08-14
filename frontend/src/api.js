import axios from 'axios'

const BASE = '/api'

export const api = axios.create({
  baseURL: BASE,
  timeout: 300000, // 5 min — AI generation can take time
})

/** Upload PDF and get generated golden dataset */
export async function generateDataset(file, onProgress) {
  const form = new FormData()
  form.append('file', file)

  const res = await api.post('/generate', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total))
      }
    },
  })
  return res.data
}

/** Export as PDF — triggers browser download */
export async function exportPDF(dataset) {
  const res = await api.post('/export/pdf', { dataset }, { responseType: 'blob' })
  triggerDownload(res.data, 'application/pdf', 'golden_dataset.pdf')
}

/** Export as DOCX — triggers browser download */
export async function exportDOCX(dataset) {
  const res = await api.post('/export/docx', { dataset }, { responseType: 'blob' })
  triggerDownload(
    res.data,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'golden_dataset.docx'
  )
}

/** Export as JSON — client-side */
export function exportJSON(dataset) {
  const json = JSON.stringify(dataset, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  triggerDownload(blob, 'application/json', 'golden_dataset.json')
}

function triggerDownload(blob, type, filename) {
  const url = URL.createObjectURL(blob instanceof Blob ? blob : new Blob([blob], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
