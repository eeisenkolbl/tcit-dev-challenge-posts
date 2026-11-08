import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { deletePost, selectPostsError, selectPostsStatus, selectVisiblePosts } from './postsSlice.js'

export default function PostsTable() {
  const dispatch = useDispatch()
  const posts = useSelector(selectVisiblePosts)
  const status = useSelector(selectPostsStatus)
  const loadError = useSelector(selectPostsError)
  const [deleteError, setDeleteError] = useState(null)

  async function handleDelete(id) {
    setDeleteError(null)
    try {
      // unwrap() convierte un `rejected` en excepción para poder mostrarla aquí.
      await dispatch(deletePost(id)).unwrap()
    } catch (err) {
      setDeleteError(err.message)
    }
  }

  let emptyMessage = null
  if (status === 'loading') emptyMessage = 'Cargando…'
  else if (status === 'failed') emptyMessage = `No se pudo cargar la lista: ${loadError}`
  else if (posts.length === 0) emptyMessage = 'No hay posts'

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {emptyMessage ? (
            <tr>
              <td colSpan={3} className="muted">{emptyMessage}</td>
            </tr>
          ) : (
            posts.map((post) => (
              <tr key={post.id}>
                <td>{post.name}</td>
                <td>{post.description}</td>
                <td>
                  <button type="button" onClick={() => handleDelete(post.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {deleteError && <p className="error">{deleteError}</p>}
    </>
  )
}
