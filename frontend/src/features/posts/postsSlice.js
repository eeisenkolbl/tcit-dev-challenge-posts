import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import { postsApi } from '../../api.js'

// La lista se pide una sola vez por carga de la vista. En desarrollo,
// StrictMode monta los componentes dos veces y el useEffect despacha dos
// veces; `condition` cancela el segundo despacho porque el primero ya dejó
// el estado en 'loading' (el `pending` se despacha de forma síncrona).
export const fetchPosts = createAsyncThunk('posts/fetch', () => postsApi.list(), {
  condition: (_, { getState }) => getState().posts.status === 'idle',
})

export const createPost = createAsyncThunk('posts/create', (post) => postsApi.create(post))

export const deletePost = createAsyncThunk('posts/delete', (id) => postsApi.remove(id))

const initialState = {
  items: [],
  // 'idle' | 'loading' | 'succeeded' | 'failed'
  status: 'idle',
  error: null,
  // Filtro aplicado (se actualiza al presionar Buscar, no en cada tecla).
  filter: '',
}

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    filterApplied(state, action) {
      state.filter = action.payload
    },
  },
  // Immer permite escribir "mutaciones" (push, filter sobre state); RTK las
  // convierte en un estado nuevo inmutable.
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      // Crear y eliminar no vuelven a pedir la lista: la API devuelve el post
      // afectado y con eso se actualiza el estado local.
      .addCase(createPost.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.items = state.items.filter((post) => post.id !== action.payload.id)
      })
  },
})

export const { filterApplied } = postsSlice.actions

export default postsSlice.reducer

export const selectPostsStatus = (state) => state.posts.status
export const selectPostsError = (state) => state.posts.error
export const selectFilter = (state) => state.posts.filter

// Filtro local por nombre, sin distinguir mayúsculas. createSelector memoriza
// el resultado: solo recalcula si cambian los posts o el filtro.
export const selectVisiblePosts = createSelector(
  [(state) => state.posts.items, selectFilter],
  (items, filter) => {
    const term = filter.trim().toLowerCase()
    return term ? items.filter((post) => post.name.toLowerCase().includes(term)) : items
  },
)
