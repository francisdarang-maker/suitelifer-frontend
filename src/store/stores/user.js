export const user = (set) => ({
  user: null, // <-- null means no user logged in
  setUser: (data) => set({ user: data }),
});
