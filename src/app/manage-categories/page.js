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

    await supabase.from('categories').insert([{ name }])
    setName('')
    setLoading(false)
    fetchCategories()
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
          <Link href="/" className="text-xs font-bold bg-white border px-4 py-2 rounded-full">← Kembali</Link>
        </div>

        <form onSubmit={handleAdd} className="bg-white p-4 rounded-2xl border mb-6 flex gap-2">
          <input
            type="text"
            placeholder="Nama Kategori Baru..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border rounded-xl px-4 py-2 text-sm"
          />
          <button type="submit" disabled={loading} className="bg-rose-600 text-white font-bold px-5 py-2 rounded-xl text-sm">
            Tambah
          </button>
        </form>

        <div className="bg-white rounded-2xl border divide-y">
          {categories.map((c) => (
            <div key={c.id} className="p-4 flex justify-between items-center">
              <span className="font-bold text-sm">{c.name}</span>
              <button onClick={() => handleDelete(c.id)} className="text-xs text-rose-600 font-bold bg-rose-50 px-3 py-1 rounded-lg">
                Hapus
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
