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

  return res.json();
}