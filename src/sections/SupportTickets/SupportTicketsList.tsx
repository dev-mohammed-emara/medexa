import {
  Plus,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { DateFromTo } from '../../components/ui/DateFromTo';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePreloader } from '../../contexts/PreloaderContext';
import { useBroadcast } from '../../hooks/useBroadcast';
import { cn } from '../../utils/cn';
import TableFooter from '../../components/ui/TableFooter';
import Modal from '../../components/ui/Modal';
import EmptyShell from '../../components/ui/EmptyShell';
import { getCookie } from '../../utils/cookie';
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

import { fetchSupportTickets } from '../../api/supportTicketApi';
import type { ApiSupportTicket } from '../../api/supportTicketApi';

const SupportTicketsList = () => {
  const { isAr } = useLanguage();
  const { isLoaded, isExiting } = usePreloader();
  const canAnimate = isLoaded && !isExiting;

  // State Management
  const [tickets, setTickets] = useState<ApiSupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getLocalDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const defaultToDate = getLocalDateString(today);
  const defaultFromDate = getLocalDateString(yesterday);

  // Local Filter Input States
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(defaultToDate);
  const [sort, setSort] = useState('createdAt,desc');

  // Active Filter States (applied on Confirm)
  const [activeStatus, setActiveStatus] = useState('');
  const [activePriority, setActivePriority] = useState('');
  const [activeFromDate, setActiveFromDate] = useState(defaultFromDate);
  const [activeToDate, setActiveToDate] = useState(defaultToDate);
  const [activeSort, setActiveSort] = useState('createdAt,desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modal State for Add New Report
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSection, setModalSection] = useState('dashboard_page');
  const [modalDescription, setModalDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { broadcast } = useBroadcast((event) => {
    if (event.type === 'DATA_UPDATE' && event.module === 'support-tickets') {
      loadTickets();
    }
  });

  // Load support tickets from API
  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSupportTickets({
        page: currentPage - 1, // API is 0-indexed
        size: pageSize,
        status: activeStatus,
        priority: activePriority,
        fromDate: activeFromDate || undefined,
        toDate: activeToDate || undefined,
        sort: activeSort !== '--' ? activeSort : undefined
      });
      setTickets(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err: any) {
      console.error(err);
      setError(isAr ? 'فشل تحميل تذاكر الدعم' : 'Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, activeStatus, activePriority, activeFromDate, activeToDate, activeSort, isAr]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleApplyFilters = () => {
    setActiveStatus(status);
    setActivePriority(priority);
    setActiveFromDate(fromDate);
    setActiveToDate(toDate);
    setActiveSort(sort);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setStatus('');
    setPriority('');
    setFromDate('');
    setToDate('');
    setSort('createdAt,desc');
    setActiveStatus('');
    setActivePriority('');
    setActiveFromDate('');
    setActiveToDate('');
    setActiveSort('createdAt,desc');
    setCurrentPage(1);
  };

  const handleOpenAddModal = () => {
    setModalSection('dashboard_page');
    setModalDescription('');
    setIsModalOpen(true);
  };

  const handleConfirmAddTicket = async () => {
    if (!modalDescription.trim()) return;
    setIsSubmitting(true);
    try {
      const token = getCookie('token');
      const response = await fetch('/api/support-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          section: modalSection,
          description: modalDescription
        })
      });

      if (response.ok) {
        window.showToast?.(isAr ? 'تم إرسال التذكرة بنجاح!' : 'Ticket submitted successfully!', 'success');
        setIsModalOpen(false);
        setModalDescription('');
        loadTickets();
        broadcast({ type: 'DATA_UPDATE', module: 'support-tickets' });
      } else {
        let errMsg = 'Failed to submit support ticket';
        try {
          const errData = await response.json();
          errMsg = errData.message || errData.error || errMsg;
        } catch (e) { }
        window.showToast?.(errMsg, 'error');
      }
    } catch (error: any) {
      console.error('Error submitting support ticket:', error);
      window.showToast?.(error.message || 'Error communicating with server', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSectionLabel = (val: string) => {
    const sections: Record<string, string> = {
      dashboard_page: isAr ? 'لوحة التحكم' : 'Dashboard',
      doctor_page: isAr ? 'الأطباء' : 'Doctors',
      patient_page: isAr ? 'المرضى' : 'Patients',
      secretary_page: isAr ? 'السكرتاريا' : 'Secretaries',
      appointment_page: isAr ? 'المواعيد' : 'Appointments',
      medical_record_page: isAr ? 'السجلات الطبية' : 'Medical Records',
      finance_page: isAr ? 'المالية' : 'Finance',
      profile_page: isAr ? 'الملف الشخصي' : 'Profile',
      settings_page: isAr ? 'الإعدادات' : 'Settings',
    };
    return sections[val] || val;
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
            <h1 className="text-3xl mb-1 font-bold">{isAr ? 'تذاكر الدعم الفني' : 'Support Tickets'}</h1>
            <p className="text-muted-foreground">{isAr ? 'عرض وإدارة تذاكر الدعم الفني الخاصة بالعيادة' : 'View and manage support tickets for the clinic'}</p>
          </div>
          <Button
            onClick={handleOpenAddModal}
            className="h-10 px-6 rounded-xl"
            disabled={loading || isSubmitting}
          >
            <Plus className={cn("size-4", isAr ? "ml-2" : "mr-2")} />
            {isAr ? 'إضافة تقرير جديد' : 'Add New Report'}
          </Button>
        </header>

        {/* Filters and Table Card */}
        <article
          className={cn(
            "text-card-foreground flex flex-col bg-transparent border-none shadow-none opacity-0 overflow-hidden",
            canAnimate && "animate-fadeUp animate-delay-200"
          )}
        >
          {/* Header Filters */}
          <div className="p-6 pb-4 bg-white rounded-xl border border-border shadow-md mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
              {/* From & To Date Range */}
              <DateFromTo
                fromDate={fromDate}
                toDate={toDate}
                onFromDateChange={setFromDate}
                onToDateChange={setToDate}
                showApply={false}
                onApply={handleApplyFilters}
                className="col-span-1 sm:col-span-2"
              />

              {/* Status */}
              <div className="text-start">
                <label className="text-xs text-muted-foreground mb-2 block font-medium">
                  {isAr ? "الحالة" : "Status"}
                </label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue placeholder={isAr ? "كل الحالات" : "All Statuses"} />
                  </SelectTrigger>
                  <SelectContent smallZ>
                    <SelectItem value="--">{isAr ? "كل الحالات" : "All Statuses"}</SelectItem>
                    <SelectItem value="OPEN">OPEN</SelectItem>
                    <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                    <SelectItem value="RESOLVED">RESOLVED</SelectItem>
                    <SelectItem value="CLOSED">CLOSED</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="text-start">
                <label className="text-xs text-muted-foreground mb-2 block font-medium">
                  {isAr ? "الأولوية" : "Priority"}
                </label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue placeholder={isAr ? "كل الأولويات" : "All Priorities"} />
                  </SelectTrigger>
                  <SelectContent smallZ>
                    <SelectItem value="--">{isAr ? "كل الأولويات" : "All Priorities"}</SelectItem>
                    <SelectItem value="LOW">LOW</SelectItem>
                    <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                    <SelectItem value="HIGH">HIGH</SelectItem>
                    <SelectItem value="URGENT">URGENT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Filter */}
              <div className="text-start">
                <label className="text-xs text-muted-foreground mb-2 block font-medium">
                  {isAr ? "ترتيب حسب" : "Sort By"}
                </label>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue placeholder={isAr ? "ترتيب حسب" : "Sort By"} />
                  </SelectTrigger>
                  <SelectContent smallZ>
                    <SelectItem value="createdAt,desc">{isAr ? "الأحدث أولاً" : "Newest First"}</SelectItem>
                    <SelectItem value="createdAt,asc">{isAr ? "الأقدم أولاً" : "Oldest First"}</SelectItem>
                    <SelectItem value="status,asc">{isAr ? "الحالة تصاعدي" : "Status Asc"}</SelectItem>
                    <SelectItem value="status,desc">{isAr ? "الحالة تنازلي" : "Status Desc"}</SelectItem>
                    <SelectItem value="priority,asc">{isAr ? "الأولوية تصاعدي" : "Priority Asc"}</SelectItem>
                    <SelectItem value="priority,desc">{isAr ? "الأولوية تنازلي" : "Priority Desc"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="h-10 px-3.5 rounded-xl border border-border hover:bg-slate-50 font-bold"
                title={isAr ? "إعادة ضبط" : "Reset"}
              >
                <RotateCcw className="size-5" />
              </Button>
              <Button
                onClick={handleApplyFilters}
                disabled={loading}
                className="h-10 px-6 rounded-xl bg-primary text-white font-bold"
              >
                {isAr ? "تطبيق الفلاتر" : "Apply Filters"}
              </Button>
            </div>
          </div>

          <section className="overflow-x-auto bg-white rounded-xl border border-border shadow-md">
            {loading && tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="size-10 animate-spin text-primary mb-3" />
                <p className="font-semibold text-lg">{isAr ? "جاري التحميل..." : "Loading..."}</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 text-destructive font-bold text-lg">
                {error}
              </div>
            ) : tickets.length > 0 ? (
              <div className={cn("relative transition-opacity duration-300", loading && "opacity-60 pointer-events-none")}>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/30 z-10 rounded-xl">
                    <Loader2 className="size-10 animate-spin text-primary" />
                  </div>
                )}
                <Table className="w-full text-sm">
                  <TableHeader className="bg-muted/30 border-b">
                    <TableRow className="text-start">
                      <TableHead className={cn("text-foreground h-12 px-4 align-middle font-bold whitespace-nowrap", isAr ? "text-right" : "text-left")}>{isAr ? 'رقم التذكرة' : 'Ticket Number'}</TableHead>
                      <TableHead className={cn("text-foreground h-12 px-4 align-middle font-bold whitespace-nowrap", isAr ? "text-right" : "text-left")}>{isAr ? 'الصفحة المعنية' : 'Section'}</TableHead>
                      <TableHead className={cn("text-foreground h-12 px-4 align-middle font-bold whitespace-nowrap", isAr ? "text-right" : "text-left")}>{isAr ? 'المشكلة' : 'Description'}</TableHead>
                      <TableHead className={cn("text-foreground h-12 px-4 align-middle font-bold whitespace-nowrap", isAr ? "text-right" : "text-left")}>{isAr ? 'الحالة' : 'Status'}</TableHead>
                      <TableHead className={cn("text-foreground h-12 px-4 align-middle font-bold whitespace-nowrap", isAr ? "text-right" : "text-left")}>{isAr ? 'الأولوية' : 'Priority'}</TableHead>
                      <TableHead className={cn("text-foreground h-12 px-4 align-middle font-bold whitespace-nowrap", isAr ? "text-right" : "text-left")}>{isAr ? 'مسندة إلى' : 'Assigned To'}</TableHead>
                      <TableHead className={cn("text-foreground h-12 px-4 align-middle font-bold whitespace-nowrap", isAr ? "text-right" : "text-left")}>{isAr ? 'الملاحظات' : 'Notes'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/30">
                    {tickets.map((ticket) => {
                      return (
                        <TableRow
                          key={ticket.uuid}
                          className="hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className={cn("p-4 align-middle whitespace-nowrap font-bold text-[#0B5A8E]", isAr ? "text-right" : "text-left")}>
                            {ticket.ticketNumber}
                          </TableCell>
                          <TableCell className={cn("p-4 align-middle whitespace-nowrap", isAr ? "text-right" : "text-left")}>
                            <span className="font-semibold text-foreground/80">{getSectionLabel(ticket.section)}</span>
                          </TableCell>
                          <TableCell className={cn("p-4 align-middle text-muted-foreground text-start whitespace-normal break-words max-w-[300px] min-w-[150px]")}>
                            {ticket.description}
                          </TableCell>
                          <TableCell className={cn("p-4 align-middle whitespace-nowrap", isAr ? "text-right" : "text-left")}>
                            <span className={cn(
                              "inline-flex items-center justify-center rounded-md border px-2.5 py-0.5 text-xs font-bold w-fit",
                              ticket.status === 'OPEN' && "bg-blue-100 text-blue-800 border-blue-200",
                              ticket.status === 'IN_PROGRESS' && "bg-yellow-100 text-yellow-800 border-yellow-200",
                              ticket.status === 'RESOLVED' && "bg-green-100 text-green-800 border-green-200",
                              ticket.status === 'CLOSED' && "bg-slate-100 text-slate-800 border-slate-200",
                            )}>
                              {ticket.status}
                            </span>
                          </TableCell>
                          <TableCell className={cn("p-4 align-middle whitespace-nowrap", isAr ? "text-right" : "text-left")}>
                            <span className={cn(
                              "inline-flex items-center justify-center rounded-md border px-2.5 py-0.5 text-xs font-bold w-fit",
                              ticket.priority === 'LOW' && "bg-slate-100 text-slate-800 border-slate-200",
                              ticket.priority === 'MEDIUM' && "bg-blue-100 text-blue-800 border-blue-200",
                              ticket.priority === 'HIGH' && "bg-orange-100 text-orange-800 border-orange-200",
                              ticket.priority === 'URGENT' && "bg-red-100 text-red-800 border-red-200",
                            )}>
                              {ticket.priority}
                            </span>
                          </TableCell>
                          <TableCell className={cn("p-4 align-middle whitespace-nowrap font-medium text-foreground/80", isAr ? "text-right" : "text-left")}>
                            {ticket.assignedTo || '---'}
                          </TableCell>
                          <TableCell className={cn("p-4 align-middle text-start", isAr ? "text-right" : "text-left")}>
                            <textarea
                              readOnly
                              value={ticket.notes || (isAr ? "لا توجد ملاحظات مضافة للتذكرة" : "no notes from response")}
                              className="w-full min-w-[200px] h-12 p-2 rounded-lg border border-border bg-slate-50 font-medium text-xs resize-none outline-none text-muted-foreground focus:ring-0 cursor-not-allowed"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
            (() => {
              const isFiltering = activeStatus !== '' || activePriority !== '' || activeFromDate !== '' || activeToDate !== '' || activeSort !== 'createdAt,desc';
              return (
                <EmptyShell
                  title={
                    isFiltering
                      ? (isAr ? "لا توجد نتائج مطابقة" : "No matching results found")
                      : (isAr ? "لا توجد تذاكر دعم حالياً" : "No support tickets found")
                  }
                  description={
                    isFiltering
                      ? (isAr ? "لم نجد أي تذاكر دعم تطابق فلاتر البحث الحالية. يرجى إعادة ضبط الفلاتر والمحاولة مرة أخرى." : "We couldn't find any support tickets matching your search filters. Please reset your filters and try again.")
                      : (isAr ? "لم تقم بإنشاء أي تذاكر دعم فني بعد." : "You haven't submitted any support tickets yet.")
                  }
                  buttonText={
                    isFiltering ? (
                      isAr ? "إعادة ضبط الفلاتر" : "Reset Filters"
                    ) : (
                      <>
                        <Plus className="size-5" />
                        {isAr ? 'إضافة تقرير جديد' : 'Add New Report'}
                      </>
                    )
                  }
                  onButtonClick={() => {
                    if (isFiltering) {
                      handleResetFilters();
                    } else {
                      handleOpenAddModal();
                    }
                  }}
                />
              );
            })()
            )}
          </section>

          {/* Table Footer with Pagination & Page Size */}
          {!loading && !error && tickets.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-transparent pt-4 mt-2">
              <span className="text-sm text-muted-foreground font-bold">
                {isAr ? "إجمالي السجلات:" : "Total Records:"} <span className="font-black text-foreground ml-1">{totalElements}</span>
              </span>
              <TableFooter
                variant="table"
                className="bg-transparent shadow-none border-none p-0 pb-4 mt-0"
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
        </article>
      </div>

      {/* Support Ticket Modal (Yellow warning variant with drop-down page selection) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalDescription('');
        }}
        onConfirm={handleConfirmAddTicket}
        title={isAr ? 'إرسال تذكرة دعم' : 'Submit Support Ticket'}
        message={isAr ? 'يرجى اختيار الصفحة ووصف المشكلة بالتفصيل لمساعدتنا في حلها.' : 'Please choose the page and describe the issue in detail to help us resolve it.'}
        confirmText={isAr ? 'إرسال' : 'Submit'}
        cancelText={isAr ? 'إلغاء' : 'Cancel'}
        variant="warning"
        isConfirmDisabled={!modalDescription.trim() || isSubmitting}
      >
        <div className="space-y-4 py-2 flex flex-col w-full text-start" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="space-y-2 w-full">
            <label className="text-xs font-bold text-foreground/70 block">
              {isAr ? 'الصفحة المعنية' : 'Related Page'} <span className="text-destructive">*</span>
            </label>
            <Select value={modalSection} onValueChange={setModalSection}>
              <SelectTrigger className="w-full h-12 rounded-xl bg-white border border-border text-start">
                <SelectValue placeholder={isAr ? 'الصفحة المعنية' : 'Related Page'} />
              </SelectTrigger>
              <SelectContent smallZ className="z-[700]">
                <SelectItem value="dashboard_page">{isAr ? 'لوحة التحكم' : 'Dashboard'}</SelectItem>
                <SelectItem value="doctor_page">{isAr ? 'الأطباء' : 'Doctors'}</SelectItem>
                <SelectItem value="patient_page">{isAr ? 'المرضى' : 'Patients'}</SelectItem>
                <SelectItem value="secretary_page">{isAr ? 'السكرتاريا' : 'Secretaries'}</SelectItem>
                <SelectItem value="appointment_page">{isAr ? 'المواعيد' : 'Appointments'}</SelectItem>
                <SelectItem value="medical_record_page">{isAr ? 'السجلات الطبية' : 'Medical Records'}</SelectItem>
                <SelectItem value="finance_page">{isAr ? 'المالية' : 'Finance'}</SelectItem>
                <SelectItem value="profile_page">{isAr ? 'الملف الشخصي' : 'Profile'}</SelectItem>
                <SelectItem value="settings_page">{isAr ? 'الإعدادات' : 'Settings'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 w-full text-start">
            <label className="text-xs font-bold text-foreground/70 block">
              {isAr ? 'صف المشكلة' : 'Issue Description'} <span className="text-destructive">*</span>
            </label>
            <textarea
              value={modalDescription}
              onChange={(e) => setModalDescription(e.target.value)}
              placeholder={isAr ? 'اكتب تفاصيل المشكلة هنا...' : 'Type issue details here...'}
              className="w-full min-h-[120px] p-4 rounded-xl border border-border bg-muted/20 focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 transition-all outline-none font-semibold text-sm resize-none text-foreground placeholder:text-muted-foreground/60"
              dir={isAr ? 'rtl' : 'ltr'}
            />
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default SupportTicketsList;
