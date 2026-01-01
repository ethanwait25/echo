import AuthPage from "@/pages/AuthPage"
import { AppShell } from "./components/AppShell"
import { AuthProvider, useAuth } from "@/auth/AuthProvider"

function AppGate() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
        Loading…
      </div>
    )
  }

  return user ? <AppShell /> : <AuthPage />
}

export default function App() {
  return (
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  )
}