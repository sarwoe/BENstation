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
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // State Modal Fitur
  const [activeModal, setActiveModal] = useState(null) // 'history' | 'manage-menu' | 'manage-categories'
  const [transactions, setTransactions] = useState([])
  
  // Form Manage Menu
  const [menuName, setMenuName] = useState('')
  const [menuCat, setMenuCat] = useState('')
  const [menuPrice, setMenuPrice] = useState('')
  const [menuStock, setMenuStock] = useState('')
  const [menuImage, setMenuImage] = useState(null)
  const [menuLoading, setMenuLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // Form Manage Categories
  const [catName, setCatName] = useState('')
  const [catList, setCatList] = useState([])

  const { cart, addToCart, updateQuantity, clearCart, getTotal } = useCartStore()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('categories').select('*')
      ])
      
      if (productsRes.data && productsRes.data.length > 0) {
        setProducts(productsRes.data)
      }

      if (categoriesRes.data && categoriesRes.data.length > 0) {
        setCatList(categoriesRes.data)
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

  // Fetch Riwayat
  const openHistoryModal = async () => {
    setIsMenuOpen(false)
    setActiveModal('history')
    const { data } = await supabase.from('transactions').select('*').order('created_at', { ascending: false })
    if (data) setTransactions(data)
  }

  // Fetch Manage Menu Modal
  const openManageMenuModal = () => {
    setIsMenuOpen(false)
    setActiveModal('manage-menu')
  }

  // Fetch Manage Categories Modal
  const openManageCategoriesModal = async () => {
    setIsMenuOpen(false)
    setActiveModal('manage-categories')
    const { data } = await supabase.from('categories').select('*').order('id', { ascending: false })
    if (data) setCatList(data)
  }

  // Action Add/Edit Menu
  const handleSaveMenu = async (e) => {
    e.preventDefault()
    setMenuLoading(true)
    try {
      let imageUrl = ''
      if (menuImage) {
        const fileName = `${Date.now()}.${menuImage.name.split('.').pop()}`
        const { error: uploadErr } = await supabase.storage.from('products').upload(fileName, menuImage)
        if (!uploadErr) {
          const { data } = supabase.storage.from('products').getPublicUrl(fileName)
          imageUrl = data.publicUrl
        }
      }

      const payload = {
        name: menuName,
        category: menuCat || 'Burger',
        price: parseFloat(menuPrice) || 0,
        stock: parseInt(menuStock) || 0,
      }
      if (imageUrl) payload.image_url = imageUrl

      if (editingId) {
        await supabase.from('products').update(payload).eq('id', editingId)
      } else {
        await supabase.from('products').insert([payload])
      }

      setMenuName(''); setMenuCat(''); setMenuPrice(''); setMenuStock(''); setMenuImage(null); setEditingId(null);
      fetchData()
    } catch (err) {
      alert(err.message)
    } finally {
      setMenuLoading(false)
    }
  }

  const handleDeleteMenu = async (id) => {
    if (confirm('Hapus menu ini?')) {
      await supabase.from('products').delete().eq('id', id)
      fetchData()
    }
  }

  // Action Add/Delete Category
  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!catName.trim()) return
    const slug = catName.toLowerCase().trim().replace(/\s+/g, '-')
    await supabase.from('categories').insert([{ name: catName, slug }])
    setCatName('')
    openManageCategoriesModal()
    fetchData()
  }

  const handleDeleteCategory = async (id) => {
    if (confirm('Hapus kategori ini?')) {
      await supabase.from('categories').delete().eq('id', id)
      openManageCategoriesModal()
      fetchData()
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    const matchesSearch = product.name?.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <>
      <Head><title>BENstation</title></Head>
      
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

        {/* Modal Navigasi Garis Tiga (Drawer) */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
            <div className="w-72 bg-white h-full p-6 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                  <h2 className="font-extrabold text-lg text-neutral-900">Pengaturan POS</h2>
                  <button onClick={() => setIsMenuOpen(false)} className="text-neutral-400 font-bold hover:text-rose-600">✕</button>
                </div>
                
                <nav className="space-y-3">
                  <button onClick={openHistoryModal} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 hover:text-rose-600 font-bold text-neutral-700 transition text-left">
                    <span>📜</span> Riwayat Pembelian
                  </button>
                  <button onClick={openManageMenuModal} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 hover:text-rose-600 font-bold text-neutral-700 transition text-left">
                    <span>🍔</span> Update & Tambah Menu
                  </button>
                  <button onClick={openManageCategoriesModal} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 hover:text-rose-600 font-bold text-neutral-700 transition text-left">
                    <span>🏷️</span> Update Kategori
                  </button>
                </nav>
              </div>

              <div className="text-xs text-neutral-400 border-t pt-4 text-center font-semibold">
                BENstation POS v2.0
              </div>
            </div>
          </div>
        )}

        {/* POPUP MODAL: RIWAYAT PEMBELIAN */}
        {activeModal === 'history' && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-2xl max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h2 className="text-lg font-black">📜 Riwayat Pembelian</h2>
                <button onClick={() => setActiveModal(null)} className="text-neutral-400 font-bold hover:text-rose-600">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3">
                {transactions.length === 0 ? (
                  <p className="text-center text-xs text-neutral-400 py-8">Belum ada transaksi recorded.</p>
                ) : (
                  transactions.map(t => (
                    <div key={t.id} className="border p-3 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold">#{t.id} - {t.payment_method?.toUpperCase()}</span>
                        <p className="text-neutral-400 mt-0.5">{new Date(t.created_at).toLocaleString('id-ID')}</p>
                        {t.notes && <p className="text-neutral-600 font-semibold mt-1">Catatan: {t.notes}</p>}
                      </div>
                      <span className="font-extrabold text-rose-600 text-sm">Rp {parseFloat(t.total_amount || 0).toLocaleString('id-ID')}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* POPUP MODAL: UPDATE & TAMBAH MENU */}
        {activeModal === 'manage-menu' && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-2xl max-h-[85vh] flex flex-col">
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h2 className="text-lg font-black">🍔 Update & Tambah Menu</h2>
                <button onClick={() => setActiveModal(null)} className="text-neutral-400 font-bold hover:text-rose-600">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-6">
                <form onSubmit={handleSaveMenu} className="bg-neutral-50 p-4 rounded-xl space-y-3 border">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input type="text" placeholder="Nama Menu" value={menuName} onChange={e=>setMenuName(e.target.value)} required className="p-2 border rounded-lg" />
                    <input type="text" placeholder="Kategori" value={menuCat} onChange={e=>setMenuCat(e.target.value)} required className="p-2 border rounded-lg" />
                    <input type="number" placeholder="Harga (Rp)" value={menuPrice} onChange={e=>setMenuPrice(e.target.value)} required className="p-2 border rounded-lg" />
                    <input type="number" placeholder="Stok" value={menuStock} onChange={e=>setMenuStock(e.target.value)} required className="p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-500 font-bold block mb-1">Upload Foto Produk</label>
                    <input type="file" accept="image/*" onChange={e=>setMenuImage(e.target.files[0])} className="text-xs border p-1 rounded-lg w-full bg-white" />
                  </div>
                  <button type="submit" disabled={menuLoading} className="w-full bg-rose-600 text-white font-bold py-2 rounded-lg text-xs">
                    {menuLoading ? 'Memproses...' : editingId ? 'Simpan Edit' : '+ Tambah Menu Baru'}
                  </button>
                </form>

                <div className="space-y-2">
                  <h3 className="font-bold text-xs text-neutral-500 uppercase">Daftar Menu Saat Ini</h3>
                  {products.map(p => (
                    <div key={p.id} className="flex justify-between items-center border p-2 rounded-xl text-xs">
                      <div className="flex items-center gap-2">
                        <img src={p.image_url} className="w-10 h-10 rounded-lg object-cover bg-neutral-100" />
                        <div>
                          <p className="font-bold">{p.name}</p>
                          <p className="text-rose-600 font-bold">Rp {p.price?.toLocaleString('id-ID')} | Stok: {p.stock}</p>
                        </div>
                      </div>
                      <button onClick={()=>handleDeleteMenu(p.id)} className="text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded-md">Hapus</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* POPUP MODAL: UPDATE KATEGORI */}
        {activeModal === 'manage-categories' && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h2 className="text-lg font-black">🏷️ Update Kategori</h2>
                <button onClick={() => setActiveModal(null)} className="text-neutral-400 font-bold hover:text-rose-600">✕</button>
              </div>

              <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Nama Kategori Baru..."
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  className="flex-1 border rounded-xl px-3 py-2 text-xs"
                />
                <button type="submit" className="bg-rose-600 text-white font-bold px-4 py-2 rounded-xl text-xs">Tambah</button>
              </form>

              <div className="border rounded-xl divide-y max-h-60 overflow-y-auto">
                {catList.map(c => (
                  <div key={c.id} className="p-3 flex justify-between items-center text-xs">
                    <span className="font-bold">{c.name}</span>
                    <button onClick={() => handleDeleteCategory(c.id)} className="text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded-md">Hapus</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
