import { Shield, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import Badge from '../../components/ui/badge'
import TableFooter from '../../components/ui/TableFooter'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table'
import Modal from '../../components/ui/Modal'
import { usePreloader } from '../../contexts/PreloaderContext'
import { cn } from '../../utils/cn'

interface Manager {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  createdDate: string
}

const INITIAL_MANAGERS: Manager[] = [
  {
    id: 1,
    firstName: 'أحمد',
    lastName: 'الفني',
    email: 'ahmed@medexa.jo',
    phone: '+962-79-111-1111',
    role: 'مدير عام',
    createdDate: '2024-01-10'
  },
  {
    id: 2,
    firstName: 'خالد',
    lastName: 'التقني',
    email: 'khaled@medexa.jo',
    phone: '+962-78-222-2222',
    role: 'مدير دعم',
    createdDate: '2024-02-15'
  },
  {
    id: 3,
    firstName: 'سارة',
    lastName: 'المالية',
    email: 'sara@medexa.jo',
    phone: '+962-77-333-3333',
    role: 'مدير مالي',
    createdDate: '2024-03-20'
  }
]

const getRoleVariant = (role: string): 'yellow' | 'blue' | 'purple' | 'green' | 'red' => {
  const trimmed = role.trim();
  if (trimmed.includes('عام')) return 'yellow';
  if (trimmed.includes('دعم') || trimmed.includes('تقني') || trimmed.includes('فني')) return 'blue';
  if (trimmed.includes('مالي')) return 'green';
  if (trimmed.includes('نظام') || trimmed.includes('إداري')) return 'purple';
  
  const hash = trimmed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variants: ('yellow' | 'blue' | 'purple' | 'green' | 'red')[] = ['yellow', 'blue', 'purple', 'green', 'red'];
  return variants[hash % variants.length];
}

const AdminManagers = () => {
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting

  // States
  const [managers, setManagers] = useState<Manager[]>(INITIAL_MANAGERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedManager, ] = useState<Manager | null>(null)

  // Form Fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('')

  // Permissions State
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    view_clinics: false,
    manage_clinics: false,
    view_users: false,
    manage_users: false,
    view_financials: false,
    manage_financials: false,
    view_tickets: false,
    manage_tickets: false,
    view_audit_logs: false,
    manage_configurations: false,
  })

  const togglePermission = (key: string) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Filtering
  const filteredManagers = managers.filter(manager => {
    const query = searchQuery.trim().toLowerCase()
    return (
      query === '' ||
      manager.firstName.toLowerCase().includes(query) ||
      manager.lastName.toLowerCase().includes(query) ||
      manager.email.toLowerCase().includes(query) ||
      manager.phone.toLowerCase().includes(query) ||
      manager.role.toLowerCase().includes(query)
    )
  })

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredManagers.length / itemsPerPage))
    if (currentPage > maxPage) {
      setCurrentPage(maxPage)
    }
  }, [filteredManagers.length, itemsPerPage, currentPage])

  const visibleManagers = filteredManagers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Handle Add Manager
  const handleOpenAddModal = () => {
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setRole('')
    setPermissions({
      view_clinics: false,
      manage_clinics: false,
      view_users: false,
      manage_users: false,
      view_financials: false,
      manage_financials: false,
      view_tickets: false,
      manage_tickets: false,
      view_audit_logs: false,
      manage_configurations: false,
    })
    setIsAddModalOpen(true)
  }

  const handleConfirmAdd = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !role.trim()) {
      window.showToast('يرجى تعبئة كافة الحقول المطلوبة', 'error')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      window.showToast('يرجى إدخال بريد إلكتروني صحيح', 'error')
      return
    }

    const newManager: Manager = {
      id: Date.now(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role: role.trim(),
      createdDate: new Date().toISOString().split('T')[0]
    }

    setManagers(prev => [newManager, ...prev])
    setIsAddModalOpen(false)
    window.showToast('تم إضافة المدير الجديد بنجاح', 'success')
  }

  // Handle Delete Manager
  // const handleOpenDeleteModal = (manager: Manager) => {
  //   setSelectedManager(manager)
  //   setIsDeleteModalOpen(true)
  // }

  const handleConfirmDelete = () => {
    if (!selectedManager) return
    setManagers(prev => prev.filter(m => m.id !== selectedManager.id))
    setIsDeleteModalOpen(false)
    window.showToast(`تم حذف المدير "${selectedManager.firstName} ${selectedManager.lastName}" بنجاح`, 'success')
  }

  return (
    <AdminLayout>
      <main
        className={cn(
          "flex-1 opacity-0 transition-all duration-300",
          canAnimate && "animate-fadeUp opacity-100 animate-delay-[100ms]",
          isExiting && "animate-fadeDownOut"
        )}
        style={{ opacity: canAnimate ? 1 : 0 }}
      >
        <div className="space-y-6" dir="rtl">
          {/* Header Row */}
          <div className="flex items-center justify-between flex-wrap gap-4 text-right">
            <div>
              <h1 className="text-3xl text-[#1A2B3C] mb-2 font-bold">إدارة المدراء</h1>
              <p className="text-gray-500 text-sm font-medium">إضافة وإدارة مدراء النظام والصلاحيات</p>
            </div>
            
            <button
              onClick={handleOpenAddModal}
              data-slot="button"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md hover:bg-accent dark:hover:bg-accent/50 h-9 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:from-blue-600 hover:to-cyan-600 cursor-pointer"
            >
              <span>إضافة مدير جديد</span>
            </button>
          </div>

          {/* Table Container Card */}
          <div
            data-slot="card"
            className="text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-white border border-gray-200 shadow-sm overflow-hidden"
          >
            {/* Search Input Row */}
            <div className="flex items-center gap-4 mb-2">
              <div className="relative flex-1">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 size-4.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pr-11 pl-4 rounded-xl border border-gray-200 bg-gray-50 text-base transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-[#1A2B3C] font-medium"
                  placeholder="بحث بالاسم، البريد الإلكتروني..."
                />
              </div>
            </div>

            {/* Managers Table */}
            <div className="overflow-x-auto">
              <Table className="w-full text-right min-w-[900px]">
                <TableHeader className="border-b border-gray-200">
                  <TableRow className="border-b border-gray-200 hover:bg-gray-50/50">
                    <TableHead className="h-11 px-4 text-right align-middle text-[#334155] font-semibold">الاسم الأول</TableHead>
                    <TableHead className="h-11 px-4 text-right align-middle text-[#334155] font-semibold">اسم العائلة</TableHead>
                    <TableHead className="h-11 px-4 text-right align-middle text-[#334155] font-semibold">البريد الإلكتروني</TableHead>
                    <TableHead className="h-11 px-4 text-right align-middle text-[#334155] font-semibold">رقم الهاتف</TableHead>
                    <TableHead className="h-11 px-4 text-right align-middle text-[#334155] font-semibold">الدور</TableHead>
                    <TableHead className="h-11 px-4 text-right align-middle text-[#334155] font-semibold">تاريخ الإضافة</TableHead>
                    {/* <TableHead className="h-11 px-4 text-center align-middle text-[#334155] font-semibold">الإجراءات</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody className="[&_tr:last-child]:border-0">
                  {visibleManagers.length > 0 ? (
                    visibleManagers.map((manager) => (
                      <TableRow
                        key={manager.id}
                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                      >
                        <TableCell className="p-4 align-middle text-[#1A2B3C] font-semibold">
                          {manager.firstName}
                        </TableCell>
                        <TableCell className="p-4 align-middle text-[#1A2B3C] font-semibold">
                          {manager.lastName}
                        </TableCell>
                        <TableCell className="p-4 align-middle text-gray-600">
                          {manager.email}
                        </TableCell>
                        <TableCell className="p-4 align-middle text-gray-600 font-mono text-sm">
                          {manager.phone}
                        </TableCell>
                        <TableCell className="p-4 align-middle">
                          <Badge variant={getRoleVariant(manager.role)}>
                            <Shield className="size-3 ml-1" />
                            <span>{manager.role}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="p-4 align-middle text-gray-600">
                          {manager.createdDate}
                        </TableCell>
                        {/* <TableCell className="p-4 align-middle text-center">
                          <button
                            onClick={() => handleOpenDeleteModal(manager)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="حذف المدير"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </TableCell> */}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="p-8 text-center text-gray-400 font-medium">
                        لا يوجد مدراء يطابقون خيارات البحث.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Table Footer */}
            <TableFooter
              totalItems={filteredManagers.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </main>

      {/* Add New Manager Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleConfirmAdd}
        title=""
        confirmText=""
        cancelText=""
        hideFooter={true}
        hideHeaderIcon={true}
        showCloseButton={false}
        maxWidth="max-w-xl"
        contentClassName="rounded-lg! border-gray-200! p-0!"
        footer={
          <div className="px-6 py-4 border-t border-gray-100 bg-white flex gap-3 rounded-b-3xl">
            <button 
              onClick={handleConfirmAdd}
              data-slot="button" 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md h-10 px-4 py-2 flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" x2="19" y1="8" y2="14" />
                <line x1="22" x2="16" y1="11" y2="11" />
              </svg>
              إضافة المدير
            </button>
            <button 
              onClick={() => setIsAddModalOpen(false)}
              data-slot="button" 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md h-10 px-4 py-2 flex-1 border border-gray-200 text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        }
      >
        {/* Sticky Header */}
        <div className=" sticky top-0 bg-white pb-4 border-b border-gray-100 flex items-start justify-between">
          <div data-slot="dialog-header" className="flex flex-col gap-1">
            <h2 data-slot="dialog-title" className="font-semibold text-2xl text-[#1A2B3C]">إضافة مدير جديد</h2>
            <p data-slot="dialog-description" className="text-sm text-gray-500">إدخل معلومات المدير وتحديد الصلاحيات</p>
          </div>
          <button 
            type="button" 
            onClick={() => setIsAddModalOpen(false)}
            className="ring-offset-background focus:ring-ring opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none cursor-pointer mt-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
            <span className="sr-only">Close</span>
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="px-6 py-5 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">الاسم الأول</label>
              <input 
                data-slot="input" 
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-gray-50 border-gray-200" 
                placeholder="أدخل الاسم الأول" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">اسم العائلة</label>
              <input 
                data-slot="input" 
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-gray-50 border-gray-200" 
                placeholder="أدخل اسم العائلة" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
                البريد الإلكتروني
              </label>
              <input 
                type="email" 
                data-slot="input" 
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-gray-50 border-gray-200" 
                placeholder="admin@medexa.jo" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                رقم الهاتف
              </label>
              <input 
                data-slot="input" 
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-gray-50 border-gray-200 font-mono" 
                placeholder="+962-79-xxx-xxxx" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-700 mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                </svg>
                الدور الوظيفي
              </label>
              <input 
                data-slot="input" 
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-gray-50 border-gray-200" 
                placeholder="مدير عام، مدير دعم، مدير مالي..." 
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
          </div>
          
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h3 className="text-base text-[#1E293B] mb-4 font-semibold">الصلاحيات</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: 'view_clinics', label: 'عرض العيادات' },
                { id: 'manage_clinics', label: 'إدارة العيادات' },
                { id: 'view_users', label: 'عرض المستخدمين' },
                { id: 'manage_users', label: 'إدارة المستخدمين' },
                { id: 'view_financials', label: 'عرض التقارير المالية' },
                { id: 'manage_financials', label: 'إدارة التقارير المالية' },
                { id: 'view_tickets', label: 'عرض التذاكر' },
                { id: 'manage_tickets', label: 'إدارة التذاكر' },
                { id: 'view_audit_logs', label: 'عرض سجلات التدقيق' },
                { id: 'manage_configurations', label: 'إدارة الإعدادات' },
              ].map((perm) => (
                <div key={perm.id} className="flex items-center gap-3">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={permissions[perm.id] ? "true" : "false"}
                    data-state={permissions[perm.id] ? "checked" : "unchecked"}
                    value="on"
                    data-slot="checkbox"
                    onClick={() => togglePermission(perm.id)}
                    className="peer bg-input-background dark:bg-input/30 data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 cursor-pointer flex items-center justify-center"
                    id={perm.id}
                  >
                    {permissions[perm.id] && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </button>
                  <label 
                    htmlFor={perm.id}
                    onClick={() => togglePermission(perm.id)}
                    className="text-sm text-gray-700 cursor-pointer select-none"
                  >
                    {perm.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="تأكيد حذف المدير"
        message={
          selectedManager
            ? `هل أنت متأكد من رغبتك في إزالة المدير "${selectedManager.firstName} ${selectedManager.lastName}" من النظام؟`
            : ""
        }
        confirmText="حذف"
        cancelText="إلغاء"
        variant="danger"
        showCloseButton={true}
      />
    </AdminLayout>
  )
}

export default AdminManagers
