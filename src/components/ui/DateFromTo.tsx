import { useMemo } from "react"
import "flatpickr/dist/flatpickr.css"
import { Arabic } from "flatpickr/dist/l10n/ar.js"
import Flatpickr from "react-flatpickr"
import { FaCalendarAlt } from "react-icons/fa"
import { useLanguage } from "../../contexts/LanguageContext"
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { cn } from "../../utils/cn"

interface DateFromToProps {
  fromDate: string
  toDate: string
  onFromDateChange: (dateStr: string) => void
  onToDateChange: (dateStr: string) => void
  onApply: () => void
  isLoading?: boolean
  className?: string
  showApply?: boolean
}

export const DateFromTo = ({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onApply,
  isLoading = false,
  className,
  showApply = true
}: DateFromToProps) => {
  const { isAr } = useLanguage()

  // Safely parse yyyy-MM-dd string to local Date object to prevent timezone shifting
  const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return undefined
    const parts = dateStr.split('-')
    if (parts.length !== 3) return undefined
    const [year, month, day] = parts.map(Number)
    return new Date(year, month - 1, day)
  }

  const fromDateObj = parseLocalDate(fromDate)
  const toDateObj = parseLocalDate(toDate)

  // Base configurations shared conceptually but returned as brand new objects
  const sharedFormatters = useMemo(() => ({
    locale: isAr ? Arabic : undefined,
    dateFormat: "d F Y",
    disableMobile: true,
    formatDate: (date: Date) => {
      return format(date, "d MMMM yyyy", { locale: isAr ? ar : undefined })
    }
  }), [isAr])

  // Independent options for "From Date"
  const fromDateOptions = useMemo(() => ({
    ...sharedFormatters,
    maxDate: toDateObj || "today" // Cannot select a start date later than the end date
  }), [sharedFormatters, toDateObj])

  // Independent options for "To Date"
  const toDateOptions = useMemo(() => ({
    ...sharedFormatters,
    minDate: fromDateObj // Cannot select an end date earlier than the start date
  }), [sharedFormatters, fromDateObj])

  return (
    <div className={cn("flex flex-wrap items-end gap-3", className)}>
      <div className="space-y-1.5 flex-1 min-w-[170px] text-start">
        <label className="flex items-center gap-2 font-bold select-none text-xs text-muted-foreground mr-1">
          {isAr ? "من تاريخ" : "From Date"}
        </label>
        <div className="relative group flex items-center justify-between h-11 bg-white border border-border rounded-xl px-4 transition-all focus-within:ring-4 focus-within:ring-primary/10">
          <Flatpickr
            key={`from-date-${fromDate}`} // Forces re-render on value update to sync min/max boundaries
            id="from-date-flatpickr"
            value={fromDateObj}
            onChange={([date]) => {
              if (date) {
                onFromDateChange(format(date, 'yyyy-MM-dd'))
              }
            }}
            options={fromDateOptions}
            placeholder={isAr ? "اختر التاريخ" : "Select date"}
            className={cn(
              "flex-1 bg-transparent border-none outline-none text-sm font-bold h-full",
              isAr ? "text-right" : "text-left"
            )}
          />
          <FaCalendarAlt className="text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors size-4" />
        </div>
      </div>

      <div className="space-y-1.5 flex-1 min-w-[170px] text-start">
        <label className="flex items-center gap-2 font-bold select-none text-xs text-muted-foreground mr-1">
          {isAr ? "إلى تاريخ" : "To Date"}
        </label>
        <div className="relative group flex items-center justify-between h-11 bg-white border border-border rounded-xl px-4 transition-all focus-within:ring-4 focus-within:ring-primary/10">
          <Flatpickr
            key={`to-date-${toDate}`} // Forces re-render on value update to sync min/max boundaries
            id="to-date-flatpickr"
            value={toDateObj}
            onChange={([date]) => {
              if (date) {
                onToDateChange(format(date, 'yyyy-MM-dd'))
              }
            }}
            options={toDateOptions}
            placeholder={isAr ? "اختر التاريخ" : "Select date"}
            className={cn(
              "flex-1 bg-transparent border-none outline-none text-sm font-bold h-full",
              isAr ? "text-right" : "text-left"
            )}
          />
          <FaCalendarAlt className="text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors size-4" />
        </div>
      </div>

      {showApply && (
        <button
          onClick={onApply}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-300 outline-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md text-primary-foreground hover:shadow-primary/20 px-6 h-11 bg-primary hover:bg-primary/90 min-w-[100px] disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (isAr ? "جاري التحميل..." : "Loading...") : (isAr ? "تطبيق الفلاتر" : "Apply Filters")}
        </button>
      )}
    </div>
  )
}

export default DateFromTo