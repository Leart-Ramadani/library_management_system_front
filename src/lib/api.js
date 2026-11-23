const BASE_URL = import.meta.env.VITE_API_URL

export async function api(path, { method = "GET", body } = {}) {
    const token = localStorage.getItem("token")

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: body ? JSON.stringify(body) : undefined,
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
        // expired/invalid token on an authenticated request -> force re-login
        if (res.status === 401 && token) {
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            window.location.href = "/login"
        }
        throw new Error(data?.message || "Request failed")
    }

    return data
}