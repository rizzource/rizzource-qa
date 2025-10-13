/**
 * Auth service for managing user metadata in localStorage
 * Stores only non-sensitive user metadata for UI restoration
 */

const AUTH_STORAGE_KEY = 'auth_user_meta';

export const authService = {
  /**
   * Save user metadata to localStorage
   * @param {Object} userMetadata - User metadata from user.user_metadata
   */
  saveUserMeta: (userMetadata) => {
    try {
      const metaToStore = {
        role: userMetadata?.role,
        email: userMetadata?.email,
        // Add other non-sensitive metadata as needed
        savedAt: Date.now()
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(metaToStore));
    } catch (error) {
      console.warn('Failed to save user metadata:', error);
    }
  },

  /**
   * Get user metadata from localStorage
   * @returns {Object|null} User metadata or null if not found
   */
  getUserMeta: () => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;
      
      const meta = JSON.parse(stored);
      
      // Optional: Check if stored data is not too old (e.g., 30 days)
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      if (Date.now() - meta.savedAt > maxAge) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
      }
      
      return meta;
    } catch (error) {
      console.warn('Failed to get user metadata:', error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  },

  /**
   * Clear user metadata from localStorage
   */
  clearUserMeta: () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear user metadata:', error);
    }
  },

  /**
   * Sign out and clear all stored data
   * Always clears localStorage even if Supabase signOut fails
   * @param {Function} supabaseSignOut - Supabase signOut function
   * @returns {Promise<boolean>} Whether the operation completed (always true)
   */
  signOutAndClear: async (supabaseSignOut) => {
    // Always clear localStorage first
    authService.clearUserMeta();
    
    try {
      // Attempt Supabase signOut with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SignOut timeout')), 5000)
      );
      
      await Promise.race([supabaseSignOut(), timeoutPromise]);
    } catch (error) {
      console.warn('Supabase signOut failed or timed out:', error);
      // Continue anyway - localStorage is already cleared
    }
    
    return true;
  }
};