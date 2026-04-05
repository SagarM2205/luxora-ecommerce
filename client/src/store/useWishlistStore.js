import { create } from 'zustand';
import api from '../services/api';

const useWishlistStore = create((set, get) => ({
  wishlist: [],
  loading: false,

  fetchWishlist: async () => {
    try {
      set({ loading: true });
      const { data } = await api.get('/wishlist');
      set({ wishlist: data.wishlist.products || [], loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  toggleWishlist: async (productId) => {
    const isWishlisted = get().wishlist.some(p => p._id === productId);
    try {
      if (isWishlisted) {
        const { data } = await api.delete(`/wishlist/${productId}`);
        set({ wishlist: data.wishlist.products || [] });
        return { isWishlisted: false };
      } else {
        const { data } = await api.post('/wishlist', { productId });
        set({ wishlist: data.wishlist.products || [] });
        return { isWishlisted: true };
      }
    } catch (err) {
      // Re-throw so component can toast error
      throw err;
    }
  },

  isInWishlist: (productId) => {
    return get().wishlist.some(p => p._id === productId);
  },

  clearWishlistLocally: () => {
    set({ wishlist: [] });
  }
}));

export default useWishlistStore;
