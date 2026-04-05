import { create } from 'zustand';
import api from '../services/api';

const useCartStore = create((set, get) => ({
  cart: null,
  loading: false,

  fetchCart: async () => {
    try {
      set({ loading: true });
      const { data } = await api.get('/cart');
      set({ cart: data.cart, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  addToCart: async (productId, quantity, size, color) => {
    const { data } = await api.post('/cart', { productId, quantity, size, color });
    set({ cart: data.cart });
    return data;
  },

  updateQuantity: async (itemId, quantity) => {
    const { data } = await api.put(`/cart/${itemId}`, { quantity });
    set({ cart: data.cart });
  },

  removeFromCart: async (itemId) => {
    const { data } = await api.delete(`/cart/${itemId}`);
    set({ cart: data.cart });
  },

  clearCart: async () => {
    const { data } = await api.delete('/cart');
    set({ cart: data.cart });
  },

  getCartCount: () => {
    const cart = get().cart;
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }
}));

export default useCartStore;
