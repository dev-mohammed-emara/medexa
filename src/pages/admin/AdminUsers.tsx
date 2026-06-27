import { Ban, Key, LogOut, UserCog } from 'lucide-react'
import { useEffect, useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import TableFooter from '../../components/ui/TableFooter'
import Badge from '../../components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui/select'

import { usePreloader } from '../../contexts/PreloaderContext'
import { cn } from '../../utils/cn'

interface User {
  id: number
  name: string
  clinic: string
  role: string
  status: 'نشط' | 'معطل'
}

const INITIAL_USERS: User[] = [
  { id: 1, name: 'د. أحمد السعيد', clinic: 'عيادة النور الطبية', role: 'مالك', status: 'نشط' },
  { id: 2, name: 'د. محمد أحمد', clinic: 'عيادة النور الطبية', role: 'طبيب', status: 'نشط' },
  { id: 3, name: 'فاطمة محمد', clinic: 'عيادة النور الطبية', role: 'سكرتير', status: 'نشط' },
  { id: 4, name: 'د. سارة علي', clinic: 'عيادة الشفاء', role: 'طبيب', status: 'معطل' }
]

const getUserRoleVariant = (role: string): 'purple' | 'blue' | 'green' | 'yellow' | 'red' => {
  if (role === 'مالك') return 'purple'
  if (role === 'طبيب') return 'blue'
  if (role === 'سكرتير') return 'green'
  return 'blue'
}

const AdminUsers = () => {
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting

  // States
  const [users, setUsers] = useState<User[]>(INITIAL_USERS)
  const searchQuery = ''
  const [selectedClinic, setSelectedClinic] = useState('all')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Selected user for modal actions
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Modal visibility states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isBanModalOpen, setIsBanModalOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const [editName, setEditName] = useState('')
  const [editClinic, setEditClinic] = useState('')
  const [editRole, setEditRole] = useState('')

  const [newPassword, setNewPassword] = useState('')

  // Filtered Users List
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesClinic = selectedClinic === 'all' || user.clinic === selectedClinic
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
    return matchesSearch && matchesClinic && matchesRole && matchesStatus
  })

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage))
    if (currentPage > maxPage) {
      setCurrentPage(maxPage)
    }
  }, [filteredUsers.length, itemsPerPage, currentPage])

  const visibleUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Action Handlers

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user)
    setEditName(user.name)
    setEditClinic(user.clinic)
    setEditRole(user.role)
    setIsEditModalOpen(true)
  }

  const handleConfirmEdit = () => {
    if (!selectedUser || !editName.trim()) return

    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? { ...u, name: editName.trim(), clinic: editClinic, role: editRole }
          : u
      )
    )
    setIsEditModalOpen(false)
    window.showToast('تم تعديل بيانات المستخدم بنجاح', 'success')
  }

  const handleOpenPassword = (user: User) => {
    setSelectedUser(user)
    setNewPassword('')
    setIsPasswordModalOpen(true)
  }

  const handleConfirmPassword = () => {
    if (!selectedUser || !newPassword.trim()) return

    // Success simulation
    setIsPasswordModalOpen(false)
    window.showToast(`تم تعيين كلمة مرور جديدة للمستخدم "${selectedUser.name}" بنجاح`, 'success')
  }

  const handleOpenBan = (user: User) => {
    setSelectedUser(user)
    setIsBanModalOpen(true)
  }

  const handleConfirmBan = () => {
    if (!selectedUser) return

    const nextStatus = selectedUser.status === 'نشط' ? 'معطل' : 'نشط'
    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? { ...u, status: nextStatus } : u))
    )
    setIsBanModalOpen(false)
    window.showToast(
      nextStatus === 'نشط'
        ? `تم تنشيط حساب المستخدم "${selectedUser.name}" بنجاح`
        : `تم تعطيل حساب المستخدم "${selectedUser.name}" بنجاح`,
      'success'
    )
  }

  const handleOpenLogout = (user: User) => {
    setSelectedUser(user)
    setIsLogoutModalOpen(true)
  }

  const handleConfirmLogout = () => {
    if (!selectedUser) return

    setIsLogoutModalOpen(false)
    window.showToast(`تم تسجيل خروج المستخدم "${selectedUser.name}" بنجاح وإنهاء كافة جلساته`, 'success')
  }

  return (
    <AdminLayout>
      <div
        className={cn(
          "space-y-6 opacity-0",
          canAnimate && "animate-fadeUp opacity-100 animate-delay-[100ms]",
          isExiting && "animate-fadeDownOut"
        )}
        dir="rtl"
        style={{ opacity: canAnimate ? 1 : 0 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-right">
          <div>
            <h1 className="text-3xl text-[#1A2B3C] mb-2 font-bold">إدارة المستخدمين</h1>
            <p className="text-gray-500 text-sm">إدارة جميع مستخدمي وصلاحيات النظام</p>
          </div>
        </div>

        {/* Filter Card */}
        <div
          data-slot="card"
          className="text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-white border border-gray-200 shadow-sm"
        >
          {/* Filters & Search Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">


            {/* Clinic Filter */}
            <div>
              <label className="text-xs text-gray-600 mb-2 block font-medium">تصفية حسب العيادة</label>
              <Select name="selectedClinic" value={selectedClinic} onValueChange={setSelectedClinic}>
                <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#0B5A8E]/20 text-[#1A2B3C] rounded-xl font-medium">
                  <SelectValue placeholder="جميع العيادات" />
                </SelectTrigger>
                <SelectContent smallZ>
                  <SelectItem value="all">جميع العيادات</SelectItem>
                  <SelectItem value="عيادة النور الطبية">عيادة النور الطبية</SelectItem>
                  <SelectItem value="عيادة الشفاء">عيادة الشفاء</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role Filter */}
            <div>
              <label className="text-xs text-gray-600 mb-2 block font-medium">تصفية حسب الدور</label>
              <Select name="selectedRole" value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#0B5A8E]/20 text-[#1A2B3C] rounded-xl font-medium">
                  <SelectValue placeholder="جميع الأدوار" />
                </SelectTrigger>
                <SelectContent smallZ>
                  <SelectItem value="all">جميع الأدوار</SelectItem>
                  <SelectItem value="مالك">مالك</SelectItem>
                  <SelectItem value="طبيب">طبيب</SelectItem>
                  <SelectItem value="سكرتير">سكرتير</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-xs text-gray-600 mb-2 block font-medium">تصفية حسب الحالة</label>
              <Select name="selectedStatus" value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#0B5A8E]/20 text-[#1A2B3C] rounded-xl font-medium">
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent smallZ>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="نشط">نشط</SelectItem>
                  <SelectItem value="معطل">معطل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto mt-2  overflow-hidden">
            <Table className="min-w-[900px] text-right">
              <TableHeader className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200">
                <TableRow>
                  <TableHead className="h-12 px-4 align-middle whitespace-nowrap text-right text-gray-600 font-bold">الاسم</TableHead>
                  <TableHead className="h-12 px-4 align-middle whitespace-nowrap text-right text-gray-600 font-bold">العيادة</TableHead>
                  <TableHead className="h-12 px-4 align-middle whitespace-nowrap text-right text-gray-600 font-bold">الدور</TableHead>
                  <TableHead className="h-12 px-4 align-middle whitespace-nowrap text-right text-gray-600 font-bold">الحالة</TableHead>
                  <TableHead className="h-12 px-4 align-middle whitespace-nowrap text-right text-gray-600 font-bold">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  visibleUsers.map((user) => (
                    <TableRow
                      key={user.id}
                    >
                      <TableCell className="p-4 align-middle whitespace-nowrap text-[#1A2B3C] font-semibold">
                        {user.name}
                      </TableCell>
                      <TableCell className="p-4 align-middle whitespace-nowrap text-gray-600">
                        {user.clinic}
                      </TableCell>
                      <TableCell className="p-4 align-middle whitespace-nowrap">
                      <Badge variant={getUserRoleVariant(user.role)}>{user.role}</Badge>
                      </TableCell>
                      <TableCell className="p-4 align-middle whitespace-nowrap">
                        <Badge variant={user.status === 'نشط' ? 'green' : 'red'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-4 align-middle whitespace-nowrap">
                        <div className="flex gap-2">
                          {/* Ban */}
                          <button
                            onClick={() => handleOpenBan(user)}
                            title={user.status === 'نشط' ? 'تعطيل الحساب' : 'تنشيط الحساب'}
                            className={cn(
                              "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm h-8 rounded-md px-2.5 cursor-pointer",
                              user.status === 'نشط'
                                ? "text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                            )}
                          >
                            <Ban className="size-4" />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => handleOpenPassword(user)}
                            title="تغيير كلمة المرور"
                            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm h-8 rounded-md px-2.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 cursor-pointer"
                          >
                            <Key className="size-4" />
                          </button>

                          {/* Force Logout */}
                          <button
                            onClick={() => handleOpenLogout(user)}
                            title="تسجيل خروج إجباري"
                            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm h-8 rounded-md px-2.5 text-purple-500 hover:text-purple-600 hover:bg-purple-50 cursor-pointer"
                          >
                            <LogOut className="size-4" />
                          </button>

                          {/* Manage Details */}
                          <button
                            onClick={() => handleOpenEdit(user)}
                            title="تعديل صلاحيات المستخدم"
                            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm h-8 rounded-md px-2.5 text-cyan-500 hover:text-cyan-600 hover:bg-cyan-50 cursor-pointer"
                          >
                            <UserCog className="size-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="p-8 text-center text-gray-400 font-bold">
                      لا يوجد مستخدمين يطابقون خيارات التصفية المحددة.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

            <TableFooter
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(value) => {
                const nextPerPage = value === 'all' ? Math.max(1, filteredUsers.length) : Number(value)
                setItemsPerPage(nextPerPage)
                setCurrentPage(1)
              }}
            />
          </div>
        </div>

      {/* MODALS SECTION */}

      {/* 2. Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={handleConfirmEdit}
        title="تعديل بيانات المستخدم"
        confirmText="حفظ التغييرات"
        cancelText="إلغاء"
        variant="primary"
        isConfirmDisabled={!editName.trim()}
      >
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600 block">الاسم كامل</label>
            <Input name="editName" type="text"
              placeholder="اسم المستخدم"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full text-right"
              dir="rtl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600 block">العيادة</label>
            <Select name="editClinic" value={editClinic} onValueChange={setEditClinic}>
              <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#0B5A8E]/20 text-[#1A2B3C] rounded-xl font-medium">
                <SelectValue placeholder="اختر العيادة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="عيادة النور الطبية">عيادة النور الطبية</SelectItem>
                <SelectItem value="عيادة الشفاء">عيادة الشفاء</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600 block">الدور الوظيفي</label>
            <Select name="editRole" value={editRole} onValueChange={setEditRole}>
              <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#0B5A8E]/20 text-[#1A2B3C] rounded-xl font-medium">
                <SelectValue placeholder="اختر الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="مالك">مالك</SelectItem>
                <SelectItem value="طبيب">طبيب</SelectItem>
                <SelectItem value="سكرتير">سكرتير</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Modal>

      {/* 3. Password Reset Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onConfirm={handleConfirmPassword}
        title="تغيير كلمة المرور"
        confirmText="تحديث كلمة المرور"
        cancelText="إلغاء"
        variant="primary"
        isConfirmDisabled={!newPassword.trim()}
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-gray-500 mb-2">إعادة تعيين كلمة مرور المستخدم "{selectedUser?.name}"</p>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600 block">كلمة المرور الجديدة</label>
            <Input name="newPassword" type="password"
              placeholder="أدخل كلمة المرور الجديدة للمستخدم"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full text-right"
              dir="rtl"
            />
          </div>
        </div>
      </Modal>

      {/* 4. Ban Confirmation Modal */}
      <Modal
        isOpen={isBanModalOpen}
        onClose={() => setIsBanModalOpen(false)}
        onConfirm={handleConfirmBan}
        title={selectedUser?.status === 'نشط' ? 'تعطيل الحساب' : 'تنشيط الحساب'}
        message={`هل أنت متأكد من رغبتك في ${selectedUser?.status === 'نشط' ? 'تعطيل' : 'تنشيط'} حساب المستخدم "${selectedUser?.name}"؟`}
        confirmText={selectedUser?.status === 'نشط' ? 'تعطيل الحساب' : 'تنشيط الحساب'}
        cancelText="إلغاء"
        variant={selectedUser?.status === 'نشط' ? 'danger' : 'primary'}
      />

      {/* 5. Forced Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="تسجيل خروج إجباري"
        message={`هل أنت متأكد من رغبتك في تسجيل خروج المستخدم "${selectedUser?.name}" إجبارياً من النظام؟ سيتم إنهاء كافة الجلسات الحالية فوراً.`}
        confirmText="إنهاء الجلسات"
        cancelText="إلغاء"
        variant="danger"
      />
    </AdminLayout>
  )
}

export default AdminUsers
