import {
  ChevronDown,
  FileImage,
  FileText,
  FlaskConical,
  Pill,
  Stethoscope
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import TableFooter from '../../components/ui/TableFooter';
import { recordsTranslations } from '../../constants/translations/records';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePreloader } from '../../contexts/PreloaderContext';
import { cn } from '../../utils/cn';
import { getCookie } from '../../utils/cookie';
import DateFromTo from '../../components/ui/DateFromTo';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const MedicalRecordsList = () => {
  const { isAr, t, dir } = useLanguage();
  const T = recordsTranslations;
  const { isLoaded, isExiting } = usePreloader();
  const canAnimate = isLoaded && !isExiting;

  const [openId, setOpenId] = useState<string | null>(null);

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

  // Active filter states
  const [fromDate, setFromDate] = useState<string>(defaultFromDate);
  const [toDate, setToDate] = useState<string>(defaultToDate);
  const [sort, setSort] = useState<string>("createdAt,desc");

  // Temp filter states
  const [tempFromDate, setTempFromDate] = useState<string>(defaultFromDate);
  const [tempToDate, setTempToDate] = useState<string>(defaultToDate);
  const [tempSort, setTempSort] = useState<string>("createdAt,desc");

  const [records, setRecords] = useState<any[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const toggleRecord = (uuid: string) => {
    setOpenId(openId === uuid ? null : uuid);
  };

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('fromDate', fromDate);
      queryParams.append('toDate', toDate);
      queryParams.append('page', String(currentPage - 1));
      queryParams.append('size', String(itemsPerPage));
      queryParams.append('sort', sort);

      const response = await fetch(`/api/medical-records?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getCookie('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecords(data.content || []);
        setTotalElements(data.totalElements || 0);
      }
    } catch (err) {
      console.error('Error fetching medical records:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate, currentPage, itemsPerPage, sort]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleApply = () => {
    setFromDate(tempFromDate);
    setToDate(tempToDate);
    setSort(tempSort);
    setCurrentPage(1);
  };

  const handlePrintRecord = (record: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>${isAr ? 'السجل الطبي' : 'Medical Record'} - ${record.patientName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Outfit:wght@400;600;700&display=swap');
            body {
              font-family: ${isAr ? "'Cairo', sans-serif" : "'Outfit', sans-serif"};
              direction: ${isAr ? 'rtl' : 'ltr'};
              padding: 40px;
              color: #1a2b3c;
              background: #fff;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #0B5A8E;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo-text {
              font-size: 26px;
              font-weight: bold;
              color: #0B5A8E;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              text-align: center;
              margin-bottom: 30px;
              color: #0B5A8E;
            }
            .info-grid {
              display: grid;
              grid-template-cols: 1fr 1fr;
              gap: 15px;
              background-color: #f8fafc;
              padding: 20px;
              border-radius: 12px;
              margin-bottom: 30px;
              border: 1px solid #e2e8f0;
            }
            .info-item {
              font-size: 14px;
            }
            .info-item span {
              font-weight: bold;
              color: #4a5568;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #0B5A8E;
              border-bottom: 1px solid #edf2f7;
              padding-bottom: 8px;
              margin-bottom: 12px;
            }
            .section-content {
              font-size: 14px;
              line-height: 1.6;
              background-color: #ffffff;
              padding: 15px;
              border-radius: 8px;
              border: 1px solid #edf2f7;
              white-space: pre-wrap;
            }
            .footer {
              margin-top: 60px;
              display: flex;
              justify-content: space-between;
              align-items: end;
              border-top: 1px solid #e2e8f0;
              padding-top: 25px;
              font-size: 12px;
              color: #718096;
            }
            .signature {
              text-align: center;
            }
            .signature-line {
              margin-top: 50px;
              border-top: 1.5px solid #a0aec0;
              width: 160px;
            }
            @media print {
              body { padding: 0; }
              .info-grid { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-text">MEDEXA</div>
            <div>
              <strong>${isAr ? 'التاريخ:' : 'Date:'}</strong> ${new Date(record.createdAt).toLocaleDateString(isAr ? 'ar-JO' : 'en-US')}
            </div>
          </div>
          <div class="title">${isAr ? 'تقرير السجل الطبي' : 'Medical Record Report'}</div>
          
          <div class="info-grid">
            <div class="info-item">
              <span>${isAr ? 'اسم المريض:' : 'Patient Name:'}</span> ${record.patientName}
            </div>
            <div class="info-item">
              <span>${isAr ? 'الطبيب المعالج:' : 'Treating Doctor:'}</span> ${record.doctorName}
            </div>
            <div class="info-item">
              <span>${isAr ? 'رقم الموعد:' : 'Appointment ID:'}</span> #${record.appointmentUuid?.substring(0, 8) || '-'}
            </div>
            <div class="info-item">
              <span>${isAr ? 'تاريخ الإنشاء:' : 'Created At:'}</span> ${new Date(record.createdAt).toLocaleDateString(isAr ? 'ar-JO' : 'en-US')}
            </div>
          </div>

          <div class="section">
            <div class="section-title">${isAr ? 'حالة المريض (الأعراض):' : 'Case Description / Symptoms:'}</div>
            <div class="section-content">${record.caseDescription || '-'}</div>
          </div>

          <div class="section">
            <div class="section-title">${isAr ? 'التشخيص الطبي:' : 'Diagnosis:'}</div>
            <div class="section-content">${record.diagnosis}</div>
          </div>

          <div class="section">
            <div class="section-title">${isAr ? 'الخطة العلاجية:' : 'Treatment Plan:'}</div>
            <div class="section-content">${record.treatmentPlan}</div>
          </div>

          <div class="section">
            <div class="section-title">${isAr ? 'ملاحظات الطبيب:' : 'Doctor Notes:'}</div>
            <div class="section-content">${record.note || '-'}</div>
          </div>

          <div class="footer">
            <div>
              ${isAr ? 'تم إنشاؤه بواسطة نظام مديكسا السحابي' : 'Generated by Medexa Cloud System'}
            </div>
            <div class="signature">
              <div>${isAr ? 'توقيع الطبيب' : 'Doctor Signature'}</div>
              <div class="signature-line"></div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <section className="flex-1 overflow-auto" dir={dir}>
      <div className="space-y-6">
        {/* Header */}
        <header
          className={cn("transition-all duration-300", isAr ? "text-right" : "text-left")}
          style={{ opacity: canAnimate ? 1 : 0, transform: canAnimate ? 'none' : 'translateY(10px)' }}
        >
          <h1 className="text-3xl mb-1" style={{ fontWeight: 700 }}>{t('page_title', T)}</h1>
          <p className="text-muted-foreground">{t('page_desc', T)}</p>
        </header>

        {/* Notice Card */}
        <aside
          className="transition-all duration-300"
          style={{ opacity: canAnimate ? 1 : 0, transform: canAnimate ? 'none' : 'translateY(10px)' }}
        >
          <div data-slot="card" className="text-card-foreground flex flex-col gap-6 rounded-xl border transition-all duration-300 p-4 bg-white border-gray-200">
            <figure className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="size-5 text-primary" strokeWidth={2} />
              </div>
              <figcaption className={isAr ? "text-right" : "text-left"}>
                <p className="text-sm" style={{ fontWeight: 600 }}>{t('notice_title', T)}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('notice_desc', T)}</p>
              </figcaption>
            </figure>
          </div>
        </aside>

        {/* Filters */}
        <div className={cn("flex flex-wrap items-end gap-3 bg-white p-5 rounded-xl border border-border transition-all duration-700 w-full", canAnimate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")} style={{ transitionDelay: '150ms' }}>
          <DateFromTo
            fromDate={tempFromDate}
            toDate={tempToDate}
            onFromDateChange={setTempFromDate}
            onToDateChange={setTempToDate}
            onApply={() => {}}
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

          <button
            onClick={handleApply}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-300 outline-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md text-primary-foreground hover:shadow-primary/20 px-6 h-11 bg-primary hover:bg-primary/90 min-w-[100px]"
          >
            {isAr ? "تأكيد" : "Confirm"}
          </button>
        </div>

        {/* Records List */}
        <section className="space-y-4">
          {records.map((record, index) => {
            const isOpen = openId === record.uuid;

            return (
              <article
                key={record.uuid}
                className="transition-all duration-300"
                style={{
                  opacity: canAnimate ? 1 : 0,
                  transform: canAnimate ? 'none' : 'translateY(10px)',
                  transitionDelay: `${index * 50}ms`
                }}
              >
                <div data-state={isOpen ? "open" : "closed"} data-slot="collapsible">
                  <div data-slot="card" className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border overflow-hidden border-border hover:border-primary/30 transition-all duration-300">
                    <button
                      type="button"
                      onClick={() => toggleRecord(record.uuid)}
                      className="w-full"
                    >
                      <div className="p-5 hover:bg-muted/30 transition-colors duration-200">
                        <div className="flex items-center justify-between gap-4">
                          <figure className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                              <span className="text-primary font-bold text-lg">
                                {record.patientName ? record.patientName[0] : 'P'}
                              </span>
                            </div>
                            <figcaption className={cn("flex-1", isAr ? "text-right" : "text-left")}>
                              <div className={cn("flex items-center w-fit gap-3 mb-2 flex-wrap", isAr ? "flex-row-reverse" : "flex-row")}>
                                <h3 className="text-lg" style={{ fontWeight: 600 }}>{record.patientName}</h3>
                                <span
                                  data-slot="badge"
                                  className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 transition-[color,box-shadow] overflow-hidden border-transparent text-primary-foreground bg-secondary"
                                >
                                  {t('status_completed', T)}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
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
                            <div className="shrink-0 transition-transform duration-500" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                              <ChevronDown className="size-5 text-muted-foreground" strokeWidth={2} />
                            </div>
                          </figure>
                        </div>
                      </div>
                    </button>

                    {/* Collapsible Content */}
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
                        {/* Diagnosis */}
                        <section className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            <label className="text-sm" style={{ fontWeight: 600 }}>{t('diagnosis', T)}</label>
                          </div>
                          <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg leading-relaxed">{record.diagnosis}</p>
                        </section>

                        {/* Treatment */}
                        <section className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-secondary rounded-full" />
                            <label className="text-sm" style={{ fontWeight: 600 }}>{t('treatment', T)}</label>
                          </div>
                          <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg leading-relaxed">{record.treatmentPlan}</p>
                        </section>

                        {/* Notes */}
                        <section className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-accent rounded-full" />
                            <label className="text-sm" style={{ fontWeight: 600 }}>{t('doctor_notes', T)}</label>
                          </div>
                          <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg leading-relaxed">{record.note || '-'}</p>
                        </section>

                        {/* Attachments Placeholder */}
                        <section className="pt-3 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-3">{t('attachments', T)}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-3 border border-dashed border-muted-foreground/30 rounded-lg text-center opacity-50 hover:opacity-100 transition-opacity cursor-not-allowed">
                              <FileImage className="size-5 mx-auto mb-1 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">{t('attachment_images', T)}</p>
                            </div>
                            <div className="p-3 border border-dashed border-muted-foreground/30 rounded-lg text-center opacity-50 hover:opacity-100 transition-opacity cursor-not-allowed">
                              <Pill className="size-5 mx-auto mb-1 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">{t('attachment_prescriptions', T)}</p>
                            </div>
                            <div className="p-3 border border-dashed border-muted-foreground/30 rounded-lg text-center opacity-50 hover:opacity-100 transition-opacity cursor-not-allowed">
                              <FlaskConical className="size-5 mx-auto mb-1 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">{t('attachment_labs', T)}</p>
                            </div>
                            <div className="p-3 border border-dashed border-muted-foreground/30 rounded-lg text-center opacity-50 hover:opacity-100 transition-opacity cursor-not-allowed">
                              <FileText className="size-5 mx-auto mb-1 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">{t('attachment_files', T)}</p>
                            </div>
                          </div>
                        </section>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handlePrintRecord(record)}
                            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md border bg-background text-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/30 h-8 rounded-md gap-1.5 px-3 flex-1"
                          >
                            {t('print_record', T)}
                          </button>
                          <button
                            onClick={() => handlePrintRecord(record)}
                            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md border bg-background text-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/30 h-8 rounded-md gap-1.5 px-3 flex-1"
                          >
                            {t('export_pdf', T)}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
          {records.length === 0 && !isLoading && (
            <div className="text-center py-10 text-muted-foreground font-bold">
              {t('no_records', T)}
            </div>
          )}
        </section>

        {records.length > 0 && (
          <TableFooter
            variant="list"
            totalItems={totalElements}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(val) => {
              setItemsPerPage(val === 'all' ? totalElements : Number(val));
              setCurrentPage(1);
            }}
          />
        )}

        {/* Stats Card */}
        <section
          className="transition-all duration-300"
          style={{ opacity: canAnimate ? 1 : 0, transform: canAnimate ? 'none' : 'translateY(10px)' }}
        >
          <article data-slot="card" className="text-card-foreground flex flex-col gap-6 rounded-xl border transition-all duration-300 p-5 bg-white border-gray-200">
            <figure className="flex items-center justify-between">
              <figcaption className={cn(isAr ? "text-right" : "text-left")}>
                <p className="text-sm text-muted-foreground">{t('total_records', T)}</p>
                <p className="text-2xl mt-1" style={{ fontWeight: 700 }}>{totalElements}</p>
              </figcaption>
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                <FileText className="size-8 text-primary" strokeWidth={2} />
              </div>
            </figure>
          </article>
        </section>
      </div>
    </section>
  );
};

export default MedicalRecordsList;
