'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Link from 'next/link'

export default function ManageMenuPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [category, setCategory] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: catData } = await supabase.from('categories').select('*')
    if (catData && catData.length > 0) {
      setCategories(catData)
      setCategory(catData[0].name)
    }

    const { data: prodData } = await supabase.from('products').select('*').order('id', { ascending: false })
    if (prodData) setProducts(prodData)
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!name.trim() || !price) return alert('Nama dan Harga wajib diisi')
    setLoading(true)

    // Jika URL gambar kosong, biarkan null atau gambar kosong netral
    const cleanImageUrl = imageUrl.trim() ? imageUrl.trim() : null

    const newProduct = {
      name,
      price: Number(price),
      stock: Number(stock) || 0,
      category: category || 'Umum',
      image_url: cleanImageUrl
    }

    const { error } = await supabase.from('products').insert([newProduct])

    if (error) {
      alert('Gagal menambah menu: ' + error.message)
    } else {
      setName('')
      setPrice('')
      setStock('')
      setImageUrl('')
      fetchData()
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (confirm('Hapus menu ini?')) {
      await supabase.from('products').delete().eq('id', id)
      fetchData()
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-neutral-900">Kelola Menu & Produk</h1>
          <Link href="/" className="text-xs font-bold bg-white border border-neutral-200 px-4 py-2 rounded-full shadow-sm hover:bg-neutral-100 transition">
            ← Kembali
          </Link>
        </div>

        <form onSubmit={handleAddProduct} className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm mb-6 space-y-4">
          <h2 className="font-extrabold text-sm text-neutral-800">Tambah Menu Baru</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nama Menu (misal: Cilok Ori)..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              required
            />
            <input
              type="number"
              placeholder="Harga (Rp)..."
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              required
            />
            <input
              type="number"
              placeholder="Stok Awal..."
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <input
            type="url"
            placeholder="URL Link Gambar Asli (.jpg / .png)..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-2.5 rounded-xl text-sm transition disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan Menu Baru'}
          </button>
        </form>

        <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100 shadow-sm">
          {products.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-400 font-semibold">
              Belum ada menu tersimpan di database.
            </div>
          ) : (
            products.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-12 h-12 object-cover rounded-xl bg-neutral-100" onError={(e) => { e.target.style.display = 'none' }} />
                  ) : (
                    <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 font-bold text-xs">
                      🍽️
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-sm text-neutral-800">{p.name}</h3>
                    <p className="text-xs text-rose-600 font-extrabold">Rp {p.price?.toLocaleString('id-ID')} <span className="text-neutral-400 font-normal">| Stok: {p.stock}</span></p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
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
