import { useState } from 'react';
import {
  FileText,
  Stethoscope,
  ChevronDown,
  FileImage,
  Pill,
  FlaskConical
} from 'lucide-react';
import { FaCalendarAlt } from 'react-icons/fa';
import { usePreloader } from '../../contexts/PreloaderContext';

interface MedicalRecord {
  id: number;
  patientName: string;
  doctorName: string;
  date: string;
  status: string;
  details: {
    diagnosis: string;
    treatment: string;
    notes: string;
  }
}

const INITIAL_RECORDS: MedicalRecord[] = [
  {
    id: 1,
    patientName: 'أحمد عبدالله',
    doctorName: 'د. عمر الزعبي',
    date: '٢٥ شباط ٢٠٢٦',
    status: 'مكتمل',
    details: {
      diagnosis: 'التهاب الحلق الحاد',
      treatment: 'مضادات حيوية (Amoxicillin 500mg) ثلاث مرات يومياً لمدة 7 أيام + مسكنات للألم عند الحاجة',
      notes: 'المريض يعاني من التهاب حلق حاد مع ارتفاع في درجة الحرارة. تم وصف مضاد حيوي مناسب مع متابعة بعد 3 أيام.'
    }
  },
  {
    id: 2,
    patientName: 'نورة محمد',
    doctorName: 'د. ليلى الخطيب',
    date: '٢٤ شباط ٢٠٢٦',
    status: 'مكتمل',
    details: {
      diagnosis: 'فحص دوري للحمل - الأسبوع العشرين',
      treatment: 'فيتامينات الحمل (برينتال)، حديد وفوليك أسيد مع راحة تامة',
      notes: 'حالة الجنين ممتازة، تم تحديد موعد الفحص القادم بعد 4 أسابيع لمتابعة النمو.'
    }
  },
  {
    id: 3,
    patientName: 'خالد سعيد',
    doctorName: 'د. هند الطراونة',
    date: '٢٠ شباط ٢٠٢٦',
    status: 'مكتمل',
    details: {
      diagnosis: 'ألم أسفل الظهر ناتج عن إجهاد عضلي',
      treatment: 'مرخي عضلات (موسكادول)، دهون موضعي (فولتارين) مرتين يومياً',
      notes: 'جلسات علاج طبيعي مرتين أسبوعياً وتجنب رفع الأوزان الثقيلة والحركات المفاجئة.'
    }
  },
];

const MedicalRecordsList = () => {
  const { isLoaded, isExiting } = usePreloader();
  const canAnimate = isLoaded && !isExiting;

  const [openId, setOpenId] = useState<number | null>(null);

  const toggleRecord = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="flex-1 overflow-auto" dir="rtl">
      <div className="space-y-6">
        {/* Header */}
        <header
          className="transition-all duration-300"
          style={{ opacity: canAnimate ? 1 : 0, transform: canAnimate ? 'none' : 'translateY(10px)' }}
        >
          <h1 className="text-3xl mb-1" style={{ fontWeight: 700 }}>السجلات الطبية</h1>
          <p className="text-muted-foreground">عرض وإدارة السجلات والتشخيصات الطبية</p>
        </header>

        {/* Notice Card */}
        <aside
          className="transition-all duration-300"
          style={{ opacity: canAnimate ? 1 : 0, transform: canAnimate ? 'none' : 'translateY(10px)' }}
        >
          <div data-slot="card" className="text-card-foreground flex flex-col gap-6 rounded-xl border transition-all duration-300 p-4 bg-linear-to-br from-primary/5 to-secondary/5 border-primary/20">
            <figure className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="size-5 text-primary" strokeWidth={2} />
              </div>
              <figcaption>
                <p className="text-sm" style={{ fontWeight: 600 }}>السجلات الطبية التلقائية</p>
                <p className="text-xs text-muted-foreground mt-1">يتم إنشاء السجلات الطبية تلقائياً بعد إتمام كل موعد طبي. لا حاجة لإضافتها يدوياً.</p>
              </figcaption>
            </figure>
          </div>
        </aside>

        {/* Records List */}
        <section className="space-y-4">
          {INITIAL_RECORDS.map((record, index) => {
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
                              <FileText className="size-6 text-primary" strokeWidth={2} />
                            </div>
                            <figcaption className="flex-1 text-right">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3 className="text-lg" style={{ fontWeight: 600 }}>{record.patientName}</h3>
                                <span
                                  data-slot="badge"
                                  className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 transition-[color,box-shadow] overflow-hidden border-transparent text-primary-foreground bg-secondary"
                                >
                                  {record.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                <div className="flex items-center gap-1.5">
                                  <Stethoscope className="size-4" strokeWidth={2} />
                                  <span>{record.doctorName}</span>
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
                            <label className="text-sm" style={{ fontWeight: 600 }}>التشخيص</label>
                          </div>
                          <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg leading-relaxed">{record.details.diagnosis}</p>
                        </section>

                        {/* Treatment */}
                        <section className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-secondary rounded-full" />
                            <label className="text-sm" style={{ fontWeight: 600 }}>خطة العلاج</label>
                          </div>
                          <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg leading-relaxed">{record.details.treatment}</p>
                        </section>

                        {/* Notes */}
                        <section className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-accent rounded-full" />
                            <label className="text-sm" style={{ fontWeight: 600 }}>ملاحظات الطبيب</label>
                          </div>
                          <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg leading-relaxed">{record.details.notes}</p>
                        </section>

                        {/* Attachments Placeholder */}
                        <section className="pt-3 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-3">المرفقات (قريباً)</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-3 border border-dashed border-muted-foreground/30 rounded-lg text-center opacity-50 hover:opacity-100 transition-opacity cursor-not-allowed">
                              <FileImage className="size-5 mx-auto mb-1 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">الصور</p>
                            </div>
                            <div className="p-3 border border-dashed border-muted-foreground/30 rounded-lg text-center opacity-50 hover:opacity-100 transition-opacity cursor-not-allowed">
                              <Pill className="size-5 mx-auto mb-1 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">الوصفات</p>
                            </div>
                            <div className="p-3 border border-dashed border-muted-foreground/30 rounded-lg text-center opacity-50 hover:opacity-100 transition-opacity cursor-not-allowed">
                              <FlaskConical className="size-5 mx-auto mb-1 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">التحاليل</p>
                            </div>
                            <div className="p-3 border border-dashed border-muted-foreground/30 rounded-lg text-center opacity-50 hover:opacity-100 transition-opacity cursor-not-allowed">
                              <FileText className="size-5 mx-auto mb-1 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">الملفات</p>
                            </div>
                          </div>
                        </section>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <button 
                            onClick={() => window.print()}
                            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md border bg-background text-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/30 h-8 rounded-md gap-1.5 px-3 flex-1"
                          >
                            طباعة السجل
                          </button>
                          <button 
                            onClick={() => window.print()}
                            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-bold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md border bg-background text-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/30 h-8 rounded-md gap-1.5 px-3 flex-1"
                          >
                            تصدير PDF
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

        {/* Stats Card */}
        <section
          className="transition-all duration-300"
          style={{ opacity: canAnimate ? 1 : 0, transform: canAnimate ? 'none' : 'translateY(10px)' }}
        >
          <article data-slot="card" className="text-card-foreground flex flex-col gap-6 rounded-xl border transition-all duration-300 p-5 bg-linear-to-br from-primary/5 to-transparent border-primary/10">
            <figure className="flex items-center justify-between">
              <figcaption>
                <p className="text-sm text-muted-foreground">إجمالي السجلات الطبية</p>
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
