import { createContext, useContext, useState } from "react"
import { api } from "@/lib/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user"))
        } catch {
            return null
        }
    })

    async function login(email, password) {
        const data = await api("/auth/login", { method: "POST", body: { email, password } })
        const token = data.token ?? data.access_token
        if (!token) throw new Error("No token returned by the server")
        localStorage.setItem("token", token)

        try {
            const me = await api("/auth/me")
            const safeUser = { name: me.data.name, role: String(me.data.role).toLowerCase() }
            localStorage.setItem("user", JSON.stringify(safeUser))
            setUser(safeUser)
        } catch (err) {
            localStorage.removeItem("token")
            throw err
        }
    }

    function logout() {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)