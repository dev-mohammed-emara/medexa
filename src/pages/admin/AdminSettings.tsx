import AdminLayout from '@/components/layout/AdminLayout';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Shield, SquarePen, Stethoscope, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ImBlocked } from 'react-icons/im';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';



interface Category {
  id: number;
  name: string;
  clinicsCount: number;
  isActive: boolean;
}

interface Insurance {
  id: number;
  name: string;
  isActive: boolean;
}

const initialCategories: Category[] = [
  { id: 1, name: 'طب عام', clinicsCount: 45, isActive: true },
  { id: 2, name: 'طب أسنان', clinicsCount: 30, isActive: true },
  { id: 3, name: 'أمراض القلب', clinicsCount: 15, isActive: true },
  { id: 4, name: 'جراحة عامة', clinicsCount: 12, isActive: true },
  { id: 5, name: 'طب الأطفال', clinicsCount: 22, isActive: true },
  { id: 6, name: 'النساء والولادة', clinicsCount: 18, isActive: true },
];

const initialInsurances: Insurance[] = [
  { id: 1, name: 'التأمين الصحي الوطني', isActive: true },
  { id: 2, name: 'تأمين الجيش', isActive: true },
];

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState<'insurances' | 'categories'>('categories');
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [insurances, setInsurances] = useState<Insurance[]>(initialInsurances);

  // Modal Control States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Form Field State
  const [name, setName] = useState('');

  const resetForm = () => {
    setName('');
    setSelectedId(null);
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (item: Category | Insurance) => {
    setModalMode('edit');
    setSelectedId(item.id);
    setName(item.name);
    setIsAddModalOpen(true);
  };

  const handleConfirmAdd = () => {
    const contextName = activeTab === 'insurances' ? 'تأمين' : 'فئة طبية';

    if (modalMode === 'add') {
      if (activeTab === 'categories') {
        const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
        const newCat: Category = {
          id: newId,
          name: name || 'فئة جديدة',
          clinicsCount: 0,
          isActive: true
        };
        setCategories(prev => [...prev, newCat]);
      } else {
        const newId = insurances.length > 0 ? Math.max(...insurances.map(i => i.id)) + 1 : 1;
        const newIns: Insurance = {
          id: newId,
          name: name || 'تأمين جديد',
          isActive: true
        };
        setInsurances(prev => [...prev, newIns]);
      }
      window.showToast?.(`تم إضافة ${contextName} جديد بنجاح`, 'success');
    } else {
      if (activeTab === 'categories' && selectedId !== null) {
        setCategories(prev => prev.map(cat =>
          cat.id === selectedId ? { ...cat, name: name } : cat
        ));
      } else if (activeTab === 'insurances' && selectedId !== null) {
        setInsurances(prev => prev.map(ins =>
          ins.id === selectedId ? { ...ins, name: name } : ins
        ));
      }
      window.showToast?.(`تم تعديل بيانات ال${contextName} بنجاح`, 'success');
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const handleToggleStatus = (id: number) => {
    if (activeTab === 'categories') {
      setCategories(prev =>
        prev.map(cat => {
          if (cat.id === id) {
            const newStatus = !cat.isActive;
            window.showToast?.(newStatus ? `تم تفعيل "${cat.name}"` : `تم إلغاء تفعيل "${cat.name}"`, newStatus ? 'success' : 'error');
            return { ...cat, isActive: newStatus };
          }
          return cat;
        })
      );
    } else {
      setInsurances(prev =>
        prev.map(ins => {
          if (ins.id === id) {
            const newStatus = !ins.isActive;
            window.showToast?.(newStatus ? `تم تفعيل "${ins.name}"` : `تم إلغاء تفعيل "${ins.name}"`, newStatus ? 'success' : 'error');
            return { ...ins, isActive: newStatus };
          }
          return ins;
        })
      );
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (activeTab === 'categories') {
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } else {
      setInsurances(prev => prev.filter(ins => ins.id !== id));
    }
    window.showToast?.(`تم حذف "${name}" بنجاح`, 'error');
  };

  const activeCount = categories.filter(c => c.isActive).length;
  const activeInsurancesCount = insurances.filter(i => i.isActive).length;

  const contextText = activeTab === 'insurances' ? 'التأمين' : 'الفئة الطبية';
  const modalTitleText = modalMode === 'add' ? `إضافة ${contextText} جديد` : `تعديل ${contextText}`;
  const modalDescriptionText = modalMode === 'add' ? `إنشاء ${contextText} جديد في النظام` : `تحديث اسم ${contextText}`;
  const confirmButtonText = modalMode === 'add' ? `إضافة ${contextText}` : 'حفظ التغييرات';

  return (
    <AdminLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div>
          <h1 className="text-3xl text-[#1A2B3C] mb-2 font-bold">إعدادات النظام</h1>
          <p className="text-gray-500">إدارة التأمينات والفئات الطبية</p>
        </div>

        {/* Main Card with Tabs */}
        <div className="rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-white border border-gray-200 shadow-sm">

          {/* Tabs Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2 bg-gray-100 border border-gray-200 rounded-xl p-1 w-fit">
              <button
                onClick={() => setActiveTab('insurances')}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${activeTab === 'insurances'
                  ? 'bg-blue-500 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Shield size={18} />
                التأمينات
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${activeTab === 'categories'
                  ? 'bg-blue-500 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Stethoscope size={18} />
                الفئات الطبية
              </button>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center justify-center gap-2 bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all hover:shadow-lg cursor-pointer"
            >
              <Plus size={18} />
              إضافة جديد
            </button>
          </div>

          {/* Insurances Tab Content */}
          {activeTab === 'insurances' && (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table data-slot="table" className="w-full caption-bottom text-sm">
                  <thead data-slot="table-header" className="[&_tr]:border-b">
                    <tr data-slot="table-row" className="data-[state=selected]:bg-muted border-b transition-colors border-gray-200 hover:bg-gray-50/50">
                      <th data-slot="table-head" className="h-10 px-2 text-right align-middle font-medium whitespace-nowrap text-gray-600">الرقم</th>
                      <th data-slot="table-head" className="h-10 px-2 text-right align-middle whitespace-nowrap text-gray-600 font-semibold">اسم التأمين</th>
                      <th data-slot="table-head" className="h-10 px-2 text-right align-middle whitespace-nowrap text-gray-600 font-semibold">الحالة</th>
                      <th data-slot="table-head" className="h-10 px-2 align-middle whitespace-nowrap text-gray-600 font-semibold text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody data-slot="table-body" className="[&_tr:last-child]:border-0">
                    {insurances.map((insurance) => (
                      <tr key={insurance.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors" style={{ opacity: 1, transform: 'none' }}>
                        <td data-slot="table-cell" className="p-2 align-middle whitespace-nowrap text-[#0F172A] font-mono text-right">{insurance.id}</td>
                        <td data-slot="table-cell" className="p-2 align-middle whitespace-nowrap text-[#1A2B3C] font-medium text-right">{insurance.name}</td>
                        <td data-slot="table-cell" className="p-2 align-middle whitespace-nowrap text-right">
                          <button
                            onClick={() => handleToggleStatus(insurance.id)}
                            data-slot="badge"
                            className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 border cursor-pointer transition-colors ${insurance.isActive
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                              }`}
                          >
                            {insurance.isActive ? 'نشط' : 'معطّل'}
                          </button>
                        </td>
                        <td data-slot="table-cell" className="p-2 align-middle whitespace-nowrap">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleOpenEditModal(insurance)}
                              data-slot="button"
                              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 h-8 rounded-md px-2.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                            >
                              <SquarePen size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(insurance.id, insurance.name)}
                              data-slot="button"
                              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300 h-8 rounded-md px-2.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Stats for Insurances */}
              <div className="mt-6 text-sm text-gray-500 flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div>إجمالي الشركات: <span className="font-semibold text-gray-700">{insurances.length}</span></div>
                <div>الشركات النشطة: <span className="font-semibold text-emerald-600">{activeInsurancesCount}</span></div>
              </div>
            </>
          )}

          {/* Categories Tab Content */}
          {activeTab === 'categories' && (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="text-right font-bold text-gray-700">الرقم</TableHead>
                      <TableHead className="text-right font-bold text-gray-700">الفئة الطبية</TableHead>
                      <TableHead className="text-right font-bold text-gray-700">عدد العيادات</TableHead>
                      <TableHead className="text-right font-bold text-gray-700">الحالة</TableHead>
                      <TableHead className="text-center font-bold text-gray-700">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="text-[#0F172A] font-mono">
                          {category.id}
                        </TableCell>
                        <TableCell className="text-[#1A2B3C] font-medium">
                          {category.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="blue">
                            {category.clinicsCount} عيادة
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => handleToggleStatus(category.id)}
                            className={`inline-flex items-center justify-center rounded-md px-2.5 py-1 text-xs font-medium border transition-all cursor-pointer ${category.isActive
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                              }`}
                          >
                            {category.isActive ? (
                              <>
                                <IoMdCheckmarkCircleOutline size={14} className="ml-1" />
                                نشط
                              </>
                            ) : (
                              <>
                                <ImBlocked size={12} className="ml-1" />
                                معطّل
                              </>
                            )}
                          </button>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleOpenEditModal(category)}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-md text-blue-500 hover:text-blue-600 hover:bg-blue-500/20 transition-all cursor-pointer"
                            >
                              <SquarePen size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(category.id, category.name)}
                              className="inline-flex items-center justify-center h-8 w-8 rounded-md text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Footer Stats for Categories */}
              <div className="mt-6 text-sm text-gray-500 flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div>إجمالي الفئات: <span className="font-semibold text-gray-700">{categories.length}</span></div>
                <div>الفئات النشطة: <span className="font-semibold text-emerald-600">{activeCount}</span></div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Backdrop overlay style synced with modal state */}
      {isAddModalOpen && (
        <div
          data-state="open"
          data-slot="dialog-overlay"
          className="fixed inset-0 z-50 bg-black/50 transition-all duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 pointer-events-auto block"
          aria-hidden="true"
          onClick={() => setIsAddModalOpen(false)}
        ></div>
      )}

      {/* Modal Content */}
      {isAddModalOpen && (
        <div
          role="dialog"
          id="radix-:rce:"
          aria-describedby="radix-:rcg:"
          aria-labelledby="radix-:rcf:"
          data-state="open"
          data-slot="dialog-content"
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg bg-white border-gray-200"
          dir="rtl"
          tabIndex={-1}
          style={{ pointerEvents: 'auto' }}
        >
          <div data-slot="dialog-header" className="flex flex-col gap-2 text-center sm:text-left">
            <h2 id="radix-:rcf:" data-slot="dialog-title" className="font-semibold text-2xl text-[#1A2B3C] text-right">
              {modalTitleText}
            </h2>
            <p id="radix-:rcg:" data-slot="dialog-description" className="text-sm text-gray-500 text-right">
              {modalDescriptionText}
            </p>
          </div>

          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2 text-right">الاسم</label>
              <input
                data-slot="input"
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-gray-50 border-gray-200 text-right"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={activeTab === 'insurances' ? 'أدخل اسم التأمين' : 'أدخل اسم الفئة الطبية'}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirmAdd}
                data-slot="button"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md hover:bg-primary/90 hover:shadow-primary/20 h-9 px-4 py-2 has-[>svg]:px-3 flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square-pen ml-2">
                  <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"></path>
                </svg>
                {confirmButtonText}
              </button>

              <button
                onClick={() => setIsAddModalOpen(false)}
                data-slot="button"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 h-9 px-4 py-2 flex-1 border border-gray-200 text-gray-600 hover:text-gray-900 cursor-pointer hover:bg-gray-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSettings;