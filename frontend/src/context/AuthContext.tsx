import { createContext, useContext, useState, type ReactNode } from 'react'

interface AuthContextType {
  user: { email: string } | null
  loading: boolean
  activeSystem: string
  setActiveSystem: (system: string) => void
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
  const [activeSystem, setActiveSystem] = useState(() => {
    return localStorage.getItem('sqr_active_system') || 'Solara Connect'
  })
  const [loading] = useState(false)

  const handleSetSystem = (system: string) => {
    setActiveSystem(system)
    localStorage.setItem('sqr_active_system', system)
  }

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
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      activeSystem, 
      setActiveSystem: handleSetSystem, 
      quickAccess, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  )
}
