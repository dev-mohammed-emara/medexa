import { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePreloader } from '../../contexts/PreloaderContext';
import { Plus, Trash2, Search, AlertCircle, Loader2, Eye, SquarePen, FileText, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import EmptyShell from '../../components/ui/EmptyShell';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table';
import {
  fetchAppointmentTypes,
  createAppointmentType,
  updateAppointmentType,
  deleteAppointmentType,
  getAppointmentType
} from '../../api/appointmentTypeApi';
import type { ApiAppointmentType } from '../../api/appointmentTypeApi';

const AppointmentTypesList = () => {
  const { isLoaded, isExiting } = usePreloader();
  const canAnimate = isLoaded && !isExiting;
  const { isAr } = useLanguage();
  const { hasRole } = useAuth();
  const isSecretary = hasRole('ROLE_SECRETARY');

  const [appointmentTypes, setAppointmentTypes] = useState<ApiAppointmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search State
  const [search, setSearch] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [currentUuid, setCurrentUuid] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30
  });

  const loadAppointmentTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAppointmentTypes();
      setAppointmentTypes(data);
    } catch (err: any) {
      console.error('Failed to load appointment types:', err);
      setError(err.message || 'Failed to load appointment types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointmentTypes();
  }, []);

  const handleOpenAddModal = () => {
    setModalMode('add');
    setCurrentUuid(null);
    setFormData({ name: '', description: '', duration: 30 });
    setIsModalOpen(true);
  };

  const handleOpenEditViewModal = async (uuid: string, mode: 'edit' | 'view') => {
    try {
      setLoading(true);
      const data = await getAppointmentType(uuid);
      setModalMode(mode);
      setCurrentUuid(uuid);
      setFormData({
        name: data.name,
        description: data.description,
        duration: data.duration
      });
      setIsModalOpen(true);
    } catch (err: any) {
      console.error('Failed to load appointment type details:', err);
      window.showToast?.(err.message || 'Failed to load appointment type', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteModal = (uuid: string) => {
    setCurrentUuid(uuid);
    setIsDeleteModalOpen(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.name.trim() || formData.duration <= 0) {
      window.showToast?.(isAr ? 'يرجى تعبئة جميع الحقول المطلوبة' : 'Please fill all required fields', 'error');
      return;
    }

    try {
      setSaving(true);
      if (modalMode === 'add') {
        await createAppointmentType(formData);
        window.showToast?.(isAr ? 'تمت إضافة نوع الموعد بنجاح' : 'Appointment type added successfully', 'success');
      } else if (modalMode === 'edit' && currentUuid) {
        await updateAppointmentType({
          appointmentTypeUuid: currentUuid,
          ...formData
        });
        window.showToast?.(isAr ? 'تم تحديث نوع الموعد بنجاح' : 'Appointment type updated successfully', 'success');
      }
      setIsModalOpen(false);
      loadAppointmentTypes();
    } catch (err: any) {
      console.error(err);
      window.showToast?.(err.message || 'Failed to save appointment type', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUuid) return;
    try {
      setDeleting(true);
      await deleteAppointmentType(currentUuid);
      window.showToast?.(isAr ? 'تم الحذف بنجاح' : 'Deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      loadAppointmentTypes();
    } catch (err: any) {
      console.error(err);
      window.showToast?.(err.message || 'Failed to delete appointment type', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredTypes = appointmentTypes.filter(type =>
    type.name.toLowerCase().includes(search.toLowerCase()) ||
    type.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="flex-1 overflow-auto">
      <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
        {/* Page Header */}
        <header className={cn(
          "flex flex-col md:flex-row md:items-center md:justify-between gap-4 opacity-0",
          canAnimate && "animate-fadeDown animate-delay-100"
        )}>
          <div className="text-start">
            <h1 className="text-3xl mb-1" style={{ fontWeight: 700 }}>
              {isAr ? 'أنواع المواعيد' : 'Appointment Types'}
            </h1>
            <p className="text-muted-foreground">
              {isAr ? 'إدارة سجلات ومعلومات أنواع المواعيد' : 'Manage records and information of appointment types'}
            </p>
          </div>
          {!isSecretary && (
            <Button
              onClick={handleOpenAddModal}
              className="group/button inline-flex w-fit! shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 bg-primary text-primary-foreground [a]:hover:bg-primary/80 gap-1.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 h-10 px-6 rounded-xl"
            >
              <Plus className={cn("size-4", isAr ? "ml-2" : "mr-2")} />
              {isAr ? 'إضافة نوع موعد' : 'Add Appointment Type'}
            </Button>
          )}
        </header>

        {/* Search and Table Card */}
        <article
          className={cn(
            "text-card-foreground flex flex-col bg-transparent border-none shadow-none opacity-0 overflow-hidden",
            canAnimate && "animate-fadeUp animate-delay-200"
          )}
        >
          {/* Header Filters */}
          <div className="p-6 pb-4 bg-white rounded-xl border border-border shadow-md mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 text-start">
                <label className="text-xs text-muted-foreground mb-2 block font-medium">
                  {isAr ? "البحث" : "Search"}
                </label>
                <div className="relative">
                  <Search className={cn("absolute top-1/2 -translate-y-1/2 text-muted-foreground size-[18px]", isAr ? "right-3" : "left-3")} />
                  <input
                    data-slot="input"
                    className={cn(
                      "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-border flex w-full min-w-0 rounded-xl border py-1 text-base transition-[color,box-shadow] outline-none md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-10 bg-input-background",
                      isAr ? "pr-10 pl-3" : "pl-10 pr-3"
                    )}
                    placeholder={isAr ? "بحث في الأنواع..." : "Search types..."}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && !loading && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-center gap-3 border border-destructive/20 mb-6">
              <AlertCircle className="size-5 shrink-0" />
              <p className="font-bold">{error}</p>
            </div>
          )}

          {/* Table Container */}
          {filteredTypes.length > 0 || loading ? (
            <section className="overflow-x-auto bg-white rounded-xl border border-border shadow-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={cn("text-foreground h-12 px-6 align-middle font-bold whitespace-nowrap", isAr ? "text-right" : "text-left")}>{isAr ? 'الاسم' : 'Name'}</TableHead>
                    <TableHead className={cn("text-foreground h-12 px-6 align-middle font-bold whitespace-nowrap", isAr ? "text-right" : "text-left")}>{isAr ? 'الوصف' : 'Description'}</TableHead>
                    <TableHead className={cn("text-foreground h-12 px-6 align-middle font-bold whitespace-nowrap", isAr ? "text-right" : "text-left")}>{isAr ? 'المدة (دقائق)' : 'Duration (mins)'}</TableHead>
                    {!isSecretary && (
                      <TableHead className="text-foreground h-12 px-6 align-middle font-bold whitespace-nowrap text-center">{isAr ? 'الإجراءات' : 'Actions'}</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className={cn("p-6 align-middle whitespace-nowrap", isAr ? "text-right" : "text-left")}><div className="h-4 bg-muted rounded w-32 animate-pulse"></div></TableCell>
                        <TableCell className={cn("p-6 align-middle whitespace-nowrap", isAr ? "text-right" : "text-left")}><div className="h-4 bg-muted rounded w-48 animate-pulse"></div></TableCell>
                        <TableCell className={cn("p-6 align-middle whitespace-nowrap", isAr ? "text-right" : "text-left")}><div className="h-4 bg-muted rounded w-16 animate-pulse"></div></TableCell>
                        {!isSecretary && (
                          <TableCell className="p-6 align-middle whitespace-nowrap text-center"><div className="h-8 bg-muted rounded w-24 mx-auto animate-pulse"></div></TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    filteredTypes.map((type) => (
                      <TableRow key={type.uuid} className="hover:bg-muted/30 transition-colors">
                        <TableCell className={cn("p-6 align-middle whitespace-nowrap font-bold text-foreground", isAr ? "text-right" : "text-left")}>{type.name}</TableCell>
                        <TableCell className={cn("p-6 align-middle whitespace-nowrap text-muted-foreground", isAr ? "text-right" : "text-left")}>{type.description || '---'}</TableCell>
                        <TableCell className={cn("p-6 align-middle whitespace-nowrap font-medium text-foreground", isAr ? "text-right" : "text-left")}>{type.duration} {isAr ? 'دقيقة' : 'mins'}</TableCell>
                        {!isSecretary && (
                          <TableCell className="p-6 align-middle whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenEditViewModal(type.uuid, 'view')}
                                className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-colors"
                                title={isAr ? 'عرض' : 'View'}
                              >
                                <Eye className="size-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEditViewModal(type.uuid, 'edit')}
                                className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-colors"
                                title={isAr ? 'تعديل' : 'Edit'}
                              >
                                <SquarePen className="size-4" />
                              </button>
                              <button
                                onClick={() => handleOpenDeleteModal(type.uuid)}
                                className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                                title={isAr ? 'حذف' : 'Delete'}
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </section>
          ) : (
            (() => {
              const isFiltering = search !== '';
              return (
                <EmptyShell
                  title={
                    isFiltering
                      ? (isAr ? "لا توجد نتائج مطابقة" : "No matching results found")
                      : (isAr ? "لا توجد أنواع مواعيد حالياً" : "No appointment types found")
                  }
                  description={
                    isFiltering
                      ? (isAr ? "لم نجد أي أنواع مواعيد تطابق فلاتر البحث الحالية. يرجى إعادة ضبط الفلاتر والمحاولة مرة أخرى." : "We couldn't find any appointment types matching your search filters. Please reset your filters and try again.")
                      : (isAr ? "البدء بإضافة أنواع مواعيد خاصة بك للظهور هنا في القائمة." : "Start by adding appointment types to see them in this list.")
                  }
                  buttonText={
                    isFiltering ? (
                      isAr ? "إعادة ضبط الفلاتر" : "Reset Filters"
                    ) : (
                      <>
                        <Plus className="size-5" />
                        {isAr ? "إضافة نوع موعد" : "Add Appointment Type"}
                      </>
                    )
                  }
                  onButtonClick={() => {
                    if (isFiltering) {
                      setSearch('');
                    } else {
                      handleOpenAddModal();
                    }
                  }}
                />
              );
            })()
          )}
        </article>
      </div>

      {/* Add/Edit/View Dialog Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {}}
        confirmText=""
        cancelText=""
        showCloseButton={true}
        hideHeaderIcon={true}
        hideFooter={true}
        title={
          modalMode === 'add' ? (isAr ? 'إضافة نوع موعد جديد' : 'Add New Appointment Type') :
          modalMode === 'edit' ? (isAr ? 'تعديل نوع الموعد' : 'Edit Appointment Type') :
          (isAr ? 'تفاصيل نوع الموعد' : 'Appointment Type Details')
        }
        message={
          modalMode === 'add' ? (isAr ? 'أدخل معلومات نوع الموعد الجديد أدناه.' : 'Enter the details of the new appointment type below.') :
          modalMode === 'edit' ? (isAr ? 'تعديل تفاصيل نوع الموعد.' : 'Modify the details of the appointment type.') :
          undefined
        }
        footer={
          modalMode === 'view' ? (
            <footer className="flex gap-4 pt-6 border-t border-border mt-6 p-8">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl text-base"
                onClick={() => setIsModalOpen(false)}
              >
                {isAr ? 'إغلاق' : 'Close'}
              </Button>
            </footer>
          ) : (
            <footer className="flex gap-4 pt-6 border-t border-border mt-6 p-8">
              <Button
                variant="default"
                className="group/button inline-flex w-fit! items-center justify-center border border-transparent bg-clip-padding font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 bg-primary text-primary-foreground [a]:hover:bg-primary/80 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 flex-1 h-12 rounded-xl text-base shadow-lg shadow-primary/20"
                type="submit"
                form="appointmentTypeForm"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Plus className="ml-2 size-5" />
                )}
                {saving
                  ? (isAr ? 'جاري الحفظ...' : 'Saving...')
                  : modalMode === 'add'
                  ? (isAr ? 'إضافة نوع موعد' : 'Add Appointment Type')
                  : (isAr ? 'حفظ التغييرات' : 'Save Changes')
                }
              </Button>
              <Button
                variant="outline"
                className="group/button inline-flex w-fit! items-center justify-center border bg-clip-padding font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 flex-1 h-12 rounded-xl text-base"
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
            </footer>
          )
        }
      >
        <div className="scrollable z-500 overflow-visible overflow-y-auto pr-1 no-scrollbar" style={{ overscrollBehavior: 'contain' }}>
          <form id="appointmentTypeForm" onSubmit={handleSave} className="py-2" autoComplete="off">
            <article className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name Field */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-foreground/80 pr-1">{isAr ? 'الاسم' : 'Name'}</label>
                  <div className="relative w-full group">
                    <div className={cn("absolute top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors z-10", isAr ? "right-4" : "left-4")}>
                      <FileText className="size-[18px]" />
                    </div>
                    <input
                      className={cn(
                        "flex w-full border border-border bg-input-background px-4 py-2 text-base transition-all outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-bold rounded-xl h-12",
                        isAr ? "pr-12 pl-4" : "pl-12 pr-4"
                      )}
                      required
                      placeholder={isAr ? "أدخل الاسم" : "Enter name"}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={modalMode === 'view'}
                      dir={isAr ? "rtl" : "ltr"}
                      name="name"
                    />
                  </div>
                </div>

                {/* Duration Field */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-foreground/80 pr-1">{isAr ? 'المدة الافتراضية (بالدقائق)' : 'Default Duration (mins)'}</label>
                  <div className="relative w-full group">
                    <div className={cn("absolute top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors z-10", isAr ? "right-4" : "left-4")}>
                      <Clock className="size-[18px]" />
                    </div>
                    <input
                      type="number"
                      className={cn(
                        "flex w-full border border-border bg-input-background px-4 py-2 text-base transition-all outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-bold rounded-xl h-12",
                        isAr ? "pr-12 pl-4" : "pl-12 pr-4"
                      )}
                      required
                      placeholder={isAr ? "المدة بالدقائق" : "Duration in minutes"}
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                      disabled={modalMode === 'view'}
                      min={1}
                      dir={isAr ? "rtl" : "ltr"}
                      name="duration"
                    />
                  </div>
                </div>

                {/* Description Field */}
                <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
                  <label className="text-sm font-semibold text-foreground/80 pr-1">{isAr ? 'الوصف' : 'Description'} <span className="text-xs font-normal text-muted-foreground mx-1">{isAr ? "(اختياري)" : "(optional)"}</span></label>
                  <div className="relative group">
                    <textarea
                      name="description"
                      className={cn(
                        "w-full min-h-24 p-4 rounded-xl border border-border bg-input-background text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none disabled:opacity-50 placeholder:text-muted-foreground font-bold",
                        isAr ? "pr-12 pl-4" : "pl-12 pr-4"
                      )}
                      placeholder={isAr ? "الوصف" : "Description"}
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      disabled={modalMode === 'view'}
                      dir={isAr ? "rtl" : "ltr"}
                    />
                    <div className={cn("absolute top-4 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors", isAr ? "right-4" : "left-4")}>
                      <FileText className="size-[18px]" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </form>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={isAr ? 'تأكيد الحذف' : 'Confirm Delete'}
        message={isAr ? 'هل أنت متأكد من حذف نوع الموعد هذا؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this appointment type? This action cannot be undone.'}
        confirmText={deleting ? (isAr ? 'جاري الحذف...' : 'Deleting...') : (isAr ? 'حذف' : 'Delete')}
        cancelText={isAr ? 'إلغاء' : 'Cancel'}
        variant="danger"
      />
    </section>
  );
};

export default AppointmentTypesList;
