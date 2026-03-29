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
import { useLanguage } from '../../contexts/LanguageContext';
import { financeTranslations } from '../../constants/translations/finance';
import { cn } from '../../utils/cn';
import { useBroadcast } from '../../hooks/useBroadcast';
import AddOperationModal from './AddOperationModal';

const getChartData = (t: (key: string, T: any) => string, T: any) => [
  { name: t('january', T), income: 25000, expenses: 15000 },
  { name: t('february', T), income: 32000, expenses: 21000 },
  { name: t('march', T), income: 28000, expenses: 18000 },
  { name: t('april', T), income: 35000, expenses: 25000 },
  { name: t('may', T), income: 40000, expenses: 28000 },
  { name: t('june', T), income: 38000, expenses: 22000 },
];

const getTransactions = (t: (key: string, T: any) => string, T: any, isAr: boolean) => [
  { id: 1, type: 'income', amount: '500', currency: 'jod', date: '28/02/2026', related: isAr ? 'موعد #123' : 'Appointment #123', notes: t('general_exam', T) },
  { id: 2, type: 'expense', amount: '1,200', currency: 'jod', date: '27/02/2026', related: '-', notes: t('buy_equip', T) },
  { id: 3, type: 'income', amount: '750', currency: 'jod', date: '26/02/2026', related: isAr ? 'موعد #122' : 'Appointment #122', notes: t('kids_exam', T) },
  { id: 4, type: 'income', amount: '300', currency: 'jod', date: '25/02/2026', related: isAr ? 'موعد #121' : 'Appointment #121', notes: t('follow_up', T) },
  { id: 5, type: 'expense', amount: '150', currency: 'jod', date: '24/02/2026', related: '-', notes: t('utilities', T) },
];

const FinanceOverview = () => {
  const { isAr, t, dir } = useLanguage();
  const T = financeTranslations;
  const { isLoaded, isExiting } = usePreloader();
  const canAnimate = isLoaded && !isExiting;

  useBroadcast((event) => {
    if (event.type === 'DATA_UPDATE' && event.module === 'finance') {
      console.log('Finance data updated in another tab');
    }
  });

  const [fromDate, setFromDate] = useState<Date | string>("2026-02-01");
  const [toDate, setToDate] = useState<Date | string>("2026-02-28");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const chartData = getChartData(t, T);
  const transactions = getTransactions(t, T, isAr);

  const commonOptions = {
    dateFormat: 'd F Y',
    locale: isAr ? Arabic : undefined,
    disableMobile: true
  };

  const handleApply = () => {
    // Logic for filtering
    console.log(`Filtering from ${fromDate} to ${toDate}`);
  };

  return (
    <section className="flex-1 space-y-6 overflow-auto" dir={dir}>
      {/* Header */}
      <header
        className="flex items-center justify-between transition-all duration-500"
        style={{ opacity: canAnimate ? 1 : 0, transform: canAnimate ? 'none' : 'translateY(10px)' }}
      >
        <div className={cn(isAr ? "text-right" : "text-left")}>
          <h1 className="text-3xl mb-1 font-bold">{t('page_title', T)}</h1>
          <p className="text-muted-foreground">{t('page_desc', T)}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-bold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md text-primary-foreground bg-primary hover:bg-primary/90 h-10 px-6 shadow-sm shadow-primary/20"
        >
          <Plus className={cn("size-5", isAr ? "ml-1" : "mr-1")} />
          {t('add_operation', T)}
        </button>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: t('total_income', T), value: `1,250 ${t('jod', T)}`, icon: TrendingUp, color: 'text-secondary', bgColor: 'bg-secondary/10', delay: 100 },
          { label: t('total_expenses', T), value: `1,200 ${t('jod', T)}`, icon: TrendingDown, color: 'text-destructive', bgColor: 'bg-destructive/10', delay: 200 },
          { label: t('net_profit', T), value: `50 ${t('jod', T)}`, icon: DollarSign, color: 'text-primary', bgColor: 'bg-primary/10', delay: 300 }
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
        <h3 className={cn("text-lg font-semibold mb-2", isAr ? "text-right" : "text-left")}>{t('income_vs_expenses', T)}</h3>
        <figure className=" xs:h-[300px] xs:w-full w-[130%] h-[400px] xs:translate-x-0 translate-x-[30px] transition-all duration-300">
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 30, bottom: 25 }}>
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
                name={t('income', T)}
                type="monotone"
                dataKey="income"
                stroke="#3FB89F"
                strokeWidth={3}
                dot={{ r: 3, strokeWidth: 3, fill: '#fff' }}
                activeDot={{ r: 5, strokeWidth: 0 }}
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
              <Line
                name={t('expenses', T)}
                type="monotone"
                dataKey="expenses"
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
        <header className={cn("flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8", isAr ? "xl:flex-row" : "xl:flex-row-reverse")}>
          <h3 className="text-lg font-bold">{t('financial_operations', T)}</h3>

          <div className={cn("flex flex-wrap items-end gap-3 transition-all duration-700", canAnimate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")} style={{ transitionDelay: '550ms' }}>
            <div className="space-y-1.5 flex-1 min-w-[170px]">
              <label className={cn("flex items-center gap-2 font-bold select-none text-xs text-muted-foreground", isAr ? "mr-1" : "ml-1")}>{t('from_date', T)}</label>
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
              <label className={cn("flex items-center gap-2 font-bold select-none text-xs text-muted-foreground", isAr ? "mr-1" : "ml-1")}>{t('to_date', T)}</label>
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
              {t('apply_filters', T)}
            </button>
          </div>
        </header>

        {/* Mobile Swipe Indicator */}
        <aside className="sm:hidden flex items-center justify-center gap-3 mb-4 py-2 px-4 rounded-full bg-muted/30 text-muted-foreground/80 text-xs font-bold ring-1 ring-border/50 animate-pulse backdrop-blur-xs">
          <Smartphone className="size-3.5" />
          <span>{t('mobile_swipe', T)}</span>
          <MoveHorizontal className="size-3.5" />
        </aside>

        <section className="overflow-x-auto rounded-lg border border-border/50">
          <table className="w-full text-sm text-right whitespace-nowrap">
            <thead className="bg-muted/30 border-b border-border/50 text-muted-foreground font-bold">
              <tr>
                <th className={cn("p-4", isAr ? "text-right" : "text-left")}>{t('table_type', T)}</th>
                <th className={cn("p-4", isAr ? "text-right" : "text-left")}>{t('table_amount', T)}</th>
                <th className={cn("p-4", isAr ? "text-right" : "text-left")}>{t('table_currency', T)}</th>
                <th className={cn("p-4", isAr ? "text-right" : "text-left")}>{t('table_date', T)}</th>
                <th className={cn("p-4", isAr ? "text-right" : "text-left")}>{t('table_related', T)}</th>
                <th className={cn("p-4", isAr ? "text-right" : "text-left")}>{t('table_notes', T)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold",
                        tx.type === 'income' ? "bg-secondary/10 text-secondary" : "bg-destructive/10 text-destructive"
                      )}>
                        {tx.type === 'income' ? t('type_income', T) : t('type_expense', T)}
                      </span>
                    </td>
                    <td className="p-4 font-bold">{tx.amount}</td>
                    <td className="p-4">{t('jod', T)}</td>
                    <td className="p-4 font-medium text-muted-foreground">{tx.date}</td>
                    <td className="p-4 text-muted-foreground">{tx.related}</td>
                    <td className={cn("p-4 text-muted-foreground", isAr ? "text-right" : "text-left")}>{tx.notes}</td>
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
