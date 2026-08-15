'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import useCartStore from '../store/useCartStore'

export default function PaymentModal({ isOpen, onClose }) {
  const { cart, getTotal, clearCart } = useCartStore()
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [cashAmount, setCashAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const total = getTotal()
  const change = Number(cashAmount) - total

  async function handleCheckout() {
    if (paymentMethod === 'Cash' && change < 0) {
      alert('Uang pembayaran kurang!')
      return
    }

    setIsProcessing(true)

    try {
      // 1. Catat Transaksi Utama
      const { data: transaction, error: transError } = await supabase
        .from('transactions')
        .insert([
          {
            total_amount: total,
            payment_method: paymentMethod,
            cash_given: paymentMethod === 'Cash' ? Number(cashAmount) : total,
            change_given: paymentMethod === 'Cash' ? change : 0,
          },
        ])
        .select()
        .single()

      if (transError) throw transError

      // 2. Catat Detail Barang yang Dibeli
      const transactionItems = cart.map((item) => ({
        transaction_id: transaction.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }))

      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(transactionItems)

      if (itemsError) throw itemsError

      // 3. Potong Stok Produk di Database
      for (const item of cart) {
        await supabase
          .from('products')
          .update({ stock: item.stock - item.quantity })
          .eq('id', item.id)
      }

      alert('Transaksi Berhasil!')
      clearCart()
      onClose()
      window.location.reload()
    } catch (err) {
      console.error(err)
      alert('Gagal memproses transaksi: ' + err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Pembayaran</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">Total Tagihan</label>
          <div className="text-3xl font-bold text-blue-600">Rp {total.toLocaleString('id-ID')}</div>
        </div>

        {/* Metode Pembayaran */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-2">Metode Pembayaran</label>
          <div className="grid grid-cols-3 gap-2">
            {['Cash', 'QRIS', 'Transfer'].map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`py-2 text-sm font-semibold rounded-lg border transition ${
                  paymentMethod === method
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Input Cash */}
        {paymentMethod === 'Cash' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">Uang Diterima</label>
            <input
              type="number"
              placeholder="0"
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {cashAmount && (
              <div className="mt-2 text-sm">
                Kembalian:{' '}
                <span className={`font-bold ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  Rp {change.toLocaleString('id-ID')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold text-gray-700 transition"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleCheckout}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold disabled:opacity-50 transition"
          >
            {isProcessing ? 'Memproses...' : 'Selesai'}
          </button>
        </div>
      </div>
    </div>
  )
}
