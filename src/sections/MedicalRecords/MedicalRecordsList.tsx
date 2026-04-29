import {
    ChevronDown,
    FileImage,
    FileText,
    FlaskConical,
    Pill,
    Stethoscope
} from 'lucide-react';
import { useState } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import TableFooter from '../../components/ui/TableFooter';
import { recordsTranslations } from '../../constants/translations/records';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePreloader } from '../../contexts/PreloaderContext';
import { cn } from '../../utils/cn';

interface MedicalRecord {
  id: number;
  patientName_ar: string;
  patientName_en: string;
  doctorName_ar: string;
  doctorName_en: string;
  date: string;
  status: 'completed';
  details: {
    diagnosis_ar: string;
    diagnosis_en: string;
    treatment_ar: string;
    treatment_en: string;
    notes_ar: string;
    notes_en: string;
  }
}

const INITIAL_RECORDS: MedicalRecord[] = [
  {
    id: 1,
    patientName_ar: 'أحمد عبدالله',
    patientName_en: 'Ahmed Abdullah',
    doctorName_ar: 'د. عمر الزعبي',
    doctorName_en: 'Dr. Omar Al-Zoughbi',
    date: '2026-02-25',
    status: 'completed',
    details: {
      diagnosis_ar: 'التهاب الحلق الحاد',
      diagnosis_en: 'Acute Pharyngitis',
      treatment_ar: 'مضادات حيوية (Amoxicillin 500mg) ثلاث مرات يومياً لمدة 7 أيام + مسكنات للألم عند الحاجة',
      treatment_en: 'Antibiotics (Amoxicillin 500mg) three times daily for 7 days + painkillers as needed',
      notes_ar: 'المريض يعاني من التهاب حلق حاد مع ارتفاع في درجة الحرارة. تم وصف مضاد حيوي مناسب مع متابعة بعد 3 أيام.',
      notes_en: 'The patient suffers from acute pharyngitis with a high temperature. An appropriate antibiotic was prescribed with follow-up after 3 days.'
    }
  },
  {
    id: 2,
    patientName_ar: 'نورة محمد',
    patientName_en: 'Noura Mohammed',
    doctorName_ar: 'د. ليلى الخطيب',
    doctorName_en: 'Dr. Layla Al-Khatib',
    date: '2026-02-24',
    status: 'completed',
    details: {
      diagnosis_ar: 'فحص دوري للحمل - الأسبوع العشرين',
      diagnosis_en: 'Routine Pregnancy Check-up - Week 20',
      treatment_ar: 'فيتامينات الحمل (برينتال)، حديد وفوليك أسيد مع راحة تامة',
      treatment_en: 'Prenatal vitamins, iron and folic acid with complete rest',
      notes_ar: 'حالة الجنين ممتازة، تم تحديد موعد الفحص القادم بعد 4 أسابيع لمتابعة النمو.',
      notes_en: 'The condition of the fetus is excellent. The next examination date was set after 4 weeks to monitor growth.'
    }
  },
  {
    id: 3,
    patientName_ar: 'خالد سعيد',
    patientName_en: 'Khaled Saeed',
    doctorName_ar: 'د. هند الطراونة',
    doctorName_en: 'Dr. Hind Al-Tarawneh',
    date: '2026-02-20',
    status: 'completed',
    details: {
      diagnosis_ar: 'ألم أسفل الظهر ناتج عن إجهاد عضلي',
      diagnosis_en: 'Lower back pain caused by muscle strain',
      treatment_ar: 'مرخي عضلات (موسكادول)، دهون موضعي (فولتارين) مرتين يومياً',
      treatment_en: 'Muscle relaxant (Muscadol), topical cream (Voltaren) twice daily',
      notes_ar: 'جلسات علاج طبيعي مرتين أسبوعياً وتجنب رفع الأوزان الثقيلة والحركات المفاجئة.',
      notes_en: 'Physical therapy sessions twice a week. Avoid lifting heavy weights and sudden movements.'
    }
  },
];

const MedicalRecordsList = () => {
  const { isAr, t, dir } = useLanguage();
  const T = recordsTranslations;
  const { isLoaded, isExiting } = usePreloader();
  const canAnimate = isLoaded && !isExiting;

  const [openId, setOpenId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const toggleRecord = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  const paginatedRecords = INITIAL_RECORDS.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
          <div data-slot="card" className="text-card-foreground flex flex-col gap-6 rounded-xl border transition-all duration-300 p-4 bg-linear-to-br from-primary/5 to-secondary/5 border-primary/20">
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

        {/* Records List */}
        <section className="space-y-4">
          {paginatedRecords.map((record, index) => {
            const isOpen = openId === record.id;

            return (
              <article
                key={record.id}
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
                      onClick={() => toggleRecord(record.id)}
                      className="w-full"
                    >
                      <div className="p-5 hover:bg-muted/30 transition-colors duration-200">
                        <div className="flex items-center justify-between gap-4">
                          <figure className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                              <span className="text-primary font-bold text-lg">
                                {(isAr ? record.patientName_ar : record.patientName_en)[0]}
                              </span>
                            </div>
                            <figcaption className={cn("flex-1", isAr ? "text-right" : "text-left")}>
                              <div className={cn("flex items-center  w-fit gap-3 mb-2 flex-wrap", isAr ? "flex-row-reverse" : "flex-row")}>
                                <h3 className="text-lg" style={{ fontWeight: 600 }}>{isAr ? record.patientName_ar : record.patientName_en}</h3>
                                <span
                                  data-slot="badge"
                                  className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 transition-[color,box-shadow] overflow-hidden border-transparent text-primary-foreground bg-secondary"
                                >
                                  {record.status === 'completed' ? t('status_completed', T) : record.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                <div className="flex items-center gap-1.5">
                                  <Stethoscope className="size-4" strokeWidth={2} />
                                  <span>{isAr ? record.doctorName_ar : record.doctorName_en}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <FaCalendarAlt className="size-4" />
                                  <span>{record.date}</span>
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
                          <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg leading-relaxed">{isAr ? record.details.diagnosis_ar : record.details.diagnosis_en}</p>
                        </section>

                        {/* Treatment */}
                        <section className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-secondary rounded-full" />
                            <label className="text-sm" style={{ fontWeight: 600 }}>{t('treatment', T)}</label>
                          </div>
                          <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg leading-relaxed">{isAr ? record.details.treatment_ar : record.details.treatment_en}</p>
                        </section>

                        {/* Notes */}
                        <section className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-accent rounded-full" />
                            <label className="text-sm" style={{ fontWeight: 600 }}>{t('doctor_notes', T)}</label>
                          </div>
                          <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg leading-relaxed">{isAr ? record.details.notes_ar : record.details.notes_en}</p>
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
                            onClick={() => window.print()}
                            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md border bg-background text-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/30 h-8 rounded-md gap-1.5 px-3 flex-1"
                          >
                            {t('print_record', T)}
                          </button>
                          <button
                            onClick={() => window.print()}
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
        </section>

        {INITIAL_RECORDS.length > 0 && (
          <TableFooter
            variant="list"
            totalItems={INITIAL_RECORDS.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Stats Card */}
        <section
          className="transition-all duration-300"
          style={{ opacity: canAnimate ? 1 : 0, transform: canAnimate ? 'none' : 'translateY(10px)' }}
        >
          <article data-slot="card" className="text-card-foreground flex flex-col gap-6 rounded-xl border transition-all duration-300 p-5 bg-linear-to-br from-primary/5 to-transparent border-primary/10">
            <figure className="flex items-center justify-between">
              <figcaption className={cn(isAr ? "text-right" : "text-left")}>
                <p className="text-sm text-muted-foreground">{t('total_records', T)}</p>
                <p className="text-2xl mt-1" style={{ fontWeight: 700 }}>{INITIAL_RECORDS.length}</p>
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
