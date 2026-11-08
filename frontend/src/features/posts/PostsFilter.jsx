import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { filterApplied } from './postsSlice.js'

// El texto vive en estado local mientras se escribe; recién al presionar
// Buscar pasa a Redux y filtra la tabla. No llama a la API: filtra localmente.
export default function PostsFilter() {
  const dispatch = useDispatch()
  const [text, setText] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    dispatch(filterApplied(text))
  }

  return (
    <form className="row" onSubmit={handleSubmit}>
      <input
        type="search"
        placeholder="Filtro de nombre"
        aria-label="Filtro de nombre"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit">Buscar</button>
    </form>
  )
}
