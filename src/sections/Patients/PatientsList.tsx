import {
  Eye,
  MoveHorizontal,
  Plus,
  Search,
  Smartphone,
  SquarePen
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import type { Patient } from '../../constants/Patients_dummy';
import { initialPatients } from '../../constants/Patients_dummy';
import { patientsTranslations } from '../../constants/translations/patients';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePreloader } from '../../contexts/PreloaderContext';
import { useBroadcast } from '../../hooks/useBroadcast';
import { cn } from '../../utils/cn';
import PatientsDialog from './PatientsDialog';
import TableFooter from '../../components/ui/TableFooter';

const PatientsList = () => {
  const { isAr, t } = useLanguage();
  const T = patientsTranslations;
  const { isLoaded, isExiting } = usePreloader();
  const canAnimate = isLoaded && !isExiting;

  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);

  // Delete Modal State

  const { broadcast } = useBroadcast((event) => {
    if (event.type === 'DATA_UPDATE' && event.module === 'patients') {
      // In a real app, we would re-fetch. For mock, we just log or could sync via localStorage.
      console.log('Patients data updated in another tab');
    }
  });

  const filteredPatients = patients.filter(patient =>
    (isAr ? patient.name_ar : patient.name_en).toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const handleOpenDialog = (mode: 'add' | 'edit' | 'view', patient?: Patient) => {
    setDialogMode(mode);
    setCurrentPatient(patient || null);
    setIsDialogOpen(true);
  };

  const handleConfirmAction = (data: Partial<Patient>) => {
    if (dialogMode === 'add') {
      const newPatient: Patient = {
        id: Date.now(),
        first_name_ar: data.first_name_ar || '',
        surname_ar: data.surname_ar || '',
        last_name_ar: data.last_name_ar || '',
        first_name_en: data.first_name_en || '',
        surname_en: data.surname_en || '',
        last_name_en: data.last_name_en || '',
        name_ar: data.name_ar || '',
        name_en: data.name_en || '',
        phone: data.phone || '',
        age: data.age || 0,
        gender_ar: data.gender_ar || (isAr ? data.gender_en || 'ذكر' : 'Male'),
        gender_en: data.gender_en || (!isAr ? data.gender_ar || 'Male' : 'Male'),
        lastVisit: new Date().toISOString().split('T')[0],
        dob: data.dob as string || '',
        address_ar: data.address_ar as string || '',
        address_en: data.address_en as string || '',
        notes_ar: data.notes_ar as string || '',
        notes_en: data.notes_en as string || ''
      };
      setPatients(prev => [...prev, newPatient]);
      broadcast({ type: 'DATA_UPDATE', module: 'patients' });
      window.showToast?.(t('toast_add_success', T));
    } else if (dialogMode === 'edit' && currentPatient) {
      setPatients(prev => prev.map(p => p.id === currentPatient.id ? { ...p, ...data } : p));
      broadcast({ type: 'DATA_UPDATE', module: 'patients' });
      window.showToast?.(t('toast_update_success', T));
    }
    setIsDialogOpen(false);
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
        >
          <Plus className={cn("size-4", isAr ? "ml-2" : "mr-2")} />
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
        <div className="p-6 pb-0">
          <div className="mb-4">
            <div className="relative w-full md:w-96">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 text-muted-foreground size-[18px]", isAr ? "right-3" : "left-3")} />
                <input
                  data-slot="input"
                  className={cn(
                    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-border flex w-full min-w-0 rounded-xl border py-1 text-base transition-[color,box-shadow] outline-none md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-10 bg-input-background",
                    isAr ? "pr-10 pl-3" : "pl-10 pr-3"
                  )}
                  placeholder={t('search_placeholder', T)}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>

          {/* Mobile Swipe Indicator */}
          <aside className="sm:hidden flex items-center justify-center gap-3 mb-4 py-2 px-4 rounded-full bg-muted/30 text-muted-foreground/80 text-xs font-bold ring-1 ring-border/50 animate-pulse backdrop-blur-xs">
            <Smartphone className="size-3.5" />
            <span>{t('mobile_swipe', T)}</span>
            <MoveHorizontal className={cn("size-3.5", isAr ? "rotate-0" : "rotate-180")} />
          </aside>
        </div>

        <section className="overflow-x-auto">
          <div data-slot="table-container" className="relative w-full overflow-x-auto">
            <table data-slot="table" className="w-full caption-bottom text-sm">
              <thead data-slot="table-header" className="bg-muted/30 border-b">
                <tr data-slot="table-row" className="transition-colors text-start">
                  <th data-slot="table-head" className={cn("text-foreground h-12 px-4 align-middle font-bold whitespace-nowrap", isAr ? "text-right" : "text-left")}>{t('table.name', T)}</th>
                  <th data-slot="table-head" className={cn("text-foreground h-12 px-4 align-middle font-bold whitespace-nowrap", isAr ? "text-right" : "text-left")}>{t('table.phone', T)}</th>
                  <th data-slot="table-head" className={cn("text-foreground h-12 px-4 align-middle font-bold whitespace-nowrap", isAr ? "text-right" : "text-left")}>{t('table.age', T)}</th>
                  <th data-slot="table-head" className={cn("text-foreground h-12 px-4 align-middle font-bold whitespace-nowrap", isAr ? "text-right" : "text-left")}>{t('table.gender', T)}</th>
                  <th data-slot="table-head" className={cn("text-foreground h-12 px-4 align-middle font-bold whitespace-nowrap", isAr ? "text-right" : "text-left")}>{t('table.last_visit', T)}</th>
                  <th data-slot="table-head" className={cn("text-foreground h-12 px-4 align-middle font-bold whitespace-nowrap", isAr ? "text-right" : "text-left")}>{t('table.actions', T)}</th>
                </tr>
              </thead>
              <tbody data-slot="table-body" className="divide-y divide-border/30">
                {filteredPatients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((patient) => (
                  <tr
                    key={patient.id}
                    data-slot="table-row"
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td data-slot="table-cell" className={cn("p-4 align-middle whitespace-nowrap", isAr ? "text-right" : "text-left")} style={{ fontWeight: 600 }}>
                      {isAr ? patient.name_ar : patient.name_en}
                    </td>
                    <td data-slot="table-cell" className={cn("p-4 align-middle whitespace-nowrap text-muted-foreground", isAr ? "text-right" : "text-left")}>
                      {patient.phone}
                    </td>
                    <td data-slot="table-cell" className={cn("p-4 align-middle whitespace-nowrap", isAr ? "text-right" : "text-left")}>
                      {patient.age}
                    </td>
                    <td data-slot="table-cell" className={cn("p-4 align-middle whitespace-nowrap", isAr ? "text-right" : "text-left")}>
                      {patient.gender_ar === 'ذكر' ? t('dialog.male', T) : patient.gender_ar === 'أنثى' ? t('dialog.female', T) : t('dialog.other', T)}
                    </td>
                    <td data-slot="table-cell" className={cn("p-4 align-middle whitespace-nowrap", isAr ? "text-right" : "text-left")}>
                      <span
                        data-slot="badge"
                        className="inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-xs font-bold w-fit whitespace-nowrap shrink-0 bg-secondary/10 text-secondary border-transparent"
                      >
                        {patient.lastVisit}
                      </span>
                    </td>
                    <td data-slot="table-cell" className="p-4 align-middle whitespace-nowrap">
                      <div className="flex gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog('view', patient)}
                          className="hover:bg-primary hover:text-white transition-all duration-300"
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog('edit', patient)}
                          className="hover:bg-primary hover:text-white transition-all duration-300"
                        >
                          <SquarePen className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan={6} className="h-40 text-center text-muted-foreground p-4">
                      {t('no_results', T)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <TableFooter
            variant="table"
            totalItems={filteredPatients.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(val) => {
              setItemsPerPage(val === 'all' ? filteredPatients.length : Number(val));
              setCurrentPage(1);
            }}
          />
        </section>
      </article>
      </div>

      <PatientsDialog
        key={`${dialogMode}-${currentPatient?.id || 'new'}`}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        mode={dialogMode}
        initialData={currentPatient}
        onConfirm={handleConfirmAction}
      />

    </section>
  );
};

export default PatientsList;
