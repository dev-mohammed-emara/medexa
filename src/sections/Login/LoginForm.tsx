import { useState } from 'react'
import { FiEye, FiEyeOff, FiLock, FiLogIn, FiMail } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import { TransitionLink } from '../../components/transition/TransitionLink'
import BtnPrimary from '../../components/ui/BtnPrimary'
import Input from '../../components/ui/Input'
import { useAuth } from '../../contexts/AuthContext'

import { loginTranslations } from '../../constants/translations/login'
import { useLanguage } from '../../contexts/LanguageContext'
import { usePreloader } from '../../contexts/PreloaderContext'
import { cn } from '../../utils/cn'

const LoginForm = () => {
  const { isAr, t } = useLanguage()
  const T = loginTranslations
  const { isLoaded, isExiting }  = usePreloader()
  const canAnimate = isLoaded && !isExiting
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isForgot, setIsForgot] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get the page user was trying to visit before being redirected to login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isForgot) {
      if (email) {
        // Trigger seamless transition before navigating
        if (window.triggerExitTransition) {
          await window.triggerExitTransition()
        }
        login()
        window.showToast?.(t('reset_success', T), 'success')
        navigate(from, { replace: true })
      }
      return
    }

    if (email && password) {
      // Trigger seamless transition before navigating
      if (window.triggerExitTransition) {
        await window.triggerExitTransition()
      }

      login()
      window.showToast?.(t('toast_success', T))
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
          <div className="flex justify-start mb-4">
             <img src="/images/logo.png" alt="Medexa Cloud" className="h-20 w-auto" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-primary">
            {isForgot ? t('reset_title', T) : t('platform_name', T)}
          </h1>
          <p className={cn("text-muted-foreground", isAr ? "text-right" : "text-left")}>
            {isForgot ? t('reset_desc', T) : t('platform_name', T)}
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
              <label
                className={cn("text-sm font-semibold text-[#1a2b3c] block mb-2", isAr ? "pr-1 text-right" : "pl-1 text-left")}
                htmlFor="email"
              >
                {t('email_label', T)}
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
            {isForgot && (
              <div className={cn(
                "p-3 rounded-lg bg-primary/5 border border-primary/10 mt-2 animate-in fade-in slide-in-from-top-1",
                isAr ? "text-right" : "text-left"
              )}>
                <p className="text-xs text-primary font-medium leading-relaxed">
                  {isAr 
                    ? "هذا الخيار مخصص للوصول السريع للعيادات المسجلة مسبقاً. يرجى إدخال البريد الإلكتروني المسجل للدخول مباشرة."
                    : "This option is for quick access to pre-registered clinics. Please enter your registered email to log in directly."}
                </p>
              </div>
            )}
          </div>
          {!isForgot && (
            <div className="space-y-2">
                <label
                  className={cn("text-sm font-semibold text-[#1a2b3c] block mb-2", isAr ? "pr-1 text-right" : "pl-1 text-left")}
                  htmlFor="password"
                >
                  {t('password_label', T)}
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
          )}
          <div className={cn("flex items-center", isAr ? "justify-start" : "justify-end")}>
            <button
              type="button"
              onClick={() => setIsForgot(!isForgot)}
              className="text-sm text-primary hover:underline outline-none"
            >
              {isForgot ? t('back_to_login', T) : t('forgot_password', T)}
            </button>
          </div>
          <BtnPrimary
            className="w-full h-12 rounded-xl"
            type="submit"
          >
            <FiLogIn className={cn("size-5", isAr ? "ml-2" : "mr-2")} />
            {isForgot ? t('send_reset_link', T) : t('login_btn', T)}
          </BtnPrimary>
          {!isForgot && (
            <div className="text-center text-sm text-muted-foreground">
              {t('no_account', T)}{' '}
              <TransitionLink className="text-primary hover:underline" href="/register">
                {t('register_now', T)}
              </TransitionLink>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default LoginForm
