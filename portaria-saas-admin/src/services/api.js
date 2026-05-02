export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    const erro = await res.json().catch(() => ({}));
    throw new Error(erro?.erro || "Erro na API");
  }

  return res.json();
}