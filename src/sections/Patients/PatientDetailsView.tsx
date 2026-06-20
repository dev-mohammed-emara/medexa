import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { fetchPatientByUuid } from '../../api/patientApi';
import type { ApiPatient } from '../../api/patientApi';
import { getCookie } from '../../utils/cookie';
import { Printer, ArrowLeft, ArrowRight, Phone, MapPin, Calendar, Activity, ChevronDown, Stethoscope, FileImage, Pill, FlaskConical, FileText, RotateCcw } from 'lucide-react';
import { FaCalendarAlt, FaTransgender } from 'react-icons/fa';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';
import DateFromTo from '../../components/ui/DateFromTo';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

import EmptyShell from '../../components/ui/EmptyShell';
import TableFooter from '../../components/ui/TableFooter';
import { format } from 'date-fns';

const PatientDetailsView = () => {
  useParams<{ name: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const uuid = location.state?.uuid as string | undefined;

  const { isAr, dir } = useLanguage();
  const { hasPermission } = useAuth();

  const [patient, setPatient] = useState<ApiPatient | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const [openId, setOpenId] = useState<string | null>(null);

  const toggleRecord = (recordUuid: string) => {
    setOpenId(openId === recordUuid ? null : recordUuid);
  };

  const [isLoadingPatient, setIsLoadingPatient] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);

  // Filters
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [sort, setSort] = useState<string>("createdAt,desc");
  const [tempFromDate, setTempFromDate] = useState<string>("");
  const [tempToDate, setTempToDate] = useState<string>("");
  const [tempSort, setTempSort] = useState<string>("createdAt,desc");

  const loadData = useCallback(async () => {
    if (!uuid) {
      navigate('/patients');
      return;
    }

    setIsLoadingPatient(true);
    setIsLoadingRecords(true);

    try {
      // Fetch both simultaneously
      const queryParams = new URLSearchParams();
      queryParams.append('patientUuid', uuid);
      queryParams.append('page', String(currentPage - 1));
      queryParams.append('size', String(itemsPerPage));
      queryParams.append('sort', sort);
      if (fromDate) queryParams.append('fromDate', fromDate);
      if (toDate) queryParams.append('toDate', toDate);

      const promises: Promise<any>[] = [fetchPatientByUuid(uuid)];
      
      if (hasPermission('MANAGE_MEDICAL_RECORDS')) {
        promises.push(
          fetch(`/api/medical-records?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${getCookie('token')}`
            }
          }).then(res => {
            if (!res.ok) throw new Error('Failed to fetch records');
            return res.json();
          })
        );
      }

      const results = await Promise.allSettled(promises);
      const patientRes = results[0];

      if (patientRes.status === 'fulfilled') {
        setPatient(patientRes.value);
      } else {
        window.showToast?.('Failed to load patient detail', 'error');
      }

      if (hasPermission('MANAGE_MEDICAL_RECORDS') && results[1]) {
        const recordsRes = results[1] as PromiseSettledResult<any>;
        if (recordsRes.status === 'fulfilled') {
          setRecords(recordsRes.value.content || []);
          setTotalElements(recordsRes.value.totalElements || 0);
          setTotalPages(Math.ceil((recordsRes.value.totalElements || 0) / itemsPerPage) || 1);
        } else {
          console.error('Failed to load records:', recordsRes.reason);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoadingPatient(false);
      setIsLoadingRecords(false);
    }
  }, [uuid, currentPage, itemsPerPage, sort, fromDate, toDate, navigate, hasPermission]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApplyFilters = () => {
    setFromDate(tempFromDate);
    setToDate(tempToDate);
    setSort(tempSort);
    setCurrentPage(1);
  };

  const calculateAge = (dobString: string | null | undefined) => {
    if (!dobString) return '-';
    const dob = new Date(dobString);
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  };

  const handlePrintPatient = () => {
    if (!patient) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html dir="${dir}">
        <head>
          <title>${isAr ? 'بيانات المريض' : 'Patient Details'} - ${patient.firstName} ${patient.lastName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Outfit:wght@400;600;700&display=swap');
            body {
              font-family: ${isAr ? "'Cairo', sans-serif" : "'Outfit', sans-serif"};
              padding: 40px;
              color: #1a2b3c;
            }
            .header {
              border-bottom: 2px solid #0B5A8E;
              padding-bottom: 20px;
              margin-bottom: 30px;
              text-align: center;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              color: #0B5A8E;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .info-item {
              padding: 15px;
              background: #f8fafc;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }
            .label { font-weight: bold; color: #4a5568; margin-bottom: 5px; display: block; }
            .value { font-size: 16px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">MEDEXA - ${isAr ? 'بيانات المريض' : 'Patient Details'}</div>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="label">${isAr ? 'الاسم الأول' : 'First Name'}</span>
              <span class="value">${patient.firstName || '-'}</span>
            </div>
            <div class="info-item">
              <span class="label">${isAr ? 'الاسم الأخير' : 'Last Name'}</span>
              <span class="value">${patient.lastName || '-'}</span>
            </div>
            <div class="info-item">
              <span class="label">${isAr ? 'رقم الهاتف' : 'Phone'}</span>
              <span class="value" dir="ltr" style="text-align: ${isAr ? 'right' : 'left'}">${patient.phoneNumber || '-'}</span>
            </div>
            <div class="info-item">
              <span class="label">${isAr ? 'الجنس' : 'Gender'}</span>
              <span class="value">${patient.gender === 'MALE' ? (isAr ? 'ذكر' : 'Male') : patient.gender === 'FEMALE' ? (isAr ? 'أنثى' : 'Female') : '-'}</span>
            </div>
            <div class="info-item">
              <span class="label">${isAr ? 'تاريخ الميلاد' : 'Date of Birth'}</span>
              <span class="value">${patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'dd/MM/yyyy') : '-'} (${calculateAge(patient.dateOfBirth)} ${isAr ? 'سنة' : 'years'})</span>
            </div>
          </div>
          
          <div class="info-item">
            <span class="label">${isAr ? 'ملاحظات طبية' : 'Medical Notes'}</span>
            <span class="value">${patient.note || '-'}</span>
          </div>

          <div class="info-item" style="margin-top: 20px;">
            <span class="label">${isAr ? 'العنوان' : 'Address'}</span>
            <span class="value">${patient.address || '-'}</span>
          </div>
          <script>
            window.onload = () => window.print();
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handlePrintRecord = (record: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html dir="${dir}">
        <head>
          <title>${isAr ? 'السجل الطبي' : 'Medical Record'} - ${patient?.firstName || ''}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Outfit:wght@400;600;700&display=swap');
            body {
              font-family: ${isAr ? "'Cairo', sans-serif" : "'Outfit', sans-serif"};
              padding: 40px;
              color: #1a2b3c;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #0B5A8E;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo-text { font-size: 26px; font-weight: bold; color: #0B5A8E; }
            .title { font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 30px; color: #0B5A8E; }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              background-color: #f8fafc;
              padding: 20px;
              border-radius: 12px;
              margin-bottom: 30px;
              border: 1px solid #e2e8f0;
            }
            .info-item span { font-weight: bold; color: #4a5568; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 16px; font-weight: bold; color: #0B5A8E; border-bottom: 1px solid #edf2f7; padding-bottom: 8px; margin-bottom: 12px; }
            .section-content { font-size: 14px; line-height: 1.6; background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #edf2f7; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-text">MEDEXA</div>
            <div><strong>${isAr ? 'التاريخ:' : 'Date:'}</strong> ${new Date(record.createdAt).toLocaleDateString(isAr ? 'ar-JO' : 'en-US')}</div>
          </div>
          <div class="title">${isAr ? 'تقرير السجل الطبي' : 'Medical Record Report'}</div>
          
          <div class="info-grid">
            <div class="info-item"><span>${isAr ? 'اسم المريض:' : 'Patient Name:'}</span> ${patient?.firstName || ''} ${patient?.lastName || ''}</div>
            <div class="info-item"><span>${isAr ? 'الطبيب المعالج:' : 'Treating Doctor:'}</span> ${record.doctorName || '-'}</div>
            <div class="info-item"><span>${isAr ? 'تاريخ السجل:' : 'Created At:'}</span> ${new Date(record.createdAt).toLocaleDateString(isAr ? 'ar-JO' : 'en-US')}</div>
          </div>

          <div class="section">
            <div class="section-title">${isAr ? 'وصف الحالة (الأعراض):' : 'Case Description / Symptoms:'}</div>
            <div class="section-content">${record.caseDescription || '-'}</div>
          </div>
          <div class="section">
            <div class="section-title">${isAr ? 'التشخيص:' : 'Diagnosis:'}</div>
            <div class="section-content">${record.diagnosis || '-'}</div>
          </div>
          <div class="section">
            <div class="section-title">${isAr ? 'خطة العلاج:' : 'Treatment Plan:'}</div>
            <div class="section-content">${record.treatmentPlan || '-'}</div>
          </div>
          <div class="section">
            <div class="section-title">${isAr ? 'ملاحظات الطبيب:' : 'Doctor Notes:'}</div>
            <div class="section-content">${record.note || '-'}</div>
          </div>
          <script>
            window.onload = () => window.print();
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (isLoadingPatient) {
    return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!patient) {
    return <div className="p-8 text-center text-muted-foreground">{isAr ? 'لم يتم العثور على المريض' : 'Patient not found'}</div>;
  }

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center flex-wrap gap-4 justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/patients')} className="rounded-xl min-w-10 h-10 w-10">
            {isAr ? <ArrowRight className="size-5" /> : <ArrowLeft className="size-5" />}
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{patient.firstName} {patient.surName} {patient.lastName}</h1>
            <p className="text-muted-foreground text-sm">{isAr ? 'تفاصيل المريض والسجل الطبي' : 'Patient details and medical history'}</p>
          </div>
        </div>
        <Button onClick={handlePrintPatient} className="rounded-xl h-10 px-4 gap-2">
          <Printer className="size-4" />
          {isAr ? 'طباعة البيانات' : 'Print Details'}
        </Button>
      </div>

      {/* Patient Profile Header Card */}
      <div
        className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden relative animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
        style={{ animationDelay: '100ms' }}
      >
        {/* Banner */}

        <div className="p-6 md:p-8 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 max-sm:text-center items-center">
            {/* Avatar Profile */}
            <div className="w-32 h-32 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 border-4 border-white">
              <span className="text-white font-bold text-6xl">
                {patient.firstName?.charAt(0)?.toUpperCase()}
              </span>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4">{patient.firstName} {patient.surName} {patient.lastName}</h2>
                <div className="flex flex-wrap max-sm:justify-center items-center gap-3 text-sm font-medium text-muted-foreground">
                  <span className="inline-flex max-sm:justify-center items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600">
                    <Phone className="size-4" />
                    <span dir="ltr">{patient.phoneNumber || '-'}</span>
                  </span>
                  <span className="inline-flex max-sm:justify-center items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                    <FaTransgender className="size-4" />
                    {patient.gender === 'MALE' ? (isAr ? 'ذكر' : 'Male') : patient.gender === 'FEMALE' ? (isAr ? 'أنثى' : 'Female') : '-'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600">
                    <Calendar className="size-4" />
                    {calculateAge(patient.dateOfBirth)} {isAr ? 'سنة' : 'years'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap max-sm:justify-center gap-x-8 gap-y-3 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                    <MapPin className="size-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{isAr ? 'العنوان' : 'Address'}</p>
                    <p className="font-semibold text-sm line-clamp-1" title={patient.address || ''}>{patient.address || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Activity className="size-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{isAr ? 'تاريخ الميلاد' : 'Date of Birth'}</p>
                    <p className="font-semibold text-sm">{patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'dd/MM/yyyy') : '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {patient.note && (
            <div className="mt-8 p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
              <p className="text-xs text-amber-600/80 font-bold mb-2 uppercase tracking-widest">{isAr ? 'ملاحظات طبية' : 'Medical Notes'}</p>
              <p className="text-sm text-foreground/80 leading-relaxed font-medium">{patient.note}</p>
            </div>
          )}
        </div>
      </div>

      {/* Filters Section */}
      {hasPermission('MANAGE_MEDICAL_RECORDS') && (
        <div
          className={cn("flex flex-wrap items-end gap-3 bg-white p-5 rounded-2xl border border-border w-full shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both")}
          style={{ animationDelay: '200ms' }}
        >
          <DateFromTo
            fromDate={tempFromDate}
            toDate={tempToDate}
            onFromDateChange={setTempFromDate}
            onToDateChange={setTempToDate}
            onApply={handleApplyFilters}
            showApply={false}
          />
          {/* Sort Filter */}
          <div className="space-y-1.5 flex-1 min-w-[180px] text-start">
            <label className="flex items-center gap-2 font-bold select-none text-xs text-muted-foreground mr-1">
              {isAr ? "ترتيب حسب" : "Sort By"}
            </label>
            <Select value={tempSort} onValueChange={setTempSort}>
              <SelectTrigger className="rounded-xl h-11 bg-white border-border text-foreground font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl z-600 bg-white" dir={isAr ? "rtl" : "ltr"}>
                <SelectItem value="createdAt,desc">{isAr ? "الأحدث أولاً" : "Newest First"}</SelectItem>
                <SelectItem value="createdAt,asc">{isAr ? "الأقدم أولاً" : "Oldest First"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
            <button
              onClick={handleApplyFilters}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-300 outline-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md text-primary-foreground hover:shadow-primary/20 px-6 h-11 bg-primary hover:bg-primary/90 min-w-[100px] flex-1 sm:flex-none"
            >
              {isAr ? "تطبيق الفلاتر" : "Apply Filters"}
            </button>
            <button
              onClick={() => {
                setTempFromDate('');
                setTempToDate('');
                setTempSort('createdAt,desc');
                setFromDate('');
                setToDate('');
                setSort('createdAt,desc');
                setCurrentPage(1);
              }}
              className="inline-flex items-center justify-center rounded-xl transition-all duration-300 outline-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md border border-border bg-background text-foreground hover:bg-accent px-3.5 h-11"
              title={isAr ? "إعادة ضبط" : "Reset"}
            >
              <RotateCcw className="size-5" />
            </button>
          </div>
        </div>
      )}

      {/* Medical Records Section */}
      {hasPermission('MANAGE_MEDICAL_RECORDS') && (
        <div
        className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
        style={{ animationDelay: '300ms' }}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold">{isAr ? 'السجلات الطبية' : 'Medical Records'}</h2>
          <div className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-bold">
            {totalElements} {isAr ? 'سجل' : 'Records'}
          </div>
        </div>

        <div className="p-6">
          {isLoadingRecords ? (
            <div className="flex justify-center items-center h-48">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : records.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <EmptyShell
                title={isAr ? 'لا توجد سجلات' : 'No Records Found'}
                description={isAr ? 'لا توجد سجلات طبية لهذا المريض حتى الآن' : 'No medical records exist for this patient yet'}
              />
            </div>
          ) : (
            <section className="space-y-4">
              {records.map((record, index) => {
                const isOpen = openId === record.uuid;
                return (
                  <article
                    key={record.uuid}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                    style={{ animationDelay: `${400 + index * 50}ms` }}
                  >
                    <div data-state={isOpen ? 'open' : 'closed'} data-slot="collapsible">
                      <div data-slot="card" className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border overflow-hidden border-border hover:border-primary/30 transition-all duration-300">
                        <button
                          type="button"
                          onClick={() => toggleRecord(record.uuid)}
                          className="w-full text-left"
                        >
                          <div className="p-5 hover:bg-muted/30 transition-colors duration-200">
                            <div className="flex items-center justify-between gap-4">
                              <figure className={cn("flex items-center gap-4 flex-1 max-sm:flex-col max-sm:relative", isAr ? "sm:flex-row-reverse" : "sm:flex-row")}>
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                  <span className="text-primary font-bold text-lg">
                                    {patient?.firstName?.charAt(0)?.toUpperCase()}
                                  </span>
                                </div>
                                <figcaption className={cn("flex-1 max-sm:w-full max-sm:flex max-sm:flex-col max-sm:items-center", isAr ? "sm:text-right" : "sm:text-left")}>
                                  <div className={cn("flex items-center gap-3 mb-2 flex-wrap max-sm:justify-center", isAr ? "sm:flex-row-reverse" : "sm:flex-row")}>
                                    <h3 className="text-lg" style={{ fontWeight: 600 }}>{patient?.firstName} {patient?.lastName}</h3>
                                    <span
                                      data-slot="badge"
                                      className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 transition-[color,box-shadow] overflow-hidden border-transparent text-primary-foreground bg-secondary"
                                    >
                                      {isAr ? 'مكتمل' : 'Completed'}
                                    </span>
                                  </div>
                                  <div className={cn("flex items-center gap-4 text-sm text-muted-foreground flex-wrap max-sm:justify-center", isAr ? "sm:flex-row-reverse" : "sm:flex-row")}>
                                    <div className="flex items-center gap-1.5">
                                      <Stethoscope className="size-4" strokeWidth={2} />
                                      <span>{record.doctorName}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <FaCalendarAlt className="size-4" />
                                      <span>{new Date(record.createdAt).toLocaleDateString(isAr ? 'ar-JO' : 'en-US')}</span>
                                    </div>
                                  </div>
                                </figcaption>
                                <div className={cn("shrink-0 transition-transform duration-500 max-sm:absolute max-sm:top-0", isAr ? "max-sm:left-0" : "max-sm:right-0")} style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                                  <ChevronDown className="size-5 text-muted-foreground" strokeWidth={2} />
                                </div>
                              </figure>
                            </div>
                          </div>
                        </button>

                        <div
                          className="transition-all overflow-hidden"
                          style={{
                            height: isOpen ? 'auto' : '0',
                            opacity: isOpen ? 1 : 0,
                            transitionTimingFunction: isOpen ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' : 'ease-out',
                            transitionDuration: '500ms',
                            interpolateSize: 'allow-keywords'
                          }}
                        >
                          <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
                            <section className="space-y-2 max-sm:text-center">
                              <div className="flex items-center gap-2 max-sm:justify-center">
                                <div className="w-2 h-2 bg-primary rounded-full" />
                                <label className="text-sm" style={{ fontWeight: 600 }}>{isAr ? 'التشخيص' : 'Diagnosis'}</label>
                              </div>
                              <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg leading-relaxed">{record.diagnosis}</p>
                            </section>

                            <section className="space-y-2 max-sm:text-center">
                              <div className="flex items-center gap-2 max-sm:justify-center">
                                <div className="w-2 h-2 bg-secondary rounded-full" />
                                <label className="text-sm" style={{ fontWeight: 600 }}>{isAr ? 'خطة العلاج' : 'Treatment Plan'}</label>
                              </div>
                              <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg leading-relaxed">{record.treatmentPlan}</p>
                            </section>

                            <section className="space-y-2 max-sm:text-center">
                              <div className="flex items-center gap-2 max-sm:justify-center">
                                <div className="w-2 h-2 bg-accent rounded-full" />
                                <label className="text-sm" style={{ fontWeight: 600 }}>{isAr ? 'ملاحظات الطبيب' : 'Doctor Notes'}</label>
                              </div>
                              <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg leading-relaxed">{record.note || '-'}</p>
                            </section>

                            <section className="pt-3 border-t border-border max-sm:text-center">
                              <p className="text-xs text-muted-foreground mb-3">{isAr ? 'المرفقات (قريباً)' : 'Attachments (Coming Soon)'}</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="p-3 border border-dashed border-muted-foreground/30 rounded-lg text-center opacity-50 hover:opacity-100 transition-opacity cursor-not-allowed">
                                  <FileImage className="size-5 mx-auto mb-1 text-muted-foreground" />
                                  <p className="text-xs text-muted-foreground">{isAr ? 'الصور' : 'Images'}</p>
                                </div>
                                <div className="p-3 border border-dashed border-muted-foreground/30 rounded-lg text-center opacity-50 hover:opacity-100 transition-opacity cursor-not-allowed">
                                  <Pill className="size-5 mx-auto mb-1 text-muted-foreground" />
                                  <p className="text-xs text-muted-foreground">{isAr ? 'الوصفات' : 'Prescriptions'}</p>
                                </div>
                                <div className="p-3 border border-dashed border-muted-foreground/30 rounded-lg text-center opacity-50 hover:opacity-100 transition-opacity cursor-not-allowed">
                                  <FlaskConical className="size-5 mx-auto mb-1 text-muted-foreground" />
                                  <p className="text-xs text-muted-foreground">{isAr ? 'التحاليل' : 'Labs'}</p>
                                </div>
                                <div className="p-3 border border-dashed border-muted-foreground/30 rounded-lg text-center opacity-50 hover:opacity-100 transition-opacity cursor-not-allowed">
                                  <FileText className="size-5 mx-auto mb-1 text-muted-foreground" />
                                  <p className="text-xs text-muted-foreground">{isAr ? 'الملفات' : 'Files'}</p>
                                </div>
                              </div>
                            </section>

                            <div className="flex gap-2 pt-2 max-sm:flex-col">
                              <button
                                onClick={() => handlePrintRecord(record)}
                                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md border bg-background text-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/30 h-8 rounded-md gap-1.5 px-3 flex-1 min-h-10"
                              >
                                {isAr ? 'طباعة السجل' : 'Print Record'}
                              </button>
                              <button
                                onClick={() => handlePrintRecord(record)}
                                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md border bg-background text-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/30 h-8 rounded-md gap-1.5 px-3 flex-1 min-h-10"
                              >
                                {isAr ? 'تصدير PDF' : 'Export PDF'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </div>

        {totalPages > 0 && (
          <TableFooter
          className='w-fit mx-auto mb-6'
            variant="list"
            totalItems={totalElements}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={() => { }}
          />
        )}
      </div>
      )}
    </div>
  );
};

export default PatientDetailsView;
