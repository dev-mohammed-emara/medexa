import {
  ArrowRight,
  TriangleAlert,
  Clock,
  Users,
  ArrowUpCircle,
  Settings,
  CircleCheck,
  Link2,
  User,
  Building2,
  Target,
  Sparkles,
  CircleX,
  Paperclip,
  Send,
  Pen,
  Mail,
  Phone,
  Zap,
  History,
  Activity
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import Badge from '../../components/ui/badge'
import { usePreloader } from '../../contexts/PreloaderContext'
import { cn } from '../../utils/cn'

interface Ticket {
  id: string
  reporter: string
  clinic: string
  category: string
  subject: string
  priority: 'عالية' | 'متوسطة' | 'حرجة' | 'منخفضة'
  status: 'قيد المعالجة' | 'بانتظار العيادة' | 'تم التصعيد' | 'مفتوحة' | 'تم التعيين' | 'مغلقة'
  assignedTo: string
  createdDate: string
  lastActivity: string
  sla: 'ضمن الوقت' | 'تجاوز الوقت'
}

interface Message {
  id: number
  sender: string
  senderRole: string
  senderAvatar: string
  senderColor: string
  time: string
  content: string
  isInternal?: boolean
  attachment?: string
}

const TICKETS_DATA: Record<string, Ticket> = {
  'TKT-1245': {
    id: 'TKT-1245',
    reporter: 'د. محمد العمري',
    clinic: 'عيادة النور الطبية',
    category: 'إدارة المواعيد',
    subject: 'مشكلة في حفظ المواعيد الجديدة',
    priority: 'عالية',
    status: 'قيد المعالجة',
    assignedTo: 'أحمد الفني',
    createdDate: '2024-05-18 10:30',
    lastActivity: '2024-05-18 14:20',
    sla: 'ضمن الوقت'
  },
  'TKT-1244': {
    id: 'TKT-1244',
    reporter: 'سارة المومني',
    clinic: 'عيادة الشفاء للأسنان',
    category: 'السجلات الطبية',
    subject: 'عدم ظهور التقارير بشكل صحيح',
    priority: 'متوسطة',
    status: 'بانتظار العيادة',
    assignedTo: 'خالد التقني',
    createdDate: '2024-05-17 14:20',
    lastActivity: '2024-05-18 09:15',
    sla: 'ضمن الوقت'
  },
  'TKT-1243': {
    id: 'TKT-1243',
    reporter: 'د. فاطمة الحسيني',
    clinic: 'مركز الرعاية للقلب',
    category: 'التقارير المالية',
    subject: 'خطأ في حساب الإيرادات',
    priority: 'حرجة',
    status: 'تم التصعيد',
    assignedTo: 'سارة المالية',
    createdDate: '2024-05-17 09:15',
    lastActivity: '2024-05-18 13:45',
    sla: 'تجاوز الوقت'
  },
  'TKT-1242': {
    id: 'TKT-1242',
    reporter: 'خالد الخطيب',
    clinic: 'عيادة السلام الجراحية',
    category: 'إدارة الأطباء',
    subject: 'طلب تحسين واجهة إضافة الأطباء',
    priority: 'منخفضة',
    status: 'مفتوحة',
    assignedTo: '-',
    createdDate: '2024-05-16 16:45',
    lastActivity: '2024-05-16 16:45',
    sla: 'ضمن الوقت'
  },
  'TKT-1241': {
    id: 'TKT-1241',
    reporter: 'يوسف الإداري',
    clinic: 'عيادة الحياة للأطفال',
    category: 'نظام التأمين',
    subject: 'مشكلة في إضافة تأمين جديد',
    priority: 'عالية',
    status: 'تم التعيين',
    assignedTo: 'أحمد الفني',
    createdDate: '2024-05-17 11:20',
    lastActivity: '2024-05-18 08:30',
    sla: 'ضمن الوقت'
  }
}

const clinicIdMap: Record<string, number> = {
  'عيادة النور الطبية': 1,
  'عيادة الشفاء للأسنان': 2,
  'مركز الرعاية للقلب': 3,
  'عيادة السلام الجراحية': 4,
  'عيادة الحياة للأطفال': 5
}

const clinicCategoryMap: Record<string, string> = {
  'عيادة النور الطبية': 'طب عام',
  'عيادة الشفاء للأسنان': 'طب أسنان',
  'مركز الرعاية للقلب': 'أمراض القلب',
  'عيادة السلام الجراحية': 'جراحة عامة',
  'عيادة الحياة للأطفال': 'طب أطفال'
}

const reporterContactMap: Record<string, { email: string; phone: string }> = {
  'د. محمد العمري': { email: 'mohammed@alnour.jo', phone: '+962-79-111-2222' },
  'سارة المومني': { email: 'sara@shifa.jo', phone: '+962-78-333-4444' },
  'د. فاطمة الحسيني': { email: 'fatima@care.jo', phone: '+962-77-555-6666' },
  'خالد الخطيب': { email: 'khaled@salam.jo', phone: '+962-79-777-8888' },
  'يوسف الإداري': { email: 'yousef@hayat.jo', phone: '+962-78-999-0000' }
}

const AdminTicketDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting

  const ticketId = id || 'TKT-1245'
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [replyText, setReplyText] = useState('')
  const [showSmartReply, setShowSmartReply] = useState(true)

  useEffect(() => {
    const matchedTicket = TICKETS_DATA[ticketId] || TICKETS_DATA['TKT-1245']
    setTicket(matchedTicket)

    // Prepopulate some default messages based on the selected ticket
    setMessages([
      {
        id: 1,
        sender: matchedTicket.reporter,
        senderRole: 'المُبلّغ',
        senderAvatar: matchedTicket.reporter.trim().replace('د. ', '').charAt(0),
        senderColor: 'bg-blue-500',
        time: matchedTicket.createdDate,
        content: `السلام عليكم، لدي مشكلة في ${matchedTicket.category}. عند محاولة ${matchedTicket.subject} يظهر خطأ في النظام.`,
        attachment: 'screenshot-error.png'
      },
      {
        id: 2,
        sender: matchedTicket.assignedTo !== '-' ? matchedTicket.assignedTo : 'الدعم الفني',
        senderRole: 'فريق الدعم الفني',
        senderAvatar: matchedTicket.assignedTo !== '-' ? matchedTicket.assignedTo.charAt(0) : 'أ',
        senderColor: 'bg-emerald-500',
        time: '2024-05-18 10:45',
        content: `وعليكم السلام ${matchedTicket.reporter}، شكراً على التواصل. سأقوم بفحص المشكلة فوراً. هل يمكنك إخباري متى بدأت هذه المشكلة بالظهور؟`
      },
      {
        id: 3,
        sender: matchedTicket.reporter,
        senderRole: 'المُبلّغ',
        senderAvatar: matchedTicket.reporter.trim().replace('د. ', '').charAt(0),
        senderColor: 'bg-blue-500',
        time: '2024-05-18 11:00',
        content: 'بدأت المشكلة صباح اليوم. كنت أستطيع إضافة المواعيد بالأمس دون أي مشاكل.'
      },
      {
        id: 4,
        sender: matchedTicket.assignedTo !== '-' ? matchedTicket.assignedTo : 'الدعم الفني',
        senderRole: 'فريق الدعم الفني',
        senderAvatar: matchedTicket.assignedTo !== '-' ? matchedTicket.assignedTo.charAt(0) : 'أ',
        senderColor: 'bg-amber-500',
        time: '2024-05-18 11:15',
        content: 'ملاحظة داخلية: تم فحص السجلات، يبدو أن المشكلة مرتبطة بتحديث النظام الأخير. سأقوم بالتنسيق مع فريق التطوير.',
        isInternal: true
      },
      ...(matchedTicket.status !== 'مفتوحة'
        ? [
            {
              id: 5,
              sender: matchedTicket.assignedTo !== '-' ? matchedTicket.assignedTo : 'الدعم الفني',
              senderRole: 'فريق الدعم الفني',
              senderAvatar: matchedTicket.assignedTo !== '-' ? matchedTicket.assignedTo.charAt(0) : 'أ',
              senderColor: 'bg-emerald-500',
              time: matchedTicket.lastActivity,
              content: `د. محمد، تم تحديد المشكلة وهي مرتبطة بتحديث أجريناه مؤخراً. نعمل الآن على حلها وسيتم إصلاحها خلال الساعتين القادمتين.`
            }
          ]
        : [])
    ])
  }, [ticketId])

  if (!ticket) return null

  const clinicId = clinicIdMap[ticket.clinic] || 1
  const clinicCategory = clinicCategoryMap[ticket.clinic] || 'طب عام'
  const reporterContact = reporterContactMap[ticket.reporter] || {
    email: 'info@clinic.jo',
    phone: '+962-79-000-0000'
  }

  const handleReturn = async () => {
    if (window.triggerExitTransition) {
      await window.triggerExitTransition()
    }
    navigate('/admin/tickets')
  }

  const handleViewClinic = async () => {
    if (window.triggerExitTransition) {
      await window.triggerExitTransition()
    }
    navigate(`/admin/clinics/${clinicId}`)
  }

  const handleReset = () => {
    setTicket(prev => {
      if (!prev) return null
      window.showToast('تم إعادة تعيين التذكرة بنجاح', 'success')
      return { ...prev, status: 'مفتوحة', assignedTo: '-' }
    })
  }

  const handleEscalate = () => {
    setTicket(prev => {
      if (!prev) return null
      window.showToast('تم تصعيد التذكرة إلى المستوى الأعلى', 'error')
      return { ...prev, status: 'تم التصعيد', priority: 'حرجة' }
    })
  }

  const handleChangeStatus = () => {
    const statuses: Ticket['status'][] = [
      'مفتوحة',
      'تم التعيين',
      'قيد المعالجة',
      'بانتظار العيادة',
      'تم التصعيد',
      'مغلقة'
    ]
    const currentIndex = statuses.indexOf(ticket.status)
    const nextStatus = statuses[(currentIndex + 1) % statuses.length]

    setTicket(prev => {
      if (!prev) return null
      window.showToast(`تم تغيير حالة التذكرة إلى: ${nextStatus}`, 'info')
      return { ...prev, status: nextStatus }
    })
  }

  const handleCloseTicket = () => {
    setTicket(prev => {
      if (!prev) return null
      window.showToast('تم إغلاق التذكرة بنجاح', 'success')
      return { ...prev, status: 'مغلقة' }
    })
  }

  const handleMergeTicket = () => {
    window.showToast('ميزة دمج التذاكر ستتوفر قريباً', 'info')
  }

  const handleSendReply = (isInternalNote = false) => {
    if (!replyText.trim()) {
      window.showToast('يرجى كتابة نص الرد أولاً', 'error')
      return
    }

    const newMsg: Message = {
      id: messages.length + 1,
      sender: isInternalNote ? 'أحمد الفني (ملاحظة)' : 'أحمد الفني',
      senderRole: 'فريق الدعم الفني',
      senderAvatar: 'أ',
      senderColor: isInternalNote ? 'bg-amber-500' : 'bg-emerald-500',
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      content: replyText,
      isInternal: isInternalNote
    }

    setMessages(prev => [...prev, newMsg])
    setReplyText('')
    window.showToast(
      isInternalNote ? 'تم إضافة الملاحظة الداخلية بنجاح' : 'تم إرسال الرد للمُبلّغ',
      'success'
    )
  }

  const handleUseSmartReply = () => {
    setReplyText('تم تحديد المشكلة وسيتم حلها قريباً. سنقوم بإبلاغك فور إصلاح النظام.')
  }

  return (
    <AdminLayout>
      <div
        className={cn(
          'space-y-6 pb-8 opacity-0',
          canAnimate && 'animate-fadeUp opacity-100 animate-delay-[100ms]',
          isExiting && 'animate-fadeDownOut'
        )}
        dir="rtl"
        style={{ opacity: canAnimate ? 1 : 0 }}
      >
        {/* Header and badges */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <button
              onClick={handleReturn}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md hover:bg-accent dark:hover:bg-accent/50 h-9 px-4 py-2 text-[#64748B] hover:text-[#0F172A] mb-3 -mr-2 cursor-pointer"
            >
              <ArrowRight className="size-4 ml-2" />
              <span>العودة إلى التذاكر</span>
            </button>

            <div className="flex items-center gap-4 mb-3">
              <h1 className="text-3xl text-[#0F172A] font-bold">{ticket.id}</h1>
              
              <Badge
                variant={
                  ticket.priority === 'حرجة'
                    ? 'red'
                    : ticket.priority === 'عالية'
                    ? 'yellow'
                    : ticket.priority === 'متوسطة'
                    ? 'blue'
                    : 'purple'
                }
              >
                <TriangleAlert className="size-3.5 ml-1" />
                <span>{ticket.priority}</span>
              </Badge>

              <Badge
                variant={
                  ticket.status === 'تم التصعيد'
                    ? 'red'
                    : ticket.status === 'قيد المعالجة'
                    ? 'yellow'
                    : ticket.status === 'مفتوحة'
                    ? 'blue'
                    : ticket.status === 'تم التعيين'
                    ? 'purple'
                    : ticket.status === 'مغلقة'
                    ? 'green'
                    : 'yellow'
                }
              >
                <span>{ticket.status}</span>
              </Badge>

              <Badge variant={ticket.sla === 'ضمن الوقت' ? 'green' : 'red'}>
                <Clock className="size-3.5 ml-1" />
                <span>{ticket.sla}</span>
              </Badge>
            </div>

            <h2 className="text-xl text-[#334155] mb-2">{ticket.subject}</h2>

            <div className="flex items-center gap-6 text-sm text-[#64748B] flex-wrap">
              <div className="flex items-center gap-2">
                <Clock className="size-4" />
                <span>تم الإنشاء: {ticket.createdDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="size-4" />
                <span>آخر نشاط: {ticket.lastActivity}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">متبقي: 4 ساعات 15 دقيقة</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md hover:shadow-primary/20 h-9 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white cursor-pointer"
          >
            <Users className="size-4 ml-2" />
            <span>إعادة تعيين</span>
          </button>
          
          <button
            onClick={handleEscalate}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md hover:shadow-primary/20 h-9 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white cursor-pointer"
          >
            <ArrowUpCircle className="size-4 ml-2" />
            <span>تصعيد</span>
          </button>
          
          <button
            onClick={handleChangeStatus}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md hover:shadow-primary/20 h-9 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
          >
            <Settings className="size-4 ml-2" />
            <span>تغيير الحالة</span>
          </button>
          
          <button
            onClick={handleCloseTicket}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md hover:shadow-primary/20 h-9 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer"
          >
            <CircleCheck className="size-4 ml-2" />
            <span>إغلاق التذكرة</span>
          </button>
          
          <button
            onClick={handleMergeTicket}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md hover:shadow-primary/20 h-9 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
          >
            <Link2 className="size-4 ml-2" />
            <span>دمج تذكرة</span>
          </button>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Right Main Column (Ticket info, Conversations, Reply Editor) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Description Card */}
            <div className="text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-white border border-gray-200 shadow-sm">
              <h3 className="text-lg text-[#0F172A] font-semibold mb-1">وصف المشكلة</h3>
              <p className="text-[#334155] leading-relaxed">
                {ticket.subject === 'مشكلة في حفظ المواعيد الجديدة' 
                  ? 'عند محاولة إضافة موعد جديد، يظهر خطأ في النظام ولا يتم الحفظ بشكل صحيح'
                  : `يواجه المستخدم مشكلة في ${ticket.category}، حيث يظهر خطأ في النظام يعيق استكمال العمل.`
                }
              </p>
              
              <div className="mt-4 flex items-center gap-4 text-sm text-[#64748B] flex-wrap">
                <div className="flex items-center gap-2">
                  <User className="size-4" />
                  <span>{ticket.reporter}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="size-4" />
                  <span>{ticket.clinic}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="size-4" />
                  <span>{ticket.category}</span>
                </div>
              </div>
            </div>

            {/* Smart Reply Card */}
            {showSmartReply && (
              <div className="text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-200/50 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="text-white size-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[#0F172A] font-semibold">اقتراح رد ذكي</h4>
                      <button 
                        onClick={() => setShowSmartReply(false)} 
                        className="text-[#64748B] hover:text-[#334155] cursor-pointer"
                      >
                        <CircleX className="size-4.5" />
                      </button>
                    </div>
                    <p className="text-[#334155] text-sm mb-3">
                      تم تحديد المشكلة وسيتم حلها قريباً. سنقوم بإبلاغك فور إصلاح النظام.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleUseSmartReply}
                        className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md hover:shadow-primary/20 h-8 rounded-md gap-1.5 px-3 bg-purple-500 hover:bg-purple-600 text-white cursor-pointer"
                      >
                        استخدام هذا الرد
                      </button>
                      <button
                        onClick={() => {
                          handleUseSmartReply();
                          document.getElementById('reply-textarea')?.focus();
                        }}
                        className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md border bg-background hover:text-accent-foreground hover:bg-purple-500/10 h-8 rounded-md gap-1.5 px-3 border-purple-200 text-purple-600 cursor-pointer"
                      >
                        تعديل وإرسال
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            <div className="text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-white border border-gray-200 shadow-sm">
              <h3 className="text-lg text-[#0F172A] font-semibold mb-6">المحادثة</h3>
              
              <div className="space-y-6">
                {messages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={cn(
                      'flex gap-4',
                      msg.isInternal && 'opacity-90'
                    )}
                  >
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold', msg.senderColor)}>
                      {msg.senderAvatar}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[#0F172A] font-semibold text-sm">{msg.sender}</span>
                        {msg.isInternal && (
                          <Badge variant="yellow" className="text-[10px] px-1 py-0 bg-amber-500/10 text-amber-600 border-amber-500/20">
                            ملاحظة داخلية
                          </Badge>
                        )}
                        <span className="text-[#64748B] text-xs">{msg.time}</span>
                      </div>
                      
                      <div 
                        className={cn(
                          'p-4 rounded-xl text-sm leading-relaxed border',
                          msg.isInternal 
                            ? 'bg-amber-500/10 border-amber-200/50 text-[#334155]' 
                            : msg.senderRole === 'المُبلّغ' 
                            ? 'bg-blue-500/10 border-blue-200/20 text-[#334155]' 
                            : 'bg-gray-50 border-gray-200 text-[#334155]'
                        )}
                      >
                        <p>{msg.content}</p>
                        
                        {msg.attachment && (
                          <div className="mt-3 flex gap-2">
                            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
                              <Paperclip className="size-3.5 text-gray-400" />
                              <span className="text-xs text-[#334155]">{msg.attachment}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Reply Editor */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-[#0F172A] font-semibold mb-4">إضافة رد</h4>
                
                <textarea
                  id="reply-textarea"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  className="resize-none w-full rounded-md border px-3 py-2 text-base transition-all outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 min-h-[120px] mb-4 bg-gray-50 border-gray-200 text-sm"
                  placeholder="اكتب ردك هنا..."
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.showToast('تم إرفاق الملف بنجاح', 'success')}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 hover:bg-gray-100 hover:shadow-sm border bg-background h-9 px-4 py-2 border-gray-200 text-[#64748B] cursor-pointer"
                    >
                      <Paperclip className="size-4 ml-2" />
                      <span>إرفاق ملف</span>
                    </button>
                    
                    <button
                      onClick={() => handleSendReply(true)}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 hover:bg-secondary hover:text-white hover:border-transparent hover:shadow-sm border bg-background h-9 px-4 py-2 border-gray-200 text-[#64748B] cursor-pointer"
                    >
                      <span>ملاحظة داخلية</span>
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleSendReply(false)}
                    disabled={!replyText.trim()}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md hover:shadow-primary/20 h-9 px-4 py-2 bg-[#0EA5E9] hover:bg-secondary hover:text-white text-white disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    <Send className="size-4 ml-2" />
                    <span>إرسال الرد</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Left Sidebar Column */}
          <div className="space-y-6">
            
            {/* Assigned Agent Card */}
            <div className="text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-white border border-gray-200 shadow-sm">
              <h3 className="text-[#0F172A] font-semibold mb-4">المسؤول المعين</h3>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {ticket.assignedTo !== '-' ? ticket.assignedTo.charAt(0) : '-'}
                </div>
                <div>
                  <p className="text-[#0F172A] font-semibold">
                    {ticket.assignedTo !== '-' ? ticket.assignedTo : 'غير معين'}
                  </p>
                  <p className="text-sm text-[#64748B]">فريق الدعم الفني</p>
                </div>
              </div>

              <button
                onClick={() => {
                  const assignees = ['أحمد الفني', 'خالد التقني', 'سارة المالية', '-']
                  const currentIndex = assignees.indexOf(ticket.assignedTo)
                  const nextAssignee = assignees[(currentIndex + 1) % assignees.length]
                  
                  setTicket(prev => {
                    if (!prev) return null
                    window.showToast(`تم تعيين المسؤول: ${nextAssignee === '-' ? 'غير معين' : nextAssignee}`, 'success')
                    return { ...prev, assignedTo: nextAssignee }
                  })
                }}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md hover:shadow-primary/20 h-9 px-4 py-2 w-full mt-4 bg-purple-500 hover:bg-purple-600 text-white cursor-pointer"
              >
                <Pen className="size-4 ml-2" />
                <span>تغيير المسؤول</span>
              </button>
            </div>

            {/* Clinic Info Card */}
            <div className="text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-white border border-gray-200 shadow-sm">
              <h3 className="text-[#0F172A] font-semibold mb-4">معلومات العيادة</h3>
              
              <div className="space-y-3 text-right">
                <div>
                  <p className="text-xs text-[#64748B] mb-1">اسم العيادة</p>
                  <p className="text-[#0F172A] font-semibold">{ticket.clinic}</p>
                </div>
                
                <div>
                  <p className="text-xs text-[#64748B] mb-1">الفئة</p>
                  <Badge variant="purple">
                    {clinicCategory}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-xs text-[#64748B] mb-1">المدينة</p>
                  <p className="text-[#334155]">{ticket.clinic.includes('إربد') ? 'إربد' : ticket.clinic.includes('الزرقاء') ? 'الزرقاء' : 'عمان'}</p>
                </div>
              </div>

              <button
                onClick={handleViewClinic}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md hover:shadow-primary/20 h-9 px-4 py-2 w-full mt-4 bg-white border border-gray-200 text-[#334155] hover:bg-gray-50 cursor-pointer"
              >
                عرض ملف العيادة
              </button>
            </div>

            {/* Reporter Info Card */}
            <div className="text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-white border border-gray-200 shadow-sm">
              <h3 className="text-[#0F172A] font-semibold mb-4">معلومات المُبلّغ</h3>
              
              <div className="space-y-3 text-right">
                <div className="flex items-center gap-2">
                  <User className="size-4 text-gray-400" />
                  <p className="text-[#334155] text-sm">{ticket.reporter}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-gray-400" />
                  <p className="text-[#334155] text-sm font-mono">{reporterContact.email}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-gray-400" />
                  <p className="text-[#334155] text-sm font-mono">{reporterContact.phone}</p>
                </div>
              </div>

              <button
                onClick={() => window.showToast(`فتح نافذة مراسلة المُبلّغ ${ticket.reporter}`, 'success')}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md hover:shadow-primary/20 h-9 px-4 py-2 w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
              >
                <Mail className="size-4 ml-2" />
                <span>مراسلة المُبلّغ</span>
              </button>
            </div>

            {/* Similar Tickets Card */}
            <div className="text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="text-indigo-600 size-5" />
                <h3 className="text-[#0F172A] font-semibold">تذاكر مشابهة</h3>
              </div>
              
              <div className="space-y-3">
                <div 
                  onClick={() => navigate('/admin/tickets/TKT-1198')}
                  className="p-3 bg-white rounded-lg border border-indigo-100 hover:shadow-md transition-all cursor-pointer text-right"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#0EA5E9] font-mono text-sm font-semibold">TKT-1198</span>
                    <Badge variant="blue" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-xs">
                      85% مطابقة
                    </Badge>
                  </div>
                  <p className="text-[#334155] text-sm mb-2 font-medium">مشكلة في تعديل الموعد</p>
                  <Badge variant="green" className="text-xs">تم الحل</Badge>
                </div>

                <div 
                  onClick={() => navigate('/admin/tickets/TKT-1156')}
                  className="p-3 bg-white rounded-lg border border-indigo-100 hover:shadow-md transition-all cursor-pointer text-right"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#0EA5E9] font-mono text-sm font-semibold">TKT-1156</span>
                    <Badge variant="blue" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-xs">
                      72% مطابقة
                    </Badge>
                  </div>
                  <p className="text-[#334155] text-sm mb-2 font-medium">خطأ عند حذف موعد قديم</p>
                  <Badge variant="green" className="text-xs">مغلقة</Badge>
                </div>

                <div 
                  onClick={() => navigate('/admin/tickets/TKT-1089')}
                  className="p-3 bg-white rounded-lg border border-indigo-100 hover:shadow-md transition-all cursor-pointer text-right"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#0EA5E9] font-mono text-sm font-semibold">TKT-1089</span>
                    <Badge variant="blue" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-xs">
                      68% مطابقة
                    </Badge>
                  </div>
                  <p className="text-[#334155] text-sm mb-2 font-medium">بطء في تحميل صفحة المواعيد</p>
                  <Badge variant="green" className="text-xs">تم الحل</Badge>
                </div>
              </div>
            </div>

            {/* Recent Clinic Activity Card */}
            <div className="text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-white border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <History className="text-gray-600 size-5" />
                <h3 className="text-[#0F172A] font-semibold">نشاط العيادة الأخير</h3>
              </div>
              
              <div className="space-y-3 text-right">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 bg-gray-300 shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-[#334155] text-sm">تسجيل دخول {ticket.reporter}</p>
                    <p className="text-[#64748B] text-xs mt-1">2024-05-18 10:25</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 bg-gray-300 shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-[#334155] text-sm">محاولة إجراء عملية حفظ في {ticket.category}</p>
                    <p className="text-[#64748B] text-xs mt-1">2024-05-18 10:28</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 bg-rose-500 shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-[#334155] text-sm">خطأ في النظام - فشل الحفظ</p>
                    <p className="text-[#64748B] text-xs mt-1">2024-05-18 10:29</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 bg-blue-500 shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-[#334155] text-sm">إنشاء تذكرة دعم {ticket.id}</p>
                    <p className="text-[#64748B] text-xs mt-1">{ticket.createdDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Info Card */}
            <div className="text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-gray-50 border border-gray-200 shadow-sm text-right">
              <h3 className="text-[#0F172A] font-semibold mb-4">معلومات الجلسة</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between flex-row-reverse">
                  <span className="text-[#64748B]">الجهاز:</span>
                  <span className="text-[#334155] font-mono">Windows 11, Chrome 123</span>
                </div>
                <div className="flex justify-between flex-row-reverse">
                  <span className="text-[#64748B]">الجلسة:</span>
                  <span className="text-[#334155] font-mono">IP: 192.168.1.100</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </AdminLayout>
  )
}

export default AdminTicketDetails
