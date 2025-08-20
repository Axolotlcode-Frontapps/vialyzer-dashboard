import { useAppForm } from '@/contexts/form-create'
import { Button } from '@/ui/shared/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/ui/shared/sheet'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { settingsService } from '@/lib/services/settings'
import { CirclePlus } from 'lucide-react'
import { companyFieldsOpts } from './company-fields/options'
import { CompanyFields } from './company-fields'
import type { CompanyValues } from '@/lib/schemas/settings'

export function CompanyAdd() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const companyAddMutation = useMutation({
    mutationFn: async (values: CompanyValues) => {
      return await settingsService.createCompany(values)
    },
    onSuccess: ({ payload }) => {
      form.reset()
      toast.success(`Empresa creado correctamente`, {
        description: `Se ha creado la empresa "${payload?.name}" correctamente.`,
      })
    },
    onError: (error) => {
      form.state.canSubmit = true
      toast.error(`Error al crear la empresa`, {
        description:
          error instanceof Error
            ? error.message
            : 'Por favor, inténtalo de nuevo.',
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      form.state.isSubmitting = false
      setOpen(false)
    },
  })

  const form = useAppForm({
    ...companyFieldsOpts,
    onSubmit: ({ value }) => companyAddMutation.mutate(value),
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <CirclePlus />
          <span className='hidden sm:inline'>Crear empresa</span>
        </Button>
      </SheetTrigger>
      <SheetContent className='w-full sm:min-w-[600px]'>
        <SheetHeader>
          <SheetTitle>Crear empresa</SheetTitle>
          <SheetDescription>
            Vas a crear una nueva empresa. Completa la información necesaria y
            guarda para agregar la empresa.
          </SheetDescription>
        </SheetHeader>
        <form
          id='company-add-form'
          className='px-4 space-y-2'
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}>
          <CompanyFields form={form} />
        </form>
        <SheetFooter>
          <form.AppForm>
            <form.SubmitButton
              form='company-add-form'
              label='Crear empresa'
              labelLoading='Creando empresa...'
            />
          </form.AppForm>
          <SheetClose asChild>
            <Button variant='destructive'>Cancelar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
