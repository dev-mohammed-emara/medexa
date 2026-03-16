import LoginForm from '../sections/Login/LoginForm/LoginForm'
import LoginHero from '../sections/Login/LoginHero/LoginHero'

const Login = () => {
  return (
    <main className="min-h-screen flex w-full bg-slate-50" dir="rtl" id="login-page">
      <LoginForm />
      <LoginHero />
    </main>
  )
}

export default Login
