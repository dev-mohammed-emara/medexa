import { getCookie } from '../utils/cookie'

export interface FinancialChartItem {
  label: string
  income: number
  expenses: number
}

export interface FinancialStatisticsResponse {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  groupBy: string
  chartData: FinancialChartItem[]
}

const getHeaders = () => {
  const token = getCookie('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

export const fetchFinancialStatistics = async (fromDate: string, toDate: string): Promise<FinancialStatisticsResponse> => {
  const queryParams = new URLSearchParams()
  queryParams.append('fromDate', fromDate)
  queryParams.append('toDate', toDate)

  const url = `/api/statistics/financial?${queryParams.toString()}`
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders()
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch financial statistics. Status: ${response.status}`)
  }

  return response.json()
}
