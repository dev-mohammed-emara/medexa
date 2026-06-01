import { useState, useEffect, useCallback } from 'react'
import MainLayout from '../components/layout/MainLayout'
import ChartsOverview from '../sections/Dashboard/ChartsOverview'
import DashboardHeader from '../sections/Dashboard/DashboardHeader'
import StatsOverview from '../sections/Dashboard/StatsOverview'
import { fetchFinancialStatistics } from '../api/statisticsApi'
import type { FinancialStatisticsResponse } from '../api/statisticsApi'

const Dashboard = () => {
  const [fromDate, setFromDate] = useState<string>("2025-01-01")
  const [toDate, setToDate] = useState<string>("2025-06-30")
  const [financialData, setFinancialData] = useState<FinancialStatisticsResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const loadFinancialStats = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchFinancialStatistics(fromDate, toDate)
      setFinancialData(data)
      
      // Store the response itself in a variable and toast it on success
      const varMsg = JSON.stringify(data)
      window.showToast?.(varMsg, 'success')
    } catch (error: any) {
      console.error(error)
      window.showToast?.(error.message || 'Failed to fetch financial statistics', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [fromDate, toDate])

  // Initial load
  useEffect(() => {
    loadFinancialStats()
  }, [])

  const handleApply = () => {
    loadFinancialStats()
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
          isLoading={isLoading}
        />
        <StatsOverview financialData={financialData} />
        <ChartsOverview financialChartData={financialData?.chartData || null} />
      </div>
    </MainLayout>
  )
}

export default Dashboard
