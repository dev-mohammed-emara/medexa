import { useLanguage } from '../contexts/LanguageContext'
import LoginForm from '../sections/Login/LoginForm'
import LoginHero from '../sections/Login/LoginHero'

const Login = () => {
  const { isAr } = useLanguage()
  return (
    <main className="min-h-screen flex w-full bg-slate-50" dir={isAr ? "rtl" : "ltr"} id="login-page">
      <LoginForm />
      <LoginHero />
    </main>
  )
}

export default Login
