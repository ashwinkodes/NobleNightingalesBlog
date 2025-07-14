// src/lib/stores/auth.js
import { writable } from 'svelte/store';
import { PUBLIC_API_BASE_URL } from "$env/static/public";

function createAuthStore() {
  const { subscribe, set, update } = writable({
    isAuthenticated: false,
    user: null
  });

  return {
    subscribe,
    login: async (token) => {
      try {
        // Fetch user data after successful login
        const response = await fetch(`${PUBLIC_API_BASE_URL}/user/profile`, {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          set({
            isAuthenticated: true,
            user: userData
          });
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error fetching user data:', error);
        return false;
      }
    },
    logout: () => {
      set({
        isAuthenticated: false,
        user: null
      });
    },
    // Add method to check and restore session
    checkAuth: async () => {
      try {
        const response = await fetch(`${PUBLIC_API_BASE_URL}/user/profile`, {
          credentials: 'include'
        });

        if (response.ok) {
          const userData = await response.json();
          set({
            isAuthenticated: true,
            user: userData
          });
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error checking auth:', error);
        return false;
      }
    }
  };
}

export const auth = createAuthStore();