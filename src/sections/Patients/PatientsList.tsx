import {
  Eye,
  Plus,
  Search,
  SquarePen,
  Trash2,
  Loader2,
  X
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/Button';
import { patientsTranslations } from '../../constants/translations/patients';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePreloader } from '../../contexts/PreloaderContext';
import { useBroadcast } from '../../hooks/useBroadcast';
import { cn } from '../../utils/cn';
import PatientsDialog from './PatientsDialog';
import TableFooter from '../../components/ui/TableFooter';
import Modal from '../../components/ui/Modal';
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
} from '../../components/ui/table';

import { fetchPatients, fetchPatientByUuid, deletePatient } from '../../api/patientApi';
import type { ApiPatient } from '../../api/patientApi';

const PatientsList = () => {
  const { isAr, t } = useLanguage();
  const T = patientsTranslations;
  const { isLoaded, isExiting } = usePreloader();
  const canAnimate = isLoaded && !isExiting;

  // State Management
  const [patients, setPatients] = useState<ApiPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState('createdAt,desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [currentPatient, setCurrentPatient] = useState<ApiPatient | null>(null);
  const [fetchingPatientDetail, setFetchingPatientDetail] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<ApiPatient | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { broadcast } = useBroadcast((event) => {
    if (event.type === 'DATA_UPDATE' && event.module === 'patients') {
      loadPatients();
    }
  });

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset page on new search
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  // Load patients from API
  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPatients({
        page: currentPage - 1, // API is 0-indexed
        size: pageSize,
        search: debouncedSearch || undefined,
        sort: sort !== '--' ? sort : undefined
      });
      setPatients(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err: any) {
      console.error(err);
      setError(t('error_fetch', T) || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, sort, t]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleOpenDialog = async (mode: 'add' | 'edit' | 'view', patientUuid?: string) => {
    if (mode === 'add') {
      setDialogMode('add');
      setCurrentPatient(null);
      setIsDialogOpen(true);
      return;
    }

    if (!patientUuid) return;

    setFetchingPatientDetail(true);
    try {
      const detailedPatient = await fetchPatientByUuid(patientUuid);
      setDialogMode(mode);
      setCurrentPatient(detailedPatient);
      setIsDialogOpen(true);
    } catch (err: any) {
      console.error(err);
      window.showToast?.(t('error_fetch', T) || 'Failed to load patient detail', 'error');
    } finally {
      setFetchingPatientDetail(false);
    }
  };

  const handleDeleteClick = (patient: ApiPatient) => {
    setPatientToDelete(patient);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!patientToDelete?.uuid) return;

    setDeleting(true);
    try {
      await deletePatient(patientToDelete.uuid);
      window.showToast?.(t('toast_delete_success', T) || 'Patient deleted successfully', 'success');
      loadPatients();
      broadcast({ type: 'DATA_UPDATE', module: 'patients' });
    } catch (err: any) {
      console.error(err);
      window.showToast?.(err.message || t('delete_confirm_title', T), 'error');
    } finally {
      setDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleConfirmAction = () => {
    if (dialogMode === 'add' && currentPage !== 1) {
      setCurrentPage(1);
    } else {
      loadPatients();
    }
    broadcast({ type: 'DATA_UPDATE', module: 'patients' });
  };

  const calculateAge = (dobString?: string) => {
    if (!dobString) return '---';
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return '---';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <section className="flex-1 overflow-auto">
      <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
        {/* Page Header */}
        <header className={cn(
          "flex flex-col md:flex-row md:items-center md:justify-between gap-4 opacity-0",
          canAnimate && "animate-fadeDown animate-delay-100"
        )}>
          <div className="text-start">
            <h1 className="text-3xl mb-1" style={{ fontWeight: 700 }}>{t('page_title', T)}</h1>
            <p className="text-muted-foreground">{t('page_desc', T)}</p>
          </div>
          <Button
            onClick={() => handleOpenDialog('add')}
            className="h-10 px-6 rounded-xl"
            disabled={fetchingPatientDetail || deleting}
          >
            {fetchingPatientDetail ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className={cn("size-4", isAr ? "ml-2" : "mr-2")} />
            )}
            {t('add_button', T)}
          </Button>
        </header>

        {/* Search and Table Card */}
        <article
          data-slot="card"
          className={cn(
            "text-card-foreground flex flex-col rounded-xl border transition-all duration-300 hover:shadow-lg bg-white border-border shadow-sm opacity-0 overflow-hidden",
            canAnimate && "animate-fadeUp animate-delay-200"
          )}
        >
          {/* Header Filters */}
          <div className="p-6 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Search */}
              <div className="relative w-full md:w-96">
                <Search className={cn("absolute top-1/2 -translate-y-1/2 text-muted-foreground size-[18px]", isAr ? "right-3" : "left-3")} />
                <input
                  data-slot="input"
                  className={cn(
                    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-border flex w-full min-w-0 rounded-xl border py-1 text-base transition-[color,box-shadow] outline-none md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-10 bg-input-background",
                    isAr ? "pr-10 pl-3" : "pl-10 pr-3"
                  )}
                  placeholder={t('search_placeholder', T)}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Sort Filter */}
              <div className="w-full sm:w-48 text-start">
                <Select value={sort} onValueChange={(val) => { setSort(val); setCurrentPage(1); }}>
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue placeholder={t('sort_label', T) || 'Sort By'} />
                  </SelectTrigger>
                  <SelectContent smallZ>
                    <SelectItem value="--">--</SelectItem>
                    <SelectItem value="createdAt,desc">createdAt,desc</SelectItem>
                    <SelectItem value="createdAt,asc">createdAt,asc</SelectItem>
                    <SelectItem value="firstName,asc">firstName,asc</SelectItem>
                    <SelectItem value="firstName,desc">firstName,desc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <section className="overflow-x-auto">
            {loading && patients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="size-10 animate-spin text-primary mb-3" />
                <p className="font-semibold text-lg">{isAr ? "جاري التحميل..." : "Loading..."}</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 text-destructive font-bold text-lg">
                {error}
              </div>
            ) : patients.length > 0 ? (
              <div className={cn("relative transition-opacity duration-300", loading && "opacity-60 pointer-events-none")}>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/30 z-10 rounded-xl">
                    <Loader2 className="size-10 animate-spin text-primary" />
                  </div>
                )}
                <Table className="w-full text-sm">
                  <TableHeader className="bg-muted/30 border-b">
                    <TableRow className="text-start">
                      <TableHead className={cn("text-foreground h-12 px-4 align-middle font-bold whitespace-nowrap", isAr ? "text-right" : "text-left")}>{t('table.name', T)}</TableHead>
                      <TableHead className={cn("text-foreground h-12 px-4 align-middle font-bold whitespace-nowrap", isAr ? "text-right" : "text-left")}>{t('table.phone', T)}</TableHead>
                      <TableHead className={cn("text-foreground h-12 px-4 align-middle font-bold whitespace-nowrap", isAr ? "text-right" : "text-left")}>{t('table.age', T)}</TableHead>
                      <TableHead className={cn("text-foreground h-12 px-4 align-middle font-bold whitespace-nowrap", isAr ? "text-right" : "text-left")}>{t('table.gender', T)}</TableHead>
                      <TableHead className={cn("text-foreground h-12 px-4 align-middle font-bold whitespace-nowrap", isAr ? "text-right" : "text-left")}>{t('table.last_visit', T)}</TableHead>
                      <TableHead className={cn("text-foreground h-12 px-4 align-middle font-bold whitespace-nowrap", isAr ? "text-right" : "text-left")}>{t('table.actions', T)}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/30">
                    {patients.map((patient) => {
                      const fullName = `${patient.firstName || ''} ${patient.surName || ''} ${patient.lastName || ''}`.trim() || '---';

                      return (
                        <TableRow
                          key={patient.uuid}
                          className="hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className={cn("p-4 align-middle whitespace-nowrap", isAr ? "text-right" : "text-left")} style={{ fontWeight: 600 }}>
                            {fullName}
                          </TableCell>
                          <TableCell className={cn("p-4 align-middle whitespace-nowrap text-muted-foreground", isAr ? "text-right" : "text-left")}>
                            {patient.phoneNumber}
                          </TableCell>
                          <TableCell className={cn("p-4 align-middle whitespace-nowrap", isAr ? "text-right" : "text-left")}>
                            {calculateAge(patient.dateOfBirth)}
                          </TableCell>
                          <TableCell className={cn("p-4 align-middle whitespace-nowrap", isAr ? "text-right" : "text-left")}>
                            {patient.gender === 'MALE' ? t('dialog.male', T) : t('dialog.female', T)}
                          </TableCell>
                          <TableCell className={cn("p-4 align-middle whitespace-nowrap", isAr ? "text-right" : "text-left")}>
                            <span
                              data-slot="badge"
                              className="inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-xs font-bold w-fit whitespace-nowrap shrink-0 bg-secondary/10 text-secondary border-transparent"
                            >
                              {patient.lastVisitDate || '---'}
                            </span>
                          </TableCell>
                          <TableCell className="p-4 align-middle whitespace-nowrap">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDialog('view', patient.uuid)}
                                className="hover:bg-primary px-2 hover:text-white transition-all duration-300"
                                disabled={fetchingPatientDetail || deleting}
                              >
                                <Eye className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDialog('edit', patient.uuid)}
                                className="hover:bg-primary px-2 hover:text-white transition-all duration-300"
                                disabled={fetchingPatientDetail || deleting}
                              >
                                <SquarePen className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(patient)}
                                className="hover:bg-destructive/10 px-2 text-destructive transition-all duration-300"
                                disabled={fetchingPatientDetail || deleting}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <X className="size-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{t('no_results', T)}</h3>
                <button
                  onClick={() => handleOpenDialog('add')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl text-white bg-primary hover:bg-primary/90 h-11 px-6 shadow-md transition-all font-bold"
                >
                  <Plus className="size-5" />
                  {t('add_button', T)}
                </button>
              </div>
            )}
          </section>

          {/* Table Footer with Pagination & Page Size */}
          {!loading && !error && patients.length > 0 && (
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
                className='pb-4'
                onItemsPerPageChange={(val) => {
                  setPageSize(Number(val));
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
        </article>
      </div>

      <PatientsDialog
        key={`${dialogMode}-${currentPatient?.uuid || 'new'}`}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        mode={dialogMode}
        initialData={currentPatient}
        onConfirm={handleConfirmAction}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={t('delete_confirm_title', T) || 'Confirm Delete'}
        message={(t('delete_confirm_msg', T) || 'Are you sure?').replace('{name}', `${patientToDelete?.firstName || ''} ${patientToDelete?.lastName || ''}`)}
        confirmText={t('delete', T) || 'Delete'}
        cancelText={t('cancel', T) || 'Cancel'}
        variant="danger"
        isConfirmDisabled={deleting}
      />
    </section>
  );
};

export default PatientsList;
