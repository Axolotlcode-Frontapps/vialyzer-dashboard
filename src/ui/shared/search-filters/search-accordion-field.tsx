import { useFieldContext } from '@/contexts/form-context'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../accordion'
import { Input } from '../input'
import { Label } from '../label'
import { cn } from '@/utils'

export function SearchAccordionField({
  label,
  options,
  mode = 'single',
}: {
  label?: string
  options?: { label: string; value: string }[]
  mode?: 'multiple' | 'single'
}) {
  const field = useFieldContext<string>()

  return (
    <Accordion type='single' collapsible>
      <AccordionItem value='item-1'>
        <AccordionTrigger>{label}</AccordionTrigger>
        <AccordionContent>
          {options?.map((option) => (
            <div key={option.value}>
              <Label
                className={cn(
                  'w-full inline-block cursor-pointer px-4 py-3',
                  field.state.value === option.value &&
                    'bg-secondary text-secondary-foreground'
                )}>
                <Input
                  className='hidden'
                  type={mode === 'multiple' ? 'checkbox' : 'radio'}
                  value={option.value}
                  checked={field.state.value === option.value}
                  onChange={() => field.handleChange(option.value)}
                />
                {option.label}
              </Label>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
