import { useEffect, useState } from 'react'
import { FiEye, FiEyeOff, FiLock, FiLogIn, FiMail } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import { TransitionLink } from '../../components/transition/TransitionLink'
import BtnPrimary from '../../components/ui/BtnPrimary'
import Input from '../../components/ui/Input'
import { loginTranslations } from '../../constants/translations/login'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { usePreloader } from '../../contexts/PreloaderContext'
import { cn } from '../../utils/cn'
import { LoginSchema } from '../../utils/schemas'

const LoginForm = () => {
  const { isAr, t } = useLanguage()
  const T = loginTranslations
  const { isLoaded, isExiting }  = usePreloader()
  const canAnimate = isLoaded && !isExiting
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isForgot, setIsForgot] = useState(false)
  const [forgotStep, setForgotStep] = useState<number>(1)
  const [serverMessage, setServerMessage] = useState<string | null>(null)
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [tokenInput, setTokenInput] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Helper to push a history entry reflecting current auth mode and step
  const pushState = (mode: 'login' | 'forgot', step: number = 1) => {
    if (mode === 'login') {
      navigate(location.pathname, { replace: false })
    } else {
      const search = `?auth=forgot&step=${step}`
      navigate(`${location.pathname}${search}`, { replace: false })
    }
  }

  // Sync component state with URL query params so back/forward works
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const auth = params.get('auth')
    const stepParam = parseInt(params.get('step') || '1', 10)

    if (auth === 'forgot') {
      setIsForgot(true)
      setForgotStep(Number.isNaN(stepParam) ? 1 : Math.max(1, Math.min(2, stepParam)))
    } else {
      setIsForgot(false)
      setForgotStep(1)
    }

  }, [location.search])

  // Get the page user was trying to visit before being redirected to login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isForgot) {
      // Step 1: request reset
      if (forgotStep === 1) {
        if (!email) {
          window.showToast?.('Please enter your email', 'error')
          return
        }
        setIsLoading(true)
        try {
          const resp = await fetch('/api/auth/password/request-reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          })

          const data = await resp.json().catch(() => ({}))
          const message = data.message || 'If an account with this email exists, a password reset link has been sent'
          setServerMessage(message)
          window.showToast?.(message, resp.ok ? 'success' : 'error')

          if (resp.ok) {
            // Move to step 2. If token provided by API, save it; otherwise allow user to enter it.
            setForgotStep(2)
            pushState('forgot', 2)
            setResetToken(data.token || null)
          }
        } catch (err: any) {
          window.showToast?.(err.message || 'Request failed', 'error')
        } finally {
          setIsLoading(false)
        }
      } else if (forgotStep === 2) {
        // Step 2: perform reset
        const tokenToUse = resetToken || tokenInput
        if (!tokenToUse) {
          window.showToast?.('Reset token required', 'error')
          return
        }
        if (!newPassword || !confirmNewPassword) {
          window.showToast?.('Please enter and confirm your new password', 'error')
          return
        }
        if (newPassword !== confirmNewPassword) {
          window.showToast?.('Passwords do not match', 'error')
          return
        }

        setIsLoading(true)
        try {
          const resp = await fetch('/api/auth/password/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: tokenToUse, newPassword, confirmPassword: confirmNewPassword })
          })

          const data = await resp.json().catch(() => ({}))
          const message = data.message || 'Password has been reset successfully'
          window.showToast?.(message, resp.ok ? 'success' : 'error')

          if (resp.ok) {
            if (window.triggerExitTransition) {
              await window.triggerExitTransition()
            }
            navigate('/login')
          }
        } catch (err: any) {
          window.showToast?.(err.message || 'Reset failed', 'error')
        } finally {
          setIsLoading(false)
        }
      }
      return
    }

    if (email && password) {
      const validation = LoginSchema.safeParse({ email, password })
      if (!validation.success) {
        const errorMsg = validation.error.issues[0]?.message || 'Validation failed'
        window.showToast?.(errorMsg, 'error')
        return
      }

      setIsLoading(true)
      try {
        await login(email, password)

        // Trigger seamless transition before navigating
        if (window.triggerExitTransition) {
          await window.triggerExitTransition()
        }

        window.showToast?.(t('toast_success', T))
        navigate(from, { replace: true })
      } catch (err: any) {
        window.showToast?.(err.message || 'Invalid email or password', 'error')
      } finally {
        setIsLoading(false)
      }
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
            {isForgot ? (forgotStep === 1 ? t('reset_title', T) : t('reset_title_step2', T)) : t('platform_name', T)}
          </h1>
          <p className={cn("text-muted-foreground", isAr ? "text-right" : "text-left")}>
            {isForgot ? (forgotStep === 1 ? t('reset_desc', T) : t('reset_desc_step2', T)) : t('platform_name', T)}
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                className={cn("text-sm font-semibold text-[#1a2b3c] block mb-2", isAr ? "pr-1 text-right" : "pl-1 text-left")}
                htmlFor="email"
              >
                {t('email_label', T)}
              </label>
              {isForgot && forgotStep === 2 && (
                <button
                  type="button"
                  onClick={() => {
                    // Go back to step 1 keeping the email value
                    setForgotStep(1)
                    setServerMessage(null)
                    // Clear temporary reset inputs but keep email
                    setResetToken(null)
                    setTokenInput('')
                    setNewPassword('')
                    setConfirmNewPassword('')
                    pushState('forgot', 1)
                  }}
                  className="text-sm text-primary hover:underline outline-none"
                >
                  {t('change_email', T)}
                </button>
              )}
            </div>
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
              disabled={isLoading || (isForgot && forgotStep === 2)}
            />
            {isForgot && (
              <div className={cn(
                "p-3 rounded-lg bg-primary/5 border border-primary/10 mt-2 animate-in fade-in slide-in-from-top-1",
                isAr ? "text-right" : "text-left"
              )}>
                <p className="text-xs text-primary font-medium leading-relaxed">
                  {serverMessage || (isAr
                    ? "هذا الخيار مخصص للوصول السريع للعيادات المسجلة مسبقاً. يرجى إدخال البريد الإلكتروني المسجل للدخول مباشرة."
                    : "Please enter a valid email so the reset request can be sent to you")}
                </p>
                {forgotStep === 2 && !resetToken && (
                  <div className="mt-2">
                    <label className="text-xs font-semibold block mb-1">Reset Token</label>
                    <Input value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} placeholder="Paste token from email" />
                  </div>
                )}
              </div>
            )}
          </div>
         
          {isForgot && forgotStep === 2 && (
            <div className="space-y-2">
              <label className={cn("text-sm font-semibold text-[#1a2b3c] block mb-2", isAr ? "pr-1 text-right" : "pl-1 text-left")}>{t('new_password_label', T) || 'New Password'}</label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
              <label className={cn("text-sm font-semibold text-[#1a2b3c] block mb-2 mt-2", isAr ? "pr-1 text-right" : "pl-1 text-left")}>{t('confirm_new_password_label', T) || 'Confirm Password'}</label>
              <Input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="••••••••" />
            </div>
          )}
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
                  disabled={isLoading}
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
              onClick={() => {
                // Toggle to forgot mode and push history so back/forward works
                if (!isForgot) {
                  setIsForgot(true)
                  setForgotStep(1)
                  pushState('forgot', 1)
                } else {
                  setIsForgot(false)
                  setForgotStep(1)
                  pushState('login', 1)
                }
              }}
              className="text-sm text-primary hover:underline outline-none"
            >
              {isForgot ? t('back_to_login', T) : t('forgot_password', T)}
            </button>
          </div>


          <BtnPrimary
            className="w-full h-12 rounded-xl"
            type="submit"
            isPending={isLoading}
            disabled={isLoading}
          >
            <FiLogIn className={cn("size-5", isAr ? "ml-2" : "mr-2")} />
            {isForgot ? (forgotStep === 1 ? t('confirm_email', T) : t('confirm_new_password', T)) : t('login_btn', T)}
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
