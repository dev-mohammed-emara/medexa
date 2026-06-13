import AdminLayout from '@/components/layout/AdminLayout';
import { Badge } from '@/components/ui/badge';
import Input from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import TableFooter from '@/components/ui/TableFooter';
import { AlertTriangle, Calendar, Info, Search, User } from 'lucide-react';
import { useState } from 'react';

// Static logs data extracted from your UI mockup
const initialLogs = [
  {
    id: 1,
    time: "2024-05-18 14:30:25",
    admin: "أحمد الفني",
    action: "تعديل بيانات عيادة",
    target: "عيادة النور",
    type: "تحديث",
    severity: "منخفضة",
    details: "تم تحديث معلومات الاتصال"
  },
  {
    id: 2,
    time: "2024-05-18 13:15:40",
    admin: "خالد التقني",
    action: "حذف مستخدم",
    target: "محمد السعيد",
    type: "حذف",
    severity: "عالية",
    details: "تم حذف حساب المستخدم نهائياً"
  },
  {
    id: 3,
    time: "2024-05-18 12:45:10",
    admin: "سارة المالية",
    action: "الموافقة على عيادة",
    target: "عيادة الرعاية الطبية",
    type: "إنشاء",
    severity: "متوسطة",
    details: "تم قبول طلب تسجيل العيادة"
  },
  {
    id: 4,
    time: "2024-05-18 11:20:33",
    admin: "أحمد الفني",
    action: "تغيير صلاحيات مدير",
    target: "خالد التقني",
    type: "تحديث",
    severity: "عالية",
    details: "تم إضافة صلاحية إدارة المالية"
  },
  {
    id: 5,
    time: "2024-05-18 10:05:18",
    admin: "خالد التقني",
    action: "إغلاق تذكرة دعم",
    target: "تذكرة #145",
    type: "تحديث",
    severity: "منخفضة",
    details: "تم حل المشكلة وإغلاق التذكرة"
  },
  {
    id: 6,
    time: "2024-05-18 09:30:45",
    admin: "سارة المالية",
    action: "تصدير تقرير مالي",
    target: "تقارير مايو 2024",
    type: "قراءة",
    severity: "منخفضة",
    details: "تم تصدير البيانات المالية"
  },
  {
    id: 7,
    time: "2024-05-17 16:50:22",
    admin: "سارة المالية",
    action: "تحديث النظام",
    target: "النظام المالي",
    type: "تحديث",
    severity: "منخفضة",
    details: "تحديثات أمان دورية للأنظمة"
  }
];

const AdminLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter logic for search bar and select dropdowns
  const filteredLogs = initialLogs.filter(log => {
    const matchesSearch =
      log.admin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;

    return matchesSearch && matchesType && matchesSeverity;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  const handleFilterChange = (callback: () => void) => {
    callback();
    setCurrentPage(1);
  };

  // Calculate dynamic metrics based on the current logs array
  const totalActivities = initialLogs.length;
  const highRiskActivities = initialLogs.filter(l => l.severity === 'عالية').length;
  const deletionsCount = initialLogs.filter(l => l.type === 'حذف').length;

  // Helper function to get badge variant based on type
  const getTypeBadgeVariant = (type: string): 'blue' | 'green' | 'red' | 'yellow' | 'purple' => {
    switch (type) {
      case 'تحديث': return 'blue';
      case 'حذف': return 'red';
      case 'إنشاء': return 'green';
      default: return 'purple';
    }
  };

  // Helper function to get badge variant based on severity
  const getSeverityBadgeVariant = (severity: string): 'blue' | 'green' | 'red' | 'yellow' | 'purple' => {
    switch (severity) {
      case 'عالية': return 'red';
      case 'متوسطة': return 'yellow';
      default: return 'purple';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6" dir="rtl">


        {/* Header Section */}
        <div>
          <h1 className="text-3xl text-[#1A2B3C] mb-2 font-bold">سجلات التدقيق</h1>
          <p className="text-gray-500">مراقبة جميع الأنشطة والعمليات في النظام</p>
        </div>

        {/* Dashboard Analytics Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 gap-4">

          {/* Card 1: Total Activities */}
          <div className="rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">إجمالي الأنشطة</p>
                <h3 className="text-3xl text-[#0F172A] font-bold">{totalActivities}</h3>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <User className="text-white" size={28} />
              </div>
            </div>
          </div>

          {/* Card 2: High Risk Activities */}
          <div className="rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">أنشطة عالية الخطورة</p>
                <h3 className="text-3xl text-[#0F172A] font-bold">{highRiskActivities}</h3>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="text-white" size={28} />
              </div>
            </div>
          </div>

          {/* Card 3: Deletions */}
          <div className="rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">عمليات الحذف</p>
                <h3 className="text-3xl text-[#0F172A] font-bold">{deletionsCount}</h3>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="text-white" size={28} />
              </div>
            </div>
          </div>

        </div>

        {/* Filter and Table Container Panel */}
        <div className="rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-white border border-gray-200 shadow-sm">

          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-6">

            {/* Search Input */}
            <div className="flex-1 w-full">
              <Input
                placeholder="بحث في السجلات..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange(() => setSearchTerm(e.target.value))}
                icon={<Search size={18} />}
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex gap-4 w-full lg:w-auto">

              {/* Type Select */}
              <Select value={typeFilter} onValueChange={(value) => handleFilterChange(() => setTypeFilter(value))}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="جميع الأنواع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="تحديث">تحديث</SelectItem>
                  <SelectItem value="حذف">حذف</SelectItem>
                  <SelectItem value="إنشاء">إنشاء</SelectItem>
                  <SelectItem value="قراءة">قراءة</SelectItem>
                </SelectContent>
              </Select>

              {/* Severity Select */}
              <Select value={severityFilter} onValueChange={(value) => handleFilterChange(() => setSeverityFilter(value))}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="جميع المستويات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستويات</SelectItem>
                  <SelectItem value="منخفضة">منخفضة</SelectItem>
                  <SelectItem value="متوسطة">متوسطة</SelectItem>
                  <SelectItem value="عالية">عالية</SelectItem>
                </SelectContent>
              </Select>

            </div>
          </div>

          {/* Audit Logs Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الوقت</TableHead>
                <TableHead>المدير</TableHead>
                <TableHead>الإجراء</TableHead>
                <TableHead>الهدف</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الخطورة</TableHead>
                <TableHead>التفاصيل</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <TableRow
                    key={log.id}
                  >

                    {/* Time */}
                    <TableCell className="text-gray-500 font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-500" />
                        {log.time}
                      </div>
                    </TableCell>

                    {/* Admin */}
                    <TableCell className="text-[#1A2B3C] font-medium">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-500" />
                        {log.admin}
                      </div>
                    </TableCell>

                    {/* Action Description */}
                    <TableCell className="text-[#1A2B3C] font-medium">
                      {log.action}
                    </TableCell>

                    {/* Targeted Resource */}
                    <TableCell className="text-gray-600">
                      {log.target}
                    </TableCell>

                    {/* Type Badge */}
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(log.type)}>
                        {log.type}
                      </Badge>
                    </TableCell>

                    {/* Severity Badge */}
                    <TableCell>
                      <Badge variant={getSeverityBadgeVariant(log.severity)}>
                        {log.severity === 'عالية' && <AlertTriangle size={14} className="mr-1" />}
                        {log.severity === 'متوسطة' && <AlertTriangle size={14} className="mr-1" />}
                        {log.severity === 'منخفضة' && <Info size={14} className="mr-1" />}
                        {log.severity}
                      </Badge>
                    </TableCell>

                    {/* Details */}
                    <TableCell className="text-gray-600 text-sm max-w-xs truncate" title={log.details}>
                      {log.details}
                    </TableCell>

                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                    لا توجد سجلات مطابقة لخيارات البحث الحالية
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Table Footer */}
          <TableFooter
            totalItems={filteredLogs.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalPages={totalPages}
          />

        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminLogs;
