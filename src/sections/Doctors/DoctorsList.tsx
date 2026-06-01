import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Eye,
  SquarePen,
  Search,
  Loader2,
  Trash2
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
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table'
import { fetchDoctors, fetchDoctorByUuid, deleteDoctor } from '../../api/doctorApi'
import type { ApiDoctor } from '../../api/doctorApi'

const DoctorsList = () => {
  const { isAr, t } = useLanguage();
  const T = doctorsTranslations;
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting

  const { broadcast } = useBroadcast((event) => {
    if (event.type === 'DATA_UPDATE' && event.module === 'doctors') {
      loadDoctors();
    }
  });

  // State management
  const [doctors, setDoctors] = useState<ApiDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState('createdAt,desc');
  const [status, setStatus] = useState('all');
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

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset page to 1 on new search
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  // Load doctors from API
  const loadDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDoctors({
        page: currentPage - 1, // API is 0-indexed
        size: pageSize,
        search: debouncedSearch || undefined,
        sort: sort !== '--' ? sort : undefined,
        status: status !== 'all' ? status : undefined
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
  }, [currentPage, pageSize, debouncedSearch, sort, status, t]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

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
    loadDoctors();
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
        case 'General Medicine': return 'طب عام';
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
        data-slot="card"
        className={cn(
          "text-card-foreground flex flex-col gap-6 rounded-xl border p-6 bg-white border-border shadow-md",
          isExiting && "animate-fadeDownOut"
        )}
      >
        {/* Filters Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <Select value={status} onValueChange={(val) => { setStatus(val); setCurrentPage(1); }}>
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
            <Select value={sort} onValueChange={(val) => { setSort(val); setCurrentPage(1); }}>
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
        </div>

        {/* Table View */}
        <div className="overflow-x-auto overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="size-10 animate-spin text-primary mb-3" />
              <p className="font-semibold text-lg">{t('loading', T)}</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-destructive font-bold text-lg">
              {error}
            </div>
          ) : doctors.length > 0 ? (
            <Table className="min-w-[900px]">
              <TableHeader className="bg-gray-50 border-b border-border">
                <TableRow>
                  <TableHead className={isAr ? "text-right" : "text-left"}>
                    {isAr ? "الاسم" : "Name"}
                  </TableHead>
                  <TableHead className={isAr ? "text-right" : "text-left"}>
                    {t('dialog.specialty', T)}
                  </TableHead>
                  <TableHead className={isAr ? "text-right" : "text-left"}>
                    {t('dialog.email', T)}
                  </TableHead>
                  <TableHead className={isAr ? "text-right" : "text-left"}>
                    {t('dialog.phone', T)}
                  </TableHead>
                  <TableHead className={isAr ? "text-right" : "text-left"}>
                    {t('status_label', T)}
                  </TableHead>
                  <TableHead className={isAr ? "text-right" : "text-left"}>
                    {isAr ? "الإجراءات" : "Actions"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map((doctor) => {
                  const firstName = doctor.user?.firstName || '';
                  const surName = doctor.user?.surName || '';
                  const lastName = doctor.user?.lastName || '';
                  const fullName = `${firstName} ${surName} ${lastName}`.trim() || '---';
                  const initial = firstName[0] || 'D';

                  return (
                    <TableRow key={doctor.uuid}>
                      {/* Name / Avatar */}
                      <TableCell className="align-middle">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0">
                            {initial}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm line-clamp-1">{fullName}</p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Specialty */}
                      <TableCell className="align-middle text-sm text-muted-foreground">
                        {getSpecialtyText(doctor.specialty)}
                      </TableCell>

                      {/* Email */}
                      <TableCell className="align-middle text-sm text-muted-foreground font-mono">
                        {doctor.user?.email || '---'}
                      </TableCell>

                      {/* Phone */}
                      <TableCell className="align-middle text-sm text-muted-foreground font-mono" dir="ltr">
                        {doctor.user?.phoneNumber || '---'}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="align-middle">
                        <Badge variant={getStatusVariant(doctor.user?.status)}>
                          {getStatusText(doctor.user?.status)}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="align-middle">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenDialog('view', doctor.uuid)}
                            disabled={fetchingDoctorDetail || deleting}
                            title={t('view', T)}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                          >
                            <Eye className="size-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDialog('edit', doctor.uuid)}
                            disabled={fetchingDoctorDetail || deleting}
                            title={t('edit', T)}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors"
                          >
                            <SquarePen className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(doctor)}
                            disabled={fetchingDoctorDetail || deleting}
                            title={t('delete', T)}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <HiOutlineXMark className="size-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">{t('no_doctors', T)}</h3>
              <p className="text-muted-foreground max-w-md mb-6">{t('no_doctors_desc', T)}</p>
              <button
                onClick={() => handleOpenDialog('add')}
                className="inline-flex items-center justify-center gap-2 rounded-xl text-white bg-primary hover:bg-primary/90 h-11 px-6 shadow-md transition-all font-bold"
              >
                <Plus className="size-5" />
                {t('add_new_button', T)}
              </button>
            </div>
          )}
        </div>

        {/* Footer & Pagination */}
        {!loading && !error && doctors.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border pt-4 mt-2">
            <span className="text-sm text-muted-foreground font-bold">
              {isAr ? "إجمالي السجلات:" : "Total Records:"} <span className="font-black text-foreground ml-1">{totalElements}</span>
            </span>
            <TableFooter
              variant="table"
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
