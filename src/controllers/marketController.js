'use strict'

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

const CACHE_TTL_MS = 2000
let cachedData = null
let cachedAt = 0

function getISTParts(date = new Date()) {
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60000
  const ist = new Date(utcMs + 3600000 * 5.5)
  const year = ist.getFullYear()
  const month = String(ist.getMonth() + 1).padStart(2, '0')
  const dayNum = String(ist.getDate()).padStart(2, '0')
  const isoDate = `${year}-${month}-${dayNum}`
  const day = ist.getDay()
  const hour = ist.getHours()
  const minute = ist.getMinutes()
  const timeInMinutes = hour * 60 + minute
  const timeFormatted = ist.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
  return { ist, isoDate, day, hour, minute, timeInMinutes, timeFormatted }
}

function computeMarketStatus(regularPeriod = null) {
  const { isoDate, day, timeInMinutes, timeFormatted } = getISTParts()
  const holidayName = NSE_HOLIDAYS_2026[isoDate]

  let isOpen = false
  let statusText = 'Market Closed'
  let closeReason = ''
  let reasonType = 'closed'

  if (holidayName) {
    isOpen = false
    statusText = 'Market Closed'
    closeReason = `NSE Holiday: ${holidayName}`
    reasonType = 'holiday'
  } else if (day === 0 || day === 6) {
    isOpen = false
    statusText = 'Market Closed'
    closeReason = day === 6 ? 'Weekend Closure (Saturday)' : 'Weekend Closure (Sunday)'
    reasonType = 'weekend'
  } else {
    // Check if Yahoo exchange regular period matches today's IST date
    let isExchangeHoliday = false
    if (regularPeriod?.start && timeInMinutes >= 555) {
      const periodStartDate = getISTParts(new Date(regularPeriod.start * 1000)).isoDate
      if (periodStartDate !== isoDate) {
        isExchangeHoliday = true
      }
    }

    if (isExchangeHoliday) {
      isOpen = false
      statusText = 'Market Closed'
      closeReason = 'Exchange Trading Holiday (NSE/BSE Closed)'
      reasonType = 'holiday'
    } else if (timeInMinutes < 540) {
      isOpen = false
      statusText = 'Market Closed'
      closeReason = 'Pre-Market Hours (Opens at 09:15 AM IST)'
      reasonType = 'pre_market'
    } else if (timeInMinutes >= 540 && timeInMinutes < 555) {
      isOpen = false
      statusText = 'Pre-Open Session'
      closeReason = 'Pre-Open Order Matching (Trading starts 09:15 AM IST)'
      reasonType = 'pre_open'
    } else if (timeInMinutes >= 555 && timeInMinutes < 930) {
      isOpen = true
      statusText = 'Market Open'
      closeReason = 'NSE/BSE Live Session (09:15 AM – 03:30 PM IST)'
      reasonType = 'open'
    } else {
      isOpen = false
      statusText = 'Market Closed'
      closeReason = 'Post-Market Hours (Session ended at 03:30 PM IST)'
      reasonType = 'post_market'
    }
  }

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

async function fetchYahooIndex(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d&_=${Date.now()}`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) throw new Error(`Upstream HTTP ${res.status}`)

  const json = await res.json()
  const meta = json?.chart?.result?.[0]?.meta
  if (!meta || typeof meta.regularMarketPrice !== 'number') {
    throw new Error(`Invalid market payload for ${symbol}`)
  }

  const price = Number(meta.regularMarketPrice.toFixed(2))
  const prevClose = Number((meta.previousClose ?? meta.chartPreviousClose ?? price).toFixed(2))
  const change = meta.fulldayChange !== undefined
    ? Number(Number(meta.fulldayChange).toFixed(2))
    : Number((price - prevClose).toFixed(2))
  const percent = meta.fulldayChangePercent !== undefined
    ? Number(Number(meta.fulldayChangePercent).toFixed(2))
    : (prevClose > 0 ? Number(((change / prevClose) * 100).toFixed(2)) : 0)

  return {
    symbol: meta.symbol,
    name: meta.shortName || meta.longName || symbol,
    price,
    prevClose,
    change,
    percent,
    dayHigh: meta.regularMarketDayHigh ? Number(meta.regularMarketDayHigh.toFixed(2)) : null,
    dayLow: meta.regularMarketDayLow ? Number(meta.regularMarketDayLow.toFixed(2)) : null,
    marketTime: meta.regularMarketTime || null,
    regularPeriod: meta.currentTradingPeriod?.regular || null,
    direction: change >= 0 ? 'up' : 'down',
  }
}

exports.getLiveIndices = async (_req, res) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  })

  const now = Date.now()
  if (cachedData && now - cachedAt < CACHE_TTL_MS) {
    return res.json({
      success: true,
      data: {
        ...cachedData,
        marketStatus: computeMarketStatus(cachedData._regularPeriod),
      },
    })
  }

  try {
    const [niftyRaw, bankNiftyRaw] = await Promise.all([
      fetchYahooIndex('^NSEI'),
      fetchYahooIndex('^NSEBANK'),
    ])

    const regularPeriod = niftyRaw.regularPeriod || bankNiftyRaw.regularPeriod
    const marketStatus = computeMarketStatus(regularPeriod)

    const { regularPeriod: _rp1, ...nifty } = niftyRaw
    const { regularPeriod: _rp2, ...bankNifty } = bankNiftyRaw

    cachedData = {
      source: 'live',
      fetchedAt: new Date().toISOString(),
      nifty,
      bankNifty,
      _regularPeriod: regularPeriod,
    }
    cachedAt = now

    return res.json({
      success: true,
      data: {
        source: cachedData.source,
        fetchedAt: cachedData.fetchedAt,
        marketStatus,
        nifty,
        bankNifty,
      },
    })
  } catch (err) {
    if (cachedData) {
      return res.json({
        success: true,
        data: {
          source: 'cached',
          fetchedAt: cachedData.fetchedAt,
          marketStatus: computeMarketStatus(cachedData._regularPeriod),
          nifty: cachedData.nifty,
          bankNifty: cachedData.bankNifty,
        },
      })
    }

    return res.status(503).json({
      success: false,
      message: 'Live market feed temporarily unavailable',
      data: {
        source: 'unavailable',
        marketStatus: computeMarketStatus(null),
      },
    })
  }
}

exports.computeMarketStatus = computeMarketStatus
