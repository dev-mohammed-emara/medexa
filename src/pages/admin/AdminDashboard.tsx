import {
  TrendingUp,
  Building2,
  Users,
  Calendar,
  DollarSign,
  Activity,
  ArrowUpRight
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import AdminLayout from '../../components/layout/AdminLayout'
import { usePreloader } from '../../contexts/PreloaderContext'
import { cn } from '../../utils/cn'

const chartData = [
  { name: 'يناير', العيادات: 120, المستخدمين: 980 },
  { name: 'فبراير', العيادات: 130, المستخدمين: 1234 },
  { name: 'مارس', العيادات: 145, المستخدمين: 1450 },
  { name: 'أبريل', العيادات: 154, المستخدمين: 1678 },
  { name: 'مايو', العيادات: 165, المستخدمين: 1890 }
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-150 p-3 rounded-xl shadow-xl text-right">
        <p className="font-bold text-[#1A2B3C] text-sm mb-1.5">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-6 text-xs mt-1">
            <span className="font-medium" style={{ color: entry.stroke }}>
              {entry.name}:
            </span>
            <span className="font-bold text-gray-900">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const AdminDashboard = () => {
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting

  const stats = [
    {
      title: 'عدد العيادات',
      value: '145',
      change: '+8.9%',
      timeLabel: 'هذا الشهر',
      icon: Building2,
      colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50'
    },
    {
      title: 'عدد المستخدمين',
      value: '1,234',
      change: '+14.5%',
      timeLabel: 'هذا الشهر',
      icon: Users,
      colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-500/10'
    },
    {
      title: 'عدد المواعيد',
      value: '45,678',
      change: '+5.4%',
      timeLabel: 'هذا الشهر',
      icon: Calendar,
      colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50'
    },
    {
      title: 'إيرادات النظام (د.أ)',
      value: '234,500',
      change: '+18.2%',
      timeLabel: 'هذا الشهر',
      icon: DollarSign,
      colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50'
    }
  ]

  const activities = [
    {
      title: 'عيادة جديدة',
      desc: 'تم تسجيل عيادة الرعاية الطبية',
      time: '10 دقائق',
      colorClass: 'text-emerald-600 bg-emerald-50'
    },
    {
      title: 'مستخدم جديد',
      desc: 'انضم د. محمد العمري للنظام',
      time: '25 دقيقة',
      colorClass: 'text-blue-600 bg-blue-500/10'
    },
    {
      title: 'تذكرة جديدة',
      desc: 'طلب دعم من عيادة النور',
      time: 'ساعة واحدة',
      colorClass: 'text-amber-600 bg-amber-50'
    },
    {
      title: 'موافقة معلقة',
      desc: 'طلب موافقة من عيادة الأمل',
      time: '2 ساعات',
      colorClass: 'text-purple-600 bg-purple-50'
    }
  ]

  return (
    <AdminLayout>
      <div
        className={cn(
          "space-y-8 opacity-0",
          canAnimate && "animate-fadeUp opacity-100 animate-delay-[100ms]",
          isExiting && "animate-fadeDownOut"
        )}
        dir="rtl"
        style={{ opacity: canAnimate ? 1 : 0 }}
      >
        {/* Welcome Header */}
        <div className="text-right">
          <h1 className="text-3xl text-[#1A2B3C] mb-2 font-bold">لوحة التحكم الرئيسية</h1>
          <p className="text-gray-500 text-sm">نظرة شاملة على نظام Medexa Cloud</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className={cn(
                  "opacity-0 transition-all duration-500",
                  canAnimate && "animate-fadeUp opacity-100"
                )}
                style={{
                  opacity: canAnimate ? 1 : 0,
                  animationDelay: `${150 + index * 50}ms`
                }}
              >
                <div
                  data-slot="card"
                  className="text-card-foreground flex flex-col gap-6 rounded-xl p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-2">{stat.title}</p>
                      <h3 className="text-3xl text-[#1A2B3C] mb-3 font-bold">{stat.value}</h3>
                      <div className="flex items-center gap-2">
                        <span
                          data-slot="badge"
                          className={cn(
                            "inline-flex items-center justify-center rounded-md border text-xs font-semibold px-2 py-0.5",
                            stat.colorClass
                          )}
                        >
                          <TrendingUp className="size-3 ml-1" />
                          <span>{stat.change}</span>
                        </span>
                        <span className="text-xs text-gray-500">{stat.timeLabel}</span>
                      </div>
                    </div>
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", stat.iconBg)}>
                      <Icon className={cn("size-6", stat.iconColor)} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Panels Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recharts System Growth Line Chart */}
          <div
            className={cn(
              "lg:col-span-2 opacity-0 transition-all duration-500",
              canAnimate && "animate-fadeUp opacity-100"
            )}
            style={{
              opacity: canAnimate ? 1 : 0,
              animationDelay: '350ms'
            }}
          >
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="text-right">
                  <h3 className="text-lg text-[#1A2B3C] mb-1 font-bold">نمو النظام</h3>
                  <p className="text-sm text-gray-500">العيادات والمستخدمين - آخر 5 أشهر</p>
                </div>
                <span className="inline-flex items-center justify-center rounded-md border border-blue-500/20 px-2 py-0.5 text-xs font-medium w-fit bg-blue-500/10 text-blue-600">
                  <Activity className="size-3.5 ml-1 text-blue-600" />
                  نشط
                </span>
              </div>

              {/* Chart container */}
              <div className="w-full h-[300px] min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis
                      dataKey="name"
                      stroke="#94A3B8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#94A3B8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => <span className="text-xs text-gray-500 font-medium mr-1">{value}</span>}
                    />
                    <Line
                      name="العيادات"
                      type="monotone"
                      dataKey="العيادات"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ r: 5, strokeWidth: 2, fill: '#10B981', stroke: '#fff' }}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                    <Line
                      name="المستخدمين"
                      type="monotone"
                      dataKey="المستخدمين"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ r: 5, strokeWidth: 2, fill: '#3B82F6', stroke: '#fff' }}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Activity Log */}
          <div
            className={cn(
              "opacity-0 transition-all duration-500",
              canAnimate && "animate-fadeUp opacity-100"
            )}
            style={{
              opacity: canAnimate ? 1 : 0,
              animationDelay: '400ms'
            }}
          >
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-lg text-[#1A2B3C] mb-4 font-bold text-right">النشاطات الأخيرة</h3>
                <div className="space-y-4">
                  {activities.map((act, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50/80 transition-colors cursor-pointer group"
                    >
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300", act.colorClass)}>
                        <Activity className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0 text-right">
                        <p className="text-sm text-[#1A2B3C] font-semibold mb-1">{act.title}</p>
                        <p className="text-xs text-gray-500 truncate">{act.desc}</p>
                        <p className="text-xs text-gray-400 mt-1">{act.time}</p>
                      </div>
                      <ArrowUpRight className="size-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0 self-center" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
