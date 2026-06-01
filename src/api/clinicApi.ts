import { getCookie } from '../utils/cookie'

export interface ApiClinic {
  uuid: string
  name: string
  medicalCategory: string
  country: string
  city: string
  address: string
  phoneNumber: string
  email: string
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
}

export interface UpdateClinicBody {
  name: string
  medicalCategory: string
  country: string
  city: string
  address: string
  phoneNumber: string
  email: string
}

export interface ApiInsurance {
  uuid: string
  name: string
  provider: string
}

const getHeaders = () => {
  const token = getCookie('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

export const fetchClinicMe = async (): Promise<ApiClinic> => {
  const response = await fetch('/api/clinic/me', {
    method: 'GET',
    headers: getHeaders()
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch clinic data. Status: ${response.status}`)
  }

  return response.json()
}

export const updateClinicMe = async (body: UpdateClinicBody): Promise<ApiClinic> => {
  const response = await fetch('/api/clinic/me', {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    let errorMessage = 'Failed to update clinic'
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch (e) {
      // ignore
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

export const fetchInsurances = async (): Promise<ApiInsurance[]> => {
  const response = await fetch('/api/insurance', {
    method: 'GET',
    headers: getHeaders()
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch insurances. Status: ${response.status}`)
  }

  return response.json()
}
