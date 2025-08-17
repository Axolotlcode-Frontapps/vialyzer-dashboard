import { LoaderCircle } from 'lucide-react'
import { Button, buttonVariants } from '../button'
import { useFormContext } from '@/contexts/form-context'
import type { ComponentProps } from 'react'
import type { VariantProps } from 'class-variance-authority'

type BaseButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

interface SubmitButtonProps extends BaseButtonProps {
  label: string
  labelLoading?: string
}

export function SubmitButton({
  label,
  labelLoading,
  size = 'default',
  ...props
}: SubmitButtonProps) {
  const form = useFormContext()

  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
      {([canSubmit, isSubmitting]) => {
        return (
          <Button type='submit' {...props} size={size} disabled={!canSubmit}>
            {isSubmitting ? (
              <LoaderCircle className='size-4 animate-spin' />
            ) : null}
            {isSubmitting ? labelLoading : label}
          </Button>
        )
      }}
    </form.Subscribe>
  )
}
