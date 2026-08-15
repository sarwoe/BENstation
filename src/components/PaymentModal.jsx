'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useCartStore } from '@/store/useCartStore'
import { useReactToPrint } from 'react-to-print'

export default function PaymentModal({ isOpen, onClose }) {
  const { cart, getTotalPrice, clearCart } = useCartStore()
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [amountPaid, setAmountPaid] = useState('')
  const [completedOrder, setCompletedOrder] = useState(null)
  const [loading, setLoading] = useState(false)

  const printRef = useRef(null)
  const handlePrint = useReactToPrint({ contentRef: printRef })

  if (!isOpen) return null

  const total = getTotalPrice()
  const paidNumber = Number(amountPaid) || 0
  const change = paidNumber - total

  const handleProcessPayment = async () => {
    if (paymentMethod === 'cash' && paidNumber < total) {
      alert('Uang pembayaran kurang!')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            payment_method: paymentMethod,
            total_amount: total,
            amount_paid: paymentMethod === 'qris' ? total : paidNumber,
            change_amount: paymentMethod === 'qris' ? 0 : change,
            items: cart,
          },
        ])
        .select()

      if (error) throw error

      setCompletedOrder(data[0])
    } catch (err) {
      alert('Gagal memproses transaksi: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = () => {
    clearCart()
    setCompletedOrder(null)
    setAmountPaid('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {!completedOrder ? (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Pembayaran BENstation</h2>
            
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`flex-1 py-2 font-semibold rounded-lg border ${
                  paymentMethod === 'cash' ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-700'
                }`}
              >
                Cash (Tunai)
              </button>
              <button
                onClick={() => setPaymentMethod('qris')}
                className={`flex-1 py-2 font-semibold rounded-lg border ${
                  paymentMethod === 'qris' ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-700'
                }`}
              >
                QRIS
              </button>
            </div>

            <div className="bg-gray-100 p-4 rounded-xl mb-4 text-center">
              <p className="text-xs text-gray-500 uppercase font-semibold">Total Tagihan</p>
              <p className="text-2xl font-bold text-gray-800">Rp {total.toLocaleString('id-ID')}</p>
            </div>

            {paymentMethod === 'cash' ? (
              <div className="space-y-3 mb-6">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Uang Diterima (Rp)</label>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="Contoh: 50000"
                    className="w-full mt-1 p-3 border rounded-xl text-lg font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                {paidNumber >= total && (
                  <div className="flex justify-between text-sm font-semibold text-green-700">
                    <span>Kembalian:</span>
                    <span>Rp {change.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center my-4 p-4 border rounded-xl bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-2">Scan QRIS BENstation</p>
                <div className="w-40 h-40 bg-gray-200 mx-auto flex items-center justify-center text-xs text-gray-500 rounded-lg">
                  [ Gambar QRIS ]
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-3 text-gray-600 font-semibold rounded-xl bg-gray-100">
                Batal
              </button>
              <button
                onClick={handleProcessPayment}
                disabled={loading}
                className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Memproses...' : 'Selesaikan'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <h3 className="text-lg font-bold text-green-600 mb-1">Transaksi Berhasil!</h3>
            <p className="text-xs text-gray-500 mb-4">No Nota: #{completedOrder.order_number}</p>

            {/* Template Struk */}
            <div ref={printRef} className="p-4 bg-gray-50 rounded-lg border text-left text-xs font-mono mb-4">
              <div className="text-center mb-2 font-bold text-sm">BENstation</div>
              <p>Tgl: {new Date(completedOrder.created_at).toLocaleString('id-ID')}</p>
              <p>Metode: {completedOrder.payment_method.toUpperCase()}</p>
              <hr className="my-2 border-dashed" />
              {completedOrder.items.map((it, i) => (
                <div key={i} className="flex justify-between">
                  <span>{it.qty}x {it.name}</span>
                  <span>{(it.price * it.qty).toLocaleString('id-ID')}</span>
                </div>
              ))}
              <hr className="my-2 border-dashed" />
              <div className="flex justify-between font-bold">
                <span>TOTAL</span>
                <span>Rp {Number(completedOrder.total_amount).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>BAYAR</span>
                <span>Rp {Number(completedOrder.amount_paid).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>KEMBALI</span>
                <span>Rp {Number(completedOrder.change_amount).toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={handlePrint} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl">
                Cetak / Download Struk
              </button>
              <button onClick={handleFinish} className="flex-1 py-3 bg-black text-white font-bold rounded-xl">
                Selesai
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
