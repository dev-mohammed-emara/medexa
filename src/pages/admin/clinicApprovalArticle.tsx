import { Building2, User, Mail, Phone, Calendar, FileText } from 'lucide-react'
import Badge from '../../components/ui/badge'
import { cn } from '../../utils/cn'

export interface Approval {
  id: number
  clinicName: string
  category: string
  ownerName: string
  email: string
  phone: string
  date: string
  documents: string[]
}

interface ClinicApprovalArticleProps {
  approval: Approval
  onReview: (approval: Approval) => void
  className?: string
}

export const ClinicApprovalArticle = ({ approval, onReview, className }: ClinicApprovalArticleProps) => {
  return (
    <article
      data-slot="card"
      className={cn(
        "text-card-foreground flex flex-col justify-between rounded-2xl duration-300 p-6 bg-white border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group text-right",
        className
      )}
      dir="rtl"
    >
      <div>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300 shrink-0">
            <Building2 className="text-white size-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg text-[#1E293B] font-bold mb-1.5 truncate group-hover:text-blue-600 transition-colors">
              {approval.clinicName}
            </h3>
            <Badge variant="purple">{approval.category}</Badge>
          </div>
        </div>

        <div className="space-y-4 mb-6 mt-8">
          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <User className="text-gray-400 size-4 shrink-0" />
            <span className="truncate">{approval.ownerName}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <Mail className="text-gray-400 size-4 shrink-0" />
            <span className="truncate font-mono text-xs">{approval.email}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <Phone className="text-gray-400 size-4 shrink-0" />
            <span className="font-mono text-xs">{approval.phone}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-gray-500">
            <Calendar className="text-gray-400 size-4 shrink-0" />
            <span className="text-xs">{approval.date}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <FileText className="text-gray-400 size-4 shrink-0" />
            <span className="text-emerald-600 font-medium">
              {approval.documents.length} مستند مرفق
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onReview(approval)}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md h-9.5 px-4 w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white cursor-pointer"
      >
        مراجعة الطلب
      </button>
    </article>
  )
}

export default ClinicApprovalArticle
