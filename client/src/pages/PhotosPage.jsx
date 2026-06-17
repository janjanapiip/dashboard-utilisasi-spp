import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const MONTHS = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
]

function Lightbox({ photos, index, onClose }) {
  const [cur, setCur] = useState(index)

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setCur(c => Math.min(c + 1, photos.length - 1))
      if (e.key === 'ArrowLeft')  setCur(c => Math.max(c - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [photos.length, onClose])

  if (!photos.length) return null
  const photo = photos[cur]

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-3xl leading-none hover:text-gray-300"
      >✕</button>

      {cur > 0 && (
        <button
          onClick={e => { e.stopPropagation(); setCur(c => c - 1) }}
          className="absolute left-4 text-white text-4xl hover:text-gray-300 select-none"
        >‹</button>
      )}
      {cur < photos.length - 1 && (
        <button
          onClick={e => { e.stopPropagation(); setCur(c => c + 1) }}
          className="absolute right-4 text-white text-4xl hover:text-gray-300 select-none"
        >›</button>
      )}

      <img
        src={photo.dataUrl}
        alt={photo.filename}
        className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      />
      <p className="absolute bottom-4 text-white/70 text-sm">{photo.filename} ({cur + 1}/{photos.length})</p>
    </div>
  )
}

function PhotoCard({ docKey, photos, isAdmin, onUpload, onDelete }) {
  const [, month, lab, date] = docKey.split('||')
  const [lightboxIdx, setLightboxIdx] = useState(null)

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">
          {lab} — {date} {month}
        </span>
        {isAdmin && (
          <label className="cursor-pointer text-xs text-blue-600 hover:text-blue-800 font-medium">
            + Foto
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { if (e.target.files[0]) onUpload(docKey, e.target.files[0]) }}
            />
          </label>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="flex items-center justify-center py-10 text-gray-300 text-sm">
          Belum ada foto
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 p-2">
          {photos.map((photo, idx) => (
            <div key={idx} className="relative group aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={photo.dataUrl}
                alt={photo.filename}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition duration-200"
                onClick={() => setLightboxIdx(idx)}
              />
              {isAdmin && (
                <button
                  onClick={() => onDelete(docKey, idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {lightboxIdx !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </div>
  )
}

export default function PhotosPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const currentMonthName = MONTHS[new Date().getMonth()]
  const [month, setMonth] = useState(currentMonthName)
  const [photoMap, setPhotoMap] = useState({})   // { key: photos[] }
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fetchPhotos = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/photos', { params: { month } })
      setPhotoMap(res.data)
    } catch {
      setPhotoMap({})
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => { fetchPhotos() }, [fetchPhotos])

  const handleUpload = async (key, file) => {
    if (file.size > 1_000_000) {
      alert('Ukuran file maksimal 1 MB.')
      return
    }
    setUploading(true)
    try {
      const dataUrl = await readFileAsDataUrl(file)
      const res = await api.post('/photos', { key, dataUrl, filename: file.name })
      setPhotoMap(prev => ({ ...prev, [key]: res.data }))
    } catch (err) {
      alert(err.response?.data?.error || 'Upload gagal.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (key, idx) => {
    if (!confirm('Hapus foto ini?')) return
    try {
      const res = await api.delete('/photos', { data: { key, idx } })
      setPhotoMap(prev => ({ ...prev, [key]: res.data }))
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus.')
    }
  }

  const keys = Object.keys(photoMap).sort()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Galeri Foto</h1>
          <p className="text-gray-500 text-sm mt-0.5">Dokumentasi kegiatan — {month} 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MONTHS.map(m => <option key={m}>{m}</option>)}
          </select>
          {uploading && (
            <span className="text-sm text-blue-600 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Mengunggah…
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : keys.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <svg className="mx-auto w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>Belum ada foto untuk {month}.</p>
          {isAdmin && <p className="text-sm mt-1">Tambahkan foto melalui kartu aktivitas di atas.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {keys.map(key => (
            <PhotoCard
              key={key}
              docKey={key}
              photos={photoMap[key] || []}
              isAdmin={isAdmin}
              onUpload={handleUpload}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = e => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
