import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api.js'

const NSE_HOLIDAYS_2026 = {
  '2026-01-26': 'Republic Day',
  '2026-03-03': 'Holi',
  '2026-03-26': 'Shri Ram Navami',
  '2026-03-31': 'Shri Mahavir Jayanti',
  '2026-04-03': 'Good Friday',
  '2026-04-14': 'Dr. Baba Saheb Ambedkar Jayanti',
  '2026-05-01': 'Maharashtra Day',
  '2026-05-28': 'Bakri Id',
  '2026-06-26': 'Muharram',
  '2026-09-14': 'Ganesh Chaturthi',
  '2026-10-02': 'Mahatma Gandhi Jayanti',
  '2026-10-20': 'Dussehra',
  '2026-11-10': 'Diwali-Balipratipada',
  '2026-11-24': 'Prakash Gurpurb Sri Guru Nanak Dev',
  '2026-12-25': 'Christmas',
}

/**
 * Computes Indian Stock Market (NSE/BSE) status based on IST (UTC+5:30)
 * and official NSE trading holidays.
 */
export function getMarketStatus() {
  const now = new Date()
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
  const ist = new Date(utc + (3600000 * 5.5))
  const year = ist.getFullYear()
  const month = String(ist.getMonth() + 1).padStart(2, '0')
  const dayNum = String(ist.getDate()).padStart(2, '0')
  const isoDate = `${year}-${month}-${dayNum}`
  const day = ist.getDay() // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
  const hour = ist.getHours()
  const minute = ist.getMinutes()
  const timeInMinutes = hour * 60 + minute

  const holidayName = NSE_HOLIDAYS_2026[isoDate]
  let isOpen = false
  let statusText = 'Market Closed'
  let closeReason = ''
  let reasonType = 'closed'

  if (holidayName) {
    closeReason = `NSE Holiday: ${holidayName}`
    reasonType = 'holiday'
  } else if (day === 0 || day === 6) {
    closeReason = day === 6 ? 'Weekend Closure (Saturday)' : 'Weekend Closure (Sunday)'
    reasonType = 'weekend'
  } else if (timeInMinutes < 540) {
    closeReason = 'Pre-Market Hours (Opens at 09:15 AM IST)'
    reasonType = 'pre_market'
  } else if (timeInMinutes >= 540 && timeInMinutes < 555) {
    statusText = 'Pre-Open Session'
    closeReason = 'Pre-Open Order Matching (Trading starts 09:15 AM IST)'
    reasonType = 'pre_open'
  } else if (timeInMinutes >= 555 && timeInMinutes < 930) {
    isOpen = true
    statusText = 'Market Open'
    closeReason = 'NSE/BSE Live Session (09:15 AM – 03:30 PM IST)'
    reasonType = 'open'
  } else {
    closeReason = 'Post-Market Hours (Session closed at 03:30 PM IST)'
    reasonType = 'post_market'
  }

  const timeFormatted = ist.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })

  return {
    isOpen,
    statusText,
    closeReason,
    reasonType,
    istDate: isoDate,
    istTime: timeFormatted,
    day,
    isWeekday: day >= 1 && day <= 5 && !holidayName,
    sessionHours: 'Mon–Fri 09:15 - 15:30 IST',
  }
}

const EMPTY_INDEX = {
  price: null,
  change: 0,
  percent: 0,
  dayHigh: null,
  dayLow: null,
  prevClose: null,
  marketTime: null,
  direction: 'up',
}

const MarketContext = createContext(null)

export function MarketProvider({ children }) {
  const [marketStatus, setMarketStatus] = useState(getMarketStatus)
  const [nifty, setNifty] = useState(EMPTY_INDEX)
  const [bankNifty, setBankNifty] = useState(EMPTY_INDEX)
  const [dataSource, setDataSource] = useState('loading')
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchLiveMarket = useCallback(async () => {
    try {
      const res = await api.market.indices()
      const d = res?.data
      if (d?.nifty) setNifty(d.nifty)
      if (d?.bankNifty) setBankNifty(d.bankNifty)
      if (d?.marketStatus) setMarketStatus(d.marketStatus)
      if (d?.source) setDataSource(d.source)
      if (d?.fetchedAt) setLastUpdated(d.fetchedAt)
    } catch {
      setMarketStatus(getMarketStatus())
      setDataSource(prev => (prev === 'loading' ? 'unavailable' : prev))
    }
  }, [])

  // Fetch live market data immediately and poll (2.5s when open, 30s when closed)
  useEffect(() => {
    fetchLiveMarket()
    const pollMs = marketStatus.isOpen ? 2500 : 30000
    const timer = setInterval(fetchLiveMarket, pollMs)
    return () => clearInterval(timer)
  }, [fetchLiveMarket, marketStatus.isOpen])

  // Keep local IST time / open-close transition responsive every 15 seconds
  useEffect(() => {
    const clockTimer = setInterval(() => {
      const local = getMarketStatus()
      setMarketStatus(prev => ({
        ...local,
        // Preserve exchange-detected holiday if backend reported one for today
        ...(prev.reasonType === 'holiday' && prev.istDate === local.istDate
          ? { isOpen: false, statusText: 'Market Closed', closeReason: prev.closeReason, reasonType: 'holiday' }
          : {}),
      }))
    }, 15000)
    return () => clearInterval(clockTimer)
  }, [])

  return (
    <MarketContext.Provider value={{
      marketStatus,
      nifty,
      bankNifty,
      dataSource,
      lastUpdated,
      refreshMarket: fetchLiveMarket,
    }}>
      {children}
    </MarketContext.Provider>
  )
}

export function useMarket() {
  const ctx = useContext(MarketContext)
  if (!ctx) {
    return {
      marketStatus: getMarketStatus(),
      nifty: EMPTY_INDEX,
      bankNifty: EMPTY_INDEX,
      dataSource: 'unavailable',
      lastUpdated: null,
      refreshMarket: () => {},
    }
  }
  return ctx
}
