import { create } from 'zustand'

const useCartStore = create((set, get) => ({
  cart: [],
  addToCart: (product) => {
    const currentCart = get().cart
    const existingIndex = currentCart.findIndex((item) => item.id === product.id)

    if (existingIndex > -1) {
      const updatedCart = [...currentCart]
      updatedCart[existingIndex].quantity += 1
      set({ cart: updatedCart })
    } else {
      set({ cart: [...currentCart, { ...product, quantity: 1 }] })
    }
  },
  removeFromCart: (productId) => {
    set({ cart: get().cart.filter((item) => item.id !== productId) })
  },
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId)
    } else {
      set({
        cart: get().cart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        ),
      })
    }
  },
  clearCart: () => set({ cart: [] }),
  getTotal: () => {
    return get().cart.reduce((total, item) => total + item.price * item.quantity, 0)
  },
}))

export default useCartStore
