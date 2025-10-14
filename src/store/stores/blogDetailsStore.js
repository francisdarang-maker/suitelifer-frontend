import { create } from "zustand";
import api from "../../utils/axios";

const useBlogDetailsStore = create((set) => ({
  blogItem: {},
  isLoading: false,

  fetchBlogItem: async (slug) => {
    if (!slug) return;

    set({ isLoading: true });
    try {
      const { data } = await api.get(`/api/blogs/${slug}`); 
      set({ blogItem: data.blog });
    } catch (error) {
      console.error("Failed to fetch blog:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  resetBlogItem: () => set({ blogItem: {}, isLoading: false }),
}));

export default useBlogDetailsStore;
