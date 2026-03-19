import { ArrowUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import Counter from '../../components/ui/Counter'
import { cn } from '../../utils/cn'
import { usePreloader } from "../../contexts/PreloaderContext"
import ShineHover from '../../components/ui/ShineHover'

import { statsData as stats } from '../../constants/Dashboard_dummy'

const StatsOverview = () => {
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting
  const [isInView, setIsInView] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const barsRef = useRef<(HTMLDivElement | null)[]>([])
  const topBarsRef = useRef<(HTMLDivElement | null)[]>([])
  const cardsRef = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    if (!canAnimate || !sectionRef.current) return

    // Set initial hidden state for everything
    gsap.set(cardsRef.current, { opacity: 0, y: 40, scale: 0.95 })
    gsap.set(topBarsRef.current, { scaleX: 0 })

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)

          // Animate bars width using GSAP for precise stat value
           stats.forEach((stat, i) => {
            const card = cardsRef.current[i]
            const bar = barsRef.current[i]
            const topBar = topBarsRef.current[i]

            if (card) {
               gsap.to(card, {
                 opacity: 1,
                 y: 0,
                 scale: 1,
                 duration: 0.6,
                 delay: 0.6 + (i * 0.05),
                 ease: "power2.inOut"
               })
            }

            if (topBar) {
              gsap.to(topBar, {
                scaleX: 1,
                duration: 0.75,
                delay: 0.1 + (i * 0.1),
                ease: 'power2.out'
              })
            }

            if (bar) {
              gsap.to(bar, {
                width: stat.progress,
                duration: 1.2,
                delay: 0.3 + (i * 0.1),
                ease: 'power2.out'
              })
            }
          })

          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current && canAnimate) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [canAnimate])

  // Exit animation logic
  useEffect(() => {
    if (isExiting && cardsRef.current.length > 0) {
      gsap.to(cardsRef.current, {
        opacity: 0,
        y: 40,
        scale: 0.95,
        duration: 0.5,
        stagger: 0.05,
        ease: "power2.in"
      })
    }
  }, [isExiting])

  return (
    <section
      ref={sectionRef}
      className="grid grid-cols-1 md:grid-cols-2 overflow-visible lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10"
    >
      {stats.map((stat, index) => (
        <article
          key={index}
          ref={(el) => { cardsRef.current[index] = el; }}
          className={cn(
            "relative group p-7 bg-white border border-border/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-600 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-[box-shadow,transform] overflow-hidden hover:-translate-y-3! "
          )}
          style={{
            opacity: 0, // Initial state
          }}
        >
          <ShineHover color={stat.iconColor} />
          {/* Top accent bar */}
          <div
            ref={(el) => { topBarsRef.current[index] = el; }}
            className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl transition-transform duration-500 group-hover:scale-x-110 will-change-transform origin-center scale-x-0"
            style={{ background: stat.color }}
          />

          {/* Background effects */}
          <div className="absolute top-0 left-0 w-64 h-64 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none will-change-opacity"
               style={{ background: `radial-gradient(circle at left top, ${stat.iconColor}08, transparent 70%)` }} />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1 text-right">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</h4>
                <p className="text-xs text-muted-foreground/70">{stat.sub}</p>
              </div>
              <div className={cn(
                "size-16 rounded-2xl animate-hovering flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 will-change-transform group-hover:shadow-[0_20px_40px_-10px_rgba(11,90,142,0.4)]",
                `bg-linear-to-br ${stat.iconBg}`
              )} style={{ boxShadow: `${stat.iconColor}20 0px 8px 15px` }}>
                <stat.icon
                  className="size-7 transition-all duration-500"
                  style={{
                    color: stat.iconColor,
                    filter: 'drop-shadow(0 0 10px ' + stat.iconColor + 'cc)'
                  }}
                />
              </div>
            </div>

            <div className="mb-4 text-right">
              <div className="flex items-baseline justify-start gap-1 mb-2 h-10">
                {stat.label === 'معدل النمو' && <span className="text-4xl font-bold">%</span>}
                <Counter
                  value={stat.value}
                  fontSize={36}
                  isInView={isInView}
                  isCurrency={stat.isCurrency}
                  fontWeight="900"
                  containerClass="tracking-tight"
                />
              </div>
              <div className="h-1 w-full bg-accent/10 rounded-full overflow-hidden mt-2">
                <div
                  ref={(el) => { barsRef.current[index] = el; }}
                  className="h-full will-change-[width]"
                  style={{ background: stat.color, width: '0%' }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 self-start w-fit transition-transform group-hover:scale-105 will-change-transform">
              <ArrowUp className="size-3.5 stroke-3" />
              <span>{stat.change}</span>
              <span className="text-[10px] font-bold opacity-70">من الشهر السابق</span>
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}

export default StatsOverview
