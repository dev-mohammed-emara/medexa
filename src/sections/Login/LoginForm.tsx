import { useEffect, useState } from 'react'
import { FiLock, FiLogIn, FiMail } from 'react-icons/fi'
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
import { apiFetch } from '../../utils/apiFetch'

const LoginForm = () => {
  const { isAr, t } = useLanguage()
  const T = loginTranslations
  const { isLoaded, isExiting }  = usePreloader()
  const canAnimate = isLoaded && !isExiting
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isForgot, setIsForgot] = useState(false)
  const [serverMessage, setServerMessage] = useState<string | null>(null)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Helper to push a history entry reflecting current auth mode
  const pushState = (mode: 'login' | 'forgot') => {
    if (mode === 'login') {
      navigate(location.pathname, { replace: false })
    } else {
      const search = `?auth=forgot`
      navigate(`${location.pathname}${search}`, { replace: false })
    }
  }

  // Derive a stable string from location.search for dependency
  const searchStr = location.search;

  // Sync component state with URL query params so back/forward works
  useEffect(() => {
    const params = new URLSearchParams(searchStr)
    const auth = params.get('auth')

    if (auth === 'forgot') {
      setIsForgot(true)
    } else {
      setIsForgot(false)
    }

  }, [searchStr])

  // Get the page user was trying to visit before being redirected to login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isForgot) {
      if (!email) {
        window.showToast?.('Please enter your email', 'error')
        return
      }
      setIsLoading(true)
      try {
        const resp = await apiFetch('/api/auth/password/request-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })

        const data = await resp.json().catch(() => ({}))
        const message = data.message || 'If an account with this email exists, a password reset link has been sent'
        setServerMessage(message)
        window.showToast?.(message, resp.ok ? 'success' : 'error')

        if (resp.ok) {
          setIsForgot(false)
          pushState('login')
        }
      } catch (err: any) {
        window.showToast?.(err.message || 'Request failed', 'error')
      } finally {
        setIsLoading(false)
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
        
        let destination = from;
        if (destination === '/' || destination === '') {
          destination = '/dashboard';
        }

        navigate(destination, { replace: true })
      } catch (err: any) {
        const errorMsg = err.message || 'Invalid email or password'
        window.showToast?.(errorMsg, 'error')
        setLoginError(errorMsg)
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
            {isForgot ? t('reset_title', T) : t('platform_name', T)}
          </h1>
          <p className={cn("text-muted-foreground", isAr ? "text-right" : "text-left")}>
            {isForgot ? t('reset_desc', T) : t('platform_name', T)}
          </p>
        </div>

        {loginError && !isForgot && (
          <div className={cn(
            "mb-6 p-4 rounded-xl border flex items-start gap-3 bg-destructive/10 border-destructive/20 text-destructive animate-in fade-in slide-in-from-top-2",
            isAr ? "text-right" : "text-left"
          )}>
            <div className="mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <p className="text-sm font-semibold">{loginError}</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                className={cn("text-sm font-semibold text-[#1a2b3c] block mb-2", isAr ? "pr-1 text-right" : "pl-1 text-left")}
                htmlFor="email"
              >
                {t('email_label', T)}
              </label>
            </div>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="example@clinic.com"
              required
              value={email}
              autoComplete="email"
              onChange={(e) => {
                setEmail(e.target.value)
                if (loginError) setLoginError(null)
              }}
              icon={<FiMail className="size-5" />}
              disabled={isLoading}
            />
            {isForgot && (
              <div className={cn(
                "p-3 rounded-lg bg-primary/5 border border-primary/10 mt-2 animate-in fade-in slide-in-from-top-1",
                isAr ? "text-right" : "text-left"
              )}>
                <p className="text-xs text-primary font-medium leading-relaxed">
                  {serverMessage || (isAr
                    ? "يرجى إدخال البريد الإلكتروني المسجل وسنقوم بإرسال رابط إعادة تعيين كلمة المرور."
                    : "Please enter your registered email address and we will send you a password reset link.")}
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
                  type="password"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (loginError) setLoginError(null)
                  }}
                  icon={<FiLock className="size-5" />}
                  className="pl-12"
                  disabled={isLoading}
                />
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
                  pushState('forgot')
                } else {
                  setIsForgot(false)
                  pushState('login')
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
            {isForgot ? t('confirm_email', T) : t('login_btn', T)}
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
