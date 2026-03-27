export interface Patient {
  id: number;
  name: string;
  phone: string;
  age: number;
  gender: string;
  lastVisit: string;
  dob: string;
  address: string;
  notes: string;
}

export const initialPatients: Patient[] = [
  {
    id: 1,
    name: 'أحمد محمد',
    phone: '0791234567',
    age: 45,
    gender: 'ذكر',
    lastVisit: '2024-03-20',
    dob: '1979-05-15',
    address: 'عمان، تلاع العلي، شارع الصحة، بناية 45',
    notes: 'يعاني من ضغط الدم المرتفع ويحتاج لمتابعة شهرية مع دواء لوزارتان'
  },
  {
    id: 2,
    name: 'سارة أحمد',
    phone: '0787654321',
    age: 32,
    gender: 'أنثى',
    lastVisit: '2024-03-22',
    dob: '1992-10-10',
    address: 'إربد، الحي الشمالي، دخلة مسجد عمار، منزل 12',
    notes: 'متابعة دورية لحالة الصداع النصفي'
  },
  {
    id: 3,
    name: 'محمود علي',
    phone: '0771122334',
    age: 28,
    gender: 'ذكر',
    lastVisit: '2024-03-15',
    dob: '1996-02-25',
    address: 'عمان، صويلح، حي الإرسال، مقابل البريد',
    notes: 'لديه حساسية من البنسلين ومنتجات الألبان'
  },
  {
    id: 4,
    name: 'ليلى يوسف',
    phone: '0790099887',
    age: 50,
    gender: 'أنثى',
    lastVisit: '2024-03-18',
    dob: '1974-07-30',
    address: 'الزرقاء، الوسط التجاري، شارع الجيش، عمارة النجاح',
    notes: 'مراجعة أولى لفحوصات السكري التراكمي'
  },
  {
    id: 5,
    name: 'خالد عمر',
    phone: '0785566778',
    age: 40,
    gender: 'ذكر',
    lastVisit: '2024-03-21',
    dob: '1984-12-05',
    address: 'عمان، الجبيهة، حي الزيتونة، بناية الصقر',
    notes: 'مريض سكري من النوع الثاني ويتمتع بنظام غذائي متوازن'
  },
  {
    id: 6,
    name: 'منى عبدالله',
    phone: '0774433221',
    age: 25,
    gender: 'أنثى',
    lastVisit: '2024-03-19',
    dob: '1999-03-15',
    address: 'عمان، مرج الحمام، حي السلام، منزل 88',
    notes: 'متابعة بخصوص ضعف النظر وتحتاج لفحص دوري'
  },
];
