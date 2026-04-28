import { useState, useRef, useCallback } from 'react'
import api from '../api/axios'

const LESION_LABELS = [
  'Actinic keratosis',
  'Basal cell carcinoma',
  'Benign keratosis',
  'Dermatofibroma',
  'Melanocytic nevi',
  'Melanoma',
  'Vascular lesion',
]

const RISK_CONFIG = {
  low: { label: 'Low Risk', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  medium: { label: 'Medium Risk', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  high: { label: 'High Risk', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
}

const BAR_COLORS = [
  'bg-sky-400', 'bg-rose-400', 'bg-violet-400',
  'bg-teal-400', 'bg-orange-400', 'bg-blue-400', 'bg-pink-400',
]

export default function Dashboard() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const inputRef = useRef()

  function handleFile(f) {
    if (!f) return
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(f.type)) {
      setError('Only JPG and PNG images are supported.')
      return
    }
    setError('')
    setFile(f)
    setResult(null)
    setPreview(URL.createObjectURL(f))
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [])

  async function handleSubmit() {
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const form = new FormData()
      form.append('image', file)
      const res = await api.post('/api/predict', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Prediction failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function clearImage() {
    setFile(null)
    setPreview(null)
    setResult(null)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const risk = result ? RISK_CONFIG[result.risk_level?.toLowerCase()] ?? RISK_CONFIG.medium : null
  const probs = result?.all_predictions ?? result?.all_probabilities ?? result?.probabilities ?? null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Skin Lesion Analysis</h1>
        <p className="text-slate-500 text-sm mt-1">Upload a dermoscopy image to get an AI-powered diagnosis</p>
      </div>

      {/* Upload Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <h2 className="text-base font-semibold text-slate-700">Upload Image</h2>

        {!preview ? (
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition
              ${dragging ? 'border-teal-400 bg-teal-50' : 'border-slate-200 hover:border-teal-400 hover:bg-slate-50'}`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              className="hidden"
              onChange={e => handleFile(e.target.files[0])}
            />
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-slate-700 font-medium">Drag &amp; drop an image here</p>
                <p className="text-slate-400 text-sm mt-0.5">or click to browse — JPG, PNG up to 5 MB</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden border border-slate-200">
            <img src={preview} alt="Preview" className="w-full max-h-72 object-contain bg-slate-50" />
            <button
              onClick={clearImage}
              className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow border border-slate-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!file || loading}
          className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-lg transition shadow-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Analyzing image…
            </>
          ) : 'Analyze Image'}
        </button>
      </div>

      {/* Results Card */}
      {result && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-700">Analysis Results</h2>
            {risk && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${risk.bg} ${risk.text} ${risk.border}`}>
                <span className={`w-2 h-2 rounded-full ${risk.dot}`} />
                {risk.label}
              </span>
            )}
          </div>

          {/* Lesion Type */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Detected Condition</p>
            <p className="text-2xl font-bold text-slate-800">{result.lesion_type}</p>
          </div>

          {/* Confidence Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-600">Confidence</span>
              <span className="text-sm font-bold text-teal-600">{(result.confidence * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-700"
                style={{ width: `${(result.confidence * 100).toFixed(1)}%` }}
              />
            </div>
          </div>

          {/* Probability Chart */}
          {probs && (() => {
            const rows = LESION_LABELS.map((label, i) => ({
              label,
              colorClass: BAR_COLORS[i],
              val: Array.isArray(probs) ? probs[i] : probs[label] ?? 0,
            })).sort((a, b) => b.val - a.val)

            return (
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">Class Probabilities</p>
                <div className="rounded-xl border border-slate-100 overflow-hidden">
                  {rows.map(({ label, colorClass, val }, i) => {
                    const pct = (val * 100).toFixed(1)
                    const isPredicted = label.toLowerCase() === result.lesion_type?.toLowerCase()
                    return (
                      <div
                        key={label}
                        className={`flex items-center gap-3 px-4 py-2.5 ${isPredicted ? 'bg-teal-50' : i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}
                      >
                        <span className={`w-44 text-xs font-medium truncate shrink-0 ${isPredicted ? 'text-teal-700' : 'text-slate-600'}`}>
                          {label}
                          {isPredicted && (
                            <span className="ml-1.5 text-teal-500">✓</span>
                          )}
                        </span>
                        <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${isPredicted ? 'bg-teal-500' : colorClass}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={`w-12 text-xs text-right tabular-nums font-medium ${isPredicted ? 'text-teal-700' : 'text-slate-500'}`}>
                          {pct}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          <p className="text-xs text-slate-400 border-t border-slate-100 pt-4">
            This analysis is for informational purposes only and is not a substitute for professional medical advice.
          </p>
        </div>
      )}
    </div>
  )
}
