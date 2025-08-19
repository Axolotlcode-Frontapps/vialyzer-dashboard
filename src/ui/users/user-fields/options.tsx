import { settingsSchemas } from '@/lib/schemas/settings'
import { formOptions } from '@tanstack/react-form'

export const userFieldsOpts = formOptions({
  defaultValues: {},
  validators: {
    onMount: ({ formApi }) => {
      formApi.state.canSubmit = false
      return settingsSchemas.user
    },
    onChange: settingsSchemas.user,
    onSubmitAsync: async ({ formApi }) => {
      formApi.state.isSubmitting = true
    },
  },
})
