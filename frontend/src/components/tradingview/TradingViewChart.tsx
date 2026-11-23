import { memo, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useThemeStore } from '@/stores/themeStore'
import { Search, TrendingUp } from 'lucide-react'

export interface TradingViewChartProps {
  initialSymbol?: string
  onSelectForTrading?: (symbol: string, exchange: string) => void
  height?: string | number
  className?: string
}

const POPULAR_SYMBOLS = [
  { label: 'RELIANCE', tvSymbol: 'NSE:RELIANCE', symbol: 'RELIANCE', exchange: 'NSE' },
  { label: 'TCS', tvSymbol: 'NSE:TCS', symbol: 'TCS', exchange: 'NSE' },
  { label: 'HDFC BANK', tvSymbol: 'NSE:HDFCBANK', symbol: 'HDFCBANK', exchange: 'NSE' },
  { label: 'INFY', tvSymbol: 'NSE:INFY', symbol: 'INFY', exchange: 'NSE' },
  { label: 'TATA MOTORS', tvSymbol: 'NSE:TATAMOTORS', symbol: 'TATAMOTORS', exchange: 'NSE' },
  { label: 'NIFTY 50 (ETF)', tvSymbol: 'NSE:NIFTYBEES', symbol: 'NIFTYBEES', exchange: 'NSE' },
  { label: 'BANK NIFTY (ETF)', tvSymbol: 'NSE:BANKBEES', symbol: 'BANKBEES', exchange: 'NSE' },
  { label: 'BTC/USDT', tvSymbol: 'BINANCE:BTCUSDT', symbol: 'BTCUSDFUT', exchange: 'CRYPTO' },
]

export const TradingViewChart = memo(function TradingViewChart({
  initialSymbol = 'NSE:RELIANCE',
  onSelectForTrading,
  height = '650px',
  className = '',
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const themeMode = useThemeStore((s) => s.mode)
  const [currentSymbol, setCurrentSymbol] = useState(initialSymbol)
  const [customInput, setCustomInput] = useState('')

  useEffect(() => {
    if (!containerRef.current) return

    // Clear previous widget
    containerRef.current.innerHTML = ''

    const widgetContainer = document.createElement('div')
    widgetContainer.className = 'tradingview-widget-container__widget'
    widgetContainer.style.height = '100%'
    widgetContainer.style.width = '100%'
    containerRef.current.appendChild(widgetContainer)

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: currentSymbol,
      interval: 'D',
      timezone: 'Asia/Kolkata',
      theme: themeMode === 'light' ? 'light' : 'dark',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: 'https://www.tradingview.com',
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: true,
      studies: ['STD;SMA'],
    })

    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [currentSymbol, themeMode])

  const handleSelectSymbol = (item: (typeof POPULAR_SYMBOLS)[0]) => {
    setCurrentSymbol(item.tvSymbol)
    onSelectForTrading?.(item.symbol, item.exchange)
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = customInput.trim().toUpperCase()
    if (!trimmed) return

    // If no exchange prefix, default to NSE:
    const formatted = trimmed.includes(':') ? trimmed : `NSE:${trimmed}`
    setCurrentSymbol(formatted)
    const [ex, sym] = formatted.split(':')
    onSelectForTrading?.(sym, ex)
    setCustomInput('')
  }

  return (
    <div className={`flex flex-col gap-3 w-full ${className}`}>
      {/* Quick Symbol Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-card p-2.5 rounded-lg border">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> Watchlist:
          </span>
          {POPULAR_SYMBOLS.map((item) => {
            const isActive = currentSymbol === item.tvSymbol
            return (
              <Button
                key={item.tvSymbol}
                size="sm"
                variant={isActive ? 'default' : 'outline'}
                className="h-7 text-xs px-2.5"
                onClick={() => handleSelectSymbol(item)}
              >
                {item.label}
              </Button>
            )
          })}
        </div>

        {/* Custom Symbol Search Form */}
        <form onSubmit={handleCustomSubmit} className="flex items-center gap-1.5 min-w-[200px]">
          <Input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="e.g. NSE:INFY or TATAPOWER"
            className="h-7 text-xs w-44"
          />
          <Button type="submit" size="sm" variant="secondary" className="h-7 text-xs px-2">
            <Search className="h-3.5 w-3.5 mr-1" />
            Chart
          </Button>
        </form>
      </div>

      {/* Helpful Hint on Exchange Licensing for Index Tickers */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border/50">
        <span>
          💡 <strong>Note on Indices:</strong> Under exchange licensing rules, TradingView restricts spot index tickers (e.g. <code>NSE:NIFTY</code>, <code>NSE:BANKNIFTY</code>) in free external embed widgets. Use index ETFs (like <strong>NIFTY 50 ETF (NIFTYBEES)</strong> or <strong>BANK NIFTY ETF (BANKBEES)</strong>) or equities (<strong>RELIANCE</strong>, <strong>TCS</strong>, <strong>INFY</strong>) for charting. Webhook alerts for OpenAlgo still support direct index symbols.
        </span>
      </div>

      {/* Embedded TradingView Chart Container */}
      <div
        className="w-full rounded-lg overflow-hidden border bg-background shadow-sm"
        style={{ height: typeof height === 'number' ? `${height}px` : height, minHeight: '550px' }}
      >
        <div
          ref={containerRef}
          className="tradingview-widget-container w-full h-full"
          style={{ height: '100%', width: '100%' }}
        />
      </div>
    </div>
  )
})
