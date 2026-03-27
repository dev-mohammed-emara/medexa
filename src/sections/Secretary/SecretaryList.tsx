import { useState } from 'react'
import {
  Plus,
  Phone,
  Mail,
  Eye,
  SquarePen,
  Trash2
} from 'lucide-react'
import { HiOutlineXMark } from "react-icons/hi2"
import { usePreloader } from '../../contexts/PreloaderContext'
import { cn } from '../../utils/cn'
import SecretaryDialog from './SecretaryDialog';
import Modal from '../../components/ui/Modal';
import { initialSecretaries } from '../../constants/Secretary_dummy'
import { Button } from '../../components/ui/Button'

interface Secretary {
  id: number;
  name: string;
  role: string;
  status: string;
  phone: string;
  email: string;
  initial: string;
  description?: string;
  gender?: string;
  dob?: string;
  permissions?: string[];
}

const SecretaryList = () => {
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting

  // State management
  const [secretaryList, setSecretaryList] = useState<Secretary[]>(initialSecretaries);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [currentSecretary, setCurrentSecretary] = useState<Secretary | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [secretaryToDelete, setSecretaryToDelete] = useState<Secretary | null>(null);

  const handleOpenDialog = (mode: 'add' | 'edit' | 'view', secretary?: Secretary) => {
    setDialogMode(mode);
    setCurrentSecretary(secretary || null);
    setIsDialogOpen(true);
  };

  const handleConfirmAction = (data: Partial<Secretary>) => {
    if (dialogMode === 'add') {
      const newSecretary: Secretary = {
        id: Date.now(),
        name: data.name || '',
        role: data.role || 'استقبال',
        status: 'نشط',
        phone: data.phone || '',
        email: data.email || '',
        initial: (data.name as string)?.[0] || 'س'
      };
      setSecretaryList(prev => [...prev, newSecretary]);
      window.showToast?.('تم إضافة السكرتير/ة بنجاح');
    } else if (dialogMode === 'edit' && currentSecretary) {
      setSecretaryList(prev => prev.map(s => s.id === currentSecretary.id ? { ...s, ...data } : s));
      window.showToast?.('تم تحديث البيانات بنجاح');
    }
  };

  const handleDeleteClick = (secretary: Secretary) => {
    setSecretaryToDelete(secretary);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (secretaryToDelete) {
      setSecretaryList(prev => prev.filter(s => s.id !== secretaryToDelete.id));
    }
    setIsDeleteModalOpen(false);
    window.showToast?.('تم حذف الحساب بنجاح');
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <section className={cn(
        "flex items-center justify-between opacity-0",
        canAnimate && "animate-fadeDown animate-delay-100"
      )}>
        <div>
          <h1 className="text-3xl mb-1" style={{ fontWeight: 700 }}>إدارة السكرتارية</h1>
          <p className="text-muted-foreground">إدارة حسابات السكرتارية وصلاحياتهم</p>
        </div>
        <Button
          onClick={() => handleOpenDialog('add')}
          variant="secondary"
          className="h-10 px-6 rounded-xl"
        >
          <Plus className="size-4 ml-2" />
          إضافة سكرتير/ة
        </Button>
      </section>

      {/* Cards Grid / Empty State */}
      <div className={cn(
        "grid gap-4 pb-20",
        secretaryList.length > 0 ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
      )}>
        {secretaryList.length > 0 ? (
          secretaryList.map((secretary, index) => (
            <div
              key={secretary.id}
              style={{
                opacity: canAnimate ? 1 : 0,
                transform: canAnimate ? 'none' : 'translateY(20px)',
                transition: 'all 0.5s ease-out',
                transitionDelay: `${100 + (index * 50)}ms`
              }}
            >
              <article
                data-slot="card"
                className={cn(
                  "text-card-foreground flex flex-col gap-6 rounded-xl border p-6 bg-white border-border shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group h-full",
                  isExiting && "animate-fadeDownOut"
                )}
              >
                <div className="relative z-10 flex flex-col h-full">
                  {/* Profile Header */}
                  <figure className="flex items-start gap-4 mb-4">
                    <div
                      data-slot="avatar"
                      className="relative flex shrink-0 overflow-hidden rounded-full w-16 h-16 border-2 border-secondary/20 shadow-md transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115 group-hover:rotate-12 group-hover:shadow-secondary/20"
                    >
                      <span
                        data-slot="avatar-fallback"
                        className="flex size-full items-center justify-center rounded-full bg-secondary text-white text-xl font-bold"
                      >
                        {secretary.initial}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg mb-1" style={{ fontWeight: 600 }}>{secretary.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{secretary.role}</p>
                      <span
                        data-slot="badge"
                        className={cn(
                          "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 transition-[color,box-shadow] overflow-hidden border-transparent text-primary-foreground bg-secondary opacity-0",
                          canAnimate && "animate-snappyToRight animate-delay-400"
                        )}
                      >
                        {secretary.status}
                      </span>
                    </div>
                  </figure>

                  {/* Contact Info */}
                  <section className="space-y-2 mt-2 mb-6  flex-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="size-4 shrink-0" />
                      <span dir="ltr">{secretary.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="size-4 shrink-0" />
                      <span className="truncate">{secretary.email}</span>
                    </div>
                  </section>

                  {/* Action Buttons */}
                  <footer className="flex gap-2 mt-auto items-stretch">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog('view', secretary)}
                      className="flex-1 rounded-lg gap-1.5 h-auto"
                    >
                      <Eye className="size-4 ml-1" />
                      عرض
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog('edit', secretary)}
                      className="flex-1 rounded-lg gap-1.5 h-auto"
                    >
                      <SquarePen className="size-4 ml-1" />
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteClick(secretary)}
                      className="size-8 rounded-lg px-2 text-destructive hover:bg-destructive/10 hover:border-destructive/30 "
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </footer>
                </div>
              </article>
            </div>
          ))
        ) : (
          <div
            className={cn(
              "flex flex-col items-center justify-center py-24 px-6 text-center bg-gray-50/40 rounded-4xl border-2 border-dashed border-border/60 animate-fadeUp self-center w-full",
              canAnimate ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="size-28 rounded-full bg-secondary/10 flex items-center justify-center mb-8 animate-hovering border border-secondary/20 shadow-inner backdrop-blur-sm">
              <HiOutlineXMark className="size-14 text-secondary" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-3">لا يوجد سكرتارية مضافون</h3>
            <p className="text-muted-foreground max-w-lg mb-10 text-lg">
              تنظيم العمل يبدأ هنا. قم بإضافة طاقم السكرتارية لإدارة المواعيد والعملاء بكفاءة عالية.
            </p>
            <button
              onClick={() => handleOpenDialog('add')}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-lg font-bold transition-all duration-300 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-1 active:translate-y-0 active:shadow-md text-white bg-secondary hover:bg-secondary/90 h-14 px-10 shadow-lg"
            >
              <Plus className="size-6 ml-2" />
              إضافة سكرتير/ة جديد
            </button>
          </div>
        )}
      </div>

      {/* Popups */}
      <SecretaryDialog
        key={`${dialogMode}-${currentSecretary?.id || 'new'}`}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        mode={dialogMode}
        initialData={currentSecretary}
        onConfirm={handleConfirmAction}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف حساب ${secretaryToDelete?.name || ''}؟`}
        confirmText="حذف"
        cancelText="إلغاء"
        variant="danger"
      />
    </div>
  )
}

export default SecretaryList
