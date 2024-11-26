

import { create } from "zustand";
import { mountStoreDevtool } from "simple-zustand-devtools";

// Define the store
const useAuthStore = create((set, get) => ({
  allUserData: null, // Holds all data of the authenticated user
  loading: false, // Loading state for async operations

  // Extract user information, or null if not available
  user: () => {
    const data = get().allUserData;
    return data
      ? {
          user_id: data.user_id,
          username: data.username,
        }
      : null;
  },

  // Setter to update user data
  setUser: (user) => set({ allUserData: user }),

  // Setter to update loading state
  setLoading: (loading) => set({ loading }),

  // Determines if the user is logged in based on whether user data is set
  isLoggedIn: () => get().allUserData !== null,
}));

// Enable devtool for store debugging in development
if (import.meta.env.DEV) {
  mountStoreDevtool("Store", useAuthStore);
}

export { useAuthStore };
