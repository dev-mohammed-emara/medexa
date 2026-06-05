import { getCookie, checkTokenOrRedirect } from '../utils/cookie'

export interface StatCardData {
  value: string
  changePercent: number
  changePeriod: string
}

export interface GenderDistItem {
  gender: 'MALE' | 'FEMALE'
  count: number
  percentage: number
}

export interface AgeDistItem {
  ageGroup: string
  count: number
}

export interface DailyAppointmentItem {
  dayOfWeek: string
  date: string
  appointmentCount: number
}

export interface ClinicStatisticsResponse {
  totalPatients: StatCardData
  appointments: StatCardData
  revenue: StatCardData
  growthRate: StatCardData
  genderDistribution: GenderDistItem[]
  ageDistribution: AgeDistItem[]
  dailyAppointments: DailyAppointmentItem[]
}

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
  checkTokenOrRedirect()
  const token = getCookie('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

export const fetchClinicStatistics = async (fromDate: string, toDate: string): Promise<ClinicStatisticsResponse> => {
  const queryParams = new URLSearchParams()
  queryParams.append('fromDate', fromDate)
  queryParams.append('toDate', toDate)

  const url = `/api/statistics?${queryParams.toString()}`
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders()
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch clinic statistics. Status: ${response.status}`)
  }

  return response.json()
}

export const fetchFinancialTransactions = async (fromDate: string, toDate: string): Promise<FinancialStatisticsResponse> => {
  const queryParams = new URLSearchParams()
  queryParams.append('fromDate', fromDate)
  queryParams.append('toDate', toDate)

  const url = `/api/statistics/transactions?${queryParams.toString()}`
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders()
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch financial transactions. Status: ${response.status}`)
  }

  return response.json()
}
