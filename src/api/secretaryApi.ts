import { getCookie, checkTokenOrRedirect } from '../utils/cookie'
import { getErrorMessage } from '../utils/error'

export interface ApiSecretaryUser {
  uuid?: string
  firstName: string
  surName: string
  lastName: string
  email: string
  phoneNumber: string
  gender: 'MALE' | 'FEMALE'
  dateOfBirth: string
  status?: 'WAITING_VERIFICATION' | 'ACTIVE' | 'INACTIVE'
  role?: string
  permissions: string[]
}

export interface ApiSecretary {
  uuid?: string
  user: ApiSecretaryUser
  clinicUuid?: string
}

export interface FetchSecretariesResponse {
  content: ApiSecretary[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

interface FetchSecretariesParams {
  page?: number
  size?: number
  search?: string
  sort?: string
  status?: string
}

const getHeaders = () => {
  checkTokenOrRedirect()
  const token = getCookie('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

export const fetchSecretaries = async (params: FetchSecretariesParams = {}): Promise<FetchSecretariesResponse> => {
  const queryParams = new URLSearchParams()
  if (params.page !== undefined) queryParams.append('page', String(params.page))
  if (params.size !== undefined) queryParams.append('size', String(params.size))
  if (params.search) queryParams.append('search', params.search)
  if (params.sort) queryParams.append('sort', params.sort)
  if (params.status) queryParams.append('status', params.status)

  const url = `/api/secretary?${queryParams.toString()}`
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders()
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch secretaries list. Status: ${response.status}`)
  }

  return response.json()
}

export const fetchSecretaryByUuid = async (uuid: string): Promise<ApiSecretary> => {
  const response = await fetch(`/api/secretary/${uuid}`, {
    method: 'GET',
    headers: getHeaders()
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch secretary detail. Status: ${response.status}`)
  }

  return response.json()
}

export const createSecretary = async (body: any): Promise<ApiSecretary> => {
  const response = await fetch('/api/secretary', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    let errorMessage = 'Failed to create secretary'
    try {
      const errorData = await response.json()
      errorMessage = getErrorMessage(errorData, errorMessage)
    } catch (e) {
      // ignore
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

export const updateSecretary = async (uuid: string, body: any): Promise<ApiSecretary> => {
  const response = await fetch(`/api/secretary/${uuid}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    let errorMessage = 'Failed to update secretary'
    try {
      const errorData = await response.json()
      errorMessage = getErrorMessage(errorData, errorMessage)
    } catch (e) {
      // ignore
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

export const deleteSecretary = async (uuid: string): Promise<void> => {
  const response = await fetch(`/api/clinic/me/${uuid}?userType=SECRETARY`, {
    method: 'DELETE',
    headers: getHeaders()
  })

  if (!response.ok) {
    throw new Error(`Failed to delete secretary. Status: ${response.status}`)
  }
}

export const fetchSecretaryMe = async (): Promise<ApiSecretary> => {
  const response = await fetch(`/api/secretary/me`, {
    method: 'GET',
    headers: getHeaders()
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch my secretary profile. Status: ${response.status}`)
  }

  return response.json()
}

export const updateSecretaryMe = async (body: any): Promise<ApiSecretary> => {
  const response = await fetch(`/api/secretary/me`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    let errorMessage = 'Failed to update my secretary profile'
    try {
      const errorData = await response.json()
      errorMessage = getErrorMessage(errorData, errorMessage)
    } catch (e) {
      // ignore
    }
    throw new Error(errorMessage)
  }

  return response.json()
}
