import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { Mail, CheckCircle, XCircle, Loader2, ArrowRight, Key } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import Input from '../components/ui/Input'
import BtnPrimary from '../components/ui/BtnPrimary'
import { usePreloader } from '../contexts/PreloaderContext'
import { cn } from '../utils/cn'

const VerifyEmail = () => {
  const { isAr } = useLanguage()
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()

  // Extract token from URL search parameter
  const urlToken = searchParams.get('token')
  // Try to get registered email from location state
  const registeredEmail = (location.state as { email?: string })?.email || ''

  const [token, setToken] = useState(urlToken || '')
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>(urlToken ? 'verifying' : 'idle')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const verifyToken = async (tokenToVerify: string) => {
    if (!tokenToVerify) return
    
    setIsLoading(true)
    setStatus('verifying')
    try {
      const response = await fetch('/api/auth/email/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokenToVerify }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        const successMsg = data.message || (isAr ? 'تم تفعيل البريد الإلكتروني بنجاح' : 'Email verified successfully')
        setMessage(successMsg)
        window.showToast?.(successMsg, 'success')
      } else {
        setStatus('error')
        const errorMsg = data.message || (isAr ? 'فشل التحقق من البريد الإلكتروني' : 'Email verification failed')
        setMessage(errorMsg)
        window.showToast?.(errorMsg, 'error')
      }
    } catch (error: any) {
      setStatus('error')
      const errorMsg = error.message || (isAr ? 'حدث خطأ أثناء الاتصال بالخادم' : 'An error occurred while connecting to the server')
      setMessage(errorMsg)
      window.showToast?.(errorMsg, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto verify if token is present in the URL
  useEffect(() => {
    if (urlToken) {
      verifyToken(urlToken)
    }
  }, [urlToken])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!token.trim()) {
      window.showToast?.(isAr ? 'يرجى إدخال رمز التفعيل' : 'Please enter the verification token', 'error')
      return
    }
    verifyToken(token.trim())
  }

  return (
    <main 
      className="min-h-screen flex items-center justify-center p-4 bg-slate-50" 
      dir={isAr ? "rtl" : "ltr"}
      id="verify-email-page"
    >
      <div 
        className={cn(
          "w-full max-w-md bg-white rounded-3xl border border-border shadow-lg p-8 transition-all duration-300 opacity-0",
          canAnimate && "animate-snappyUp animate-delay-100",
          isExiting && "animate-snappyDown"
        )}
      >
        <div className="flex justify-center mb-6">
          <img src="/images/logo.png" alt="Medexa Cloud" className="h-16 w-auto" />
        </div>

        {status === 'verifying' && (
          <div className="text-center py-8 space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {isAr ? 'جاري التحقق من الحساب...' : 'Verifying your account...'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isAr ? 'يرجى الانتظار بينما نقوم بالتحقق من بريدك الإلكتروني' : 'Please wait while we verify your email address'}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-6 space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                {isAr ? 'تم التحقق بنجاح!' : 'Verification Successful!'}
              </h2>
              <p className="text-emerald-600 font-medium text-sm">
                {message}
              </p>
            </div>
            <BtnPrimary 
              onClick={() => navigate('/login')}
              className="w-full h-12 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
            >
              {isAr ? 'الانتقال إلى تسجيل الدخول' : 'Proceed to Login'}
              <ArrowRight className={cn("h-5 w-5", isAr && "rotate-180")} />
            </BtnPrimary>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-6 space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <XCircle className="h-10 w-10 text-destructive" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                {isAr ? 'فشل التحقق' : 'Verification Failed'}
              </h2>
              <p className="text-destructive font-medium text-sm">
                {message}
              </p>
            </div>
            
            <div className="border-t border-border pt-6 space-y-4">
              <p className="text-xs text-muted-foreground">
                {isAr ? 'يمكنك محاولة إدخال الرمز يدويًا أدناه:' : 'You can try entering the token manually below:'}
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  name="token"
                  placeholder={isAr ? 'أدخل رمز التفعيل هنا' : 'Enter verification token here'}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  icon={<Key />}
                  className="h-12 border-border focus:border-primary"
                  required
                />
                <BtnPrimary 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-primary"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    isAr ? 'إعادة المحاولة' : 'Retry Verification'
                  )}
                </BtnPrimary>
              </form>
            </div>

            <button 
              onClick={() => {
                setStatus('idle')
                setToken('')
              }}
              className="text-sm font-semibold text-primary hover:underline block mx-auto"
            >
              {isAr ? 'العودة للخلف' : 'Go Back'}
            </button>
          </div>
        )}

        {status === 'idle' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {isAr ? 'تأكيد البريد الإلكتروني' : 'Confirm Your Email'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isAr 
                  ? `لقد أرسلنا رابط تفعيل إلى بريدك الإلكتروني ${registeredEmail ? `(${registeredEmail})` : ''}. يرجى إدخال رمز التفعيل أدناه لتأكيد حسابك.`
                  : `We have sent a verification link to your email ${registeredEmail ? `(${registeredEmail})` : ''}. Please enter the verification token below to confirm your account.`
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1a2b3c] block">
                  {isAr ? 'رمز التفعيل (Token)' : 'Verification Token'}
                </label>
                <Input
                  name="token"
                  placeholder={isAr ? 'أدخل رمز التفعيل بالكامل' : 'Enter the complete verification token'}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  icon={<Key />}
                  className="h-12 border-border focus:border-primary"
                  required
                />
              </div>

              <BtnPrimary 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  isAr ? 'تأكيد البريد الإلكتروني' : 'Verify Email'
                )}
              </BtnPrimary>
            </form>

            <div className="text-center pt-2">
              <button 
                onClick={() => navigate('/login')}
                className="text-sm font-semibold text-primary hover:underline"
              >
                {isAr ? 'العودة لتسجيل الدخول' : 'Back to Login'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default VerifyEmail
