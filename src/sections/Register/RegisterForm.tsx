/* eslint-disable @typescript-eslint/no-explicit-any */
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Check, X } from 'lucide-react'
import "flatpickr/dist/flatpickr.css"
import { Arabic } from "flatpickr/dist/l10n/ar.js"
import React, { useOptimistic, useState, useTransition } from 'react'
import Flatpickr from "react-flatpickr"
import { FaCalendarAlt } from "react-icons/fa"
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { LuBuilding2, LuUser } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import { TransitionLink } from '../../components/transition/TransitionLink'
import BtnPrimary from '../../components/ui/BtnPrimary'
import Input from '../../components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"

import { usePreloader } from '../../contexts/PreloaderContext'
import { cn } from '../../utils/cn'

const RegisterForm = () => {
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // State for form data
  const [formData, setFormData] = useState({
    clinicName: '',
    specialty: '',
    country: '',
    city: '',
    address: '',
    phone: '',
    firstName: '',
    surname: '',
    lastName: '',
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
    (state: { status: string; message: string }, newMessage: string) => ({ ...state, status: 'submitting', message: newMessage })
  )

  const passwordCriteria = [
    { label: '8 أحرف على الأقل', met: formData.password.length >= 8 },
    { label: 'حرف كبير (A-Z)', met: /[A-Z]/.test(formData.password) },
    { label: 'رقم واحد (0-9)', met: /[0-9]/.test(formData.password) },
    { label: 'رمز خاص (!@#)', met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) },
  ];

  const strengthPoints = passwordCriteria.filter(c => c.met).length;

  const getStrengthColor = () => {
    if (strengthPoints <= 1) return 'bg-destructive';
    if (strengthPoints <= 3) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const validatePassword = (pwd: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    if (pwd.length < minLength) return "يجب أن تكون كلمة المرور 8 أحرف على الأقل";
    if (!hasUpperCase) return "يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل";
    if (!hasNumber) return "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل";
    if (!hasSpecialChar) return "يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل (!@#...)";
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Password validation
    const pwdError = validatePassword(formData.password);
    if (pwdError) {
      window.showToast(pwdError, 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      window.showToast('كلمتا المرور غير متطابقتين', 'error');
      return;
    }

    startTransition(async () => {
      setOptimisticStatus('جاري إرسال طلبك...')

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Success feedback
      window.showToast('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول')

      // Trigger seamless transition before navigating
      if (window.triggerExitTransition) {
        await window.triggerExitTransition()
      }
      navigate('/login')
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  return (
    <section className="min-h-screen bg-background px-4 py-12 md:px-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <header className={cn(
          "mb-8 text-center opacity-0",
          canAnimate && "animate-fadeUp animate-delay-0",
          isExiting && "animate-fadeDownOut"
        )}>
          <figure className="mb-2">
            <h1 className="text-4xl flex justify-center" style={{ fontWeight: 700, color: 'rgb(11, 90, 142)' }}>
               <img src="/images/logo.png" alt="Medexa Cloud" className="h-16 w-auto" />
            </h1>
          </figure>
          <p className="text-muted-foreground">تسجيل عيادة جديدة</p>
        </header>

        <form className={cn(
          "space-y-6 opacity-0",
          canAnimate && "animate-fadeUp animate-delay-100",
          isExiting && "animate-fadeDownOut"
        )} onSubmit={handleSubmit}>
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
                <Select
                  onValueChange={(val: string) => setFormData((prev: any) => ({...prev, specialty: val}))}
                  value={formData.specialty}
                  required
                >
                  <SelectTrigger className="focus:ring-4 focus:ring-primary/10">
                    <SelectValue placeholder="اختر التخصص" />
                  </SelectTrigger>
                  <SelectContent className="text-right! [direction:rtl]">
                    <SelectItem value="general">طب عام</SelectItem>
                    <SelectItem value="pediatrics">أطفال</SelectItem>
                    <SelectItem value="dentistry">أسنان</SelectItem>
                    <SelectItem value="dermatology">جلدية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1a2b3c] pr-1 block mb-2">الدولة</label>
                <Input
                  name="country"
                  required
                  placeholder="مثال: الأردن"
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-[#1a2b3c] pr-1 block mb-2">الاسم الأول</label>
                <Input
                  name="firstName"
                  required
                  placeholder="أدخل الاسم الأول"
                  value={formData.firstName}
                  onChange={handleChange}
                  icon={<LuUser size={18} />}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#1a2b3c] pr-1 block mb-2">اسم الأب (الشهرة)</label>
                <Input
                  name="surname"
                  required
                  placeholder="أدخل اسم الأب"
                  value={formData.surname}
                  onChange={handleChange}
                  icon={<LuUser size={18} />}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#1a2b3c] pr-1 block mb-2">الاسم الأخير</label>
                <Input
                  name="lastName"
                  required
                  placeholder="أدخل الاسم الأخير"
                  value={formData.lastName}
                  onChange={handleChange}
                  icon={<LuUser size={18} />}
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
                  placeholder="07XXXXXXXX"
                  value={formData.ownerPhone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1a2b3c] pr-1 block mb-2">كلمة المرور</label>
                <div className="relative group">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    autoComplete="new-password"
                    placeholder={showPassword ? "P@ssword1" : "••••••••"}
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors outline-none z-10"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>

                {formData.password.length > 0 && (
                  <div className="mt-4 animate-fade">
                    <div className="flex gap-2">
                      {passwordCriteria.map((criterion, i) => (
                        <div key={i} className="flex-1 flex flex-col gap-2">
                          {/* Segmented bar on top */}
                          <div
                            className={cn(
                              "h-1.5 rounded-full transition-all duration-500",
                              criterion.met ? getStrengthColor() : "bg-slate-100"
                            )}
                          />

                          {/* Instruction + Icon below */}
                          <div className="flex items-center justify-center gap-1 px-0.5">
                            {criterion.met ? (
                              <Check className="size-3 text-emerald-500 stroke-[4px] shrink-0" />
                            ) : (
                              <X className="size-3 text-slate-300 stroke-[4px] shrink-0" />
                            )}
                            <span className={cn(
                              "text-[9px] transition-colors leading-tight text-center",
                              criterion.met ? "text-emerald-700 font-bold" : "text-muted-foreground/70"
                            )}>
                              {criterion.label}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1a2b3c] pr-1 block mb-2">تأكيد كلمة المرور</label>
                <div className="relative group">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    autoComplete="new-password"
                    placeholder={showConfirmPassword ? "P@ssword1" : "••••••••"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors outline-none z-10"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1a2b3c] pr-1 block mb-2">الجنس</label>
                <Select
                  onValueChange={(val: string) => setFormData((prev: any) => ({...prev, gender: val}))}
                  value={formData.gender}
                  required
                >
                  <SelectTrigger className="focus:ring-4 focus:ring-primary/10">
                    <SelectValue placeholder="اختر الجنس" />
                  </SelectTrigger>
                  <SelectContent className="text-right">
                    <SelectItem value="male">ذكر</SelectItem>
                    <SelectItem value="female">أنثى</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1a2b3c] pr-1 block mb-2">تاريخ الميلاد</label>
                <div className="relative group flex items-center justify-between h-12 bg-input-background border border-border rounded-xl px-4 transition-all focus-within:ring-4 focus-within:ring-primary/10">
                  <Flatpickr
                    value={formData.dob}
                    onChange={([date]) => {
                      setFormData((prev: any) => ({...prev, dob: date ? date.toISOString().split('T')[0] : ''}))
                    }}
                    options={{
                      locale: Arabic,
                      dateFormat: "d F Y",
                      disableMobile: true,
                      maxDate: "today",
                      formatDate: (date: Date) => {
                        return format(date, "yyyy-MMMM-dd", { locale: ar });
                      }
                    }}
                    placeholder="dd/mm/yyyy"
                    className="flex-1 bg-transparent border-none outline-none text-right font-bold h-full text-base md:text-sm"
                  />
                  <FaCalendarAlt className="text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors size-4" />
                </div>
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
            <TransitionLink // Changed from Link to TransitionLink
              href="/" // Changed from 'to' to 'href'
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:shadow-md border border-border bg-background text-foreground hover:bg-slate-50 hover:border-primary/30 px-8 h-12"
            >
              إلغاء
            </TransitionLink>
          </footer>

          <footer className="text-center text-sm text-muted-foreground pb-8">
            لديك حساب بالفعل؟{' '}
            <TransitionLink href="/login" className="text-primary hover:underline">
              تسجيل الدخول
            </TransitionLink>
          </footer>
        </form>
      </div>
    </section>
  )
}

export default RegisterForm
