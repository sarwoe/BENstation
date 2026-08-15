'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Link from 'next/link'

export default function HistoryPage() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [])

  async function fetchTransactions() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error)
    } else if (data) {
      setTransactions(data)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-neutral-900">Riwayat Transaksi</h1>
          <Link href="/" className="text-xs font-bold bg-white border border-neutral-200 px-4 py-2 rounded-full shadow-sm hover:bg-neutral-100 transition">
            ← Kembali
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-neutral-400 font-semibold">Memuat riwayat...</div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400 font-semibold">
              Belum ada riwayat transaksi tercatat.
            </div>
          ) : (
            transactions.map((t) => {
              // Ambil total nilai dari total_amount atau total
              const totalVal = t.total_amount ?? t.total ?? 0
              // Ambil waktu transaksi dari created_at atau timestamp
              const dateVal = t.created_at || t.created_at_time
              // Ambil item pesanan
              const itemList = Array.isArray(t.items) ? t.items : (typeof t.items === 'string' ? JSON.parse(t.items || '[]') : [])

              return (
                <div key={t.id} className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-extrabold text-sm text-neutral-900">#TRX-{t.id}</span>
                      <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
                        {dateVal ? new Date(dateVal).toLocaleString('id-ID') : 'Waktu tidak tercatat'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-rose-600 text-base">
                        Rp {Number(totalVal).toLocaleString('id-ID')}
                      </p>
                      <span className="text-[10px] bg-green-50 text-green-600 font-bold px-2 py-0.5 rounded-full inline-block mt-1">
                        {t.payment_method || 'CASH'}
                      </span>
                    </div>
                  </div>

                  {itemList.length > 0 && (
                    <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 text-xs text-neutral-600 space-y-1 mt-1">
                      {itemList.map((item, idx) => (
                        <div key={idx} className="flex justify-between font-medium">
                          <span>{item.name} x{item.quantity}</span>
                          <span>Rp {((item.price || 0) * (item.quantity || 1)).toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
