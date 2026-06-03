import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { usePreloader } from '../../contexts/PreloaderContext'
import { cn } from '../../utils/cn'
import { useLanguage } from '../../contexts/LanguageContext'
import { dashboardTranslations } from '../../constants/translations/dashboard'
import { navTranslations } from '../../constants/nav'



interface ChartsOverviewProps {
  financialChartData?: {
    label: string
    income: number
    expenses: number
  }[] | null
  genderDistribution?: {
    gender: 'MALE' | 'FEMALE'
    count: number
    percentage: number
  }[]
  ageDistribution?: {
    ageGroup: string
    count: number
  }[]
  dailyAppointments?: {
    dayOfWeek: string
    date: string
    appointmentCount: number
  }[]
}

const ChartsOverview = ({
  financialChartData,
  genderDistribution,
  ageDistribution,
  dailyAppointments
}: ChartsOverviewProps) => {
  const { isAr, t } = useLanguage()
  const T = dashboardTranslations
  const T_NAV = navTranslations
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting

  const translatedAppointmentData = (dailyAppointments && dailyAppointments.length > 0)
    ? dailyAppointments.map(item => {
      let name = item.dayOfWeek
      let dayKey = ''
      const lowerDay = item.dayOfWeek.toLowerCase()
      if (lowerDay === 'sunday') dayKey = 'sun'
      else if (lowerDay === 'monday') dayKey = 'mon'
      else if (lowerDay === 'tuesday') dayKey = 'tue'
      else if (lowerDay === 'wednesday') dayKey = 'wed'
      else if (lowerDay === 'thursday') dayKey = 'thu'
      else if (lowerDay === 'friday') dayKey = 'fri'
      else if (lowerDay === 'saturday') dayKey = 'sat'

      return {
        name: dayKey ? t(`nav.days.${dayKey}`, T_NAV) : name,
        value: item.appointmentCount
      }
    })
    : ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
      const dayKey = day.substring(0, 3).toLowerCase();
      return {
        name: t(`nav.days.${dayKey}`, T_NAV),
        value: 0
      }
    })

  const translatedGenderData = (genderDistribution && genderDistribution.length > 0)
    ? genderDistribution.map(item => ({
      name: item.gender === 'MALE' ? t('charts.male', T) : t('charts.female', T),
      value: item.count,
      percentage: item.percentage,
      color: item.gender === 'MALE' ? '#0B5A8E' : '#3FB8AF'
    }))
    : [
      { name: t('charts.male', T), value: 0, percentage: 0, color: '#0B5A8E' },
      { name: t('charts.female', T), value: 0, percentage: 0, color: '#3FB8AF' }
    ]

  const activeAgeData = (ageDistribution && ageDistribution.length > 0)
    ? ageDistribution.map(item => ({
      range: item.ageGroup,
      value: item.count,
      fill: '#0B5A8E'
    }))
    : ['0-18', '19-35', '36-50', '51-65', '65+'].map(group => ({
      range: group,
      value: 0,
      fill: '#0B5A8E'
    }))

  const translatedFinancialChartData = (financialChartData || []).map(item => {
    const lowerLabel = item.label.toLowerCase()
    let displayLabel = item.label
    if (lowerLabel === 'january') displayLabel = isAr ? 'يناير' : 'January'
    else if (lowerLabel === 'february') displayLabel = isAr ? 'فبراير' : 'February'
    else if (lowerLabel === 'march') displayLabel = isAr ? 'مارس' : 'March'
    else if (lowerLabel === 'april') displayLabel = isAr ? 'أبريل' : 'April'
    else if (lowerLabel === 'may') displayLabel = isAr ? 'مايو' : 'May'
    else if (lowerLabel === 'june') displayLabel = isAr ? 'يونيو' : 'June'
    else if (lowerLabel === 'july') displayLabel = isAr ? 'يوليو' : 'July'
    else if (lowerLabel === 'august') displayLabel = isAr ? 'أغسطس' : 'August'
    else if (lowerLabel === 'september') displayLabel = isAr ? 'سبتمبر' : 'September'
    else if (lowerLabel === 'october') displayLabel = isAr ? 'أكتوبر' : 'October'
    else if (lowerLabel === 'november') displayLabel = isAr ? 'نوفمبر' : 'November'
    else if (lowerLabel === 'december') displayLabel = isAr ? 'ديسمبر' : 'December'

    return {
      ...item,
      label: displayLabel
    }
  })

  const totalGenderCount = (translatedGenderData || []).reduce((acc, curr) => acc + (curr.value || 0), 0)
  const isEmptyGender = totalGenderCount === 0
  const pieData = isEmptyGender
    ? [
      { name: t('charts.male', T), value: 1, color: '#E8EEF2' },
      { name: t('charts.female', T), value: 1, color: '#E8EEF2' }
    ]
    : translatedGenderData

  return (
    <div
      className={cn(
        "space-y-6 mb-10 opacity-0",
        canAnimate && "animate-fadeUp opacity-100 animate-delay-150",
        isExiting && "animate-fadeDownOut"
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <section className="bg-white p-6 border border-border shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
          <h3 className={cn("text-lg font-bold mb-6", isAr ? "text-right" : "text-left")}>{t('charts.gender_dist', T)}</h3>
          <figure className="h-[300px] w-full">
            {isLoaded && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    paddingAngle={isEmptyGender ? 0 : 6}
                    dataKey="value"
                    isAnimationActive={true}
                    label={({ name, x, y, textAnchor }: any) => {
                      const safeName = name || ''
                      const color = safeName === t('charts.male', T) ? '#0B5A8E' : '#3FB8AF'
                      const displayValue = isEmptyGender ? 0 : (translatedGenderData.find(d => d.name === safeName)?.value || 0)
                      return (
                        <text
                          x={x}
                          y={y}
                          fill={color}
                          textAnchor={textAnchor}
                          dominantBaseline="central"
                          style={{ fontSize: '12px', fontWeight: 600 }}
                        >
                          {`${safeName} ${displayValue}`}
                        </text>
                      )
                    }}
                  >
                    {pieData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={isEmptyGender ? '#E8EEF2' : (entry as any).color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div 
                            className="bg-white p-3 border border-border shadow-lg rounded-xl text-sm"
                            style={{ direction: isAr ? 'rtl' : 'ltr' }}
                          >
                            {payload.map((entry: any, index: number) => {
                              const name = entry.name
                              const ogColor = name === t('charts.male', T) ? '#0B5A8E' : '#3FB8AF'
                              const displayValue = isEmptyGender ? 0 : entry.value
                              return (
                                <div key={index} className="flex items-center gap-2 my-1">
                                  <span 
                                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                                    style={{ backgroundColor: ogColor }} 
                                  />
                                  <span className="text-gray-500 font-medium">{name}:</span>
                                  <span className="font-bold text-gray-800">{displayValue}</span>
                                </div>
                              )
                            })}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </figure>
        </section>

        {/* Age Distribution */}
        <section className="bg-white p-6 border border-border shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
          <h3 className={cn("text-lg font-bold mb-6", isAr ? "text-right" : "text-left")}>{t('charts.age_dist', T)}</h3>
          <figure className="h-[300px] w-full">
            {isLoaded && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeAgeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EEF2" />
                  <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} orientation="right" />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="value" fill="#0B5A8E" radius={[8, 8, 0, 0]} barSize={80} isAnimationActive={true} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </figure>
        </section>
      </div>

      {/* Daily Appointments */}
      <section className="bg-white p-6 border border-border shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
        <h3 className={cn("text-lg font-bold mb-6", isAr ? "text-right" : "text-left")}>{t('charts.daily_appointments', T)}</h3>
        <figure className="h-[300px] w-full">
          {isLoaded && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={translatedAppointmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EEF2" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} orientation="right" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Legend verticalAlign="bottom" height={36} />
                <Line
                  name={t('charts.appointment_count', T)}
                  type="monotone"
                  dataKey="value"
                  stroke="#3FB8AF"
                  strokeWidth={4}
                  dot={{ r: 6, fill: '#3FB8AF', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </figure>
      </section>

      {/* Income vs Expenses Chart */}
      {translatedFinancialChartData.length > 0 && (
        <section className="bg-white p-6 border border-border shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
          <h3 className={cn("text-lg font-bold mb-6", isAr ? "text-right" : "text-left")}>{t('charts.income_vs_expenses', T)}</h3>
          <figure className="h-[300px] w-full">
            {isLoaded && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={translatedFinancialChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EEF2" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} orientation="right" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} />
                  <Line
                    name={t('charts.income', T)}
                    type="monotone"
                    dataKey="income"
                    stroke="#3FB8AF"
                    strokeWidth={4}
                    dot={{ r: 6, fill: '#3FB8AF', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                    isAnimationActive={true}
                  />
                  <Line
                    name={t('charts.expenses', T)}
                    type="monotone"
                    dataKey="expenses"
                    stroke="#d4183d"
                    strokeWidth={4}
                    dot={{ r: 6, fill: '#d4183d', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </figure>
        </section>
      )}
    </div>
  )
}

export default ChartsOverview
