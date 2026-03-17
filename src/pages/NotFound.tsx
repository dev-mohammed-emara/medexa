import { Home, LogIn, AlertCircle } from 'lucide-react'
import { TransitionLink } from '../components/transition/TransitionLink'

const NotFound = () => {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* Small Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(#0B5A8E 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] will-change-transform" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      <section className="relative z-10 max-w-lg w-full text-center">
        <figure className="mb-4 flex flex-col items-center">
          {/* Icon above number */}
          <div className="size-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center border border-border/50 animate-bounce-slow will-change-transform z-20 mb-[-20px]">
            <AlertCircle className="size-12 text-primary" />
          </div>
          
          {/* Whole number seen */}
          <div className="text-[150px] font-black leading-none bg-linear-to-b from-primary to-secondary bg-clip-text text-transparent opacity-20 select-none z-10">
            404
          </div>
        </figure>

        <header className="space-y-4 mb-10">
          <h1 className="text-4xl font-extrabold text-[#1a2b3c] tracking-tight">الصفحة غير موجودة</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            عذراً، يبدو أن الصفحة التي تبحث عنها قد تم نقلها أو أنها لم تعد موجودة في نظام ميديكسا.
          </p>
        </header>

        <footer className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <TransitionLink
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 active:translate-y-0 will-change-transform"
          >
            <Home className="size-5" />
            العودة للرئيسية
          </TransitionLink>
          <TransitionLink
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-white border border-border text-foreground rounded-xl font-bold hover:bg-slate-50 hover:border-primary/30 hover:shadow-md transition-all duration-300 active:translate-y-0 will-change-transform"
          >
            <LogIn className="size-5" />
            تسجيل الدخول
          </TransitionLink>
        </footer>
      </section>
    </main>
  )
}

export default NotFound
