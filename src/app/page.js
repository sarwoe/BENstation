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
  const [products, setProducts] = useState(SAMPLE_PRODUCTS) // Default ke sample
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
          // Update kategori berdasarkan produk yang ada
          const unique = ['All', ...new Set(data.map(p => p.category))]
          setCategories(unique)
        }
      } catch (err) {
        console.error('Supabase fetch failed, using samples', err)
      }
    }
    fetchData()
  }, [])

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <>
      <Head><title>BENstation</title></Head>
      <div className="flex flex-col md:flex-row h-screen bg-neutral-50">
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white p-4 flex justify-between items-center border-b shrink-0">
            <h1 className="text-xl font-extrabold text-neutral-950">BEN<span className='text-rose-600'>station</span></h1>
            <input type="text" placeholder="Cari..." value={search} onChange={(e) => setSearch(e.target.value)} className="border rounded-full px-4 py-2 w-32"/>
          </header>

          <div className="bg-white border-b px-4 py-3 flex space-x-2 overflow-x-auto">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1 rounded-full text-sm font-semibold ${selectedCategory === cat ? 'bg-rose-600 text-white' : 'bg-neutral-100'}`}>
                {cat}
              </button>
            ))}
          </div>

          <main className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-4">
              {filteredProducts.map((p) => (
                <div key={p.id} onClick={() => addToCart(p)} className="bg-white rounded-lg shadow-sm p-3 cursor-pointer">
                  <div className="h-24 bg-neutral-100 rounded-md mb-2"><img src={p.image_url} className="w-full h-full object-cover rounded-md"/></div>
                  <h3 className="font-bold text-sm truncate">{p.name}</h3>
                  <p className="text-rose-600 text-xs font-bold">Rp {p.price?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </main>
        </div>

        {/* Cart */}
        <div className="w-full md:w-[400px] bg-white border-l p-4 flex flex-col">
          <h2 className="font-bold mb-4">Pesanan Aktif</h2>
          <div className="flex-1 overflow-y-auto space-y-3">
             {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b pb-2">
                <div><p className="text-sm font-semibold">{item.name}</p><p className="text-xs text-rose-600">Rp {(item.price * item.quantity).toLocaleString()}</p></div>
                <div className="flex items-center gap-2"><button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 bg-neutral-100 rounded">-</button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 bg-rose-600 text-white rounded">+</button></div>
              </div>
            ))}
          </div>
          <button disabled={cart.length === 0} onClick={() => setIsPaymentOpen(true)} className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold mt-4">Bayar Rp {getTotal().toLocaleString()}</button>
        </div>
        {isPaymentOpen && <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />}
      </div>
    </>
  )
}
