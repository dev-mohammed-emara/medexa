import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { AlertTriangle, Calendar, ChevronLeft, ChevronRight, Info, User } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

// Static logs data - same as AdminLogs
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

const AdminLogDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAr } = useLanguage();

  const log = initialLogs.find(log => log.id === parseInt(id || '0'));
  const currentIndex = initialLogs.findIndex(log => log.id === parseInt(id || '0'));

  const previousLog = currentIndex > 0 ? initialLogs[currentIndex - 1] : null;
  const nextLog = currentIndex < initialLogs.length - 1 ? initialLogs[currentIndex + 1] : null;

  if (!log) {
    return (
      <main className="flex-1 p-8 overflow-auto">
        <div className="space-y-6" dir="rtl">
          <div className="text-center">
            <h1 className="text-3xl text-[#1A2B3C] mb-2 font-bold">السجل غير موجود</h1>
            <button
              onClick={() => navigate('/admin/audit-logs')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              العودة إلى السجلات
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Helper function to get badge variant based on type
  const getTypeBadgeVariant = (type: string): 'blue' | 'green' | 'red' | 'yellow' | 'purple' => {
    switch(type) {
      case 'تحديث': return 'blue';
      case 'حذف': return 'red';
      case 'إنشاء': return 'green';
      default: return 'purple';
    }
  };

  // Helper function to get badge variant based on severity
  const getSeverityBadgeVariant = (severity: string): 'blue' | 'green' | 'red' | 'yellow' | 'purple' => {
    switch(severity) {
      case 'عالية': return 'red';
      case 'متوسطة': return 'yellow';
      default: return 'purple';
    }
  };

  const PrevIcon = isAr ? ChevronRight : ChevronLeft;
  const NextIcon = isAr ? ChevronLeft : ChevronRight;

  return (
    <main className="flex-1 p-8 overflow-auto">
      <div className="space-y-6" dir="rtl">

        {/* Header with back button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/audit-logs')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isAr ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          <div>
            <h1 className="text-3xl text-[#1A2B3C] font-bold">تفاصيل السجل</h1>
            <p className="text-gray-500">معلومات كاملة عن النشاط</p>
          </div>
        </div>

        {/* Main Details Card */}
        <div className="rounded-xl transition-all duration-300 hover:shadow-lg p-8 bg-white border border-gray-200 shadow-sm space-y-8">

          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-200 pb-8">
            <div>
              <p className="text-sm text-gray-500 mb-2">الوقت والتاريخ</p>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-500" />
                <h2 className="text-xl text-[#1A2B3C] font-semibold">{log.time}</h2>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">المسؤول</p>
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-500" />
                <h2 className="text-xl text-[#1A2B3C] font-semibold">{log.admin}</h2>
              </div>
            </div>
          </div>

          {/* Action Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-200 pb-8">
            <div>
              <p className="text-sm text-gray-500 mb-2">الإجراء</p>
              <p className="text-lg text-[#1A2B3C] font-semibold">{log.action}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">الهدف</p>
              <p className="text-lg text-[#1A2B3C] font-semibold">{log.target}</p>
            </div>
          </div>

          {/* Type and Severity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-200 pb-8">
            <div>
              <p className="text-sm text-gray-500 mb-2">نوع العملية</p>
              <Badge variant={getTypeBadgeVariant(log.type)}>
                {log.type}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">مستوى الخطورة</p>
              <Badge variant={getSeverityBadgeVariant(log.severity)}>
                {log.severity === 'عالية' && <AlertTriangle size={14} className="mr-1" />}
                {log.severity === 'متوسطة' && <AlertTriangle size={14} className="mr-1" />}
                {log.severity === 'منخفضة' && <Info size={14} className="mr-1" />}
                {log.severity}
              </Badge>
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <p className="text-sm text-gray-500 mb-3">التفاصيل الكاملة</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-[#1A2B3C] whitespace-pre-wrap">{log.details}</p>
            </div>
          </div>

        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between">
          {previousLog ? (
            <button
              onClick={() => navigate(`/admin/audit-logs/${previousLog.id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PrevIcon size={18} />
              <span>السجل السابق</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={() => navigate('/admin/audit-logs')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            العودة إلى القائمة
          </button>

          {nextLog ? (
            <button
              onClick={() => navigate(`/admin/audit-logs/${nextLog.id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span>السجل التالي</span>
              <NextIcon size={18} />
            </button>
          ) : (
            <div />
          )}
        </div>

      </div>
    </main>
  );
};

export default AdminLogDetails;
