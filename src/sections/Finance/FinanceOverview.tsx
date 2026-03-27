import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Smartphone,
  MoveHorizontal
} from 'lucide-react';
import { FaCalendarAlt } from 'react-icons/fa';
import { Arabic } from 'flatpickr/dist/l10n/ar.js';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/material_green.css';
import { usePreloader } from '../../contexts/PreloaderContext';
import { cn } from '../../utils/cn';
import AddOperationModal from './AddOperationModal';

const CHART_DATA = [
  { name: 'يناير', دخل: 25000, مصروفات: 15000 },
  { name: 'فبراير', دخل: 32000, مصروفات: 21000 },
  { name: 'مارس', دخل: 28000, مصروفات: 18000 },
  { name: 'أبريل', دخل: 35000, مصروفات: 25000 },
  { name: 'مايو', دخل: 40000, مصروفات: 28000 },
  { name: 'يونيو', دخل: 38000, مصروفات: 22000 },
];

const TRANSACTIONS = [
  { id: 1, type: 'دخل', amount: '500', currency: 'د.أ', date: '٢٨/٢/٢٠٢٦', related: 'موعد #123', notes: 'كشف عام' },
  { id: 2, type: 'مصروف', amount: '1,200', currency: 'د.أ', date: '٢٧/٢/٢٠٢٦', related: '-', notes: 'شراء معدات طبية' },
  { id: 3, type: 'دخل', amount: '750', currency: 'د.أ', date: '٢٦/٢/٢٠٢٦', related: 'موعد #122', notes: 'كشف أطفال' },
  { id: 4, type: 'دخل', amount: '300', currency: 'د.أ', date: '٢٥/٢/٢٠٢٦', related: 'موعد #121', notes: 'متابعة ناتجة' },
  { id: 5, type: 'مصروف', amount: '150', currency: 'د.أ', date: '٢٤/٢/٢٠٢٦', related: '-', notes: 'كهرباء ومياه' },
];

const FinanceOverview = () => {
  const { isLoaded, isExiting } = usePreloader();
  const canAnimate = isLoaded && !isExiting;

  const [fromDate, setFromDate] = useState<Date | string>("2026-02-01");
  const [toDate, setToDate] = useState<Date | string>("2026-02-28");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const commonOptions = {
    dateFormat: 'd F Y',
    locale: Arabic,
    disableMobile: true
  };

  const handleApply = () => {
    // Logic for filtering
    console.log(`Filtering from ${fromDate} to ${toDate}`);
  };

  return (
    <section className="flex-1 space-y-6 overflow-auto" dir="rtl">
      {/* Header */}
      <header
        className="flex items-center justify-between transition-all duration-500"
        style={{ opacity: canAnimate ? 1 : 0, transform: canAnimate ? 'none' : 'translateY(10px)' }}
      >
        <div>
          <h1 className="text-3xl mb-1 font-bold">المالية</h1>
          <p className="text-muted-foreground">إدارة الإيرادات والمصروفات</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-bold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md text-primary-foreground bg-primary hover:bg-primary/90 h-10 px-6 shadow-sm shadow-primary/20"
        >
          <Plus className="size-5 ml-1" />
          إضافة عملية
        </button>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'إجمالي الدخل', value: '1,250 د.أ', icon: TrendingUp, color: 'text-secondary', bgColor: 'bg-secondary/10', delay: 100 },
          { label: 'إجمالي المصروفات', value: '1,200 د.أ', icon: TrendingDown, color: 'text-destructive', bgColor: 'bg-destructive/10', delay: 200 },
          { label: 'صافي الربح', value: '50 د.أ', icon: DollarSign, color: 'text-primary', bgColor: 'bg-primary/10', delay: 300 }
        ].map((stat, idx) => (
          <article
            key={idx}
            data-slot="card"
            className={cn(
              "text-card-foreground flex flex-col gap-6 rounded-xl border p-6 bg-white border-border shadow-sm transition-all duration-500",
              canAnimate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: `${stat.delay}ms` }}
          >
            <figure className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.bgColor)}>
                <stat.icon className={cn("size-5", stat.color)} strokeWidth={2.5} />
              </div>
            </figure>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
          </article>
        ))}
      </section>

      {/* Chart Card */}
      <article
        data-slot="card"
        className={cn(
          "text-card-foreground flex flex-col gap-6 rounded-xl border p-6 bg-white border-border shadow-sm transition-all duration-500",
          canAnimate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
        style={{ transitionDelay: '400ms' }}
      >
        <h3 className="text-lg font-semibold mb-2">الدخل مقابل المصروفات</h3>
        <figure className=" xs:h-[300px] xs:w-full w-[130%] h-[400px] xs:translate-x-0 translate-x-[30px] transition-all duration-300">
          <ResponsiveContainer>
            <LineChart data={CHART_DATA} margin={{ top: 5, right: 30, left: 30, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#E8EEF2" />
              <XAxis
                dataKey="name"
                axisLine={{ stroke: '#666' }}
                tickLine={{ stroke: '#666' }}
                tick={{ fill: '#666', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={{ stroke: '#666' }}
                tickLine={{ stroke: '#666' }}
                tick={{ fill: '#666', fontSize: 12 }}
                dx={-40}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  padding: '10px'
                }}
                itemStyle={{ fontSize: '12px', fontWeight: 600 }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value: string) => <span className="mr-2">{value}</span>}
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Line
                name="الدخل"
                type="monotone"
                dataKey="دخل"
                stroke="#3FB8AF"
                strokeWidth={3}
                dot={{ r: 3, strokeWidth: 3, fill: '#fff' }}
                activeDot={{ r: 5, strokeWidth: 0 }}
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
              <Line
                name="المصروفات"
                type="monotone"
                dataKey="مصروفات"
                stroke="#d4183d"
                strokeWidth={3}
                dot={{ r: 3, strokeWidth: 3, fill: '#fff' }}
                activeDot={{ r: 5, strokeWidth: 0 }}
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </figure>
      </article>

      {/* Transactions Table Card */}
      <article
        data-slot="card"
        className={cn(
          "text-card-foreground flex flex-col gap-6 rounded-xl border p-6 bg-white border-border shadow-sm transition-all duration-500",
          canAnimate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
        style={{ transitionDelay: '500ms' }}
      >
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
          <h3 className="text-lg font-bold">العمليات المالية</h3>

          <div className={cn("flex flex-wrap items-end gap-3 transition-all duration-700", canAnimate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")} style={{ transitionDelay: '550ms' }}>
            <div className="space-y-1.5 flex-1 min-w-[170px]">
              <label className="flex items-center gap-2 font-bold select-none text-xs text-muted-foreground mr-1">من تاريخ</label>
              <div className="relative group flex items-center justify-between h-11 bg-white border border-border rounded-xl px-4 transition-all focus-within:ring-4 focus-within:ring-primary/10">
                <Flatpickr
                  value={fromDate}
                  onChange={([date]) => setFromDate(date)}
                  options={commonOptions}
                  className="flex-1 bg-transparent border-none outline-none text-right text-sm font-bold h-full"
                />
                <FaCalendarAlt className="text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors size-4" />
              </div>
            </div>

            <div className="space-y-1.5 flex-1 min-w-[170px]">
              <label className="flex items-center gap-2 font-bold select-none text-xs text-muted-foreground mr-1">إلى تاريخ</label>
              <div className="relative group flex items-center justify-between h-11 bg-white border border-border rounded-xl px-4 transition-all focus-within:ring-4 focus-within:ring-primary/10">
                <Flatpickr
                  value={toDate}
                  onChange={([date]) => setToDate(date)}
                  options={commonOptions}
                  className="flex-1 bg-transparent border-none outline-none text-right text-sm font-bold h-full"
                />
                <FaCalendarAlt className="text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors size-4" />
              </div>
            </div>

            <button
              onClick={handleApply}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-300 outline-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md text-primary-foreground hover:shadow-primary/20 px-6 h-11 bg-primary hover:bg-primary/90 min-w-[100px]"
            >
              تطبيق
            </button>
          </div>
        </header>

        {/* Mobile Swipe Indicator */}
        <aside className="sm:hidden flex items-center justify-center gap-3 mb-4 py-2 px-4 rounded-full bg-muted/30 text-muted-foreground/80 text-xs font-bold ring-1 ring-border/50 animate-pulse backdrop-blur-xs">
          <Smartphone className="size-3.5" />
          <span>اسحب لليسار أو اليمين لتصفح الجدول</span>
          <MoveHorizontal className="size-3.5" />
        </aside>

        <section className="overflow-x-auto rounded-lg border border-border/50">
          <table className="w-full text-sm text-right whitespace-nowrap">
            <thead className="bg-muted/30 border-b border-border/50 text-muted-foreground font-bold">
              <tr>
                <th className="p-4">نوع العملية</th>
                <th className="p-4">المبلغ</th>
                <th className="p-4">العملة</th>
                <th className="p-4">التاريخ</th>
                <th className="p-4">الموعد المرتبط</th>
                <th className="p-4">ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {TRANSACTIONS.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold",
                      tx.type === 'دخل' ? "bg-secondary/10 text-secondary" : "bg-destructive/10 text-destructive"
                    )}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="p-4 font-bold">{tx.amount}</td>
                  <td className="p-4">{tx.currency}</td>
                  <td className="p-4 font-medium text-muted-foreground">{tx.date}</td>
                  <td className="p-4 text-muted-foreground">{tx.related}</td>
                  <td className="p-4 text-muted-foreground">{tx.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </article>

      <AddOperationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(data) => {
          console.log("Success:", data);
          setIsModalOpen(false);
        }}
      />
    </section>
  );
};

export default FinanceOverview;
