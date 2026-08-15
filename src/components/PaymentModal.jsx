'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import useCartStore from '../store/useCartStore'

export default function PaymentModal({ isOpen, onClose, total }) {
  const [cash, setCash] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { cart, clearCart } = useCartStore()

  if (!isOpen) return null

  const cashNum = Number(cash) || 0
  const change = cashNum - total

  const handlePay = async () => {
    if (cashNum < total) {
      alert('Uang pembayaran kurang!')
      return
    }

    setIsProcessing(true)

    try {
      // Menyimpan transaksi ke database Supabase
      const { error } = await supabase.from('transactions').insert([
        {
          total_amount: total,
          payment_method: 'CASH',
          items: cart
        }
      ])

      if (error) {
        console.error('Error saving transaction:', error)
        alert('Gagal menyimpan riwayat: ' + error.message)
      } else {
        setIsSuccess(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFinish = () => {
    clearCart()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
        {!isSuccess ? (
          <>
            <h2 className="text-xl font-black text-neutral-900 mb-4">Pembayaran Tunai</h2>
            
            <div className="bg-neutral-50 p-4 rounded-2xl mb-4 border">
              <p className="text-xs text-neutral-500 font-bold uppercase">Total Tagihan</p>
              <p className="text-3xl font-black text-rose-600">Rp {total.toLocaleString('id-ID')}</p>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold text-neutral-700 block mb-1">Uang Diterima (Rp)</label>
              <input
                type="number"
                placeholder="Masukkan nominal uang..."
                value={cash}
                onChange={(e) => setCash(e.target.value)}
                className="w-full border-2 border-neutral-200 rounded-xl px-4 py-3 font-bold text-lg focus:outline-none focus:border-rose-500"
              />
            </div>

            {cashNum > 0 && (
              <div className="bg-neutral-100 p-3 rounded-xl mb-4 flex justify-between items-center">
                <span className="text-xs font-bold text-neutral-600">Kembalian:</span>
                <span className={`font-black text-lg ${change >= 0 ? 'text-green-600' : 'text-rose-600'}`}>
                  Rp {change.toLocaleString('id-ID')}
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-bold text-neutral-500 hover:bg-neutral-100 transition text-sm"
              >
                Batal
              </button>
              <button
                disabled={isProcessing || cashNum < total}
                onClick={handlePay}
                className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold py-3 rounded-xl transition text-sm shadow-md"
              >
                {isProcessing ? 'Memproses...' : 'Proses Bayar'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-black">
              ✓
            </div>
            <h3 className="text-xl font-black text-neutral-900">Pembayaran Berhasil!</h3>
            <p className="text-xs text-neutral-500 mt-1 mb-4">Kembalian: Rp {change.toLocaleString('id-ID')}</p>
            <button
              onClick={handleFinish}
              className="w-full bg-neutral-900 text-white font-extrabold py-3 rounded-xl hover:bg-neutral-800 transition text-sm"
            >
              Selesai & Selesai Transaksi
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
