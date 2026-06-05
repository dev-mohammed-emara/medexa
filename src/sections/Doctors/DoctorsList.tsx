import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Eye,
  SquarePen,
  Search,
  Loader2,
  Trash2,
  Phone,
  Mail,
  Users,
  DollarSign
} from 'lucide-react'
import { HiOutlineXMark } from "react-icons/hi2"
import { usePreloader } from '../../contexts/PreloaderContext'
import { cn } from '../../utils/cn'
import DoctorDialog from './DoctorDialog'
import Modal from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { useLanguage } from '../../contexts/LanguageContext'
import { doctorsTranslations } from '../../constants/translations/doctors'
import { useBroadcast } from '../../hooks/useBroadcast'
import TableFooter from '../../components/ui/TableFooter'
import Badge from '../../components/ui/badge'
import Input from '../../components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"

import { fetchDoctors, fetchDoctorByUuid, deleteDoctor } from '../../api/doctorApi'
import type { ApiDoctor } from '../../api/doctorApi'
import { useAuth } from '../../contexts/AuthContext'
import { initialDoctors } from '../../constants/Doctors_dummy'

const DoctorsList = () => {
  const { isAr, t } = useLanguage();
  const T = doctorsTranslations;
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting
  const { user: currentUser } = useAuth()

  const { broadcast } = useBroadcast((event) => {
    if (event.type === 'DATA_UPDATE' && event.module === 'doctors') {
      loadDoctors();
    }
  });

  // State management
  const [doctors, setDoctors] = useState<ApiDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Local Filter Input States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('createdAt,desc');

  // Active Filter States (applied on Confirm)
  const [activeSearch, setActiveSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState('all');
  const [activeSort, setActiveSort] = useState('createdAt,desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [currentDoctor, setCurrentDoctor] = useState<ApiDoctor | null>(null);
  const [fetchingDoctorDetail, setFetchingDoctorDetail] = useState(false);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<ApiDoctor | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load doctors from API
  const loadDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDoctors({
        page: currentPage - 1, // API is 0-indexed
        size: pageSize,
        search: activeSearch || undefined,
        sort: activeSort !== '--' ? activeSort : undefined,
        status: activeStatus !== 'all' ? activeStatus : undefined
      });
      setDoctors(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err: any) {
      console.error(err);
      setError(t('error_fetch', T));
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, activeSearch, activeSort, activeStatus, t]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const handleApplyFilters = () => {
    setActiveSearch(search);
    setActiveStatus(status);
    setActiveSort(sort);
    setCurrentPage(1);
  };

  const handleOpenDialog = async (mode: 'add' | 'edit' | 'view', doctorUuid?: string) => {
    if (mode === 'add') {
      setDialogMode('add');
      setCurrentDoctor(null);
      setIsDialogOpen(true);
      return;
    }

    if (!doctorUuid) return;

    setFetchingDoctorDetail(true);
    try {
      const detailedDoctor = await fetchDoctorByUuid(doctorUuid);
      setDialogMode(mode);
      setCurrentDoctor(detailedDoctor);
      setIsDialogOpen(true);
    } catch (err: any) {
      console.error(err);
      window.showToast?.(t('error_fetch', T), 'error');
    } finally {
      setFetchingDoctorDetail(false);
    }
  };

  const handleDeleteClick = (doctor: ApiDoctor) => {
    setDoctorToDelete(doctor);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!doctorToDelete?.user?.uuid) return;

    setDeleting(true);
    try {
      await deleteDoctor(doctorToDelete.user.uuid);
      window.showToast?.(t('toast_delete_success', T), 'success');
      loadDoctors();
      broadcast({ type: 'DATA_UPDATE', module: 'doctors' });
    } catch (err: any) {
      console.error(err);
      window.showToast?.(err.message || t('delete_confirm_title', T), 'error');
    } finally {
      setDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleConfirmAction = () => {
    // Reload data on create or edit success
    if (dialogMode === 'add') {
      setSearch('');
      setStatus('all');
      setSort('createdAt,desc');
      setActiveSearch('');
      setActiveStatus('all');
      setActiveSort('createdAt,desc');
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        loadDoctors();
      }
    } else {
      loadDoctors();
    }
    broadcast({ type: 'DATA_UPDATE', module: 'doctors' });
  };

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'INACTIVE':
        return 'red';
      case 'WAITING_VERIFICATION':
        return 'yellow';
      default:
        return 'blue';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return t('status_active', T);
      case 'INACTIVE':
        return t('status_inactive', T);
      case 'WAITING_VERIFICATION':
        return t('status_waiting', T);
      default:
        return status || '';
    }
  };

  const getSpecialtyText = (spec: string) => {
    if (isAr) {
      switch (spec) {
        case 'Cardiology': return 'قلب وأوعية دموية';
        case 'Pediatrics': return 'أطفال';
        case 'Dentistry': return 'أسنان';
        case 'General': return 'طب عام';
        case 'General Medicine': return 'طب عام';
        case 'Dermatology': return 'جلدية';
        case 'Internal Medicine': return 'باطني';
        case 'Surgery': return 'جراحة';
        default: return spec;
      }
    }
    return spec;
  };

  return (
    <div className="space-y-6 pb-10" dir={isAr ? "rtl" : "ltr"}>
      {/* Page Header */}
      <section className={cn(
        "flex items-center justify-between opacity-0",
        canAnimate && "animate-fadeDown animate-delay-100"
      )}>
        <div className="text-start">
          <h1 className="text-3xl mb-1 font-bold">{t('page_title', T)}</h1>
          <p className="text-muted-foreground">{t('page_desc', T)}</p>
        </div>
        <Button
          onClick={() => handleOpenDialog('add')}
          className="h-10 px-6 rounded-xl"
          disabled={fetchingDoctorDetail || deleting}
        >
          {fetchingDoctorDetail ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className={cn("size-4", isAr ? "ml-2" : "mr-2")} />
          )}
          {t('add_button', T)}
        </Button>
      </section>

      {/* Filter and Table Card */}
      <div
        className={cn(
          "text-card-foreground flex flex-col gap-6 bg-transparent border-none shadow-none p-0",
          isExiting && "animate-fadeDownOut"
        )}
      >
        {/* Filters Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end bg-white p-6 rounded-xl border border-border shadow-md">
          {/* Search Box */}
          <div className="relative">
            <label className="text-xs text-muted-foreground mb-2 block font-medium">
              {isAr ? "البحث" : "Search"}
            </label>
            <Input
              type="text"
              placeholder={t('search_placeholder', T)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search size={18} />}
              className="rounded-xl h-11"
              dir={isAr ? "rtl" : "ltr"}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block font-medium">
              {t('status_label', T)}
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder={t('all_statuses', T)} />
              </SelectTrigger>
              <SelectContent smallZ>
                <SelectItem value="all">{t('all_statuses', T)}</SelectItem>
                <SelectItem value="ACTIVE">{t('status_active', T)}</SelectItem>
                <SelectItem value="INACTIVE">{t('status_inactive', T)}</SelectItem>
                <SelectItem value="WAITING_VERIFICATION">{t('status_waiting', T)}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Filter */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block font-medium">
              {t('sort_label', T)}
            </label>
            <Select value={sort} onValueChange={sortVal => setSort(sortVal)}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent smallZ>
                <SelectItem value="--">--</SelectItem>
                <SelectItem value="createdAt,desc">createdAt,desc</SelectItem>
                <SelectItem value="createdAt,asc">createdAt,asc</SelectItem>
                <SelectItem value="specialty,asc">specialty,asc</SelectItem>
                <SelectItem value="specialty,desc">specialty,desc</SelectItem>
                <SelectItem value="user.firstName,asc">user.firstName,asc</SelectItem>
                <SelectItem value="user.firstName,desc">user.firstName,desc</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Apply Filters Button */}
          <div>
            <Button
              onClick={handleApplyFilters}
              disabled={loading}
              className="h-11 w-full rounded-xl bg-primary text-white hover:bg-primary/90 font-bold transition-all shadow-md"
            >
              {isAr ? "تطبيق الفلاتر" : "Apply Filters"}
            </Button>
          </div>
        </div>

        {/* Card Grid View */}
        <div className="overflow-hidden">
          {loading && doctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="size-10 animate-spin text-primary mb-3" />
              <p className="font-semibold text-lg">{t('loading', T)}</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-destructive font-bold text-lg">
              {error}
            </div>
          ) : doctors.length > 0 ? (
            <div className={cn("relative transition-opacity duration-300", loading && "opacity-60 pointer-events-none")}>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/30 z-10 rounded-xl">
                  <Loader2 className="size-10 animate-spin text-primary" />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map((doctor, index) => {
                  const firstName = doctor.user?.firstName || '';
                  const surName = doctor.user?.surName || '';
                  const lastName = doctor.user?.lastName || '';
                  const fullName = `${firstName} ${surName} ${lastName}`.trim() || '---';
                  const initial = firstName[0] || 'D';

                  const dummyMatch = initialDoctors.find(
                    (d) => d.email.toLowerCase() === doctor.user?.email?.toLowerCase()
                  );
                  const patientsCount = dummyMatch?.patients ?? 145;
                  const revenueAmount = dummyMatch?.revenue ? `${Number(dummyMatch.revenue).toLocaleString()} د.أ` : "2,400 د.أ";

                  return (
                    <div
                      key={doctor.uuid}
                      className="animate-fadeUp opacity-0"
                      style={{
                        animationDelay: `${(index + 1) * 80}ms`,
                        animationFillMode: 'forwards'
                      }}
                    >
                      <div data-slot="card" className="text-card-foreground flex flex-col gap-6 rounded-xl border p-6 bg-white border-border shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                          <div>
                            <div className="flex items-start gap-4 mb-4">
                              <span data-slot="avatar" className="relative flex size-10 shrink-0 overflow-hidden rounded-full w-16 h-16 border-2 border-primary/20 shadow-md">
                                <span data-slot="avatar-fallback" className="flex size-full items-center justify-center rounded-full bg-primary text-white text-xl">
                                  {initial}
                                </span>
                              </span>
                              <div className="flex-1">
                                <h3 className="text-lg mb-1" style={{ fontWeight: 600 }}>{fullName}</h3>
                                <p className="text-sm text-muted-foreground mb-2">{getSpecialtyText(doctor.specialty)}</p>
                                <div>
                                  <Badge variant={getStatusVariant(doctor.user?.status)}>
                                    {getStatusText(doctor.user?.status)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="size-4 shrink-0" />
                                <span dir="ltr">{doctor.user?.phoneNumber || '---'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="size-4 shrink-0" />
                                <span className="line-clamp-1">{doctor.user?.email || '---'}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-muted/30 rounded-lg">
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <Users className="text-primary size-4" />
                                  <p className="text-xs text-muted-foreground">{isAr ? "المرضى" : "Patients"}</p>
                                </div>
                                <p className="text-lg" style={{ fontWeight: 600 }}>{patientsCount}</p>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <DollarSign className="text-secondary size-4" />
                                  <p className="text-xs text-muted-foreground">{isAr ? "الإيرادات" : "Revenue"}</p>
                                </div>
                                <p className="text-sm" style={{ fontWeight: 600 }}>{isAr ? revenueAmount : `${revenueAmount.replace(' د.أ', '')} JOD`}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenDialog('view', doctor.uuid)}
                              disabled={fetchingDoctorDetail || deleting}
                              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 hover:border-primary/30 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 flex-1"
                            >
                              <Eye className={cn("size-4", isAr ? "ml-1" : "mr-1")} />
                              {t('view', T)}
                            </button>
                            <button
                              onClick={() => handleOpenDialog('edit', doctor.uuid)}
                              disabled={fetchingDoctorDetail || deleting}
                              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 hover:border-primary/30 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 flex-1"
                            >
                              <SquarePen className={cn("size-4", isAr ? "ml-1" : "mr-1")} />
                              {t('edit', T)}
                            </button>
                            {doctor.user?.email === currentUser?.email ? (
                              <span className="inline-flex items-center justify-center px-3 rounded-lg bg-primary/10 text-primary text-xs font-bold whitespace-nowrap self-center h-8">
                                {isAr ? "أنت" : "You"}
                              </span>
                            ) : (
                              <button
                                onClick={() => handleDeleteClick(doctor)}
                                disabled={fetchingDoctorDetail || deleting}
                                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md border bg-background dark:bg-input/30 dark:border-input dark:hover:bg-input/50 hover:border-primary/30 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            (() => {
              const isFiltering = activeSearch !== '' || activeStatus !== 'all' || activeSort !== 'createdAt,desc';
              return (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-border shadow-md w-full">
                  <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <HiOutlineXMark className="size-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {isFiltering 
                      ? (isAr ? "لا توجد نتائج مطابقة" : "No matching results found")
                      : t('no_doctors', T)}
                  </h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    {isFiltering
                      ? (isAr ? "لم نجد أي عيادات أو أطباء يطابقون فلاتر البحث الحالية. يرجى إعادة ضبط الفلاتر والمحاولة مرة أخرى." : "We couldn't find any doctors matching your search filters. Please reset your filters and try again.")
                      : t('no_doctors_desc', T)}
                  </p>
                  <button
                    onClick={() => {
                      if (isFiltering) {
                        setSearch('');
                        setStatus('all');
                        setSort('createdAt,desc');
                        setActiveSearch('');
                        setActiveStatus('all');
                        setActiveSort('createdAt,desc');
                        setCurrentPage(1);
                      } else {
                        handleOpenDialog('add');
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl text-white bg-primary hover:bg-primary/90 h-11 px-6 shadow-md transition-all font-bold"
                  >
                    {isFiltering ? (
                      isAr ? "إعادة ضبط الفلاتر" : "Reset Filters"
                    ) : (
                      <>
                        <Plus className="size-5" />
                        {t('add_new_button', T)}
                      </>
                    )}
                  </button>
                </div>
              );
            })()
          )}
        </div>

        {/* Footer & Pagination */}
        {!loading && !error && doctors.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-transparent pt-4 mt-2">
            <span className="text-sm text-muted-foreground font-bold">
              {isAr ? "إجمالي السجلات:" : "Total Records:"} <span className="font-black text-foreground ml-1">{totalElements}</span>
            </span>
            <TableFooter
              variant="table"
              className="bg-transparent shadow-none border-none p-0 mt-0"
              totalItems={totalElements}
              itemsPerPage={pageSize}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalPages={totalPages}
              onItemsPerPageChange={(val) => {
                setPageSize(Number(val));
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Popups */}
      <DoctorDialog
        key={`${dialogMode}-${currentDoctor?.uuid || 'new'}`}
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
        message={t('delete_confirm_msg', T).replace('{name}', isAr ? `${doctorToDelete?.user?.firstName || ''} ${doctorToDelete?.user?.lastName || ''}` : `${doctorToDelete?.user?.firstName || ''} ${doctorToDelete?.user?.lastName || ''}`)}
        confirmText={t('delete', T)}
        cancelText={t('cancel', T)}
        variant="danger"
        isConfirmDisabled={deleting}
      />
    </div>
  )
}

export default DoctorsList
