import { usePreloader } from "../../../contexts/PreloaderContext"
import { cn } from "../../../utils/cn"

const LoginHero = () => {
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting

  return (
    <div className="hidden lg:flex w-1/2 relative overflow-hidden ">
      <div className="absolute inset-0 bg-linear-to-br from-primary via-secondary to-accent opacity-90"></div>
      <div className="relative z-10 flex flex-col items-center justify-center text-white p-12 w-full">
        <div className={cn(
          "text-center opacity-0",
          canAnimate && "animate-scaleUp animate-delay-500",
          isExiting && "animate-scaleDownOut"
        )}>
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <path
                  d="M40 10C23.4315 10 10 23.4315 10 40C10 56.5685 23.4315 70 40 70C56.5685 70 70 56.5685 70 40C70 23.4315 56.5685 10 40 10Z"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M40 25V40L50 50"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="40" cy="40" r="3" fill="white" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl mb-4" style={{ fontWeight: 700 }}>
            أهلاً بك في Medexa Cloud
          </h2>
          <p className="text-lg opacity-90 max-w-md mx-auto">
            نظام شامل لإدارة العيادات الطبية مع تقنيات الذكاء الاصطناعي
          </p>
        </div>
      </div>
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full"></div>
      <div className="absolute top-1/2 left-20 w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full"></div>
    </div>
  )
}

export default LoginHero
