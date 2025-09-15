import { useMemo } from 'react'
import { useFieldContext } from '@/contexts/form'
import { Label } from '../label'
import { Textarea } from '@/ui/shared/textarea'

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  placeholder?: string
}

export function TextareaField({ label, placeholder, ...props }: Props) {
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

  return (
    <div>
      {label && (
        <Label className='flex-col gap-0 text-sm'>
          <span className='block w-full mb-2'>{label}</span>{' '}
        </Label>
      )}

      <Textarea
        value={field.state.value ?? ''}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        className='w-full text-sm lg:text-base'
        {...props}
      />
      {error && <span className='text-sm text-destructive mt-2'>{error}</span>}
    </div>
  )
}
