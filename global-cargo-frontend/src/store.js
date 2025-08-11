import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Use sessionStorage if you prefer
import { thunk } from 'redux-thunk'; // Corrected import

import sessionReducer from './slices/sessionSlice'; // We'll create this next
// import cartReducer from './slices/cartSlice'; // Import cartSlice

const persistConfig = {
  key: 'root',
  storage, // You can use `sessionStorage` if needed
  whitelist: ['session'], // Persist only the session slice to store the user access token
};

const rootReducer = combineReducers({
  session: sessionReducer,
  // cart: cartReducer, // Add cart reducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'], // Ignore redux-persist actions
      },
    }),
});

export const persistor = persistStore(store);