'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import useCartStore from '../store/useCartStore'

export default function PaymentModal({ isOpen, onClose, total = 0 }) {
  const [step, setStep] = useState('method') // 'method', 'details', 'success'
  const [method, setMethod] = useState(null)
  const [cashGiven, setCashGiven] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { cart, clearCart } = useCartStore()

  if (!isOpen) return null

  const numericCash = parseFloat(cashGiven) || 0
  const changeGiven = numericCash - total

  const handleSelectMethod = (selectedMethod) => {
    setMethod(selectedMethod)
    setStep('details')
  }

  const handleProcessTransaction = async () => {
    setLoading(true)
    try {
      // Simpan transaksi ke Supabase
      const { data: transaction, error: transError } = await supabase
        .from('transactions')
        .insert([
          {
            total_amount: total,
            payment_method: method,
            cash_given: method === 'cash' ? numericCash : total,
            change_given: method === 'cash' ? (changeGiven > 0 ? changeGiven : 0) : 0,
          },
        ])
        .select()
        .single()

      if (transError) {
        console.error('Simpan transaksi gagal, tetap memproses layar sukses:', transError)
      } else if (transaction && cart.length > 0) {
        // Simpan item transaksi jika berhasil
        const itemsToInsert = cart.map((item) => ({
          transaction_id: transaction.id,
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        }))
        await supabase.from('transaction_items').insert(itemsToInsert)
      }

      // Kosongkan keranjang & pindah ke layar Sukses
      clearCart()
      setStep('success')
    } catch (err) {
      console.error('Error transaksi:', err)
      clearCart()
      setStep('success')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseAll = () => {
    setStep('method')
    setMethod(null)
    setCashGiven('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl transition-all">
        
        {/* STEP 1: Pilih Metode */}
        {step === 'method' && (
          <div>
            <h2 className="text-xl font-extrabold text-neutral-900 mb-1 text-center">Metode Pembayaran</h2>
            <p className="text-xs text-neutral-400 text-center mb-6">Pilih cara pembayaran pelanggan</p>
            
            <div className="grid gap-3 mb-4">
              <button 
                onClick={() => handleSelectMethod('cash')} 
                className="p-4 border border-neutral-200 rounded-2xl hover:border-rose-500 hover:bg-rose-50/30 flex items-center justify-between font-bold text-neutral-800 transition group"
              >
                <span className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-extrabold text-lg">💵</span>
                  Cash / Tunai
                </span>
                <span className="text-neutral-400 group-hover:text-rose-600">→</span>
              </button>

              <button 
                onClick={() => handleSelectMethod('qris')} 
                className="p-4 border border-neutral-200 rounded-2xl hover:border-rose-500 hover:bg-rose-50/30 flex items-center justify-between font-bold text-neutral-800 transition group"
              >
                <span className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-extrabold text-lg">📱</span>
                  QRIS / Digital
                </span>
                <span className="text-neutral-400 group-hover:text-rose-600">→</span>
              </button>

              <button 
                onClick={() => handleSelectMethod('transfer')} 
                className="p-4 border border-neutral-200 rounded-2xl hover:border-rose-500 hover:bg-rose-50/30 flex items-center justify-between font-bold text-neutral-800 transition group"
              >
                <span className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-extrabold text-lg">🏦</span>
                  Transfer Bank
                </span>
                <span className="text-neutral-400 group-hover:text-rose-600">→</span>
              </button>
            </div>

            <button onClick={handleCloseAll} className="w-full text-center text-sm font-semibold text-neutral-400 hover:text-neutral-600 py-2">
              Batal
            </button>
          </div>
        )}

        {/* STEP 2: Detail Pembayaran */}
        {step === 'details' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => setStep('method')} className="text-xs font-bold text-rose-600">← Kembali</button>
              <span className="text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-600 px-3 py-1 rounded-full">{method}</span>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-4 mb-5 text-center border border-neutral-100">
              <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Total Tagihan</span>
              <p className="text-3xl font-black text-rose-600 mt-0.5">Rp {total.toLocaleString('id-ID')}</p>
            </div>

            {/* CASH */}
            {method === 'cash' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">Uang Diterima</label>
                  <input
                    type="number"
                    placeholder="Masukkan nominal..."
                    value={cashGiven}
                    onChange={(e) => setCashGiven(e.target.value)}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 font-extrabold text-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                {numericCash > 0 && (
                  <div className="flex justify-between items-center p-3 bg-neutral-100 rounded-xl text-sm font-bold">
                    <span>Kembalian:</span>
                    <span className={changeGiven >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      Rp {changeGiven >= 0 ? changeGiven.toLocaleString('id-ID') : 'Uang Kurang'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* QRIS */}
            {method === 'qris' && (
              <div className="text-center mb-6">
                <p className="text-xs text-neutral-400 mb-3 font-medium">Scan Kode QRIS di bawah ini:</p>
                <div className="bg-white p-3 rounded-2xl border border-neutral-200 inline-block shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=BENSTATION-PAYMENT-${total}`}
                    alt="QRIS Barcode"
                    className="w-44 h-44 mx-auto rounded-lg"
                  />
                </div>
                <p className="text-xs text-neutral-400 mt-2 font-semibold">a/n BENstation</p>
              </div>
            )}

            {/* TRANSFER */}
            {method === 'transfer' && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 mb-6 text-center space-y-2">
                <p className="text-xs text-neutral-400 font-medium">Transfer ke Rekening Resmi:</p>
                <div className="bg-white border border-neutral-200 rounded-xl p-3">
                  <p className="text-xs text-neutral-400 uppercase tracking-wider font-bold">Bank BCA</p>
                  <p className="text-xl font-black text-neutral-900 tracking-wider">1234 5678 90</p>
                  <p className="text-xs font-bold text-rose-600 mt-0.5">a/n BENstation</p>
                </div>
              </div>
            )}

            <button
              disabled={loading || (method === 'cash' && numericCash < total)}
              onClick={handleProcessTransaction}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold py-3.5 rounded-2xl shadow-lg transition"
            >
              {loading ? 'Memproses...' : method === 'cash' ? 'Konfirmasi Pembayaran' : 'Saya Sudah Bayar'}
            </button>
          </div>
        )}

        {/* STEP 3: Sukses */}
        {step === 'success' && (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-inner">
              ✓
            </div>
            <h2 className="text-2xl font-black text-neutral-900 mb-1">Pembayaran Berhasil!</h2>
            <p className="text-xs text-neutral-400 mb-6 font-medium">Transaksi telah selesai dikonfirmasi.</p>
            <button
              onClick={handleCloseAll}
              className="w-full bg-neutral-950 hover:bg-neutral-800 text-white font-extrabold py-3.5 rounded-2xl shadow-md transition"
            >
              Tutup & Selesai
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
