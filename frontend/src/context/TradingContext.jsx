import { createContext, useContext, useState } from 'react'

const TradingContext = createContext(null)

export function TradingProvider({ children }) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(() => sessionStorage.getItem('accessToken') || null)

  const saveToken = (t) => {
    setToken(t)
    if (t) sessionStorage.setItem('accessToken', t)
    else    sessionStorage.removeItem('accessToken')
  }

  const logout = () => {
    saveToken(null)
    setUser(null)
    setSelectedPlan(null)
    setDealData(null)
    setOrderData(null)
    setConsentGiven(false)
  }

  // ── Flow state ────────────────────────────────────────────────────────────
  const [clientData, setClientData]   = useState(null)   // local registration form snapshot
  const [selectedPlan, setSelectedPlan] = useState(null) // plan object from API
  const [dealData, setDealData]       = useState(null)   // server-side calculated amounts
  const [orderData, setOrderData]     = useState(null)   // created order + Razorpay order ID
  const [consentGiven, setConsentGiven] = useState(false)// T&C + Privacy accepted

  return (
    <TradingContext.Provider value={{
      // auth
      user, setUser,
      token, saveToken, logout,
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
