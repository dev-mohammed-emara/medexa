import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import ChartsOverview from '../sections/Dashboard/ChartsOverview'
import DashboardHeader from '../sections/Dashboard/DashboardHeader'
import StatsOverview from '../sections/Dashboard/StatsOverview'
import { fetchClinicStatistics } from '../api/statisticsApi'
import type { ClinicStatisticsResponse } from '../api/statisticsApi'
import { formatDateApi } from '../utils/date'
import { useLanguage } from '../contexts/LanguageContext'
import { useUrlFilters } from '../hooks/useUrlFilters'

const getLocalDateString = (d: Date) => formatDateApi(d) || '';

const Statistics = () => {
  const { isAr } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const defaultFromDate = getLocalDateString(firstDayOfMonth);
  const defaultToDate = getLocalDateString(today);

  // Initial parameters resolution (URL takes priority over sessionStorage, which takes priority over defaults)
  const initialParams = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlFromDate = urlParams.get('dateFrom');
    const urlToDate = urlParams.get('dateTo');

    const saved = (() => {
      try {
        const data = sessionStorage.getItem('medexa_filter_statistics');
        return data ? JSON.parse(data) : null;
      } catch {
        return null;
      }
    })();

    return {
      fromDate: urlFromDate !== null ? urlFromDate : (saved?.fromDate ?? defaultFromDate),
      toDate: urlToDate !== null ? urlToDate : (saved?.toDate ?? defaultToDate),
      tempFromDate: urlFromDate !== null ? urlFromDate : (saved?.tempFromDate ?? defaultFromDate),
      tempToDate: urlToDate !== null ? urlToDate : (saved?.tempToDate ?? defaultToDate),
    };
  }, [defaultFromDate, defaultToDate]);

  // Active filter states (used for API requests)
  const [fromDate, setFromDate] = useState<string>(initialParams.fromDate);
  const [toDate, setToDate] = useState<string>(initialParams.toDate);

  // Temp filter states (used in picker input local state)
  const [tempFromDate, setTempFromDate] = useState<string>(initialParams.tempFromDate);
  const [tempToDate, setTempToDate] = useState<string>(initialParams.tempToDate);

  const [clinicStats, setClinicStats] = useState<ClinicStatisticsResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Sync active states back to local inputs (e.g. on back/forward browser navigation)
  useEffect(() => {
    setTempFromDate(fromDate);
    setTempToDate(toDate);
  }, [fromDate, toDate]);

  // Hook for SEO URL and SessionStorage synchronization
  useUrlFilters({
    sessionKey: 'medexa_filter_statistics',
    filters: [
      { key: 'dateFrom', state: fromDate, setState: setFromDate, defaultValue: defaultFromDate },
      { key: 'dateTo', state: toDate, setState: setToDate, defaultValue: defaultToDate },
    ],
  });

  // Static Title
  useEffect(() => {
    document.title = isAr ? 'الإحصائيات | Medexa' : 'Statistics | Medexa';
  }, [isAr]);

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const stats = await fetchClinicStatistics(fromDate, toDate)
      setClinicStats(stats)
    } catch (error: any) {
      console.error(error)
      window.showToast?.(error.message || 'Failed to fetch statistics', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [fromDate, toDate])

  // Trigger data fetch only when active filters change
  useEffect(() => {
    loadData()
  }, [loadData])

  const handleApply = () => {
    const newParams = new URLSearchParams(searchParams);
    
    // SEO Rule: Remove default values from the URL
    if (tempFromDate && tempFromDate !== defaultFromDate) {
      newParams.set('dateFrom', tempFromDate);
    } else {
      newParams.delete('dateFrom');
    }

    if (tempToDate && tempToDate !== defaultToDate) {
      newParams.set('dateTo', tempToDate);
    } else {
      newParams.delete('dateTo');
    }

    // Keep parameter ordering consistent (SEO-friendly)
    newParams.sort();
    setSearchParams(newParams);
  }

  return (
    <MainLayout>
      <div className="space-y-2">
        <DashboardHeader
          fromDate={tempFromDate}
          toDate={tempToDate}
          onFromDateChange={(dateStr) => setTempFromDate(dateStr)}
          onToDateChange={(dateStr) => setTempToDate(dateStr)}
          onApply={handleApply}
          hideFilters={false}
          isLoading={isLoading}
        />
        <StatsOverview clinicStats={clinicStats} />
        <ChartsOverview
          genderDistribution={clinicStats?.genderDistribution}
          ageDistribution={clinicStats?.ageDistribution}
          dailyAppointments={clinicStats?.dailyAppointments}
        />
      </div>
    </MainLayout>
  )
}

export default Statistics

