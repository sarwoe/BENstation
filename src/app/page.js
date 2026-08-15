'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useCartStore } from '@/store/useCartStore'
import PaymentModal from '@/components/PaymentModal'

export default function CashierPage() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)

  const { cart, addToCart, decreaseQty, getTotalPrice } = useCartStore()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const { data: catData } = await supabase.from('categories').select('*')
      const { data: prodData } = await supabase.from('products').select('*').eq('is_available', true)

      if (catData) setCategories(catData)
      if (prodData) setProducts(prodData)
      setLoading(false)
    }
    fetchData()
  }, [])

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((p) => p.category_id === selectedCategory)

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Panel Kiri: Katalog Menu BENstation */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 tracking-wide">BENstation POS</h1>
          <span className="text-sm bg-green-100 text-green-800 font-semibold px-3 py-1 rounded-full">
            Kasir Aktif
          </span>
        </header>

        {/* Filter Kategori */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
              selectedCategory === 'all' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semua Menu
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
                selectedCategory === cat.id ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grid Produk */}
        {loading ? (
          <p className="text-gray-500">Memuat menu BENstation...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between border border-gray-100"
              >
                <div>
                  <h3 className="font-semibold text-gray-800">{product.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Rp {Number(product.price).toLocaleString('id-ID')}
                  </p>
                </div>
                <button className="mt-4 w-full bg-gray-900 text-white text-xs py-2 rounded-lg hover:bg-gray-800">
                  + Tambah
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Panel Kanan: Ringkasan Keranjang */}
      <div className="w-96 bg-white shadow-xl flex flex-col border-l border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-bold text-lg text-gray-800">Pesanan Baru</h2>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {cart.length === 0 ? (
            <p className="text-center text-gray-400 mt-10 text-sm">Keranjang masih kosong</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b pb-3">
                <div>
                  <h4 className="font-medium text-sm text-gray-800">{item.name}</h4>
                  <p className="text-xs text-gray-500">
                    Rp {Number(item.price * item.qty).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => decreaseQty(item.id)}
                    className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="text-sm font-semibold">{item.qty}</span>
                  <button
                    onClick={() => addToCart(item)}
                    className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total & Tombol Bayar */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between font-bold text-base mb-4">
            <span>Total:</span>
            <span>Rp {getTotalPrice().toLocaleString('id-ID')}</span>
          </div>
          <button
            disabled={cart.length === 0}
            onClick={() => setIsPaymentOpen(true)}
            className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 disabled:opacity-50 transition"
          >
            Lanjut Pembayaran
          </button>
        </div>
      </div>

      {/* Pop-up Modal Pembayaran */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
      />
    </div>
  )
}
