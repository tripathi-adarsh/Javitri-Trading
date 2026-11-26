import { createContext, useContext, useState, useEffect } from 'react'

/**
 * Checks if the Indian Stock Market is currently open based on IST (UTC+5:30).
 * Market trading sessions: Monday to Friday from 09:00 AM to 03:30 PM (15:30) IST.
 */
export function getMarketStatus() {
  const now = new Date()
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
  const ist = new Date(utc + (3600000 * 5.5))
  const day = ist.getDay() // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
  const hour = ist.getHours()
  const minute = ist.getMinutes()
  const timeInMinutes = hour * 60 + minute

  // Market opens Monday to Friday from 09:00 AM (540 mins) to 03:30 PM (930 mins)
  const isWeekday = day >= 1 && day <= 5
  const isOpen = isWeekday && timeInMinutes >= 540 && timeInMinutes < 930

  const timeFormatted = ist.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })

  return {
    isOpen,
    statusText: isOpen ? 'Market Open' : 'Market Closed',
    istTime: timeFormatted,
    day,
    isWeekday,
    sessionHours: 'Mon–Fri 09:00 - 15:30 IST',
  }
}

const MarketContext = createContext(null)

export function MarketProvider({ children }) {
  const [marketStatus, setMarketStatus] = useState(getMarketStatus)
  const [nifty, setNifty] = useState({
    price: 24180.50,
    change: 172.40,
    percent: 0.72,
    direction: 'up',
  })
  const [bankNifty, setBankNifty] = useState({
    price: 51290.40,
    change: 428.15,
    percent: 0.84,
    direction: 'up',
  })

  // Periodically re-evaluate market status (every 10 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setMarketStatus(getMarketStatus())
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  // Live real-time price fluctuation simulation (every 2.2 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setNifty(prev => {
        // Micro fluctuation: small points change
        const delta = (Math.random() - 0.47) * 3.2
        const newPrice = Number((prev.price + delta).toFixed(2))
        const newChange = Number((prev.change + delta).toFixed(2))
        const basePrice = 24008.10
        const newPercent = Number(((newChange / basePrice) * 100).toFixed(2))
        return {
          price: newPrice,
          change: newChange,
          percent: newPercent,
          direction: delta >= 0 ? 'up' : 'down',
        }
      })

      setBankNifty(prev => {
        const delta = (Math.random() - 0.47) * 7.5
        const newPrice = Number((prev.price + delta).toFixed(2))
        const newChange = Number((prev.change + delta).toFixed(2))
        const basePrice = 50862.25
        const newPercent = Number(((newChange / basePrice) * 100).toFixed(2))
        return {
          price: newPrice,
          change: newChange,
          percent: newPercent,
          direction: delta >= 0 ? 'up' : 'down',
        }
      })
    }, 2200)

    return () => clearInterval(interval)
  }, [])

  return (
    <MarketContext.Provider value={{ marketStatus, nifty, bankNifty }}>
      {children}
    </MarketContext.Provider>
  )
}

export function useMarket() {
  const ctx = useContext(MarketContext)
  if (!ctx) {
    return {
      marketStatus: getMarketStatus(),
      nifty: { price: 24180.50, change: 172.40, percent: 0.72, direction: 'up' },
      bankNifty: { price: 51290.40, change: 428.15, percent: 0.84, direction: 'up' },
    }
  }
  return ctx
}
