import {
  Plus,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { DateFromTo } from '../../components/ui/DateFromTo';
import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePreloader } from '../../contexts/PreloaderContext';

import { useBroadcast } from '../../hooks/useBroadcast';
import { cn } from '../../utils/cn';
import TableFooter from '../../components/ui/TableFooter';
import EmptyShell from '../../components/ui/EmptyShell';
import { Badge } from '../../components/ui/badge';
import ScrollLockWrapper from '../../components/ui/ScrollLockWrapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"


import { fetchSupportTickets } from '../../api/supportTicketApi';
import type { ApiSupportTicket } from '../../api/supportTicketApi';
import { BiSupport } from 'react-icons/bi';

const SupportTicketsList = () => {
  const { isAr } = useLanguage();
  const { isLoaded, isExiting } = usePreloader();
  const canAnimate = isLoaded && !isExiting;

  // State Management
  const [tickets, setTickets] = useState<ApiSupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // const getLocalDateString = (d: Date) => {
  //   const year = d.getFullYear();
  //   const month = String(d.getMonth() + 1).padStart(2, '0');
  //   const day = String(d.getDate()).padStart(2, '0');
  //   return `${year}-${month}-${day}`;
  // };

  // const today = new Date();
  // const yesterday = new Date();
  // yesterday.setDate(yesterday.getDate() - 1);

  // const defaultToDate = getLocalDateString(today);
  // const defaultFromDate = getLocalDateString(yesterday);

  // Local Filter Input States
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sort, setSort] = useState('createdAt,desc');

  // Active Filter States (applied on Confirm)
  const [activeStatus, setActiveStatus] = useState('');
  const [activePriority, setActivePriority] = useState('');
  const [activeFromDate, setActiveFromDate] = useState("");
  const [activeToDate, setActiveToDate] = useState("");
  const [activeSort, setActiveSort] = useState('createdAt,desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);



  // Load support tickets from API
  const loadTickets = async () => {
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
    } catch (err: unknown) {
      console.error(err);
      setError(isAr ? 'فشل تحميل تذاكر الدعم' : 'Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  useBroadcast((event) => {
    if (event.type === 'DATA_UPDATE' && event.module === 'support-tickets') {
      loadTickets();
    }
  });

  useEffect(() => {
    loadTickets();
  }, [currentPage, pageSize, activeStatus, activePriority, activeFromDate, activeToDate, activeSort, isAr]);

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
    window.dispatchEvent(new CustomEvent('OPEN_SUPPORT_TICKET_MODAL'));
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
            disabled={loading}
          >
            <Plus className={cn("size-4", isAr ? "ml-2" : "mr-2")} />
            {isAr ? 'إضافة تقرير جديد' : 'Add New Report'}
          </Button>
        </header>

        {/* Filters and List Card */}
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
                  <div className="divide-y divide-border/50 bg-white border border-border rounded-xl">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.uuid}
                        className={cn(
                          "p-6 transition-colors hover:bg-muted/30 flex flex-col md:flex-row md:items-start justify-start gap-4 relative",
                          ticket.status === 'OPEN' ? 'bg-primary/5' : ''
                        )}
                      >
                        {/* Left Col: Avatar */}
                        <div className="shrink-0 mt-1">
                          <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center",
                            ticket.status === 'OPEN' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                          )}>
                            <BiSupport className="size-6" />
                          </div>
                        </div>

                        {/* Right Col: Info */}
                        <div className="space-y-3 flex-1 w-full min-w-0">
                          
                          {/* Header Block & Badges */}
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-foreground text-lg">{ticket.ticketNumber}</h3>
                              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider bg-muted/50 w-fit px-2 py-0.5 rounded-md">
                                {getSectionLabel(ticket.section)}
                              </span>
                              {ticket.clinicName && (
                                <span className="text-xs text-muted-foreground font-semibold">• {ticket.clinicName}</span>
                              )}
                              {ticket.reportedBy && (
                                <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 ml-1">
                                  • <span className="font-bold text-foreground">{ticket.reportedBy}</span>
                                </span>
                              )}
                            </div>

                            {/* Badges: Status and Priority Side by Side */}
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                ticket.status === 'OPEN' ? 'green' : 
                                ticket.status === 'IN_PROGRESS' ? 'yellow' : 
                                ticket.status === 'RESOLVED' ? 'blue' : 'purple'
                              }>
                                {ticket.status}
                              </Badge>

                              <Badge variant={
                                ticket.priority === 'URGENT' ? 'red' :
                                ticket.priority === 'HIGH' ? 'yellow' :
                                ticket.priority === 'MEDIUM' ? 'blue' :
                                'purple'
                              } className={ticket.priority === 'URGENT' ? 'animate-pulse' : ''}>
                                {ticket.priority || (isAr ? 'غير محدد' : 'N/A')}
                              </Badge>
                            </div>
                          </div>

                          {/* Description Block (in a frame like Support Notes) */}
                          <div className="mt-2">
                            <span className="text-xs font-bold text-foreground/70 mb-1.5 block">
                              {isAr ? "تفاصيل المشكلة:" : "Issue Description:"}
                            </span>
                            <ScrollLockWrapper className="w-full max-w-3xl p-4 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 text-primary text-sm font-medium leading-relaxed wrap-break-word shadow-sm max-h-[300px] xs:max-h-[450px] overflow-y-auto">
                              {ticket.description}
                            </ScrollLockWrapper>
                          </div>

                          {/* Support Notes (Dashed & Primary) */}
                          <div className="mt-4 pt-2">
                            <span className="text-xs font-bold text-primary mb-1.5 block">
                              {isAr ? "ملاحظات الدعم:" : "Support Notes:"}
                            </span>
                            <div className={cn(
                              "w-full max-w-3xl p-4 rounded-xl border-2 border-dashed text-sm font-medium leading-relaxed overflow-hidden wrap-break-word shadow-sm",
                              ticket.notes
                                ? "border-primary/40 bg-primary/5 text-primary"
                                : "border-border/50 bg-muted/30 text-muted-foreground italic"
                            )}>
                              {ticket.notes || (isAr ? "لا توجد ملاحظات." : "No notes yet.")}
                            </div>
                          </div>

                          {/* Meta Info Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-2 gap-x-4 mt-3 pt-3 border-t border-border/50">
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <span>{isAr ? "المسؤول:" : "Assigned To:"}</span>
                              <span className="font-bold text-foreground">{ticket.assignedTo || "---"}</span>
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <span>{isAr ? "تم الإنشاء:" : "Created:"}</span>
                              <span className="font-bold text-foreground">{new Date(ticket.createdAt).toLocaleString(isAr ? 'ar-EG' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </p>
                            {ticket.updatedAt && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <span>{isAr ? "آخر تحديث:" : "Updated:"}</span>
                                <span className="font-bold text-foreground">{new Date(ticket.updatedAt).toLocaleString(isAr ? 'ar-EG' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                              </p>
                            )}
                            {ticket.resolvedAt && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <span>{isAr ? "تم الحل في:" : "Resolved:"}</span>
                                <span className="font-bold text-foreground">{new Date(ticket.resolvedAt).toLocaleString(isAr ? 'ar-EG' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                              </p>
                            )}
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
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
              <TableFooter
                variant="table"
                className="bg-transparent shadow-none border-none border-t border-border pt-4 mt-2 px-0"
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
            )}
          </article>
      </div>

    </section>
  );
};

export default SupportTicketsList;
