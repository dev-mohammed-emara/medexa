import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Mail, Lock, Eye, EyeOff, CircleCheck, TrendingUp, Users, BarChart2, Building2 } from 'lucide-react'
import gsap from 'gsap'
import { usePreloader } from '../../contexts/PreloaderContext'
import { cn } from '../../utils/cn'

const AdminLogin = () => {
  const navigate = useNavigate()
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting
  
  // State variables
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Refs for animations
  const formContainerRef = useRef<HTMLDivElement>(null)
  const heroContainerRef = useRef<HTMLDivElement>(null)
  const logoShieldRef = useRef<HTMLDivElement>(null)
  const formTitleRef = useRef<HTMLHeadingElement>(null)
  const formSubtitleRef = useRef<HTMLParagraphElement>(null)
  const formFieldsRef = useRef<HTMLDivElement>(null)
  const secureBannerRef = useRef<HTMLDivElement>(null)
  
  const heroLogoRef = useRef<HTMLDivElement>(null)
  const heroTextRef = useRef<HTMLDivElement>(null)
  const heroCardsRef = useRef<HTMLDivElement>(null)
  const heroStatsRef = useRef<HTMLDivElement>(null)
  const blurCircle1Ref = useRef<HTMLDivElement>(null)
  const blurCircle2Ref = useRef<HTMLDivElement>(null)

  // GSAP animations
  useEffect(() => {
    if (!canAnimate) return

    // 1. Initial State resets
    gsap.set([formContainerRef.current, heroContainerRef.current], { opacity: 0 })
    
    // 2. Main containers fade-in (snappier, shorter duration)
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.6 } })
    
    tl.to(formContainerRef.current, { opacity: 1, x: 0, duration: 0.5 })
      .to(heroContainerRef.current, { opacity: 1, x: 0, duration: 0.5 }, '-=0.4')

    // 3. Form elements stagger (starting snappier since shield is handled by CSS)
    const formTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    formTl.fromTo([formTitleRef.current, formSubtitleRef.current], { y: 15, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.5 })
      .fromTo(formFieldsRef.current?.children || [], { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.5 }, '-=0.3')
      .fromTo(secureBannerRef.current, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.2')

    // 4. Hero elements stagger (snappier durations and offsets)
    const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } })
    heroTl.fromTo(heroLogoRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: 0.15 })
      .fromTo(heroTextRef.current?.children || [], { y: 25, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.6 }, '-=0.4')
      .fromTo(heroCardsRef.current?.children || [], { scale: 0.95, y: 15, opacity: 0 }, { scale: 1, y: 0, opacity: 1, stagger: 0.08, duration: 0.6 }, '-=0.4')
      .fromTo(heroStatsRef.current?.children || [], { y: 15, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.6 }, '-=0.3')

    // 5. Blur background animate
    const rotate1 = gsap.to(blurCircle1Ref.current, {
      scale: 1.25,
      rotate: 120,
      duration: 12,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
    const rotate2 = gsap.to(blurCircle2Ref.current, {
      scale: 1.15,
      rotate: -90,
      duration: 10,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })

    return () => {
      tl.kill()
      formTl.kill()
      heroTl.kill()
      rotate1.kill()
      rotate2.kill()
    }
  }, [canAnimate])

  // GSAP Exit animation
  useEffect(() => {
    if (isExiting) {
      gsap.to(formContainerRef.current, { opacity: 0, y: 40, duration: 0.6, ease: 'power3.in' })
      gsap.to(heroContainerRef.current, { opacity: 0, y: 40, duration: 0.6, ease: 'power3.in' })
    }
  }, [isExiting])

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    // Add a small delay to simulate server communication and show premium loader
    setTimeout(() => {
      // Mock validation (any credential will work, but defaults matching template is nice)
      if (email.trim() === '') {
        setErrorMessage('يرجى إدخال البريد الإلكتروني')
        setIsLoading(false)
        return
      }

      // Store admin token & session
      localStorage.setItem('admin_token', 'medexa-cloud-admin-token-2026')
      localStorage.setItem('admin_email', email)
      
      // Clean up normal user session to avoid collision if desired
      localStorage.removeItem('isLoggedIn')

      // Trigger exit transition if available, then navigate
      if (window.triggerExitTransition) {
        window.triggerExitTransition()
          .then(() => {
            navigate('/admin/dashboard')
          })
          .catch(() => {
            navigate('/admin/dashboard')
          })
      } else {
        navigate('/admin/dashboard')
      }
    }, 1200)
  }

  return (
    <div className="min-h-screen flex w-full" dir="rtl">
      {/* Form Side (Right in RTL) */}
      <div 
        ref={formContainerRef}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white opacity-0"
      >
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10">
            <div 
              ref={logoShieldRef}
              className={cn(
                "w-16 h-16 bg-gradient-to-br from-[#0B5A8E] to-[#3FB8AF] rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6 transition-transform hover:rotate-12 duration-300 opacity-0 origin-bottom",
                canAnimate && "animate-growUp"
              )}
            >
              <Shield className="text-white size-8" />
            </div>
            <h1 
              ref={formTitleRef}
              className="text-3xl text-[#1A2B3C] mb-2 font-bold"
            >
              Medexa Cloud Admin
            </h1>
            <p 
              ref={formSubtitleRef}
              className="text-gray-500"
            >
              لوحة التحكم الإدارية
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div ref={formFieldsRef} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-sm text-gray-700 mb-2 font-medium">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex w-full rounded-md border border-gray-200 px-3 py-1 text-base transition-all outline-none pr-10 h-12 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-[#0B5A8E]/20 focus:border-[#0B5A8E]" 
                    placeholder="admin@medexa.jo" 
                    required 
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm text-gray-700 mb-2 font-medium">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex w-full rounded-md border border-gray-200 px-3 py-1 text-base transition-all outline-none pr-10 pl-10 h-12 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-[#0B5A8E]/20 focus:border-[#0B5A8E]" 
                    placeholder="••••••••" 
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0B5A8E] transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <p className="text-red-500 text-sm font-medium mt-1 text-right">{errorMessage}</p>
              )}

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`peer size-4 shrink-0 rounded-[4px] border shadow-xs transition-all outline-none flex items-center justify-center cursor-pointer ${rememberMe ? 'bg-[#0B5A8E] border-[#0B5A8E]' : 'bg-gray-50 border-gray-300'}`}
                  >
                    {rememberMe && (
                      <span className="block size-2 bg-white rounded-[1px]" />
                    )}
                  </button>
                  <span 
                    onClick={() => setRememberMe(!rememberMe)}
                    className="text-sm text-gray-600 cursor-pointer select-none"
                  >
                    تذكرني
                  </span>
                </div>
                <a 
                  href="#" 
                  onClick={(e) => e.preventDefault()}
                  className="text-sm text-[#0B5A8E] hover:text-[#3FB8AF] font-medium transition-colors"
                >
                  نسيت كلمة المرور؟
                </a>
              </div>

              {/* Submit Button */}
              <button 
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium duration-300 disabled:pointer-events-none disabled:opacity-70 outline-none w-full h-12 bg-gradient-to-r from-[#0B5A8E] to-[#3FB8AF] hover:from-[#094a76] hover:to-[#35a59d] text-white shadow-lg shadow-[#0B5A8E]/20 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md cursor-pointer"
                type="submit"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "تسجيل الدخول"
                )}
              </button>
            </div>
          </form>

          {/* Secure banner */}
          <div 
            ref={secureBannerRef}
            className="mt-8 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <CircleCheck className="text-white size-4" />
              </div>
              <div className="text-right">
                <p className="text-sm text-emerald-900 font-medium mb-1">اتصال آمن ومحمي</p>
                <p className="text-xs text-emerald-700 leading-relaxed">جميع بياناتك محمية بتشفير من الدرجة المؤسسية ونظام أمان متقدم</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Side (Left in RTL) */}
      <div 
        ref={heroContainerRef}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0B5A8E] via-[#0f6ba0] to-[#3FB8AF] p-12 flex-col justify-between relative overflow-hidden opacity-0"
      >
        {/* Background Blur Circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            ref={blurCircle1Ref}
            className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          />
          <div 
            ref={blurCircle2Ref}
            className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          />
        </div>

        {/* Hero Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className={cn(
              "w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/30 opacity-0 origin-bottom",
              canAnimate && "animate-growUp animate-delay-100"
            )}>
              <Shield className="text-white size-6" />
            </div>
            <div ref={heroLogoRef} className="text-right">
              <h2 className="text-2xl text-white font-bold">Medexa Cloud</h2>
              <p className="text-sm text-white/80">Enterprise Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Hero Features Grid */}
        <div ref={heroTextRef} className="space-y-6 relative z-10 text-right">
          <div>
            <h3 className="text-4xl text-white mb-4 font-bold leading-tight">إدارة شاملة لمنصتك الطبية</h3>
            <p className="text-lg text-white/90 leading-relaxed">
              تحكم كامل في جميع العيادات والمستخدمين مع تحليلات متقدمة وتقارير تفصيلية
            </p>
          </div>

          <div ref={heroCardsRef} className="grid grid-cols-2 gap-4 pt-6">
            <div className="bg-white/10 backdrop-blur-xl p-5 rounded-xl border border-white/20 hover:bg-white/15 transition-all cursor-default group hover:-translate-y-1 duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Shield className="text-white size-5" />
              </div>
              <p className="text-white font-medium">2FA متقدم</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl p-5 rounded-xl border border-white/20 hover:bg-white/15 transition-all cursor-default group hover:-translate-y-1 duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <BarChart2 className="text-white size-5" />
              </div>
              <p className="text-white font-medium">تحليلات شاملة</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl p-5 rounded-xl border border-white/20 hover:bg-white/15 transition-all cursor-default group hover:-translate-y-1 duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="text-white size-5" />
              </div>
              <p className="text-white font-medium">إدارة متطورة</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl p-5 rounded-xl border border-white/20 hover:bg-white/15 transition-all cursor-default group hover:-translate-y-1 duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Building2 className="text-white size-5" />
              </div>
              <p className="text-white font-medium">مراقبة العيادات</p>
            </div>
          </div>
        </div>

        {/* Hero Footer Stats */}
        <div 
          ref={heroStatsRef}
          className="relative z-10 grid grid-cols-3 gap-6 pt-8 border-t border-white/20 text-center"
        >
          <div className="group cursor-default">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="text-emerald-300 size-5 group-hover:translate-y-[-2px] duration-300" />
              <p className="text-3xl text-white font-bold">145+</p>
            </div>
            <p className="text-sm text-white/80">عيادة نشطة</p>
          </div>

          <div className="group cursor-default">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="text-cyan-300 size-5 group-hover:scale-110 duration-300" />
              <p className="text-3xl text-white font-bold">1,234+</p>
            </div>
            <p className="text-sm text-white/80">مستخدم نشط</p>
          </div>

          <div className="group cursor-default">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BarChart2 className="text-purple-300 size-5 group-hover:rotate-12 duration-300" />
              <p className="text-3xl text-white font-bold">65K+</p>
            </div>
            <p className="text-sm text-white/80">موعد شهرياً</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
