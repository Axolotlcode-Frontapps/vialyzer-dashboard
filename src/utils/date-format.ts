import { format } from '@formkit/tempo'

export const formatDate = (date: string) => {
  return format({
    date: date,
    format: 'YYYY-MM-DD HH:mm',
    tz: 'America/Bogota',
  })
}
