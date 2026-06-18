import { apiFetch } from '../utils/apiFetch'
import { getCookie, checkTokenOrRedirect } from '../utils/cookie'
import { getErrorMessage } from '../utils/error'

export interface ApiPatient {
  uuid?: string
  firstName: string
  surName: string
  lastName: string
  phoneNumber: string
  gender: 'MALE' | 'FEMALE'
  dateOfBirth: string
  address: string
  note?: string
  lastVisitDate?: string
  createdAt?: string
  updatedAt?: string
}

export interface FetchPatientsResponse {
  content: ApiPatient[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

interface FetchPatientsParams {
  page?: number
  size?: number
  search?: string
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

export const fetchPatients = async (params: FetchPatientsParams = {}): Promise<FetchPatientsResponse> => {
  const queryParams = new URLSearchParams()
  if (params.page !== undefined) queryParams.append('page', String(params.page))
  if (params.size !== undefined) queryParams.append('size', String(params.size))
  if (params.search) queryParams.append('search', params.search)
  if (params.sort) queryParams.append('sort', params.sort)

  const url = `/api/patient?${queryParams.toString()}`
  const response = await apiFetch(url, {
    method: 'GET',
    headers: getHeaders()
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch patients list. Status: ${response.status}`)
  }

  return response.json()
}

export const fetchPatientByUuid = async (uuid: string): Promise<ApiPatient> => {
  const response = await apiFetch(`/api/patient/${uuid}`, {
    method: 'GET',
    headers: getHeaders()
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch patient detail. Status: ${response.status}`)
  }

  return response.json()
}

export const createPatient = async (body: any): Promise<ApiPatient> => {
  const response = await apiFetch('/api/patient', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    let errorMessage = 'Failed to create patient'
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

export const updatePatient = async (uuid: string, body: any): Promise<ApiPatient> => {
  const response = await apiFetch(`/api/patient/${uuid}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    let errorMessage = 'Failed to update patient'
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

export const deletePatient = async (uuid: string): Promise<void> => {
  const response = await apiFetch(`/api/patient/${uuid}`, {
    method: 'DELETE',
    headers: getHeaders()
  })

  if (!response.ok) {
    throw new Error(`Failed to delete patient. Status: ${response.status}`)
  }
}
