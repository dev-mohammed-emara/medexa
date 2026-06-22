import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Smartphone,
  MoveHorizontal,
  Eye,
  SquarePen,
  RotateCcw
} from 'lucide-react';

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
import 'flatpickr/dist/themes/material_green.css';
import { usePreloader } from '../../contexts/PreloaderContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { financeTranslations } from '../../constants/translations/finance';
import { cn } from '../../utils/cn';
import { useBroadcast } from '../../hooks/useBroadcast';
import DateFromTo from '../../components/ui/DateFromTo';
import AddOperationModal from './AddOperationModal';
import Counter from '../../components/ui/Counter';
import TableFooter from '../../components/ui/TableFooter';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

import { getCookie } from '../../utils/cookie';
import { apiFetch } from '../../utils/apiFetch';


const FinanceOverview = () => {
  const { isAr, t, dir } = useLanguage();
  const T = financeTranslations;
  const { isLoaded, isExiting } = usePreloader();
  const { hasAnyPermission } = useAuth();
  const canAnimate = isLoaded && !isExiting;
  const canManageTransactions = hasAnyPermission(['MANAGE_TRANSACTIONS']);

  useBroadcast((event) => {
    if (event.type === 'DATA_UPDATE' && event.module === 'finance') {
      console.log('Finance data updated in another tab');
    }
  });

  const getLocalDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const defaultToDate = getLocalDateString(today);
  const defaultFromDate = getLocalDateString(yesterday);

  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [sort, setSort] = useState<string>("createdAt,desc");

  const [tempFromDate, setTempFromDate] = useState<string>("");
  const [tempToDate, setTempToDate] = useState<string>("");
  const [tempType, setTempType] = useState<string>("");
  const [tempSort, setTempSort] = useState<string>("createdAt,desc");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedTransactionUuid, setSelectedTransactionUuid] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);

  const [stats, setStats] = useState<{
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    monthlyData: Array<{ month: string; income: number; expense: number }>;
  }>({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    monthlyData: []
  });

  const getHeaders = () => {
    const token = getCookie('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const loadTransactions = useCallback(async (isCancelled?: () => boolean) => {
    if (!canManageTransactions) return;
    try {
      const queryParams = new URLSearchParams();
      if (fromDate) queryParams.append('fromDate', fromDate);
      if (toDate) queryParams.append('toDate', toDate);
      if (type && type !== 'DEFAULT') {
        queryParams.append('type', type);
      }
      queryParams.append('page', String(currentPage - 1));
      queryParams.append('size', String(itemsPerPage));
      queryParams.append('sort', sort);

      const response = await apiFetch(`/api/transaction?${queryParams.toString()}`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (isCancelled?.()) return;

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.content || []);
        setTotalElements(data.totalElements || 0);
      }
    } catch (err) {
      if (isCancelled?.()) return;
      console.error('Error fetching transactions:', err);
    }
  }, [fromDate, toDate, type, sort, currentPage, itemsPerPage, canManageTransactions]);

  const loadStatistics = useCallback(async (isCancelled?: () => boolean) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('fromDate', fromDate || defaultFromDate);
      queryParams.append('toDate', toDate || defaultToDate);

      const response = await apiFetch(`/api/statistics/transaction?${queryParams.toString()}`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (isCancelled?.()) return;

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      if (isCancelled?.()) return;
      console.error('Error fetching statistics:', err);
    }
  }, [fromDate, toDate, defaultFromDate, defaultToDate]);

  useEffect(() => {
    let cancelled = false;
    loadTransactions(() => cancelled);
    return () => { cancelled = true; };
  }, [loadTransactions]);

  useEffect(() => {
    let cancelled = false;
    loadStatistics(() => cancelled);
    return () => { cancelled = true; };
  }, [loadStatistics]);

  const handleApply = () => {
    setFromDate(tempFromDate);
    setToDate(tempToDate);
    setType(tempType);
    setSort(tempSort);
    setCurrentPage(1);
  };

  const chartData = (stats?.monthlyData || []).map(item => ({
    name: item.month,
    income: item.income,
    expenses: item.expense
  }));

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
        {canManageTransactions && (
          <button
            onClick={() => {
              setModalMode('add');
              setSelectedTransactionUuid(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-bold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md text-primary-foreground bg-primary hover:bg-primary/90 h-10 px-6 shadow-sm shadow-primary/20"
          >
            <Plus className={cn("size-5", isAr ? "ml-1" : "mr-1")} />
            {t('add_operation', T)}
          </button>
        )}
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 gap-4">
        {[
          { label: t('total_income', T), valueNum: stats?.totalIncome || 0, icon: TrendingUp, color: 'text-secondary', bgColor: 'bg-secondary/10', delay: 100 },
          { label: t('total_expenses', T), valueNum: stats?.totalExpense || 0, icon: TrendingDown, color: 'text-destructive', bgColor: 'bg-destructive/10', delay: 200 },
          { label: t('net_profit', T), valueNum: stats?.netProfit || 0, icon: DollarSign, color: 'text-primary', bgColor: 'bg-primary/10', delay: 300 }
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
            <h3 className="text-2xl font-bold flex items-center gap-1.5" dir="ltr">
              <Counter value={stat.valueNum} fontSize={24} isInView={canAnimate} isCurrency />
              <span className="text-lg">{t('jod', T)}</span>
            </h3>
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
      {canManageTransactions && (
        <article
          data-slot="card"
          className={cn(
            "text-card-foreground flex flex-col rounded-xl border transition-all duration-500 bg-white border-border shadow-sm overflow-hidden",
            canAnimate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={{ transitionDelay: '500ms' }}
        >
          <header className={cn("flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8 p-6 pb-0", isAr ? "xl:flex-row" : "xl:flex-row-reverse")}>
            <h3 className="text-xl font-bold">{t('financial_operations', T)}</h3>

            <div className={cn("flex flex-wrap items-end gap-3 transition-all duration-700 w-full xl:w-auto", canAnimate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")} style={{ transitionDelay: '550ms' }}>
              <DateFromTo
                fromDate={tempFromDate}
                toDate={tempToDate}
                onFromDateChange={setTempFromDate}
                onToDateChange={setTempToDate}
                onApply={() => { }}
                showApply={false}
              />

              {/* Type Filter */}
              <div className="space-y-1.5 flex-1 min-w-[150px] text-start">
                <label className="flex items-center gap-2 font-bold select-none text-xs text-muted-foreground mr-1">
                  {isAr ? "نوع العملية" : "Type"}
                </label>
                <Select value={tempType} onValueChange={setTempType}>
                  <SelectTrigger className="rounded-xl h-11 bg-white border-border text-foreground font-bold">
                    <SelectValue placeholder={isAr ? "الكل" : "All"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl z-600 bg-white" dir={isAr ? "rtl" : "ltr"}>
                    <SelectItem value="DEFAULT">{isAr ? "الكل" : "All"}</SelectItem>
                    <SelectItem value="INCOME">{isAr ? "دخل" : "Income"}</SelectItem>
                    <SelectItem value="EXPENSE">{isAr ? "مصروف" : "Expense"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Filter */}
              <div className="space-y-1.5 flex-1 min-w-[180px] text-start">
                <label className="flex items-center gap-2 font-bold select-none text-xs text-muted-foreground mr-1">
                  {isAr ? "ترتيب حسب" : "Sort By"}
                </label>
                <Select value={tempSort} onValueChange={setTempSort}>
                  <SelectTrigger className="rounded-xl h-11 bg-white border-border text-foreground font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl z-600 bg-white" dir={isAr ? "rtl" : "ltr"}>
                    <SelectItem value="createdAt,desc">{isAr ? "الأحدث أولاً" : "Newest First"}</SelectItem>
                    <SelectItem value="createdAt,asc">{isAr ? "الأقدم أولاً" : "Oldest First"}</SelectItem>
                    <SelectItem value="amount,asc">{isAr ? "المبلغ (من الأقل للأكثر)" : "Amount (Low to High)"}</SelectItem>
                    <SelectItem value="amount,desc">{isAr ? "المبلغ (من الأكثر للأقل)" : "Amount (High to Low)"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                <button
                  onClick={handleApply}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-300 outline-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md text-primary-foreground hover:shadow-primary/20 px-6 h-11 bg-primary hover:bg-primary/90 min-w-[100px] flex-1 sm:flex-none"
                >
                  {isAr ? "تطبيق الفلاتر" : "Apply Filters"}
                </button>
                <button
                  onClick={() => {
                    setTempFromDate("");
                    setTempToDate("");
                    setTempType("DEFAULT");
                    setTempSort("createdAt,desc");
                    setFromDate("");
                    setToDate("");
                    setType("DEFAULT");
                    setSort("createdAt,desc");
                    setCurrentPage(1);
                  }}
                  className="inline-flex items-center justify-center rounded-xl transition-all duration-300 outline-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md border border-border bg-background text-foreground hover:bg-accent px-3.5 h-11"
                  title={isAr ? "إعادة ضبط" : "Reset"}
                >
                  <RotateCcw className="size-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Mobile Swipe Indicator */}
          <aside className="sm:hidden flex items-center justify-center gap-3 mb-4 py-2 px-4 rounded-full bg-muted/30 text-muted-foreground/80 text-xs font-bold ring-1 ring-border/50 animate-pulse backdrop-blur-xs">
            <Smartphone className="size-3.5" />
            <span>{t('mobile_swipe', T)}</span>
            <MoveHorizontal className="size-3.5" />
          </aside>

          <section className="overflow-x-auto">
            <Table className="w-full text-sm text-right whitespace-nowrap">
              <TableHeader className="bg-muted/30 border-b border-gray-200 text-muted-foreground font-bold">
                <TableRow>
                  <TableHead className={cn("p-4", isAr ? "text-right" : "text-left")}>{t('table_type', T)}</TableHead>
                  <TableHead className={cn("p-4", isAr ? "text-right" : "text-left")}>{t('table_amount', T)}</TableHead>
                  <TableHead className={cn("p-4", isAr ? "text-right" : "text-left")}>{t('table_currency', T)}</TableHead>
                  <TableHead className={cn("p-4", isAr ? "text-right" : "text-left")}>{t('table_date', T)}</TableHead>
                  <TableHead className={cn("p-4", isAr ? "text-right" : "text-left")}>{t('table_related', T)}</TableHead>
                  <TableHead className={cn("p-4", isAr ? "text-right" : "text-left")}>{t('table_notes', T)}</TableHead>
                  <TableHead className={cn("p-4", isAr ? "text-right" : "text-left")}>{t('table_operations', T)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/30">
                {transactions.map((tx) => (
                  <TableRow key={tx.uuid} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="p-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold",
                        (tx.type === 'income' || tx.type === 'INCOME') ? "bg-secondary/10 text-secondary" : "bg-destructive/10 text-destructive"
                      )}>
                        {(tx.type === 'income' || tx.type === 'INCOME') ? t('type_income', T) : t('type_expense', T)}
                      </span>
                    </TableCell>
                    <TableCell className="p-4 font-bold">{tx.amount}</TableCell>
                    <TableCell className="p-4">{t('jod', T)}</TableCell>
                    <TableCell className="p-4 font-medium text-muted-foreground">{tx.transactionDate}</TableCell>
                    <TableCell className="p-4 text-muted-foreground">
                      {tx.appointmentUuid ? `${isAr ? 'موعد' : 'Appointment'} #${tx.appointmentUuid.substring(0, 8)}` : '-'}
                    </TableCell>
                    <TableCell className={cn("p-4 text-muted-foreground", isAr ? "text-right" : "text-left")}>{tx.note || '-'}</TableCell>
                    <TableCell className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedTransactionUuid(tx.uuid);
                            setModalMode('view');
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-primary"
                        >
                          <Eye className="size-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTransactionUuid(tx.uuid);
                            setModalMode('edit');
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-secondary"
                        >
                          <SquarePen className="size-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center text-muted-foreground p-4">
                      {t('no_results', T)}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <TableFooter
              variant="table"
              totalItems={totalElements}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              className='pb-4'
              onItemsPerPageChange={(val) => {
                setItemsPerPage(val === 'all' ? totalElements : Number(val));
                setCurrentPage(1);
              }}
            />
          </section>
        </article>
      )}

      <AddOperationModal
        isOpen={isModalOpen}
        mode={modalMode}
        transactionUuid={selectedTransactionUuid}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTransactionUuid(null);
        }}
        onSuccess={() => {
          setIsModalOpen(false);
          setSelectedTransactionUuid(null);
          loadTransactions();
          loadStatistics();
        }}
      />
    </section>
  );
};

export default FinanceOverview;
