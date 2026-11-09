import { create } from 'zustand'
import { cartQuantity } from '../lib/cart-count'

// Account totals stay in memory and are scoped to a single authenticated session.
export const useCartSummaryStore = create((set) => ({
  sessionKey: null,
  quantity: 0,
  update: (items, sessionKey) => set({ sessionKey, quantity: cartQuantity(items) }),
}))
