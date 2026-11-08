import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { createPost } from './postsSlice.js'

export default function PostForm() {
  const dispatch = useDispatch()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await dispatch(createPost({ name, description })).unwrap()
      // Solo se limpia si se creó: ante un error, el usuario no pierde lo escrito.
      setName('')
      setDescription('')
    } catch (err) {
      // El mensaje es el que devuelve la API (validación del backend).
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* maxLength y required igualan los límites de la API: validan antes de
          enviar, pero la API valida de nuevo porque el cliente no es confiable. */}
      <form className="row" onSubmit={handleSubmit}>
        <input
          placeholder="Nombre"
          aria-label="Nombre"
          required
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Descripción"
          aria-label="Descripción"
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit" disabled={saving}>
          Crear
        </button>
      </form>
      {error && <p className="error">{error}</p>}
    </>
  )
}
