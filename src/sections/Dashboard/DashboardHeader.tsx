import "flatpickr/dist/flatpickr.css"
import { Arabic } from "flatpickr/dist/l10n/ar.js"
import Flatpickr from "react-flatpickr"
import { FaCalendarAlt } from "react-icons/fa"
import { usePreloader } from "../../contexts/PreloaderContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { dashboardTranslations } from "../../constants/translations/dashboard"
import { cn } from "../../utils/cn"
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface DashboardHeaderProps {
  fromDate: string
  toDate: string
  onFromDateChange: (dateStr: string) => void
  onToDateChange: (dateStr: string) => void
  onApply: () => void
  isLoading?: boolean
}

const DashboardHeader = ({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onApply,
  isLoading = false
}: DashboardHeaderProps) => {
  const { isAr, t } = useLanguage()
  const T = dashboardTranslations
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting

  return (
    <header className={cn(
      "flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 opacity-0",
      canAnimate && "animate-fadeDown animate-delay-[100ms]"
    )} style={{ opacity: canAnimate ? 1 : 0 }} dir={isAr ? "rtl" : "ltr"}>
      <div className="text-start">
        <h1 className="text-3xl mb-1 font-bold">{t('title', T)}</h1>
        <p className="text-muted-foreground">{t('subtitle', T)}</p>
      </div>

      <div className="flex flex-wrap items-end gap-3" style={{ opacity: 1, transform: 'none' }}>
        <div className="space-y-1 flex-1 min-w-[140px] text-start">
          <label className="flex items-center gap-2 font-medium select-none text-xs pr-1">{t('from_date', T)}</label>
          <div className="relative group flex items-center justify-between h-9 bg-white border border-input rounded-md px-3 transition-all focus-within:ring-ring/50 focus-within:ring-[3px]">
            <Flatpickr
              value={fromDate}
              onChange={([date]) => {
                if (date) {
                  onFromDateChange(format(date, 'yyyy-MM-dd'))
                }
              }}
              options={{
                locale: isAr ? Arabic : undefined,
                dateFormat: "d F Y",
                disableMobile: true,
                maxDate: toDate,
                formatDate: (date: Date) => {
                  return format(date, "d MMMM yyyy", { locale: isAr ? ar : undefined })
                }
              }}
              className={`flex-1 bg-transparent border-none outline-none text-base md:text-sm h-full ${isAr ? "text-right" : "text-left"}`}
            />
            <FaCalendarAlt className="text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors size-3.5" />
          </div>
        </div>
        <div className="space-y-1 flex-1 min-w-[140px] text-start">
          <label className="flex items-center gap-2 font-medium select-none text-xs pr-1">{t('to_date', T)}</label>
          <div className="relative group flex items-center justify-between h-9 bg-white border border-input rounded-md px-3 transition-all focus-within:ring-ring/50 focus-within:ring-[3px]">
            <Flatpickr
              value={toDate}
              onChange={([date]) => {
                if (date) {
                  onToDateChange(format(date, 'yyyy-MM-dd'))
                }
              }}
              options={{
                locale: isAr ? Arabic : undefined,
                dateFormat: "d F Y",
                disableMobile: true,
                minDate: fromDate,
                maxDate: "today",
                formatDate: (date: Date) => {
                  return format(date, "d MMMM yyyy", { locale: isAr ? ar : undefined })
                }
              }}
              className={`flex-1 bg-transparent border-none outline-none text-base md:text-sm h-full ${isAr ? "text-right" : "text-left"}`}
            />
            <FaCalendarAlt className="text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors size-3.5" />
          </div>
        </div>
        <button
          onClick={onApply}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md text-primary-foreground hover:shadow-primary/20 px-4 py-2 h-9 bg-primary hover:bg-primary/90 min-w-[80px] disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (isAr ? "جاري التحميل..." : "Loading...") : t('apply', T)}
        </button>
      </div>
    </header>
  )
}

export default DashboardHeader
