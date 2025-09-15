import { useMemo } from 'react'
import { useFieldContext } from '@/contexts/form'
import { Label } from '../label'
import { Calendar } from '@/ui/shared/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/shared/popover'
import { format } from 'date-fns'
import { Button } from '@/ui/shared/button'
import { CalendarIcon } from 'lucide-react'

interface Props {
  label: string
  placeholder?: string
}

export function DatePickerField({ label, placeholder }: Props) {
  const field = useFieldContext<string>()
  const { errors } = field.state.meta

  const error = useMemo(() => {
    const objErr = errors?.[0]
    return typeof objErr === 'string'
      ? objErr
      : typeof objErr === 'object' && 'message' in objErr
        ? objErr.message
        : null
  }, [errors])

  const selectedDate = field.state.value
    ? new Date(field.state.value)
    : undefined

  return (
    <>
      <Label className='flex-col gap-0 text-sm'>
        <span className='block w-full mb-2'>{label}</span>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className={`w-full justify-start text-left font-normal ${
                !selectedDate ? 'text-muted-foreground' : ''
              }`}
              aria-invalid={!!error}>
              <CalendarIcon className='mr-2 h-4 w-4' />
              {selectedDate
                ? format(selectedDate, 'yyyy-MM-dd')
                : placeholder || 'Selecciona una fecha'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <Calendar
              mode='single'
              selected={selectedDate}
              onSelect={(date) => {
                if (date) field.handleChange(date.toISOString().split('T')[0])
              }}
            />
          </PopoverContent>
        </Popover>
      </Label>

      {error && <span className='text-sm text-destructive mt-2'>{error}</span>}
    </>
  )
}
