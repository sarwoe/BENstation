'use client'
import { useState } from 'react'

export default function PaymentModal({ isOpen, onClose, total }) {
  const [step, setStep] = useState('method') // method, details, success
  const [method, setMethod] = useState(null)

  if (!isOpen) return null

  const handleFinish = () => {
    setStep('success')
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        
        {/* Step: Pilih Metode */}
        {step === 'method' && (
          <div>
            <h2 className="text-lg font-bold mb-4">Pilih Metode Pembayaran</h2>
            <div className="grid gap-3">
              <button onClick={() => { setMethod('cash'); setStep('details'); }} className="p-4 border rounded-xl hover:bg-neutral-50 font-semibold">Cash</button>
              <button onClick={() => { setMethod('qris'); setStep('details'); }} className="p-4 border rounded-xl hover:bg-neutral-50 font-semibold">QRIS</button>
              <button onClick={() => { setMethod('transfer'); setStep('details'); }} className="p-4 border rounded-xl hover:bg-neutral-50 font-semibold">Transfer Bank</button>
            </div>
            <button onClick={onClose} className="w-full mt-4 text-neutral-400 text-sm">Batal</button>
          </div>
        )}

        {/* Step: Detail Pembayaran */}
        {step === 'details' && (
          <div>
            <h2 className="text-lg font-bold mb-2">Konfirmasi {method.toUpperCase()}</h2>
            <p className="text-neutral-500 mb-6">Total Tagihan: <span className="font-bold text-rose-600">Rp {total.toLocaleString()}</span></p>
            
            {method === 'qris' && (
              <div className="text-center">
                <div className="bg-neutral-100 p-4 rounded-lg mb-4">
                  <p className="text-sm">Scan QRIS Berikut:</p>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" className="w-40 h-40 mx-auto" />
                </div>
              </div>
            )}

            {method === 'transfer' && (
              <div className="bg-neutral-50 p-4 rounded-xl mb-4 text-sm">
                <p>Silakan Transfer ke:</p>
                <p className="font-bold text-lg">BCA: 1234567890</p>
                <p className="text-neutral-500">a/n BENstation</p>
              </div>
            )}

            <button onClick={handleFinish} className="w-full bg-rose-600 text-white font-bold py-3 rounded-xl">
              {method === 'cash' ? 'Konfirmasi' : 'Saya Sudah Bayar'}
            </button>
          </div>
        )}

        {/* Step: Sukses */}
        {step === 'success' && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
            <h2 className="text-xl font-bold mb-2">Transaksi Berhasil!</h2>
            <p className="text-neutral-500 mb-6">Pembayaran telah diterima dengan sukses.</p>
            <button onClick={onClose} className="w-full bg-neutral-900 text-white font-bold py-3 rounded-xl">Tutup</button>
          </div>
        )}

      </div>
    </div>
  )
}
