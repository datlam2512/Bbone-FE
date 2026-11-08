import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function validItems(items) {
  if (!Array.isArray(items)) return []
  const seen = new Set()
  return items
    .filter((item) => {
      if (!item || typeof item.productId !== 'string' || seen.has(item.productId)) return false
      seen.add(item.productId)
      return Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 1000
    })
    .slice(0, 100)
    .map(({ productId, quantity }) => ({ productId, quantity }))
}

export const useGuestCartStore = create(
  persist(
    (set) => ({
      items: [],
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: validItems([
            ...state.items.filter((item) => item.productId !== productId),
            ...(quantity > 0 ? [{ productId, quantity: Math.min(1000, quantity) }] : []),
          ]),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'bbone-guest-cart-v1',
      partialize: ({ items }) => ({ items }),
      merge: (persisted, current) => ({ ...current, items: validItems(persisted?.items) }),
    },
  ),
)
