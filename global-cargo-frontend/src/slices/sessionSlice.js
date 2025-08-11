// sessionSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Load from localStorage if available
const savedSession = JSON.parse(localStorage.getItem('session')) || {
  token: null,
  user: null,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState: savedSession,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('session', JSON.stringify(state));
    },
    clearSession: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('session');
    },
    saveSession: (state, action) => {
      const { token = null, user = null } = action.payload || {};
      state.token = token;
      state.user = user;
      localStorage.setItem('session', JSON.stringify(state));
    },
    loadSession: (state, action) => {
      const { token = null, user = null } = action.payload || {};
      state.token = token;
      state.user = user;
    },
    logoutSession: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('session');
    },
  },
});

export const { setToken, clearSession, saveSession, loadSession, logoutSession } =
  sessionSlice.actions;
export default sessionSlice.reducer;