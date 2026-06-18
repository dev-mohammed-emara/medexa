import { apiFetch } from '../utils/apiFetch'
import { getCookie, checkTokenOrRedirect } from '../utils/cookie'
import { getErrorMessage } from '../utils/error'

export interface ApiDoctorUser {
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

export interface ApiDoctor {
  uuid?: string
  user: ApiDoctorUser
  specialty: string
  summary: string
  defaultAppointmentPeriod?: number
  clinicUuid?: string
}

export interface FetchDoctorsResponse {
  content: ApiDoctor[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

interface FetchDoctorsParams {
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

export const fetchDoctors = async (params: FetchDoctorsParams = {}): Promise<FetchDoctorsResponse> => {
  const queryParams = new URLSearchParams()
  if (params.page !== undefined) queryParams.append('page', String(params.page))
  if (params.size !== undefined) queryParams.append('size', String(params.size))
  if (params.search) queryParams.append('search', params.search)
  if (params.sort) queryParams.append('sort', params.sort)
  if (params.status) queryParams.append('status', params.status)

  const url = `/api/doctor?${queryParams.toString()}`
  const response = await apiFetch(url, {
    method: 'GET',
    headers: getHeaders()
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch doctors list. Status: ${response.status}`)
  }

  return response.json()
}

export const fetchDoctorByUuid = async (uuid: string): Promise<ApiDoctor> => {
  const response = await apiFetch(`/api/doctor/${uuid}`, {
    method: 'GET',
    headers: getHeaders()
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch doctor detail. Status: ${response.status}`)
  }

  return response.json()
}

export const createDoctor = async (body: any): Promise<ApiDoctor> => {
  const response = await apiFetch('/api/doctor', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    let errorMessage = 'Failed to create doctor'
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

export const updateDoctor = async (uuid: string, body: any): Promise<ApiDoctor> => {
  const response = await apiFetch(`/api/doctor/${uuid}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    let errorMessage = 'Failed to update doctor'
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

export const deleteDoctor = async (uuid: string): Promise<void> => {
  const response = await apiFetch(`/api/clinic/me/${uuid}?userType=DOCTOR`, {
    method: 'DELETE',
    headers: getHeaders()
  })

  if (!response.ok) {
    throw new Error(`Failed to delete doctor. Status: ${response.status}`)
  }
}

export const fetchDoctorMe = async (): Promise<ApiDoctor> => {
  const response = await apiFetch(`/api/doctor/me`, {
    method: 'GET',
    headers: getHeaders()
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch my doctor profile. Status: ${response.status}`)
  }

  return response.json()
}

export const updateDoctorMe = async (body: any): Promise<ApiDoctor> => {
  const response = await apiFetch(`/api/doctor/me`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    let errorMessage = 'Failed to update my doctor profile'
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

export const updateDoctorAppointmentPeriod = async (period: number): Promise<{message: string}> => {
  const response = await apiFetch(`/api/doctor/me/appointment-period`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ period })
  })

  if (!response.ok) {
    let errorMessage = 'Failed to update appointment period'
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

