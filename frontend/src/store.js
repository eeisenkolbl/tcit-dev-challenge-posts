import { configureStore } from '@reduxjs/toolkit'
import postsReducer from './features/posts/postsSlice.js'

// configureStore ya incluye redux-thunk y las Redux DevTools.
export const store = configureStore({
  reducer: {
    posts: postsReducer,
  },
})
