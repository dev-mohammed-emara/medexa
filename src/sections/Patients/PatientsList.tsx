import { useState } from 'react';
import {
  Plus,
  Search,
  Eye,
  SquarePen,
  Trash2,
  MoveHorizontal,
  Smartphone
} from 'lucide-react';
import { usePreloader } from '../../contexts/PreloaderContext';
import { cn } from '../../utils/cn';
import { initialPatients } from '../../constants/Patients_dummy';
import type { Patient } from '../../constants/Patients_dummy';
import PatientsDialog from './PatientsDialog';
import Modal from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

const PatientsList = () => {
  const { isLoaded, isExiting } = usePreloader();
  const canAnimate = isLoaded && !isExiting;

  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        name: data.name || '',
        phone: data.phone || '',
        age: data.age || 0,
        gender: data.gender || 'غير محدد',
        lastVisit: new Date().toISOString().split('T')[0],
        dob: data.dob as string || '',
        address: data.address as string || '',
        notes: data.notes as string || ''
      };
      setPatients(prev => [...prev, newPatient]);
      window.showToast?.('تم إضافة المريض بنجاح');
    } else if (dialogMode === 'edit' && currentPatient) {
      setPatients(prev => prev.map(p => p.id === currentPatient.id ? { ...p, ...data } : p));
      window.showToast?.('تم تحديث بيانات المريض بنجاح');
    }
    setIsDialogOpen(false);
  };

  const handleDeleteClick = (patient: Patient) => {
    setPatientToDelete(patient);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (patientToDelete) {
      setPatients(prev => prev.filter(p => p.id !== patientToDelete.id));
      window.showToast?.('تم حذف سجل المريض بنجاح');
    }
    setIsDeleteModalOpen(false);
  };

  return (
    <section className="flex-1 overflow-auto">
      <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <header className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-between gap-4 opacity-0",
        canAnimate && "animate-fadeDown animate-delay-100"
      )}>
        <div>
          <h1 className="text-3xl mb-1" style={{ fontWeight: 700 }}>إدارة المرضى</h1>
          <p className="text-muted-foreground">إدارة سجلات ومعلومات المرضى</p>
        </div>
        <Button
          onClick={() => handleOpenDialog('add')}
          className="h-10 px-6 rounded-xl"
        >
          <Plus className="size-4 ml-2" />
          إضافة مريض
        </Button>
      </header>

      {/* Search and Table Card */}
      <article
        data-slot="card"
        className={cn(
          "text-card-foreground flex flex-col gap-6 rounded-xl border transition-all duration-300 hover:shadow-lg p-6 bg-white border-border shadow-sm opacity-0",
          canAnimate && "animate-fadeUp animate-delay-200"
        )}
      >
          <div className="mb-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground size-[18px]" />
              <input
                data-slot="input"
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-border flex w-full min-w-0 rounded-xl border px-3 py-1 text-base transition-[color,box-shadow] outline-none md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive pr-10 h-10 bg-input-background"
                placeholder="ابحث عن مريض..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Mobile Swipe Indicator */}
          <aside className="sm:hidden flex items-center justify-center gap-3 mb-4 py-2 px-4 rounded-full bg-muted/30 text-muted-foreground/80 text-xs font-bold ring-1 ring-border/50 animate-pulse backdrop-blur-xs">
            <Smartphone className="size-3.5" />
            <span>اسحب لليسار أو اليمين لتصفح الجدول</span>
            <MoveHorizontal className="size-3.5" />
          </aside>

          <section className="overflow-x-auto">
            <div data-slot="table-container" className="relative w-full overflow-x-auto">
              <table data-slot="table" className="w-full caption-bottom text-sm">
                <thead data-slot="table-header" className="[&_tr]:border-b">
                  <tr data-slot="table-row" className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                    <th data-slot="table-head" className="text-foreground h-10 px-2 align-middle font-medium whitespace-nowrap *:[[role=checkbox]]:translate-y-[2px] text-right">الاسم</th>
                    <th data-slot="table-head" className="text-foreground h-10 px-2 align-middle font-medium whitespace-nowrap *:[[role=checkbox]]:translate-y-[2px] text-right">الهاتف</th>
                    <th data-slot="table-head" className="text-foreground h-10 px-2 align-middle font-medium whitespace-nowrap *:[[role=checkbox]]:translate-y-[2px] text-right">العمر</th>
                    <th data-slot="table-head" className="text-foreground h-10 px-2 align-middle font-medium whitespace-nowrap *:[[role=checkbox]]:translate-y-[2px] text-right">الجنس</th>
                    <th data-slot="table-head" className="text-foreground h-10 px-2 align-middle font-medium whitespace-nowrap *:[[role=checkbox]]:translate-y-[2px] text-right">آخر زيارة</th>
                    <th data-slot="table-head" className="text-foreground h-10 px-2 align-middle font-medium whitespace-nowrap *:[[role=checkbox]]:translate-y-[2px] text-right">الإجراءات</th>
                  </tr>
                </thead>
                <tbody data-slot="table-body" className="[&_tr:last-child]:border-0">
                  {filteredPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      data-slot="table-row"
                      className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
                    >
                      <td data-slot="table-cell" className="p-2 align-middle whitespace-nowrap *:[[role=checkbox]]:translate-y-[2px]" style={{ fontWeight: 600 }}>
                        {patient.name}
                      </td>
                      <td data-slot="table-cell" className="p-2 align-middle whitespace-nowrap *:[[role=checkbox]]:translate-y-[2px] text-muted-foreground">
                        {patient.phone}
                      </td>
                      <td data-slot="table-cell" className="p-2 align-middle whitespace-nowrap *:[[role=checkbox]]:translate-y-[2px]">
                        {patient.age}
                      </td>
                      <td data-slot="table-cell" className="p-2 align-middle whitespace-nowrap *:[[role=checkbox]]:translate-y-[2px]">
                        {patient.gender}
                      </td>
                      <td data-slot="table-cell" className="p-2 align-middle whitespace-nowrap *:[[role=checkbox]]:translate-y-[2px]">
                        <span
                          data-slot="badge"
                          className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 transition-[color,box-shadow] overflow-hidden border-transparent [a&]:hover:bg-secondary/90 bg-secondary/10 text-secondary"
                        >
                          {patient.lastVisit}
                        </span>
                      </td>
                      <td data-slot="table-cell" className="p-2 align-middle whitespace-nowrap *:[[role=checkbox]]:translate-y-[2px]">
                        <div className="flex gap-3 md:gap-5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog('view', patient)}
                            className="hover:bg-accent group/item transition-all duration-300 px-1"
                          >
                            <Eye className="size-5 text-muted-foreground group-hover/item:text-white transition-colors" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog('edit', patient)}
                            className="hover:bg-accent group/item transition-all duration-300 px-1"
                          >
                            <SquarePen className="size-5 text-muted-foreground group-hover/item:text-white transition-colors" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(patient)}
                            className="hover:bg-destructive/10 group/item transition-all duration-300 px-1"
                          >
                            <Trash2 className="size-5 text-destructive/80 group-hover/item:text-destructive transition-colors" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPatients.length === 0 && (
                    <tr>
                      <td colSpan={6} className="h-24 text-center text-muted-foreground p-4">
                        لا يوجد سجلات مرضى تطابق بحثك.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف سجل المريض ${patientToDelete?.name || ''}؟`}
        confirmText="حذف"
        cancelText="إلغاء"
        variant="danger"
      />
    </section>
  );
};

export default PatientsList;
