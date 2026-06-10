import { useState, useEffect, useCallback } from 'react'
import MainLayout from '../components/layout/MainLayout'
import ChartsOverview from '../sections/Dashboard/ChartsOverview'
import DashboardHeader from '../sections/Dashboard/DashboardHeader'
import StatsOverview from '../sections/Dashboard/StatsOverview'
import { fetchClinicStatistics } from '../api/statisticsApi'
import type { ClinicStatisticsResponse } from '../api/statisticsApi'

const Dashboard = () => {
  const getLocalDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const [fromDate, setFromDate] = useState<string>(getLocalDateString(yesterday))
  const [toDate, setToDate] = useState<string>(getLocalDateString(today))
  const [clinicStats, setClinicStats] = useState<ClinicStatisticsResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

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

  // Initial load
  useEffect(() => {
    loadData()
  }, [])

  const handleApply = () => {
    loadData()
  }

  return (
    <MainLayout>
      <div className="space-y-2">
        <DashboardHeader
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={(dateStr) => setFromDate(dateStr)}
          onToDateChange={(dateStr) => setToDate(dateStr)}
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

export default Dashboard
