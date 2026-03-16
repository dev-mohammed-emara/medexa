import React, { useState, useOptimistic, useTransition } from 'react'
import { Link } from 'react-router-dom'
import { LuBuilding2, LuUser, LuChevronDown } from 'react-icons/lu'
import BtnPrimary from '../../components/ui/BtnPrimary'
import Input from '../../components/ui/Input'

const RegisterForm = () => {
  const [isPending, startTransition] = useTransition()

  // State for form data
  const [formData, setFormData] = useState({
    clinicName: '',
    specialty: '',
    country: '',
    city: '',
    address: '',
    phone: '',
    fullName: '',
    email: '',
    ownerPhone: '',
    password: '',
    confirmPassword: '',
    gender: '',
    dob: ''
  })

  // Optimistic state for submission feedback
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    { status: 'idle', message: '' },
    (state, newMessage: string) => ({ ...state, status: 'submitting', message: newMessage })
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      setOptimisticStatus('جاري إرسال طلبك...')

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // After success logic would go here
      console.log('Form submitted:', formData)
      alert('تم إرسال طلبك بنجاح! سنتواصل معك قريباً.')
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <section className="min-h-screen bg-background px-4 py-12 md:px-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center opacity-0 animate-fadeUp animate-delay-200">
          <figure className="mb-2">
             <h1 className="text-4xl" style={{ fontWeight: 700, color: 'rgb(11, 90, 142)' }}>
              Medexa Cloud
            </h1>
          </figure>
          <p className="text-muted-foreground">تسجيل عيادة جديدة</p>
        </header>

        <form className="space-y-6 opacity-0 animate-fadeUp animate-delay-400" onSubmit={handleSubmit}>
          {/* Clinic Information Card */}
          <article className="bg-white rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 p-6">
            <header className="flex items-center gap-3 mb-12">
              <figure className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <LuBuilding2 className="w-5 h-5 text-primary" />
              </figure>
              <h3 className="text-xl" style={{ fontWeight: 600 }}>معلومات العيادة</h3>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-[#1a2b3c] pr-1 block mb-2">اسم العيادة</label>
                <Input
                  name="clinicName"
                  required
                  placeholder="أدخل اسم العيادة بالكامل"
                  value={formData.clinicName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1a2b3c] pr-1 block mb-2">التخصص الطبي</label>
                <div className="relative">
                  <select
                    name="specialty"
                    required
                    value={formData.specialty}
                    onChange={handleChange}
                    className="w-full h-12 bg-input-background border border-border rounded-xl px-4 appearance-none outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-base md:text-sm"
                  >
                    <option value="" disabled>اختر التخصص</option>
                    <option value="general">طب عام</option>
                    <option value="pediatrics">أطفال</option>
                    <option value="dentistry">أسنان</option>
                    <option value="dermatology">جلدية</option>
                  </select>
                  <LuChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1a2b3c] pr-1 block mb-2">الدولة</label>
                <Input
                  name="country"
                  required
                  placeholder="مثال: المملكة العربية السعودية"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1a2b3c] pr-1 block mb-2">المدينة</label>
                <Input
                  name="city"
                  required
                  placeholder="أدخل اسم المدينة"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-[#1a2b3c] pr-1 block mb-2">العنوان بالتفصيل</label>
                <Input
                  name="address"
                  required
                  placeholder="الشارع، الحي، المبنى"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1a2b3c] pr-1 block mb-2">رقم الهاتف</label>
                <Input
                  type="tel"
                  name="phone"
                  required
                  placeholder="0XXXXXXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </article>

          {/* Owner Information Card */}
          <article className="bg-white rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 p-6">
            <header className="flex items-center gap-3 mb-6">
              <figure className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <LuUser className="w-5 h-5 text-secondary" />
              </figure>
              <h3 className="text-xl" style={{ fontWeight: 600 }}>معلومات مالك العيادة</h3>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-[#1a2b3c] pr-1 block mb-2">الاسم الكامل</label>
                <Input
                  name="fullName"
                  required
                  placeholder="أدخل اسم الطبيب أو المسؤول"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1a2b3c] pr-1 block mb-2">البريد الإلكتروني</label>
                <Input
                  type="email"
                  name="email"
                  required
                  placeholder="example@clinic.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1a2b3c] pr-1 block mb-2">رقم الجوال</label>
                <Input
                  type="tel"
                  name="ownerPhone"
                  required
                  autoComplete="tel"
                  placeholder="05XXXXXXXX"
                  value={formData.ownerPhone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1a2b3c] pr-1 block mb-2">كلمة المرور</label>
                <Input
                  type="password"
                  name="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1a2b3c] pr-1 block mb-2">تأكيد كلمة المرور</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1a2b3c] pr-1 block mb-2">الجنس</label>
                <div className="relative">
                  <select
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full h-12 bg-input-background border border-border rounded-xl px-4 appearance-none outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-base md:text-sm"
                  >
                    <option value="" disabled>اختر الجنس</option>
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                  <LuChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1a2b3c] pr-1 block mb-2">تاريخ الميلاد</label>
                <Input
                  type="date"
                  name="dob"
                  required
                  value={formData.dob}
                  onChange={handleChange}
                />
              </div>
            </div>
          </article>

          {/* Submission Buttons */}
          <footer className="flex gap-4 pt-2">
            <BtnPrimary
              type="submit"
              isPending={isPending}
              className="flex-1"
            >
              {isPending ? optimisticStatus.message || 'جاري الإرسال...' : 'إرسال الطلب'}
            </BtnPrimary>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:shadow-md border border-border bg-background text-foreground hover:bg-slate-50 hover:border-primary/30 px-8 h-12"
            >
              إلغاء
            </Link>
          </footer>

          <footer className="text-center text-sm text-muted-foreground pb-8">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="text-primary hover:underline">
              تسجيل الدخول
            </Link>
          </footer>
        </form>
      </div>
    </section>
  )
}

export default RegisterForm
