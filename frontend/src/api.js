// Cliente HTTP mínimo de la API. Si la respuesta no es 2xx, lanza un Error con
// el mensaje que manda el backend ({ error: '...' }).
async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(body?.error ?? `Error ${res.status}`)
  }
  return body
}

export const postsApi = {
  list: () => request('/posts'),
  create: (post) => request('/posts', { method: 'POST', body: JSON.stringify(post) }),
  remove: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
}
