import { Calendar, DollarSign, TrendingUp, Users } from 'lucide-react'

export const statsData = [
  {
    label: 'عدد المرضى',
    value: 1234,
    change: '12%',
    sub: 'آخر 30 يوم',
    icon: Users,
    color: 'linear-gradient(90deg, #0B5A8E, #3FB8AF)',
    iconBg: 'from-[#0B5A8E]/10 to-[#3FB8AF]/10',
    iconColor: '#0B5A8E',
    progress: '60%'
  },
  {
    label: 'عدد المواعيد',
    value: 456,
    change: '8%',
    sub: 'هذا الشهر',
    icon: Calendar,
    color: 'linear-gradient(90deg, #3FB8AF, #5DD9D1)',
    iconBg: 'from-[#3FB8AF]/10 to-[#5DD9D1]/10',
    iconColor: '#3FB8AF',
    progress: '60%'
  },
  {
    label: 'إجمالي الإيرادات',
    value: 45000,
    change: '15%',
    sub: 'دينار أردني',
    icon: DollarSign,
    color: 'linear-gradient(90deg, #10B981, #14B8A6)',
    iconBg: 'from-emerald-500/10 to-teal-500/10',
    iconColor: '#10B981',
    progress: '60%',
    isCurrency: true
  },
  {
    label: 'معدل النمو',
    value: 23,
    change: '5%',
    sub: 'مقارنة بالشهر السابق',
    icon: TrendingUp,
    color: 'linear-gradient(90deg, #F59E0B, #F97316)',
    iconBg: 'from-amber-500/10 to-orange-500/10',
    iconColor: '#F59E0B',
    progress: '60%'
  }
];

export const genderData = [
  { name: 'ذكور', value: 50, color: '#0B5A8E' },
  { name: 'إناث', value: 50, color: '#3FB8AF' }
];

export const ageData = [
  { range: '0-18', value: 163, fill: '#0B5A8E' },
  { range: '19-35', value: 67, fill: '#0B5A8E' },
  { range: '36-50', value: 115, fill: '#0B5A8E' },
  { range: '51-65', value: 197, fill: '#0B5A8E' },
  { range: '65+', value: 24, fill: '#0B5A8E' }
];

export const appointmentData = [
  { name: 'السبت', value: 40 },
  { name: 'الأحد', value: 55 },
  { name: 'الاثنين', value: 45 },
  { name: 'الثلاثاء', value: 75 },
  { name: 'الأربعاء', value: 50 },
  { name: 'الخميس', value: 65 },
  { name: 'الجمعة', value: 30 }
];
