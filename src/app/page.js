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

  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, getTotal } = useCartStore()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('products').select('*')
      
      if (error) {
        console.error('Error fetching products from Supabase, using sample data:', error)
        setupData(SAMPLE_PRODUCTS)
      } else if (data && data.length > 0) {
        setupData(data)
      } else {
        setupData(SAMPLE_PRODUCTS)
      }
    } catch (err) {
      console.error('An unexpected error occurred:', err)
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
      <Head>
        <title>BENstation</title>
      </Head>

      <div className="flex h-screen bg-neutral-50 font-sans text-neutral-800">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navbar */}
          <header className="bg-white sticky top-0 z-40 p-4 flex justify-between items-center border-b border-neutral-100">
            <h1 className="text-3xl font-extrabold text-neutral-950 tracking-tighter">BEN<span className='text-rose-600'>station</span></h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari menu lezat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-neutral-200 border rounded-full px-5 py-3 w-80 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition pl-12"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
          </header>

          {/* Categories Bar */}
          <div className="bg-white border-b border-neutral-100 px-4 py-4 flex space-x-3 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <main className="flex-1 overflow-y-auto p-6 bg-neutral-50">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-neutral-950">Menu Utama</h2>
                <p className="text-neutral-600 mt-1">Pilih menu favorit pelanggan Anda.</p>
            </div>

            {loading ? (
                <div className='flex justify-center items-center h-60'>
                    <p className='text-lg text-neutral-500 font-medium'>Memuat Menu...</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className='flex justify-center items-center h-60 bg-white rounded-2xl shadow-inner'>
                    <p className='text-lg text-neutral-500 font-medium'>Tidak ada produk dalam kategori ini.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-4 flex flex-col justify-between cursor-pointer border border-neutral-100 group"
                    >
                    <div>
                        <div className="h-44 bg-neutral-100 rounded-xl mb-4 overflow-hidden flex items-center justify-center text-neutral-400 group-hover:scale-105 transition-transform duration-300">
                        {product.image_url ? (
                            <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover rounded-xl"
                            />
                        ) : (
                            <svg className="h-12 w-12 text-neutral-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                            </svg>
                        )}
                        </div>
                        <h3 className="font-bold text-neutral-900 leading-tight group-hover:text-rose-600 transition-colors">{product.name}</h3>
                        <p className="text-xs text-rose-500 font-medium uppercase tracking-wider mt-1">{product.category}</p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-neutral-100 flex justify-between items-end">
                        <span className="font-extrabold text-lg text-rose-600 tracking-tight">
                        Rp {product.price?.toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs bg-neutral-100 px-3 py-1.5 rounded-full font-medium text-neutral-600">
                        Stok: {product.stock}
                        </span>
                    </div>
                    </div>
                ))}
                </div>
            )}
          </main>
        </div>

        {/* Cart Sidebar */}
        <div className="w-[420px] bg-white border-l border-neutral-100 flex flex-col shadow-xl">
          <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
            <h2 className="text-2xl font-bold text-neutral-950">Pesanan Aktif</h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-neutral-500 hover:text-rose-600 hover:underline transition"
              >
                Hapus Semua
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {cart.length === 0 ? (
              <div className="text-center text-neutral-400 py-12 bg-neutral-100 rounded-2xl border border-dashed border-neutral-200">
                  <svg className="h-16 w-16 text-neutral-300 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                  </svg>
                  <p className='text-neutral-500 font-medium'>Keranjang masih kosong.</p>
                  <p className='text-sm text-neutral-400 mt-1'>Tambahkan menu di sebelah kiri.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 border border-neutral-100 rounded-xl p-4 hover:border-rose-100 transition"
                >
                  <div className="flex items-center gap-3">
                      <div className='h-16 w-16 rounded-lg bg-neutral-100 overflow-hidden flex items-center justify-center'>
                          {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className='h-full w-full object-cover' />
                          ) : (
                                <svg className="h-8 w-8 text-neutral-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                </svg>
                          )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-neutral-900 leading-snug">{item.name}</h4>
                        <p className="text-sm font-bold text-rose-600 mt-1">
                          Rp {item.price?.toLocaleString('id-ID')}
                        </p>
                      </div>
                  </div>
                  <div className="flex items-center space-x-2 border border-neutral-100 rounded-full p-1 bg-neutral-50/50">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center text-sm font-extrabold text-neutral-700 hover:bg-neutral-200"
                    >
                      -
                    </button>
                    <span className="text-sm font-extrabold w-6 text-center text-neutral-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 bg-rose-600 rounded-full flex items-center justify-center text-sm font-extrabold text-white shadow-md hover:bg-rose-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Summary & Checkout */}
          <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 mt-auto">
            <div className="flex justify-between items-center mb-6">
              <span className="text-neutral-600 font-semibold text-lg">Sub Total:</span>
              <span className="text-4xl font-extrabold text-neutral-950 tracking-tighter">
                Rp {getTotal().toLocaleString('id-ID')}
              </span>
            </div>
            <button
              disabled={cart.length === 0}
              onClick={() => setIsPaymentOpen(true)}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-4 rounded-full disabled:opacity-50 transition shadow-lg text-xl flex items-center justify-center gap-3"
            >
              <svg className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75m16.5-3V18.75m0 0a3 3 0 0 1-3 3H3.75a3 3 0 0 1-3-3V15m18 3.75a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H3.75a3 3 0 0 0-3 3v9m6 3.75V15m0-4.5h.008v.008h-.008v-.008Zm0 0V10.5m1.125-2.25h.008v.008h-.008v-.008Zm11.25 10.5h.008v.008h-.008v-.008ZM6.75 6.75h.008v.008h-.008V6.75Zm0 3h.008v.008h-.008v-.008Zm3 0h.008v.008h-.008v-.008Zm3 0h.008v.008h-.008v-.008Zm3 0h.008v.008h-.008v-.008Zm3 0h.008v.008h-.008v-.008Zm-6-3h.008v.008h-.008V6.75Zm3 0h.008v.008h-.008V6.75Zm3 0h.008v.008h-.008V6.75Zm3 0h.008v.008h-.008V6.75Z" />
              </svg>
              Bayar Sekarang
            </button>
          </div>
        </div>

        {/* Payment Modal */}
        {isPaymentOpen && (
          <PaymentModal
            isOpen={isPaymentOpen}
            onClose={() => setIsPaymentOpen(false)}
          />
        )}
      </div>
    </>
  )
}
