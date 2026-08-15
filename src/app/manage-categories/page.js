'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Link from 'next/link'

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('id', { ascending: false })
    if (data) setCategories(data)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)

    // Membuat slug otomatis dari nama (contoh: "Minuman Dingin" -> "minuman-dingin")
    const slug = name.toLowerCase().trim().replace(/\s+/g, '-')

    const { error } = await supabase.from('categories').insert([{ name, slug }])
    
    if (error) {
      alert('Gagal menambah kategori: ' + error.message)
    } else {
      setName('')
      fetchCategories()
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (confirm('Hapus kategori ini?')) {
      await supabase.from('categories').delete().eq('id', id)
      fetchCategories()
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8 font-sans">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black">Kelola Kategori</h1>
          <Link href="/" className="text-xs font-bold bg-white border px-4 py-2 rounded-full shadow-sm hover:bg-neutral-100 transition">
            ← Kembali
          </Link>
        </div>

        <form onSubmit={handleAdd} className="bg-white p-4 rounded-2xl border mb-6 flex gap-2 shadow-sm">
          <input
            type="text"
            placeholder="Nama Kategori Baru..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
          <button 
            type="submit" 
            disabled={loading} 
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2 rounded-xl text-sm transition disabled:opacity-50"
          >
            {loading ? '...' : 'Tambah'}
          </button>
        </form>

        <div className="bg-white rounded-2xl border divide-y shadow-sm">
          {categories.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-400 font-semibold">
              Belum ada kategori tersimpan.
            </div>
          ) : (
            categories.map((c) => (
              <div key={c.id} className="p-4 flex justify-between items-center">
                <span className="font-bold text-sm text-neutral-800">{c.name}</span>
                <button 
                  onClick={() => handleDelete(c.id)} 
                  className="text-xs text-rose-600 font-bold bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition"
                >
                  Hapus
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
