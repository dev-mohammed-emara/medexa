import Flatpickr from "react-flatpickr"
import { Arabic } from "flatpickr/dist/l10n/ar.js"
import "flatpickr/dist/flatpickr.css"
import { FaCalendarAlt } from "react-icons/fa"
import { usePreloader } from "../../contexts/PreloaderContext"
import { cn } from "../../utils/cn"

const DashboardHeader = () => {
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting
  const handleApply = () => {
    window.showToast('تم تحديث البيانات بنجاح')
  }

  const commonOptions = {
    locale: Arabic,
    dateFormat: "Y-m-d",
    disableMobile: true,
    maxDate: "today"
  }

  return (
    <header className={cn(
      "flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 opacity-0",
      canAnimate && "animate-fadeDown animate-delay-500"
    )} style={{ opacity: canAnimate ? 1 : 0 }}>
      <div>
        <h1 className="text-3xl mb-1 font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground">نظرة عامة على أداء العيادة</p>
      </div>

      <div className="flex flex-wrap items-end gap-3" style={{ opacity: 1, transform: 'none' }}>
        <div className="space-y-1 flex-1 min-w-[140px]">
          <label className="flex items-center gap-2 font-medium select-none text-xs">من تاريخ</label>
          <div className="relative group">
            <Flatpickr
              value="2026-02-01"
              options={commonOptions}
              className="flex w-full rounded-md border border-input pl-10 pr-3 py-1 text-base transition-all outline-none md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] h-9 bg-white"
            />
            <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors size-3.5" />
          </div>
        </div>
        <div className="space-y-1 flex-1 min-w-[140px]">
          <label className="flex items-center gap-2 font-medium select-none text-xs">إلى تاريخ</label>
          <div className="relative group">
            <Flatpickr
              value="2026-02-28"
              options={commonOptions}
              className="flex w-full rounded-md border border-input pl-10 pr-3 py-1 text-base transition-all outline-none md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] h-9 bg-white"
            />
            <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors size-3.5" />
          </div>
        </div>
        <button
          onClick={handleApply}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md text-primary-foreground hover:shadow-primary/20 px-4 py-2 h-9 bg-primary hover:bg-primary/90 min-w-[80px]"
        >
          تطبيق
        </button>
      </div>
    </header>
  )
}

export default DashboardHeader
