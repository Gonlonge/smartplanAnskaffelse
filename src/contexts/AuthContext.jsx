import { createContext, useContext, useState, useEffect } from 'react'
import { 
  login as loginService, 
  register as registerService, 
  logout as logoutService, 
  getCurrentUser,
  onAuthStateChange,
  switchToSupplierAdmin,
  switchToOtherUser,
  switchBackToAdmin,
  getStoredAdminUser,
  getStoredSupplierAdminUser,
  getOtherSwitchUser,
  isInSwitchMode,
  createSupplierAdminUser as createSupplierAdminUserService
} from '../api/authService'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [otherSwitchUser, setOtherSwitchUser] = useState(null)
  const [isInSwitchModeState, setIsInSwitchModeState] = useState(false)

  // Update switch state when it changes
  useEffect(() => {
    const updateSwitchState = () => {
      const inSwitchMode = isInSwitchMode()
      setIsInSwitchModeState(inSwitchMode)
      
      if (inSwitchMode && user) {
        const other = getOtherSwitchUser(user.role)
        setOtherSwitchUser(other)
      } else {
        setOtherSwitchUser(null)
      }
    }

    // Initial update
    updateSwitchState()

    // Listen for storage changes (in case localStorage is updated from another tab/window)
    const handleStorageChange = (e) => {
      if (e.key === 'switchAdminUser' || e.key === 'switchSupplierAdminUser' || e.key === null) {
        updateSwitchState()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [user])

  useEffect(() => {
    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChange(async (authUser) => {
      if (authUser) {
        setUser(authUser)
      } else {
        // Try to get current user one more time (in case of timing issues)
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      }
      setLoading(false)
      
      // Update switch state when user changes
      const inSwitchMode = isInSwitchMode()
      setIsInSwitchModeState(inSwitchMode)
      
      if (inSwitchMode && authUser) {
        const other = getOtherSwitchUser(authUser.role)
        setOtherSwitchUser(other)
      } else {
        setOtherSwitchUser(null)
      }
    })

    // Cleanup listener on unmount
    return () => unsubscribe()
  }, [])

  const login = async (email, password) => {
    try {
      const result = await loginService(email, password)
      if (result.success) {
        // User will be set by auth state listener
        return { success: true }
      } else {
        return { 
          success: false, 
          error: result.error, 
          requiresEmailVerification: result.requiresEmailVerification,
          verificationEmailSent: result.verificationEmailSent,
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'En feil oppstod under innlogging' }
    }
  }

  const register = async (email, password, name, userType, orgNumber = null, companyData = null) => {
    try {
      const result = await registerService(email, password, name, userType, null, null, null, orgNumber, companyData)
      if (result.success) {
        // User will be set by auth state listener
        return { 
          success: true,
          requiresEmailVerification: result.requiresEmailVerification,
          verificationEmailSent: result.verificationEmailSent,
        }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: 'En feil oppstod under registrering' }
    }
  }

  const logout = async () => {
    try {
      const result = await logoutService()
      if (result.success) {
        setUser(null)
        return { success: true }
      } else {
        return { success: false, error: result.error || 'En feil oppstod under utlogging' }
      }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error: 'En feil oppstod under utlogging' }
    }
  }

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      return { success: true }
    } catch (error) {
      console.error('Error refreshing user:', error)
      return { success: false, error: 'Kunne ikke oppdatere brukerdata' }
    }
  }

  const switchToSupplierAdminUser = async (supplierAdminEmail, password) => {
    try {
      const result = await switchToSupplierAdmin(supplierAdminEmail, password)
      if (result.success) {
        // User will be set by auth state listener, which will update switch state
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Switch user error:', error)
      return { success: false, error: 'En feil oppstod ved bytting av bruker' }
    }
  }

  const switchToOtherUserFunc = async (password) => {
    try {
      const result = await switchToOtherUser(password)
      if (result.success) {
        // User will be set by auth state listener, which will update switch state
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Switch to other user error:', error)
      return { success: false, error: 'En feil oppstod ved bytting av bruker' }
    }
  }

  const switchBackToAdminUser = async (password) => {
    // Use the bidirectional switch function
    return switchToOtherUserFunc(password)
  }

  const createSupplierAdmin = async (email, password, name, orgNumber = null, companyData = null) => {
    try {
      const result = await createSupplierAdminUserService(email, password, name, orgNumber, companyData)
      if (result.success) {
        return { success: true, user: result.user }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Create supplier admin error:', error)
      return { success: false, error: 'En feil oppstod ved opprettelse av leverandør administrator' }
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    refreshUser,
    switchToSupplierAdmin: switchToSupplierAdminUser,
    switchToOtherUser: switchToOtherUserFunc,
    switchBackToAdmin: switchBackToAdminUser,
    createSupplierAdmin,
    otherSwitchUser,
    // Legacy properties for backward compatibility
    originalAdminUser: user?.role === 'receiver' ? getStoredAdminUser() : getStoredSupplierAdminUser(),
    isSwitchedUser: isInSwitchModeState,
    isInSwitchMode: isInSwitchModeState,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin === true,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

