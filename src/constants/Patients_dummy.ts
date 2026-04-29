export interface Patient {
  id: number;
  first_name_ar: string;
  surname_ar: string;
  last_name_ar: string;
  first_name_en: string;
  surname_en: string;
  last_name_en: string;
  name_ar: string;
  name_en: string;
  phone: string;
  age: number;
  gender_ar: string;
  gender_en: string;
  lastVisit: string;
  dob: string;
  address_ar: string;
  address_en: string;
  notes_ar: string;
  notes_en: string;
}

export const initialPatients: Patient[] = [
  {
    id: 1,
    first_name_ar: 'أحمد',
    surname_ar: 'محمد',
    last_name_ar: 'محمد',
    first_name_en: 'Ahmed',
    surname_en: 'Mohammed',
    last_name_en: 'Mohammed',
    name_ar: 'أحمد محمد',
    name_en: 'Ahmed Mohammed',
    phone: '0791234567',
    age: 45,
    gender_ar: 'ذكر',
    gender_en: 'Male',
    lastVisit: '2024-03-20',
    dob: '1979-05-15',
    address_ar: 'عمان، تلاع العلي، شارع الصحة، بناية 45',
    address_en: 'Amman, Tla Al-Ali, Health St, Building 45',
    notes_ar: 'يعاني من ضغط الدم المرتفع ويحتاج لمتابعة شهرية مع دواء لوزارتان',
    notes_en: 'Suffers from high blood pressure and needs monthly follow-up with Losartan'
  },
  {
    id: 2,
    first_name_ar: 'سارة',
    surname_ar: 'أحمد',
    last_name_ar: 'أحمد',
    first_name_en: 'Sara',
    surname_en: 'Ahmed',
    last_name_en: 'Ahmed',
    name_ar: 'سارة أحمد',
    name_en: 'Sara Ahmed',
    phone: '0787654321',
    age: 32,
    gender_ar: 'أنثى',
    gender_en: 'Female',
    lastVisit: '2024-03-22',
    dob: '1992-10-10',
    address_ar: 'إربد، الحي الشمالي، دخلة مسجد عمار، منزل 12',
    address_en: 'Irbid, Northern District, Ammar Mosque, House 12',
    notes_ar: 'متابعة دورية لحالة الصداع النصفي',
    notes_en: 'Regular follow-up for migraine condition'
  },
  {
    id: 3,
    first_name_ar: 'محمود',
    surname_ar: 'علي',
    last_name_ar: 'علي',
    first_name_en: 'Mahmoud',
    surname_en: 'Ali',
    last_name_en: 'Ali',
    name_ar: 'محمود علي',
    name_en: 'Mahmoud Ali',
    phone: '0771122334',
    age: 28,
    gender_ar: 'ذكر',
    gender_en: 'Male',
    lastVisit: '2024-03-15',
    dob: '1996-02-25',
    address_ar: 'عمان، صويلح، حي الإرسال، مقابل البريد',
    address_en: 'Amman, Sweileh, Al-Irsal neighborhood, opposite the post office',
    notes_ar: 'لديه حساسية من البنسلين ومنتجات الألبان',
    notes_en: 'Allergic to penicillin and dairy products'
  },
  {
    id: 4,
    first_name_ar: 'ليلى',
    surname_ar: 'يوسف',
    last_name_ar: 'يوسف',
    first_name_en: 'Layla',
    surname_en: 'Yousef',
    last_name_en: 'Yousef',
    name_ar: 'ليلى يوسف',
    name_en: 'Layla Yousef',
    phone: '0790099887',
    age: 50,
    gender_ar: 'أنثى',
    gender_en: 'Female',
    lastVisit: '2024-03-18',
    dob: '1974-07-30',
    address_ar: 'الزرقاء، الوسط التجاري، شارع الجيش، عمارة النجاح',
    address_en: 'Zarqa, City Center, Army St, Al-Najah Building',
    notes_ar: 'مراجعة أولى لفحوصات السكري التراكمي',
    notes_en: 'First review for cumulative diabetes tests'
  },
  {
    id: 5,
    first_name_ar: 'خالد',
    surname_ar: 'عمر',
    last_name_ar: 'عمر',
    first_name_en: 'Khaled',
    surname_en: 'Omar',
    last_name_en: 'Omar',
    name_ar: 'خالد عمر',
    name_en: 'Khaled Omar',
    phone: '0785566778',
    age: 40,
    gender_ar: 'ذكر',
    gender_en: 'Male',
    lastVisit: '2024-03-21',
    dob: '1984-12-05',
    address_ar: 'عمان، الجبيهة، حي الزيتونة، بناية الصقر',
    address_en: 'Amman, Jubaiha, Al-Zaitounah neighborhood, Al-Saqr Building',
    notes_ar: 'مريض سكري من النوع الثاني ويتمتع بنظام غذائي متوازن',
    notes_en: 'Type 2 diabetic with a balanced diet'
  },
  {
    id: 6,
    first_name_ar: 'منى',
    surname_ar: 'عبدالله',
    last_name_ar: 'عبدالله',
    first_name_en: 'Muna',
    surname_en: 'Abdullah',
    last_name_en: 'Abdullah',
    name_ar: 'منى عبدالله',
    name_en: 'Muna Abdullah',
    phone: '0774433221',
    age: 25,
    gender_ar: 'أنثى',
    gender_en: 'Female',
    lastVisit: '2024-03-19',
    dob: '1999-03-15',
    address_ar: 'عمان، مرج الحمام، حي السلام، منزل 88',
    address_en: 'Amman, Marj Al-Hamam, Al-Salam neighborhood, House 88',
    notes_ar: 'متابعة بخصوص ضعف النظر وتحتاج لفحص دوري',
    notes_en: 'Follow-up regarding poor vision and needs a regular exam'
  },
];
