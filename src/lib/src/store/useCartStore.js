import { create } from 'zustand'

export const useCartStore = create((set, get) => ({
  cart: [],
  addToCart: (product) => {
    const cart = get().cart
    const existing = cart.find((item) => item.id === product.id)
    if (existing) {
      set({
        cart: cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        ),
      })
    } else {
      set({ cart: [...cart, { ...product, qty: 1 }] })
    }
  },
  decreaseQty: (id) => {
    const cart = get().cart
    const existing = cart.find((item) => item.id === id)
    if (existing?.qty === 1) {
      set({ cart: cart.filter((item) => item.id !== id) })
    } else {
      set({
        cart: cart.map((item) =>
          item.id === id ? { ...item, qty: item.qty - 1 } : item
        ),
      })
    }
  },
  removeFromCart: (id) =>
    set({ cart: get().cart.filter((item) => item.id !== id) }),
  clearCart: () => set({ cart: [] }),
  getTotalPrice: () =>
    get().cart.reduce((sum, item) => sum + item.price * item.qty, 0),
}))
