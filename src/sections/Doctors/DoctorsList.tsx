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
import { Button } from '../../components/ui/Button'
import { useLanguage } from '../../contexts/LanguageContext'
import { doctorsTranslations } from '../../constants/translations/doctors'
import { useBroadcast } from '../../hooks/useBroadcast'
import TableFooter from '../../components/ui/TableFooter'

interface Doctor {
  id: number;
  first_name_ar: string;
  surname_ar: string;
  last_name_ar: string;
  first_name_en: string;
  surname_en: string;
  last_name_en: string;
  name_ar: string;
  name_en: string;
  specialty_ar: string;
  specialty_en: string;
  status: string;
  phone: string;
  email: string;
  patients: number;
  revenue: string;
  initial_ar: string;
  initial_en: string;
  gender_ar: string;
  gender_en: string;
  dob: string;
  description_ar: string;
  description_en: string;
  permissions?: string[];
}

const DoctorsList = () => {
  const { isAr, t } = useLanguage();
  const T = doctorsTranslations;
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting

  const { broadcast } = useBroadcast((event) => {
    if (event.type === 'DATA_UPDATE' && event.module === 'doctors') {
      console.log('Doctors data updated in another tab');
    }
  });

  // State management
  const [doctorsList, setDoctorsList] = useState<Doctor[]>(initialDoctors as Doctor[]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const handleOpenDialog = (mode: 'add' | 'edit' | 'view', doctor?: Doctor) => {
    setDialogMode(mode);
    setCurrentDoctor(doctor || null);
    setIsDialogOpen(true);
  };

  const handleConfirmAction = (data: Partial<Doctor>) => {
    if (dialogMode === 'add') {
      const newDoctor: Doctor = {
        id: Date.now(),
        first_name_ar: data.first_name_ar || '',
        surname_ar: data.surname_ar || '',
        last_name_ar: data.last_name_ar || '',
        first_name_en: data.first_name_en || '',
        surname_en: data.surname_en || '',
        last_name_en: data.last_name_en || '',
        name_ar: data.name_ar || '',
        name_en: data.name_en || '',
        specialty_ar: data.specialty_ar || (isAr ? data.specialty_en || '' : ''),
        specialty_en: data.specialty_en || (!isAr ? data.specialty_ar || '' : ''),
        status: 'active',
        phone: data.phone || '',
        email: data.email || '',
        patients: Number(data.patients) || 0,
        revenue: data.revenue || '0',
        initial_ar: data.initial_ar || (isAr ? (data.first_name_ar as string)?.[0] || 'د' : 'د'),
        initial_en: data.initial_en || (!isAr ? (data.first_name_en as string)?.[0] || 'D' : 'D'),
        gender_ar: data.gender_ar || 'ذكر',
        gender_en: data.gender_en || 'Male',
        dob: data.dob || '1990-01-01',
        description_ar: data.description_ar || '',
        description_en: data.description_en || '',
      };
      setDoctorsList(prev => [...prev, newDoctor]);
      broadcast({ type: 'DATA_UPDATE', module: 'doctors' });
      window.showToast?.(t('toast_add_success', T));
    } else if (dialogMode === 'edit' && currentDoctor) {
      setDoctorsList(prev => prev.map(doc => doc.id === currentDoctor.id ? { ...doc, ...data } : doc));
      broadcast({ type: 'DATA_UPDATE', module: 'doctors' });
      window.showToast?.(t('toast_update_success', T));
    }
  };

  const handleDeleteClick = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (doctorToDelete) {
      setDoctorsList(prev => {
        const newList = prev.filter(doc => doc.id !== doctorToDelete.id);
        // Adjust current page if necessary
        const maxPage = Math.ceil(newList.length / itemsPerPage);
        if (currentPage > maxPage && maxPage > 0) setCurrentPage(maxPage);
        return newList;
      });
      broadcast({ type: 'DATA_UPDATE', module: 'doctors' });
    }
    setIsDeleteModalOpen(false);
    window.showToast?.(t('toast_delete_success', T));
  };

  const paginatedDoctors = doctorsList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 pb-10" dir={isAr ? "rtl" : "ltr"}>
      {/* Page Header */}
      <section className={cn(
        "flex items-center justify-between opacity-0",
        canAnimate && "animate-fadeDown animate-delay-100"
      )}>
        <div className="text-start">
          <h1 className="text-3xl mb-1" style={{ fontWeight: 700 }}>{t('page_title', T)}</h1>
          <p className="text-muted-foreground">{t('page_desc', T)}</p>
        </div>
        <Button
          onClick={() => handleOpenDialog('add')}
          className="h-10 px-6 rounded-xl"
        >
          <Plus className={cn("size-4", isAr ? "ml-2" : "mr-2")} />
          {t('add_button', T)}
        </Button>
      </section>

      {/* Cards Grid / Empty State */}
      <div className={cn(
        "grid gap-4",
        paginatedDoctors.length > 0 ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
      )}>
        {paginatedDoctors.length > 0 ? (
          paginatedDoctors.map((doctor, index) => (
            <div
              key={doctor.id}
              style={{
                opacity: canAnimate ? 1 : 0,
                transform: canAnimate ? 'none' : 'translateY(20px)',
                transition: 'all 0.5s ease-out',
                transitionDelay: `${150 + (index * 50)}ms`
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
                        {(isAr ? doctor.first_name_ar : doctor.first_name_en)[0] || (isAr ? 'د' : 'D')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg mb-1 line-clamp-1" style={{ fontWeight: 600 }}>{isAr ? doctor.name_ar : doctor.name_en}</h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{isAr ? doctor.specialty_ar : doctor.specialty_en}</p>
                      <span
                        data-slot="badge"
                        className={cn(
                          "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 transition-[color,box-shadow] overflow-hidden border-transparent text-primary-foreground bg-secondary opacity-0",
                          canAnimate && "animate-snappyToRight animate-delay-400"
                        )}
                      >
                        {t('active_status', T)}
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
                        <p className="text-xs text-muted-foreground">{t('patients', T)}</p>
                      </div>
                      <p className="text-lg font-bold">{doctor.patients}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <DollarSign className="size-4 text-secondary" />
                        <p className="text-xs text-muted-foreground">{t('revenue', T)}</p>
                      </div>
                      <p className="text-sm font-bold">{doctor.revenue} {t('currency', T)}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <footer className="flex gap-2 mt-auto items-stretch">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog('view', doctor)}
                      className="flex-1 rounded-lg gap-1.5 h-auto"
                    >
                      <Eye className={cn("size-4", isAr ? "ml-1" : "mr-1")} />
                      {t('view', T)}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog('edit', doctor)}
                      className="flex-1 rounded-lg gap-1.5 h-auto"
                    >
                      <SquarePen className={cn("size-4", isAr ? "ml-1" : "mr-1")} />
                      {t('edit', T)}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteClick(doctor)}
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
            <div className="size-28 rounded-full bg-primary/10 flex items-center justify-center mb-8 animate-hovering border border-primary/20 shadow-inner backdrop-blur-sm">
              <HiOutlineXMark className="size-14 text-primary" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-3">{t('no_doctors', T)}</h3>
            <p className="text-muted-foreground max-w-lg mb-10 text-lg">
              {t('no_doctors_desc', T)}
            </p>
            <button
              onClick={() => handleOpenDialog('add')}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-lg font-bold transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 active:translate-y-0 active:shadow-md text-primary-foreground bg-primary hover:bg-primary/90 h-14 px-10 shadow-lg"
            >
              <Plus className={cn("size-6", isAr ? "ml-2" : "mr-2")} />
              {t('add_new_button', T)}
            </button>
          </div>
        )}
      </div>

      {doctorsList.length > 0 && (
        <TableFooter
          variant="list"
          totalItems={doctorsList.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}

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
        title={t('delete_confirm_title', T)}
        message={t('delete_confirm_msg', T).replace('{name}', isAr ? doctorToDelete?.name_ar || '' : doctorToDelete?.name_en || '')}
        confirmText={t('delete', T)}
        cancelText={t('cancel', T)}
        variant="danger"
      />
    </div>
  )
}

export default DoctorsList
