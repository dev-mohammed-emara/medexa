import { cn } from '@/utils/cn'
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import { useLanguage } from '../../contexts/LanguageContext'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'

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
  totalPages,
  className,
  variant = 'table'
}: TableFooterProps) => {
  const { isAr } = useLanguage();
  const safeItemsPerPage = itemsPerPage > 0 ? itemsPerPage : Math.max(1, totalItems)
  const resolvedTotalPages = totalPages ?? Math.max(1, Math.ceil(totalItems / safeItemsPerPage))

  // Determine current value for items per page

  const PrevIcon = isAr ? LuChevronRight : LuChevronLeft;
  const NextIcon = isAr ? LuChevronLeft : LuChevronRight;

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row items-center gap-4 pt-4 px-6",
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
