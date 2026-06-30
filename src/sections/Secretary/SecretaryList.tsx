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
  RotateCcw
} from 'lucide-react'
import { usePreloader } from '../../contexts/PreloaderContext'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../utils/cn'
import SecretaryDialog from './SecretaryDialog'
import Modal from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { useLanguage } from '../../contexts/LanguageContext'
import { secretaryTranslations } from '../../constants/translations/secretary'
import { useBroadcast } from '../../hooks/useBroadcast'
import TableFooter from '../../components/ui/TableFooter'
import EmptyShell from '../../components/ui/EmptyShell'
import Badge from '../../components/ui/badge'
import Input from '../../components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"

import { fetchSecretaries, fetchSecretaryByUuid, deleteSecretary } from '../../api/secretaryApi'
import type { ApiSecretary } from '../../api/secretaryApi'
import { initialSecretaries } from '../../constants/Secretary_dummy'

const SecretaryList = () => {
  const { isAr, t } = useLanguage();
  const T = secretaryTranslations;
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting

  const { broadcast } = useBroadcast((event) => {
    if (event.type === 'DATA_UPDATE' && event.module === 'secretaries') {
      loadSecretaries();
    }
  });

  // State management
  const [secretaries, setSecretaries] = useState<ApiSecretary[]>([]);
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
  const [currentSecretary, setCurrentSecretary] = useState<ApiSecretary | null>(null);
  const [fetchingSecretaryDetail, setFetchingSecretaryDetail] = useState(false);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [secretaryToDelete, setSecretaryToDelete] = useState<ApiSecretary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { user: currentUser } = useAuth();
  const canManageClinic = currentUser?.permissions?.includes('MANAGE_CLINIC') || currentUser?.role === 'ROLE_CLINIC_OWNER';

  // Load secretaries from API
  const loadSecretaries = useCallback(async (isCancelled?: () => boolean) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSecretaries({
        page: currentPage - 1, // API is 0-indexed
        size: pageSize,
        search: activeSearch || undefined,
        sort: activeSort !== '--' ? activeSort : undefined,
        status: activeStatus !== 'all' ? activeStatus : undefined
      });
      if (isCancelled?.()) return;
      setSecretaries(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err: any) {
      if (isCancelled?.()) return;
      console.error(err);
      setError(t('error_fetch', T));
    } finally {
      if (!isCancelled?.()) setLoading(false);
    }
  }, [currentPage, pageSize, activeSearch, activeSort, activeStatus, t, T]);

  useEffect(() => {
    let cancelled = false;
    loadSecretaries(() => cancelled);
    return () => { cancelled = true; };
  }, [loadSecretaries]);

  const handleApplyFilters = () => {
    setActiveSearch(search);
    setActiveStatus(status);
    setActiveSort(sort);
    setCurrentPage(1);
  };

  const handleOpenDialog = async (mode: 'add' | 'edit' | 'view', secretaryUuid?: string) => {
    if (mode === 'add') {
      setDialogMode('add');
      setCurrentSecretary(null);
      setIsDialogOpen(true);
      return;
    }

    if (!secretaryUuid) return;

    setFetchingSecretaryDetail(true);
    try {
      const detailedSecretary = await fetchSecretaryByUuid(secretaryUuid);
      setDialogMode(mode);
      setCurrentSecretary(detailedSecretary);
      setIsDialogOpen(true);
    } catch (err: any) {
      console.error(err);
      window.showToast?.(t('error_fetch', T), 'error');
    } finally {
      setFetchingSecretaryDetail(false);
    }
  };

  const handleDeleteClick = (secretary: ApiSecretary) => {
    setSecretaryToDelete(secretary);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!secretaryToDelete?.user?.uuid) return;

    setDeleting(true);
    try {
      await deleteSecretary(secretaryToDelete.user.uuid);
      window.showToast?.(t('toast_delete_success', T), 'success');
      loadSecretaries();
      broadcast({ type: 'DATA_UPDATE', module: 'secretaries' });
    } catch (err: any) {
      console.error(err);
      window.showToast?.(err.message || t('delete_confirm_title', T), 'error');
    } finally {
      setDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleConfirmAction = () => {
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
        loadSecretaries();
      }
    } else {
      loadSecretaries();
    }
    broadcast({ type: 'DATA_UPDATE', module: 'secretaries' });
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
          disabled={fetchingSecretaryDetail || deleting}
        >
          {fetchingSecretaryDetail ? (
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
          "text-card-foreground flex flex-col gap-6 bg-transparent border-none shadow-none p-0 opacity-0",
          canAnimate && "animate-fadeUp animate-delay-200"
        )}
      >
        {/* Filters Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end bg-white p-6 rounded-xl border border-border shadow-md">
          {/* Search Box */}
          <div className="relative">
            <label className="text-xs text-muted-foreground mb-2 block font-medium">
              {isAr ? "البحث" : "Search"}
            </label>
            <Input name="search" type="text"
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
            <Select name="status" value={status} onValueChange={setStatus}>
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
            <Select name="sort" value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent smallZ>
                <SelectItem value="--">--</SelectItem>
                <SelectItem value="createdAt,desc">createdAt,desc</SelectItem>
                <SelectItem value="createdAt,asc">createdAt,asc</SelectItem>
                <SelectItem value="user.firstName,asc">user.firstName,asc</SelectItem>
                <SelectItem value="user.firstName,desc">user.firstName,desc</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Apply & Reset Filters */}
          <div className="flex gap-2 w-full">
            <Button
              onClick={handleApplyFilters}
              disabled={loading}
              className="h-11 flex-1 rounded-xl bg-primary text-white hover:bg-primary/90 font-bold transition-all shadow-md"
            >
              {isAr ? "تطبيق الفلاتر" : "Apply Filters"}
            </Button>
            <Button
              onClick={() => {
                setSearch('');
                setStatus('all');
                setSort('createdAt,desc');
                setActiveSearch('');
                setActiveStatus('all');
                setActiveSort('createdAt,desc');
                setCurrentPage(1);
              }}
              variant="outline"
              className="h-11 px-3.5 rounded-xl border border-border hover:bg-slate-50 font-bold transition-all"
              title={isAr ? "إعادة ضبط" : "Reset"}
            >
              <RotateCcw className="size-5" />
            </Button>
          </div>
        </div>

        {/* Card Grid View */}
        <div className="overflow-hidden">
          {loading && secretaries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="size-10 animate-spin text-primary mb-3" />
              <p className="font-semibold text-lg">{t('loading', T)}</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-destructive font-bold text-lg">
              {error}
            </div>
          ) : secretaries.length > 0 ? (
            <div className={cn("relative transition-opacity duration-300", loading && "opacity-60 pointer-events-none")}>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/30 z-10 rounded-xl">
                  <Loader2 className="size-10 animate-spin text-primary" />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {secretaries.map((secretary, index) => {
                  const firstName = secretary.user?.firstName || '';
                  const surName = secretary.user?.surName || '';
                  const lastName = secretary.user?.lastName || '';
                  const fullName = `${firstName} ${surName} ${lastName}`.trim() || '---';
                  const initial = firstName[0] || 'S';

                  const dummyMatch = initialSecretaries.find(
                    (s) => s.email.toLowerCase() === secretary.user?.email?.toLowerCase()
                  );
                  const roleText = isAr
                    ? (dummyMatch?.role_ar ?? 'سكرتيرة')
                    : (dummyMatch?.role_en ?? 'Secretary');

                  return (
                    <div
                      key={secretary.uuid}
                      className="animate-fadeUp opacity-0"
                      style={{
                        animationDelay: `${(index + 1) * 80}ms`,
                        animationFillMode: 'forwards'
                      }}
                    >
                      <div data-slot="card" className="text-card-foreground flex flex-col gap-6 rounded-xl border duration-300 p-6 bg-white border-border shadow-md hover:shadow-lg transition-all">
                        <div className="flex flex-col h-full justify-between gap-4">
                          <div>
                            <div className="flex items-start gap-4 mb-4">
                              <span data-slot="avatar" className="relative flex size-10 shrink-0 overflow-hidden rounded-full w-16 h-16 border-2 border-secondary/20">
                                <span data-slot="avatar-fallback" className="flex size-full items-center justify-center rounded-full bg-secondary text-white text-xl">
                                  {initial}
                                </span>
                              </span>
                              <div className="flex-1">
                                <h3 className="text-lg mb-1" style={{ fontWeight: 600 }}>{fullName}</h3>
                                <p className="text-sm text-muted-foreground mb-2">{roleText}</p>
                                <Badge variant={getStatusVariant(secretary.user?.status)}>
                                  {getStatusText(secretary.user?.status)}
                                </Badge>
                              </div>
                            </div>
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="size-4 shrink-0" />
                                <span>{secretary.user?.phoneNumber || '---'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="size-4 shrink-0" />
                                <span className="line-clamp-1">{secretary.user?.email || '---'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenDialog('view', secretary.uuid)}
                              disabled={fetchingSecretaryDetail || deleting}
                              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 hover:border-primary/30 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 flex-1"
                            >
                              <Eye className={cn("size-4", isAr ? "ml-1" : "mr-1")} />
                              {t('view', T)}
                            </button>
                            <button
                              onClick={() => handleOpenDialog('edit', secretary.uuid)}
                              disabled={fetchingSecretaryDetail || deleting}
                              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 hover:border-primary/30 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 flex-1"
                            >
                              <SquarePen className={cn("size-4", isAr ? "ml-1" : "mr-1")} />
                              {t('edit', T)}
                            </button>
                            {secretary.user?.email === currentUser?.email ? (
                              <button
                                type="button"
                                onClick={() => window.showToast?.(isAr ? 'هذا أنت، لا يمكنك إلغاء تعيين نفسك' : 'That is you, you cannot unassign yourself', 'error')}
                                className="inline-flex items-center justify-center px-3 rounded-md bg-primary/10 text-primary text-xs font-bold whitespace-nowrap self-center h-8 hover:bg-primary/20 transition-colors"
                              >
                                {isAr ? "أنت" : "You"}
                              </button>
                            ) : secretary.user?.status !== 'INACTIVE' && canManageClinic ? (
                              <button
                                onClick={() => handleDeleteClick(secretary)}
                                disabled={fetchingSecretaryDetail || deleting}
                                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md border bg-background dark:bg-input/30 dark:border-input dark:hover:bg-input/50 hover:border-primary/30 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            ) : null}
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
                <EmptyShell
                  title={
                    isFiltering
                      ? (isAr ? "لا توجد نتائج مطابقة" : "No matching results found")
                      : t('no_secretaries', T)
                  }
                  description={
                    isFiltering
                      ? (isAr ? "لم نجد أي سكرتارية يطابقون فلاتر البحث الحالية. يرجى إعادة ضبط الفلاتر والمحاولة مرة أخرى." : "We couldn't find any secretaries matching your search filters. Please reset your filters and try again.")
                      : t('no_secretaries_desc', T)
                  }
                  buttonText={
                    isFiltering ? (
                      isAr ? "إعادة ضبط الفلاتر" : "Reset Filters"
                    ) : (
                      <>
                        <Plus className="size-5" />
                        {t('add_new_button', T)}
                      </>
                    )
                  }
                  onButtonClick={() => {
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
                />
              );
            })()
          )}
        </div>

        {/* Footer & Pagination */}
        {!loading && !error && secretaries.length > 0 && (
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
      <SecretaryDialog
        key={`${dialogMode}-${currentSecretary?.uuid || 'new'}`}
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
        message={t('delete_confirm_msg', T).replace('{name}', isAr ? `${secretaryToDelete?.user?.firstName || ''} ${secretaryToDelete?.user?.lastName || ''}` : `${secretaryToDelete?.user?.firstName || ''} ${secretaryToDelete?.user?.lastName || ''}`)}
        confirmText={t('delete', T)}
        cancelText={t('cancel', T)}
        variant="danger"
        isConfirmDisabled={deleting}
      />
    </div>
  )
}

export default SecretaryList
