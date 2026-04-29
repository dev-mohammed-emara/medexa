import { LuChevronRight, LuChevronLeft } from 'react-icons/lu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'
import { cn } from '@/utils/cn'
import { useLanguage } from '../../contexts/LanguageContext'

interface TableFooterProps {
  totalItems: number
  itemsPerPage: number
  currentPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (count: string) => void
  totalPages?: number
  className?: string
  variant?: 'table' | 'list'
}

const TableFooter = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
  totalPages,
  className,
  variant = 'table'
}: TableFooterProps) => {
  const { isAr } = useLanguage();
  const resolvedTotalPages = totalPages ?? Math.max(1, Math.ceil(totalItems / itemsPerPage))

  // Determine current value for items per page
  const currentValue = itemsPerPage >= totalItems ? "all" : String(itemsPerPage)

  const PrevIcon = isAr ? LuChevronRight : LuChevronLeft;
  const NextIcon = isAr ? LuChevronLeft : LuChevronRight;

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row items-center gap-4 py-4 px-6",
        variant === 'table' ? "bg-white border-t border-border rounded-b-xl mt-0" : "bg-transparent mt-6",
        isAr ? "flex-row-reverse" : "flex-row",
        className
      )}
      dir={isAr ? "rtl" : "ltr"}
    >
      {variant === 'table' && (
        <div className="flex items-center gap-4 flex-1">
          <span className="text-sm text-muted-foreground font-bold">
            {isAr ? "إجمالي السجلات:" : "Total Records:"} <span className="font-black text-foreground ml-1">{totalItems}</span>
          </span>
          
          {onItemsPerPageChange && (
            <div className={cn("flex items-center gap-2 border-border", isAr ? "border-r pr-4" : "border-l pl-4")}>
              <span className="text-sm text-muted-foreground font-bold">{isAr ? "عرض" : "Show"}</span>
              <div className="w-[82px] shrink-0">
                <Select
                  value={currentValue}
                  onValueChange={(val) => {
                    if (val === "all") {
                      onItemsPerPageChange(String(totalItems))
                    } else {
                      onItemsPerPageChange(val)
                    }
                  }}
                >
                  <SelectTrigger className="h-9 border-border rounded-xl text-sm font-bold text-foreground bg-white px-2.5 gap-1 shadow-xs focus:ring-primary/10">
                    <SelectValue placeholder={currentValue === "all" ? (isAr ? "الكل" : "All") : currentValue} />
                  </SelectTrigger>
                  <SelectContent smallZ>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="all" className="text-primary font-black">{isAr ? "الكل" : "All"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={cn("flex items-center gap-2", variant === 'list' && "mx-auto")}>
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={cn(
            "p-2 rounded-xl transition-all duration-200 flex items-center justify-center border border-border shadow-xs",
            currentPage === 1
              ? "text-muted-foreground/40 bg-muted/20 cursor-not-allowed border-transparent"
              : "text-foreground bg-white hover:bg-gray-50 active:scale-95 hover:border-primary/30"
          )}
          title={isAr ? "السابق" : "Previous"}
        >
          <PrevIcon className="size-5" />
        </button>

        <div className="min-w-[70px]">
          <Select
            value={String(currentPage)}
            onValueChange={(value) => onPageChange(Number(value))}
            disabled={resolvedTotalPages <= 1}
          >
            <SelectTrigger className="h-10 rounded-xl border-none bg-primary text-white px-4 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent smallZ>
              {Array.from({ length: resolvedTotalPages }, (_, idx) => idx + 1).map((page) => (
                <SelectItem key={page} value={String(page)} className="font-bold">{page}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          disabled={currentPage >= resolvedTotalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={cn(
            "p-2 rounded-xl transition-all duration-200 flex items-center justify-center border border-border shadow-xs",
            currentPage >= resolvedTotalPages
              ? "text-muted-foreground/40 bg-muted/20 cursor-not-allowed border-transparent"
              : "text-foreground bg-white hover:bg-gray-50 active:scale-95 hover:border-primary/30"
          )}
          title={isAr ? "التالي" : "Next"}
        >
          <NextIcon className="size-5" />
        </button>
      </div>
    </div>
  )
}

export default TableFooter
