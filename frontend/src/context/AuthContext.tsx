import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface AuthContextType {
  user: { email: string } | null
  loading: boolean
  quickAccess: () => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ email: string } | null>(() => {
    // Mantém sessão se já acessou antes
    const saved = localStorage.getItem('sqr_user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading] = useState(false)

  const quickAccess = () => {
    const u = { email: 'kd3online@gmail.com' }
    setUser(u)
    localStorage.setItem('sqr_user', JSON.stringify(u))
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem('sqr_user')
  }

  return (
    <AuthContext.Provider value={{ user, loading, quickAccess, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
