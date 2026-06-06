import {
  TrendingUp,
  Users,
  Building2,
  Calendar,
  DollarSign,
  Activity,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import AdminLayout from '../../components/layout/AdminLayout'
import { usePreloader } from '../../contexts/PreloaderContext'
import { cn } from '../../utils/cn'
import { useState, useCallback } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'

// ─── Data ────────────────────────────────────────────────────────────────────

const usersAndPatientsData = [
  { name: 'يناير',   المستخدمين: 980,  المرضى: 4200 },
  { name: 'فبراير', المستخدمين: 1100, المرضى: 5100 },
  { name: 'مارس',   المستخدمين: 1300, المرضى: 6200 },
  { name: 'أبريل',  المستخدمين: 1500, المرضى: 7100 },
  { name: 'مايو',   المستخدمين: 1890, المرضى: 8300 },
]

const revenueData = [
  { name: 'يناير',   'الإيرادات (د.أ)': 185000 },
  { name: 'فبراير', 'الإيرادات (د.أ)': 220000 },
  { name: 'مارس',   'الإيرادات (د.أ)': 280000 },
  { name: 'أبريل',  'الإيرادات (د.أ)': 320000 },
  { name: 'مايو',   'الإيرادات (د.أ)': 378000 },
]

// Embedded color inside data to keep it accessible during shape re-renders
const clinicCategoryPie = [
  { name: 'طب عام',       value: 45, color: '#0B5A8E', fill: '#0B5A8E' },
  { name: 'طب أسنان',    value: 30, color: '#3FB8AF', fill: '#3FB8AF' },
  { name: 'أمراض القلب',  value: 15, color: '#5DD9D1', fill: '#5DD9D1' },
  { name: 'جراحة',        value: 10, color: '#1E7BA4', fill: '#1E7BA4' },
]

const clinicsAndAppointmentsData = [
  { name: 'يناير',   العيادات: 120, المواعيد: 35000 },
  { name: 'فبراير', العيادات: 145, المواعيد: 42000 },
  { name: 'مارس',   العيادات: 168, المواعيد: 48000 },
  { name: 'أبريل',  العيادات: 190, المواعيد: 56000 },
  { name: 'مايو',   العيادات: 215, المواعيد: 65000 },
]

const topClinics = [
  { name: 'عيادة النور',    users: 45, revenue: '45,000' },
  { name: 'عيادة الأمل',    users: 38, revenue: '38,000' },
  { name: 'عيادة السلام',   users: 32, revenue: '32,000' },
  { name: 'عيادة الشفاء',   users: 28, revenue: '28,000' },
  { name: 'عيادة الرعاية',  users: 25, revenue: '25,000' },
]

// ─── Custom Tooltip (dark theme) ──────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '10px',
          color: '#fff',
          whiteSpace: 'nowrap' as const,
          pointerEvents: 'none',
        }}
      >
        <p style={{ margin: 0 }} className="text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mt-1 text-xs">
            <span style={{ color: entry.stroke || entry.fill }}>{entry.name}:</span>
            <span className="font-bold">{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const RADIAN = Math.PI / 180
const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, name, percent, fill, payload }: any) => {
  // Proportional outer offset balanced with a 110px outer radius to remain safely inside bounds
  const radius = outerRadius + 70
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  
  const labelColor = fill || (payload && payload.fill) || '#1E293B'

  return (
    <text
      x={x}
      y={y}
      fill={labelColor}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={13}
      fontWeight={600}
      style={{ pointerEvents: 'none', transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)' }}
    >
      {`${name}: ${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

// const renderExplodedSector = (props: any) => {
//   const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, isActive } = props
  
//   const offset = isActive ? 12 : 0
//   const dx = offset * Math.cos(-midAngle * RADIAN)
//   const dy = offset * Math.sin(-midAngle * RADIAN)

//   return (
//     <g 
//       style={{ 
//         transform: `translate(${dx}px, ${dy}px)`, 
//         transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)' 
//       }}
//     >
//       <Sector
//         cx={cx}
//         cy={cy}
//         innerRadius={innerRadius}
//         outerRadius={isActive ? outerRadius + 6 : outerRadius}
//         startAngle={startAngle}
//         endAngle={endAngle}
//         fill={fill}
//         stroke="#fff"
//         strokeWidth={2}
//         style={{
//           filter: isActive ? 'drop-shadow(0 6px 16px rgba(0,0,0,0.2))' : 'none',
//           transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
//           cursor: 'pointer',
//         }}
//       />
//     </g>
//   )
// }

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminStats = () => {
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting
  const [period, setPeriod] = useState('6months')
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null)

  const onPieEnter = useCallback((_: any, index: number) => {
    setActivePieIndex(index)
  }, [])

  const onPieLeave = useCallback(() => {
    setActivePieIndex(null)
  }, [])

  const kpiCards = [
    {
      title: 'إجمالي المستخدمين',
      value: '1,890',
      change: '+15%',
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'إجمالي المرضى',
      value: '8,300',
      change: '+23%',
      icon: Activity,
      gradient: 'from-purple-500 to-violet-500',
    },
    {
      title: 'إجمالي العيادات',
      value: '215',
      change: '+18%',
      icon: Building2,
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'إجمالي المواعيد',
      value: '65,000',
      change: '+12%',
      icon: Calendar,
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      title: 'الإيرادات (د.أ)',
      value: '378,000',
      change: '+28%',
      icon: DollarSign,
      gradient: 'from-rose-500 to-pink-500',
    },
  ]

  return (
    <AdminLayout>
      <div
        className={cn(
          'space-y-6 invisible',
          canAnimate && 'animate-fadeUp visible animate-delay-[100ms]',
          isExiting && 'animate-fadeDownOut visible'
        )}
        dir="rtl"
      >
        {/* ─── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl text-[#1A2B3C] mb-2 font-bold">الإحصائيات والتحليلات</h1>
            <p className="text-gray-500">تحليلات شاملة لأداء النظام ونموه</p>
          </div>

          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48 bg-gray-50 border-gray-200">
              <SelectValue placeholder="آخر 6 أشهر" />
            </SelectTrigger>
            <SelectContent smallZ>
              <SelectItem value="6months">آخر 6 أشهر</SelectItem>
              <SelectItem value="3months">آخر 3 أشهر</SelectItem>
              <SelectItem value="year">سنة كاملة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ─── KPI Cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {kpiCards.map((card, index) => {
            const Icon = card.icon
            return (
              <div
                key={index}
                className={cn(
                  'invisible transition-all duration-500',
                  canAnimate && 'animate-fadeUp visible'
                )}
                style={{ animationDelay: `${150 + index * 60}ms` }}
              >
                <div
                  data-slot="card"
                  className="text-card-foreground flex flex-col gap-6 rounded-xl duration-300 p-6 bg-white border border-gray-200 shadow-sm hover:shadow-2xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                      <h3 className="text-2xl text-[#0F172A] mb-2 font-bold">{card.value}</h3>
                      <div className="flex items-center gap-1 text-xs text-emerald-600">
                        <TrendingUp className="size-3.5" />
                        <span>{card.change}</span>
                      </div>
                    </div>
                    <div className={cn('w-12 h-12 bg-gradient-to-br rounded-xl flex items-center justify-center shadow-lg', card.gradient)}>
                      <Icon className="text-white size-6" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ─── Charts Row 1: Users+Patients Line & Revenue Bar ──────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Users & Patients Line Chart */}
          <div
            data-slot="card"
            className={cn(
              'text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-white border border-gray-200 shadow-sm invisible',
              canAnimate && 'animate-fadeUp visible'
            )}
            style={{ animationDelay: '450ms' }}
          >
            <h3 className="text-xl text-[#1E293B] mb-6 font-semibold">نمو المستخدمين والمرضى</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usersAndPatientsData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={true} axisLine={true} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={true} axisLine={true} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="plainline"
                    iconSize={14}
                    formatter={(v: string) => <span className="text-sm" style={{ color: '#94a3b8' }}>{v}</span>}
                  />
                  <Line
                    name="المستخدمين"
                    type="monotone"
                    dataKey="المستخدمين"
                    stroke="#3FB8AF"
                    strokeWidth={3}
                    dot={{ r: 5, strokeWidth: 3, fill: '#3FB8AF', stroke: '#3FB8AF' }}
                  />
                  <Line
                    name="المرضى"
                    type="monotone"
                    dataKey="المرضى"
                    stroke="#5DD9D1"
                    strokeWidth={3}
                    dot={{ r: 5, strokeWidth: 3, fill: '#5DD9D1', stroke: '#5DD9D1' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Bar Chart */}
          <div
            data-slot="card"
            className={cn(
              'text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-white border border-gray-200 shadow-sm invisible',
              canAnimate && 'animate-fadeUp visible'
            )}
            style={{ animationDelay: '510ms' }}
          >
            <h3 className="text-xl text-[#1E293B] mb-6 font-semibold">نمو الإيرادات</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={true} axisLine={true} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={true} axisLine={true} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="rect"
                    iconSize={14}
                    formatter={(v: string) => <span className="text-sm" style={{ color: '#0B5A8E' }}>{v}</span>}
                  />
                  <Bar
                    name="الإيرادات (د.أ)"
                    dataKey="الإيرادات (د.أ)"
                    fill="#0B5A8E"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ─── Charts Row 2: Pie & Top Clinics ──────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
         {/* Clinic Category Pie Chart */}
<div
  data-slot="card"
  className={cn(
    'text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-white border border-gray-200 shadow-sm invisible',
    canAnimate && 'animate-fadeUp visible'
  )}
  style={{ animationDelay: '570ms' }}
>
  <h3 className="text-xl text-[#1E293B] mb-6 font-semibold">
    توزيع العيادات حسب الفئة الطبية
  </h3>

  <div className="w-full h-[420px]">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart margin={{ top: 24, bottom: 24, left: 40, right: 40 }}>
        <Pie
          data={clinicCategoryPie}
          cx="50%"
          cy="50%"
          outerRadius={130}
          dataKey="value"
          label={renderCustomizedLabel}
          labelLine={true}
          stroke="#fff"
          strokeWidth={2}
          onMouseEnter={onPieEnter}
          onMouseLeave={onPieLeave}
        >
          {clinicCategoryPie.map((entry, index) => {
            const isActive = activePieIndex === index

            return (
              <Cell
                key={index}
                fill={entry.color}
                style={{
                  outline: 'none',
                  cursor: 'pointer',
                  filter: isActive
                    ? 'drop-shadow(0 6px 16px rgba(0,0,0,0.2))'
                    : 'none',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: 'center',
                  transition:
                    'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                }}
              />
            )
          })}
        </Pie>

        <Tooltip
          wrapperStyle={{ pointerEvents: 'none', zIndex: 50 }}
          contentStyle={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            color: '#1A2B3C',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            padding: '10px 14px',
            pointerEvents: 'none',
          }}
          itemStyle={{ color: '#334155', fontSize: 13 }}
          labelStyle={{ color: '#1A2B3C', fontWeight: 600 }}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
</div>

          {/* Top Clinics List */}
          <div
            data-slot="card"
            className={cn(
              'text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-white border border-gray-200 shadow-sm invisible',
              canAnimate && 'animate-fadeUp visible'
            )}
            style={{ animationDelay: '630ms' }}
          >
            <h3 className="text-xl text-[#1E293B] mb-6 font-semibold">أفضل العيادات أداءً</h3>
            <div className="space-y-4">
              {topClinics.map((clinic, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 invisible',
                    canAnimate && 'animate-fadeUp visible'
                  )}
                  style={{ animationDelay: `${680 + i * 60}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-[#1A2B3C] font-medium">{clinic.name}</p>
                      <p className="text-sm text-gray-500">{clinic.users} مستخدم</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-emerald-600 font-bold">{clinic.revenue} د.أ</p>
                    <p className="text-xs text-gray-500">إيرادات</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Bottom: Clinics & Appointments Growth ────────────────────── */}
        <div
          data-slot="card"
          className={cn(
            'text-card-foreground flex flex-col gap-6 rounded-xl transition-all duration-300 hover:shadow-lg p-6 bg-white border border-gray-200 shadow-sm invisible',
            canAnimate && 'animate-fadeUp visible'
          )}
          style={{ animationDelay: '740ms' }}
        >
          <h3 className="text-xl text-[#1E293B] mb-6 font-semibold">نمو العيادات والمواعيد</h3>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={clinicsAndAppointmentsData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={true} axisLine={true} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={true} axisLine={true} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="plainline"
                  iconSize={14}
                  formatter={(v: string) => <span className="text-sm" style={{ color: '#94a3b8' }}>{v}</span>}
                />
                <Line
                  name="العيادات"
                  type="monotone"
                  dataKey="العيادات"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 5, strokeWidth: 3, fill: '#f59e0b', stroke: '#f59e0b' }}
                />
                <Line
                  name="المواعيد"
                  type="monotone"
                  dataKey="المواعيد"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ r: 5, strokeWidth: 3, fill: '#8B5CF6', stroke: '#8B5CF6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminStats