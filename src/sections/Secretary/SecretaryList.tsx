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
import { useLanguage } from '../../contexts/LanguageContext'
import { secretaryTranslations } from '../../constants/translations/secretary'
import { useBroadcast } from '../../hooks/useBroadcast'

interface Secretary {
  id: number;
  name_ar: string;
  name_en: string;
  role_ar: string;
  role_en: string;
  status: string;
  phone: string;
  email: string;
  gender_ar: string;
  gender_en: string;
  dob: string;
  description_ar: string;
  description_en: string;
  permissions?: string[];
}

const SecretaryList = () => {
  const { isAr, t } = useLanguage();
  const T = secretaryTranslations;
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting

  const { broadcast } = useBroadcast((event) => {
    if (event.type === 'DATA_UPDATE' && event.module === 'secretaries') {
      console.log('Secretaries data updated in another tab');
    }
  });

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
        name_ar: data.name_ar || (isAr ? data.name_en || '' : ''),
        name_en: data.name_en || (!isAr ? data.name_ar || '' : ''),
        role_ar: data.role_ar || (isAr ? data.role_en || 'استقبال' : 'Receptionist'),
        role_en: data.role_en || (!isAr ? data.role_ar || 'Receptionist' : 'Receptionist'),
        status: 'active',
        phone: data.phone || '',
        email: data.email || '',
        gender_ar: data.gender_ar || 'ذكر',
        gender_en: data.gender_en || 'Male',
        dob: data.dob || '1990-01-01',
        description_ar: data.description_ar || '',
        description_en: data.description_en || ''
      };
      setSecretaryList(prev => [...prev, newSecretary]);
      broadcast({ type: 'DATA_UPDATE', module: 'secretaries' });
      window.showToast?.(t('toast_add_success', T));
    } else if (dialogMode === 'edit' && currentSecretary) {
      setSecretaryList(prev => prev.map(s => s.id === currentSecretary.id ? { ...s, ...data } : s));
      broadcast({ type: 'DATA_UPDATE', module: 'secretaries' });
      window.showToast?.(t('toast_update_success', T));
    }
  };

  const handleDeleteClick = (secretary: Secretary) => {
    setSecretaryToDelete(secretary);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (secretaryToDelete) {
      setSecretaryList(prev => prev.filter(s => s.id !== secretaryToDelete.id));
      broadcast({ type: 'DATA_UPDATE', module: 'secretaries' });
    }
    setIsDeleteModalOpen(false);
    window.showToast?.(t('toast_delete_success', T));
  };

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
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
          variant="secondary"
          className="h-10 px-6 rounded-xl"
        >
          <Plus className={cn("size-4", isAr ? "ml-2" : "mr-2")} />
          {t('add_button', T)}
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
                transitionDelay: `${150 + (index * 50)}ms`
              }}
            >
              <article
                data-slot="card"
                className={cn(
                  "text-card-foreground flex flex-col gap-6 rounded-xl border p-6 bg-white border-border shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group h-full",
                  isExiting && "animate-fadeDownOut"
                )}
              >
                <div className="relative z-10 flex flex-col h-full text-start">
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
                        {(isAr ? secretary.name_ar : secretary.name_en)[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg mb-1" style={{ fontWeight: 600 }}>{isAr ? secretary.name_ar : secretary.name_en}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{isAr ? secretary.role_ar : secretary.role_en}</p>
                      <span
                        data-slot="badge"
                        className={cn(
                           "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 transition-[color,box-shadow] overflow-hidden border-transparent text-primary-foreground bg-secondary",
                          canAnimate ? "opacity-100" : "opacity-0"
                        )}
                      >
                        {t('active_status', T)}
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
                      className="flex-1 rounded-lg gap-1.5 h-auto text-xs"
                    >
                      <Eye className={cn("size-4", isAr ? "ml-1" : "mr-1")} />
                      {t('view', T)}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog('edit', secretary)}
                      className="flex-1 rounded-lg gap-1.5 h-auto text-xs"
                    >
                      <SquarePen className={cn("size-4", isAr ? "ml-1" : "mr-1")} />
                      {t('edit', T)}
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
            <h3 className="text-3xl font-bold text-foreground mb-3">{t('no_secretaries', T)}</h3>
            <p className="text-muted-foreground max-w-lg mb-10 text-lg">
              {t('no_secretaries_desc', T)}
            </p>
            <button
              onClick={() => handleOpenDialog('add')}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-lg font-bold transition-all duration-300 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-1 active:translate-y-0 active:shadow-md text-white bg-secondary hover:bg-secondary/90 h-14 px-10 shadow-lg"
            >
              <Plus className={cn("size-6", isAr ? "ml-2" : "mr-2")} />
              {t('add_new_button', T)}
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
        title={t('delete_confirm_title', T)}
        message={t('delete_confirm_msg', T).replace('{name}', isAr ? secretaryToDelete?.name_ar || '' : secretaryToDelete?.name_en || '')}
        confirmText={t('delete', T)}
        cancelText={t('cancel', T)}
        variant="danger"
      />
    </div>
  )
}

export default SecretaryList
