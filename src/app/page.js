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
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const { cart, addToCart, updateQuantity, clearCart, getTotal } = useCartStore()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('products').select('*')
      if (error) setupData(SAMPLE_PRODUCTS)
      else if (data && data.length > 0) setupData(data)
      else setupData(SAMPLE_PRODUCTS)
    } catch (err) {
      setupData(SAMPLE_PRODUCTS)
    } finally {
      setLoading(false)
    }
  }

  function setupData(data) {
    setProducts(data || [])
    const uniqueCategories = ['All', ...new Set(data.map((item) => item.category))]
    setCategories(uniqueCategories)
  }

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <>
      <Head><title>BENstation</title></Head>

      {/* Wrapper utama: flex-col di HP, flex-row di Desktop (md) */}
      <div className="flex flex-col md:flex-row h-screen bg-neutral-50 font-sans text-neutral-800">
        
        {/* Main Content (Kiri) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white p-4 flex justify-between items-center border-b border-neutral-100 shrink-0">
            <h1 className="text-2xl font-extrabold text-neutral-950 tracking-tighter">BEN<span className='text-rose-600'>station</span></h1>
            <input
              type="text"
              placeholder="Cari menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-neutral-200 rounded-full px-4 py-2 w-40 md:w-60 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </header>

          <div className="bg-white border-b border-neutral-100 px-4 py-3 flex space-x-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${selectedCategory === cat ? 'bg-rose-600 text-white' : 'bg-neutral-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-neutral-50">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} onClick={() => addToCart(product)} className="bg-white rounded-xl shadow-sm p-3 cursor-pointer hover:border-rose-300 border border-transparent transition">
                  <div className="h-32 bg-neutral-100 rounded-lg mb-2 overflow-hidden">
                    {product.image_url && <img src={product.image_url} className="h-full w-full object-cover" />}
                  </div>
                  <h3 className="font-bold text-sm truncate">{product.name}</h3>
                  <p className="font-bold text-rose-600 text-sm">Rp {product.price?.toLocaleString('id-ID')}</p>
                </div>
              ))}
            </div>
          </main>
        </div>

        {/* Cart Sidebar (Kanan) */}
        {/* Di HP lebarnya penuh, di Desktop lebarnya 420px */}
        <div className="w-full md:w-[420px] bg-white border-l border-neutral-100 flex flex-col shadow-xl shrink-0">
          <div className="p-4 border-b border-neutral-100 flex justify-between items-center">
            <h2 className="text-lg font-bold">Pesanan Aktif</h2>
            {cart.length > 0 && <button onClick={clearCart} className="text-xs text-neutral-400">Hapus Semua</button>}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center text-neutral-400 py-10">Keranjang Kosong</div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 border-b pb-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-rose-600">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 bg-neutral-100 rounded-full">-</button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 bg-rose-600 text-white rounded-full">+</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t bg-neutral-50">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold">Total:</span>
              <span className="text-2xl font-extrabold text-rose-600">Rp {getTotal().toLocaleString('id-ID')}</span>
            </div>
            <button disabled={cart.length === 0} onClick={() => setIsPaymentOpen(true)} className="w-full bg-rose-600 text-white font-bold py-3 rounded-xl">
              Bayar Sekarang
            </button>
          </div>
        </div>

        {isPaymentOpen && <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />}
      </div>
    </>
  )
}
