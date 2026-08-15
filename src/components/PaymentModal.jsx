'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import useCartStore from '../store/useCartStore'

export default function PaymentModal({ isOpen, onClose, total }) {
  const [paymentMethod, setPaymentMethod] = useState('CASH') // CASH, QRIS, TRANSFER
  const [cash, setCash] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { cart, clearCart } = useCartStore()

  if (!isOpen) return null

  const cashNum = Number(cash) || 0
  const change = cashNum - total

  const handlePay = async () => {
    if (paymentMethod === 'CASH' && cashNum < total) {
      alert('Uang pembayaran kurang!')
      return
    }

    setIsProcessing(true)

    try {
      // Menyimpan transaksi ke Supabase
      const { error } = await supabase.from('transactions').insert([
        {
          total_amount: total,
          payment_method: paymentMethod,
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
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        {!isSuccess ? (
          <>
            <h2 className="text-xl font-black text-neutral-900 mb-4">Metode Pembayaran</h2>
            
            {/* Pilihan 3 Metode Pembayaran */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`py-2.5 rounded-xl font-bold text-xs transition border ${
                  paymentMethod === 'CASH'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                💵 Tunai
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('QRIS')}
                className={`py-2.5 rounded-xl font-bold text-xs transition border ${
                  paymentMethod === 'QRIS'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                📱 QRIS
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('TRANSFER')}
                className={`py-2.5 rounded-xl font-bold text-xs transition border ${
                  paymentMethod === 'TRANSFER'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                🏦 Transfer
              </button>
            </div>

            {/* Total Tagihan */}
            <div className="bg-neutral-50 p-4 rounded-2xl mb-4 border border-neutral-100">
              <p className="text-xs text-neutral-500 font-bold uppercase">Total Tagihan</p>
              <p className="text-3xl font-black text-rose-600">Rp {total.toLocaleString('id-ID')}</p>
            </div>

            {/* Konten Berdasarkan Metode */}
            {paymentMethod === 'CASH' && (
              <div className="mb-4">
                <label className="text-xs font-bold text-neutral-700 block mb-1">Uang Diterima (Rp)</label>
                <input
                  type="number"
                  placeholder="Masukkan nominal uang..."
                  value={cash}
                  onChange={(e) => setCash(e.target.value)}
                  className="w-full border-2 border-neutral-200 rounded-xl px-4 py-3 font-bold text-lg focus:outline-none focus:border-rose-500"
                />
                {cashNum > 0 && (
                  <div className="bg-neutral-100 p-3 rounded-xl mt-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-neutral-600">Kembalian:</span>
                    <span className={`font-black text-lg ${change >= 0 ? 'text-green-600' : 'text-rose-600'}`}>
                      Rp {change.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'QRIS' && (
              <div className="mb-4 p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-center">
                <p className="text-xs font-bold text-neutral-700 mb-2">Scan QRIS untuk Membayar</p>
                
                {/* Gambar QR Code / Barcode Dummy (bisa diganti URL foto QRIS Anda nanti) */}
                <div className="bg-white p-3 rounded-xl border inline-block shadow-sm mb-2">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=BENstation-QRIS" 
                    alt="Barcode QRIS" 
                    className="w-40 h-40 mx-auto object-contain"
                  />
                </div>
                <p className="text-[11px] text-neutral-400 font-medium">Bisa di-scan menggunakan BCA, Mandiri, GoPay, OVO, Dana, dll.</p>
              </div>
            )}

            {paymentMethod === 'TRANSFER' && (
              <div className="mb-4 p-4 bg-neutral-50 border border-neutral-200 rounded-2xl">
                <p className="text-xs font-bold text-neutral-700 mb-3 text-center">Rekening Pembayaran</p>
                
                <div className="space-y-2 text-xs">
                  <div className="bg-white p-3 rounded-xl border flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase">Bank BCA</p>
                      <p className="font-extrabold text-neutral-900 text-sm">1234-5678-90</p>
                      <p className="text-[11px] text-neutral-500">a.n BENstation</p>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase">Bank Mandiri</p>
                      <p className="font-extrabold text-neutral-900 text-sm">9876-5432-10</p>
                      <p className="text-[11px] text-neutral-500">a.n BENstation</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tombol Aksi */}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-bold text-neutral-500 hover:bg-neutral-100 transition text-sm"
              >
                Batal
              </button>
              <button
                disabled={isProcessing || (paymentMethod === 'CASH' && cashNum < total)}
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
            <p className="text-xs text-neutral-500 mt-1 mb-4">
              Metode: <span className="font-bold text-neutral-800">{paymentMethod}</span> 
              {paymentMethod === 'CASH' && ` | Kembalian: Rp ${change.toLocaleString('id-ID')}`}
            </p>
            <button
              onClick={handleFinish}
              className="w-full bg-neutral-900 text-white font-extrabold py-3 rounded-xl hover:bg-neutral-800 transition text-sm"
            >
              Selesai & Transaksi Baru
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
