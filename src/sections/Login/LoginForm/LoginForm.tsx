import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { TransitionLink } from '../../../components/transition/TransitionLink'
import { useAuth } from '../../../contexts/AuthContext'
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi'
import BtnPrimary from '../../../components/ui/BtnPrimary'
import Input from '../../../components/ui/Input'

import { usePreloader } from '../../../contexts/PreloaderContext'
import { cn } from '../../../utils/cn'

const LoginForm = () => {
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get the page user was trying to visit before being redirected to login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) {
      // Trigger seamless transition before navigating
      if (window.triggerExitTransition) {
        await window.triggerExitTransition()
      }

      login()
      window.showToast('تم تسجيل الدخول بنجاح')
      navigate(from, { replace: true })
    }
  }

  return (
    <div
      className={cn(
        "w-full lg:w-1/2 flex items-center justify-center p-8 bg-white opacity-0",
        canAnimate && "animate-snappyUp animate-delay-0",
        isExiting && "animate-snappyDown"
      )}
      id="login-form-area"
    >
      <div className="w-full max-w-xl lg:max-w-md" style={{ opacity: 1, transform: 'none' }}>
        <div className="mb-8">
          <h1 className="text-4xl mb-2 flex justify-start" style={{ fontWeight: 700, color: 'rgb(11, 90, 142)' }}>
             <img src="/images/logo.png" alt="Medexa Cloud" className="h-20 mb-2 w-auto" />
          </h1>
          <p className="text-muted-foreground">منصة إدارة العيادات الطبية</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
              <label
                className="text-sm font-semibold text-[#1a2b3c] pr-1 block mb-2"
                htmlFor="email"
              >
                البريد الإلكتروني
              </label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="example@clinic.com"
              required
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              icon={<FiMail className="size-5" />}
            />
          </div>
          <div className="space-y-2">
              <label
                className="text-sm font-semibold text-[#1a2b3c] pr-1 block mb-2"
                htmlFor="password"
              >
                كلمة المرور
              </label>
            <div className="relative group">
              <Input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder={showPassword ? 'P@ssword1' : '••••••••'}
                required
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                icon={<FiLock className="size-5" />}
                className="pl-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors outline-none z-10"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <TransitionLink className="text-sm text-primary hover:underline" href="/">
              نسيت كلمة المرور؟
            </TransitionLink>
          </div>
          <BtnPrimary
            className="w-full"
            type="submit"
          >
            <FiLogIn className="ml-2 size-5" />
            تسجيل الدخول
          </BtnPrimary>
          <div className="text-center text-sm text-muted-foreground">
            ليس لديك حساب؟{' '}
            <TransitionLink className="text-primary hover:underline" href="/register">
              سجل الآن
            </TransitionLink>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginForm
