import { create } from 'zustand';
import CryptoJS from 'crypto-js'; // Install via npm: npm install crypto-js

const SECRET_KEY = '6c32e41586c46e49fb4a7034e33a1477ff0e488898cdece8bd3a588851ce50d2'; // Replace with a secure, environment-specific key

export const useUserData = create((set) => ({
  state: (() => {
    const encryptedData = localStorage.getItem('userData');
    if (encryptedData) {
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8)) || {};
      } catch (error) {
        console.error('Error decrypting userData:', error);
        return {};
      }
    }
    return {};
  })(),

  setData: (data) => {
    try {
      const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
      localStorage.setItem('userData', encryptedData);
      set({ state: data });
    } catch (error) {
      console.error('Error encrypting and storing userData:', error);
    }
  },

  updateData: (data) => {
    try {
      const encryptedData = localStorage.getItem('userData');
      const existingData = encryptedData
        ? JSON.parse(CryptoJS.AES.decrypt(encryptedData, SECRET_KEY).toString(CryptoJS.enc.Utf8)) || {}
        : {};
      const newData = { ...existingData, ...data };
      const newEncryptedData = CryptoJS.AES.encrypt(JSON.stringify(newData), SECRET_KEY).toString();
      localStorage.setItem('userData', newEncryptedData);
      set({ state: newData });
    } catch (error) {
      console.error('Error updating encrypted userData:', error);
    }
  },

  clearData: () => {
    localStorage.removeItem('userData');
    set({ state: {} });
  },
}));
export const useThemeStore = create((set) => ({
  theme: localStorage.getItem('theme') || 'light',  // default to 'light' if no theme is found
  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);  // persist the theme to localStorage
      return { theme: newTheme };
    });
  },
}));
export const bookSuggestStore = create((set) => ({
  state: JSON.parse(localStorage.getItem('bookData')) || [],
  setData: (data) => {
      localStorage.setItem('bookData', JSON.stringify(data));
      set({ state: data });
  },
  clearData: () => {
    localStorage.removeItem('bookData');
    set({ state: [] });
  }
}));


