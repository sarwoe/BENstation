'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import useCartStore from '../store/useCartStore'
import PaymentModal from '../components/PaymentModal'
import Link from 'next/link'

export default function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(['All'])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const { cart, addToCart, updateQuantity, clearCart, getTotal } = useCartStore()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*').order('id', { ascending: false }),
        supabase.from('categories').select('*')
      ])
      
      if (productsRes.data) {
        setProducts(productsRes.data)
      }

      if (categoriesRes.data && categoriesRes.data.length > 0) {
        const catNames = categoriesRes.data.map(c => c.name)
        setCategories(['All', ...new Set(catNames)])
      } else if (productsRes.data) {
        const unique = ['All', ...new Set(productsRes.data.map(item => item.category))]
        setCategories(unique)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }

  const handleClosePayment = () => {
    setIsPaymentOpen(false)
    fetchData() // Refresh stok produk dari database secara real-time setelah pembayaran
  }

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    const matchesSearch = product.name?.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleAddToCart = (product) => {
    const stockNum = Number(product.stock) || 0
    if (stockNum <= 0) {
      alert(`Stok menu "${product.name}" sudah habis!`)
      return
    }
    addToCart(product)
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen md:h-screen bg-neutral-50 font-sans text-neutral-800 md:overflow-hidden">
      
      {/* Area Utama (Menu) */}
      <div className="flex-1 flex flex-col md:overflow-hidden">
        <header className="bg-white p-4 flex justify-between items-center border-b border-neutral-100 shrink-0 sticky top-0 z-10 md:relative">
          <h1 className="text-2xl font-extrabold text-neutral-950 tracking-tighter">BEN<span className='text-rose-600'>station</span></h1>
          
          <div className="flex items-center gap-2 md:gap-3">
            <input
              type="text"
              placeholder="Cari menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-neutral-200 rounded-full px-4 py-2 w-32 md:w-60 focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm"
            />
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        <div className="bg-white border-b border-neutral-100 px-4 py-3 flex space-x-2 overflow-x-auto shrink-0 sticky top-[65px] z-10 md:relative md:top-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition ${
                selectedCategory === cat ? 'bg-rose-600 text-white shadow-sm' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <main className="flex-1 md:overflow-y-auto p-4 md:p-6 bg-neutral-50">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const stockNum = Number(product.stock) || 0
              const isOutOfStock = stockNum <= 0

              return (
                <div
                  key={product.id}
                  onClick={() => !isOutOfStock && handleAddToCart(product)}
                  className={`bg-white rounded-2xl p-3 border transition flex flex-col justify-between select-none ${
                    isOutOfStock 
                      ? 'opacity-50 cursor-not-allowed border-neutral-200 bg-neutral-100/60' 
                      : 'border-neutral-100 shadow-sm cursor-pointer hover:border-rose-300 group'
                  }`}
                >
                  <div>
                    <div className="h-32 bg-neutral-100 rounded-xl mb-3 overflow-hidden relative">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className={`h-full w-full object-cover transition duration-300 ${isOutOfStock ? 'grayscale' : 'group-hover:scale-105'}`}
                          onError={(e) => { e.target.style.display = 'none' }} 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                      )}

                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="bg-rose-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                            Stok Habis
                          </span>
                        </div>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-neutral-900 truncate leading-snug">{product.name}</h3>
                    <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider mt-0.5">{product.category}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-neutral-100 flex justify-between items-center">
                    <span className="font-extrabold text-rose-600 text-sm">Rp {product.price?.toLocaleString('id-ID')}</span>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                      isOutOfStock ? 'bg-rose-100 text-rose-600' : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      {isOutOfStock ? 'Stok 0' : `Stok ${stockNum}`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </main>
      </div>

      {/* Panel Keranjang */}
      <div className="w-full md:w-[420px] bg-white border-t md:border-t-0 md:border-l border-neutral-200 flex flex-col shadow-xl shrink-0 mt-6 md:mt-0">
        <div className="p-4 border-b border-neutral-100 flex justify-between items-center shrink-0">
          <h2 className="text-base font-extrabold text-neutral-900">Pesanan Aktif</h2>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-xs font-semibold text-neutral-400 hover:text-rose-600 transition">Hapus Semua</button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[180px] md:min-h-0">
          {cart.length === 0 ? (
            <div className="text-center text-neutral-400 py-10">
              <p className="text-sm font-semibold">Keranjang Kosong</p>
              <p className="text-xs text-neutral-300 mt-1">Klik menu untuk menambahkan</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                <div className="flex-1">
                  <p className="text-sm font-bold text-neutral-900 leading-snug">{item.name}</p>
                  <p className="text-xs font-extrabold text-rose-600 mt-0.5">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="flex items-center space-x-2 border border-neutral-100 rounded-full p-1">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center text-xs font-bold text-neutral-700 hover:bg-neutral-200">-</button>
                  <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-rose-700">+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 shrink-0 sticky bottom-0 md:relative">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Tagihan:</span>
            <span className="text-2xl font-black text-rose-600">Rp {getTotal().toLocaleString('id-ID')}</span>
          </div>
          <button
            disabled={cart.length === 0}
            onClick={() => setIsPaymentOpen(true)}
            className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold py-3.5 rounded-2xl shadow-lg transition text-base"
          >
            Bayar Sekarang
          </button>
        </div>
      </div>

      {/* Drawer Menu Navigasi */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-72 bg-white h-full p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-8 border-b pb-4">
                <h2 className="font-extrabold text-lg text-neutral-900">Pengaturan POS</h2>
                <button onClick={() => setIsMenuOpen(false)} className="text-neutral-400 font-bold hover:text-rose-600">✕</button>
              </div>
              
              <nav className="space-y-3">
                <Link href="/history" className="flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 hover:text-rose-600 font-bold text-neutral-700 transition">
                  <span>📜</span> Riwayat Pembelian
                </Link>
                <Link href="/manage-menu" className="flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 hover:text-rose-600 font-bold text-neutral-700 transition">
                  <span>🍔</span> Update & Tambah Menu
                </Link>
                <Link href="/manage-categories" className="flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 hover:text-rose-600 font-bold text-neutral-700 transition">
                  <span>🏷️</span> Update Kategori
                </Link>
              </nav>
            </div>

            <div className="text-xs text-neutral-400 border-t pt-4 text-center font-semibold">
              BENstation POS v2.0
            </div>
          </div>
        </div>
      )}

      {/* Modal Pembayaran */}
      {isPaymentOpen && (
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={handleClosePayment}
          total={getTotal()}
        />
      )}
    </div>
  )
}
