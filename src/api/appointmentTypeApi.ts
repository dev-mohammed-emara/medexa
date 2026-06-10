import { getCookie, checkTokenOrRedirect } from '../utils/cookie'
import { getErrorMessage } from '../utils/error'

export interface ApiAppointmentType {
  uuid: string
  name: string
  description: string
  duration: number
  createdAt?: string
  updatedAt?: string
}

export interface AppointmentTypeBody {
  name: string
  description: string
  duration: number
}

export interface UpdateAppointmentTypeBody extends AppointmentTypeBody {
  appointmentTypeUuid: string
}

const getHeaders = () => {
  checkTokenOrRedirect()
  const token = getCookie('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

export const fetchAppointmentTypes = async (): Promise<ApiAppointmentType[]> => {
  const response = await fetch('/api/appointment-type', {
    method: 'GET',
    headers: getHeaders()
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch appointment types. Status: ${response.status}`)
  }

  return response.json()
}

export const createAppointmentType = async (body: AppointmentTypeBody): Promise<ApiAppointmentType> => {
  const response = await fetch('/api/appointment-type', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    let errorMessage = 'Failed to create appointment type'
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

export const updateAppointmentType = async (body: UpdateAppointmentTypeBody): Promise<ApiAppointmentType> => {
  const response = await fetch('/api/appointment-type', {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    let errorMessage = 'Failed to update appointment type'
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

export const getAppointmentType = async (uuid: string): Promise<ApiAppointmentType> => {
  const response = await fetch(`/api/appointment-type/${uuid}`, {
    method: 'GET',
    headers: getHeaders()
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch appointment type. Status: ${response.status}`)
  }

  return response.json()
}

export const deleteAppointmentType = async (uuid: string): Promise<void> => {
  const response = await fetch(`/api/appointment-type/${uuid}`, {
    method: 'DELETE',
    headers: getHeaders()
  })

  if (!response.ok) {
    let errorMessage = 'Failed to delete appointment type'
    try {
      const errorData = await response.json()
      errorMessage = getErrorMessage(errorData, errorMessage)
    } catch (e) {
      // ignore
    }
    throw new Error(errorMessage)
  }
}
