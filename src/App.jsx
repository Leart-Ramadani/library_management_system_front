import { BrowserRouter, Route, Routes } from "react-router-dom"
import "./App.css"
import { AuthProvider } from "@/context/auth-context"
import RequireAuth from "@/components/require-auth"
import Layout from "./layout"
import Login from "@/pages/login"
import Page from "@/pages/page"
import { navItems } from "@/config/nav"
import Users from "./pages/users"
import Categories from "./pages/categories"
import Books from "./pages/books"
import SystemSettings from "./pages/system-settings"
import Loans from "./pages/loans"
import Penalties from "./pages/penalties"

export default function App() {
  const pages = {
    "/users": <Users />,
    "/categories": <Categories />,
    "/books": <Books />,
    "/system-settings": <SystemSettings />,
    "/loans": <Loans />,
    "/my-penalties": <Penalties />,
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            {navItems.map((item) => (
              <Route
                key={item.url}
                path={item.url}
                element={
                  <RequireAuth roles={item.roles}>
                    {pages[item.url] ?? <Page title={item.title} />}
                  </RequireAuth>
                }
              />
            ))}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}