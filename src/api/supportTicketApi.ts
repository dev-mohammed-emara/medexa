import { getCookie, checkTokenOrRedirect } from '../utils/cookie'

export interface ApiSupportTicket {
  uuid?: string
  ticketNumber: string
  section: string
  description: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assignedTo?: string
  notes?: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string | null
}

export interface FetchSupportTicketsResponse {
  content: ApiSupportTicket[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

interface FetchSupportTicketsParams {
  page?: number
  size?: number
  status?: string
  priority?: string
  fromDate?: string
  toDate?: string
  sort?: string
}

const getHeaders = () => {
  checkTokenOrRedirect()
  const token = getCookie('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

export const fetchSupportTickets = async (params: FetchSupportTicketsParams = {}): Promise<FetchSupportTicketsResponse> => {
  const queryParams = new URLSearchParams()
  if (params.page !== undefined) queryParams.append('page', String(params.page))
  if (params.size !== undefined) queryParams.append('size', String(params.size))
  if (params.status && params.status !== '--' && params.status !== '') queryParams.append('status', params.status)
  if (params.priority && params.priority !== '--' && params.priority !== '') queryParams.append('priority', params.priority)
  if (params.fromDate) queryParams.append('fromDate', params.fromDate)
  if (params.toDate) queryParams.append('toDate', params.toDate)
  if (params.sort && params.sort !== '--') queryParams.append('sort', params.sort)

  const url = `/api/support-ticket?${queryParams.toString()}`
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders()
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch support tickets. Status: ${response.status}`)
  }

  return response.json()
}
