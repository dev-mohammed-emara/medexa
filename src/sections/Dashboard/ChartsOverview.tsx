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

import { genderData, ageData, appointmentData } from '../../constants/Dashboard_dummy'

const ChartsOverview = () => {
  const { isLoaded, isExiting } = usePreloader()
  const canAnimate = isLoaded && !isExiting

  return (
    <div 
      className={cn(
        "space-y-6 mb-10 opacity-0", 
        canAnimate && "animate-fadeUp opacity-100 animate-delay-300",
        isExiting && "animate-fadeDownOut"
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <section className="bg-white p-6 border border-border shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-bold mb-6 text-right">توزيع المرضى حسب الجنس</h3>
          <figure className="h-[300px] w-full">
            {isLoaded && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    isAnimationActive={true}
                    label={({ name, percent }: { name?: string; percent?: number }) => {
                      const safeName = name || ''
                      const safePercent = (percent || 0) * 100
                      return `${safeName} ${safePercent.toFixed(0)}%`
                    }}
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </figure>
        </section>

        {/* Age Distribution */}
        <section className="bg-white p-6 border border-border shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-bold mb-6 text-right">توزيع المرضى حسب العمر</h3>
          <figure className="h-[300px] w-full">
            {isLoaded && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData}>
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
        <h3 className="text-lg font-bold mb-6 text-right">المواعيد اليومية</h3>
        <figure className="h-[300px] w-full">
          {isLoaded && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={appointmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EEF2" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} orientation="right" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Legend verticalAlign="bottom" height={36} />
                <Line
                  name="عدد المواعيد"
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
    </div>
  )
}

export default ChartsOverview
