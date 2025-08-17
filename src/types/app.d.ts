type TFilterVariant = 'dropdown' | 'range'

interface GeneralResponse<T> {
  success?: boolean
  message?: string
  errors?: string[]
  details?: string
  payload?: T
}

interface ErrorResponse {
  detail?: {
    success: boolean
    message: string
    errors: string[]
  }
}

interface Filters {
  label: string
  name: string
  type: TFilterVariant
  mode?: 'single' | 'multiple'
  options: { label: string; value: string }[]
}
