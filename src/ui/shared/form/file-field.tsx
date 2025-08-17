import { useMemo } from 'react'
import { Label } from '../label'
import { useFieldContext } from '@/contexts/form-context'
import { ResetField } from './reset-field'
import { FilePlus2 } from 'lucide-react'
import { cn } from '@/utils'

interface Props extends React.ComponentProps<'input'> {
  label: string
  placeholder?: string
}

export function FileField({ label, placeholder, ...props }: Props) {
  const field = useFieldContext<File | null>()

  const { errors } = field.state.meta

  const error = useMemo(() => {
    const objErr = errors?.length > 0 ? errors?.[0] : null
    if (typeof objErr === 'string') {
      return objErr
    }
    if (typeof objErr === 'object' && Object.hasOwn(objErr ?? {}, 'message')) {
      return objErr.message
    }

    return null
  }, [errors])

  const handleReset = () => {
    field.handleChange(null)
  }

  return (
    <Label className=' flex-col gap-0 text-sm' aria-invalid={!!error}>
      <span className='block w-full mb-2'>{label}</span>
      <input
        type='file'
        onChange={(e) => field.handleChange(e.target.files?.[0] || null)}
        className='hidden'
        {...props}
      />

      <div
        aria-invalid={!!error}
        className={cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          'px-4 py-3 h-full relative',
          !field.state.value?.name ? 'text-muted-foreground' : 'text-primary',
          'w-full flex justify-between'
        )}>
        <p className='block truncate '>
          {field.state.value?.name || placeholder}
        </p>

        {field.state.value ? (
          <ResetField className='top-3 right-2' onReset={handleReset} />
        ) : (
          <span className='absolute opacity-35 cursor-pointer hover:bg-transparent top-3 right-3'>
            <FilePlus2 className='size-5' />
          </span>
        )}
      </div>

      {error ? (
        <span className='w-full text-sm text-destructive mt-2'>{error}</span>
      ) : null}
    </Label>
  )
}
