import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import PostForm from './features/posts/PostForm.jsx'
import PostsFilter from './features/posts/PostsFilter.jsx'
import PostsTable from './features/posts/PostsTable.jsx'
import { fetchPosts } from './features/posts/postsSlice.js'

// Diseño del enunciado: filtro arriba, tabla al medio, formulario abajo.
export default function App() {
  const dispatch = useDispatch()

  // Pide la lista una vez al cargar la vista (ver `condition` en postsSlice).
  useEffect(() => {
    dispatch(fetchPosts())
  }, [dispatch])

  return (
    <main>
      <h1>Posts</h1>
      <PostsFilter />
      <PostsTable />
      <PostForm />
    </main>
  )
}
