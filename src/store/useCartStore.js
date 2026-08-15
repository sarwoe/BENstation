import { create } from 'zustand'

const useCartStore = create((set, get) => ({
  cart: [],

  addToCart: (product) => {
    const stockNum = Number(product.stock) || 0
    if (stockNum <= 0) {
      alert(`Stok "${product.name}" habis!`)
      return
    }

    set((state) => {
      const existing = state.cart.find((item) => item.id === product.id)
      if (existing) {
        if (existing.quantity >= stockNum) {
          alert(`Pesanan "${product.name}" sudah mencapai batas maksimum stok (${stockNum})`)
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
      return { cart: [...state.cart, { ...product, quantity: 1, stock: stockNum }] }
    })
  },

  updateQuantity: (id, newQuantity) => {
    set((state) => {
      const item = state.cart.find((i) => i.id === id)
      if (!item) return state

      const stockNum = Number(item.stock) || 0

      if (newQuantity > stockNum) {
        alert(`Jumlah pesanan tidak boleh melebihi stok yang tersedia (${stockNum})`)
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
