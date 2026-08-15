import { create } from 'zustand'

const useCartStore = create((set, get) => ({
  cart: [],

  addToCart: (product) => {
    if (product.stock <= 0) return

    set((state) => {
      const existing = state.cart.find((item) => item.id === product.id)
      if (existing) {
        // Cek jika kuantitas di keranjang sudah mencapai stok maksimum
        if (existing.quantity >= product.stock) {
          alert(`Jumlah pesanan sudah mencapai stok maksimum (${product.stock})`)
          return state
        }
        return {
          cart: state.cart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }
      }
      return { cart: [...state.cart, { ...product, quantity: 1 }] }
    })
  },

  updateQuantity: (id, newQuantity) => {
    set((state) => {
      const item = state.cart.find((i) => i.id === id)
      if (!item) return state

      // Jika mencoba menambah melebihi stok
      if (newQuantity > item.stock) {
        alert(`Jumlah pesanan tidak boleh melebihi stok yang tersedia (${item.stock})`)
        return state
      }

      if (newQuantity <= 0) {
        return { cart: state.cart.filter((i) => i.id !== id) }
      }

      return {
        cart: state.cart.map((i) =>
          i.id === id ? { ...i, quantity: newQuantity } : i
        ),
      }
    })
  },

  clearCart: () => set({ cart: [] }),

  getTotal: () => {
    return get().cart.reduce((total, item) => total + item.price * item.quantity, 0)
  },
}))

export default useCartStore
