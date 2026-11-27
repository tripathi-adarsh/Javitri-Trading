import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '../utils/api.js'

const TradingContext = createContext(null)

function readStoredToken() {
  return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || null
}

function readStoredUser() {
  try {
    const raw = localStorage.getItem('authUser') || sessionStorage.getItem('authUser')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function TradingProvider({ children }) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [token, setToken] = useState(() => readStoredToken())
  const [user, setUserState] = useState(() => readStoredUser())
  const [authLoading, setAuthLoading] = useState(() => Boolean(readStoredToken()))

  const saveToken = useCallback((t) => {
    setToken(t)
    if (t) {
      localStorage.setItem('accessToken', t)
      sessionStorage.setItem('accessToken', t)
    } else {
      localStorage.removeItem('accessToken')
      sessionStorage.removeItem('accessToken')
    }
  }, [])

  const setUser = useCallback((u) => {
    setUserState(u)
    if (u) {
      const serialized = JSON.stringify(u)
      localStorage.setItem('authUser', serialized)
      sessionStorage.setItem('authUser', serialized)
    } else {
      localStorage.removeItem('authUser')
      sessionStorage.removeItem('authUser')
    }
  }, [])

  const logout = useCallback(() => {
    saveToken(null)
    setUser(null)
    setSelectedPlan(null)
    setDealData(null)
    setOrderData(null)
    setConsentGiven(false)
  }, [saveToken, setUser])

  // Rehydrate & verify session on page load / refresh
  useEffect(() => {
    let active = true

    async function hydrateAuth() {
      const currentToken = readStoredToken()
      if (!currentToken) {
        if (active) setAuthLoading(false)
        return
      }

      try {
        const res = await api.auth.me(currentToken)
        if (!active) return
        if (res?.data?.user) {
          setUser(res.data.user)
          setToken(currentToken)
        }
      } catch (err) {
        if (!active) return
        if (err?.status === 401 || err?.status === 403) {
          // Try refreshing the access token via httpOnly refresh cookie
          try {
            const refreshRes = await api.auth.refresh()
            const newToken = refreshRes?.data?.accessToken
            if (newToken && active) {
              saveToken(newToken)
              const meRes = await api.auth.me(newToken)
              if (active && meRes?.data?.user) {
                setUser(meRes.data.user)
                setAuthLoading(false)
                return
              }
            }
          } catch {
            // Refresh failed — clear invalid session
          }
          if (active) logout()
        }
        // For network/5xx errors (status === 0 or >= 500), keep cached session
      } finally {
        if (active) setAuthLoading(false)
      }
    }

    hydrateAuth()
    return () => { active = false }
  }, [logout, saveToken, setUser])

  // ── Flow state ────────────────────────────────────────────────────────────
  const [clientData, setClientData]     = useState(null)   // local registration form snapshot
  const [selectedPlan, setSelectedPlan] = useState(null)   // plan object from API
  const [dealData, setDealData]         = useState(null)   // server-side calculated amounts
  const [orderData, setOrderData]       = useState(null)   // created order + Razorpay order ID
  const [consentGiven, setConsentGiven] = useState(false)  // T&C + Privacy accepted

  return (
    <TradingContext.Provider value={{
      // auth
      user, setUser,
      token, saveToken,
      authLoading,
      logout,
      // flow
      clientData, setClientData,
      selectedPlan, setSelectedPlan,
      dealData, setDealData,
      orderData, setOrderData,
      consentGiven, setConsentGiven,
    }}>
      {children}
    </TradingContext.Provider>
  )
}

export function useTrading() {
  const ctx = useContext(TradingContext)
  if (!ctx) throw new Error('useTrading must be used inside TradingProvider')
  return ctx
}
