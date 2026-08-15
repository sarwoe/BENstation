'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import useCartStore from '../store/useCartStore'
import PaymentModal from '../components/PaymentModal'
import Head from 'next/head'

const SAMPLE_PRODUCTS = [
  { id: 1, name: 'Double Cheese Burger', category: 'Burger', price: 65000, stock: 15, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&auto=format&fit=crop' },
  { id: 2, name: 'Crispy Chicken Burger', category: 'Burger', price: 45000, stock: 20, image_url: 'https://images.unsplash.com/photo-1594179047519-f347310d3322?q=80&w=300&auto=format&fit=crop' },
  { id: 3, name: 'Sausage Roll Deluxe', category: 'Snack', price: 35000, stock: 30, image_url: 'https://images.unsplash.com/photo-1621244301548-52292f75bd3b?q=80&w=300&auto=format&fit=crop' },
  { id: 4, name: 'Supreme Pizza Large', category: 'Pizza', price: 125000, stock: 10, image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300&auto=format&fit=crop' },
  { id: 5, name: 'Vegetarian Pasta', category: 'Pasta', price: 55000, stock: 25, image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=300&auto=format&fit=crop' },
  { id: 6, name: 'Cola Float', category: 'Minuman', price: 20000, stock: 50, image_url: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?q=80&w=300&auto=format&fit=crop' },
];

export default function Home() {
  const [products, setProducts] = useState(SAMPLE_PRODUCTS)
  const [categories, setCategories] = useState(['All', 'Burger', 'Snack', 'Pizza', 'Pasta', 'Minuman'])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)

  const { cart, addToCart, updateQuantity, clearCart, getTotal } = useCartStore()

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase.from('products').select('*')
        if (data && data.length > 0) {
          setProducts(data)
          const uniqueCategories = ['All', ...new Set(data.map(item => item.category))]
          setCategories(uniqueCategories)
        }
      } catch (err) {
        console.error('Supabase fetch failed, using sample data:', err)
      }
    }
    fetchData()
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    const matchesSearch = product.name?.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <>
      <Head><title>BENstation</title></Head>
      
      {/* Container Utama: Di HP scroll normal (min-h-screen), di Desktop terkunci rapi (md:h-screen md:overflow-hidden) */}
      <div className="flex flex-col md:flex-row min-h-screen md:h-screen bg-neutral-50 font-sans text-neutral-800 md:overflow-hidden">
        
        {/* Area Utama (Menu) */}
        <div className="flex-1 flex flex-col md:overflow-hidden">
          <header className="bg-white p-4 flex justify-between items-center border-b border-neutral-100 shrink-0 sticky top-0 z-10 md:relative">
            <h1 className="text-2xl font-extrabold text-neutral-950 tracking-tighter">BEN<span className='text-rose-600'>station</span></h1>
            <input
              type="text"
              placeholder="Cari menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-neutral-200 rounded-full px-4 py-2 w-40 md:w-60 focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm"
            />
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
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white rounded-2xl shadow-sm p-3 cursor-pointer hover:border-rose-300 border border-neutral-100 transition group flex flex-col justify-between"
                >
                  <div>
                    <div className="h-32 bg-neutral-100 rounded-xl mb-3 overflow-hidden">
                      {product.image_url && (
                        <img src={product.image_url} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-neutral-900 truncate leading-snug">{product.name}</h3>
                    <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider mt-0.5">{product.category}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-neutral-100 flex justify-between items-center">
                    <span className="font-extrabold text-rose-600 text-sm">Rp {product.price?.toLocaleString('id-ID')}</span>
                    <span className="text-[10px] bg-neutral-100 px-2 py-1 rounded-full text-neutral-500 font-bold">Stok {product.stock}</span>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>

        {/* Panel Keranjang (Di HP berada pas di bawah menu, di Desktop menempel di sebelah kanan) */}
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

        {/* Modal Pembayaran */}
        {isPaymentOpen && (
          <PaymentModal
            isOpen={isPaymentOpen}
            onClose={() => setIsPaymentOpen(false)}
            total={getTotal()}
          />
        )}
      </div>
    </>
  )
}
