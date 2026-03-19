import { useState } from 'react'
import {
  Plus,
  Phone,
  Mail,
  Users,
  DollarSign,
  Eye,
  SquarePen,
  Trash2
} from 'lucide-react'
import { HiOutlineXMark } from "react-icons/hi2"
import { usePreloader } from '../../contexts/PreloaderContext'
import { cn } from '../../utils/cn'
import DoctorDialog from './DoctorDialog'
import Modal from '../../components/ui/Modal'
import { initialDoctors } from '../../constants/Doctors_dummy'

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  status: string;
  phone: string;
  email: string;
  patients: number;
  revenue: string;
  initial: string;
  description?: string;
  gender?: string;
  dob?: string;
  permissions?: string[];
}

const DoctorsList = () => {
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting

  // State management
  const [doctorsList, setDoctorsList] = useState<Doctor[]>(initialDoctors);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);

  const handleOpenDialog = (mode: 'add' | 'edit' | 'view', doctor?: Doctor) => {
    setDialogMode(mode);
    setCurrentDoctor(doctor || null);
    setIsDialogOpen(true);
  };

  const handleConfirmAction = (data: Partial<Doctor>) => {
    if (dialogMode === 'add') {
      const newDoctor: Doctor = {
        id: Date.now(),
        name: data.name || '',
        specialty: data.specialty || '',
        status: 'نشط',
        phone: data.phone || '',
        email: data.email || '',
        patients: Number(data.patients) || 0,
        revenue: data.revenue || '0',
        initial: (data.name as string)?.split(' ')[1]?.[0] || (data.name as string)?.[0] || 'د'
      };
      setDoctorsList(prev => [...prev, newDoctor]);
      window.showToast?.('تم إضافة الطبيب بنجاح');
    } else if (dialogMode === 'edit' && currentDoctor) {
      setDoctorsList(prev => prev.map(doc => doc.id === currentDoctor.id ? { ...doc, ...data } : doc));
      window.showToast?.('تم تحديث بيانات الطبيب بنجاح');
    }
  };

  const handleDeleteClick = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (doctorToDelete) {
      setDoctorsList(prev => prev.filter(doc => doc.id !== doctorToDelete.id));
    }
    setIsDeleteModalOpen(false);
    window.showToast?.('تم حذف الطبيب بنجاح');
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <section className={cn(
        "flex items-center justify-between opacity-0",
        canAnimate && "animate-fadeDown animate-delay-200"
      )}>
        <div>
          <h1 className="text-3xl mb-1" style={{ fontWeight: 700 }}>إدارة الأطباء</h1>
          <p className="text-muted-foreground">إدارة حسابات الأطباء وصلاحياتهم</p>
        </div>
        <button
          onClick={() => handleOpenDialog('add')}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md text-primary-foreground hover:shadow-primary/20 bg-primary hover:bg-primary/90 h-9 px-4 py-2 shadow-sm"
        >
          <Plus className="size-4 ml-2" />
          إضافة طبيب
        </button>
      </section>

      {/* Cards Grid / Empty State */}
      <div className={cn(
        "grid gap-4 pb-20",
        doctorsList.length > 0 ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
      )}>
        {doctorsList.length > 0 ? (
          doctorsList.map((doctor, index) => (
            <div
              key={doctor.id}
              style={{
                opacity: canAnimate ? 1 : 0,
                transform: canAnimate ? 'none' : 'translateY(20px)',
                transition: 'all 0.5s ease-out',
                transitionDelay: `${300 + (index * 100)}ms`
              }}
            >
              <article
                data-slot="card"
                className={cn(
                  "text-card-foreground flex flex-col gap-6 rounded-xl border p-6 bg-white border-border shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group h-full",
                  isExiting && "animate-fadeDownOut"
                )}
              >
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10 flex flex-col h-full">
                  {/* Profile Header */}
                  <figure className="flex items-start gap-4 mb-4">
                    <div 
                      data-slot="avatar" 
                      className="relative flex shrink-0 overflow-hidden rounded-full w-16 h-16 border-2 border-primary/20 shadow-md transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-115 group-hover:rotate-12 group-hover:shadow-primary/20"
                    >
                      <span 
                        data-slot="avatar-fallback" 
                        className="flex size-full items-center justify-center rounded-full bg-primary text-white text-xl font-bold"
                      >
                        {doctor.initial}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg mb-1 line-clamp-1" style={{ fontWeight: 600 }}>{doctor.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{doctor.specialty}</p>
                      <span
                        data-slot="badge"
                        className={cn(
                          "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 transition-[color,box-shadow] overflow-hidden border-transparent text-primary-foreground bg-secondary opacity-0",
                          canAnimate && "animate-snappyToRight animate-delay-700"
                        )}
                      >
                        {doctor.status}
                      </span>
                    </div>
                  </figure>

                  {/* Contact Info */}
                  <section className="space-y-2 mb-4 flex-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="size-4 shrink-0" />
                      <span dir="ltr" className="truncate">{doctor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="size-4 shrink-0" />
                      <span className="truncate">{doctor.email}</span>
                    </div>
                  </section>

                  {/* Stats Box */}
                  <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="size-4 text-primary" />
                        <p className="text-xs text-muted-foreground">المرضى</p>
                      </div>
                      <p className="text-lg font-bold">{doctor.patients}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <DollarSign className="size-4 text-secondary" />
                        <p className="text-xs text-muted-foreground">الإيرادات</p>
                      </div>
                      <p className="text-sm font-bold">{doctor.revenue} د.أ</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <footer className="flex gap-2 mt-auto">
                    <button
                      onClick={() => handleOpenDialog('view', doctor)}
                      className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 border bg-background text-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/30 h-8 rounded-md gap-1.5 px-3 flex-1 shadow-xs"
                    >
                      <Eye className="size-4 ml-1" />
                      عرض
                    </button>
                    <button
                      onClick={() => handleOpenDialog('edit', doctor)}
                      className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 border bg-background text-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/30 h-8 rounded-md gap-1.5 px-3 flex-1 shadow-xs"
                    >
                      <SquarePen className="size-4 ml-1" />
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDeleteClick(doctor)}
                      className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 border bg-background hover:bg-destructive/10 h-8 rounded-md px-3 text-destructive shadow-xs"
                    >
                      <Trash2 className="size-4" />
                    </button>
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
            <div className="size-28 rounded-full bg-primary/10 flex items-center justify-center mb-8 animate-hovering border border-primary/20 shadow-inner backdrop-blur-sm">
              <HiOutlineXMark className="size-14 text-primary" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-3">لا يوجد أطباء مضافون</h3>
            <p className="text-muted-foreground max-w-lg mb-10 text-lg">
              ابدأ ببناء فريقك الطبي المتميز. قم بإضافة الأطباء الآن لتتمكن من إدارة جداولهم ومرضاهم بكل سلاسة وإحترافية.
            </p>
            <button 
              onClick={() => handleOpenDialog('add')}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-lg font-bold transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 active:translate-y-0 active:shadow-md text-primary-foreground bg-primary hover:bg-primary/90 h-14 px-10 shadow-lg"
            >
              <Plus className="size-6 ml-2" />
              إضافة أول طبيب
            </button>
          </div>
        )}
      </div>

      {/* Popups */}
      <DoctorDialog
        key={`${dialogMode}-${currentDoctor?.id || 'new'}`}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        mode={dialogMode}
        initialData={currentDoctor}
        onConfirm={handleConfirmAction}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف الطبيب ${doctorToDelete?.name || ''}؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        variant="danger"
      />
    </div>
  )
}

export default DoctorsList
