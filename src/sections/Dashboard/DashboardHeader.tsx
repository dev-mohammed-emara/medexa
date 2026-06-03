import { usePreloader } from "../../contexts/PreloaderContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { dashboardTranslations } from "../../constants/translations/dashboard"
import { cn } from "../../utils/cn"
import DateFromTo from "../../components/ui/DateFromTo"

interface DashboardHeaderProps {
  fromDate?: string
  toDate?: string
  onFromDateChange?: (dateStr: string) => void
  onToDateChange?: (dateStr: string) => void
  onApply?: () => void
  isLoading?: boolean
  hideFilters?: boolean
}

const DashboardHeader = ({
  fromDate = '',
  toDate = '',
  onFromDateChange = () => {},
  onToDateChange = () => {},
  onApply = () => {},
  isLoading = false,
  hideFilters = false
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

      {!hideFilters && (
        <DateFromTo
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={onFromDateChange}
          onToDateChange={onToDateChange}
          onApply={onApply}
          isLoading={isLoading}
        />
      )}
    </header>
  )
}

export default DashboardHeader
