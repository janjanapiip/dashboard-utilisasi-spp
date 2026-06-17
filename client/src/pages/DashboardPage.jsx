import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const MONTHS = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
]

const LABS = ['Lab A','Lab B','Lab C','Lab D','Lab E']

const EMPTY_FORM = {
  date: '', lab: '', kegiatan: '', pengguna: '', fr: 0, jlh: 0, drs: 0
}

function StatCard({ label, value, color }) {
  return (
    <div className={`bg-white rounded-xl shadow p-5 border-l-4 ${color}`}>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  )
}

function ActivityRow({ act, isAdmin, onEdit, onDelete }) {
  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-4 py-3 text-sm text-gray-700">{act.date}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{act.lab}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{act.kegiatan || '-'}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{act.pengguna || '-'}</td>
      <td className="px-4 py-3 text-sm text-center text-gray-700">{act.fr}</td>
      <td className="px-4 py-3 text-sm text-center text-gray-700">{act.jlh}</td>
      <td className="px-4 py-3 text-sm text-center text-gray-700">{act.drs}</td>
      {isAdmin && (
        <td className="px-4 py-3 text-sm text-center">
          <button
            onClick={() => onEdit(act)}
            className="text-blue-600 hover:text-blue-800 mr-3 font-medium"
          >Edit</button>
          <button
            onClick={() => onDelete(act._id)}
            className="text-red-500 hover:text-red-700 font-medium"
          >Hapus</button>
        </td>
      )}
    </tr>
  )
}

function ActivityModal({ open, initial, month, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) setForm(initial ? { ...initial } : { ...EMPTY_FORM })
  }, [open, initial])

  if (!open) return null

  const handleChange = e => {
    const { name, value, type } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (initial?._id) {
        await api.put(`/activities/${initial._id}`, { ...form, month })
      } else {
        await api.post('/activities', { ...form, month })
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan.')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-800 text-lg">
            {initial?._id ? 'Edit Aktivitas' : 'Tambah Aktivitas'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Tanggal</label>
              <input name="date" type="number" min={1} max={31} value={form.date} onChange={handleChange} required className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Lab</label>
              <select name="lab" value={form.lab} onChange={handleChange} required className={inputCls}>
                <option value="">-- Pilih Lab --</option>
                {LABS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Kegiatan</label>
            <input name="kegiatan" value={form.kegiatan} onChange={handleChange} className={inputCls} placeholder="Nama kegiatan" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Pengguna</label>
            <input name="pengguna" value={form.pengguna} onChange={handleChange} className={inputCls} placeholder="Nama pengguna / instansi" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {['fr','jlh','drs'].map(field => (
              <div key={field}>
                <label className="text-xs font-medium text-gray-600 mb-1 block uppercase">{field}</label>
                <input name={field} type="number" min={0} value={form[field]} onChange={handleChange} className={inputCls} />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">Batal</button>
            <button type="submit" disabled={saving} className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition">
              {saving ? 'Menyimpan…' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const currentMonthName = MONTHS[new Date().getMonth()]
  const [month, setMonth] = useState(currentMonthName)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [search, setSearch] = useState('')

  const fetchActivities = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/activities', { params: { month } })
      setActivities(res.data)
    } catch {
      setActivities([])
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => { fetchActivities() }, [fetchActivities])

  const handleDelete = async (id) => {
    if (!confirm('Hapus aktivitas ini?')) return
    try {
      await api.delete(`/activities/${id}`)
      fetchActivities()
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus.')
    }
  }

  const handleEdit = (act) => {
    setEditTarget(act)
    setModalOpen(true)
  }

  const handleAdd = () => {
    setEditTarget(null)
    setModalOpen(true)
  }

  // Filtered activities
  const filtered = activities.filter(a => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      String(a.date).includes(q) ||
      a.lab?.toLowerCase().includes(q) ||
      a.kegiatan?.toLowerCase().includes(q) ||
      a.pengguna?.toLowerCase().includes(q)
    )
  })

  // Stats
  const totalFR  = activities.reduce((s, a) => s + (a.fr  || 0), 0)
  const totalJLH = activities.reduce((s, a) => s + (a.jlh || 0), 0)
  const totalDRS = activities.reduce((s, a) => s + (a.drs || 0), 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Utilisasi</h1>
          <p className="text-gray-500 text-sm mt-0.5">Sarana Praktek Pelaut — {month} 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MONTHS.map(m => <option key={m}>{m}</option>)}
          </select>
          {isAdmin && (
            <button
              onClick={handleAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <span className="text-lg leading-none">+</span> Tambah
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total FR" value={totalFR} color="border-blue-500" />
        <StatCard label="Total JLH" value={totalJLH} color="border-green-500" />
        <StatCard label="Total DRS" value={totalDRS} color="border-purple-500" />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {/* Table toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-700">Data Aktivitas — {month}</h2>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari aktivitas…"
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="mx-auto w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>Tidak ada data aktivitas untuk {month}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wider">
                <tr>
                  <th className="px-4 py-3">Tgl</th>
                  <th className="px-4 py-3">Lab</th>
                  <th className="px-4 py-3">Kegiatan</th>
                  <th className="px-4 py-3">Pengguna</th>
                  <th className="px-4 py-3 text-center">FR</th>
                  <th className="px-4 py-3 text-center">JLH</th>
                  <th className="px-4 py-3 text-center">DRS</th>
                  {isAdmin && <th className="px-4 py-3 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(act => (
                  <ActivityRow
                    key={act._id}
                    act={act}
                    isAdmin={isAdmin}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
              <tfoot className="bg-gray-50 text-sm font-semibold text-gray-700">
                <tr>
                  <td colSpan={isAdmin ? 4 : 4} className="px-4 py-3 text-right">Total:</td>
                  <td className="px-4 py-3 text-center">{totalFR}</td>
                  <td className="px-4 py-3 text-center">{totalJLH}</td>
                  <td className="px-4 py-3 text-center">{totalDRS}</td>
                  {isAdmin && <td />}
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <ActivityModal
        open={modalOpen}
        initial={editTarget}
        month={month}
        onClose={() => setModalOpen(false)}
        onSaved={fetchActivities}
      />
    </div>
  )
}
