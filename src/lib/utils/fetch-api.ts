import type { AxiosRequestConfig } from 'axios'
import axios from '@/lib/utils/axios'

export const fetcher = async <T>(
  url: string,
  options?: AxiosRequestConfig
): Promise<T> => {
  const response = await axios({
    url,
    ...options,
  })

  if (response.status !== 200) {
    const errorData = response.data as ErrorResponse

    throw new Error(
      errorData.detail?.message || 'An error occurred while fetching data.'
    )
  }

  return response.data
}
